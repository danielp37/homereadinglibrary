using HomeReadingLibrary.Domain;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeReadingLibrary.Controllers
{
  public static class ComponentRegistration
  {
    public static void RegisterHomeReadingLibraryControllers(this IServiceCollection services, IConfiguration configuration)
    {
      services.RegisterHomeReadingLibraryDomain(configuration);
    }
  }
}
