using System;
using System.Threading;
using System.Threading.Tasks;
using AspnetCore.Identity.MongoDb.Entities;
using Microsoft.AspNetCore.Identity;

namespace AspnetCore.Identity.MongoDb.Stores
{
  public class VolunteerRoleStore : IRoleStore<VolunteerRole>
  {
    public VolunteerRoleStore()
    {
    }

    public Task<IdentityResult> CreateAsync(VolunteerRole role, CancellationToken cancellationToken)
    {
      throw new NotImplementedException();
    }

    public Task<IdentityResult> DeleteAsync(VolunteerRole role, CancellationToken cancellationToken)
    {
      throw new NotImplementedException();
    }

    public Task<VolunteerRole> FindByIdAsync(string roleId, CancellationToken cancellationToken)
    {
      throw new NotImplementedException();
    }

    public Task<VolunteerRole> FindByNameAsync(string normalizedRoleName, CancellationToken cancellationToken)
    {
      throw new NotImplementedException();
    }

    public Task<string> GetNormalizedRoleNameAsync(VolunteerRole role, CancellationToken cancellationToken)
    {
      throw new NotImplementedException();
    }

    public Task<string> GetRoleIdAsync(VolunteerRole role, CancellationToken cancellationToken)
    {
      throw new NotImplementedException();
    }

    public Task<string> GetRoleNameAsync(VolunteerRole role, CancellationToken cancellationToken)
    {
      throw new NotImplementedException();
    }

    public Task SetNormalizedRoleNameAsync(VolunteerRole role, string normalizedName, CancellationToken cancellationToken)
    {
      throw new NotImplementedException();
    }

    public Task SetRoleNameAsync(VolunteerRole role, string roleName, CancellationToken cancellationToken)
    {
      throw new NotImplementedException();
    }

    public Task<IdentityResult> UpdateAsync(VolunteerRole role, CancellationToken cancellationToken)
    {
      throw new NotImplementedException();
    }

    #region IDisposable Support
    private bool disposedValue = false; // To detect redundant calls

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
    // ~VolunteerRoleStore() {
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
