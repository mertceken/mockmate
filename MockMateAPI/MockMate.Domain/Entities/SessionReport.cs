namespace MockMate.Domain.Entities;

public class SessionReport
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SessionId { get; set; }
    public string Summary { get; set; } = default!;
    public List<string> StrongAreas { get; set; } = [];
    public List<string> WeakAreas { get; set; } = [];
    public List<string> Recommendations { get; set; } = [];

    public InterviewSession Session { get; set; } = default!;
}