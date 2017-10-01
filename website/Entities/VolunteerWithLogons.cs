using System;
using System.Collections.Generic;

namespace website.Entities
{
  public class VolunteerWithLogons
  {
    public string VolunteerId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public List<string> Classes { get; set; } = new List<string>();
    public List<int> Grades { get; set; } = new List<int>();
    public List<Logon> Logons { get; set; } = new List<Logon>();
    public DateTime FirstLoginDate { get; set; }
    public DateTime LastLoginDate { get; set; }

    public class Logon 
    {
      public DateTime LogonTime { get; set; }
      public DayOfWeek DayOfWeek { get; set; }
    }
  }
}
