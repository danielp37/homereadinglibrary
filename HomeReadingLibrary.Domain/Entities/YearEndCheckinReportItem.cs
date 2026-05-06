using System;

namespace HomeReadingLibrary.Domain.Entities
{
    public class YearEndCheckinReportItem
    {
        public string TeacherName { get; set; }
        public string Grade { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public DateTime LastCheckedInDate { get; set; }
    }
}
