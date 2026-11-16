using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FakeItEasy;
using HomeReadingLibrary.Controllers.Controllers;
using HomeReadingLibrary.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using Xunit;

namespace HomeReadingLibrary.Controllers.Tests
{
    public class LateNoticeTemplatesControllerTests
    {
        private readonly IMongoDatabase mongoDatabase = A.Fake<IMongoDatabase>();
        private readonly IMongoCollection<LateNoticeTemplate> collection = A.Fake<IMongoCollection<LateNoticeTemplate>>();
        private readonly IMongoCollection<BsonDocument> mutationLockCollection = A.Fake<IMongoCollection<BsonDocument>>();
        private readonly IMongoClient mongoClient = A.Fake<IMongoClient>();
        private readonly IClientSessionHandle session = A.Fake<IClientSessionHandle>();
        private readonly SemaphoreSlim mutationGate = new SemaphoreSlim(1, 1);
        private readonly LateNoticeTemplatesController controller;

        public LateNoticeTemplatesControllerTests()
        {
            A.CallTo(() => mongoDatabase.GetCollection<LateNoticeTemplate>("lateNoticeTemplates", null)).Returns(collection);
            A.CallTo(() => mongoDatabase.GetCollection<BsonDocument>("lateNoticeTemplateOperations", null)).Returns(mutationLockCollection);
            A.CallTo(() => mongoDatabase.Client).Returns(mongoClient);
            A.CallTo(() => mongoClient.StartSessionAsync(A<ClientSessionOptions>._, A<CancellationToken>._))
                .Returns(Task.FromResult(session));
            A.CallTo(() => session.WithTransactionAsync(
                    A<Func<IClientSessionHandle, CancellationToken, Task<IActionResult>>>._,
                    A<TransactionOptions>._,
                    A<CancellationToken>._))
                .ReturnsLazily(async (Func<IClientSessionHandle, CancellationToken, Task<IActionResult>> operation, TransactionOptions options, CancellationToken cancellationToken) =>
                {
                    await mutationGate.WaitAsync(cancellationToken);
                    try
                    {
                        return await operation(session, cancellationToken);
                    }
                    finally
                    {
                        mutationGate.Release();
                    }
                });
            A.CallTo(() => mutationLockCollection.UpdateOneAsync(
                    A<FilterDefinition<BsonDocument>>._,
                    A<UpdateDefinition<BsonDocument>>._,
                    A<UpdateOptions>._,
                    A<CancellationToken>._))
                .Returns(Task.FromResult<UpdateResult>(new UpdateResult.Acknowledged(1, 1, null)));
            A.CallTo(() => mutationLockCollection.UpdateOneAsync(
                    A<IClientSessionHandle>._,
                    A<FilterDefinition<BsonDocument>>._,
                    A<UpdateDefinition<BsonDocument>>._,
                    A<UpdateOptions>._,
                    A<CancellationToken>._))
                .Returns(Task.FromResult<UpdateResult>(new UpdateResult.Acknowledged(1, 1, null)));
            controller = new LateNoticeTemplatesController(mongoDatabase);
        }

        private void SetupFind(params LateNoticeTemplate[] results)
        {
            SetupDynamicFind(() => results.ToList());
        }

        private void SetupDynamicFind(Func<List<LateNoticeTemplate>> getResults)
        {
            A.CallTo(() => collection.FindAsync(
                    A<FilterDefinition<LateNoticeTemplate>>._,
                    A<FindOptions<LateNoticeTemplate, LateNoticeTemplate>>._,
                    A<CancellationToken>._))
                .ReturnsLazily(() => Task.FromResult(Cursor(getResults())));
            A.CallTo(() => collection.FindAsync(
                    A<IClientSessionHandle>._,
                    A<FilterDefinition<LateNoticeTemplate>>._,
                    A<FindOptions<LateNoticeTemplate, LateNoticeTemplate>>._,
                    A<CancellationToken>._))
                .ReturnsLazily(() => Task.FromResult(Cursor(getResults())));
        }

        private static IAsyncCursor<LateNoticeTemplate> Cursor(List<LateNoticeTemplate> results)
        {
            var cursor = A.Fake<IAsyncCursor<LateNoticeTemplate>>();
            A.CallTo(() => cursor.MoveNextAsync(A<CancellationToken>._)).ReturnsNextFromSequence(Task.FromResult(true), Task.FromResult(false));
            A.CallTo(() => cursor.Current).Returns(results);
            return cursor;
        }

        private static LateNoticeTemplate Template(string id) => new LateNoticeTemplate { Id = id, Name = id, Content = "c" };

        [Fact]
        public void Controller_RequiresVolunteerPolicy()
        {
            var authorize = (AuthorizeAttribute)typeof(LateNoticeTemplatesController)
                .GetCustomAttributes(typeof(AuthorizeAttribute), true).Single();
            Assert.Equal("Bearer", authorize.AuthenticationSchemes);
            Assert.Equal("VolunteerUser", authorize.Policy);
        }

