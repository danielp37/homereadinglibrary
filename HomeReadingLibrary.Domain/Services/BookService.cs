using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using HomeReadingLibrary.Domain.Entities;

namespace HomeReadingLibrary.Domain.Services
{
  public class BookService : IBookService
  {
    private readonly IMongoDatabase mongoDatabase;
    private readonly IBookCopyReservationService bookCopyReservationService;
    private readonly IMongoCollection<Book> bookCollection;

    public BookService(IMongoDatabase mongoDatabase, IBookCopyReservationService bookCopyReservationService)
    {
      this.mongoDatabase = mongoDatabase;
      this.bookCopyReservationService = bookCopyReservationService;
      bookCollection = mongoDatabase.GetCollection<Book>("books");
    }

    public async Task<Book> MarkBookCopyDamagedAsync(string bookId, string barCode, ClaimsPrincipal user)
    {
      await bookCopyReservationService.CheckInBookCopyAsync(barCode, user);

      var filter = Builders<Book>.Filter.Where(b => b.Id == bookId && b.BookCopies.Any(bc => bc.BarCode == barCode));
      var update = Builders<Book>.Update.Set(b => b.BookCopies.FirstMatchingElement().IsDamaged, true)
                 .CurrentDate(b => b.BookCopies.FirstMatchingElement().DamagedDate);
      await bookCollection.FindOneAndUpdateAsync(filter, update);
      var book = bookCollection.AsQueryable()
                      .Where(b => b.Id == bookId)
                      .SingleOrDefault();

      return book;
    }

    public async Task<Book> MarkBookCopyLostAsync(string bookId, string barCode, ClaimsPrincipal user)
    {
      await bookCopyReservationService.CheckInBookCopyAsync(barCode, user);

      var filter = Builders<Book>.Filter.Where(b => b.Id == bookId && b.BookCopies.Any(bc => bc.BarCode == barCode));
      var update = Builders<Book>.Update.Set(b => b.BookCopies.FirstMatchingElement().IsLost, true)
                 .CurrentDate(b => b.BookCopies.FirstMatchingElement().LostDate);
      await bookCollection.FindOneAndUpdateAsync(filter, update);
      var book = bookCollection.AsQueryable()
                               .Where(b => b.Id == bookId)
                               .SingleOrDefault();

      return book;
    }

    public async Task<Book> MarkBookCopyFoundAsync(string bookId, string barCode)
    {
      var filter = Builders<Book>.Filter.Where(b => b.Id == bookId && b.BookCopies.Any(bc => bc.BarCode == barCode));
      var update = Builders<Book>.Update.Set(b => b.BookCopies.FirstMatchingElement().IsLost, false)
                 .Set(b => b.BookCopies.FirstMatchingElement().LostDate, (DateTime?)null);
      await bookCollection.FindOneAndUpdateAsync(filter, update);
      var book = bookCollection.AsQueryable()
                               .Where(b => b.Id == bookId)
                               .SingleOrDefault();

      return book;
    }

    public async Task<Book> AddCommentToBookCopyAsync(string bookId, string barCode, string comments)
    {
      var filter = Builders<Book>.Filter.Where(b => b.Id == bookId && b.BookCopies.Any(bc => bc.BarCode == barCode));
      var update = Builders<Book>.Update.Set(b => b.BookCopies.FirstMatchingElement().Comments, comments);
      await bookCollection.FindOneAndUpdateAsync(filter, update);
      var book = bookCollection.AsQueryable()
                               .Where(b => b.Id == bookId)
                               .SingleOrDefault();

      return book;
    }
  }
}
