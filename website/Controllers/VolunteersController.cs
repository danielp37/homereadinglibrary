using System.Threading.Tasks;
using AspnetCore.Identity.MongoDb.Entities;
using aspnetcore_spa.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace aspnetcore_spa.Controllers
{
  [Authorize]
  [Route("api/volunteers")]
  public class VolunteersController : Controller
  {
    private readonly IMongoDatabase mongodb;
    private readonly UserManager<Volunteer> userManager;
    readonly SignInManager<Volunteer> signInManager;

    public VolunteersController(IMongoDatabase mongodb
                               , UserManager<Volunteer> userManager
                               , SignInManager<Volunteer> signInManager)
    {
      this.signInManager = signInManager;
      this.userManager = userManager;
      this.mongodb = mongodb;
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
          UserName = model.Username,
          Phone = model.Phone
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

    public class RegisterVolunteerModel
    {
      public string FirstName { get; set; }
      public string LastName { get; set; }
      public string Username { get; set; }
      public string Phone { get; set; }
    }

    public class LoginVolunteerModel
    {
      public string VolunteerId { get; set; }
      public string Password { get; set; }
    }
  }
}