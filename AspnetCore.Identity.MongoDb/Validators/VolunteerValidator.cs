using System;
using AspnetCore.Identity.MongoDb.Entities;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;

namespace AspnetCore.Identity.MongoDb.Validators
{
  public class VolunteerValidator : IUserValidator<Volunteer>
  {
    public VolunteerValidator()
    {
    }

    public Task<IdentityResult> ValidateAsync(UserManager<Volunteer> userManager, Volunteer volunteer)
    {
      return Task.FromResult(IdentityResult.Success);
    }
  }
}
