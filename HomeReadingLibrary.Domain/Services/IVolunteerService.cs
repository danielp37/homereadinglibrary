using AspnetCore.Identity.MongoDb.Entities;
using HomeReadingLibrary.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HomeReadingLibrary.Domain.Services
{
  public interface IVolunteerService
  {
    Task<List<ClassWithVolunteers>> GetVolunteersByClassAsync();
    Task<bool> ValidateCredentials(string userId, string username, string password);
    Task<Volunteer> GetUserToVerify(string userId, string username);
  }
}