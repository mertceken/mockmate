using MockMate.Domain.Enums;

namespace MockMate.Domain.Entities;

public class Question
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SessionId { get; set; }
    public int Order { get; set; }
    public string Text { get; set; } = default!;
    public string Topic { get; set; } = string.Empty;
    public QuestionCategory Category { get; set; }
    public Difficulty Difficulty { get; set; }

    public InterviewSession Session { get; set; } = default!;
    public Answer? Answer { get; set; }
}