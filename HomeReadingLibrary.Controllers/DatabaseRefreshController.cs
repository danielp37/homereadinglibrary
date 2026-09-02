using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using HomeReadingLibrary.Domain.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeReadingLibrary.Controllers.Controllers
{
  [Authorize(AuthenticationSchemes = "Bearer", Policy = "AdminUser")]
  [Route("api/databaserefresh")]
  public class DatabaseRefreshController : Controller
  {
    private readonly IDatabaseRefreshService databaseRefreshService;

    public DatabaseRefreshController(IDatabaseRefreshService databaseRefreshService)
    {
      this.databaseRefreshService = databaseRefreshService;
    }

    [HttpGet]
    public async Task<IActionResult> GetRefreshHistory()
    {
      var history = await databaseRefreshService.GetRefreshHistoryAsync();
      return Ok(history);
    }

    [HttpPost]
    public async Task<IActionResult> RefreshDatabase([FromBody] DatabaseRefreshRequest request)
    {
      if (request == null || string.IsNullOrWhiteSpace(request.ConfirmationText))
      {
        return BadRequest(new { error = "A non-empty confirmation text is required." });
      }

      var username = User.Identity?.Name
        ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? "unknown";

      var backupSuffix = await databaseRefreshService.BackupAndRefreshAsync(username);
      return Ok(new { message = "Database refreshed successfully.", backupSuffix });
    }

    public class DatabaseRefreshRequest
    {
      public string ConfirmationText { get; set; }
    }
  }
}
