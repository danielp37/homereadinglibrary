using System;
namespace AspnetCore.Identity.MongoDb.Entities
{
  public class VolunteerForClass
  {
    public string ClassId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
  }
}
