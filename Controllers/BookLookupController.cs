using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace WebApplicationBasic.Controllers
{
    [Route("/api/[controller]")]
    public class BookLookupController : Controller
    {
        private static string IsbnUrl = "http://isbndb.com/api/v2/json/QQ6LFTNI/book/";

        [HttpGet("{isbn}")]
        public async Task<IActionResult> GetIsbnEntryForBook(string isbn)
        {
            var result = await Program.HttpClient.GetAsync($"{IsbnUrl}{isbn}");
            if(result.IsSuccessStatusCode)
            {
                var jsonString = await result.Content.ReadAsStringAsync();
                var isbnResult = JsonConvert.DeserializeObject<JsonResult<IsbnEntry>>(jsonString);
                if(isbnResult.Data?.Length >= 1)
                {
                    return Ok(isbnResult.Data[0]);
                }
            }
            return NotFound($"Could not find book with isbn {isbn}.");
        }
    
        public class JsonResult<T>
        {
            public T[] Data { get; set;}

        }
        public class IsbnEntry 
        {
            public AuthorData[] author_data { get; set;}
            public string summary { get; set; }
            public string isbn13 { get; set; }
            public string publisher_text { get; set; }
            public string physical_description_text { get; set; }
            public string book_id { get; set; }
            public string notes { get; set; }
            public string title { get; set; }
        }

        public class AuthorData
        {
            public string name { get; set; }
            public string id { get; set; }
        }
    }
}