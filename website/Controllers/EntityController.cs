using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using website.Entities;
using aspnetcore_spa.Startup;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace aspnetcore_spa.Controllers
{
    [Route("api/[controller]")]
    public abstract class EntityController<T> : Controller
    {
        protected readonly IMongoDatabase mongoDatabase;
        protected string _collectionName;
        public EntityController(string collectionName)
        {
            _collectionName = collectionName;
            mongoDatabase = MongoConfig.Database;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody]T entity)
        {

            var entityCollection = mongoDatabase.GetCollection<T>(_collectionName);
            try 
            {
                var auditFields = entity as IAuditFields;
                if(auditFields != null)
                {
                    auditFields.CreatedDate = DateTime.Now;
                }
                await entityCollection.InsertOneAsync(entity);
            }
            catch
            {
                //TODO: log error
            }
            return Ok(new { Data = entity });
        }
    }
}