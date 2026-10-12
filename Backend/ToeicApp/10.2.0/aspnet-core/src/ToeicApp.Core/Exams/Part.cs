using System.Collections.Generic;
using Abp.Domain.Entities;

namespace ToeicApp.Exams
{
    public class Part : Entity<int>
    {
        public int ExamId { get; set; }
        public Exam Exam { get; set; }

        public int PartNumber { get; set; }   // 5, 6, 7
        public string Directions { get; set; }
        public int StartNo { get; set; }
        public int EndNo { get; set; }

        public List<QuestionGroup> Groups { get; set; } = new();
        public List<Question> Questions { get; set; } = new();
    }
}