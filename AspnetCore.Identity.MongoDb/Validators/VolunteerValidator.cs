using System;
using AspnetCore.Identity.MongoDb.Entities;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace AspnetCore.Identity.MongoDb.Validators
{
  public class VolunteerValidator : IUserValidator<Volunteer>
  {

    public Task<IdentityResult> ValidateAsync(UserManager<Volunteer> userManager, Volunteer volunteer)
    {
      var errors = new List<IdentityError>();
      var errorDescriber = new IdentityErrorDescriber();
      if(string.IsNullOrWhiteSpace(volunteer.UserName))
      {
        errors.Add(errorDescriber.InvalidEmail(volunteer.UserName)) ;
      }
      return errors.Any() ? 
                   Task.FromResult(IdentityResult.Failed(errors.ToArray())) :
                   Task.FromResult(IdentityResult.Success);
    }
  }
}
