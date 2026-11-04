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
        private readonly IMongoCollection<LateNoticeTemplate> templateCollection;

        public LateNoticeTemplatesController(IMongoDatabase mongoDatabase)
        {
            templateCollection = mongoDatabase.GetCollection<LateNoticeTemplate>("lateNoticeTemplates");
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
            var result = await templateCollection.UpdateOneAsync(t => t.Id == id, update);
            if (result.MatchedCount == 0)
            {
                return NotFound();
            }

            var templates = await templateCollection.Find(t => t.Id == id).ToListAsync();
            return Ok(new { Data = templates.FirstOrDefault() });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            if (!ObjectId.TryParse(id, out _))
            {
                return NotFound();
            }

            var templates = await ListAll();
            if (templates.All(t => t.Id != id))
            {
                return NotFound();
            }
            if (templates.Count <= 1)
            {
                return BadRequest(new { Message = "At least one template must remain." });
            }

            await templateCollection.DeleteOneAsync(t => t.Id == id);
            return Ok(new { Data = id });
        }

        // One-time migration of templates from browser local storage. Does nothing once any template exists,
        // so repeated or concurrent imports from different browsers cannot create duplicates.
        [HttpPost("import")]
        public async Task<IActionResult> Import([FromBody] LateNoticeTemplateImportBody body)
        {
            var existing = await ListAll();
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

            await templateCollection.InsertManyAsync(toImport);
            return Ok(new { Data = await ListAll(), Imported = true });
        }

        private Task<List<LateNoticeTemplate>> ListAll()
        {
            return templateCollection.Find(Builders<LateNoticeTemplate>.Filter.Empty)
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
