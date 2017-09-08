using aspnetcore_spa.Startup;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity.MongoDB;
using Microsoft.Extensions.DependencyInjection;

namespace WebApplicationBasic
{
    public partial class Startup
    {
        private void ConfigureAuth(IApplicationBuilder app) 
        {
            app.UseIdentity();
            app.UseCookieAuthentication();
        }

        private void ConfigureAuth(IServiceCollection services) 
        {
            services.AddIdentityWithMongoStores(MongoConfig.ConnectionString)
                .AddDefaultTokenProviders();
        }
    }
}