using System.Linq;
using System.Reflection;
using HomeReadingLibrary.Controllers.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace HomeReadingLibrary.Controllers.Tests
{
    public class ReportsControllerAttributeTests
    {
        private readonly MethodInfo _getMissingCheckins;
        private readonly MethodInfo _getEndOfYearStudents;
        private readonly MethodInfo _getYearEndCheckins;
        private readonly MethodInfo _exportYearEndCheckins;
        private readonly MethodInfo _getBookCopyCounts;
        private readonly MethodInfo _exportBookCopyCounts;
        private readonly MethodInfo _getBookTitlesPerLevel;
        private readonly MethodInfo _exportBookTitlesPerLevel;

        public ReportsControllerAttributeTests()
        {
            _getMissingCheckins   = typeof(ReportsController).GetMethod("GetMissingCheckins");
            _getEndOfYearStudents = typeof(ReportsController).GetMethod("GetEndOfYearStudents");
            _getYearEndCheckins   = typeof(ReportsController).GetMethod("GetYearEndCheckins");
            _exportYearEndCheckins = typeof(ReportsController).GetMethod("ExportYearEndCheckins");
            _getBookCopyCounts     = typeof(ReportsController).GetMethod("GetBookCopyCounts");
            _exportBookCopyCounts  = typeof(ReportsController).GetMethod("ExportBookCopyCounts");
            _getBookTitlesPerLevel = typeof(ReportsController).GetMethod("GetBookTitlesPerLevel");
            _exportBookTitlesPerLevel = typeof(ReportsController).GetMethod("ExportBookTitlesPerLevel");
        }

        [Fact]
        public void GetMissingCheckins_HasHttpGetMissingcheckins()
        {
            var attr = _getMissingCheckins.GetCustomAttribute<HttpGetAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("missingcheckins", attr.Template);
        }

        [Fact]
        public void GetMissingCheckins_HasAuthorizeWithBearerAndAdminUser()
        {
            var attr = _getMissingCheckins.GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("Bearer", attr.AuthenticationSchemes);
            Assert.Equal("AdminUser", attr.Policy);
        }

        [Fact]
        public void GetEndOfYearStudents_HasAuthorizeWithBearerAndAdminUser()
        {
            var attr = _getEndOfYearStudents.GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("Bearer", attr.AuthenticationSchemes);
            Assert.Equal("AdminUser", attr.Policy);
        }

        [Fact]
        public void GetYearEndCheckins_HasHttpGetYearendcheckins()
        {
            var attr = _getYearEndCheckins.GetCustomAttribute<HttpGetAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("yearendcheckins", attr.Template);
        }

        [Fact]
        public void GetYearEndCheckins_HasAuthorizeWithBearerAndAdminUser()
        {
            var attr = _getYearEndCheckins.GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("Bearer", attr.AuthenticationSchemes);
            Assert.Equal("AdminUser", attr.Policy);
        }

        [Fact]
        public void ExportYearEndCheckins_HasHttpGetYearendcheckinsExport()
        {
            var attr = _exportYearEndCheckins.GetCustomAttribute<HttpGetAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("yearendcheckins/export", attr.Template);
        }

        [Fact]
        public void ExportYearEndCheckins_HasAuthorizeWithBearerAndAdminUser()
        {
            var attr = _exportYearEndCheckins.GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("Bearer", attr.AuthenticationSchemes);
            Assert.Equal("AdminUser", attr.Policy);
        }

        [Fact]
        public void GetBookCopyCounts_HasHttpGetBookcopycounts()
        {
            var attr = _getBookCopyCounts.GetCustomAttribute<HttpGetAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("bookcopycounts", attr.Template);
        }

        [Fact]
        public void GetBookCopyCounts_HasAuthorizeWithBearerAndAdminUser()
        {
            var attr = _getBookCopyCounts.GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("Bearer", attr.AuthenticationSchemes);
            Assert.Equal("AdminUser", attr.Policy);
        }

        [Fact]
        public void ExportBookCopyCounts_HasHttpGetBookcopycountsExport()
        {
            var attr = _exportBookCopyCounts.GetCustomAttribute<HttpGetAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("bookcopycounts/export", attr.Template);
        }

        [Fact]
        public void ExportBookCopyCounts_HasAuthorizeWithBearerAndAdminUser()
        {
            var attr = _exportBookCopyCounts.GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("Bearer", attr.AuthenticationSchemes);
            Assert.Equal("AdminUser", attr.Policy);
        }

        [Fact]
        public void GetBookTitlesPerLevel_HasHttpGetBooktitlesperlevel()
        {
            var attr = _getBookTitlesPerLevel.GetCustomAttribute<HttpGetAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("booktitlesperlevel", attr.Template);
        }

        [Fact]
        public void GetBookTitlesPerLevel_HasAuthorizeWithBearerAndAdminUser()
        {
            var attr = _getBookTitlesPerLevel.GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("Bearer", attr.AuthenticationSchemes);
            Assert.Equal("AdminUser", attr.Policy);
        }

        [Fact]
        public void ExportBookTitlesPerLevel_HasHttpGetBooktitlesperlevelExport()
        {
            var attr = _exportBookTitlesPerLevel.GetCustomAttribute<HttpGetAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("booktitlesperlevel/export", attr.Template);
        }

        [Fact]
        public void ExportBookTitlesPerLevel_HasAuthorizeWithBearerAndAdminUser()
        {
            var attr = _exportBookTitlesPerLevel.GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(attr);
            Assert.Equal("Bearer", attr.AuthenticationSchemes);
            Assert.Equal("AdminUser", attr.Policy);
        }
    }
}
