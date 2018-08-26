using AspnetCore.Identity.MongoDb;
using HomeReadingLibrary.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace HomeReadingLibraryWeb
{
  public class Startup
  {
    public Startup(IConfiguration configuration)
    {
      Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
      services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

      // In production, the Angular files will be served from this directory
      services.AddSpaStaticFiles(configuration =>
      {
        configuration.RootPath = "ClientApp/dist";
      });

      //services.ConfigureIdentity(Configuration);
      services.ConfigureMongoImplementation(Configuration);
      services.AddIdentityServer(options =>
          {
            options.UserInteraction.LoginUrl = "~/account/signin";
          })
        .AddDeveloperSigningCredential()
        .AddInMemoryClients(IdentityServerConfig.Clients)
        .AddInMemoryIdentityResources(IdentityServerConfig.IdentityResources)
        .AddInMemoryApiResources(IdentityServerConfig.Apis);

      services.AddAuthentication()
       .AddJwtBearer(jwt =>
       {
         jwt.Authority = "https://localhost:5001";
         jwt.RequireHttpsMetadata = true;
         jwt.Audience = "library";
       });

      services.AddAuthorization(options =>
      {
        options.AddPolicy("VolunteerUser", policy => {
          policy.RequireScope("library.VolunteerAccess");
        });
        options.AddPolicy("AdminUser", policy =>
        {
          policy.RequireScope("library.AdminAccess");
        });
      });

      //services.AddApplicationInsightsTelemetry();
      services.AddMemoryCache();

      services.RegisterHomeReadingLibraryControllers(Configuration);
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IHostingEnvironment env)
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
          spa.UseAngularCliServer(npmScript: "start");
        }
      });
    }
  }
}
