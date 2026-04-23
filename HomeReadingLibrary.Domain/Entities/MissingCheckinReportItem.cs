namespace HomeReadingLibrary.Domain.Entities
{
    public class MissingCheckinReportItem
    {
        public string StudentFirstName { get; set; }
        public string StudentLastName { get; set; }
        public string BookTitle { get; set; }
        public string BookCopyBarCode { get; set; }
        public string ReadingLevel { get; set; }
        public string BoxNumber { get; set; }
        public System.DateTime CheckedOutDate { get; set; }
        public string StudentBarCode { get; set; }
        public string TeacherName { get; set; }
        public string Grade { get; set; }
    }
}
