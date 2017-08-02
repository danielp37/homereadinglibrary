using aspnetcore_spa.Entities;
using Microsoft.AspNetCore.Mvc;

namespace aspnetcore_spa.Controllers
{
    public class BookCopyReservationsController : EntityController<BookCopyReservation>
    {
        public BookCopyReservationsController() : base("bookcopyreservations")
        {
        }
    }
}