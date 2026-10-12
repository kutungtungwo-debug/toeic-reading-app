using Abp.Zero.EntityFrameworkCore;
using ToeicApp.Authorization.Roles;
using ToeicApp.Authorization.Users;
using ToeicApp.MultiTenancy;
using Microsoft.EntityFrameworkCore;
using ToeicApp.Exams;

namespace ToeicApp.EntityFrameworkCore;

public class ToeicAppDbContext : AbpZeroDbContext<Tenant, Role, User, ToeicAppDbContext>
{
    /* Define a DbSet for each entity of the application */
    public DbSet<Exam> Exams { get; set; }
    public DbSet<Part> Parts { get; set; }
    public DbSet<QuestionGroup> QuestionGroups { get; set; }
    public DbSet<Passage> Passages { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<QuestionOption> QuestionOptions { get; set; }
    public DbSet<ExamAttempt> ExamAttempts { get; set; }
    public DbSet<AttemptAnswer> AttemptAnswers { get; set; }

    public ToeicAppDbContext(DbContextOptions<ToeicAppDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Part>()
            .HasIndex(p => new { p.ExamId, p.PartNumber }).IsUnique();

        modelBuilder.Entity<Question>()
            .HasIndex(q => new { q.ExamId, q.QuestionNo }).IsUnique();

        modelBuilder.Entity<QuestionOption>()
            .HasIndex(o => new { o.QuestionId, o.Label }).IsUnique();

        // SQL Server không cho nhiều đường xóa dây chuyền, nên các khóa này đặt Restrict
        modelBuilder.Entity<Question>()
            .HasOne(q => q.Exam).WithMany().HasForeignKey(q => q.ExamId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Question>()
            .HasOne(q => q.Group).WithMany(g => g.Questions).HasForeignKey(q => q.GroupId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ExamAttempt>()
            .HasOne(a => a.Exam).WithMany().HasForeignKey(a => a.ExamId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ExamAttempt>()
            .HasOne(a => a.User).WithMany().HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AttemptAnswer>()
            .HasOne(a => a.Question).WithMany().HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}