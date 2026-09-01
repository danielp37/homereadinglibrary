using System;
using System.Collections.Generic;
using System.Linq;
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
    private static readonly Random rand = new Random();

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

      var rows = ParseWorksheet(file, expectedColumns: 3);
      if (rows == null)
        return BadRequest("Could not read the file. Ensure it is a valid .xlsx spreadsheet with columns: Teacher Name, LastName, FirstName.");

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
          var filter = Builders<Class>.Filter.Regex(
            c => c.TeacherName,
            new MongoDB.Bson.BsonRegularExpression($"^{System.Text.RegularExpressions.Regex.Escape(teacherName)}$", "i"));
          @class = await classCollection.Find(filter).FirstOrDefaultAsync();
          classCache[teacherName] = @class;
        }

        if (@class == null)
        {
          results.Errors.Add($"Class not found for teacher '{teacherName}' (student: {lastName}, {firstName}).");
          continue;
        }

        var alreadyExists = @class.Students.Any(s =>
          string.Equals(s.FirstName, firstName, StringComparison.OrdinalIgnoreCase) &&
          string.Equals(s.LastName, lastName, StringComparison.OrdinalIgnoreCase));

        if (alreadyExists)
        {
          results.Skipped.Add($"{lastName}, {firstName} already in {teacherName}'s class.");
          continue;
        }

        var barCode = await GenerateUniqueBarCode();
        var student = new Student
        {
          BarCode      = barCode,
          FirstName    = firstName,
          LastName     = lastName,
          CreatedDate  = DateTime.Now
        };

        var update = Builders<Class>.Update
          .AddToSet(c => c.Students, student)
          .CurrentDate(c => c.ModifiedDate);

        await classCollection.FindOneAndUpdateAsync(
          Builders<Class>.Filter.Eq(c => c.ClassId, @class.ClassId),
          update);

        // Keep the local cache consistent so duplicate-check works within the same upload.
        @class.Students.Add(student);
        results.Imported.Add($"{lastName}, {firstName} → {teacherName} (barcode: {barCode})");
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

      var rows = ParseWorksheet(file, expectedColumns: 6);
      if (rows == null)
        return BadRequest("Could not read the file. Ensure it is a valid .xlsx spreadsheet with columns: LastName, FirstName, Phone, Email, Teacher, DayOfWeek.");

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

        // Resolve class assignments for each row in the group.
        var volunteerForClasses = new List<AspnetCore.Identity.MongoDb.Entities.VolunteerForClass>();
        foreach (var row in group)
        {
          var teacherName = row[4].Trim();
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
            var filter = Builders<Class>.Filter.Regex(
              c => c.TeacherName,
              new MongoDB.Bson.BsonRegularExpression($"^{System.Text.RegularExpressions.Regex.Escape(teacherName)}$", "i"));
            @class = await classCollection.Find(filter).FirstOrDefaultAsync();
            classCache[teacherName] = @class;
          }

          if (@class == null)
          {
            results.Errors.Add($"Class not found for teacher '{teacherName}' (volunteer: {lastName}, {firstName}).");
            continue;
          }

          volunteerForClasses.Add(new AspnetCore.Identity.MongoDb.Entities.VolunteerForClass
          {
            ClassId   = @class.ClassId,
            DayOfWeek = dayOfWeek
          });
        }

        // Check if volunteer already exists by email (email = UserName).
        var existing = await userManager.FindByNameAsync(email);
        if (existing != null)
        {
          results.Skipped.Add($"{lastName}, {firstName} ({email}) already exists.");
          continue;
        }

        var volunteer = new Volunteer
        {
          FirstName          = firstName,
          LastName           = lastName,
          UserName           = email,
          Phone              = phone,
          VolunteerForClasses = volunteerForClasses
        };

        var result = await userManager.CreateAsync(volunteer);
        if (result.Succeeded)
        {
          results.Imported.Add($"{lastName}, {firstName} ({email}) with {volunteerForClasses.Count} class assignment(s).");
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
    /// Opens an Excel file and returns all non-header rows as string arrays.
    /// Returns null if the file cannot be parsed.
    /// </summary>
    public static List<string[]> ParseWorksheet(IFormFile file, int expectedColumns)
    {
      try
      {
        using var stream = file.OpenReadStream();
        using var workbook = new XLWorkbook(stream);
        var sheet = workbook.Worksheets.First();

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

    private async Task<string> GenerateUniqueBarCode()
    {
      string barCode;
      var attempts = 0;
      do
      {
        barCode = DateTime.Today.Year.ToString() +
                  string.Concat(Enumerable.Range(1, BarCodeLength).Select(_ =>
                  {
                    lock (rand) { return rand.Next(9).ToString(); }
                  }));
        attempts++;
      }
      while (await DoesBarCodeExist(barCode) && attempts < 10);

      return barCode;
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
