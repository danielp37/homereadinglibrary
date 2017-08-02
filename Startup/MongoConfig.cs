using System;
using Microsoft.Extensions.Configuration;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Driver;

namespace aspnetcore_spa.Startup
{
    public static class MongoConfig
    {
        static IConfigurationRoot _config {get; set;}
        private static string _server {get; set;}
        private static string _database {get; set;}
        private static MongoClient _client = null;
        public static MongoClient Client => _client ?? (_client = CreateClient());
        public static IMongoDatabase Database => Client.GetDatabase(_database);

        public static void Configure(IConfigurationRoot config)
        {
            _config = config;
            SetConventions();
            var mongoConfig = _config.GetSection("mongodb");
            _server = mongoConfig.GetValue("server", "127.0.0.1");
            _database = mongoConfig.GetValue("database", "baggybooks");
        }

        private static MongoClient CreateClient()
        {
            
            var client = new MongoClient(new MongoClientSettings
            {
                Server = new MongoServerAddress(_server),
                ClusterConfigurator = builder => { },

            });

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