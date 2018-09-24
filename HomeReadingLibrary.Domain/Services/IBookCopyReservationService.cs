using HomeReadingLibrary.Domain.Entities;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace HomeReadingLibrary.Domain.Services
{
  public interface IBookCopyReservationService
  {
    Task<bool> CheckInBookCopyAsync(string bookBarCode, ClaimsPrincipal user);
    Task<IList<BookWithReservedCopies>> GetBooksWithReservedCopyCounts(IList<Book> books);
  }
}