using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities;

namespace ToeicApp.Exams
{
    public class Question : Entity<int>
    {
        public int ExamId { get; set; }
        public Exam Exam { get; set; }

        public int PartId { get; set; }
        public Part Part { get; set; }

        public int? GroupId { get; set; }     // null = Part 5
        public QuestionGroup Group { get; set; }

        public int QuestionNo { get; set; }
        public string Content { get; set; }   // Part 6 có thể để trống

        [Required, StringLength(1)]
        public string CorrectAnswer { get; set; }   // A, B, C hoặc D

        public List<QuestionOption> Options { get; set; } = new();
    }
}