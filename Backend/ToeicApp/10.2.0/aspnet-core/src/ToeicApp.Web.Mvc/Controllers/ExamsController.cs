using System;
using System.IO;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ToeicApp.Authorization;
using ToeicApp.Controllers;
using ToeicApp.Exams;
using ToeicApp.Exams.Dto;

namespace ToeicApp.Web.Controllers;

[AbpMvcAuthorize(PermissionNames.Pages_Exams_Manage)]
public class ExamsController : ToeicAppControllerBase
{
    private const long MaxFileLength = 20 * 1024 * 1024;
    private readonly IExamAppService _examAppService;

    public ExamsController(IExamAppService examAppService)
    {
        _examAppService = examAppService;
    }

    public async Task<ActionResult> Index(bool import = false)
    {
        var exams = await _examAppService.GetAdminListAsync();
        ViewBag.OpenImportDialog = import;
        return View(exams);
    }

    public async Task<ActionResult> Preview(int id)
    {
        var exam = await _examAppService.GetForEditAsync(new EntityDto<int>(id));
        return View(exam);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Import(IFormFile file, string title, int durationMinutes = 75)
    {
        if (file == null || file.Length == 0)
        {
            return Json(new { success = false, errors = new[] { "Vui lòng chọn file .docx." } });
        }
        if (file.Length > MaxFileLength)
        {
            return Json(new { success = false, errors = new[] { "File không được vượt quá 20 MB." } });
        }
        if (!string.Equals(Path.GetExtension(file.FileName), ".docx", StringComparison.OrdinalIgnoreCase))
        {
            return Json(new { success = false, errors = new[] { "Chỉ chấp nhận file Word định dạng .docx." } });
        }
        if (string.IsNullOrWhiteSpace(title) || title.Trim().Length > 200)
        {
            return Json(new { success = false, errors = new[] { "Tên đề thi không được để trống và tối đa 200 ký tự." } });
        }
        if (durationMinutes < 1 || durationMinutes > 300)
        {
            return Json(new { success = false, errors = new[] { "Thời lượng đề phải từ 1 đến 300 phút." } });
        }

        ImportExamOutput result;
        using (var stream = file.OpenReadStream())
        {
            result = await _examAppService.ImportAsync(stream, title, durationMinutes);
        }

        if (result.IsValid)
        {
            return Json(new { success = true, examId = result.ExamId, totalQuestions = result.TotalQuestions });
        }

        return Json(new { success = false, errors = result.Errors });
    }

    [HttpPost]
    public async Task<IActionResult> Update([FromBody] UpdateExamInput input)
    {
        if (input == null)
        {
            return Json(new { success = false, message = "Dữ liệu không hợp lệ." });
        }

        try
        {
            var updated = await _examAppService.UpdateAsync(input);
            return Json(new { success = true, exam = updated });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> SetPublished([FromBody] SetExamPublishedInput input)
    {
        if (input == null)
        {
            return Json(new { success = false, message = "Dữ liệu không hợp lệ." });
        }

        try
        {
            var result = await _examAppService.SetPublishedAsync(input);
            return Json(new { success = true, isPublished = result.IsPublished });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = ex.Message });
        }
    }
}
