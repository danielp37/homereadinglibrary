using System;

namespace website.Entities
{
    public class Student : IAuditFields
    {
        public string BarCode { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
    }
}