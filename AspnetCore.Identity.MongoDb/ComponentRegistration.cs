using System;
using AspnetCore.Identity.MongoDb.Entities;
using AspnetCore.Identity.MongoDb.Stores;
using AspnetCore.Identity.MongoDb.Validators;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using MongoDB.Driver;

namespace AspnetCore.Identity.MongoDb
{
  public static class ComponentRegistration
  {
    public static void ConfigureIdentity(this IServiceCollection services)
    {
      services.AddIdentity<Volunteer, VolunteerRole>()
        .AddDefaultTokenProviders();

      // Identity Services
      services.AddSingleton<IUserStore<Volunteer>>(provider =>
      {
        return new VolunteerStore(provider.GetService<IMongoDatabase>());
      });
      services.AddSingleton<IUserPasswordStore<Volunteer>>(provider => 
      {
        return new VolunteerStore(provider.GetService<IMongoDatabase>());
      });
      services.AddTransient<IRoleStore<VolunteerRole>, VolunteerRoleStore>();

      services.ConfigureExternalCookie(cookieOptions =>
      {
        cookieOptions.LoginPath = new PathString("/api/volunteers/login");
        cookieOptions.Cookie.HttpOnly = true;
        cookieOptions.Cookie.Name = ".gchrlauth";
        cookieOptions.LogoutPath = new PathString("/api/volunteers/logout");
        cookieOptions.ExpireTimeSpan = TimeSpan.FromMinutes(30);
        cookieOptions.SlidingExpiration = true;
      });

      services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
              .AddCookie(o =>
      {
        o.LoginPath = new PathString("/signin");
        o.Cookie.HttpOnly = true;
        o.Cookie.Name = ".gchrlauth";
        o.LogoutPath = new PathString("/api/volunteers/logout");
        o.ExpireTimeSpan = TimeSpan.FromMinutes(30);
        o.SlidingExpiration = true;
        o.Events = new CookieAuthenticationEvents
        {
          OnValidatePrincipal = SecurityStampValidator.ValidatePrincipalAsync
        };
      });

      /*
      services.AddAuthentication(options => 
      {
        options.DefaultAuthenticateScheme = IdentityConstants.ApplicationScheme;
        options.DefaultChallengeScheme = IdentityConstants.ApplicationScheme;
        options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
      })
              .AddCookie(IdentityConstants.ApplicationScheme, (obj) => 
      {
        obj.LoginPath = new PathString("/api/volunteer/login");
        obj.Events = new CookieAuthenticationEvents
        {
          OnValidatePrincipal = SecurityStampValidator.ValidatePrincipalAsync
        };
      })
              .AddCookie(IdentityConstants.ExternalScheme, o =>
      {
        o.Cookie.Name = IdentityConstants.ExternalScheme;
        o.ExpireTimeSpan = TimeSpan.FromMinutes(5);
      });
      */

      // Hosting doesn't add IHttpContextAccessor by default
      services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();

      services.TryAddScoped<IUserValidator<Volunteer>, VolunteerValidator>();
      services.TryAddScoped<IPasswordValidator<Volunteer>, PasswordValidator>();
      services.TryAddScoped<IPasswordHasher<Volunteer>, PasswordHasher>();
      services.TryAddScoped<UserManager<Volunteer>, AspNetUserManager<Volunteer>>();
      services.TryAddScoped<SignInManager<Volunteer>, SignInManager<Volunteer>>();


    }
  }
}
