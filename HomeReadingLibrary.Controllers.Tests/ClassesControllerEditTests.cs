using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using FakeItEasy;
using HomeReadingLibrary.Controllers.Controllers;
using HomeReadingLibrary.Domain.Entities;
using HomeReadingLibrary.Domain.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using Xunit;

namespace HomeReadingLibrary.Controllers.Tests
{
    public class ClassesControllerEditTests
    {
        private readonly IMongoDatabase mongoDatabase = A.Fake<IMongoDatabase>();
        private readonly IMongoCollection<Class> classCollection = A.Fake<IMongoCollection<Class>>();
        private readonly IBookCopyReservationService reservationService = A.Fake<IBookCopyReservationService>();
        private readonly ClassesController controller;

        private FilterDefinition<Class> capturedFilter;
        private UpdateDefinition<Class> capturedUpdate;

        public ClassesControllerEditTests()
        {
            A.CallTo(() => mongoDatabase.GetCollection<Class>("classes", null)).Returns(classCollection);
            controller = new ClassesController(mongoDatabase, reservationService);
        }

        private static BsonDocument Render(UpdateDefinition<Class> update) =>
            Normalize(update.Render(new RenderArgs<Class>(BsonSerializer.LookupSerializer<Class>(), BsonSerializer.SerializerRegistry)).AsBsonDocument);

        private static BsonDocument Render(FilterDefinition<Class> filter) =>
            Normalize(filter.Render(new RenderArgs<Class>(BsonSerializer.LookupSerializer<Class>(), BsonSerializer.SerializerRegistry)));

        // The camelCase convention is registered at app startup, so lowercase names to stay convention-agnostic.
        private static BsonDocument Normalize(BsonDocument doc)
        {
            var result = new BsonDocument();
            foreach (var element in doc)
            {
                result[element.Name.ToLowerInvariant()] = element.Value is BsonDocument child ? Normalize(child) : element.Value;
            }
            return result;
        }

        private void SetupUpdate(long matched)
        {
            A.CallTo(() => classCollection.UpdateOneAsync(A<FilterDefinition<Class>>._, A<UpdateDefinition<Class>>._, A<UpdateOptions>._, A<CancellationToken>._))
                .Invokes((FilterDefinition<Class> f, UpdateDefinition<Class> u, UpdateOptions o, CancellationToken c) =>
                {
                    capturedFilter = f;
                    capturedUpdate = u;
                })
                .Returns(Task.FromResult<UpdateResult>(new UpdateResult.Acknowledged(matched, matched, null)));
        }

        private void SetupFind(Class result)
        {
            var cursor = A.Fake<IAsyncCursor<Class>>();
            A.CallTo(() => cursor.MoveNextAsync(A<CancellationToken>._)).ReturnsNextFromSequence(Task.FromResult(true), Task.FromResult(false));
            A.CallTo(() => cursor.Current).Returns(result == null ? new List<Class>() : new List<Class> { result });
            A.CallTo(() => classCollection.FindAsync(A<FilterDefinition<Class>>._, A<FindOptions<Class, Class>>._, A<CancellationToken>._))
                .Returns(Task.FromResult(cursor));
        }

        private void SetupDelete(long deleted)
        {
            A.CallTo(() => classCollection.DeleteOneAsync(A<FilterDefinition<Class>>._, A<CancellationToken>._))
                .Invokes((FilterDefinition<Class> f, CancellationToken c) => capturedFilter = f)
                .Returns(Task.FromResult<DeleteResult>(new DeleteResult.Acknowledged(deleted)));
        }

        private void AssertReservationsUntouched()
        {
            A.CallTo(mongoDatabase).Where(call => call.Method.Name == "GetCollection" && call.Method.GetGenericArguments()[0] != typeof(Class))
                .MustNotHaveHappened();
            Assert.Empty(Fake.GetCalls(reservationService));
        }

