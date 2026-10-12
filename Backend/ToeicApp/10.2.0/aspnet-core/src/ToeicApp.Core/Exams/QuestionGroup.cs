using System.Collections.Generic;
using Abp.Domain.Entities;

namespace ToeicApp.Exams
{
    public class QuestionGroup : Entity<int>
    {
        public int PartId { get; set; }
        public Part Part { get; set; }

        public int StartNo { get; set; }
        public int EndNo { get; set; }
        public int OrderIndex { get; set; }

        public List<Passage> Passages { get; set; } = new();
        public List<Question> Questions { get; set; } = new();
    }
}