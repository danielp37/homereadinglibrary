using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HomeReadingLibrary.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace HomeReadingLibrary.Controllers.Controllers
{
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = "Bearer", Policy = "VolunteerUser")]
    public class LateNoticeTemplatesController : Controller
    {
        private const string DefaultName = "Untitled";
        private const string MutationLockId = "late-notice-template-mutation";
        private readonly IMongoDatabase mongoDatabase;
        private readonly IMongoCollection<LateNoticeTemplate> templateCollection;
        private readonly IMongoCollection<BsonDocument> mutationLockCollection;

        public LateNoticeTemplatesController(IMongoDatabase mongoDatabase)
        {
            this.mongoDatabase = mongoDatabase;
            templateCollection = mongoDatabase.GetCollection<LateNoticeTemplate>("lateNoticeTemplates");
            mutationLockCollection = mongoDatabase.GetCollection<BsonDocument>("lateNoticeTemplateOperations");
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return Ok(new { Data = await ListAll() });
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] LateNoticeTemplateBody body)
        {
            if (body == null)
            {
                return BadRequest();
            }

            var template = NewTemplate(body, DateTime.UtcNow);
            await templateCollection.InsertOneAsync(template);
            return Ok(new { Data = template });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(string id, [FromBody] LateNoticeTemplateBody body)
        {
            if (body == null)
            {
                return BadRequest();
            }
            if (!ObjectId.TryParse(id, out _))
            {
                return NotFound();
            }

            var update = Builders<LateNoticeTemplate>.Update
                .Set(t => t.Name, NormalizeName(body.Name))
                .Set(t => t.Content, body.Content ?? string.Empty)
                .Set(t => t.ModifiedDate, DateTime.UtcNow);
            var template = await templateCollection.FindOneAndUpdateAsync(
                t => t.Id == id,
                update,
                new FindOneAndUpdateOptions<LateNoticeTemplate> { ReturnDocument = ReturnDocument.After });
            if (template == null)
            {
                return NotFound();
            }

            return Ok(new { Data = template });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            if (!ObjectId.TryParse(id, out _))
            {
                return NotFound();
            }

            return await WithSerializedMutation<IActionResult>(async session =>
            {
                var templates = await ListAll(session);
                if (templates.All(t => t.Id != id))
                {
                    return NotFound();
                }
                if (templates.Count <= 1)
                {
                    return BadRequest(new { Message = "At least one template must remain." });
                }

                await templateCollection.DeleteOneAsync(session, t => t.Id == id);
                return Ok(new { Data = id });
            });
        }

        // One-time migration of templates from browser local storage. Does nothing once any template exists,
        // so repeated or concurrent imports from different browsers cannot create duplicates.
        [HttpPost("import")]
        public async Task<IActionResult> Import([FromBody] LateNoticeTemplateImportBody body)
        {
            return await WithSerializedMutation<IActionResult>(async session =>
            {
                var existing = await ListAll(session);
                if (existing.Count > 0)
                {
                    return Ok(new { Data = existing, Imported = false });
                }

                var now = DateTime.UtcNow;
                var toImport = (body?.Templates ?? new List<LateNoticeTemplateBody>())
                    .Where(t => t != null && !string.IsNullOrWhiteSpace(t.Content))
                    .Select(t => NewTemplate(t, now))
                    .ToList();
                if (toImport.Count == 0)
                {
                    return Ok(new { Data = existing, Imported = false });
                }

                await templateCollection.InsertManyAsync(session, toImport);
                return Ok(new { Data = await ListAll(session), Imported = true });
            });
        }

        private async Task<T> WithSerializedMutation<T>(Func<IClientSessionHandle, Task<T>> operation)
        {
            var lockFilter = Builders<BsonDocument>.Filter.Eq("_id", MutationLockId);
            try
            {
                await mutationLockCollection.UpdateOneAsync(
                    lockFilter,
                    Builders<BsonDocument>.Update.SetOnInsert("version", 0),
                    new UpdateOptions { IsUpsert = true });
            }
            catch (MongoWriteException exception) when (exception.WriteError?.Code == 11000)
            {
            }

            using var session = await mongoDatabase.Client.StartSessionAsync();
            return await session.WithTransactionAsync(async (transactionSession, cancellationToken) =>
            {
                // The shared write makes concurrent delete/import transactions conflict and retry.
                await mutationLockCollection.UpdateOneAsync(
                    transactionSession,
                    lockFilter,
                    Builders<BsonDocument>.Update.Inc("version", 1),
                    cancellationToken: cancellationToken);
                return await operation(transactionSession);
            });
        }

        private Task<List<LateNoticeTemplate>> ListAll(IClientSessionHandle session = null)
        {
            var filter = Builders<LateNoticeTemplate>.Filter.Empty;
            var query = session == null
                ? templateCollection.Find(filter)
                : templateCollection.Find(session, filter);
            return query
                .SortBy(t => t.CreatedDate)
                .ThenBy(t => t.Id)
                .ToListAsync();
        }

        private static LateNoticeTemplate NewTemplate(LateNoticeTemplateBody body, DateTime now)
        {
            return new LateNoticeTemplate
            {
                Name = NormalizeName(body.Name),
                Content = body.Content ?? string.Empty,
                CreatedDate = now,
                ModifiedDate = now
            };
        }

        private static string NormalizeName(string name)
        {
            return string.IsNullOrWhiteSpace(name) ? DefaultName : name.Trim();
        }
    }

    public class LateNoticeTemplateBody
    {
        public string Name { get; set; }
        public string Content { get; set; }
    }

    public class LateNoticeTemplateImportBody
    {
        public List<LateNoticeTemplateBody> Templates { get; set; }
    }
}
