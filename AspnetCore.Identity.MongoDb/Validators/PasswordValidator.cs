using System;
using System.Threading.Tasks;
using AspnetCore.Identity.MongoDb.Entities;
using Microsoft.AspNetCore.Identity;

namespace AspnetCore.Identity.MongoDb.Validators
{
  public class PasswordValidator : IPasswordValidator<Volunteer>
  {
    public PasswordValidator()
    {
    }

    public Task<IdentityResult> ValidateAsync(UserManager<Volunteer> manager, Volunteer user, string password)
    {
      return Task.FromResult(IdentityResult.Success);
    }
  }
}
