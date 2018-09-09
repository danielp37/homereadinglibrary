using AspnetCore.Identity.MongoDb.Entities;
using AspnetCore.Identity.MongoDb.Stores;
using HomeReadingLibrary.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace HomeReadingLibrary.Domain.Services
{
  public class VolunteerService : IVolunteerService
  {
    private readonly IMongoDatabase mongodb;
    private readonly UserManager<Volunteer> userManager;
    private readonly IVolunteerLogonStore volunteerLogonStore;

    public VolunteerService(
      IMongoDatabase mongodb,
      UserManager<Volunteer> userManager,
      IVolunteerLogonStore volunteerLogonStore)
    {
      this.mongodb = mongodb;
      this.userManager = userManager;
      this.volunteerLogonStore = volunteerLogonStore;
    }

    public async Task<List<ClassWithVolunteers>> GetVolunteersByClassAsync()
    {
      var collection = mongodb.GetCollection<ClassWithVolunteers>("volunteersByClass");

      var classes = await(await collection.FindAsync(new BsonDocument())).ToListAsync();

      return classes;
    }

    public async Task<bool> ValidateCredentials(string userId, string username, string password)
    {
      if (!string.IsNullOrWhiteSpace(userId) || !string.IsNullOrWhiteSpace(username))
      {
        // get the user to verifty
        var userToVerify = await GetUserToVerify(userId, username);

        if (userToVerify != null)
        {
          if (string.IsNullOrWhiteSpace(userToVerify.PasswordHash) ||
              await userManager.CheckPasswordAsync(userToVerify, password))
          {
            await volunteerLogonStore.RecordSuccessfulLoginAsync(userId, username);
            return true;
          }
          else
          {
            await volunteerLogonStore.RecordFailedLoginAsync(userId, username, "Invalid Password");
            return false;
          }
        }
      }

      await volunteerLogonStore.RecordFailedLoginAsync(userId, username, "Invalid UserId or Username");
      // Credentials are invalid, or account doesn't exist
      return false;
    }


    public async Task<Volunteer> GetUserToVerify(string userId, string username)
    {
      if (!string.IsNullOrWhiteSpace(userId))
      {
        return await userManager.FindByIdAsync(userId);
      }
      if (!string.IsNullOrWhiteSpace(username))
      {
        return await userManager.FindByNameAsync(username);
      }
      return null;
    }
  }
}
