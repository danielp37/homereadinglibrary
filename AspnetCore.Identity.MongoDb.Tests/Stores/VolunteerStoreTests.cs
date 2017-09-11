using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AspnetCore.Identity.MongoDb.Entities;
using AspnetCore.Identity.MongoDb.Stores;
using FakeItEasy;
using MongoDB.Driver;
using Xunit;

namespace AspnetCore.Identity.MongoDb.Tests.Stores
{

  public class VolunteerStoreTests
  {
    private IMongoDatabase mongodb;
    private IMongoCollection<Volunteer> volunteerCollection;

    [Fact]
    public async Task CreateAsync_NullVolunteer_ThrowsArgumentNullException()
    {
      var volunteerStore = BuildVolunteerStore();

      await Assert.ThrowsAsync<ArgumentNullException>(async () => await volunteerStore.CreateAsync(null, CancellationToken.None));
    }

    [Fact]
    public async Task CreateAsync_ValidVolunteer_InsertOneAsyncCalledAndResultIsSuccess()
    {
      var volunteerStore = BuildVolunteerStore();
      var volunteer = BuildVolunteer();


      var result = await volunteerStore.CreateAsync(volunteer, CancellationToken.None);

      Assert.True(result.Succeeded);
      A.CallTo(() => volunteerCollection.InsertOneAsync(volunteer, A<InsertOneOptions>.Ignored, A<CancellationToken>.Ignored))
       .MustHaveHappened(Repeated.Exactly.Once);
    }

    [Fact]
    public async Task CreateAsync_CancelledToken_OperationCanceledException()
    {
      var volunteerStore = BuildVolunteerStore();
      var volunteer = BuildVolunteer();
      var token = new CancellationToken(true);

      await Assert.ThrowsAsync<OperationCanceledException>(async () => await volunteerStore.CreateAsync(volunteer, token));
    }

    [Fact]
    public async Task FindByIdAsync_NullUserId_ArgumentNullException()
    {
      var volunteerStore = BuildVolunteerStore();

      await Assert.ThrowsAsync<ArgumentNullException>(async () => await volunteerStore.FindByIdAsync(null, CancellationToken.None));
    }

    [Fact]
    public async Task FindByIdAsync_UserIdExists_VolunteeredReturned()
    {
      var volunteerStore = BuildVolunteerStore();
      var volunteer = BuildVolunteer();
      IAsyncCursor<Volunteer> asyncCursor = BuildIAsyncCursor(new[] { volunteer });

      A.CallTo(() => volunteerCollection.FindAsync<Volunteer>(A<FilterDefinition<Volunteer>>.Ignored,
                                                              A<FindOptions<Volunteer, Volunteer>>.Ignored, A<CancellationToken>.Ignored))
       .Returns(Task.FromResult(asyncCursor));

      var returnVolunteer = await volunteerStore.FindByIdAsync(volunteer.Id, CancellationToken.None);

      Assert.Same(volunteer, returnVolunteer);
    }

    [Fact]
    public async Task FindByIdAsync_CancelledToken_OperationCanceledException()
    {
      var volunteerStore = BuildVolunteerStore();
      var volunteer = BuildVolunteer();
      var token = new CancellationToken(true);

      await Assert.ThrowsAsync<OperationCanceledException>(async () => await volunteerStore.FindByIdAsync(volunteer.Id, token));
    }

    private static IAsyncCursor<Volunteer> BuildIAsyncCursor(IEnumerable<Volunteer> volunteers)
    {
      var asyncCursor = A.Fake<IAsyncCursor<Volunteer>>();
      A.CallTo(() => asyncCursor.Current)
       .Returns(volunteers);
      A.CallTo(() => asyncCursor.MoveNext(A<CancellationToken>.Ignored))
       .Returns(volunteers.GetEnumerator().MoveNext());
      A.CallTo(() => asyncCursor.MoveNextAsync(A<CancellationToken>.Ignored))
       .Returns(Task.FromResult(volunteers.GetEnumerator().MoveNext()));
      return asyncCursor;
    }

    private Volunteer BuildVolunteer()
    {
      return new Volunteer
      {
        UserName = "Test"
      };
    }

    private VolunteerStore BuildVolunteerStore()
    {
      mongodb = A.Fake<IMongoDatabase>();
      volunteerCollection = A.Fake<IMongoCollection<Volunteer>>();
      A.CallTo(() => mongodb.GetCollection<Volunteer>("volunteers", A<MongoCollectionSettings>.Ignored))
        .Returns(volunteerCollection);
      return new VolunteerStore(mongodb);
    }
  }
}
