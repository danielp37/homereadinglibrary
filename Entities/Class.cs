using System;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.IdGenerators;

namespace aspnetcore_spa.Entities
{
    public class Class : IAuditFields
    {
        [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
        public string ClassId { get; set; }
        public string TeacherName { get; set; }
        public byte Grade { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
    }
}