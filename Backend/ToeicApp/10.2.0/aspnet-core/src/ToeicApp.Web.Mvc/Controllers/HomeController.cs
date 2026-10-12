using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.AspNetCore.Mvc.Authorization;
using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToeicApp.Authorization;
using ToeicApp.Controllers;
using ToeicApp.Exams;
using ToeicApp.Exams.Dto;
using ToeicApp.Web.Models;

namespace ToeicApp.Web.Controllers;

[AbpMvcAuthorize(PermissionNames.Pages_Exams_Manage)]
public class HomeController : ToeicAppControllerBase
{
    private readonly IExamAppService _examAppService;
    private readonly IRepository<ExamAttempt, int> _attemptRepository;

    public HomeController(
        IExamAppService examAppService,
        IRepository<ExamAttempt, int> attemptRepository)
    {
        _examAppService = examAppService;
        _attemptRepository = attemptRepository;
    }

    public async Task<ActionResult> Index()
    {
        var exams = await _examAppService.GetAdminListAsync();
        var recentAttemptsStart = DateTime.Now.AddDays(-7);
        var model = new HomeDashboardViewModel
        {
            TotalExams = exams.Count,
            PublishedExams = exams.Count(exam => exam.IsPublished),
            DraftExams = exams.Count(exam => !exam.IsPublished),
            RecentExams = exams
                .OrderByDescending(exam => exam.CreationTime)
                .Take(4)
                .ToList(),
            LatestDraft = exams
                .Where(exam => !exam.IsPublished)
                .OrderByDescending(exam => exam.CreationTime)
                .FirstOrDefault(),
            TotalAttempts = await _attemptRepository.CountAsync(),
            RecentAttempts = await _attemptRepository
                .GetAll()
                .CountAsync(attempt => attempt.StartTime >= recentAttemptsStart)
        };

        return View(model);
    }
}
