using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HomeReadingLibrary.Domain.Services
{
  public class DatabaseRefreshAuditRecord
  {
    public string Username { get; set; }
    public DateTime RefreshedAt { get; set; }
    public string BackupSuffix { get; set; }
  }

  public interface IDatabaseRefreshService
  {
    /// <summary>
    /// Performs a server-side backup of all affected collections using MongoDB $out,
    /// then performs the year-end refresh matching mongodb/Refresh Database.js.
    /// Writes an audit record to the maintenancelog collection.
    /// Returns the backup suffix used (e.g. "backup_20240830120000").
    /// </summary>
    Task<string> BackupAndRefreshAsync(string username);

    /// <summary>
    /// Returns the history of database refresh operations from the maintenancelog
    /// collection, ordered most-recent first.
    /// </summary>
    Task<IEnumerable<DatabaseRefreshAuditRecord>> GetRefreshHistoryAsync();
  }
}
