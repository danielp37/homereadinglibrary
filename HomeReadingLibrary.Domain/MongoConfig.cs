using System;
using System.Security.Authentication;
using Microsoft.Extensions.Configuration;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Driver;

namespace HomeReadingLibrary.Domain
{
    public static class MongoConfig
    {
        static IConfiguration _config {get; set;}
        private static string _connectionString {get; set;}
        private static string _database {get; set;}
        private static MongoClient _client = null;
        public static MongoClient Client => _client ?? (_client = CreateClient());
        public static IMongoDatabase Database => Client.GetDatabase(_database);
        public static string ConnectionString => _connectionString;

        public static void Configure(IConfiguration config)
        {
            _config = config;
            SetConventions();
            var mongoConfig = _config.GetSection("mongodb");
            _connectionString = _config["ConnectionStrings:mongodb"]
                ?? Environment.GetEnvironmentVariable("CUSTOMCONNSTR_mongodb")
                ?? mongoConfig["connectionString"];
            if (string.IsNullOrEmpty(_connectionString))
            {
                throw new InvalidOperationException("MongoDB connection string must be configured via user secrets (ConnectionStrings:mongodb), CUSTOMCONNSTR_mongodb environment variable, or mongodb.connectionString in appsettings.");
            }
            _database = mongoConfig.GetValue("database", "baggybooks");
        }

        private static MongoClient CreateClient()
        {
            var settings = MongoClientSettings.FromUrl(
                new MongoUrl(_connectionString)
            );
            if(settings.UseTls)
            {
                settings.SslSettings = new SslSettings() { EnabledSslProtocols = SslProtocols.Tls12 };
            }
            var mongoClient = new MongoClient(settings);
            var client = new MongoClient(settings);

            return client;
        }

        private static void SetConventions()
        {
            var cp = new ConventionPack
            {
                new CamelCaseElementNameConvention()
            };
            ConventionRegistry.Register("baggyBooks", cp, type => true);
        }

    }
}