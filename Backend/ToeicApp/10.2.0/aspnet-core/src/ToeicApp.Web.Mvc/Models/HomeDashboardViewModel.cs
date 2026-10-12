using System.Collections.Generic;
using ToeicApp.Exams.Dto;

namespace ToeicApp.Web.Models;

public class HomeDashboardViewModel
{
    public int TotalExams { get; set; }
    public int PublishedExams { get; set; }
    public int DraftExams { get; set; }
    public int TotalAttempts { get; set; }
    public int RecentAttempts { get; set; }
    public List<ExamListItemDto> RecentExams { get; set; } = new();
    public ExamListItemDto LatestDraft { get; set; }
}
