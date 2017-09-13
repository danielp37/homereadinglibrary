using System;
using Microsoft.AspNetCore.Identity;

namespace AspnetCore.Identity.MongoDb.Stores
{
  public class LookupNormalizer : ILookupNormalizer
  {
    public string Normalize(string key)
    {
      return key;
    }
  }
}
