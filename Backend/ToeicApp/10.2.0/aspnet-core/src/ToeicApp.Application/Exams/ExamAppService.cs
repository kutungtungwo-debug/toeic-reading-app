using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Runtime.Session;
using Abp.UI;
using DocumentFormat.OpenXml.Packaging;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Transactions;
using System.Threading.Tasks;
using ToeicApp.Authorization;
using ToeicApp.Exams.Dto;
using ToeicApp.Exams.Import;

namespace ToeicApp.Exams
{
    public class ExamAppService : ToeicAppAppServiceBase, IExamAppService
    {
        private readonly IRepository<Exam> _examRepository;
        private readonly IRepository<ExamAttempt> _attemptRepository;
        private readonly IRepository<AttemptAnswer> _answerRepository;
        private readonly IRepository<Question> _questionRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IWebHostEnvironment _environment;

        public ExamAppService(
            IRepository<Exam> examRepository,
            IRepository<ExamAttempt> attemptRepository,
            IRepository<AttemptAnswer> answerRepository,
            IRepository<Question> questionRepository,
            IUnitOfWorkManager unitOfWorkManager,
            IWebHostEnvironment environment)
        {
            _examRepository = examRepository;
            _attemptRepository = attemptRepository;
            _answerRepository = answerRepository;
            _questionRepository = questionRepository;
            _unitOfWorkManager = unitOfWorkManager;
            _environment = environment;
        }

