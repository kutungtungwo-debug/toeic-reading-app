using Abp.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;
using ToeicApp.Authorization;
using ToeicApp.Exams;
using ToeicApp.Exams.Dto;

namespace ToeicApp.Web.Host.Controllers
{
    /// <summary>
    /// Multipart endpoint for importing validated DOCX exams.
    /// </summary>
    [ApiController]
    [Route("api/exams")]
    [AbpAuthorize(PermissionNames.Pages_Exams_Manage)]
    public class ExamImportController : ControllerBase
    {
        private const long MaxFileLength = 20 * 1024 * 1024;
        private readonly IExamAppService _examAppService;

        /// <summary>
        /// Creates the exam import endpoint.
        /// </summary>
        public ExamImportController(IExamAppService examAppService)
        {
            _examAppService = examAppService;
        }

        /// <summary>
        /// Validates and imports a TOEIC Reading exam from a Word document.
        /// </summary>
        [HttpPost("import")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(MaxFileLength)]
        [RequestFormLimits(MultipartBodyLengthLimit = MaxFileLength)]
        public async Task<ActionResult<ImportExamOutput>> Import(
            [FromForm] IFormFile file,
            [FromForm] string title,
            [FromForm] int durationMinutes = 75)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new ImportExamOutput { Errors = { "Vui lòng chọn file .docx." } });
            }
            if (file.Length > MaxFileLength)
            {
                return BadRequest(new ImportExamOutput { Errors = { "File không được vượt quá 20 MB." } });
            }
            if (!string.Equals(Path.GetExtension(file.FileName), ".docx", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new ImportExamOutput { Errors = { "Chỉ chấp nhận file Word định dạng .docx." } });
            }
            if (string.IsNullOrWhiteSpace(title) || title.Trim().Length > 200)
            {
                return BadRequest(new ImportExamOutput { Errors = { "Tên đề thi không được để trống và tối đa 200 ký tự." } });
            }
            if (durationMinutes < 1 || durationMinutes > 300)
            {
                return BadRequest(new ImportExamOutput { Errors = { "Thời lượng đề phải từ 1 đến 300 phút." } });
            }

            ImportExamOutput result;
            using (var stream = file.OpenReadStream())
            {
                result = await _examAppService.ImportAsync(stream, title, durationMinutes);
            }
            if (result.IsValid)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }
    }
}
