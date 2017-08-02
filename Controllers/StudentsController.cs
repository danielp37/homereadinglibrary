using aspnetcore_spa.Entities;
using Microsoft.AspNetCore.Mvc;

namespace aspnetcore_spa.Controllers
{
    public class StudentsController : EntityController<Student>
    {
        public StudentsController() : base("students")
        {
        }
    }
}