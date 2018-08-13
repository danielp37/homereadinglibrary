using HomeReadingLibrary.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HomeReadingLibrary.Controllers.Controllers
{
    public class StudentsController : EntityController<Student>
    {
        public StudentsController() : base("students")
        {
        }
    }
}