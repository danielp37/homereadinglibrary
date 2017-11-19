using System;

namespace website.Entities
{
  public class BookCopy
  {
    public string BarCode { get; set; }
    public bool? IsLost { get; set; }
    public DateTime? LostDate { get; set; }
    public bool? IsDamaged { get; set; }
    public DateTime? DamagedDate { get; set; }
  }
}