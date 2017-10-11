using System;
using System.Threading.Tasks;
using website.Entities;
using aspnetcore_spa.Startup;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using static AspnetCore.Identity.MongoDb.JwtModels.Constants.Strings;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Linq;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Microsoft.Extensions.Caching.Memory;

namespace aspnetcore_spa.Controllers
{
  [Route("api/[controller]")]
  public class BookCopyReservationsController : Controller
  {
    protected readonly IMongoDatabase mongoDatabase;
    protected readonly IMongoCollection<BookCopyReservation> reservationCollection;
    private readonly IMemoryCache memoryCache;

    public BookCopyReservationsController(IMemoryCache memoryCache)
    {
      mongoDatabase = MongoConfig.Database;
      reservationCollection = mongoDatabase.GetCollection<BookCopyReservation>("currentreservations");
      this.memoryCache = memoryCache;
    }

    [Authorize(Policy = "VolunteerUser")]
    [HttpGet]
    public async Task<IActionResult> GetCheckedOutBookCopies([FromQuery]string studentBarCode, [FromQuery]bool fullHistory = false
                                                            , [FromQuery]int? daysBack = null
                                                            , [FromQuery]int? offset = null, [FromQuery]int? pageSize = null
                                                            , [FromQuery]string sort = null, [FromQuery]string order = null
                                                            , [FromQuery]bool exportAsTab = false)
    {
      var checkedOutBooksCollection = mongoDatabase.GetCollection<CheckedOutBook>(fullHistory ? "bookcheckouthistory" : "bookscheckedout");
      var filter = CreateBookHistoryFilter(studentBarCode, fullHistory, daysBack);

      var checkedOutBooksFind = checkedOutBooksCollection.Find(filter);
      var totalCount = await checkedOutBooksFind.CountAsync();

      if(!string.IsNullOrWhiteSpace(sort))
      {
        checkedOutBooksFind = checkedOutBooksFind.Sort(
          string.Equals(order, "asc", StringComparison.InvariantCultureIgnoreCase) ?
          Builders<CheckedOutBook>.Sort.Ascending(sort) :
          Builders<CheckedOutBook>.Sort.Descending(sort));
      }
      else
      {
        checkedOutBooksFind = checkedOutBooksFind.SortByDescending(cob => cob.CheckedOutDate);
      }

      if (!exportAsTab)
      {
        if (offset != null)
        {
          checkedOutBooksFind = checkedOutBooksFind.Skip(offset);
        }

        if (pageSize != null)
        {
          checkedOutBooksFind = checkedOutBooksFind.Limit(pageSize);
        }
      }

      var checkedOutBooks = await checkedOutBooksFind.ToListAsync();

      if (exportAsTab)
      {
        return CheckedOutBooksAsTabDelimited(checkedOutBooks);
      }
      return Ok(new { Count = totalCount, Data = checkedOutBooks });
    }

    [AllowAnonymous]
    [HttpGet("download")]
    public IActionResult DownloadCheckedOutBookCopies(string guid)
    {
      var file = memoryCache.Get<byte[]>(guid);
      if (file != null)
      {
        memoryCache.Remove(guid);
        return File(file, "text/tab-separated-values", "book-reservations.txt");
      }

      return NotFound();
    }

    private IActionResult CheckedOutBooksAsTabDelimited(List<CheckedOutBook> checkedOutBooks)
    {
      var resultsAsTab = new[] { "BookCopyBarCode\tCheckOutDate\tCheckedInDate\tTitle\tAuthor\tReadingLevel\tTeacher Name\tGrade\tStudent First Name\tStudent Last Name" }
          .Union(checkedOutBooks.Select(cob =>
          $"{cob.BookCopy.BookCopyBarCode}\t{cob.CheckedOutDate.ToString("d")}\t{cob.CheckedInDate?.ToString("d")}\t{cob.BookCopy.Title}\t" +
          $"{cob.BookCopy.Author}\t{cob.BookCopy.GuidedReadingLevel}{cob.BookCopy.BoxNumber}\t{cob.BookCopy.Author}\t" +
          $"{cob.Student.TeacherName}\t{cob.Student.Grade}\t{cob.Student.FirstName}\t{cob.Student.LastName}"));
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

      var cacheKey = Guid.NewGuid();
      memoryCache.Set(cacheKey.ToString(), file);

      return Ok(new { DownloadLink = $"/api/bookcopyreservations/download?guid={cacheKey.ToString()}" });
      //return File(file, "text/tab-separated-values", "book-reservations.txt");
    }

