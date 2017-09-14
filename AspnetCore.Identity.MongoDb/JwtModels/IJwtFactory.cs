using System;
using System.Security.Claims;
using System.Threading.Tasks;
using AspnetCore.Identity.MongoDb.Entities;

namespace AspnetCore.Identity.MongoDb.JwtModels
{
  public interface IJwtFactory
  {
    Task<string> GenerateEncodedToken(string userName, ClaimsIdentity identity);
    ClaimsIdentity GenerateClaimsIdentity(string userName, string id, Volunteer volunteer);
  }
}
