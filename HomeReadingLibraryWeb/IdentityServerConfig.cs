using IdentityServer4.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HomeReadingLibraryWeb
{
  public class IdentityServerConfig
  {
    public static IEnumerable<Client> Clients =>
      new[]
      {
        new Client
        {
          ClientId = "spa",
          AllowedGrantTypes = GrantTypes.Implicit,
          AllowAccessTokensViaBrowser = true,
          RedirectUris = {
              "http://localhost:5000/checkin",
              "https://localhost:5001/checkin",
          },
          RequireConsent = false,
          PostLogoutRedirectUris = {
            "http://localhost:5000/home",
            "https://localhost:5001/home"
          },
          AllowedScopes = { "openid", "profile", "email", "LoginRole", "library", "library.VolunteerAccess", "library.AdminAccess" },
          AlwaysIncludeUserClaimsInIdToken = true,
          UpdateAccessTokenClaimsOnRefresh = true,
          //AllowedCorsOrigins = { "http://localhost:5000" }
        }
      };

    public static IEnumerable<IdentityResource> IdentityResources = new List<IdentityResource>
        {
            new IdentityResources.OpenId(),
            new IdentityResources.Profile(),
            new IdentityResources.Email(),
            new IdentityResource("LoginRole", new [] {"role"})
        };

    public static IEnumerable<ApiResource> Apis = new List<ApiResource>
        {
            new ApiResource("library", "Book Checkout and Checkin API")
            {
              UserClaims = new [] { "role" },
              Scopes =
              {
                new Scope("library.VolunteerAccess", "Volunteer Access") { ShowInDiscoveryDocument = true },
                new Scope("library.AdminAccess", "Admin Access")
              }
            }
        };
  }
}
