using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Reflection;
using HomeReadingLibrary.Controllers.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Xunit;

namespace HomeReadingLibrary.Controllers.Tests
{
  public class VolunteersControllerAdminTests
  {
    [Theory]
    [InlineData("GetAdmins", typeof(HttpGetAttribute), "admins")]
    [InlineData("RegisterAdmin", typeof(HttpPostAttribute), "admins")]
    [InlineData("UpdateAdmin", typeof(HttpPutAttribute), "admins/{adminId}")]
    [InlineData("DeleteAdmin", typeof(HttpDeleteAttribute), "admins/{adminId}")]
    public void AdminEndpoints_AreAdminOnlyWithExpectedRoute(string methodName, System.Type verb, string template)
    {
      var method = typeof(VolunteersController).GetMethod(methodName);
      var authorize = method.GetCustomAttribute<AuthorizeAttribute>();
      var http = (HttpMethodAttribute)method.GetCustomAttribute(verb);

      Assert.Equal("Bearer", authorize.AuthenticationSchemes);
      Assert.Equal("AdminUser", authorize.Policy);
      Assert.Equal(template, http.Template);
    }

    [Theory]
    [InlineData(null, "password")]
    [InlineData("", "password")]
    [InlineData("admin", null)]
    [InlineData("admin", "")]
    public void AdminUserBody_RequiresNameAndPassword(string name, string password)
    {
      var body = new VolunteersController.AdminUserBody { Name = name, Password = password };

      Assert.False(Validator.TryValidateObject(body, new ValidationContext(body), new List<ValidationResult>(), true));
    }
  }
}
