namespace HomeReadingLibrary.Domain.Entities
{
    public class BookTitleLevelReportItem
    {
        public string GuidedReadingLevel { get; set; }
        public string BoxNumber { get; set; }
        public int BookTitleCount { get; set; }
        public int BookCopyCount { get; set; }
    }
}