        [AbpAuthorize(PermissionNames.Pages_Exams_Manage)]
        public async Task<ImportExamOutput> ImportAsync(Stream stream, string title, int durationMinutes)
        {
            ValidateMetadata(title, durationMinutes);
            if (stream == null || !stream.CanRead)
            {
                throw new UserFriendlyException("Không thể đọc nội dung file Word.");
            }

            ParseResult parseResult;
            try
            {
                parseResult = new ExamParser().Parse(WordExamReader.Read(stream));
            }
            catch (OpenXmlPackageException)
            {
                return new ImportExamOutput { Errors = new List<string> { "File không phải là tài liệu Word .docx hợp lệ hoặc nội dung bị hỏng." } };
            }
            catch (InvalidDataException)
            {
                return new ImportExamOutput { Errors = new List<string> { "File .docx bị hỏng hoặc không thể đọc." } };
            }
            var output = new ImportExamOutput { Errors = parseResult.Errors };
            if (!parseResult.IsValid)
            {
                return output;
            }

            var imageDirectory = Path.Combine(_environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot"), "exam-images");
            Directory.CreateDirectory(imageDirectory);
            var createdImagePaths = new List<string>();
            try
            {
                var exam = new Exam
                {
                    Title = title.Trim(),
                    DurationMinutes = durationMinutes,
                    TotalQuestions = parseResult.Exam.TotalQuestions,
                    IsPublished = false,
                    CreationTime = DateTime.UtcNow
                };

                foreach (var parsedPart in parseResult.Exam.Parts)
                {
                    var groupOrder = 0;
                    var partRange = parsedPart.PartNumber == 5 ? (From: 101, To: 130) :
                        parsedPart.PartNumber == 6 ? (From: 131, To: 146) : (From: 147, To: 200);
                    var part = new Part
                    {
                        Exam = exam,
                        PartNumber = parsedPart.PartNumber,
                        StartNo = partRange.From,
                        EndNo = partRange.To,
                        Directions = string.Empty
                    };
                    exam.Parts.Add(part);

                    foreach (var parsedQuestion in parsedPart.Questions)
                    {
                        part.Questions.Add(CreateQuestion(exam, part, null, parsedQuestion));
                    }

                    foreach (var parsedGroup in parsedPart.Groups)
                    {
                        var group = new QuestionGroup
                        {
                            Part = part,
                            StartNo = parsedGroup.StartNo,
                            EndNo = parsedGroup.EndNo,
                            OrderIndex = ++groupOrder
                        };
                        part.Groups.Add(group);

                        for (var passageIndex = 0; passageIndex < parsedGroup.Passages.Count; passageIndex++)
                        {
                            var parsedPassage = parsedGroup.Passages[passageIndex];
                            var passage = new Passage
                            {
                                Group = group,
                                OrderIndex = passageIndex + 1,
                                Content = parsedPassage.Content
                            };
                            if (parsedPassage.Image != null)
                            {
                                var fileName = $"{Guid.NewGuid():N}{parsedPassage.Image.Extension}";
                                var path = Path.Combine(imageDirectory, fileName);
                                await File.WriteAllBytesAsync(path, parsedPassage.Image.Data);
                                createdImagePaths.Add(path);
                                passage.ImageUrl = $"/exam-images/{fileName}";
                            }
                            group.Passages.Add(passage);
                        }

                        foreach (var parsedQuestion in parsedGroup.Questions)
                        {
                            group.Questions.Add(CreateQuestion(exam, part, group, parsedQuestion));
                        }
                    }
                }

                using (var unitOfWork = _unitOfWorkManager.Begin(new UnitOfWorkOptions
                {
                    Scope = TransactionScopeOption.RequiresNew,
                    IsTransactional = true
                }))
                {
                    await _examRepository.InsertAsync(exam);
                    await CurrentUnitOfWork.SaveChangesAsync();
                    await unitOfWork.CompleteAsync();
                }

                output.IsValid = true;
                output.ExamId = exam.Id;
                output.TotalQuestions = exam.TotalQuestions;
                return output;
            }
            catch (Exception exception)
            {
                var cleanupErrors = new List<Exception>();
                foreach (var imagePath in createdImagePaths)
                {
                    try
                    {
                        if (File.Exists(imagePath))
                        {
                            File.Delete(imagePath);
                        }
                    }
                    catch (IOException cleanupException)
                    {
                        cleanupErrors.Add(cleanupException);
                    }
                    catch (UnauthorizedAccessException cleanupException)
                    {
                        cleanupErrors.Add(cleanupException);
                    }
                }

                if (cleanupErrors.Count > 0)
                {
                    cleanupErrors.Insert(0, exception);
                    throw new AggregateException("Không thể hoàn tất import và có lỗi khi dọn ảnh tạm.", cleanupErrors);
                }

                throw;
            }
        }

        [AbpAuthorize(PermissionNames.Pages_Exams_Manage)]
        public async Task<List<ExamListItemDto>> GetAdminListAsync()
        {
            var exams = await _examRepository.GetAll()
                .OrderByDescending(exam => exam.CreationTime)
                .ToListAsync();
            return exams.Select(MapListItem).ToList();
        }

        [AbpAuthorize(PermissionNames.Pages_Exams_Manage)]
        public async Task<ExamPreviewDto> GetForEditAsync(EntityDto<int> input)
        {
            var exam = await GetExamWithContentQuery().FirstOrDefaultAsync(item => item.Id == input.Id);
            if (exam == null)
            {
                throw new EntityNotFoundException(typeof(Exam), input.Id);
            }

            return MapPreview(exam);
        }

        [AbpAuthorize(PermissionNames.Pages_Exams_Manage)]
        public async Task<ExamPreviewDto> UpdateAsync(UpdateExamInput input)
        {
            if (input == null || input.Parts == null)
            {
                throw new UserFriendlyException("Dữ liệu đề thi không hợp lệ.");
            }
            ValidateMetadata(input.Title, input.DurationMinutes);
            var exam = await GetExamWithContentQuery().FirstOrDefaultAsync(item => item.Id == input.Id);
            if (exam == null)
            {
                throw new EntityNotFoundException(typeof(Exam), input.Id);
            }
            if (exam.IsPublished)
            {
                throw new UserFriendlyException("Hãy gỡ xuất bản đề trước khi chỉnh sửa.");
            }

            ValidateMatchingStructure(exam, input.Parts);
            exam.Title = input.Title.Trim();
            exam.DurationMinutes = input.DurationMinutes;

            var partsById = input.Parts.ToDictionary(part => part.Id);
            foreach (var part in exam.Parts)
            {
                var partInput = partsById[part.Id];
                part.Directions = partInput.Directions;
                var groupsById = partInput.Groups.ToDictionary(group => group.Id);
                foreach (var group in part.Groups)
                {
                    var groupInput = groupsById[group.Id];
                    UpdatePassages(group.Passages, groupInput.Passages);
                    UpdateQuestions(group.Questions, groupInput.Questions);
                }
                UpdateQuestions(part.Questions, partInput.Questions);
            }

            await CurrentUnitOfWork.SaveChangesAsync();
            return MapPreview(exam);
        }

        [AbpAuthorize(PermissionNames.Pages_Exams_Manage)]
        public async Task<ExamListItemDto> SetPublishedAsync(SetExamPublishedInput input)
        {
            var exam = await GetExamWithContentQuery().FirstOrDefaultAsync(item => item.Id == input.Id);
            if (exam == null)
            {
                throw new EntityNotFoundException(typeof(Exam), input.Id);
            }
            if (input.IsPublished)
            {
                ValidatePublishable(exam);
            }

            exam.IsPublished = input.IsPublished;
            await CurrentUnitOfWork.SaveChangesAsync();
            return MapListItem(exam);
        }

        public async Task<List<PublishedExamDto>> GetPublishedListAsync()
        {
            return await _examRepository.GetAll()
                .Where(exam => exam.IsPublished)
                .OrderByDescending(exam => exam.CreationTime)
                .Select(exam => new PublishedExamDto
                {
                    Id = exam.Id,
                    Title = exam.Title,
                    DurationMinutes = exam.DurationMinutes,
                    TotalQuestions = exam.TotalQuestions
                })
                .ToListAsync();
        }

        public async Task<ExamTakingDto> GetForTakingAsync(EntityDto<int> input)
        {
            var exam = await GetExamWithContentQuery()
                .FirstOrDefaultAsync(item => item.Id == input.Id && item.IsPublished);
            if (exam == null)
            {
                throw new EntityNotFoundException(typeof(Exam), input.Id);
            }

            return MapForTaking(exam, null, null);
        }

        public async Task<ExamTakingDto> GetAttemptAsync(EntityDto<int> input)
        {
            var attempt = await _attemptRepository.GetAll()
                .Include(item => item.Exam)
                    .ThenInclude(exam => exam.Parts)
                        .ThenInclude(part => part.Questions)
                            .ThenInclude(question => question.Options)
                .Include(item => item.Exam)
                    .ThenInclude(exam => exam.Parts)
                        .ThenInclude(part => part.Groups)
                            .ThenInclude(group => group.Passages)
                .Include(item => item.Exam)
                    .ThenInclude(exam => exam.Parts)
                        .ThenInclude(part => part.Groups)
                            .ThenInclude(group => group.Questions)
                                .ThenInclude(question => question.Options)
                .Include(item => item.Answers)
                .FirstOrDefaultAsync(item => item.Id == input.Id && item.UserId == CurrentUserId);
            if (attempt == null)
            {
                throw new EntityNotFoundException(typeof(ExamAttempt), input.Id);
            }
            if (attempt.Status == AttemptStatus.InProgress && DateTime.UtcNow >= GetDeadline(attempt))
            {
                await SubmitAttemptCoreAsync(attempt);
            }

            var selectedAnswers = attempt.Answers.ToDictionary(answer => answer.QuestionId, answer => answer.SelectedAnswer);
            return MapForTaking(attempt.Exam, attempt.Id, GetDeadline(attempt), selectedAnswers);
        }

        public async Task<StartAttemptOutput> StartAttemptAsync(EntityDto<int> input)
        {
            var exam = await _examRepository.FirstOrDefaultAsync(item => item.Id == input.Id && item.IsPublished);
            if (exam == null)
            {
                throw new EntityNotFoundException(typeof(Exam), input.Id);
            }

            var startTime = DateTime.UtcNow;
            var attempt = new ExamAttempt
            {
                UserId = CurrentUserId,
                ExamId = exam.Id,
                StartTime = startTime,
                Status = AttemptStatus.InProgress
            };
            await _attemptRepository.InsertAsync(attempt);
            await CurrentUnitOfWork.SaveChangesAsync();
            return new StartAttemptOutput
            {
                AttemptId = attempt.Id,
                StartTime = startTime,
                Deadline = startTime.AddMinutes(exam.DurationMinutes)
            };
        }

        public async Task<SaveAttemptAnswerOutput> SaveAnswerAsync(SaveAttemptAnswerInput input)
        {
            if (input.SelectedAnswer != null &&
                !new[] { "A", "B", "C", "D" }.Contains(input.SelectedAnswer, StringComparer.Ordinal))
            {
                throw new UserFriendlyException("Đáp án phải là A, B, C, D hoặc chưa chọn.");
            }

            var attempt = await _attemptRepository.GetAll()
                .Include(item => item.Exam)
                .FirstOrDefaultAsync(item => item.Id == input.AttemptId && item.UserId == CurrentUserId);
            if (attempt == null)
            {
                throw new EntityNotFoundException(typeof(ExamAttempt), input.AttemptId);
            }
            if (attempt.Status != AttemptStatus.InProgress)
            {
                throw new UserFriendlyException("Bài thi đã được nộp và không thể thay đổi đáp án.");
            }
            if (DateTime.UtcNow >= GetDeadline(attempt))
            {
                await SubmitAttemptCoreAsync(attempt);
                return new SaveAttemptAnswerOutput { IsSubmitted = true, Deadline = GetDeadline(attempt) };
            }

            var questionExists = await _questionRepository.GetAll()
                .AnyAsync(question => question.Id == input.QuestionId && question.ExamId == attempt.ExamId);
            if (!questionExists)
            {
                throw new UserFriendlyException("Câu hỏi không thuộc đề thi này.");
            }

            var savedAnswer = await _answerRepository.FirstOrDefaultAsync(answer =>
                answer.AttemptId == attempt.Id && answer.QuestionId == input.QuestionId);
            if (savedAnswer == null)
            {
                await _answerRepository.InsertAsync(new AttemptAnswer
                {
                    AttemptId = attempt.Id,
                    QuestionId = input.QuestionId,
                    SelectedAnswer = input.SelectedAnswer
                });
            }
            else
            {
                savedAnswer.SelectedAnswer = input.SelectedAnswer;
                savedAnswer.IsCorrect = false;
            }

            await CurrentUnitOfWork.SaveChangesAsync();
            return new SaveAttemptAnswerOutput { IsSubmitted = false, Deadline = GetDeadline(attempt) };
        }

        public async Task<AttemptResultDto> SubmitAsync(SubmitAttemptInput input)
        {
            var attempt = await _attemptRepository.GetAll()
                .Include(item => item.Exam)
                .FirstOrDefaultAsync(item => item.Id == input.AttemptId && item.UserId == CurrentUserId);
            if (attempt == null)
            {
                throw new EntityNotFoundException(typeof(ExamAttempt), input.AttemptId);
            }

            if (attempt.Status == AttemptStatus.InProgress)
            {
                await SubmitAttemptCoreAsync(attempt);
                await CurrentUnitOfWork.SaveChangesAsync();
            }

            return await BuildResultAsync(attempt.Id);
        }

        public async Task<AttemptResultDto> GetResultAsync(EntityDto<int> input)
        {
            var attempt = await _attemptRepository.GetAll()
                .FirstOrDefaultAsync(item => item.Id == input.Id && item.UserId == CurrentUserId);
            if (attempt == null)
            {
                throw new EntityNotFoundException(typeof(ExamAttempt), input.Id);
            }
            if (attempt.Status != AttemptStatus.Submitted)
            {
                throw new UserFriendlyException("Kết quả chỉ có sau khi nộp bài.");
            }

            return await BuildResultAsync(attempt.Id);
        }

        private long CurrentUserId => AbpSession.UserId
            ?? throw new UserFriendlyException("Bạn cần đăng nhập để thực hiện thao tác này.");

        private static void ValidateMetadata(string title, int durationMinutes)
        {
            if (string.IsNullOrWhiteSpace(title) || title.Trim().Length > 200)
            {
                throw new UserFriendlyException("Tên đề thi không được để trống và tối đa 200 ký tự.");
            }
            if (durationMinutes < 1 || durationMinutes > 300)
            {
                throw new UserFriendlyException("Thời lượng đề phải từ 1 đến 300 phút.");
            }
        }

        private static Question CreateQuestion(Exam exam, Part part, QuestionGroup group, ParsedQuestion parsed)
        {
            var question = new Question
            {
                Exam = exam,
                Part = part,
                Group = group,
                QuestionNo = parsed.QuestionNo,
                Content = parsed.Content,
                CorrectAnswer = parsed.CorrectAnswer
            };
            foreach (var option in parsed.Options)
            {
                question.Options.Add(new QuestionOption
                {
                    Question = question,
                    Label = option.Label,
                    Content = option.Content
                });
            }

            return question;
        }

        private IQueryable<Exam> GetExamWithContentQuery()
        {
            return _examRepository.GetAll()
                .Include(exam => exam.Parts)
                    .ThenInclude(part => part.Questions)
                        .ThenInclude(question => question.Options)
                .Include(exam => exam.Parts)
                    .ThenInclude(part => part.Groups)
                        .ThenInclude(group => group.Passages)
                .Include(exam => exam.Parts)
                    .ThenInclude(part => part.Groups)
                        .ThenInclude(group => group.Questions)
                            .ThenInclude(question => question.Options)
                .AsSplitQuery();
        }

        private static ExamListItemDto MapListItem(Exam exam)
        {
            return new ExamListItemDto
            {
                Id = exam.Id,
                Title = exam.Title,
                DurationMinutes = exam.DurationMinutes,
                TotalQuestions = exam.TotalQuestions,
                IsPublished = exam.IsPublished,
                CreationTime = exam.CreationTime
            };
        }

        private static ExamPreviewDto MapPreview(Exam exam)
        {
            return new ExamPreviewDto
            {
                Id = exam.Id,
                Title = exam.Title,
                DurationMinutes = exam.DurationMinutes,
                TotalQuestions = exam.TotalQuestions,
                IsPublished = exam.IsPublished,
                CreationTime = exam.CreationTime,
                Parts = exam.Parts.OrderBy(part => part.PartNumber).Select(part => new PartDto
                {
                    Id = part.Id,
                    PartNumber = part.PartNumber,
                    Directions = part.Directions,
                    StartNo = part.StartNo,
                    EndNo = part.EndNo,
                    Questions = part.Questions.OrderBy(question => question.QuestionNo).Select(MapQuestion).ToList(),
                    Groups = part.Groups.OrderBy(group => group.OrderIndex).Select(group => new QuestionGroupDto
                    {
                        Id = group.Id,
                        StartNo = group.StartNo,
                        EndNo = group.EndNo,
                        OrderIndex = group.OrderIndex,
                        Passages = group.Passages.OrderBy(passage => passage.OrderIndex).Select(MapPassage).ToList(),
                        Questions = group.Questions.OrderBy(question => question.QuestionNo).Select(MapQuestion).ToList()
                    }).ToList()
                }).ToList()
            };
        }

        private static QuestionDto MapQuestion(Question question)
        {
            return new QuestionDto
            {
                Id = question.Id,
                QuestionNo = question.QuestionNo,
                Content = question.Content,
                CorrectAnswer = question.CorrectAnswer,
                Options = question.Options.OrderBy(option => option.Label).Select(option => new QuestionOptionDto
                {
                    Id = option.Id,
                    Label = option.Label,
                    Content = option.Content
                }).ToList()
            };
        }

        private static PassageDto MapPassage(Passage passage)
        {
            return new PassageDto
            {
                Id = passage.Id,
                OrderIndex = passage.OrderIndex,
                Content = passage.Content,
                ImageUrl = passage.ImageUrl
            };
        }

        private static ExamTakingDto MapForTaking(Exam exam, int? attemptId, DateTime? deadline,
            IDictionary<int, string> selectedAnswers = null)
        {
            return new ExamTakingDto
            {
                Id = exam.Id,
                Title = exam.Title,
                DurationMinutes = exam.DurationMinutes,
                TotalQuestions = exam.TotalQuestions,
                AttemptId = attemptId,
                Deadline = deadline,
                Parts = exam.Parts.OrderBy(part => part.PartNumber).Select(part => new TakingPartDto
                {
                    PartNumber = part.PartNumber,
                    Directions = part.Directions,
                    StartNo = part.StartNo,
                    EndNo = part.EndNo,
                    Questions = part.Questions.OrderBy(question => question.QuestionNo)
                        .Select(question => MapTakingQuestion(question, selectedAnswers)).ToList(),
                    Groups = part.Groups.OrderBy(group => group.OrderIndex).Select(group => new TakingGroupDto
                    {
                        StartNo = group.StartNo,
                        EndNo = group.EndNo,
                        OrderIndex = group.OrderIndex,
                        Passages = group.Passages.OrderBy(passage => passage.OrderIndex).Select(MapPassage).ToList(),
                        Questions = group.Questions.OrderBy(question => question.QuestionNo)
                            .Select(question => MapTakingQuestion(question, selectedAnswers)).ToList()
                    }).ToList()
                }).ToList()
            };
        }

        private static TakingQuestionDto MapTakingQuestion(Question question, IDictionary<int, string> selectedAnswers)
        {
            return new TakingQuestionDto
            {
                Id = question.Id,
                QuestionNo = question.QuestionNo,
                Content = question.Content,
                Options = question.Options.OrderBy(option => option.Label).Select(option => new QuestionOptionDto
                {
                    Id = option.Id,
                    Label = option.Label,
                    Content = option.Content
                }).ToList(),
                SelectedAnswer = selectedAnswers != null && selectedAnswers.TryGetValue(question.Id, out var answer)
                    ? answer
                    : null
            };
        }

        private static void ValidateMatchingStructure(Exam exam, List<PartDto> inputParts)
        {
            if (inputParts.Any(part => part == null || part.Groups == null || part.Questions == null ||
                part.Groups.Any(group => group == null || group.Passages == null || group.Questions == null ||
                    group.Passages.Any(passage => passage == null) || group.Questions.Any(question => question == null)) ||
                part.Questions.Any(question => question == null)))
            {
                throw new UserFriendlyException("Dữ liệu cấu trúc đề thi không hợp lệ.");
            }
            EnsureSameIds(exam.Parts.Select(part => part.Id), inputParts.Select(part => part.Id), "các Part");
            var partInputs = inputParts.ToDictionary(part => part.Id);
            foreach (var part in exam.Parts)
            {
                var partInput = partInputs[part.Id];
                EnsureSameIds(part.Groups.Select(group => group.Id), partInput.Groups.Select(group => group.Id), "các nhóm câu hỏi");
                EnsureSameIds(part.Questions.Select(question => question.Id), partInput.Questions.Select(question => question.Id), "các câu hỏi");

                var groupInputs = partInput.Groups.ToDictionary(group => group.Id);
                foreach (var group in part.Groups)
                {
                    var groupInput = groupInputs[group.Id];
                    EnsureSameIds(group.Passages.Select(passage => passage.Id), groupInput.Passages.Select(passage => passage.Id), "các đoạn văn");
                    EnsureSameIds(group.Questions.Select(question => question.Id), groupInput.Questions.Select(question => question.Id), "các câu hỏi");
                    if (groupInput.Passages.Any(passage => string.IsNullOrWhiteSpace(passage.Content) && string.IsNullOrWhiteSpace(group.Passages.First(existing => existing.Id == passage.Id).ImageUrl)))
                    {
                        throw new UserFriendlyException($"Nhóm câu {group.StartNo}-{group.EndNo}: đoạn văn cần có chữ hoặc hình ảnh.");
                    }
                    ValidateOptionIds(group.Questions, groupInput.Questions, part.PartNumber != 6);
                }
                ValidateOptionIds(part.Questions, partInput.Questions, part.PartNumber != 6);
            }
        }

        private static void ValidateOptionIds(ICollection<Question> questions, ICollection<QuestionDto> inputQuestions, bool requireQuestionContent)
        {
            var inputById = inputQuestions.ToDictionary(question => question.Id);
            foreach (var question in questions)
            {
                var input = inputById[question.Id];
                if (input.Options == null)
                {
                    throw new UserFriendlyException($"Câu {question.QuestionNo}: thiếu các lựa chọn.");
                }
                EnsureSameIds(question.Options.Select(option => option.Id), input.Options.Select(option => option.Id), "các lựa chọn");
                if (!new[] { "A", "B", "C", "D" }.Contains(input.CorrectAnswer, StringComparer.Ordinal))
                {
                    throw new UserFriendlyException($"Câu {question.QuestionNo}: đáp án đúng không hợp lệ.");
                }
                if (input.Options.Any(option => string.IsNullOrWhiteSpace(option.Content)) ||
                    !input.Options.Select(option => option.Label).OrderBy(label => label)
                        .SequenceEqual(new[] { "A", "B", "C", "D" }))
                {
                    throw new UserFriendlyException($"Câu {question.QuestionNo}: cần đủ lựa chọn A, B, C, D và nội dung không được trống.");
                }
                if (requireQuestionContent && string.IsNullOrWhiteSpace(input.Content))
                {
                    throw new UserFriendlyException($"Câu {question.QuestionNo}: nội dung không được để trống.");
                }
            }
        }

        private static void ValidatePublishable(Exam exam)
        {
            var parts = exam.Parts.OrderBy(part => part.PartNumber).ToList();
            if (exam.TotalQuestions != 100 || !parts.Select(part => part.PartNumber).SequenceEqual(new[] { 5, 6, 7 }))
            {
                throw new UserFriendlyException("Đề thi cần có đủ Part 5, Part 6, Part 7 và tổng cộng 100 câu.");
            }

            foreach (var part in parts)
            {
                var questions = part.Groups.Count > 0
                    ? part.Groups.SelectMany(group => group.Questions).ToList()
                    : part.Questions.ToList();
                var expectedCount = part.PartNumber == 5 ? 30 : part.PartNumber == 6 ? 16 : 54;
                if (questions.Count != expectedCount ||
                    questions.Any(question => question.Options.Count != 4 ||
                        !question.Options.Select(option => option.Label).OrderBy(label => label)
                            .SequenceEqual(new[] { "A", "B", "C", "D" }) ||
                        !question.Options.Any(option => option.Label == question.CorrectAnswer) ||
                        (part.PartNumber != 6 && string.IsNullOrWhiteSpace(question.Content))))
                {
                    throw new UserFriendlyException($"Part {part.PartNumber} có câu hỏi hoặc đáp án chưa hợp lệ.");
                }

                if (part.PartNumber == 5 && part.Groups.Count > 0 ||
                    part.PartNumber != 5 && (part.Groups.Count == 0 || part.Groups.Any(group =>
                        group.Passages.Count == 0 ||
                        group.Passages.Any(passage => string.IsNullOrWhiteSpace(passage.Content) && string.IsNullOrWhiteSpace(passage.ImageUrl)))))
                {
                    throw new UserFriendlyException($"Cấu trúc nhóm hoặc đoạn văn ở Part {part.PartNumber} chưa hợp lệ.");
                }
            }
        }

        private static void EnsureSameIds(IEnumerable<int> expected, IEnumerable<int> actual, string label)
        {
            var expectedIds = expected.OrderBy(id => id).ToArray();
            var actualIds = actual.OrderBy(id => id).ToArray();
            if (expectedIds.Length != actualIds.Length || !expectedIds.SequenceEqual(actualIds) ||
                actualIds.Distinct().Count() != actualIds.Length)
            {
                throw new UserFriendlyException($"Không được thêm, xóa hoặc di chuyển {label} trong thao tác chỉnh sửa này.");
            }
        }

        private static void UpdatePassages(ICollection<Passage> passages, ICollection<PassageDto> inputs)
        {
            var inputById = inputs.ToDictionary(passage => passage.Id);
            foreach (var passage in passages)
            {
                passage.Content = inputById[passage.Id].Content;
            }
        }

        private static void UpdateQuestions(ICollection<Question> questions, ICollection<QuestionDto> inputs)
        {
            var inputById = inputs.ToDictionary(question => question.Id);
            foreach (var question in questions)
            {
                var input = inputById[question.Id];
                question.Content = input.Content;
                question.CorrectAnswer = input.CorrectAnswer;
                var optionsById = input.Options.ToDictionary(option => option.Id);
                foreach (var option in question.Options)
                {
                    option.Label = optionsById[option.Id].Label;
                    option.Content = optionsById[option.Id].Content;
                }
            }
        }

        private static DateTime GetDeadline(ExamAttempt attempt)
        {
            return attempt.StartTime.AddMinutes(attempt.Exam.DurationMinutes);
        }

        private async Task SubmitAttemptCoreAsync(ExamAttempt attempt)
        {
            var questions = await _questionRepository.GetAll()
                .Where(question => question.ExamId == attempt.ExamId)
                .ToListAsync();
            var answers = await _answerRepository.GetAll()
                .Where(answer => answer.AttemptId == attempt.Id)
                .ToDictionaryAsync(answer => answer.QuestionId);

            var correctCount = 0;
            var skippedCount = 0;
            foreach (var question in questions)
            {
                if (!answers.TryGetValue(question.Id, out var answer))
                {
                    answer = new AttemptAnswer
                    {
                        AttemptId = attempt.Id,
                        QuestionId = question.Id
                    };
                    await _answerRepository.InsertAsync(answer);
                    answers.Add(question.Id, answer);
                }

                answer.IsCorrect = answer.SelectedAnswer != null &&
                    string.Equals(answer.SelectedAnswer, question.CorrectAnswer, StringComparison.Ordinal);
                if (answer.SelectedAnswer == null)
                {
                    skippedCount++;
                }
                if (answer.IsCorrect)
                {
                    correctCount++;
                }
            }

            attempt.CorrectCount = correctCount;
            attempt.SkippedCount = skippedCount;
            attempt.WrongCount = questions.Count - correctCount - skippedCount;
            attempt.SubmitTime = DateTime.UtcNow;
            attempt.Status = AttemptStatus.Submitted;
        }

        private async Task<AttemptResultDto> BuildResultAsync(int attemptId)
        {
            var attempt = await _attemptRepository.GetAll()
                .Include(item => item.Exam)
                .Include(item => item.Answers)
                    .ThenInclude(answer => answer.Question)
                .FirstOrDefaultAsync(item => item.Id == attemptId);
            if (attempt == null)
            {
                throw new EntityNotFoundException(typeof(ExamAttempt), attemptId);
            }

            return new AttemptResultDto
            {
                AttemptId = attempt.Id,
                ExamId = attempt.ExamId,
                ExamTitle = attempt.Exam.Title,
                TotalQuestions = attempt.Exam.TotalQuestions,
                CorrectCount = attempt.CorrectCount,
                WrongCount = attempt.WrongCount,
                SkippedCount = attempt.SkippedCount,
                StartTime = attempt.StartTime,
                SubmitTime = attempt.SubmitTime,
                Status = attempt.Status,
                Answers = attempt.Answers.OrderBy(answer => answer.Question.QuestionNo)
                    .Select(answer => new AttemptAnswerResultDto
                    {
                        QuestionNo = answer.Question.QuestionNo,
                        SelectedAnswer = answer.SelectedAnswer,
                        CorrectAnswer = answer.Question.CorrectAnswer,
                        IsCorrect = answer.IsCorrect
                    }).ToList()
            };
        }
    }
}