    private FilterDefinition<CheckedOutBook> CreateBookHistoryFilter(string studentBarCode, bool fullHistory, int? daysBack)
    {
      var filter = fullHistory ? Builders<CheckedOutBook>.Filter.Empty 
                               : Builders<CheckedOutBook>.Filter.Eq(bcr => bcr.CheckedInDate, null);
      if (!string.IsNullOrWhiteSpace(studentBarCode))
      {
        filter &= Builders<CheckedOutBook>.Filter.Eq(bcr => bcr.StudentBarCode, studentBarCode);
      }

      if (daysBack != null)
      {
        filter &= Builders<CheckedOutBook>.Filter.Lte(bcr => bcr.CheckedOutDate, DateTime.UtcNow.Date.AddDays(-daysBack.Value));
      }

      return filter;
    }

    [Authorize(Policy = "VolunteerUser")]
    [HttpPost]
    public async Task<IActionResult> CheckoutBookCopy([FromBody]ReservationBody body)
    {
      //TODO: Verify that the BookCopyBarCode and the StudentBarCodes both exist before creating
      if (!await BookCopyBarCodeExists(body.BookCopyBarCode))
      {
        return NotFound($"BookCopyBarCode {body.BookCopyBarCode} not found.");
      }
      if (!await StudentBarCodeExists(body.StudentBarCode))
      {
        return NotFound($"StudentBarCode {body.StudentBarCode} not found.");
      }
      await CheckInBookCopyImpl(body.BookCopyBarCode);

      var reservation = new BookCopyReservation
      {
        BookCopyBarCode = body.BookCopyBarCode,
        StudentBarCode = body.StudentBarCode,
        CheckedOutDate = DateTime.Today,
        CheckOutBy = GetVolunteerAuditForCurrentUser(),
        CreatedDate = DateTime.Now
      };
      await reservationCollection.InsertOneAsync(reservation);

      return Ok(new { Data = reservation });
    }

    [Authorize(Policy = "VolunteerUser")]
    [HttpPost("checkin/{bookBarCode}")]
    public async Task<IActionResult> CheckinBookCopy(string bookBarCode)
    {
      var isAcknowledged = await CheckInBookCopyImpl(bookBarCode);

      return isAcknowledged ? (IActionResult)Ok() : BadRequest();
    }

    private VolunteerAudit GetVolunteerAuditForCurrentUser() 
    {
      var id = User.FindFirst(JwtClaimIdentifiers.Id)?.Value;
      var firstName = User.FindFirst(ClaimTypes.GivenName)?.Value;
      var lastName = User.FindFirst(ClaimTypes.Surname)?.Value;

      return new VolunteerAudit
      {
        VolunteerId = id,
        Name = $"{firstName} {lastName}"
      };
    }

    private async Task<bool> BookCopyBarCodeExists(string bookBarCode)
    {
      var bookCollection = mongoDatabase.GetCollection<Book>("books");
      var filter = Builders<Book>.Filter.ElemMatch(b => b.BookCopies, bc => bc.BarCode == bookBarCode);
      return await bookCollection.Find(filter).AnyAsync();
    }

    private async Task<bool> StudentBarCodeExists(string studentBarCode)
    {
      var classCollection = mongoDatabase.GetCollection<Class>("classes");
      var filter = Builders<Class>.Filter.ElemMatch(c => c.Students, s => s.BarCode == studentBarCode);
      return await classCollection.Find(filter).AnyAsync();
    }

    private async Task<bool> CheckInBookCopyImpl(string bookBarCode)
    {
      var filter = Builders<BookCopyReservation>.Filter.Eq(b => b.BookCopyBarCode, bookBarCode)
                      & Builders<BookCopyReservation>.Filter.Eq(b => b.CheckedInDate, null);
      var update = Builders<BookCopyReservation>.Update
                      .Set(b => b.CheckedInDate, DateTime.Today.ToLocalTime())
                      .Set(b => b.CheckInBy, GetVolunteerAuditForCurrentUser())
                      .CurrentDate(b => b.ModifiedDate);
      var updateResult = await reservationCollection.UpdateManyAsync(filter, update);

      return updateResult.IsAcknowledged;
    }

    public class ReservationBody
    {
      public string BookCopyBarCode { get; set; }
      public string StudentBarCode { get; set; }
    }
  }
}