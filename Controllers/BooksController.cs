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

        [HttpGet("{bookId}")]
        public IActionResult Get(string bookId)
        {
            IMongoDatabase db = MongoConfig.Database;

            var bookCollection = db.GetCollection<Book>(_collectionName);

            var editedBook = bookCollection.AsQueryable()
                            .Where(b => b.Id == bookId)
                            .SingleOrDefault();

            return Ok(new { Data = editedBook });
        }

        [HttpPut("{bookId}")]
        public async Task<IActionResult> UpdateBook(string bookId, [FromBody]Book book) 
        {
            IMongoDatabase db = MongoConfig.Database;

            var bookCollection = db.GetCollection<Book>(_collectionName);
            var filter = Builders<Book>.Filter.Eq(b => b.Id, bookId);
            var update = Builders<Book>.Update
                .Set(b => b.BoxNumber, book.BoxNumber)
                .Set(b => b.GuidedReadingLevel, book.GuidedReadingLevel)
                .Set(b => b.Title, book.Title)
                .Set(b => b.Author, book.Author)
                .CurrentDate(b => b.ModifiedDate);
            await bookCollection.FindOneAndUpdateAsync(filter, update);

            var editedBook = bookCollection.AsQueryable()
                            .Where(b => b.Id == bookId)
                            .SingleOrDefault();

            if(editedBook == null)
            {
                return NotFound();
            }

            return Ok(new { Data = editedBook });
        }

        [HttpPost("{bookId}/bookcopy")]
        public async Task<IActionResult> AddBookCopy(string bookId, [FromBody]BarCodeBody body)
        {
            IMongoDatabase db = MongoConfig.Database;

            var bookCollection = db.GetCollection<Book>("books");
            var filter = Builders<Book>.Filter.Eq(b => b.Id, bookId);
            var update = Builders<Book>.Update.AddToSet(b => b.BookCopies, new BookCopy{ BarCode = body.BarCode})
                            .CurrentDate(b => b.ModifiedDate);
            await bookCollection.FindOneAndUpdateAsync(filter, update);
            // The book returned by the above method is the version before the update
            // so we must requery to get the new version.
            var book = bookCollection.AsQueryable()
                            .Where(b => b.Id == bookId)
                            .SingleOrDefault();

            if(book == null)
            {
                return NotFound();
            }

            return Ok(new { Data = book });
        }

        [HttpDelete("{bookId}/bookcopy/{barCode}")]
        public async Task<IActionResult> RemoveBookCopy(string bookId, string barCode)
        {
            IMongoDatabase db = MongoConfig.Database;

            var bookCollection = db.GetCollection<Book>("books");
            var filter = Builders<Book>.Filter.Eq(b => b.Id, bookId);
            var update = Builders<Book>.Update.PullFilter(b => b.BookCopies, bc => bc.BarCode == barCode)
                                .CurrentDate(b => b.ModifiedDate);
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