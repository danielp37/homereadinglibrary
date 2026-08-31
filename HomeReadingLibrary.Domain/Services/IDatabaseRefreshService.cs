using System.Threading.Tasks;

namespace HomeReadingLibrary.Domain.Services
{
  public interface IDatabaseRefreshService
  {
    /// <summary>
    /// Backs up all affected collections with a timestamped suffix, then performs
    /// the year-end refresh matching the operations in mongodb/Refresh Database.js.
    /// Returns the backup suffix used (e.g. "backup_20240830120000").
    /// </summary>
    Task<string> BackupAndRefreshAsync();
  }
}
