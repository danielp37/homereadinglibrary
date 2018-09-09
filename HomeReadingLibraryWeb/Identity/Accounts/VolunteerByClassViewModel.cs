using HomeReadingLibrary.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HomeReadingLibraryWeb.Identity.Accounts
{
  public class VolunteerByClassViewModel
  {
    public List<ClassWithVolunteers> Classes { get; }
    public string ReturnUrl { get; }

    public VolunteerByClassViewModel(List<ClassWithVolunteers> classes, string returnUrl)
    {
      Classes = classes;
      ReturnUrl = returnUrl;
    }
  }
}
