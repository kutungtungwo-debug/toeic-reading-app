using System.Collections.Generic;
using System.Linq;

namespace ToeicApp.Exams.Import
{
    public class DocImage
    {
        public byte[] Data { get; set; }
        public string Extension { get; set; }
    }

    public class DocLine
    {
        public int LineNo { get; set; }
        public string Text { get; set; }
        public DocImage Image { get; set; }
    }

    public class ParsedOption
    {
        public string Label { get; set; }
        public string Content { get; set; }
    }

    public class ParsedQuestion
    {
        public int LineNo { get; set; }
        public int QuestionNo { get; set; }
        public string Content { get; set; } = "";
        public string CorrectAnswer { get; set; }
        public List<ParsedOption> Options { get; set; } = new();
    }

    public class ParsedPassage
    {
        public string Content { get; set; } = "";
        public DocImage Image { get; set; }
    }

    public class ParsedGroup
    {
        public int StartNo { get; set; }
        public int EndNo { get; set; }
        public List<ParsedPassage> Passages { get; set; } = new();
        public List<ParsedQuestion> Questions { get; set; } = new();
    }

    public class ParsedPart
    {
        public int PartNumber { get; set; }
        public List<ParsedGroup> Groups { get; set; } = new();
        public List<ParsedQuestion> Questions { get; set; } = new();
    }

    public class ParsedExam
    {
        public List<ParsedPart> Parts { get; set; } = new();

        public int TotalQuestions =>
            Parts.Sum(p => p.Questions.Count + p.Groups.Sum(g => g.Questions.Count));
    }

    public class ParseResult
    {
        public ParsedExam Exam { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public bool IsValid => Errors.Count == 0;
    }
}
