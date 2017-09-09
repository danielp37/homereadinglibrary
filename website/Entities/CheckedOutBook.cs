using System;
using MongoDB.Bson.Serialization.Attributes;

namespace homereadinglibrary.Entities
{
    public class CheckedOutBook
    {
        public string Id { get; set; }
        public DateTime CheckedOutDate { get; set; }
        public DateTime? CheckedInDate { get; set; }
        public CheckedOutBookCopy BookCopy { get; set; }
        public CheckedOutStudent Student { get; set; }

        public class CheckedOutBookCopy
        {
            [BsonElement("_id")]
            public string BookCopyBarCode { get; set; }
            public string Title {get; set;}
            public string Author {get; set;}
            public string GuidedReadingLevel {get; set;}
            public string BoxNumber { get; set; }
            public string BookId { get; set; }
        }

        public class CheckedOutStudent
        {
            [BsonElement("_id")]
            public string StudentBarCode { get; set; }
            public string TeacherName { get; set; }
            public int Grade { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string TeacherId { get; set; }
        }
    }
}