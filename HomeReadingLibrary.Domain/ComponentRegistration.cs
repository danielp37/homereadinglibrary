using HomeReadingLibrary.Domain.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;

namespace HomeReadingLibrary.Domain
{
  public static class ComponentRegistration
  {
    public static void RegisterHomeReadingLibraryDomain(this IServiceCollection services, IConfiguration configuration)
    {
      MongoConfig.Configure(configuration);
      services.AddSingleton(MongoConfig.Database);
      services.AddTransient<IBookCopyReservationService, BookCopyReservationService>();
      services.AddTransient<IBookService, BookService>();
    }
  }
}
