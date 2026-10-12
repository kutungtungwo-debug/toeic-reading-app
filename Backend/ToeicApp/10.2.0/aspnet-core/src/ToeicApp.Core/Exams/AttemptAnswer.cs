using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities;

namespace ToeicApp.Exams
{
    public class AttemptAnswer : Entity<int>
    {
        public int AttemptId { get; set; }
        public ExamAttempt Attempt { get; set; }

        public int QuestionId { get; set; }
        public Question Question { get; set; }

        [StringLength(1)]
        public string SelectedAnswer { get; set; }   // null = bỏ qua

        public bool IsCorrect { get; set; }
    }
}