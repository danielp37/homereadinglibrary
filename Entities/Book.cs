using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.IdGenerators;

namespace aspnetcore_spa.Entities
{
    public class Book : IAuditFields
    {
        [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
        public string Id {get; set;}
        public string Title {get; set;}
        public string Author {get; set;}
        public string PublisherText {get; set;}
        public string GuidedReadingLevel {get; set;}
        public string Isbn {get; set;}
        public string BoxNumber {get; set;}
        public DateTime CreatedDate {get;set;}
        public DateTime ModifiedDate {get; set;}

        public List<BookCopy> BookCopies {get; set;} = new List<BookCopy>();
    }
}