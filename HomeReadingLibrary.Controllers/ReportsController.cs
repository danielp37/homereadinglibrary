using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HomeReadingLibrary.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace HomeReadingLibrary.Controllers.Controllers
{
    [Route("api/[controller]")]
    public class ReportsController : Controller
    {
        private readonly IMongoDatabase _mongoDatabase;
        public ReportsController(IMongoDatabase mongoDatabase)
        {
            _mongoDatabase = mongoDatabase;
        }

        [Authorize(AuthenticationSchemes = "Bearer", Policy = "AdminUser")]
        [HttpGet("endofyearstudents")]
        public async Task<IActionResult> GetEndOfYearStudents()
        {
            var results = await RunStudentYearEndReport();
            return Ok(new { Data = results });
        }

        [Authorize(AuthenticationSchemes = "Bearer", Policy = "AdminUser")]
        [HttpGet("endofyearstudents/export")]
        public async Task<IActionResult> ExportEndOfYearStudents()
        {
            var results = await RunStudentYearEndReport();
            var csv = GenerateCsv(results);
            var bytes = Encoding.UTF8.GetBytes(csv);
            return File(bytes, "text/csv", "end-of-year-student-report.csv");
        }

        private async Task<List<StudentYearEndReportItem>> RunStudentYearEndReport()
        {
            var pipeline = new[]
            {
                new BsonDocument("$lookup", new BsonDocument
                {
                    { "from", "currentreservations" },
                    { "let", new BsonDocument("studentId", "$_id") },
                    { "pipeline", new BsonArray
                        {
                            new BsonDocument("$match", new BsonDocument("$expr",
                                new BsonDocument("$eq", new BsonArray { "$studentBarCode", "$$studentId" }))),
                            new BsonDocument("$sort", new BsonDocument("checkedOutDate", 1))
                        }
                    },
                    { "as", "reservation" }
                }),
                new BsonDocument("$addFields", new BsonDocument
                {
                    { "startingBook", new BsonDocument("$first", "$reservation") },
                    { "endingBook", new BsonDocument("$last", "$reservation") }
                }),
                new BsonDocument("$replaceWith", new BsonDocument
                {
                    { "$unsetField", new BsonDocument
                        {
                            { "field", "reservation" },
                            { "input", "$$ROOT" }
                        }
                    }
                }),
                new BsonDocument("$lookup", new BsonDocument
                {
                    { "from", "booksByBookCopies" },
                    { "localField", "startingBook.bookCopyBarCode" },
                    { "foreignField", "_id" },
                    { "as", "startingBookCopy" }
                }),
                new BsonDocument("$lookup", new BsonDocument
                {
                    { "from", "booksByBookCopies" },
                    { "localField", "endingBook.bookCopyBarCode" },
                    { "foreignField", "_id" },
                    { "as", "endingBookCopy" }
                }),
                new BsonDocument("$project", new BsonDocument
                {
                    { "teacherName", 1 },
                    { "grade", 1 },
                    { "lastName", 1 },
                    { "firstName", 1 },
                    { "startingBookCopy.guidedReadingLevel", 1 },
                    { "endingBookCopy.guidedReadingLevel", 1 }
                }),
                new BsonDocument("$sort", new BsonDocument
                {
                    { "teacherName", 1 },
                    { "grade", 1 },
                    { "lastName", 1 },
                    { "firstName", 1 }
                })
            };
            var collection = _mongoDatabase.GetCollection<BsonDocument>("students");
            var docs = await collection.Aggregate<BsonDocument>(pipeline).ToListAsync();
            var results = new List<StudentYearEndReportItem>();
            foreach (var doc in docs)
            {
                var item = new StudentYearEndReportItem
                {
                    TeacherName = BsonToString(doc.GetValue("teacherName", BsonNull.Value)),
                    Grade = BsonToString(doc.GetValue("grade", BsonNull.Value)),
                    LastName = BsonToString(doc.GetValue("lastName", BsonNull.Value)),
                    FirstName = BsonToString(doc.GetValue("firstName", BsonNull.Value)),
                    StartingReadingLevel = GetReadingLevel(doc, "startingBookCopy"),
                    EndingReadingLevel = GetReadingLevel(doc, "endingBookCopy")
                };
                results.Add(item);
            }
            return results;
        }

        private static string BsonToString(BsonValue value)
        {
            if (value == null || value.IsBsonNull) return null;
            return value.IsString ? value.AsString : value.ToString();
        }

        private string GetReadingLevel(BsonDocument doc, string field)
        {
            if (!doc.Contains(field) || !doc[field].IsBsonArray)
                return null;
            var arr = doc[field].AsBsonArray;
            if (arr.Count == 0)
                return null;
            var first = arr[0] as BsonDocument;
            if (first == null || !first.Contains("guidedReadingLevel"))
                return null;
            var val = first["guidedReadingLevel"];
            return BsonToString(val);
        }

        private string GenerateCsv(List<StudentYearEndReportItem> items)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Teacher,Grade,Last Name,First Name,Starting Reading Level,Ending Reading Level");
            foreach (var item in items)
            {
                sb.AppendLine($"{Escape(item.TeacherName)},{Escape(item.Grade)},{Escape(item.LastName)},{Escape(item.FirstName)},{Escape(item.StartingReadingLevel)},{Escape(item.EndingReadingLevel)}");
            }
            return sb.ToString();
        }

        private string Escape(string s)
        {
            if (string.IsNullOrEmpty(s)) return "";
            if (s.Contains(",") || s.Contains("\"") || s.Contains("\r") || s.Contains("\n"))
                return $"\"{s.Replace("\"", "\"\"")}\"";
            return s;
        }
    }
}
