namespace MockMate.Domain.Entities;

public class Answer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid QuestionId { get; set; }
    public string Text { get; set; } = default!;
    public int Score { get; set; }                       // 0-10
    public string Feedback { get; set; } = default!;

    public string IdealAnswerHint { get; set; } = string.Empty;
    public List<string> Strengths { get; set; } = [];
    public List<string> Improvements { get; set; } = [];
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public Question Question { get; set; } = default!;
}