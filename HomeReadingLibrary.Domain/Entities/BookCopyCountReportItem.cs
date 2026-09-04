namespace HomeReadingLibrary.Domain.Entities
{
    public class BookCopyCountReportItem
    {
        public string BookId { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string PublisherText { get; set; }
        public string GuidedReadingLevel { get; set; }
        public string Isbn { get; set; }
        public string BoxNumber { get; set; }
        public int BookCopyCount { get; set; }
    }
}
