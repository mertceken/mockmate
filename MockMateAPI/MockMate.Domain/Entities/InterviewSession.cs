using MockMate.Domain.Enums;

namespace MockMate.Domain.Entities;

public class InterviewSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Position { get; set; } = default!;
    public string TechStack { get; set; } = default!;   // "C#, ASP.NET Core, React"
    public ExperienceLevel Level { get; set; }
    public int QuestionCount { get; set; }
    public SessionStatus Status { get; set; } = SessionStatus.InProgress;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public decimal? OverallScore { get; set; }

    public List<Question> Questions { get; set; } = [];
    public SessionReport? Report { get; set; }
}