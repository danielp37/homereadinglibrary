using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AspnetCore.Identity.MongoDb;
using aspnetcore_spa.Startup;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace WebApplicationBasic
{
  public partial class Startup
  {
    public Startup(IConfiguration configuration)
    {
      Configuration = configuration;
      MongoConfig.Configure(Configuration);
    }

    //public Startup(IHostingEnvironment env)
    //{
    //  var builder = new ConfigurationBuilder()
    //      .SetBasePath(env.ContentRootPath)
    //      .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    //      .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
    //      .AddEnvironmentVariables();
    //  Configuration = builder.Build();
    //  MongoConfig.Configure(Configuration);
    //}

    public IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
      // Add framework services.
      services.AddMvc();

      services.AddSingleton<IMongoDatabase>(MongoConfig.Database);

      services.ConfigureIdentity(Configuration);
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
    {
      loggerFactory.AddConsole(Configuration.GetSection("Logging"));
      loggerFactory.AddDebug();


      if (env.IsDevelopment())
      {
        app.UseDeveloperExceptionPage();
        app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions
        {
          //Not working right now
          //HotModuleReplacement = true
        });
      }
      else
      {
        app.UseExceptionHandler("/Home/Error");
      }

      app.UseStaticFiles();
      app.UseAuthentication();

      app.UseMvc(routes =>
      {
        routes.MapRoute(
                  name: "default",
                  template: "{controller=Home}/{action=Index}/{id?}");

        routes.MapSpaFallbackRoute(
                  name: "spa-fallback",
                  defaults: new { controller = "Home", action = "Index" });
      });
    }
  }
}
