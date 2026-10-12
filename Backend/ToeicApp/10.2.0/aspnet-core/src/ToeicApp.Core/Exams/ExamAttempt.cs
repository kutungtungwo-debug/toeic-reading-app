using System;
using System.Collections.Generic;
using Abp.Domain.Entities;
using ToeicApp.Authorization.Users;

namespace ToeicApp.Exams
{
    public class ExamAttempt : Entity<int>
    {
        public long UserId { get; set; }
        public User User { get; set; }

        public int ExamId { get; set; }
        public Exam Exam { get; set; }

        public DateTime StartTime { get; set; } = DateTime.Now;
        public DateTime? SubmitTime { get; set; }

        public int CorrectCount { get; set; }
        public int WrongCount { get; set; }
        public int SkippedCount { get; set; }
        public AttemptStatus Status { get; set; }

        public List<AttemptAnswer> Answers { get; set; } = new();
    }
}