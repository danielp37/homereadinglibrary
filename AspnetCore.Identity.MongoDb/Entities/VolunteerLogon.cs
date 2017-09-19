using System;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.IdGenerators;

namespace AspnetCore.Identity.MongoDb.Entities
{
  public class VolunteerLogon
  {
    [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
    public string Id { get; set; }
    public string VolunteerId { get; set; }
    public string AttemptedUsername { get; set; }
    public DateTime LogonTime { get; set; }
    public LogonStatus Status { get; set; }
    public string Notes { get; set; }
  }
}
