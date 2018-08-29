using AspnetCore.Identity.MongoDb.Entities;
using IdentityModel;
using IdentityServer4.Extensions;
using IdentityServer4.Models;
using IdentityServer4.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace AspnetCore.Identity.MongoDb.Services
{
  public class VolunteerProfileService : IProfileService
  {
    private readonly ILogger<VolunteerProfileService> logger;
    private readonly IUserStore<Volunteer> volunteerStore;

    public VolunteerProfileService(ILogger<VolunteerProfileService> logger, IUserStore<Volunteer> volunteerStore)
    {
      this.logger = logger;
      this.volunteerStore = volunteerStore;
    }

    public async Task GetProfileDataAsync(ProfileDataRequestContext context)
    {
      context.LogProfileRequest(logger);

      if (context.RequestedClaimTypes.Any())
      {
        var user = await volunteerStore.FindByIdAsync(context.Subject.GetSubjectId(), CancellationToken.None);
        if (user != null)
        {
          var requestedClaims = new List<Claim>();
          foreach (var claimType in context.RequestedClaimTypes)
          {
            logger.LogDebug("Requesting ClaimType: {claimType}", claimType);
            switch (claimType)
            {
              case JwtClaimTypes.Subject:
                requestedClaims.Add(new Claim(claimType, user.Id));
                break;
              case JwtClaimTypes.Name:
                requestedClaims.Add(new Claim(claimType, user.FullName));
                break;
              case JwtClaimTypes.FamilyName:
                requestedClaims.Add(new Claim(claimType, user.LastName));
                break;
              case JwtClaimTypes.GivenName:
                requestedClaims.Add(new Claim(claimType, user.FirstName));
                break;
              case JwtClaimTypes.PreferredUserName:
                requestedClaims.Add(new Claim(claimType, user.UserName));
                break;
              case JwtClaimTypes.Role:
                if(user.IsAdmin)
                {
                  requestedClaims.Add(new Claim(claimType, "AdminAccess"));
                }
                requestedClaims.Add(new Claim(claimType, "VolunteerAccess"));
                break;
            }
          }
          context.AddRequestedClaims(requestedClaims);
        }
      }

      context.LogIssuedClaims(logger);
    }

    public async Task IsActiveAsync(IsActiveContext context)
    {
      logger.LogDebug("IsActive called from: {caller}", context.Caller);

      var user = await volunteerStore.FindByIdAsync(context.Subject.GetSubjectId(), CancellationToken.None);
      context.IsActive = user != null;
    }
  }
}
