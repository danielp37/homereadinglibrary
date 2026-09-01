using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;

namespace HomeReadingLibrary.Domain.Services
{
  public class DatabaseRefreshService : IDatabaseRefreshService
  {
    private readonly IMongoDatabase mongoDatabase;

    public DatabaseRefreshService(IMongoDatabase mongoDatabase)
    {
      this.mongoDatabase = mongoDatabase;
    }

    public async Task<string> BackupAndRefreshAsync(string username)
    {
      var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
      var suffix = $"_backup_{timestamp}";
      var backupSuffix = $"backup_{timestamp}";

      // Server-side collection copies via $out — no data loaded into app memory
      await BackupCollectionAsync("currentreservations", $"currentreservations{suffix}");
      await BackupCollectionAsync("volunteerlogons", $"volunteerlogons{suffix}");
      await BackupCollectionAsync("volunteers", $"volunteers{suffix}");
      await BackupCollectionAsync("classes", $"classes{suffix}");
      await BackupCollectionAsync("books", $"books{suffix}");

      // Perform year-end refresh — mirrors mongodb/Refresh Database.js
      await mongoDatabase.GetCollection<BsonDocument>("currentreservations")
        .DeleteManyAsync(new BsonDocument());

      await mongoDatabase.GetCollection<BsonDocument>("volunteerlogons")
        .DeleteManyAsync(new BsonDocument());

      // Ne("isAdmin", true) also removes volunteers with absent or null isAdmin field
      await mongoDatabase.GetCollection<BsonDocument>("volunteers")
        .DeleteManyAsync(Builders<BsonDocument>.Filter.Ne("isAdmin", true));

      await mongoDatabase.GetCollection<BsonDocument>("classes")
        .DeleteManyAsync(new BsonDocument());

      var booksCollection = mongoDatabase.GetCollection<BsonDocument>("books");

      // Pull lost and damaged copies out of every book
      var pullLostAndDamaged = new BsonDocument("$pull", new BsonDocument("bookCopies",
        new BsonDocument("$or", new BsonArray
        {
          new BsonDocument("isLost", true),
          new BsonDocument("isDamaged", true)
        })));
      await booksCollection.UpdateManyAsync(new BsonDocument(), pullLostAndDamaged);

      // Remove books that have no remaining copies
      await booksCollection.DeleteManyAsync(
        new BsonDocument("bookCopies", new BsonDocument("$size", 0)));

      // Write audit record — use a collection not cleared by the refresh itself
      await mongoDatabase.GetCollection<BsonDocument>("maintenancelog")
        .InsertOneAsync(new BsonDocument
        {
          { "username", username },
          { "refreshedAt", DateTime.UtcNow },
          { "backupSuffix", backupSuffix }
        });

      return backupSuffix;
    }

    public async Task<IEnumerable<DatabaseRefreshAuditRecord>> GetRefreshHistoryAsync()
    {
      var docs = await mongoDatabase.GetCollection<BsonDocument>("maintenancelog")
        .Find(new BsonDocument())
        .Sort(Builders<BsonDocument>.Sort.Descending("refreshedAt"))
        .ToListAsync();

      return docs.Select(d => new DatabaseRefreshAuditRecord
      {
        Username = d.GetValue("username", "unknown").AsString,
        RefreshedAt = d["refreshedAt"].AsBsonDateTime.ToUniversalTime(),
        BackupSuffix = d.GetValue("backupSuffix", "").AsString
      });
    }

    /// <summary>
    /// Copies <paramref name="collectionName"/> to <paramref name="backupName"/> using
    /// MongoDB's $out aggregation stage — entirely server-side, no app memory allocation.
    /// </summary>
    private async Task BackupCollectionAsync(string collectionName, string backupName)
    {
      var source = mongoDatabase.GetCollection<BsonDocument>(collectionName);
      var pipeline = PipelineDefinition<BsonDocument, BsonDocument>.Create(
        new[] { new BsonDocument("$out", backupName) }
      );
      await source.AggregateToCollectionAsync(pipeline);
    }
  }
}
