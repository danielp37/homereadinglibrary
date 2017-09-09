using Microsoft.AspNet.Identity;

namespace AspnetCore.Identity.MongoDb.Entities
{
    public class Volunteer : IUser<string>
    {
        public string Id { get; set; }
        public string UserName { get; set; }
    }
}