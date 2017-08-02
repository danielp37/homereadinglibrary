namespace aspnetcore_spa.Entities
{
    public class BookCopy
    {
        public string BarCode {get; set;}
        public bool? IsLost {get; set;}
        public bool? IsDamaged {get; set;}
    }
}