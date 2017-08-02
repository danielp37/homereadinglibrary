using aspnetcore_spa.Entities;
using Microsoft.AspNetCore.Mvc;

namespace aspnetcore_spa.Controllers
{
    public class ClassesController : EntityController<Class>
    {
        public ClassesController() : base("classes")
        {
        }
    }
}