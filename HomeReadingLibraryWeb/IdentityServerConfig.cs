﻿using IdentityServer4.Models;
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
              "http://localhost:5000/home",
              "https://localhost:5001/home",
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

    public static IEnumerable<ApiScope> ApiScopes = new List<ApiScope>
    {
      new ApiScope("library"),
      new ApiScope("library.VolunteerAccess"),
      new ApiScope("library.AdminAccess")
    };

    public static IEnumerable<ApiResource> Apis = new List<ApiResource>
        {
            new ApiResource("library", "Book Checkout and Checkin API")
            {
              UserClaims = new [] { "role" },
              Scopes = new [] { "library.VolunteerAccess", "library.AdminAccess" }
            }
        };
  }
}