        [Theory]
        [InlineData("UpdateStudent", typeof(HttpPutAttribute), "{classId}/students/{barCode}")]
        [InlineData("DeleteStudent", typeof(HttpDeleteAttribute), "{classId}/students/{barCode}")]
        [InlineData("UpdateClass", typeof(HttpPutAttribute), "{classId}")]
        [InlineData("DeleteClass", typeof(HttpDeleteAttribute), "{classId}")]
        public void EditEndpoints_AreAdminOnlyWithExpectedRoute(string methodName, System.Type verb, string template)
        {
            var method = typeof(ClassesController).GetMethod(methodName);
            var authorize = method.GetCustomAttribute<AuthorizeAttribute>();
            Assert.Equal("Bearer", authorize.AuthenticationSchemes);
            Assert.Equal("AdminUser", authorize.Policy);
            var http = (Microsoft.AspNetCore.Mvc.Routing.HttpMethodAttribute)method.GetCustomAttribute(verb);
            Assert.Equal(template, http.Template);
        }

        [Fact]
        public async Task UpdateStudent_Success_UsesPositionalUpdateAndReturnsClass()
        {
            var updated = new Class { ClassId = "c1" };
            SetupUpdate(1);
            SetupFind(updated);

            var result = await controller.UpdateStudent("c1", "2025123", new ClassesController.UpdateStudentBody { FirstName = "Ann", LastName = "Lee" });

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Same(updated, ok.Value.GetType().GetProperty("Data").GetValue(ok.Value));
            var set = Render(capturedUpdate)["$set"].AsBsonDocument;
            Assert.Equal("Ann", set["students.$.firstname"].AsString);
            Assert.Equal("Lee", set["students.$.lastname"].AsString);
            Assert.True(set.Contains("students.$.modifieddate"));
            Assert.True(Render(capturedUpdate)["$currentdate"].AsBsonDocument.Contains("modifieddate"));
            var filter = Render(capturedFilter).ToString();
            Assert.Contains("c1", filter);
            Assert.Contains("2025123", filter);
        }

