using System.Security.Claims;
using System.Threading.Tasks;
using website.Entities;

namespace website.Services
{
  public interface IBookService
  {
    Task<Book> MarkBookCopyLostAsync(string bookId, string barCode, ClaimsPrincipal user);
    Task<Book> MarkBookCopyDamagedAsync(string bookId, string barCode, ClaimsPrincipal user);
  }
}