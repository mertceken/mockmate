using Microsoft.EntityFrameworkCore;
using MockMate.Domain.Entities;

namespace MockMate.Application.Abstractions;

public interface IAppDbContext
{
    DbSet<InterviewSession> Sessions { get; }
    DbSet<Question> Questions { get; }
    DbSet<Answer> Answers { get; }
    DbSet<SessionReport> Reports { get; }

    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
