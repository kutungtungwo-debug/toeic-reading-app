using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities;

namespace ToeicApp.Exams
{
    public class QuestionOption : Entity<int>
    {
        public int QuestionId { get; set; }
        public Question Question { get; set; }

        [Required, StringLength(1)]
        public string Label { get; set; }     // A-D

        [Required]
        public string Content { get; set; }
    }
}