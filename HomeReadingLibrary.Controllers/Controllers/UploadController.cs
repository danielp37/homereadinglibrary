using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AspnetCore.Identity.MongoDb.Entities;
using ClosedXML.Excel;
using HomeReadingLibrary.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace HomeReadingLibrary.Controllers.Controllers
{
  [Authorize(AuthenticationSchemes = "Bearer", Policy = "AdminUser")]
  [Route("api/upload")]
  public class UploadController : Controller
  {
    private const int BarCodeLength = 9;
    private const int MaxRowsPerUpload = 1000;
    private static readonly Random rand = new Random();

    // Expected header columns for each upload type.
    public static readonly string[] StudentHeaders    = { "Teacher Name", "LastName", "FirstName" };
    public static readonly string[] VolunteerHeaders  = { "LastName", "FirstName", "Phone", "Email", "Teacher", "DayOfWeek" };

    private readonly IMongoCollection<Class> classCollection;
    private readonly UserManager<Volunteer> userManager;

    public UploadController(IMongoDatabase mongoDatabase, UserManager<Volunteer> userManager)
    {
      classCollection = mongoDatabase.GetCollection<Class>("classes");
      this.userManager = userManager;
    }

    /// <summary>
    /// Upload students from an Excel file.
    /// Expected columns (row 1 = header): Teacher Name | LastName | FirstName
    /// </summary>
    [HttpPost("students")]
    public async Task<IActionResult> UploadStudents(IFormFile file)
    {
      if (file == null || file.Length == 0)
        return BadRequest("No file provided.");

      var rows = ParseWorksheet(file, expectedColumns: 3, expectedHeaders: StudentHeaders);
      if (rows == null)
        return BadRequest($"Could not read the file. Ensure it is a valid .xlsx spreadsheet with columns: {string.Join(", ", StudentHeaders)}.");

      if (rows.Count > MaxRowsPerUpload)
        return BadRequest($"File contains {rows.Count} rows which exceeds the limit of {MaxRowsPerUpload}.");

      var results = new UploadResults();

      // Cache classes looked up in this request to avoid repeated DB calls.
      var classCache = new Dictionary<string, Class>(StringComparer.OrdinalIgnoreCase);

      foreach (var row in rows)
      {
        var teacherName = row[0].Trim();
        var lastName    = row[1].Trim();
        var firstName   = row[2].Trim();

        if (string.IsNullOrWhiteSpace(teacherName) || string.IsNullOrWhiteSpace(lastName) || string.IsNullOrWhiteSpace(firstName))
        {
          results.Skipped.Add($"Row skipped (missing data): '{teacherName}' | '{lastName}' | '{firstName}'");
          continue;
        }

        if (!classCache.TryGetValue(teacherName, out var @class))
        {
          var classFilter = Builders<Class>.Filter.Regex(
            c => c.TeacherName,
            new MongoDB.Bson.BsonRegularExpression($"^{Regex.Escape(teacherName)}$", "i"));
          @class = await classCollection.Find(classFilter).FirstOrDefaultAsync();
          classCache[teacherName] = @class;
        }

        if (@class == null)
        {
          results.Errors.Add($"Class not found for teacher '{teacherName}' (student: {lastName}, {firstName}).");
          continue;
        }

        var barCode = await GenerateUniqueBarCode();
        if (barCode == null)
        {
          results.Errors.Add($"Could not generate a unique barcode for {lastName}, {firstName} after multiple attempts. Try again.");
          continue;
        }

        var student = new Student
        {
          BarCode     = barCode,
          FirstName   = firstName,
          LastName    = lastName,
          CreatedDate = DateTime.Now
        };

        // Atomic filter: class must exist AND must not already contain a student with this name.
        // This makes the duplicate check and insert a single MongoDB operation, preventing race conditions.
        var atomicFilter = Builders<Class>.Filter.Eq(c => c.ClassId, @class.ClassId) &
            !Builders<Class>.Filter.ElemMatch(c => c.Students,
                Builders<Student>.Filter.Regex(s => s.FirstName, new MongoDB.Bson.BsonRegularExpression($"^{Regex.Escape(firstName)}$", "i")) &
                Builders<Student>.Filter.Regex(s => s.LastName,  new MongoDB.Bson.BsonRegularExpression($"^{Regex.Escape(lastName)}$",  "i")));

        var update = Builders<Class>.Update
          .AddToSet(c => c.Students, student)
          .CurrentDate(c => c.ModifiedDate);

        var updated = await classCollection.FindOneAndUpdateAsync(
          atomicFilter,
          update,
          new FindOneAndUpdateOptions<Class> { ReturnDocument = ReturnDocument.After });

        if (updated == null)
        {
          // Filter didn't match: either the class was removed, or the student already exists.
          results.Skipped.Add($"{lastName}, {firstName} already in {teacherName}'s class.");
        }
        else
        {
          results.Imported.Add($"{lastName}, {firstName} → {teacherName} (barcode: {barCode})");
        }
      }

      return Ok(results);
    }

    /// <summary>
    /// Upload volunteers from an Excel file.
    /// Expected columns (row 1 = header): LastName | FirstName | Phone | Email | Teacher | DayOfWeek
    /// A volunteer may appear on multiple rows (one per teacher/day assignment).
    /// </summary>
    [HttpPost("volunteers")]
    public async Task<IActionResult> UploadVolunteers(IFormFile file)
    {
      if (file == null || file.Length == 0)
        return BadRequest("No file provided.");

      var rows = ParseWorksheet(file, expectedColumns: 6, expectedHeaders: VolunteerHeaders);
      if (rows == null)
        return BadRequest($"Could not read the file. Ensure it is a valid .xlsx spreadsheet with columns: {string.Join(", ", VolunteerHeaders)}.");

      if (rows.Count > MaxRowsPerUpload)
        return BadRequest($"File contains {rows.Count} rows which exceeds the limit of {MaxRowsPerUpload}.");

      var results = new UploadResults();

      // Group rows by normalised email so multi-row volunteers are merged.
      var grouped = rows
        .Where(r => !r.All(string.IsNullOrWhiteSpace))
        .GroupBy(r => r[3].Trim(), StringComparer.OrdinalIgnoreCase);

      // Cache classes looked up in this request.
      var classCache = new Dictionary<string, Class>(StringComparer.OrdinalIgnoreCase);

      foreach (var group in grouped)
      {
        var firstRow  = group.First();
        var lastName  = firstRow[0].Trim();
        var firstName = firstRow[1].Trim();
        var phone     = firstRow[2].Trim();
        var email     = firstRow[3].Trim();

        if (string.IsNullOrWhiteSpace(email))
        {
          results.Errors.Add($"Row skipped: email is required (volunteer: {lastName}, {firstName}).");
          continue;
        }

        // Resolve and deduplicate class assignments across all rows for this volunteer.
        var volunteerForClasses = new List<AspnetCore.Identity.MongoDb.Entities.VolunteerForClass>();
        var seenAssignments = new HashSet<(string ClassId, DayOfWeek Day)>();

        foreach (var row in group)
        {
          var teacherName  = row[4].Trim();
          var dayOfWeekRaw = row[5].Trim();

          if (string.IsNullOrWhiteSpace(teacherName) || string.IsNullOrWhiteSpace(dayOfWeekRaw))
          {
            results.Skipped.Add($"Assignment row skipped for {lastName}, {firstName}: missing teacher or day.");
            continue;
          }

          if (!TryParseDayOfWeek(dayOfWeekRaw, out var dayOfWeek))
          {
            results.Errors.Add($"Unrecognised day of week '{dayOfWeekRaw}' for {lastName}, {firstName} / {teacherName}.");
            continue;
          }

          if (!classCache.TryGetValue(teacherName, out var @class))
          {
            var classFilter = Builders<Class>.Filter.Regex(
              c => c.TeacherName,
              new MongoDB.Bson.BsonRegularExpression($"^{Regex.Escape(teacherName)}$", "i"));
            @class = await classCollection.Find(classFilter).FirstOrDefaultAsync();
            classCache[teacherName] = @class;
          }

          if (@class == null)
          {
            results.Errors.Add($"Class not found for teacher '{teacherName}' (volunteer: {lastName}, {firstName}).");
            continue;
          }

          var assignmentKey = (@class.ClassId, dayOfWeek);
          if (!seenAssignments.Add(assignmentKey))
          {
            results.Skipped.Add($"Duplicate assignment skipped for {lastName}, {firstName}: {teacherName} / {dayOfWeek}.");
            continue;
          }

          volunteerForClasses.Add(new AspnetCore.Identity.MongoDb.Entities.VolunteerForClass
          {
            ClassId   = @class.ClassId,
            DayOfWeek = dayOfWeek
          });
        }

        // Skip volunteer if they have no valid assignments.
        if (volunteerForClasses.Count == 0)
        {
          results.Skipped.Add($"{lastName}, {firstName} ({email}) skipped: no valid class assignments.");
          continue;
        }

        var volunteer = new Volunteer
        {
          FirstName           = firstName,
          LastName            = lastName,
          UserName            = email,
          Phone               = phone,
          VolunteerForClasses = volunteerForClasses
        };

        var result = await userManager.CreateAsync(volunteer);
        if (result.Succeeded)
        {
          results.Imported.Add($"{lastName}, {firstName} ({email}) with {volunteerForClasses.Count} class assignment(s).");
        }
        else if (result.Errors.Any(e => e.Code == "DuplicateUserName"))
        {
          // Handles the race condition where two uploads create the same volunteer concurrently.
          results.Skipped.Add($"{lastName}, {firstName} ({email}) already exists.");
        }
        else
        {
          results.Errors.Add($"Failed to create volunteer {lastName}, {firstName} ({email}): {string.Join("; ", result.Errors.Select(e => e.Description))}");
        }
      }

      return Ok(results);
    }

    // --- Helpers ---

    /// <summary>
    /// Opens an Excel file, validates the header row against <paramref name="expectedHeaders"/> (if provided),
    /// and returns all subsequent rows as string arrays. Returns null if the file cannot be parsed
    /// or headers do not match.
    /// </summary>
    public static List<string[]> ParseWorksheet(IFormFile file, int expectedColumns, string[] expectedHeaders = null)
    {
      try
      {
        using var stream = file.OpenReadStream();
        using var workbook = new XLWorkbook(stream);
        var sheet = workbook.Worksheets.First();

        // Validate header row when expected headers are provided.
        if (expectedHeaders != null)
        {
          var headerRow = sheet.Row(1);
          for (int i = 0; i < expectedHeaders.Length; i++)
          {
            var cell = headerRow.Cell(i + 1).GetValue<string>()?.Trim() ?? string.Empty;
            if (!string.Equals(cell, expectedHeaders[i], StringComparison.OrdinalIgnoreCase))
              return null;
          }
        }

        var rows = new List<string[]>();
        var lastRow = sheet.LastRowUsed()?.RowNumber() ?? 0;

        // Row 1 is the header — start from row 2.
        for (int r = 2; r <= lastRow; r++)
        {
          var row = sheet.Row(r);
          var values = Enumerable.Range(1, expectedColumns)
            .Select(c => row.Cell(c).GetValue<string>() ?? string.Empty)
            .ToArray();
          rows.Add(values);
        }

        return rows;
      }
      catch
      {
        return null;
      }
    }

    public static bool TryParseDayOfWeek(string value, out DayOfWeek dayOfWeek)
    {
      if (string.IsNullOrWhiteSpace(value) || char.IsDigit(value.TrimStart()[0]))
      {
        dayOfWeek = default;
        return false;
      }
      return Enum.TryParse(value, ignoreCase: true, out dayOfWeek);
    }

    /// <summary>
    /// Generates a unique barcode. Returns null if a unique code cannot be found after retries.
    /// </summary>
    private async Task<string> GenerateUniqueBarCode()
    {
      for (int attempt = 0; attempt < 10; attempt++)
      {
        var barCode = DateTime.Today.Year.ToString() +
                      string.Concat(Enumerable.Range(1, BarCodeLength).Select(_ =>
                      {
                        lock (rand) { return rand.Next(10).ToString(); }
                      }));

        if (!await DoesBarCodeExist(barCode))
          return barCode;
      }

      return null;
    }

    private async Task<bool> DoesBarCodeExist(string barCode)
    {
      var filter = Builders<Class>.Filter.ElemMatch(
        cls => cls.Students,
        student => student.BarCode == barCode);
      return await classCollection.Find(filter).AnyAsync();
    }

    public class UploadResults
    {
      public List<string> Imported { get; } = new List<string>();
      public List<string> Skipped  { get; } = new List<string>();
      public List<string> Errors   { get; } = new List<string>();
      public int ImportedCount => Imported.Count;
      public int SkippedCount  => Skipped.Count;
      public int ErrorCount    => Errors.Count;
    }
  }
}
