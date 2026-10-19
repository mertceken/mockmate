using Microsoft.EntityFrameworkCore;
using MockMate.Application.Abstractions;
using MockMate.Application.Ai;
using MockMate.Application.Contracts;
using MockMate.Application.Exceptions;
using MockMate.Domain.Entities;
using MockMate.Domain.Enums;

namespace MockMate.Application.Services;

public class InterviewService(IAppDbContext db, IAiService ai) : IInterviewService
{
    public async Task<SessionDto> CreateSessionAsync(CreateSessionRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Position))
            throw new BadRequestException("Position is required.");
        if (string.IsNullOrWhiteSpace(request.TechStack))
            throw new BadRequestException("Tech stack is required.");
        if (request.QuestionCount is < 1 or > 10)
            throw new BadRequestException("Question count must be between 1 and 10.");

        if (request.Position.Trim().Length > 200)
            throw new BadRequestException("Position must be at most 200 characters.");
        if (request.TechStack.Trim().Length > 500)
            throw new BadRequestException("Tech stack must be at most 500 characters.");
        if (!Enum.IsDefined(request.Level))
            throw new BadRequestException("Invalid experience level.");

        var session = new InterviewSession
        {
            Position = request.Position.Trim(),
            TechStack = request.TechStack.Trim(),
            Level = request.Level,
            QuestionCount = request.QuestionCount
        };

        var generated = await ai.GenerateJsonAsync<GeneratedQuestionsResult>(
            Prompts.QuestionsSystem,
            Prompts.QuestionsUser(session.Position, session.TechStack, session.Level.ToString(), session.QuestionCount),
            AiSchemas.Questions,
            ct);

        var questions = new List<Question>();

        for (var attempt = 0; attempt < 3 && questions.Count < request.QuestionCount; attempt++)
        {
            var missing = request.QuestionCount - questions.Count;

            foreach (var q in generated.Questions)
            {
                if (questions.Count >= request.QuestionCount) break;

                var text = q.Text?.Trim();
                if (!IsUsableQuestion(text)) continue;
                if (questions.Any(x => x.Text.Equals(text, StringComparison.OrdinalIgnoreCase))) continue;

                questions.Add(new Question
                {
                    SessionId = session.Id,
                    Order = questions.Count + 1,
                    Text = text!,
                    Topic = NormalizeTopic(q.Topic, q.Category),
                    Category = session.Level == ExperienceLevel.Junior && q.Category == QuestionCategory.SystemDesign
                        ? QuestionCategory.Technical
                        : q.Category,
                    Difficulty = q.Difficulty
                });
            }
        }

        if (questions.Count == 0)
            throw new InvalidOperationException("AI did not return any usable questions.");

        session.Questions = questions;
        session.QuestionCount = questions.Count;

        db.Sessions.Add(session);
        await db.SaveChangesAsync(ct);

        return ToDto(session);
    }

    public async Task<SessionDto> GetSessionAsync(Guid sessionId, CancellationToken ct = default)
    {
        var session = await LoadSessionAsync(sessionId, ct);
        return ToDto(session);
    }

    public async Task<AnswerDto> SubmitAnswerAsync(
        Guid sessionId, Guid questionId, SubmitAnswerRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
            throw new BadRequestException("Answer text is required.");

        if (request.Text.Trim().Length > 10000)
            throw new BadRequestException("Answer must be at most 10000 characters.");

        var session = await LoadSessionAsync(sessionId, ct);

        if (session.Status == SessionStatus.Completed)
            throw new BadRequestException("Session is already completed.");

        var question = session.Questions.FirstOrDefault(q => q.Id == questionId)
            ?? throw new NotFoundException("Question not found in this session.");

        if (question.Answer is not null)
            throw new BadRequestException("This question has already been answered.");

        var text = request.Text.Trim();

        var evaluation = await ai.GenerateJsonAsync<AnswerEvaluation>(
            Prompts.EvaluationSystem,
            Prompts.EvaluationUser(session, question, text),
            AiSchemas.Evaluation,
            ct);

        var answer = new Answer
        {
            QuestionId = question.Id,
            Text = text,
            Score = Math.Clamp(evaluation.Score, 0, 10),   // modele güvenme, sınırla
            Feedback = evaluation.Feedback,
            Strengths = evaluation.Strengths ?? [],
            Improvements = evaluation.Improvements ?? [],
            IdealAnswerHint = evaluation.IdealAnswerHint ?? string.Empty
        };

        db.Answers.Add(answer);
        await db.SaveChangesAsync(ct);

        return ToDto(answer);
    }

    public async Task<SessionDto> CompleteSessionAsync(Guid sessionId, CancellationToken ct = default)
    {
        var session = await LoadSessionAsync(sessionId, ct);

        if (session.Status == SessionStatus.Completed)
            return ToDto(session); // idempotent

        var answered = session.Questions.Where(q => q.Answer is not null).ToList();
        if (answered.Count == 0)
            throw new BadRequestException("Answer at least one question before completing the session.");

        var byTopic = answered
            .GroupBy(q => q.Topic)
            .Select(g => (Topic: g.Key, Avg: g.Average(q => q.Answer!.Score)))
            .ToList();

        var strongTopics = byTopic.Where(t => t.Avg >= 7).Select(t => t.Topic).ToList();
        var developingTopics = byTopic.Where(t => t.Avg >= 5 && t.Avg < 7).Select(t => t.Topic).ToList();
        var weakTopics = byTopic.Where(t => t.Avg < 5).Select(t => t.Topic).ToList();

        var result = await ai.GenerateJsonAsync<SessionReportResult>(
            Prompts.ReportSystem,
            Prompts.ReportUser(session, strongTopics, developingTopics, weakTopics),
            AiSchemas.Report,
            ct);

        var report = new SessionReport
        {
            SessionId = session.Id,
            Summary = result.Summary,
            StrongAreas = strongTopics,
            WeakAreas = weakTopics,
            Recommendations = result.Recommendations ?? []
        };

        db.Reports.Add(report);
        session.Report = report;
        session.Status = SessionStatus.Completed;
        session.CompletedAt = DateTime.UtcNow;
        session.OverallScore = Math.Round((decimal)answered.Average(q => q.Answer!.Score), 2);

        await db.SaveChangesAsync(ct);

        return ToDto(session);
    }

    private async Task<InterviewSession> LoadSessionAsync(Guid id, CancellationToken ct) =>
        await db.Sessions
            .Include(s => s.Questions).ThenInclude(q => q.Answer)
            .Include(s => s.Report)
            .FirstOrDefaultAsync(s => s.Id == id, ct)
        ?? throw new NotFoundException("Session not found.");

    private static AnswerDto ToDto(Answer a) =>
        new(a.Id, a.Text, a.Score, a.Feedback, a.Strengths, a.Improvements, a.IdealAnswerHint);

    private static bool IsUsableQuestion(string? text) =>
    text is { Length: >= 15 and <= 2000 } && (text.EndsWith('?') || text.EndsWith('.'));

    private static string NormalizeTopic(string? topic, QuestionCategory category)
    {
        var t = topic?.Trim();
        if (string.IsNullOrEmpty(t)) return category.ToString();
        return t.Length <= 100 ? t : t[..100];
    }

    private static SessionDto ToDto(InterviewSession s) => new(
        s.Id, s.Position, s.TechStack, s.Level, s.Status, s.StartedAt, s.CompletedAt, s.OverallScore,
        s.Questions.OrderBy(q => q.Order)
            .Select(q => new QuestionDto(
                q.Id, q.Order, q.Text, q.Topic, q.Category, q.Difficulty,
                q.Answer is null ? null : ToDto(q.Answer)))
            .ToList(),
        s.Report is null
            ? null
            : new ReportDto(s.Report.Summary, s.Report.StrongAreas, s.Report.WeakAreas, s.Report.Recommendations));
}