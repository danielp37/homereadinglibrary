using System;
using System.Text;
using AspnetCore.Identity.MongoDb.Entities;
using AspnetCore.Identity.MongoDb.JwtModels;
using AspnetCore.Identity.MongoDb.Stores;
using AspnetCore.Identity.MongoDb.Validators;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.Threading.Tasks;

namespace AspnetCore.Identity.MongoDb
{
  public static class ComponentRegistration
  {
    public static void ConfigureMongoImplementation(this IServiceCollection services, IConfiguration configuration)
    {
      services.AddSingleton<IUserStore<Volunteer>>(provider =>
      {
        return new VolunteerStore(provider.GetService<IMongoDatabase>());
      });
      services.AddSingleton<IUserPasswordStore<Volunteer>>(provider =>
      {
        return new VolunteerStore(provider.GetService<IMongoDatabase>());
      });
      services.AddTransient<IRoleStore<VolunteerRole>, VolunteerRoleStore>();
      services.AddTransient<IVolunteerLogonStore, VolunteerLogonStore>();

      services.AddTransient<IJwtFactory, JwtFactory>();
      var jwtAppSettingOptions = configuration.GetSection(nameof(JwtIssuerOptions));
      var secretKey = Environment.GetEnvironmentVariable("JWT_Key");
      var signingKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey));
      services.Configure<JwtIssuerOptions>(options =>
      {
        options.Issuer = jwtAppSettingOptions[nameof(JwtIssuerOptions.Issuer)];
        options.Audience = jwtAppSettingOptions[nameof(JwtIssuerOptions.Audience)];
        options.SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
      });

      // Hosting doesn't add IHttpContextAccessor by default
      services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();

      services.TryAddScoped<IUserValidator<Volunteer>, VolunteerValidator>();
      services.TryAddScoped<IPasswordValidator<Volunteer>, PasswordValidator>();
      services.TryAddScoped<IPasswordHasher<Volunteer>, PasswordHasher>();
      services.TryAddScoped<UserManager<Volunteer>, AspNetUserManager<Volunteer>>();
      services.TryAddScoped<SignInManager<Volunteer>, SignInManager<Volunteer>>();
      services.TryAddScoped<ILookupNormalizer, UpperInvariantLookupNormalizer>();
      services.TryAddScoped<IdentityErrorDescriber>();
      services.TryAddScoped<IUserClaimsPrincipalFactory<Volunteer>, UserClaimsPrincipalFactory<Volunteer, VolunteerRole>>();
      services.TryAddScoped<RoleManager<VolunteerRole>, AspNetRoleManager<VolunteerRole>>();

    }

    public static void ConfigureIdentity(this IServiceCollection services, IConfiguration configuration)
    {
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
      services.AddTransient<IVolunteerLogonStore, VolunteerLogonStore>();

      ConfigureJwt(services, configuration);
      services.AddAuthorization(options =>
      {
        options.AddPolicy("VolunteerUser", policy => policy.RequireClaim(Constants.Strings.JwtClaimIdentifiers.Rol,
                                                                         Constants.Strings.JwtClaims.VolunteerAccess,
                                                                         Constants.Strings.JwtClaims.AdminAccess));
        options.AddPolicy("AdminUser", policy => policy.RequireClaim(Constants.Strings.JwtClaimIdentifiers.Rol,
                                                                 Constants.Strings.JwtClaims.AdminAccess));
      });

      // Hosting doesn't add IHttpContextAccessor by default
      services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();

      services.TryAddScoped<IUserValidator<Volunteer>, VolunteerValidator>();
      services.TryAddScoped<IPasswordValidator<Volunteer>, PasswordValidator>();
      services.TryAddScoped<IPasswordHasher<Volunteer>, PasswordHasher>();
      services.TryAddScoped<UserManager<Volunteer>, AspNetUserManager<Volunteer>>();
      services.TryAddScoped<SignInManager<Volunteer>, SignInManager<Volunteer>>();
      services.TryAddScoped<ILookupNormalizer, UpperInvariantLookupNormalizer>();
      services.TryAddScoped<IdentityErrorDescriber>();
      services.TryAddScoped<IUserClaimsPrincipalFactory<Volunteer>, UserClaimsPrincipalFactory<Volunteer, VolunteerRole>>();
      services.TryAddScoped<RoleManager<VolunteerRole>, AspNetRoleManager<VolunteerRole>>();

    }

    private static void ConfigureJwt(IServiceCollection services, IConfiguration configuration)
    {
      // jwt wire up
      // Get options from app settings
      var jwtAppSettingOptions = configuration.GetSection(nameof(JwtIssuerOptions));
      var secretKey = Environment.GetEnvironmentVariable("JWT_Key"); 
      var signingKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey));

      services.AddTransient<IJwtFactory, JwtFactory>();

      var tokenValidationParameters = new TokenValidationParameters
      {
        ValidateIssuer = true,
        ValidIssuer = jwtAppSettingOptions[nameof(JwtIssuerOptions.Issuer)],

        ValidateAudience = true,
        ValidAudience = jwtAppSettingOptions[nameof(JwtIssuerOptions.Audience)],

        ValidateIssuerSigningKey = true,
        IssuerSigningKey = signingKey,

        RequireExpirationTime = false,
        ValidateLifetime = false,
        ClockSkew = TimeSpan.Zero
      };

      services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
              .AddJwtBearer(options =>
              {
                //options.Audience = jwtAppSettingOptions[nameof(JwtIssuerOptions.Audience)];
                //options.Authority = jwtAppSettingOptions[nameof(JwtIssuerOptions.Audience)];
                options.TokenValidationParameters = tokenValidationParameters;
                options.Events = new JwtBearerEvents
                {
                  OnMessageReceived = (arg) =>
                  {
                    return Task.CompletedTask;
                  }
                };
              });

      // Configure JwtIssuerOptions
      services.Configure<JwtIssuerOptions>(options =>
      {
        options.Issuer = jwtAppSettingOptions[nameof(JwtIssuerOptions.Issuer)];
        options.Audience = jwtAppSettingOptions[nameof(JwtIssuerOptions.Audience)];
        options.SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
      });
    }
  }
}
