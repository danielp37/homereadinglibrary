using System;
using System.Threading.Tasks;
using AspnetCore.Identity.MongoDb.Entities;
using MongoDB.Driver;

namespace AspnetCore.Identity.MongoDb.Stores
{
  public class VolunteerLogonStore : IVolunteerLogonStore
  {
    readonly IMongoDatabase _mongoDatabase;
    readonly IMongoCollection<VolunteerLogon> _volunteerCollection;

    public VolunteerLogonStore(IMongoDatabase mongoDatabase)
    {
      _mongoDatabase = mongoDatabase;
      _volunteerCollection = _mongoDatabase.GetCollection<VolunteerLogon>("volunteerlogons");
    }

    public Task RecordSuccessfulLoginAsync(string volunteerId, string attemptedUsername)
    {
      return InsertLogonForVolunteer(volunteerId, attemptedUsername, LogonStatus.Success);
    }

    public Task RecordFailedLoginAsync(string volunteerId, string attemptedUsername, string failureNotes)
    {
      return InsertLogonForVolunteer(volunteerId, attemptedUsername, LogonStatus.Failed, failureNotes);
    }

    private Task InsertLogonForVolunteer(string volunteerId, string attemptedUsername
                                         , LogonStatus status, string failureNotes = null)
    {
      return _volunteerCollection.InsertOneAsync(new VolunteerLogon
      {
        VolunteerId = volunteerId,
        AttemptedUsername = attemptedUsername,
        LogonTime = DateTime.UtcNow,
        Status = status,
        Notes = failureNotes
      });
    }
  }
}