        [Fact]
        public async Task Post_InsertsTemplateWithTrimmedNameAndAuditDates()
        {
            LateNoticeTemplate inserted = null;
            A.CallTo(() => collection.InsertOneAsync(A<LateNoticeTemplate>._, A<InsertOneOptions>._, A<CancellationToken>._))
                .Invokes((LateNoticeTemplate t, InsertOneOptions o, CancellationToken c) => inserted = t)
                .Returns(Task.CompletedTask);

            var result = await controller.Post(new LateNoticeTemplateBody { Name = "  Hello  ", Content = "body" });

            Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Hello", inserted.Name);
            Assert.Equal("body", inserted.Content);
            Assert.NotEqual(default, inserted.CreatedDate);
        }

        [Fact]
        public async Task Post_BlankNameBecomesUntitled()
        {
            LateNoticeTemplate inserted = null;
            A.CallTo(() => collection.InsertOneAsync(A<LateNoticeTemplate>._, A<InsertOneOptions>._, A<CancellationToken>._))
                .Invokes((LateNoticeTemplate t, InsertOneOptions o, CancellationToken c) => inserted = t)
                .Returns(Task.CompletedTask);

            await controller.Post(new LateNoticeTemplateBody { Name = "  ", Content = "x" });

            Assert.Equal("Untitled", inserted.Name);
        }

