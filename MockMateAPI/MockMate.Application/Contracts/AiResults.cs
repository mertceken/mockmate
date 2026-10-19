using MockMate.Domain.Enums;

namespace MockMate.Application.Contracts;

public record GeneratedQuestion(string Text, string Topic, QuestionCategory Category, Difficulty Difficulty);

public record GeneratedQuestionsResult(List<GeneratedQuestion> Questions);

public record AnswerEvaluation(
    int Score,
    string Feedback,
    List<string> Strengths,
    List<string> Improvements,
    string IdealAnswerHint);

public record SessionReportResult(string Summary, List<string> Recommendations);