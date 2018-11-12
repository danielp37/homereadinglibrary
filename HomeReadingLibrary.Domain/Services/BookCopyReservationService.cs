using System;
using System.Security.Claims;
using System.Threading.Tasks;
using MongoDB.Driver;
using HomeReadingLibrary.Domain.Entities;
using static AspnetCore.Identity.MongoDb.JwtModels.Constants.Strings;
using System.Collections.Generic;
using System.Linq;
using System.Collections;
using MongoDB.Bson;

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

    public async Task<IList<StudentWithReservationHistory>> GetStudentReservationsForClass(string teacherId)
    {
      var filter = Builders<StudentWithReservationHistory>.Filter.Eq(s => s.TeacherId, teacherId);
      var studentReservations = await (await mongoDatabase.GetCollection<StudentWithReservationHistory>("studentcheckouthistory").FindAsync(filter)).ToListAsync();
      foreach (var sr in studentReservations)
      {
        sr.Reservations.RemoveAll(bcr => bcr.CheckedInDate == bcr.CheckedOutDate);
      }

      await PopulateStartingAndCurrentReadingLevels(studentReservations);

      return studentReservations;
    }

    private async Task PopulateStartingAndCurrentReadingLevels(List<StudentWithReservationHistory> studentReservations)
    {
      var firstAndLastBookCopies = studentReservations.Select(sr =>
      {
        var reservations = sr.Reservations.OrderBy(bcr => bcr.CheckedOutDate).ToArray();
        return new
        {
          sr.Id,
          First = reservations.FirstOrDefault()?.BookCopyBarCode ?? "",
          Last = reservations.LastOrDefault()?.BookCopyBarCode ?? ""
        };
      }).ToDictionary(sr => sr.Id);

      var bookCopyFilter = Builders<Book>.Filter.AnyIn("bookCopies.barCode",
        firstAndLastBookCopies.Values.Select(bc => bc.First).Union(firstAndLastBookCopies.Values.Select(bc => bc.Last))
        .Distinct().Where(x => !string.IsNullOrWhiteSpace(x)));

      var firstAndLastBooks = (await (await mongoDatabase.GetCollection<Book>("books").FindAsync(bookCopyFilter)).ToListAsync());
      var booksByBookCopyBarCode = new Dictionary<string, Book>();
      foreach (var book in firstAndLastBooks)
      {
        foreach (var bookCopy in book.BookCopies)
        {
          booksByBookCopyBarCode[bookCopy.BarCode] = book;
        }
      }

      foreach (var studentReservation in studentReservations)
      {
        var firstAndLastBookCopy = firstAndLastBookCopies[studentReservation.Id];
        if (!string.IsNullOrWhiteSpace(firstAndLastBookCopy.First))
        {
          studentReservation.StartingLevel = booksByBookCopyBarCode[firstAndLastBookCopy.First].GuidedReadingLevel;
          studentReservation.CurrentLevel = booksByBookCopyBarCode[firstAndLastBookCopy.Last].GuidedReadingLevel;
        }
      }
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
