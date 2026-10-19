using MockMate.Domain.Enums;

namespace MockMate.Application.Contracts;

public record CreateSessionRequest(string Position, string TechStack, ExperienceLevel Level, int QuestionCount);

public record SubmitAnswerRequest(string Text);

public record AnswerDto(
    Guid Id, string Text, int Score, string Feedback,
    List<string> Strengths, List<string> Improvements, string IdealAnswerHint);

public record QuestionDto(
    Guid Id, int Order, string Text, string Topic, QuestionCategory Category, Difficulty Difficulty, AnswerDto? Answer);

public record ReportDto(
    string Summary, List<string> StrongAreas, List<string> WeakAreas, List<string> Recommendations);

public record SessionDto(
    Guid Id, string Position, string TechStack, ExperienceLevel Level, SessionStatus Status,
    DateTime StartedAt, DateTime? CompletedAt, decimal? OverallScore,
    List<QuestionDto> Questions, ReportDto? Report);