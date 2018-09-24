using System;
using System.Collections.Generic;
using System.Text;

namespace HomeReadingLibrary.Domain.Entities
{
  public class BookWithReservedCopies : Book
  {
    public int ReservedCopies { get; set; }

    public BookWithReservedCopies()
    { }

    public BookWithReservedCopies(Book book)
    {
      Id = book.Id;
      Title = book.Title;
      Author = book.Author;
      PublisherText = book.PublisherText;
      GuidedReadingLevel = book.GuidedReadingLevel;
      Isbn = book.Isbn;
      BoxNumber = book.BoxNumber;
      CreatedDate = book.CreatedDate;
      ModifiedDate = book.ModifiedDate;
      BookCopies.AddRange(book.BookCopies);
    }
  }
}
