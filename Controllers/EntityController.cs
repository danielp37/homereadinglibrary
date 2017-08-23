using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using aspnetcore_spa.Entities;
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

        [HttpPost]
        public async Task<IActionResult> Post([FromBody]T entity)
        {
            IMongoDatabase db = MongoConfig.Database;

            var entityCollection = db.GetCollection<T>(_collectionName);
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