using System.Threading.Tasks;
using aspnetcore_spa.Entities;
using aspnetcore_spa.Startup;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Linq;

namespace aspnetcore_spa.Controllers
{
    public class BooksController : EntityController<Book>
    {
        public BooksController() : base("books")
        {
        }

        [HttpGet]
        public async override Task<IActionResult> Get()
        {
            IMongoDatabase db = MongoConfig.Database;

            var entityCollection = db.GetCollection<Book>(_collectionName);
            var filter = new BsonDocument();

            var entities = await entityCollection.Find(filter)
                .SortByDescending(b => b.CreatedDate)
                .ToListAsync();

            return Ok(new WebApplicationBasic.Controllers.JsonResult<Book>
            {
                Data = entities
            });
        }

        [HttpPost("{bookId}/bookcopy")]
        public async Task<IActionResult> AddBookCopy(string bookId, [FromBody]BarCodeBody body)
        {
            IMongoDatabase db = MongoConfig.Database;

            var bookCollection = db.GetCollection<Book>("books");
            var filter = Builders<Book>.Filter.Eq(b => b.Id, bookId);
            var update = Builders<Book>.Update.AddToSet(b => b.BookCopies, new BookCopy{ BarCode = body.BarCode});
            await bookCollection.FindOneAndUpdateAsync(filter, update);
            var book = bookCollection.AsQueryable()
                            .Where(b => b.Id == bookId)
                            .SingleOrDefault();

            if(book == null)
            {
                return NotFound();
            }

            return Ok(new { Data = book });
        }

        [HttpGet("isbn/{isbn}")]
        public async Task<IActionResult> GetBookByIsbn(string isbn)
        {
            IMongoDatabase db = MongoConfig.Database;

            var bookCollection = db.GetCollection<Book>("books");
            var filter = Builders<Book>.Filter.Eq(b => b.Isbn, isbn);
            var book = await (await bookCollection.FindAsync(filter)).SingleOrDefaultAsync();

            if(book == null)
            {
                return NotFound();
            }

            return Ok(new { Data = book });
        }

        public class BarCodeBody
        {
            public string BarCode { get; set;}
        }
    }
}