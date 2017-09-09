using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace WebApplicationBasic.Controllers
{
    public class JsonResult<T>
    {
        public List<T> Data { get; set;}

    }
}