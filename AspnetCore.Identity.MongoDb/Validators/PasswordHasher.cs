using System;
using AspnetCore.Identity.MongoDb.Entities;
using Microsoft.AspNetCore.Identity;

namespace AspnetCore.Identity.MongoDb.Validators
{
  public class PasswordHasher : IPasswordHasher<Volunteer>
  {
    public PasswordHasher()
    {
    }

    public string HashPassword(Volunteer user, string password)
    {
      throw new NotImplementedException();
    }

    public PasswordVerificationResult VerifyHashedPassword(Volunteer user, string hashedPassword, string providedPassword)
    {
      throw new NotImplementedException();
    }
  }
}
