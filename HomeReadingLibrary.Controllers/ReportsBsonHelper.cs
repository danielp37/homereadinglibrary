using MongoDB.Bson;

namespace HomeReadingLibrary.Controllers.Controllers
{
    public static class ReportsBsonHelper
    {
        public static string BsonToString(BsonValue value)
        {
            if (value == null || value.IsBsonNull) return null;
            return value.IsString ? value.AsString : value.ToString();
        }

        public static string GetFirstArrayFieldString(BsonDocument doc, string arrayField, string fieldName)
        {
            if (!doc.Contains(arrayField) || !doc[arrayField].IsBsonArray)
                return null;
            var arr = doc[arrayField].AsBsonArray;
            if (arr.Count == 0)
                return null;
            var first = arr[0] as BsonDocument;
            if (first == null || !first.Contains(fieldName))
                return null;
            return BsonToString(first[fieldName]);
        }
    }
}
