using System;
using System.Collections.Generic;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.IdGenerators;

namespace HomeReadingLibrary.Domain.Entities
{
  public class ClassWithVolunteers
  {
    [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
    public string ClassId { get; set; }
    public string TeacherName { get; set; }
    public byte Grade { get; set; }
    public List<VolunteerForClass> Volunteers { get; set; } = new List<VolunteerForClass>();
  }
}
