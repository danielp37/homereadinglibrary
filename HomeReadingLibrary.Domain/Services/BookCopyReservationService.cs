using System;
using System.Security.Claims;
using System.Threading.Tasks;
using MongoDB.Driver;
using HomeReadingLibrary.Domain.Entities;
using static AspnetCore.Identity.MongoDb.JwtModels.Constants.Strings;
using System.Collections.Generic;
using System.Linq;

namespace HomeReadingLibrary.Domain.Services
{
  public class BookCopyReservationService : IBookCopyReservationService
  {
    protected readonly IMongoDatabase mongoDatabase;
    protected readonly IMongoCollection<BookCopyReservation> reservationCollection;

    public BookCopyReservationService(IMongoDatabase mongoDatabase)
    {
      this.mongoDatabase = mongoDatabase;
      reservationCollection = mongoDatabase.GetCollection<BookCopyReservation>("currentreservations");
    }

    public async Task<bool> CheckInBookCopyAsync(string bookBarCode, ClaimsPrincipal user)
    {
      var filter = Builders<BookCopyReservation>.Filter.Eq(b => b.BookCopyBarCode, bookBarCode)
                & Builders<BookCopyReservation>.Filter.Eq(b => b.CheckedInDate, null);
      var update = Builders<BookCopyReservation>.Update
                      .Set(b => b.CheckedInDate, DateTime.Today.ToLocalTime())
                      .Set(b => b.CheckInBy, GetVolunteerAuditForCurrentUser(user))
                      .CurrentDate(b => b.ModifiedDate);
      var updateResult = await reservationCollection.UpdateManyAsync(filter, update);

      return updateResult.IsAcknowledged;
    }

    public async Task<IList<BookWithReservedCopies>> GetBooksWithReservedCopyCounts(IList<Book> books)
    {
      var filter = Builders<BookCopyReservation>.Filter.In(bcr => bcr.BookCopyBarCode, books.SelectMany(b => b.BookCopies).Select(bc => bc.BarCode))
        & Builders<BookCopyReservation>.Filter.Eq(bcr => bcr.CheckedInDate, null);
      var checkedOutBookCopies =  await (await reservationCollection.FindAsync(filter)).ToListAsync();
      var bookCopySet = checkedOutBookCopies.Select(k => k.BookCopyBarCode).ToHashSet();
      var booksWithReservations = books.Select(b =>
        new BookWithReservedCopies(b)
        {
          ReservedCopies = b.BookCopies.Count(bc => bookCopySet.Contains(bc.BarCode))
        }).ToList();
      return booksWithReservations;
    }

    private VolunteerAudit GetVolunteerAuditForCurrentUser(ClaimsPrincipal user)
    {
      var id = user.FindFirst(JwtClaimIdentifiers.Id)?.Value;
      var firstName = user.FindFirst(ClaimTypes.GivenName)?.Value;
      var lastName = user.FindFirst(ClaimTypes.Surname)?.Value;

      return new VolunteerAudit
      {
        VolunteerId = id,
        Name = $"{firstName} {lastName}"
      };
    }
  }
}
