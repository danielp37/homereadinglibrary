using System;

namespace website.Entities
{
    public interface IAuditFields
    {
         DateTime CreatedDate {get; set;}
         DateTime ModifiedDate {get; set;}
    }
}