        [Fact]
        public async Task UpdateStudent_ClassOrStudentMissing_ReturnsNotFound()
        {
            SetupUpdate(0);

            var result = await controller.UpdateStudent("c1", "nope", new ClassesController.UpdateStudentBody { FirstName = "A", LastName = "B" });

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task UpdateStudent_InvalidModel_ReturnsBadRequestWithoutUpdating()
        {
            controller.ModelState.AddModelError("FirstName", "required");

            var result = await controller.UpdateStudent("c1", "1", new ClassesController.UpdateStudentBody { LastName = "B" });

            Assert.IsType<BadRequestObjectResult>(result);
            A.CallTo(() => classCollection.UpdateOneAsync(A<FilterDefinition<Class>>._, A<UpdateDefinition<Class>>._, A<UpdateOptions>._, A<CancellationToken>._))
                .MustNotHaveHappened();
        }

        [Fact]
        public async Task UpdateStudent_NullBody_ReturnsBadRequest()
        {
            Assert.IsType<BadRequestObjectResult>(await controller.UpdateStudent("c1", "1", null));
        }

        [Theory]
        [InlineData(null, "Lee")]
        [InlineData("Ann", null)]
        [InlineData("", "Lee")]
        public void UpdateStudentBody_RequiresBothNames(string first, string last)
        {
            var body = new ClassesController.UpdateStudentBody { FirstName = first, LastName = last };
            Assert.False(Validator.TryValidateObject(body, new ValidationContext(body), new List<ValidationResult>(), true));
        }

        [Fact]
        public async Task DeleteStudent_Success_PullsStudentAndLeavesReservationsAlone()
        {
            var updated = new Class { ClassId = "c1" };
            SetupUpdate(1);
            SetupFind(updated);

            var result = await controller.DeleteStudent("c1", "2025123");

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Same(updated, ok.Value.GetType().GetProperty("Data").GetValue(ok.Value));
            var doc = Render(capturedUpdate);
            Assert.Equal("2025123", doc["$pull"]["students"]["barcode"].AsString);
            Assert.True(doc["$currentdate"].AsBsonDocument.Contains("modifieddate"));
            AssertReservationsUntouched();
        }

        [Fact]
        public async Task DeleteStudent_WithCheckoutsOrReservations_StillSucceeds()
        {
            // A student with open checkouts is removed the same way; the controller never consults reservations.
            A.CallTo(() => reservationService.GetStudentReservationsForClass(A<string>._))
                .Returns(Task.FromResult<IList<StudentWithReservationHistory>>(new List<StudentWithReservationHistory>
                {
                    new StudentWithReservationHistory { Reservations = new List<BookCopyReservation> { new BookCopyReservation { StudentBarCode = "2025123" } } }
                }));
            SetupUpdate(1);
            SetupFind(new Class { ClassId = "c1" });

            var result = await controller.DeleteStudent("c1", "2025123");

            Assert.IsType<OkObjectResult>(result);
            A.CallTo(reservationService).Where(c => c.Method.Name != "GetStudentReservationsForClass").MustNotHaveHappened();
            AssertReservationsUntouched();
        }

        [Fact]
        public async Task DeleteStudent_Missing_ReturnsNotFound()
        {
            SetupUpdate(0);

            Assert.IsType<NotFoundResult>(await controller.DeleteStudent("c1", "nope"));
        }

        [Fact]
        public async Task UpdateClass_Success_SetsTeacherAndGrade()
        {
            var updated = new Class { ClassId = "c1" };
            SetupUpdate(1);
            SetupFind(updated);

            var result = await controller.UpdateClass("c1", new ClassesController.UpdateClassBody { TeacherName = "Ms. Frizzle", Grade = 3 });

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Same(updated, ok.Value.GetType().GetProperty("Data").GetValue(ok.Value));
            var doc = Render(capturedUpdate);
            Assert.Equal("Ms. Frizzle", doc["$set"]["teachername"].AsString);
            Assert.Equal(3, doc["$set"]["grade"].ToInt32());
            Assert.True(doc["$currentdate"].AsBsonDocument.Contains("modifieddate"));
        }

        [Fact]
        public async Task UpdateClass_Missing_ReturnsNotFound()
        {
            SetupUpdate(0);

            Assert.IsType<NotFoundResult>(await controller.UpdateClass("c1", new ClassesController.UpdateClassBody { TeacherName = "T" }));
        }

        [Fact]
        public async Task UpdateClass_InvalidModel_ReturnsBadRequest()
        {
            controller.ModelState.AddModelError("TeacherName", "required");

            Assert.IsType<BadRequestObjectResult>(await controller.UpdateClass("c1", new ClassesController.UpdateClassBody()));
            Assert.IsType<BadRequestObjectResult>(await controller.UpdateClass("c1", null));
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        public void UpdateClassBody_RequiresTeacherName(string teacher)
        {
            var body = new ClassesController.UpdateClassBody { TeacherName = teacher, Grade = 2 };
            Assert.False(Validator.TryValidateObject(body, new ValidationContext(body), new List<ValidationResult>(), true));
        }

        [Fact]
        public async Task DeleteClass_Success_ReturnsDeletedClassId()
        {
            SetupDelete(1);

            var result = await controller.DeleteClass("c1");

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("c1", ok.Value.GetType().GetProperty("Data").GetValue(ok.Value));
            Assert.Contains("c1", Render(capturedFilter).ToString());
        }

        [Fact]
        public async Task DeleteClass_WithStudentsHavingCheckouts_StillSucceedsAndLeavesReservations()
        {
            SetupDelete(1);

            var result = await controller.DeleteClass("c1");

            Assert.IsType<OkObjectResult>(result);
            AssertReservationsUntouched();
        }

        [Fact]
        public async Task DeleteClass_Missing_ReturnsNotFound()
        {
            SetupDelete(0);

            Assert.IsType<NotFoundResult>(await controller.DeleteClass("nope"));
        }
    }
}
