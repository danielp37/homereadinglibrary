using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HomeReadingLibrary.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using System.ComponentModel.DataAnnotations;
using HomeReadingLibrary.Domain.Services;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace HomeReadingLibrary.Controllers.Controllers
{

  public class ClassesController : EntityController<Class>
  {
    private static readonly Regex MonthRegex = new Regex("20[2-3][0-9][0-1][0-9]");
    private const int BarCodeLength = 9;
    private static readonly Random rand = new Random();
    private readonly IMongoCollection<Class> classCollection;
    private readonly IBookCopyReservationService bookCopyReservationService;

    public ClassesController(IMongoDatabase mongoDatabase, IBookCopyReservationService bookCopyReservationService) : base("classes", mongoDatabase)
    {
      classCollection = this.mongoDatabase.GetCollection<Class>(_collectionName);
      this.bookCopyReservationService = bookCopyReservationService;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> Get()
    {
      var filter = Builders<Class>.Filter.Empty;

      var entityCount = await classCollection.Find(filter).CountDocumentsAsync();
      var entities = await classCollection.Find(filter)
          .SortBy(b => b.Grade)
          .ThenBy(b => b.TeacherName)
          .ToListAsync();

      return Ok(new
      {
        Count = entityCount,
        Data = entities
      });
    }

    [Authorize(AuthenticationSchemes = "Bearer", Policy = "AdminUser")]
    [HttpPost("{classId}/students")]
    public async Task<IActionResult> AddStudentToClass(string classId, [FromBody]StudentBody body)
    {
      return await AddStudentToClass(classId, body.FirstName, body.LastName, await GenerateUniqueBarCode());
    }


    [Authorize(AuthenticationSchemes = "Bearer", Policy = "VolunteerUser")]
    [HttpPost("{classId}/newstudent")]
    public async Task<IActionResult> AddNewStudent(string classId, [FromBody]NewStudentBody newStudent)
    {
      if (ModelState.IsValid)
      {
        if (!await DoesBarCodeAlreadyExist(newStudent.BarCode))
        {
          return await AddStudentToClass(classId, newStudent.FirstName, newStudent.LastName, newStudent.BarCode);
        }
        else
        {
          ModelState.AddModelError("BarCode", $"BarCode {newStudent.BarCode} already exists. Maybe they've already been added.");
        }
      }

      return this.BadRequest(ModelState);
    }

    [Authorize(AuthenticationSchemes = "Bearer", Policy = "VolunteerUser")]
    [HttpGet("{classId}/stats")]
    public async Task<IActionResult> GetClassStatistics(string classId, [FromQuery]string forMonth)
    {
      var dateRange = GetDateRange(forMonth);

      var studentReservations = await bookCopyReservationService.GetStudentReservationsForClass(classId);

      return Ok(new ClassStatistics(studentReservations, dateRange));
    }

    private (DateTime Start, DateTime End)? GetDateRange(string forMonth)
    {
      if (string.IsNullOrWhiteSpace(forMonth)) return null;
      if (!MonthRegex.IsMatch(forMonth)) return null;
      if (!short.TryParse(forMonth.Substring(0, 4), out var year)) return null;
      if (!short.TryParse(forMonth.Substring(4, 2), out var month)) return null;
      if (year < DateTime.Today.Year - 1 || year > DateTime.Today.Year + 1) return null;
      if (month < 1 || month > 12) return null;

      var startDate = new DateTime(year, month, 1);
      var endDate = startDate.AddMonths(1).AddDays(-1);

      return (startDate, endDate);
    }

    private async Task<IActionResult> AddStudentToClass(string classId, string firstName, string lastName, string barCode)
    {
      var filter = Builders<Class>.Filter.Eq(c => c.ClassId, classId);
      var update = Builders<Class>.Update.AddToSet(c => c.Students, new Student
      {
        BarCode = barCode,
        FirstName = firstName,
        LastName = lastName,
        CreatedDate = DateTime.Now
      })
          .CurrentDate(c => c.ModifiedDate);
      await classCollection.FindOneAndUpdateAsync(filter, update);
      // The class returned by the above method is the version before the update
      // so we must requery to get the new version.
      var @class = classCollection.AsQueryable()
                      .Where(c => c.ClassId == classId)
                      .SingleOrDefault();

      if (@class == null)
      {
        return NotFound();
      }

      return Ok(new { Data = @class });
    }


    [Authorize(AuthenticationSchemes = "Bearer", Policy = "VolunteerUser")]
    [HttpGet("/api/students/{studentBarCode}")]
    public async Task<IActionResult> GetStudentByBarCode(string studentBarCode)
    {
      var filter = Builders<Class>.Filter.ElemMatch(cls => cls.Students, student => student.BarCode == studentBarCode);
      var studentInfo = await classCollection.Find(filter)
          .Project(c => new
          {
            c.TeacherName,
            Student = c.Students.SingleOrDefault(s => s.BarCode == studentBarCode)
          })
          .FirstOrDefaultAsync();

      if (studentInfo == null)
      {
        return NotFound($"Student with barcode {studentBarCode} not found");
      }

      return Ok(studentInfo);
    }

    private async Task<string> GenerateUniqueBarCode()
    {
      var isMatch = false;
      var barCode = string.Empty;
      var attempts = 0;
      do
      {
        barCode = GetBarCode();
        isMatch = await DoesBarCodeAlreadyExist(barCode);
        attempts++;
      } while (isMatch || attempts < 10);

      if (attempts >= 10 && isMatch)
      {
        return "CouldNotFindBarCode";
      }
      return barCode;
    }

    private async Task<bool> DoesBarCodeAlreadyExist(string barCode)
    {
      var filter = Builders<Class>.Filter.ElemMatch(cls => cls.Students, student => student.BarCode == barCode);
      return await classCollection.Find(filter).AnyAsync();
    }

    private string GetBarCode()
    {
      lock (rand)
      {
        return DateTime.Today.Year.ToString() + string.Concat(Enumerable.Range(1, BarCodeLength).Select(i => rand.Next(9).ToString()));
      }
    }

    public class StudentBody
    {
      public string FirstName { get; set; }
      public string LastName { get; set; }
    }

    public class NewStudentBody
    {
      [Required]
      public string FirstName { get; set; }
      [Required]
      public string LastName { get; set; }
      [Required]
      [RegularExpression(@"202\d{10}")]
      public string BarCode { get; set; }
    }

    public class ClassStatistics
    {
      private readonly IList<StudentWithReservationHistory> students;

      public DateTime? FirstCheckOut => students.SelectMany(s => s.Reservations).Min(r => (DateTime?)r.CheckedOutDate);
      public (DateTime Start, DateTime End) DateRange { get; private set; }
      public int TotalBooksCheckedOut => StudentStats.Sum(ss => ss.TotalBooksCheckedOut);
      public int TotalWeeks => ((DateRange.End - DateRange.Start).Days / 7);
      public decimal AverageCheckOutsPerWeek => (decimal)TotalBooksCheckedOut / TotalWeeks;
      public List<StudentStatistics> StudentStats { get; private set; }

      public ClassStatistics(IList<StudentWithReservationHistory> students, (DateTime Start, DateTime End)? dateRange) : base()
      {
        this.students = students;
        var minDate = new DateTime(DateTime.Today.Month <= 8 ? DateTime.Today.Year - 1 : DateTime.Today.Year, 9, 1);
        DateRange = dateRange.GetValueOrDefault((FirstCheckOut.GetValueOrDefault(minDate), DateTime.Today));
        StudentStats = students.Select(s => new StudentStatistics(s, DateRange)).OrderBy(ss => ss.LastName).ThenBy(ss => ss.FirstName).ToList();
      }

      public class StudentStatistics
      {
        private StudentWithReservationHistory student;
        private (DateTime Start, DateTime End) dateRange;

        public string FirstName => student.FirstName;
        public string LastName => student.LastName;
        public int TotalBooksCheckedOut => student.Reservations.Count(r => r.CheckedOutDate >= dateRange.Start && r.CheckedOutDate <= dateRange.End);
        public DateTime? FirstCheckOut => student.Reservations
          .Where(r => r.CheckedOutDate >= dateRange.Start && r.CheckedOutDate <= dateRange.End)
          .Min(r => (DateTime?)r.CheckedOutDate);
        public DateTime? LastCheckOut => student.Reservations
          .Where(r => r.CheckedOutDate >= dateRange.Start && r.CheckedOutDate <= dateRange.End)
          .Max(r => (DateTime?)r.CheckedOutDate);
        public int TotalWeeks => (dateRange.End - dateRange.Start).Days / 7;
        public decimal? AverageCheckOutsPerWeek => (decimal?)TotalBooksCheckedOut / TotalWeeks;
        public int CheckOutsInLastMonth
        {
          get
          {
            var oneMonthAgo = new DateTime(dateRange.End.Year, dateRange.End.Month, 1).AddMonths(-1);
            var oneMonthAgoEnd = oneMonthAgo.AddMonths(1);
            return student.Reservations.Count(r => r.CheckedOutDate >= oneMonthAgo && r.CheckedOutDate < oneMonthAgoEnd);
          }
        }
        public int CheckOutsInPreviousMonth
        {
          get
          {
            var oneMonthAgo = new DateTime(dateRange.End.Year, dateRange.End.Month, 1).AddMonths(-1);
            var twoMonthAgo = oneMonthAgo.AddMonths(-1);
            return student.Reservations.Count(r => r.CheckedOutDate >= twoMonthAgo && r.CheckedOutDate < oneMonthAgo);
          }
        }
        public int? DaysSinceLastCheckOut => (DateTime.Today - LastCheckOut)?.Days;
        public string StartingLevel => student.StartingLevel;
        public string CurrentLevel => student.CurrentLevel;

        public StudentStatistics(StudentWithReservationHistory student, (DateTime Start, DateTime End) dateRange)
        {
          this.student = student;
          this.dateRange = dateRange;
        }
      }

    }
  }
}