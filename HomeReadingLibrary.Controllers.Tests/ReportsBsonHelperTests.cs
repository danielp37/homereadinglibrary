using System;
using HomeReadingLibrary.Controllers.Controllers;
using MongoDB.Bson;
using Xunit;

namespace HomeReadingLibrary.Controllers.Tests
{
    public class ReportsBsonHelperTests
    {
        // --- BsonToString ---

        [Fact]
        public void BsonToString_NullInput_ReturnsNull()
        {
            var result = ReportsBsonHelper.BsonToString(null);
            Assert.Null(result);
        }

        [Fact]
        public void BsonToString_BsonNull_ReturnsNull()
        {
            var result = ReportsBsonHelper.BsonToString(BsonNull.Value);
            Assert.Null(result);
        }

        [Fact]
        public void BsonToString_BsonString_ReturnsStringValue()
        {
            var result = ReportsBsonHelper.BsonToString(new BsonString("hello"));
            Assert.Equal("hello", result);
        }

        [Fact]
        public void BsonToString_BsonInt32_ReturnsStringRepresentation()
        {
            // BsonValue.AsString would throw on non-string; .ToString() fallback must be used
            var result = ReportsBsonHelper.BsonToString(new BsonInt32(42));
            Assert.Equal("42", result);
        }

        [Fact]
        public void BsonToString_BsonDouble_ReturnsStringRepresentation()
        {
            var result = ReportsBsonHelper.BsonToString(new BsonDouble(3.14));
            Assert.NotNull(result);
            Assert.Contains("3.14", result);
        }

        // --- GetFirstArrayFieldString ---

        [Fact]
        public void GetFirstArrayFieldString_FieldMissingFromDoc_ReturnsNull()
        {
            var doc = new BsonDocument();
            var result = ReportsBsonHelper.GetFirstArrayFieldString(doc, "student", "firstName");
            Assert.Null(result);
        }

        [Fact]
        public void GetFirstArrayFieldString_FieldNotAnArray_ReturnsNull()
        {
            var doc = new BsonDocument { { "student", new BsonString("not-an-array") } };
            var result = ReportsBsonHelper.GetFirstArrayFieldString(doc, "student", "firstName");
            Assert.Null(result);
        }

        [Fact]
        public void GetFirstArrayFieldString_EmptyArray_ReturnsNull()
        {
            var doc = new BsonDocument { { "student", new BsonArray() } };
            var result = ReportsBsonHelper.GetFirstArrayFieldString(doc, "student", "firstName");
            Assert.Null(result);
        }

        [Fact]
        public void GetFirstArrayFieldString_ArrayDocMissingTargetField_ReturnsNull()
        {
            var arr = new BsonArray { new BsonDocument { { "lastName", "Smith" } } };
            var doc = new BsonDocument { { "student", arr } };
            var result = ReportsBsonHelper.GetFirstArrayFieldString(doc, "student", "firstName");
            Assert.Null(result);
        }

        [Fact]
        public void GetFirstArrayFieldString_ArrayDocWithStringField_ReturnsValue()
        {
            var arr = new BsonArray { new BsonDocument { { "firstName", "Jane" } } };
            var doc = new BsonDocument { { "student", arr } };
            var result = ReportsBsonHelper.GetFirstArrayFieldString(doc, "student", "firstName");
            Assert.Equal("Jane", result);
        }

        [Fact]
        public void GetFirstArrayFieldString_ArrayDocWithIntField_ReturnsStringRepresentation()
        {
            // Handles non-string fields gracefully via BsonToString fallback
            var arr = new BsonArray { new BsonDocument { { "grade", new BsonInt32(3) } } };
            var doc = new BsonDocument { { "student", arr } };
            var result = ReportsBsonHelper.GetFirstArrayFieldString(doc, "student", "grade");
            Assert.Equal("3", result);
        }
    }
}
