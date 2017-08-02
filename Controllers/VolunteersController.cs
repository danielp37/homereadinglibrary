using aspnetcore_spa.Entities;
using Microsoft.AspNetCore.Mvc;

namespace aspnetcore_spa.Controllers
{
    public class VolunteersController : EntityController<Volunteer>
    {
        public VolunteersController() : base("volunteers")
        {
        }
    }
}