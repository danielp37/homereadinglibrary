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

        public class BarCodeBody
        {
            public string BarCode { get; set;}
        }
    }
}