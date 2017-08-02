using System.Collections.Generic;
using System.Threading.Tasks;
using aspnetcore_spa.Startup;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace aspnetcore_spa.Controllers
{
    [Route("api/[controller]")]
    public abstract class EntityController<T> : Controller
    {
        protected string _collectionName;
        public EntityController(string collectionName)
        {
            _collectionName = collectionName;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            IMongoDatabase db = MongoConfig.Database;

            var entityCollection = db.GetCollection<T>(_collectionName);
            var filter = new BsonDocument();

            var books = await (await entityCollection.FindAsync<T>(filter)).ToListAsync();

            return Ok(new WebApplicationBasic.Controllers.JsonResult<T>
            {
                Data = books
            });
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody]T entity)
        {
            IMongoDatabase db = MongoConfig.Database;

            var entityCollection = db.GetCollection<T>(_collectionName);
            try 
            {
                await entityCollection.InsertOneAsync(entity);
            }
            catch
            {
                //TODO: log error
            }
            return Ok(entity);
        }
    }
}