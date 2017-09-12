using System.Collections.Generic;
using Microsoft.AspNet.Identity;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.IdGenerators;

namespace AspnetCore.Identity.MongoDb.Entities
{
  public class Volunteer : IUser<string>
  {
    public Volunteer()
    {
      Id = ObjectId.GenerateNewId().ToString();
    }

    [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
    public string Id { get; set; }
    public string UserName { get; set; }
    public string NormalizedUserName { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Phone { get; set; }
    public string PasswordHash { get; set; }
    public List<VolunteerForClass> VolunteerForClasses { get; set; } = new List<VolunteerForClass>();
  }
}