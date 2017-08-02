using System;

namespace aspnetcore_spa.Entities
{
    public class BookCopyReservation
    {
        public string BookCopyReservationId { get; set; }
        public string BookCopyBarCode { get; set; }
        public string StudentId { get; set; }
        public DateTime CheckedOutDate { get; set; }
        public DateTime? CheckedInDate { get; set; }
    }
}