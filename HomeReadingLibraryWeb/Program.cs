using HomeReadingLibraryWeb;
using IdentityServer4.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Configuration;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using AspnetCore.Identity.MongoDb;
using HomeReadingLibrary.Controllers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

ConfigureServices(builder.Services, builder.Configuration);

var app = builder.Build();

Configure(app, app.Environment);

await app.RunAsync();

void ConfigureServices(IServiceCollection services, IConfiguration configuration)
{
  services.AddMvc(opt =>
  {
    opt.EnableEndpointRouting = false;
  })
    //.SetCompatibilityVersion(CompatibilityVersion.Version_3_0)
    .AddApplicationPart(typeof(HomeReadingLibrary.Controllers.ComponentRegistration).Assembly)
    .AddJsonOptions(opt =>
    {
      opt.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(allowIntegerValues: true));
    });

  // In production, the Angular files will be served from this directory
  services.AddSpaStaticFiles(configuration =>
  {
    configuration.RootPath = "ClientApp/dist";
  });

  var spaClient = new Client();
  configuration.GetSection("SpaClient").Bind(spaClient);

  X509Store certStore = new X509Store(StoreName.My, StoreLocation.CurrentUser);
  certStore.Open(OpenFlags.ReadOnly);
  var certsFound = certStore.Certificates.Find(X509FindType.FindByThumbprint, "C23735CD63DDFF6C38751022B944B07C8246FAF7", false);
  var cert = certsFound.Count > 0 ? certsFound[0] : throw new FileNotFoundException("Could not find signing certificate!");
  //services.ConfigureIdentity(Configuration);
  services.AddIdentityServer(options =>
  {
    options.UserInteraction.LoginUrl = "~/account/signin";
  })
    .AddSigningCredential(cert)
    .AddDeveloperSigningCredential()
    .AddInMemoryClients(new[] { spaClient })
    .AddInMemoryIdentityResources(IdentityServerConfig.IdentityResources)
    .AddInMemoryApiResources(IdentityServerConfig.Apis)
    .AddInMemoryApiScopes(IdentityServerConfig.ApiScopes)
    .AddJwtBearerClientAuthentication();

  services.ConfigureMongoImplementation(configuration);

  services.AddAuthentication(cfg =>
  {
    cfg.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
  })
   .AddJwtBearer(jwt =>
   {
     jwt.Authority = configuration.GetValue<string>("JwtAuthority");
     jwt.RequireHttpsMetadata = true;
     jwt.Audience = "library";
   });

  services.AddAuthorization(options =>
  {
    options.AddPolicy("VolunteerUser", policy => {
      policy.RequireScope("library");
      policy.RequireRole("VolunteerAccess");
    });
    options.AddPolicy("AdminUser", policy =>
    {
      policy.RequireScope("library");
      policy.RequireRole("AdminAccess");
    });
  });

  //services.AddApplicationInsightsTelemetry();
  services.AddMemoryCache();

  services.RegisterHomeReadingLibraryControllers(configuration);
  services.AddApplicationInsightsTelemetry();
}

// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
  if (env.IsDevelopment())
  {
    app.UseDeveloperExceptionPage();
  }
  else
  {
    app.UseExceptionHandler("/Error");
    app.UseHsts();
  }

  app.UseHttpsRedirection();
  app.UseStaticFiles();
  app.UseSpaStaticFiles();

  app.UseIdentityServer();

  app.UseAuthentication();

  app.UseMvc(routes =>
  {
    routes.MapRoute(
              name: "default",
              template: "{controller}/{action=Index}/{id?}");
  });

  app.UseSpa(spa =>
  {
    // To learn more about options for serving an Angular SPA from ASP.NET Core,
    // see https://go.microsoft.com/fwlink/?linkid=864501

    spa.Options.SourcePath = "ClientApp";

    if (env.IsDevelopment())
    {
      spa.UseProxyToSpaDevelopmentServer("http://localhost:4200");
    }
  });
}

