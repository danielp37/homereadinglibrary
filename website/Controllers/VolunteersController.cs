using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AspnetCore.Identity.MongoDb.Entities;
using AspnetCore.Identity.MongoDb.JwtModels;
using website.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace aspnetcore_spa.Controllers
{
  [Authorize]
  [Route("api/volunteers")]
  public class VolunteersController : Controller
  {
    private readonly IMongoDatabase mongodb;
    private readonly UserManager<Volunteer> userManager;
    readonly IJwtFactory jwtFactory;
    readonly JwtIssuerOptions jwtOptions;

    public VolunteersController(IMongoDatabase mongodb
                               , UserManager<Volunteer> userManager
                               , IJwtFactory jwtFactory
                               , IOptions<JwtIssuerOptions> jwtOptions)
    {
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
          ModelState.AddModelError("login_failure", "Invalid username or password");
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
            return jwtFactory.GenerateClaimsIdentity(userToVerify.UserName, userToVerify.Id, userToVerify);
          }
        }
      }

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