using Microsoft.EntityFrameworkCore;
using MockMate.Application.Abstractions;
using MockMate.Domain.Entities;

namespace MockMate.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options), IAppDbContext
{
    public DbSet<InterviewSession> Sessions => Set<InterviewSession>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<SessionReport> Reports => Set<SessionReport>();

    protected override void ConfigureConventions(ModelConfigurationBuilder builder)
    {
        builder.Properties<DateTime>().HaveConversion<UtcDateTimeConverter>();
        builder.Properties<DateTime?>().HaveConversion<NullableUtcDateTimeConverter>();
    }

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<InterviewSession>(e =>
        {
            e.Property(x => x.Position).HasMaxLength(200).IsRequired();
            e.Property(x => x.TechStack).HasMaxLength(500).IsRequired();
            e.Property(x => x.Level).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.OverallScore).HasPrecision(4, 2);

            e.HasMany(x => x.Questions)
             .WithOne(q => q.Session)
             .HasForeignKey(q => q.SessionId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Report)
             .WithOne(r => r.Session)
             .HasForeignKey<SessionReport>(r => r.SessionId);
        });

        b.Entity<Question>(e =>
        {
            e.Property(x => x.Text).HasMaxLength(2000).IsRequired();
            e.Property(x => x.Category).HasConversion<string>().HasMaxLength(30);
            e.Property(x => x.Difficulty).HasConversion<string>().HasMaxLength(20);
            e.HasIndex(x => new { x.SessionId, x.Order }).IsUnique();
            e.Property(x => x.Topic).HasMaxLength(100);

            e.HasOne(x => x.Answer)
             .WithOne(a => a.Question)
             .HasForeignKey<Answer>(a => a.QuestionId);
        });

        b.Entity<Answer>(e =>
        {
            e.Property(x => x.Text).HasMaxLength(10000).IsRequired();
            e.Property(x => x.Feedback).IsRequired();
        });

        b.Entity<SessionReport>(e =>
        {
            e.Property(x => x.Summary).IsRequired();
        });
    }
}