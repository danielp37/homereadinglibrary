using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using ClosedXML.Excel;
using HomeReadingLibrary.Controllers.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace HomeReadingLibrary.Controllers.Tests
{
    public class UploadControllerAttributeTests
    {
        [Fact]
        public void Controller_HasAuthorizeWithBearerAndAdminUser()
        {
            var attr = typeof(UploadController).GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("Bearer", attr.AuthenticationSchemes);
            Assert.Equal("AdminUser", attr.Policy);
        }

        [Fact]
        public void Controller_HasRoutePrefixApiUpload()
        {
            var attr = typeof(UploadController).GetCustomAttribute<RouteAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("api/upload", attr.Template);
        }

        [Fact]
        public void UploadStudents_HasHttpPostStudents()
        {
            var method = typeof(UploadController).GetMethod("UploadStudents");
            var attr = method.GetCustomAttribute<HttpPostAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("students", attr.Template);
        }

        [Fact]
        public void UploadVolunteers_HasHttpPostVolunteers()
        {
            var method = typeof(UploadController).GetMethod("UploadVolunteers");
            var attr = method.GetCustomAttribute<HttpPostAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("volunteers", attr.Template);
        }
    }

    public class UploadControllerParseWorksheetTests
    {
        private static IFormFile BuildFormFile(Action<IXLWorksheet> populate)
        {
            using var workbook = new XLWorkbook();
            var sheet = workbook.Worksheets.Add("Sheet1");
            populate(sheet);

            var ms = new MemoryStream();
            workbook.SaveAs(ms);
            ms.Position = 0;

            var formFile = new FormFile(ms, 0, ms.Length, "file", "upload.xlsx")
            {
                Headers = new HeaderDictionary(),
                ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            };
            return formFile;
        }

        [Fact]
        public void ParseWorksheet_SkipsHeaderRow()
        {
            var file = BuildFormFile(sheet =>
            {
                sheet.Cell(1, 1).Value = "Teacher Name";
                sheet.Cell(1, 2).Value = "LastName";
                sheet.Cell(1, 3).Value = "FirstName";
                sheet.Cell(2, 1).Value = "Mrs. Smith";
                sheet.Cell(2, 2).Value = "Jones";
                sheet.Cell(2, 3).Value = "Alice";
            });

            var rows = UploadController.ParseWorksheet(file, expectedColumns: 3);

            Assert.NotNull(rows);
            Assert.Single(rows);
            Assert.Equal("Mrs. Smith", rows[0][0]);
            Assert.Equal("Jones",     rows[0][1]);
            Assert.Equal("Alice",     rows[0][2]);
        }

        [Fact]
        public void ParseWorksheet_ReturnsAllDataRows()
        {
            var file = BuildFormFile(sheet =>
            {
                sheet.Cell(1, 1).Value = "LastName";
                sheet.Cell(1, 2).Value = "FirstName";
                sheet.Cell(1, 3).Value = "Phone";
                sheet.Cell(2, 1).Value = "Smith";
                sheet.Cell(2, 2).Value = "John";
                sheet.Cell(2, 3).Value = "555-1234";
                sheet.Cell(3, 1).Value = "Brown";
                sheet.Cell(3, 2).Value = "Jane";
                sheet.Cell(3, 3).Value = "555-5678";
            });

            var rows = UploadController.ParseWorksheet(file, expectedColumns: 3);

            Assert.Equal(2, rows.Count);
        }

        [Fact]
        public void ParseWorksheet_ReturnsNullForInvalidFile()
        {
            var ms = new MemoryStream(new byte[] { 0x00, 0x01, 0x02 });
            var badFile = new FormFile(ms, 0, ms.Length, "file", "bad.xlsx");

            var rows = UploadController.ParseWorksheet(badFile, expectedColumns: 3);

            Assert.Null(rows);
        }

        [Fact]
        public void ParseWorksheet_EmptySheetReturnsEmptyList()
        {
            var file = BuildFormFile(sheet =>
            {
                sheet.Cell(1, 1).Value = "Header";
            });

            var rows = UploadController.ParseWorksheet(file, expectedColumns: 1);

            Assert.NotNull(rows);
            Assert.Empty(rows);
        }
    }

    public class UploadControllerTryParseDayOfWeekTests
    {
        [Theory]
        [InlineData("Monday",    DayOfWeek.Monday)]
        [InlineData("TUESDAY",   DayOfWeek.Tuesday)]
        [InlineData("wednesday", DayOfWeek.Wednesday)]
        [InlineData("Thursday",  DayOfWeek.Thursday)]
        [InlineData("friday",    DayOfWeek.Friday)]
        public void TryParseDayOfWeek_RecognisesValidDays(string input, DayOfWeek expected)
        {
            var result = UploadController.TryParseDayOfWeek(input, out var day);
            Assert.True(result);
            Assert.Equal(expected, day);
        }

        [Theory]
        [InlineData("Mon")]
        [InlineData("Weekday")]
        [InlineData("")]
        [InlineData("8")]
        public void TryParseDayOfWeek_ReturnsFalseForInvalidInput(string input)
        {
            var result = UploadController.TryParseDayOfWeek(input, out _);
            Assert.False(result);
        }
    }
}
