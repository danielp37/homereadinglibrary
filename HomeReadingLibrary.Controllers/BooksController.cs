using System.Threading.Tasks;
using HomeReadingLibrary.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Linq;
using System;
using System.Text.RegularExpressions;
using Microsoft.Net.Http.Headers;
using System.IO;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using HomeReadingLibrary.Domain.Services;

namespace HomeReadingLibrary.Controllers.Controllers
{
  
  public class BooksController : EntityController<Book>
  {
    private readonly IMongoCollection<Book> bookCollection;
    private readonly IBookService bookService;

    public BooksController(IBookService bookService, IMongoDatabase mongoDatabase) : base("books", mongoDatabase)
    {
      this.bookService = bookService;
      bookCollection = this.mongoDatabase.GetCollection<Book>(_collectionName);
    }

    [Authorize(AuthenticationSchemes = "Bearer", Policy = "AdminUser")]
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery]int offset = 0, [FromQuery]int pageSize = 10
        , [FromQuery]string title = null, [FromQuery]string author = null, [FromQuery]string boxNumber = null
        , [FromQuery]string bookBarCode = null)
    {
      if (offset < 0) offset = 0;
      if (pageSize < 1) pageSize = 1;

      var filter = BuildFilter(title, author, boxNumber, bookBarCode);

      var entityCount = await bookCollection.Find(filter).CountDocumentsAsync();
      var entities = await bookCollection.Find(filter)
          .SortByDescending(b => b.CreatedDate)
          .Skip(offset)
          .Limit(pageSize)
          .ToListAsync();

      return Ok(new
      {
        Count = entityCount,
        Data = entities
      });
    }

    [Authorize(AuthenticationSchemes = "Bearer", Policy = "AdminUser")]
    [HttpGet("ExportToTab")]
    public async Task<IActionResult> ExportToTab([FromQuery]string title = null, [FromQuery]string author = null, [FromQuery]string boxNumber = null
          , [FromQuery]string bookBarCode = null)
    {
      var filter = BuildFilter(title, author, boxNumber, bookBarCode);
      var entities = await bookCollection.Find(filter)
          .SortByDescending(b => b.CreatedDate)
          .ToListAsync();


      var resultsAsTab = new[] { "ReadingLevel\tBoxNumber\tTitle\tAuthor\tIsbn\tPublisherText\tCreated Date\tCopies\tBarCodes" }
          .Union(entities.Select(book =>
          $"{book.GuidedReadingLevel}\t{book.BoxNumber}\t{book.Title}\t{book.Author}\t\"{book.Isbn}\"\t{book.PublisherText}\t{book.CreatedDate}\t" +
          $"{book.BookCopies?.Count ?? 0}\t\"{string.Join(",", book.BookCopies.Select(bc => bc.BarCode))}\""));
      byte[] file = null;
      using (var stream = new MemoryStream())
      {
        using (var writer = new StreamWriter(stream, Encoding.UTF8))
        {
          writer.Write(string.Join("\r\n", resultsAsTab));
          writer.Flush();
          file = stream.ToArray();
        }
      }

      return File(file, "text/tab-separated-values", "book-list.txt");
    }

    private FilterDefinition<Book> BuildFilter(string title, string author, string boxNumber, string bookBarCode)
    {
      var builder = Builders<Book>.Filter;
      if (!string.IsNullOrWhiteSpace(title))
      {
        return builder.Regex(b => b.Title, new Regex($".*{title}.*", RegexOptions.IgnoreCase));
      }
      if (!string.IsNullOrWhiteSpace(author))
      {
        return builder.Regex(b => b.Author, new Regex($".*{author}.*", RegexOptions.IgnoreCase));
      }
      if (!string.IsNullOrWhiteSpace(boxNumber))
      {
        var readingLevel = boxNumber.Substring(0, 1);
        var number = boxNumber.Length > 1 ? boxNumber.Substring(1) : null;
        return number != null ? builder.Eq(b => b.GuidedReadingLevel, readingLevel) &
                                builder.Eq(b => b.BoxNumber, number)
                            : builder.Eq(b => b.GuidedReadingLevel, readingLevel);
      }
      if (!string.IsNullOrWhiteSpace(bookBarCode))
      {
        return $"{{ \"bookCopies.barCode\" : \"{bookBarCode}\"}}";
      }
      return builder.Empty;
    }

    [Authorize(AuthenticationSchemes = "Bearer", Policy = "AdminUser")]
    [HttpGet("{bookId}")]
    public IActionResult Get(string bookId)
    {
      var editedBook = bookCollection.AsQueryable()
                      .Where(b => b.Id == bookId)
                      .SingleOrDefault();

      return Ok(new { Data = editedBook });
    }

    [Authorize(AuthenticationSchemes = "Bearer", Policy = "AdminUser")]
    [HttpPut("{bookId}")]
    public async Task<IActionResult> UpdateBook(string bookId, [FromBody]Book book)
    {
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

      if (editedBook == null)
      {
        return NotFound();
      }

      return Ok(new { Data = editedBook });
    }

    [Authorize(AuthenticationSchemes = "Bearer", Policy = "AdminUser")]
    [HttpPost("{bookId}/bookcopy")]
    public async Task<IActionResult> AddBookCopy(string bookId, [FromBody]BarCodeBody body)
    {
      var filter = Builders<Book>.Filter.Eq(b => b.Id, bookId);
      var update = Builders<Book>.Update.AddToSet(b => b.BookCopies, new BookCopy { BarCode = body.BarCode })
                      .CurrentDate(b => b.ModifiedDate);
      await bookCollection.FindOneAndUpdateAsync(filter, update);
      // The book returned by the above method is the version before the update
      // so we must requery to get the new version.
      var book = bookCollection.AsQueryable()
                      .Where(b => b.Id == bookId)
                      .SingleOrDefault();

      if (book == null)
      {
        return NotFound();
      }

      return Ok(new { Data = book });
    }

    [Authorize(AuthenticationSchemes = "Bearer", Policy = "AdminUser")]
    [HttpDelete("{bookId}/bookcopy/{barCode}")]
    public async Task<IActionResult> RemoveBookCopy(string bookId, string barCode)
    {
      var filter = Builders<Book>.Filter.Eq(b => b.Id, bookId);
      var update = Builders<Book>.Update.PullFilter(b => b.BookCopies, bc => bc.BarCode == barCode)
                          .CurrentDate(b => b.ModifiedDate);
      await bookCollection.FindOneAndUpdateAsync(filter, update);
      var book = bookCollection.AsQueryable()
                      .Where(b => b.Id == bookId)
                      .SingleOrDefault();

      if (book == null)
      {
        return NotFound();
      }

      return Ok(new { Data = book });
    }

    [Authorize(AuthenticationSchemes = "Bearer", Policy = "AdminUser")]
    [HttpPut("{bookId}/bookcopy/{barCode}/marklost")]
    public async Task<IActionResult> MarkBookCopyLost(string bookId, string barCode)
    {
      var book = await bookService.MarkBookCopyLostAsync(bookId, barCode, User);

      if (book == null)
      {
        return NotFound();
      }

      return Ok(new { Data = book });
    }

    [Authorize(AuthenticationSchemes = "Bearer", Policy = "AdminUser")]
    [HttpPut("{bookId}/bookcopy/{barCode}/markdamaged")]
    public async Task<IActionResult> MarkBookCopyDamaged(string bookId, string barCode)
    {
      var book = await bookService.MarkBookCopyDamagedAsync(bookId, barCode, User);


      if (book == null)
      {
        return NotFound();
      }

      return Ok(new { Data = book });
    }

    [Authorize(AuthenticationSchemes = "Bearer", Policy = "AdminUser")]
    [HttpGet("isbn/{isbn}")]
    public async Task<IActionResult> GetBookByIsbn(string isbn)
    {
      var filter = Builders<Book>.Filter.Eq(b => b.Isbn, isbn);
      var book = await (await bookCollection.FindAsync(filter)).SingleOrDefaultAsync();

      if (book == null)
      {
        return NotFound();
      }

      return Ok(new { Data = book });
    }

    [Authorize(AuthenticationSchemes = "Bearer", Policy = "VolunteerUser")]
    [HttpGet("bookcopies/{barCode}")]
    public async Task<IActionResult> GetBookCopyByBarCode(string barCode)
    {
      var filter = Builders<Book>.Filter.ElemMatch(b => b.BookCopies, bc => bc.BarCode == barCode);
      var bookCopy = await bookCollection.Find(filter)
                          .Project(b => new
                          {
                            b.Title,
                            b.Author,
                            BarCode = b.BookCopies.Single(bc => bc.BarCode == barCode).BarCode
                          }).FirstOrDefaultAsync();
      if (bookCopy == null)
      {
        return NotFound($"Could not find BookCopy with barCode {barCode}.");
      }
      return Ok(bookCopy);
    }

    public class BarCodeBody
    {
      public string BarCode { get; set; }
    }
  }
}