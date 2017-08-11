using System;
using System.Security.Authentication;
using Microsoft.Extensions.Configuration;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Driver;

namespace aspnetcore_spa.Startup
{
    public static class MongoConfig
    {
        static IConfigurationRoot _config {get; set;}
        private static string _connectionString {get; set;}
        private static string _database {get; set;}
        private static MongoClient _client = null;
        public static MongoClient Client => _client ?? (_client = CreateClient());
        public static IMongoDatabase Database => Client.GetDatabase(_database);

        public static void Configure(IConfigurationRoot config)
        {
            _config = config;
            SetConventions();
            var mongoConfig = _config.GetSection("mongodb");
            _connectionString = Environment.GetEnvironmentVariable("CUSTOMCONNSTR_mongodb");
            //_connectionString = mongoConfig.GetValue("connectionString", "mongodb://127.0.0.1");
            _database = mongoConfig.GetValue("database", "baggybooks");
        }

        private static MongoClient CreateClient()
        {
            var settings = MongoClientSettings.FromUrl(
                new MongoUrl(_connectionString)
            );
            if(settings.UseSsl)
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