        [Fact]
        public async Task Put_InvalidId_ReturnsNotFound()
        {
            var result = await controller.Put("not-an-id", new LateNoticeTemplateBody { Name = "n", Content = "c" });

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Put_NoMatch_ReturnsNotFound()
        {
            A.CallTo(() => collection.FindOneAndUpdateAsync<LateNoticeTemplate>(
                    A<FilterDefinition<LateNoticeTemplate>>._,
                    A<UpdateDefinition<LateNoticeTemplate>>._,
                    A<FindOneAndUpdateOptions<LateNoticeTemplate, LateNoticeTemplate>>._,
                    A<CancellationToken>._))
                .Returns(Task.FromResult<LateNoticeTemplate>(null));

            var result = await controller.Put(ObjectId.GenerateNewId().ToString(), new LateNoticeTemplateBody { Name = "n", Content = "c" });

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Put_ReturnsTheUpdatedTemplateFromAtomicUpdate()
        {
            var id = ObjectId.GenerateNewId().ToString();
            var updated = Template(id);
            A.CallTo(() => collection.FindOneAndUpdateAsync<LateNoticeTemplate>(
                    A<FilterDefinition<LateNoticeTemplate>>._,
                    A<UpdateDefinition<LateNoticeTemplate>>._,
                    A<FindOneAndUpdateOptions<LateNoticeTemplate, LateNoticeTemplate>>._,
                    A<CancellationToken>._))
                .Returns(Task.FromResult(updated));

            var result = await controller.Put(id, new LateNoticeTemplateBody { Name = "n", Content = "c" });

            var response = Assert.IsType<OkObjectResult>(result).Value;
            Assert.Equal(updated, response.GetType().GetProperty("Data").GetValue(response));
        }

        [Fact]
        public async Task Delete_LastTemplate_ReturnsBadRequestAndDoesNotDelete()
        {
            var id = ObjectId.GenerateNewId().ToString();
            SetupFind(Template(id));

            var result = await controller.Delete(id);

            Assert.IsType<BadRequestObjectResult>(result);
            A.CallTo(() => collection.DeleteOneAsync(A<FilterDefinition<LateNoticeTemplate>>._, A<CancellationToken>._)).MustNotHaveHappened();
            A.CallTo(() => collection.DeleteOneAsync(
                A<IClientSessionHandle>._,
                A<FilterDefinition<LateNoticeTemplate>>._,
                A<DeleteOptions>._,
                A<CancellationToken>._)).MustNotHaveHappened();
        }

        [Fact]
        public async Task Delete_WithMultipleTemplates_Deletes()
        {
            var id = ObjectId.GenerateNewId().ToString();
            SetupFind(Template(id), Template(ObjectId.GenerateNewId().ToString()));
            A.CallTo(() => collection.DeleteOneAsync(
                    A<IClientSessionHandle>._,
                    A<FilterDefinition<LateNoticeTemplate>>._,
                    A<DeleteOptions>._,
                    A<CancellationToken>._))
                .Returns(Task.FromResult<DeleteResult>(new DeleteResult.Acknowledged(1)));

            var result = await controller.Delete(id);

            Assert.IsType<OkObjectResult>(result);
            A.CallTo(() => collection.DeleteOneAsync(
                A<IClientSessionHandle>._,
                A<FilterDefinition<LateNoticeTemplate>>._,
                A<DeleteOptions>._,
                A<CancellationToken>._)).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task Import_WhenTemplatesAlreadyExist_DoesNotInsert()
        {
            SetupFind(Template(ObjectId.GenerateNewId().ToString()));

            var result = await controller.Import(new LateNoticeTemplateImportBody
            {
                Templates = new List<LateNoticeTemplateBody> { new LateNoticeTemplateBody { Name = "a", Content = "b" } }
            });

            Assert.IsType<OkObjectResult>(result);
            A.CallTo(() => collection.InsertManyAsync(A<IEnumerable<LateNoticeTemplate>>._, A<InsertManyOptions>._, A<CancellationToken>._)).MustNotHaveHappened();
            A.CallTo(() => collection.InsertManyAsync(A<IClientSessionHandle>._, A<IEnumerable<LateNoticeTemplate>>._, A<InsertManyOptions>._, A<CancellationToken>._)).MustNotHaveHappened();
        }

        [Fact]
        public async Task Import_WhenEmpty_InsertsOnlyTemplatesWithContent()
        {
            SetupFind();
            List<LateNoticeTemplate> inserted = null;
            A.CallTo(() => collection.InsertManyAsync(A<IClientSessionHandle>._, A<IEnumerable<LateNoticeTemplate>>._, A<InsertManyOptions>._, A<CancellationToken>._))
                .Invokes((IClientSessionHandle s, IEnumerable<LateNoticeTemplate> t, InsertManyOptions o, CancellationToken c) => inserted = t.ToList())
                .Returns(Task.CompletedTask);

            await controller.Import(new LateNoticeTemplateImportBody
            {
                Templates = new List<LateNoticeTemplateBody>
                {
                    new LateNoticeTemplateBody { Name = "Default", Content = "one" },
                    new LateNoticeTemplateBody { Name = "Empty", Content = " " },
                    new LateNoticeTemplateBody { Name = "Second", Content = "two" }
                }
            });

            Assert.Equal(new[] { "Default", "Second" }, inserted.Select(t => t.Name));
        }

        [Fact]
        public async Task Delete_ConcurrentDeletesCannotRemoveTheLastTemplate()
        {
            var templates = new List<LateNoticeTemplate>
            {
                Template(ObjectId.GenerateNewId().ToString()),
                Template(ObjectId.GenerateNewId().ToString())
            };
            SetupDynamicFind(() => templates.ToList());
            A.CallTo(() => collection.DeleteOneAsync(
                    A<IClientSessionHandle>._,
                    A<FilterDefinition<LateNoticeTemplate>>._,
                    A<DeleteOptions>._,
                    A<CancellationToken>._))
                .Invokes(() => templates.RemoveAt(0))
                .Returns(Task.FromResult<DeleteResult>(new DeleteResult.Acknowledged(1)));
            var firstId = templates[0].Id;
            var secondId = templates[1].Id;

            var results = await Task.WhenAll(
                controller.Delete(firstId),
                controller.Delete(secondId));

            Assert.Single(templates);
            Assert.Single(results.OfType<BadRequestObjectResult>());
            Assert.Single(results.OfType<OkObjectResult>());
            A.CallTo(() => mutationLockCollection.UpdateOneAsync(
                A<IClientSessionHandle>._,
                A<FilterDefinition<BsonDocument>>._,
                A<UpdateDefinition<BsonDocument>>._,
                A<UpdateOptions>._,
                A<CancellationToken>._)).MustHaveHappenedTwiceExactly();
        }

        [Fact]
        public async Task Import_ConcurrentFirstImportsOnlyInsertOnePayload()
        {
            var templates = new List<LateNoticeTemplate>();
            SetupDynamicFind(() => templates.ToList());
            A.CallTo(() => collection.InsertManyAsync(
                    A<IClientSessionHandle>._,
                    A<IEnumerable<LateNoticeTemplate>>._,
                    A<InsertManyOptions>._,
                    A<CancellationToken>._))
                .Invokes((IClientSessionHandle s, IEnumerable<LateNoticeTemplate> inserted, InsertManyOptions options, CancellationToken cancellationToken) =>
                    templates.AddRange(inserted))
                .Returns(Task.CompletedTask);
            var body = new LateNoticeTemplateImportBody
            {
                Templates = new List<LateNoticeTemplateBody>
                {
                    new LateNoticeTemplateBody { Name = "Imported", Content = "body" }
                }
            };

            var results = await Task.WhenAll(controller.Import(body), controller.Import(body));

            Assert.Single(templates);
            A.CallTo(() => collection.InsertManyAsync(
                A<IClientSessionHandle>._,
                A<IEnumerable<LateNoticeTemplate>>._,
                A<InsertManyOptions>._,
                A<CancellationToken>._)).MustHaveHappenedOnceExactly();
            var importedValues = results
                .Cast<OkObjectResult>()
                .Select(result => (bool)result.Value.GetType().GetProperty("Imported").GetValue(result.Value))
                .ToList();
            Assert.Contains(true, importedValues);
            Assert.Contains(false, importedValues);
            A.CallTo(() => mutationLockCollection.UpdateOneAsync(
                A<IClientSessionHandle>._,
                A<FilterDefinition<BsonDocument>>._,
                A<UpdateDefinition<BsonDocument>>._,
                A<UpdateOptions>._,
                A<CancellationToken>._)).MustHaveHappenedTwiceExactly();
        }
    }
}
