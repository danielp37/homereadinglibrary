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

        [Authorize(AuthenticationSchemes = "Bearer", Policy = "AdminUser")]
        [HttpGet("missingcheckins")]
        public async Task<IActionResult> GetMissingCheckins()
        {
            var results = await RunMissingCheckinsReport();
            return Ok(new { Data = results });
        }

        private async Task<List<MissingCheckinReportItem>> RunMissingCheckinsReport()
        {
            var pipeline = new[]
            {
                // Only open (not checked in) checkouts
                new BsonDocument("$match", new BsonDocument("checkedInDate", BsonNull.Value)),

                // Find later check-ins by same student in currentreservations
                new BsonDocument("$lookup", new BsonDocument
                {
                    { "from", "currentreservations" },
                    { "let", new BsonDocument
                        {
                            { "studentId", "$studentBarCode" },
                            { "checkoutDate", "$checkedOutDate" }
                        }
                    },
                    { "pipeline", new BsonArray
                        {
                            new BsonDocument("$match", new BsonDocument("$expr",
                                new BsonDocument("$and", new BsonArray
                                {
                                    new BsonDocument("$eq",  new BsonArray { "$studentBarCode", "$$studentId" }),
                                    new BsonDocument("$gt",  new BsonArray { "$checkedOutDate", "$$checkoutDate" })
                                }))),
                            new BsonDocument("$limit", 1)
                        }
                    },
                    { "as", "laterCheckins" }
                }),

                // Keep only checkouts where a later check-in exists
                new BsonDocument("$match", new BsonDocument("laterCheckins.0",
                    new BsonDocument("$exists", true))),

                // Flatten embedded subdoc fields to top-level aliases
                new BsonDocument("$project", new BsonDocument
                {
                    { "bookCopyBarCode", 1 },
                    { "checkedOutDate", 1 },
                    { "studentFirstName", "$student.firstName" },
                    { "studentLastName",  "$student.lastName" },
                    { "bookTitle",        "$bookCopy.title" },
                    { "readingLevel",     "$bookCopy.guidedReadingLevel" },
                    { "boxNumber",        "$bookCopy.boxNumber" },
                    { "studentBarCode",   "$studentBarCode" },
                    { "teacherName",      "$student.teacherName" },
                    { "grade",            "$student.grade" }
                }),

                // Sort by student name then checkout date
                new BsonDocument("$sort", new BsonDocument
                {
                    { "studentLastName",  1 },
                    { "studentFirstName", 1 },
                    { "checkedOutDate",   1 }
                })
            };

            var collection = _mongoDatabase.GetCollection<BsonDocument>("bookscheckedout");
            var docs = await collection.Aggregate<BsonDocument>(pipeline).ToListAsync();
            var results = new List<MissingCheckinReportItem>();
            foreach (var doc in docs)
            {
                results.Add(new MissingCheckinReportItem
                {
                    BookCopyBarCode  = BsonToString(doc.GetValue("bookCopyBarCode", BsonNull.Value)),
                    CheckedOutDate   = doc.Contains("checkedOutDate") && doc["checkedOutDate"].IsValidDateTime
                        ? doc["checkedOutDate"].ToUniversalTime()
                        : DateTime.MinValue,
                    StudentFirstName = BsonToString(doc.GetValue("studentFirstName", BsonNull.Value)),
                    StudentLastName  = BsonToString(doc.GetValue("studentLastName",  BsonNull.Value)),
                    BookTitle        = BsonToString(doc.GetValue("bookTitle",        BsonNull.Value)),
                    ReadingLevel     = BsonToString(doc.GetValue("readingLevel",     BsonNull.Value)),
                    BoxNumber        = BsonToString(doc.GetValue("boxNumber",        BsonNull.Value)),
                    StudentBarCode   = BsonToString(doc.GetValue("studentBarCode",   BsonNull.Value)),
                    TeacherName      = BsonToString(doc.GetValue("teacherName",      BsonNull.Value)),
                    Grade            = BsonToString(doc.GetValue("grade",            BsonNull.Value))
                });
            }
            return results;
        }

        private static string BsonToString(BsonValue value)
            => ReportsBsonHelper.BsonToString(value);

        private string GetReadingLevel(BsonDocument doc, string field)
            => ReportsBsonHelper.GetFirstArrayFieldString(doc, field, "guidedReadingLevel");

        [Authorize(AuthenticationSchemes = "Bearer", Policy = "AdminUser")]
        [HttpGet("yearendcheckins")]
        public async Task<IActionResult> GetYearEndCheckins()
        {
            var results = await RunYearEndCheckinsReport();
            return Ok(new { Data = results });
        }

        [Authorize(AuthenticationSchemes = "Bearer", Policy = "AdminUser")]
        [HttpGet("yearendcheckins/export")]
        public async Task<IActionResult> ExportYearEndCheckins()
        {
            var results = await RunYearEndCheckinsReport();
            var csv = GenerateCsv(results);
            var bytes = Encoding.UTF8.GetBytes(csv);
            return File(bytes, "text/csv", "year-end-checkins-report.csv");
        }

        private async Task<List<YearEndCheckinReportItem>> RunYearEndCheckinsReport()
        {
            var oneMonthAgo = new BsonDateTime(DateTime.UtcNow.AddDays(-30));

            var pipeline = new[]
            {
                // Only records checked in within the last 30 days
                new BsonDocument("$match", new BsonDocument("checkedInDate", new BsonDocument
                {
                    { "$ne", BsonNull.Value },
                    { "$gte", oneMonthAgo }
                })),

                // Sort descending so $first in group gives the most recent date
                new BsonDocument("$sort", new BsonDocument("checkedInDate", -1)),

                // Group by student; capture most recent check-in date
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$studentBarCode" },
                    { "lastCheckedInDate", new BsonDocument("$first", "$checkedInDate") }
                }),

                // Join student info (students is a view over classes)
                new BsonDocument("$lookup", new BsonDocument
                {
                    { "from", "students" },
                    { "localField", "_id" },
                    { "foreignField", "_id" },
                    { "as", "studentInfo" }
                }),

                new BsonDocument("$unwind", new BsonDocument
                {
                    { "path", "$studentInfo" },
                    { "preserveNullAndEmptyArrays", false }
                }),

                // Find any currently open checkouts for this student
                new BsonDocument("$lookup", new BsonDocument
                {
                    { "from", "currentreservations" },
                    { "let", new BsonDocument("studentId", "$_id") },
                    { "pipeline", new BsonArray
                        {
                            new BsonDocument("$match", new BsonDocument("$expr",
                                new BsonDocument("$and", new BsonArray
                                {
                                    new BsonDocument("$eq", new BsonArray { "$studentBarCode", "$$studentId" }),
                                    new BsonDocument("$eq", new BsonArray { "$checkedInDate", BsonNull.Value })
                                }))),
                            new BsonDocument("$limit", 1)
                        }
                    },
                    { "as", "openCheckouts" }
                }),

                // Keep only students with no open checkouts
                new BsonDocument("$match", new BsonDocument("openCheckouts",
                    new BsonDocument("$size", 0))),

                new BsonDocument("$project", new BsonDocument
                {
                    { "teacherName", "$studentInfo.teacherName" },
                    { "grade", "$studentInfo.grade" },
                    { "firstName", "$studentInfo.firstName" },
                    { "lastName", "$studentInfo.lastName" },
                    { "lastCheckedInDate", 1 }
                }),

                new BsonDocument("$sort", new BsonDocument
                {
                    { "grade", 1 },
                    { "teacherName", 1 },
                    { "lastName", 1 },
                    { "firstName", 1 }
                })
            };

            var collection = _mongoDatabase.GetCollection<BsonDocument>("currentreservations");
            var docs = await collection.Aggregate<BsonDocument>(pipeline).ToListAsync();
            var results = new List<YearEndCheckinReportItem>();
            foreach (var doc in docs)
            {
                results.Add(new YearEndCheckinReportItem
                {
                    TeacherName = BsonToString(doc.GetValue("teacherName", BsonNull.Value)),
                    Grade       = BsonToString(doc.GetValue("grade", BsonNull.Value)),
                    LastName    = BsonToString(doc.GetValue("lastName", BsonNull.Value)),
                    FirstName   = BsonToString(doc.GetValue("firstName", BsonNull.Value)),
                    LastCheckedInDate = doc.Contains("lastCheckedInDate") && doc["lastCheckedInDate"].IsValidDateTime
                        ? doc["lastCheckedInDate"].ToUniversalTime()
                        : DateTime.MinValue
                });
            }
            return results;
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

        private string GenerateCsv(List<YearEndCheckinReportItem> items)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Teacher,Grade,Last Name,First Name,Last Checked In Date");
            foreach (var item in items)
            {
                sb.AppendLine($"{Escape(item.TeacherName)},{Escape(item.Grade)},{Escape(item.LastName)},{Escape(item.FirstName)},{item.LastCheckedInDate:MM/dd/yyyy}");
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
