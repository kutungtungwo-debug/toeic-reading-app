using System;
using System.Collections.Generic;

namespace ToeicApp.Exams.Dto
{
    public class ExamListItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public int DurationMinutes { get; set; }
        public int TotalQuestions { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreationTime { get; set; }
    }

    public class ExamPreviewDto : ExamListItemDto
    {
        public List<PartDto> Parts { get; set; } = new();
    }

    public class PartDto
    {
        public int Id { get; set; }
        public int PartNumber { get; set; }
        public string Directions { get; set; }
        public int StartNo { get; set; }
        public int EndNo { get; set; }
        public List<QuestionGroupDto> Groups { get; set; } = new();
        public List<QuestionDto> Questions { get; set; } = new();
    }

    public class QuestionGroupDto
    {
        public int Id { get; set; }
        public int StartNo { get; set; }
        public int EndNo { get; set; }
        public int OrderIndex { get; set; }
        public List<PassageDto> Passages { get; set; } = new();
        public List<QuestionDto> Questions { get; set; } = new();
    }

    public class PassageDto
    {
        public int Id { get; set; }
        public int OrderIndex { get; set; }
        public string Content { get; set; }
        public string ImageUrl { get; set; }
    }

    public class QuestionDto
    {
        public int Id { get; set; }
        public int QuestionNo { get; set; }
        public string Content { get; set; }
        public string CorrectAnswer { get; set; }
        public List<QuestionOptionDto> Options { get; set; } = new();
    }

    public class QuestionOptionDto
    {
        public int Id { get; set; }
        public string Label { get; set; }
        public string Content { get; set; }
    }

    public class UpdateExamInput
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public int DurationMinutes { get; set; }
        public List<PartDto> Parts { get; set; } = new();
    }

    public class ImportExamOutput
    {
        public bool IsValid { get; set; }
        public int? ExamId { get; set; }
        public int TotalQuestions { get; set; }
        public List<string> Errors { get; set; } = new();
    }

    public class SetExamPublishedInput
    {
        public int Id { get; set; }
        public bool IsPublished { get; set; }
    }

    public class PublishedExamDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public int DurationMinutes { get; set; }
        public int TotalQuestions { get; set; }
    }

    public class ExamTakingDto : PublishedExamDto
    {
        public int? AttemptId { get; set; }
        public DateTime? Deadline { get; set; }
        public List<TakingPartDto> Parts { get; set; } = new();
    }

    public class TakingPartDto
    {
        public int PartNumber { get; set; }
        public string Directions { get; set; }
        public int StartNo { get; set; }
        public int EndNo { get; set; }
        public List<TakingGroupDto> Groups { get; set; } = new();
        public List<TakingQuestionDto> Questions { get; set; } = new();
    }

    public class TakingGroupDto
    {
        public int StartNo { get; set; }
        public int EndNo { get; set; }
        public int OrderIndex { get; set; }
        public List<PassageDto> Passages { get; set; } = new();
        public List<TakingQuestionDto> Questions { get; set; } = new();
    }

    public class TakingQuestionDto
    {
        public int Id { get; set; }
        public int QuestionNo { get; set; }
        public string Content { get; set; }
        public List<QuestionOptionDto> Options { get; set; } = new();
        public string SelectedAnswer { get; set; }
    }

    public class StartAttemptOutput
    {
        public int AttemptId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime Deadline { get; set; }
    }

    public class SaveAttemptAnswerInput
    {
        public int AttemptId { get; set; }
        public int QuestionId { get; set; }
        public string SelectedAnswer { get; set; }
    }

    public class SaveAttemptAnswerOutput
    {
        public bool IsSubmitted { get; set; }
        public DateTime Deadline { get; set; }
    }

    public class SubmitAttemptInput
    {
        public int AttemptId { get; set; }
    }

    public class AttemptResultDto
    {
        public int AttemptId { get; set; }
        public int ExamId { get; set; }
        public string ExamTitle { get; set; }
        public int TotalQuestions { get; set; }
        public int CorrectCount { get; set; }
        public int WrongCount { get; set; }
        public int SkippedCount { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? SubmitTime { get; set; }
        public AttemptStatus Status { get; set; }
        public List<AttemptAnswerResultDto> Answers { get; set; } = new();
    }

    public class AttemptAnswerResultDto
    {
        public int QuestionNo { get; set; }
        public string SelectedAnswer { get; set; }
        public string CorrectAnswer { get; set; }
        public bool IsCorrect { get; set; }
    }
}
