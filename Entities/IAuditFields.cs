using System;

namespace aspnetcore_spa.Entities
{
    public interface IAuditFields
    {
         DateTime CreatedDate {get; set;}
         DateTime ModifiedDate {get; set;}
    }
}