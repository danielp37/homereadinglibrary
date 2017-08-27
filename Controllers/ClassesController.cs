using System.Threading.Tasks;
using aspnetcore_spa.Entities;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace aspnetcore_spa.Controllers
{
    public class ClassesController : EntityController<Class>
    {
        private readonly IMongoCollection<Class> classCollection;
        public ClassesController() : base("classes")
        {
            classCollection = mongoDatabase.GetCollection<Class>(_collectionName);
        }

        [HttpGet]
        public async Task<IActionResult> Get() 
        {
            var filter = Builders<Class>.Filter.Empty;

            var entityCount = await classCollection.Find(filter).CountAsync();
            var entities = await classCollection.Find(filter)
                .SortBy(b => b.Grade)
                .ThenBy(b => b.TeacherName)
                .ToListAsync();

            return Ok(new 
            {
                Count = entityCount,
                Data = entities
            });
        }
    }
}