using System;
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

    public async Task<string> BackupAndRefreshAsync()
    {
      var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
      var suffix = $"_backup_{timestamp}";

      // Backup all affected collections before making any changes
      await BackupCollectionAsync("currentreservations", suffix);
      await BackupCollectionAsync("volunteerlogons", suffix);
      await BackupCollectionAsync("volunteers", suffix);
      await BackupCollectionAsync("classes", suffix);
      await BackupCollectionAsync("books", suffix);

      // Perform year-end refresh — mirrors mongodb/Refresh Database.js
      await mongoDatabase.GetCollection<BsonDocument>("currentreservations")
        .DeleteManyAsync(new BsonDocument());

      await mongoDatabase.GetCollection<BsonDocument>("volunteerlogons")
        .DeleteManyAsync(new BsonDocument());

      await mongoDatabase.GetCollection<BsonDocument>("volunteers")
        .DeleteManyAsync(Builders<BsonDocument>.Filter.Eq("isAdmin", false));

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

      return $"backup_{timestamp}";
    }

    private async Task BackupCollectionAsync(string collectionName, string suffix)
    {
      var source = mongoDatabase.GetCollection<BsonDocument>(collectionName);
      var documents = await source.Find(new BsonDocument()).ToListAsync();
      if (documents.Any())
      {
        var backup = mongoDatabase.GetCollection<BsonDocument>($"{collectionName}{suffix}");
        await backup.InsertManyAsync(documents);
      }
    }
  }
}
