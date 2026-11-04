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
        private readonly LateNoticeTemplatesController controller;

        public LateNoticeTemplatesControllerTests()
        {
            A.CallTo(() => mongoDatabase.GetCollection<LateNoticeTemplate>("lateNoticeTemplates", null)).Returns(collection);
            controller = new LateNoticeTemplatesController(mongoDatabase);
        }

        private void SetupFind(params LateNoticeTemplate[] results)
        {
            var cursor = A.Fake<IAsyncCursor<LateNoticeTemplate>>();
            A.CallTo(() => cursor.MoveNextAsync(A<CancellationToken>._)).ReturnsNextFromSequence(Task.FromResult(true), Task.FromResult(false));
            A.CallTo(() => cursor.Current).Returns(results.ToList());
            A.CallTo(() => collection.FindAsync(A<FilterDefinition<LateNoticeTemplate>>._, A<FindOptions<LateNoticeTemplate, LateNoticeTemplate>>._, A<CancellationToken>._))
                .Returns(Task.FromResult(cursor));
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
            A.CallTo(() => collection.UpdateOneAsync(A<FilterDefinition<LateNoticeTemplate>>._, A<UpdateDefinition<LateNoticeTemplate>>._, A<UpdateOptions>._, A<CancellationToken>._))
                .Returns(Task.FromResult<UpdateResult>(new UpdateResult.Acknowledged(0, 0, null)));

            var result = await controller.Put(ObjectId.GenerateNewId().ToString(), new LateNoticeTemplateBody { Name = "n", Content = "c" });

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Delete_LastTemplate_ReturnsBadRequestAndDoesNotDelete()
        {
            var id = ObjectId.GenerateNewId().ToString();
            SetupFind(Template(id));

            var result = await controller.Delete(id);

            Assert.IsType<BadRequestObjectResult>(result);
            A.CallTo(() => collection.DeleteOneAsync(A<FilterDefinition<LateNoticeTemplate>>._, A<CancellationToken>._)).MustNotHaveHappened();
        }

        [Fact]
        public async Task Delete_WithMultipleTemplates_Deletes()
        {
            var id = ObjectId.GenerateNewId().ToString();
            SetupFind(Template(id), Template(ObjectId.GenerateNewId().ToString()));
            A.CallTo(() => collection.DeleteOneAsync(A<FilterDefinition<LateNoticeTemplate>>._, A<CancellationToken>._))
                .Returns(Task.FromResult<DeleteResult>(new DeleteResult.Acknowledged(1)));

            var result = await controller.Delete(id);

            Assert.IsType<OkObjectResult>(result);
            A.CallTo(() => collection.DeleteOneAsync(A<FilterDefinition<LateNoticeTemplate>>._, A<CancellationToken>._)).MustHaveHappenedOnceExactly();
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
        }

        [Fact]
        public async Task Import_WhenEmpty_InsertsOnlyTemplatesWithContent()
        {
            SetupFind();
            List<LateNoticeTemplate> inserted = null;
            A.CallTo(() => collection.InsertManyAsync(A<IEnumerable<LateNoticeTemplate>>._, A<InsertManyOptions>._, A<CancellationToken>._))
                .Invokes((IEnumerable<LateNoticeTemplate> t, InsertManyOptions o, CancellationToken c) => inserted = t.ToList())
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
    }
}
