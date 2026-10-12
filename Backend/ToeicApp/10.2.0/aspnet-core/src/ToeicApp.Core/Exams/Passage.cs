using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities;

namespace ToeicApp.Exams
{
    public class Passage : Entity<int>
    {
        public int GroupId { get; set; }
        public QuestionGroup Group { get; set; }

        public int OrderIndex { get; set; }
        public string Content { get; set; }

        [StringLength(500)]
        public string ImageUrl { get; set; }
    }
}