using System.Collections.Generic;

namespace aspnetcore_spa.Entities
{
    public class Volunteer
    {
        public string VolunteerId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public List<VolunteerForClass> VolunteerForClass { get; set; } = new List<VolunteerForClass>();
    }
}