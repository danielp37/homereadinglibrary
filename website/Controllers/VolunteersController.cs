using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AspnetCore.Identity.MongoDb.Entities;
using AspnetCore.Identity.MongoDb.JwtModels;
using aspnetcore_spa.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using website.Entities;

namespace aspnetcore_spa.Controllers
{
  [Authorize]
  [Route("api/volunteers")]
  public class VolunteersController : Controller
  {
    private readonly IMongoDatabase mongodb;
    private readonly UserManager<Volunteer> userManager;
    readonly SignInManager<Volunteer> signInManager;
    readonly IJwtFactory jwtFactory;
    readonly JwtIssuerOptions jwtOptions;

    public VolunteersController(IMongoDatabase mongodb
                               , UserManager<Volunteer> userManager
                               , SignInManager<Volunteer> signInManager
                               , IJwtFactory jwtFactory
                               , IOptions<JwtIssuerOptions> jwtOptions)
    {
      this.jwtOptions = jwtOptions.Value;
      this.jwtFactory = jwtFactory;
      this.signInManager = signInManager;
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
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody]LoginVolunteerModel model)
    {
      if(ModelState.IsValid)
      {
        var volunteer = await userManager.FindByIdAsync(model.VolunteerId);
        if (volunteer == null)
        {
          return Unauthorized();
        }
        if(string.IsNullOrWhiteSpace(model.Password))
        {
          await signInManager.SignInAsync(volunteer, false, "RegularVolunteer");
          return Ok();
        }
        else
        {
          var result = await signInManager.PasswordSignInAsync(volunteer, model.Password, false, true);
          if(result.Succeeded)
          {
            return Ok();
          }
          else if (result.IsLockedOut)
          {
            return BadRequest($"UserId {model.VolunteerId} is locked out");
          }
          else
          {
            return Unauthorized();
          }
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
        var identity = await GetClaimsIdentity(model.VolunteerId, model.Password);
        if (identity == null)
        {
          ModelState.AddModelError("login_failure", "Invalid username or password");
          return BadRequest(ModelState);
        }

        var response = new
        {
          id = identity.Claims.Single(c => c.Type == "id").Value,
          auth_token = await jwtFactory.GenerateEncodedToken(model.VolunteerId, identity),
          expires_in = (int)jwtOptions.ValidFor.TotalSeconds
        };

        return Ok(response);
      }

      return BadRequest(ModelState);
    }

    private async Task<ClaimsIdentity> GetClaimsIdentity(string userId, string password)
    {
      if (!string.IsNullOrEmpty(userId))
      {
        // get the user to verifty
        var userToVerify = await userManager.FindByIdAsync(userId);

        if (string.IsNullOrWhiteSpace(userToVerify.PasswordHash) ||
            await userManager.CheckPasswordAsync(userToVerify, password))
        {
          return jwtFactory.GenerateClaimsIdentity(userToVerify.UserName, userToVerify.Id);
        }
      }

      // Credentials are invalid, or account doesn't exist
      return null;
    }

    public class RegisterVolunteerModel
    {
      public string FirstName { get; set; }
      public string LastName { get; set; }
      public string Email { get; set; }
      public string Phone { get; set; }
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
      public string Password { get; set; }
    }

  }
}