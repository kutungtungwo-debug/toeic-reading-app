using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using ToeicApp.Exams.Dto;

namespace ToeicApp.Exams
{
    public interface IExamAppService : IApplicationService
    {
        Task<ImportExamOutput> ImportAsync(Stream stream, string title, int durationMinutes);
        Task<List<ExamListItemDto>> GetAdminListAsync();
        Task<ExamPreviewDto> GetForEditAsync(EntityDto<int> input);
        Task<ExamPreviewDto> UpdateAsync(UpdateExamInput input);
        Task<ExamListItemDto> SetPublishedAsync(SetExamPublishedInput input);
        Task<List<PublishedExamDto>> GetPublishedListAsync();
        Task<ExamTakingDto> GetForTakingAsync(EntityDto<int> input);
        Task<ExamTakingDto> GetAttemptAsync(EntityDto<int> input);
        Task<StartAttemptOutput> StartAttemptAsync(EntityDto<int> input);
        Task<SaveAttemptAnswerOutput> SaveAnswerAsync(SaveAttemptAnswerInput input);
        Task<AttemptResultDto> SubmitAsync(SubmitAttemptInput input);
        Task<AttemptResultDto> GetResultAsync(EntityDto<int> input);
    }
}
