using System.Security.Claims;
using System.Threading.Tasks;
using HomeReadingLibrary.Domain.Entities;

namespace HomeReadingLibrary.Domain.Services
{
  public interface IBookService
  {
    Task<Book> MarkBookCopyLostAsync(string bookId, string barCode, ClaimsPrincipal user);
    Task<Book> MarkBookCopyFoundAsync(string bookId, string barCode);
    Task<Book> MarkBookCopyDamagedAsync(string bookId, string barCode, ClaimsPrincipal user);
    Task<Book> AddCommentToBookCopyAsync(string bookId, string barCode, string comments);
  }
}