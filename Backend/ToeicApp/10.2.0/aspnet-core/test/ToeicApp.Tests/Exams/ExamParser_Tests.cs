using System.Collections.Generic;
using System.IO;
using System.Linq;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Shouldly;
using ToeicApp.Exams.Import;
using Xunit;

namespace ToeicApp.Tests.Exams
{
    public class ExamParser_Tests
    {
        [Fact]
        public void Parse_should_accept_a_complete_exam()
        {
            var result = new ExamParser().Parse(CreateValidExamLines());

            result.IsValid.ShouldBeTrue(string.Join("\n", result.Errors));
            result.Exam.TotalQuestions.ShouldBe(100);
            result.Exam.Parts.Count.ShouldBe(3);
        }

        [Fact]
        public void Parse_should_report_a_missing_answer_key()
        {
            var lines = CreateValidExamLines();
            lines.Remove(lines.First(line => line.Text == "[ANS] A"));

            var result = new ExamParser().Parse(lines);

            result.IsValid.ShouldBeFalse();
            result.Errors.Any(error => error.Contains("thiếu thẻ [ANS]")).ShouldBeTrue();
        }

        [Fact]
        public void Word_reader_should_read_docx_paragraphs_in_order()
        {
            using var stream = new MemoryStream();
            using (var document = WordprocessingDocument.Create(stream, WordprocessingDocumentType.Document, true))
            {
                var mainPart = document.AddMainDocumentPart();
                mainPart.Document = new Document(new Body(
                    new Paragraph(new Run(new Text("[PART 5]"))),
                    new Paragraph(new Run(new Text("[Q 101]")))));
                mainPart.Document.Save();
            }
            stream.Position = 0;

            var lines = WordExamReader.Read(stream);

            lines.Select(line => line.Text).ShouldBe(new[] { "[PART 5]", "[Q 101]" });
            lines.Select(line => line.LineNo).ShouldBe(new[] { 1, 2 });
        }

        private static List<DocLine> CreateValidExamLines()
        {
            var lines = new List<DocLine>();
            var lineNo = 0;
            AddText(lines, ref lineNo, "[PART 5]");
            AddQuestions(lines, ref lineNo, 101, 130, true);

            AddText(lines, ref lineNo, "[PART 6]");
            AddGroups(lines, ref lineNo, 131, 146, 4, false);

            AddText(lines, ref lineNo, "[PART 7]");
            AddGroups(lines, ref lineNo, 147, 200, 4, true);
            return lines;
        }

        private static void AddGroups(List<DocLine> lines, ref int lineNo, int from, int to, int groupSize, bool includeQuestionContent)
        {
            for (var start = from; start <= to; start += groupSize)
            {
                var end = System.Math.Min(start + groupSize - 1, to);
                AddText(lines, ref lineNo, $"[GROUP {start}-{end}]");
                AddText(lines, ref lineNo, "[PASSAGE]");
                AddText(lines, ref lineNo, "Passage text");
                AddText(lines, ref lineNo, "[/PASSAGE]");
                AddQuestions(lines, ref lineNo, start, end, includeQuestionContent);
                AddText(lines, ref lineNo, "[/GROUP]");
            }
        }

        private static void AddQuestions(List<DocLine> lines, ref int lineNo, int from, int to, bool includeQuestionContent)
        {
            for (var questionNo = from; questionNo <= to; questionNo++)
            {
                AddText(lines, ref lineNo, $"[Q {questionNo}]");
                if (includeQuestionContent)
                {
                    AddText(lines, ref lineNo, "Question text");
                }
                AddText(lines, ref lineNo, "[A] Option A");
                AddText(lines, ref lineNo, "[B] Option B");
                AddText(lines, ref lineNo, "[C] Option C");
                AddText(lines, ref lineNo, "[D] Option D");
                AddText(lines, ref lineNo, "[ANS] A");
            }
        }

        private static void AddText(List<DocLine> lines, ref int lineNo, string text)
        {
            lines.Add(new DocLine { LineNo = ++lineNo, Text = text });
        }
    }
}
