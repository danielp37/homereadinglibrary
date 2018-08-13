using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AspnetCore.Identity.MongoDb.Entities;
using AspnetCore.Identity.MongoDb.JwtModels;
using HomeReadingLibrary.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using AspnetCore.Identity.MongoDb.Stores;
using System.ComponentModel.DataAnnotations;

namespace HomeReadingLibrary.Controllers.Controllers
{
  [Authorize]
  [Route("api/volunteers")]
  public class VolunteersController : Controller
  {
    private readonly IMongoDatabase mongodb;
    private readonly UserManager<Volunteer> userManager;
    readonly IJwtFactory jwtFactory;
    readonly JwtIssuerOptions jwtOptions;
    readonly IVolunteerLogonStore volunteerLogonStore;

    public VolunteersController(IMongoDatabase mongodb
                               , UserManager<Volunteer> userManager
                               , IVolunteerLogonStore volunteerLogonStore
                               , IJwtFactory jwtFactory
                               , IOptions<JwtIssuerOptions> jwtOptions)
    {
      this.volunteerLogonStore = volunteerLogonStore;
      this.jwtOptions = jwtOptions.Value;
      this.jwtFactory = jwtFactory;
      this.userManager = userManager;
      this.mongodb = mongodb;
    }

    [AllowAnonymous]
    [HttpGet("byclass")]
    public async Task<IActionResult> GetVolunteersByClass()
    {
      var collection = mongodb.GetCollection<ClassWithVolunteers>("volunteersByClass");

      var classes = await (await collection.FindAsync(new BsonDocument())).ToListAsync();

      return Ok(new { Data = classes });
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Register([FromBody]RegisterVolunteerModel model)
    {
      if(ModelState.IsValid)
      {
        var newVolunteer = new Volunteer
        {
          FirstName = model.FirstName,
          LastName = model.LastName,
          UserName = model.Email,
          Phone = model.Phone,
          VolunteerForClasses = model.VolunteerForClasses.Select(v4c => new AspnetCore.Identity.MongoDb.Entities.VolunteerForClass
          {
            ClassId = v4c.ClassId,
            DayOfWeek = v4c.DayOfWeek
          }).ToList()
        };
        var result = await userManager.CreateAsync(newVolunteer);

        if(result.Succeeded)
        {
          return Ok(newVolunteer); 
        }
        else
        {
          return BadRequest(result);
        }
      }

      return BadRequest(ModelState);
    }

    [AllowAnonymous]
    [HttpPost("admin")]
    public async Task<IActionResult> RegisterAdmin([FromBody]RegisterVolunteerModel model)
    {
      if (ModelState.IsValid)
      {
        var newVolunteer = new Volunteer
        {
          FirstName = model.FirstName,
          LastName = model.LastName,
          UserName = model.Email,
          Phone = model.Phone,
          IsAdmin = true
        };
        var result = await userManager.CreateAsync(newVolunteer);

        if (result.Succeeded)
        {
          await userManager.AddPasswordAsync(newVolunteer, model.Password);

          return Ok(newVolunteer);
        }
        else
        {
          return BadRequest(result);
        }
      }

      return BadRequest(ModelState);
    }

    [AllowAnonymous]
    [HttpPost("jwtlogin")]
    public async Task<IActionResult> LoginJwt([FromBody]LoginVolunteerModel model)
    {
      if (ModelState.IsValid)
      {
        var identity = await GetClaimsIdentity(model.VolunteerId, model.Username, model.Password);
        if (identity == null)
        {
          const string invalidUsernameOrPassword = "Invalid username or password";
          ModelState.AddModelError("login_failure", invalidUsernameOrPassword);
          return BadRequest(ModelState);
        }

        var id = identity.Claims.Single(c => c.Type == "id").Value;
        var response = new
        {
          id = id,
          auth_token = await jwtFactory.GenerateEncodedToken(id, identity),
          expires_in = (int)jwtOptions.ValidFor.TotalSeconds
        };

        return Ok(response);
      }

      return BadRequest(ModelState);
    }

    //[Authorize(Policy = "AdminOnly")]
    [AllowAnonymous]
    [HttpGet("logons")]
    public async Task<IActionResult> VolunteerLogonsSinceDate([FromQuery][Required]int? daysBack)
    {
      if (ModelState.IsValid)
      {
        var volunteerLogons = mongodb.GetCollection<VolunteerLogon>("volunteerlogons");

        var volunteersWithLogonsQuery = volunteerLogons.Aggregate()
                       .Match(
                          Builders<VolunteerLogon>.Filter.Gte(vl => vl.LogonTime, DateTime.UtcNow.Date.AddDays(-daysBack.Value)) &
                          Builders<VolunteerLogon>.Filter.Eq(vl => vl.Status, LogonStatus.Success) &
                          Builders<VolunteerLogon>.Filter.Ne(vl => vl.VolunteerId, null)
                        )
                       .Lookup("volunteers", "volunteerId", "_id", "volunteer")
                       .Unwind("volunteer")
                       .Unwind("volunteer.volunteerForClasses")
                       .Lookup("classes", "volunteer.volunteerForClasses.classId", "_id", "class")
                       .Group(@"{_id : { volunteerId: '$volunteerId', firstName: '$volunteer.firstName', lastName: '$volunteer.lastName', class: '$class.teacherName', grade: '$class.grade' }, 
                    logons : { $addToSet: {
                            logonTime: ""$logonTime"",
                            dayOfWeek: { $dayOfWeek: ""$logonTime"" }
                    }},
                    firstLoginDate : { $first: '$logonTime'},
                    lastLoginDate : { $last: '$logonTime'}}")
                       .Project<VolunteerWithLogons>(
                          @"{
                              '_id' : 0,
                              'volunteerId' : '$_id.volunteerId',
                              'firstName' : '$_id.firstName',
                              'lastName' : '$_id.lastName',
                              'classes' : '$_id.class',
                              'grades' : '$_id.grade',
                              'logons' : 1,
                              'firstLoginDate' : 1,
                              'lastLoginDate' : 1
                            }");  
        var volunteersWithLogons = await volunteersWithLogonsQuery
                       .ToListAsync();

        return Ok(volunteersWithLogons);
      }

      return BadRequest(ModelState);
    }

    private async Task<ClaimsIdentity> GetClaimsIdentity(string userId, string username, string password)
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
            return jwtFactory.GenerateClaimsIdentity(userToVerify.UserName, userToVerify.Id, userToVerify);
          }
          else
          {
            await volunteerLogonStore.RecordFailedLoginAsync(userId, username, "Invalid Password");
            return null;
          }
        }
      }

      await volunteerLogonStore.RecordFailedLoginAsync(userId, username, "Invalid UserId or Username");
      // Credentials are invalid, or account doesn't exist
      return null;
    }

    private async Task<Volunteer> GetUserToVerify(string userId, string username)
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

    public class RegisterVolunteerModel
    {
      public string FirstName { get; set; }
      public string LastName { get; set; }
      public string Email { get; set; }
      public string Phone { get; set; }
      public string Password { get; set; }
      public List<RegisterVolunteerForClass> VolunteerForClasses { get; set; } = new List<RegisterVolunteerForClass>();
    }

    public class RegisterVolunteerForClass
    {
      public string ClassId { get; set; }
      public DayOfWeek DayOfWeek { get; set; }
    }

    public class LoginVolunteerModel
    {
      public string VolunteerId { get; set; }
      public string Username { get; set; }
      public string Password { get; set; }
    }

  }
}