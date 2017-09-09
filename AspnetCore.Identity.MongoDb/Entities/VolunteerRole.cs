using Microsoft.AspNet.Identity;

namespace AspnetCore.Identity.MongoDb.Entities
{
    public class VolunteerRole : IRole
    {
        public VolunteerRole()
        {
        }

        public string Id {get; set;}

        public string Name {get; set;}
    }
}