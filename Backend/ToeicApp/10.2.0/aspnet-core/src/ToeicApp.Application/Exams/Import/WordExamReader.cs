using System.Collections.Generic;
using System.IO;
using System.Text;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace ToeicApp.Exams.Import
{
    public static class WordExamReader
    {
        public static List<DocLine> Read(Stream stream)
        {
            var lines = new List<DocLine>();

            using var doc = WordprocessingDocument.Open(stream, false);
            var main = doc.MainDocumentPart;
            var body = main?.Document?.Body;
            if (body == null) return lines;

            int no = 0;
            foreach (var p in body.Descendants<Paragraph>())
            {
                no++;

                var sb = new StringBuilder();
                foreach (var el in p.Descendants())
                {
                    if (el is Text t) sb.Append(t.Text);
                    else if (el is Break) sb.Append('\n');
                    else if (el is TabChar) sb.Append(' ');
                    else if (el is DocumentFormat.OpenXml.Drawing.Blip blip)
                    {
                        FlushText(sb, lines, no);
                        var id = blip.Embed?.Value;
                        if (id == null || main.GetPartById(id) is not ImagePart imagePart) continue;

                        using var imageStream = imagePart.GetStream();
                        using var memoryStream = new MemoryStream();
                        imageStream.CopyTo(memoryStream);
                        lines.Add(new DocLine
                        {
                            LineNo = no,
                            Image = new DocImage
                            {
                                Data = memoryStream.ToArray(),
                                Extension = GetExt(imagePart.ContentType)
                            }
                        });
                    }
                }

                FlushText(sb, lines, no);
            }

            return lines;
        }

        private static void FlushText(StringBuilder sb, List<DocLine> lines, int lineNo)
        {
            foreach (var part in sb.ToString().Split('\n'))
            {
                var text = part.Replace('\u00A0', ' ').Trim();
                if (text.Length > 0)
                {
                    lines.Add(new DocLine { LineNo = lineNo, Text = text });
                }
            }
            sb.Clear();
        }

        private static string GetExt(string contentType)
        {
            switch ((contentType ?? "").ToLowerInvariant())
            {
                case "image/png": return ".png";
                case "image/jpeg":
                case "image/jpg": return ".jpg";
                case "image/gif": return ".gif";
                case "image/bmp": return ".bmp";
                default: return ".unsupported";
            }
        }
    }
}
