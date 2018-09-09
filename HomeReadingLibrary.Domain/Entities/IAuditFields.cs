using System;

namespace HomeReadingLibrary.Domain.Entities
{
    public interface IAuditFields
    {
         DateTime CreatedDate {get; set;}
         DateTime ModifiedDate {get; set;}
    }
}