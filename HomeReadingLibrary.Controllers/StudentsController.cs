using HomeReadingLibrary.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace HomeReadingLibrary.Controllers.Controllers
{
    public class StudentsController : EntityController<Student>
    {
        public StudentsController(IMongoDatabase mongoDatabase) : base("students", mongoDatabase)
        {
        }
    }
}