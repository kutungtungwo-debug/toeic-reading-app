using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;

namespace ToeicApp.Exams
{
    public class Exam : Entity<int>, IHasCreationTime
    {
        [Required, StringLength(200)]
        public string Title { get; set; }

        public int DurationMinutes { get; set; } = 75;
        public int TotalQuestions { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreationTime { get; set; } = DateTime.Now;

        public List<Part> Parts { get; set; } = new();
    }
}