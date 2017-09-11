using System;
using System.Diagnostics.Contracts;
using System.Threading;
using System.Threading.Tasks;
using AspnetCore.Identity.MongoDb.Entities;
using Microsoft.AspNetCore.Identity;
using MongoDB.Driver;

namespace AspnetCore.Identity.MongoDb.Stores
{
  public class VolunteerStore : IUserStore<Volunteer>, IUserPasswordStore<Volunteer>
  {
    private bool disposedValue = false; // To detect redundant calls
    private readonly IMongoDatabase _mongoDatabase;
    private readonly IMongoCollection<Volunteer> _volunteerCollection;

    public VolunteerStore(IMongoDatabase mongoDatabase)
    {
      _mongoDatabase = mongoDatabase;
      _volunteerCollection = GetVolunteerCollection();
    }

    public async Task<IdentityResult> CreateAsync(Volunteer user, CancellationToken cancellationToken)
    {
      if (user == null)
        throw new ArgumentNullException(nameof(user));

      cancellationToken.ThrowIfCancellationRequested();
      await _volunteerCollection.InsertOneAsync(user, cancellationToken: cancellationToken).ConfigureAwait(false);

      return IdentityResult.Success;
    }

    public async Task<Volunteer> FindByIdAsync(string userId, CancellationToken cancellationToken)
    {
      if (userId == null)
        throw new ArgumentNullException(nameof(userId));

      cancellationToken.ThrowIfCancellationRequested();

      var filter = Builders<Volunteer>.Filter.Eq(v => v.Id, userId);
      var foundVolunteer = await (await _volunteerCollection.FindAsync<Volunteer>(filter)).SingleOrDefaultAsync();

      return foundVolunteer;
    }

    public Task<IdentityResult> DeleteAsync(Volunteer user, CancellationToken cancellationToken)
    {
      throw new NotImplementedException();
    }

    public async Task<Volunteer> FindByNameAsync(string normalizedUserName, CancellationToken cancellationToken)
    {
      if (normalizedUserName == null)
        throw new ArgumentNullException(nameof(normalizedUserName));

      cancellationToken.ThrowIfCancellationRequested();

      var filter = Builders<Volunteer>.Filter.Eq(v => v.NormalizedUserName, normalizedUserName);
      var foundVolunteer = await(await _volunteerCollection.FindAsync<Volunteer>(filter)).SingleOrDefaultAsync();

      return foundVolunteer;
    }

    public Task<string> GetNormalizedUserNameAsync(Volunteer user, CancellationToken cancellationToken)
    {
      return Task.FromResult(user.NormalizedUserName);
    }

    public Task<string> GetUserIdAsync(Volunteer user, CancellationToken cancellationToken)
    {
      return Task.FromResult(user.Id);
    }

    public Task<string> GetUserNameAsync(Volunteer user, CancellationToken cancellationToken)
    {
      return Task.FromResult(user.UserName);
    }

    public Task SetNormalizedUserNameAsync(Volunteer user, string normalizedName, CancellationToken cancellationToken)
    {
      user.NormalizedUserName = normalizedName;
      return Task.CompletedTask;
    }

    public Task SetUserNameAsync(Volunteer user, string userName, CancellationToken cancellationToken)
    {
      throw new NotImplementedException();
    }

    public Task<IdentityResult> UpdateAsync(Volunteer user, CancellationToken cancellationToken)
    {
      throw new NotImplementedException();
    }

    private IMongoCollection<Volunteer> GetVolunteerCollection()
    {
      return _mongoDatabase.GetCollection<Volunteer>("volunteers");
    }

    public Task SetPasswordHashAsync(Volunteer user, string passwordHash, CancellationToken cancellationToken)
    {
      user.PasswordHash = passwordHash;
      return Task.CompletedTask;
    }

    public Task<string> GetPasswordHashAsync(Volunteer user, CancellationToken cancellationToken)
    {
      return Task.FromResult(user.PasswordHash);
    }

    public Task<bool> HasPasswordAsync(Volunteer user, CancellationToken cancellationToken)
    {
      return Task.FromResult(!string.IsNullOrWhiteSpace(user.PasswordHash));
    }

    #region IDisposable Support


    protected virtual void Dispose(bool disposing)
    {
      if (!disposedValue)
      {
        if (disposing)
        {
          // TODO: dispose managed state (managed objects).
        }

        // TODO: free unmanaged resources (unmanaged objects) and override a finalizer below.
        // TODO: set large fields to null.

        disposedValue = true;
      }
    }

    // TODO: override a finalizer only if Dispose(bool disposing) above has code to free unmanaged resources.
    // ~VolunteerStore() {
    //   // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
    //   Dispose(false);
    // }

    // This code added to correctly implement the disposable pattern.
    public void Dispose()
    {
      // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
      Dispose(true);
      // TODO: uncomment the following line if the finalizer is overridden above.
      // GC.SuppressFinalize(this);
    }


    #endregion
  }
}
