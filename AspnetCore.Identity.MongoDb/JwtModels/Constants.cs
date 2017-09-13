using System;
namespace AspnetCore.Identity.MongoDb.JwtModels
{
  public static class Constants
  {
    public static class Strings
    {
      public static class JwtClaimIdentifiers
      {
        public const string Rol = "rol", Id = "id";
      }

      public static class JwtClaims
      {
        public static readonly string AdminAccess = "admin_access";
        public static readonly string VolunteerAccess = "volunteer_access";
      }
    }
  }
}
