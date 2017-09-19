using System;
using System.Threading.Tasks;

namespace AspnetCore.Identity.MongoDb.Stores
{
  public interface IVolunteerLogonStore
  {
    Task RecordSuccessfulLoginAsync(string volunteerId, string attemptedUsername);
    Task RecordFailedLoginAsync(string volunteerId, string attemptedUsername, string failureNotes);
  }
}
