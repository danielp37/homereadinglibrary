using System;
using System.Collections.Generic;
using System.Text;

namespace HomeReadingLibrary.Domain.Entities
{
  public class StudentWithReservationHistory
  {
    public string Id { get; set; }
    public string TeacherId { get; set; }
    public string TeacherName { get; set; }
    public int Grade { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public List<BookCopyReservation> Reservations { get; set; } = new List<BookCopyReservation>();
  }
}
