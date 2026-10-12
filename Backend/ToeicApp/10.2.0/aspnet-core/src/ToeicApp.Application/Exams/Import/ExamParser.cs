using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace ToeicApp.Exams.Import
{
    public class ExamParser
    {
        private static readonly Regex RxPart = new(@"^\[PART\s+(\d+)\]$");
        private static readonly Regex RxGroup = new(@"^\[GROUP\s+(\d+)\s*-\s*(\d+)\]$");
        private static readonly Regex RxQuestion = new(@"^\[Q\s+(\d+)\]$");
        private static readonly Regex RxOption = new(@"^\[([ABCD])\]\s*(.*)$");
        private static readonly Regex RxAnswer = new(@"^\[ANS\]\s*([ABCD])$");
        private static readonly Regex RxAnyTag = new(@"^\[[A-Za-z/]");

        private static readonly Dictionary<int, (int From, int To)> PartRanges = new()
        {
            { 5, (101, 130) },
            { 6, (131, 146) },
            { 7, (147, 200) }
        };

        private static readonly string[] AllowedExt = { ".png", ".jpg", ".gif", ".bmp" };
        private const int MaxErrors = 50;

        private ParseResult _result;
        private ParsedPart _part;
        private ParsedGroup _group;
        private ParsedPassage _passage;
        private ParsedQuestion _q;
        private bool _afterImgTag;
        private int _expectedNo;
        private int _partCount;

        public ParseResult Parse(List<DocLine> lines)
        {
            _result = new ParseResult();
            _part = null; _group = null; _passage = null; _q = null;
            _afterImgTag = false;
            _expectedNo = 101;
            _partCount = 0;

            if (lines == null || lines.Count == 0)
            {
                Error("File Word không có nội dung.");
                return _result;
            }

            foreach (var line in lines)
            {
                if (line.Image != null) HandleImage(line);
                else HandleText(line);
            }

            CloseQuestion();
            if (_passage != null) Error("Cuối file: có [PASSAGE] chưa đóng bằng [/PASSAGE].");
            if (_group != null) Error($"Cuối file: [GROUP {_group.StartNo}-{_group.EndNo}] chưa đóng bằng [/GROUP].");
            FinishPart();
            if (_partCount < 3) Error("Đề thiếu Part: cần đủ [PART 5], [PART 6], [PART 7].");
            if (_expectedNo != 201) Error($"Đề thiếu câu hỏi: chỉ đọc đến câu {_expectedNo - 1}, cần đủ câu 101 đến 200.");

            return _result;
        }

        private void HandleImage(DocLine l)
        {
            if (_passage != null && _afterImgTag)
            {
                _afterImgTag = false;
                if (!AllowedExt.Contains(l.Image.Extension))
                    ErrorAt(l, "ảnh có định dạng không hỗ trợ (chỉ nhận PNG, JPG, GIF, BMP).");
                else if (_passage.Image != null)
                    ErrorAt(l, "mỗi [PASSAGE] chỉ được 1 ảnh.");
                else
                    _passage.Image = l.Image;
            }
            else
            {
                ErrorAt(l, "có ảnh nhưng không nằm ngay sau thẻ [IMG] trong [PASSAGE].");
            }
        }

        private void HandleText(DocLine l)
        {
            var t = l.Text;
            Match m;

            if ((m = RxPart.Match(t)).Success) { HandlePart(l, int.Parse(m.Groups[1].Value)); return; }

            if ((m = RxGroup.Match(t)).Success)
            {
                HandleGroup(l, int.Parse(m.Groups[1].Value), int.Parse(m.Groups[2].Value));
                return;
            }

            if (t == "[/GROUP]") { HandleEndGroup(l); return; }
            if (t == "[PASSAGE]") { HandlePassage(l); return; }
            if (t == "[/PASSAGE]") { HandleEndPassage(l); return; }

            if (t == "[IMG]")
            {
                if (_passage == null) ErrorAt(l, "[IMG] chỉ được đặt trong [PASSAGE].");
                else if (_afterImgTag) ErrorAt(l, "[IMG] trước đó chưa có ảnh.");
                else _afterImgTag = true;
                return;
            }

            if ((m = RxQuestion.Match(t)).Success) { HandleQuestion(l, int.Parse(m.Groups[1].Value)); return; }
            if ((m = RxOption.Match(t)).Success) { HandleOption(l, m.Groups[1].Value, m.Groups[2].Value.Trim()); return; }
            if ((m = RxAnswer.Match(t)).Success) { HandleAnswer(l, m.Groups[1].Value); return; }

            if (RxAnyTag.IsMatch(t))
            {
                ErrorAt(l, "thẻ không hợp lệ hoặc sai cú pháp.");
                return;
            }

            HandlePlainText(l);
        }

        private void HandlePart(DocLine l, int n)
        {
            CloseQuestion();
            if (_passage != null) { ErrorAt(l, "[PASSAGE] phía trên chưa đóng."); _passage = null; _afterImgTag = false; }
            if (_group != null) { ErrorAt(l, "[GROUP] phía trên chưa đóng."); _group = null; }
            FinishPart();

            int expected = 5 + _partCount;
            if (!PartRanges.ContainsKey(n)) { ErrorAt(l, "chỉ có PART 5, 6, 7."); _part = null; return; }
            if (n != expected) ErrorAt(l, $"thứ tự Part sai, mong đợi [PART {expected}].");

            _part = new ParsedPart { PartNumber = n };
            _result.Exam.Parts.Add(_part);
            _partCount++;
        }

        private void HandleGroup(DocLine l, int a, int b)
        {
            CloseQuestion();
            if (_part == null) { ErrorAt(l, "[GROUP] nằm ngoài [PART]."); return; }
            if (_part.PartNumber == 5) { ErrorAt(l, "Part 5 không dùng [GROUP]."); return; }
            if (_group != null) { ErrorAt(l, "[GROUP] trước đó chưa đóng bằng [/GROUP]."); _group = null; }
            if (a > b) ErrorAt(l, "số câu trong [GROUP] phải từ nhỏ đến lớn.");
            if (a != _expectedNo) ErrorAt(l, $"[GROUP] bắt đầu sai số câu, mong đợi {_expectedNo}.");

            _group = new ParsedGroup { StartNo = a, EndNo = b };
            _part.Groups.Add(_group);
        }

        private void HandleEndGroup(DocLine l)
        {
            if (_group == null) { ErrorAt(l, "[/GROUP] không có [GROUP] mở trước đó."); return; }
            CloseQuestion();
            if (_passage != null) { ErrorAt(l, "[PASSAGE] chưa đóng trước [/GROUP]."); _passage = null; _afterImgTag = false; }

            var g = _group;
            _group = null;
            string name = $"[GROUP {g.StartNo}-{g.EndNo}]";
            if (g.Passages.Count == 0) Error($"{name}: chưa có [PASSAGE].");
            if (g.Questions.Count == 0) Error($"{name}: chưa có câu hỏi nào.");
            else
            {
                int first = g.Questions.First().QuestionNo;
                int last = g.Questions.Last().QuestionNo;
                if (first != g.StartNo || last != g.EndNo)
                    Error($"{name}: các câu bên trong là {first}-{last}, không khớp với khai báo.");
            }
        }

        private void HandlePassage(DocLine l)
        {
            if (_group == null) { ErrorAt(l, "[PASSAGE] phải nằm trong [GROUP]."); return; }
            if (_passage != null) { ErrorAt(l, "[PASSAGE] trước đó chưa đóng."); }
            if (_q != null) { ErrorAt(l, "[PASSAGE] phải đặt trước các câu hỏi của nhóm."); return; }

            _passage = new ParsedPassage();
            _afterImgTag = false;
            _group.Passages.Add(_passage);
        }

        private void HandleEndPassage(DocLine l)
        {
            if (_passage == null) { ErrorAt(l, "[/PASSAGE] không có [PASSAGE] mở trước đó."); return; }
            if (_afterImgTag) ErrorAt(l, "[IMG] phía trên chưa có ảnh.");
            if (string.IsNullOrWhiteSpace(_passage.Content) && _passage.Image == null)
                ErrorAt(l, "[PASSAGE] trống, cần có chữ hoặc ảnh.");
            _passage = null;
            _afterImgTag = false;
        }

        private void HandleQuestion(DocLine l, int n)
        {
            CloseQuestion();

            if (_part == null) { ErrorAt(l, "câu hỏi nằm ngoài [PART]."); return; }
            if (_passage != null) { ErrorAt(l, "[PASSAGE] chưa đóng trước câu hỏi."); _passage = null; _afterImgTag = false; }
            if (_part.PartNumber == 5 && _group != null) { ErrorAt(l, "Part 5 không có [GROUP]."); }
            if (_part.PartNumber != 5 && _group == null) { ErrorAt(l, "câu hỏi Part 6/7 phải nằm trong [GROUP]."); }

            if (PartRanges.TryGetValue(_part.PartNumber, out var r) && (n < r.From || n > r.To))
                ErrorAt(l, $"câu {n} không thuộc Part {_part.PartNumber} (câu {r.From}-{r.To}).");
            if (n != _expectedNo)
                ErrorAt(l, $"sai số thứ tự câu, mong đợi {_expectedNo} nhưng gặp {n}.");
            _expectedNo = n + 1;

            _q = new ParsedQuestion { LineNo = l.LineNo, QuestionNo = n };
            if (_group != null) _group.Questions.Add(_q);
            else _part.Questions.Add(_q);
        }

        private void HandleOption(DocLine l, string label, string content)
        {
            if (_q == null) { ErrorAt(l, "đáp án nằm ngoài câu hỏi."); return; }
            if (_q.CorrectAnswer != null) { ErrorAt(l, "đáp án nằm sau [ANS]."); return; }
            if (_q.Options.Count >= 4) { ErrorAt(l, $"câu {_q.QuestionNo} thừa đáp án."); return; }

            string expected = "ABCD"[_q.Options.Count].ToString();
            if (label != expected) ErrorAt(l, $"câu {_q.QuestionNo}: sai thứ tự đáp án, mong đợi [{expected}].");
            if (content.Length == 0) ErrorAt(l, $"câu {_q.QuestionNo}: đáp án [{label}] chưa có nội dung.");

            _q.Options.Add(new ParsedOption { Label = label, Content = content });
        }

        private void HandleAnswer(DocLine l, string letter)
        {
            if (_q == null) { ErrorAt(l, "[ANS] nằm ngoài câu hỏi."); return; }
            if (_q.Options.Count < 4) { ErrorAt(l, $"câu {_q.QuestionNo}: [ANS] xuất hiện khi chưa đủ 4 đáp án."); return; }
            if (_q.CorrectAnswer != null) { ErrorAt(l, $"câu {_q.QuestionNo}: có hơn 1 thẻ [ANS]."); return; }
            _q.CorrectAnswer = letter;
        }

        private void HandlePlainText(DocLine l)
        {
            if (_passage != null)
            {
                if (_afterImgTag) { ErrorAt(l, "sau [IMG] phải là ảnh, không phải chữ."); _afterImgTag = false; }
                _passage.Content = _passage.Content.Length == 0 ? l.Text : _passage.Content + "\n" + l.Text;
            }
            else if (_q != null && _q.Options.Count == 0)
            {
                _q.Content = _q.Content.Length == 0 ? l.Text : _q.Content + "\n" + l.Text;
            }
            else
            {
                ErrorAt(l, "văn bản nằm ngoài các thẻ.");
            }
        }

        private void CloseQuestion()
        {
            if (_q == null) return;
            var q = _q;
            _q = null;
            string prefix = $"Câu {q.QuestionNo} (dòng {q.LineNo})";

            if (q.Options.Count < 4)
                Error($"{prefix}: chỉ có {q.Options.Count} đáp án, cần đủ [A] [B] [C] [D].");
            else if (q.CorrectAnswer == null)
                Error($"{prefix}: thiếu thẻ [ANS].");

            if (_part != null && _part.PartNumber != 6 && string.IsNullOrWhiteSpace(q.Content))
                Error($"{prefix}: thiếu nội dung câu hỏi.");
        }

        private void FinishPart()
        {
            if (_part == null) return;
            var p = _part;
            _part = null;

            if (!PartRanges.TryGetValue(p.PartNumber, out var r)) return;
            int need = r.To - r.From + 1;
            int count = p.Questions.Count + p.Groups.Sum(g => g.Questions.Count);
            if (count != need)
                Error($"Part {p.PartNumber} cần {need} câu (từ {r.From} đến {r.To}) nhưng chỉ đọc được {count} câu.");
            if (p.PartNumber != 5 && p.Groups.Count == 0)
                Error($"Part {p.PartNumber} chưa có [GROUP] nào.");
        }

        private void ErrorAt(DocLine l, string msg)
        {
            string snippet = l.Text == null ? "(ảnh)" : (l.Text.Length > 60 ? l.Text.Substring(0, 60) + "..." : l.Text);
            Error($"Dòng {l.LineNo}: {msg}  →  \"{snippet}\"");
        }

        private void Error(string msg)
        {
            if (_result.Errors.Count < MaxErrors) _result.Errors.Add(msg);
            else if (_result.Errors.Count == MaxErrors) _result.Errors.Add("... còn nhiều lỗi khác, hãy sửa các lỗi trên rồi tải lại.");
        }
    }
}
