using System;

namespace HomeReadingLibrary.Domain.Entities
{
  public class VolunteerForClass
  {
    public string VolunteerId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
  }
}