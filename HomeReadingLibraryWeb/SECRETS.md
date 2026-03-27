# Local Development Secrets

Sensitive configuration (MongoDB connection string, JWT signing key, and Duende license key) is stored in user secrets for local development. These are not committed to source control.

## Setup

From the `HomeReadingLibraryWeb` directory, run:

```powershell
dotnet user-secrets set "ConnectionStrings:mongodb" "your-mongodb-connection-string"
dotnet user-secrets set "JwtKey" "your-jwt-signing-key"
dotnet user-secrets set "Duende:LicenseKey" "your-duende-license-key"
```

## Configuration Priority

The app reads these values in the following order:

1. **User secrets** (Development only) - `dotnet user-secrets set`
2. **Environment variables** - `CUSTOMCONNSTR_mongodb` and `JWT_Key` (used by Azure and other hosts)
3. **appsettings** - `mongodb.connectionString` in appsettings (MongoDB only)

## Verifying

To list your configured secrets (values are hidden):

```powershell
dotnet user-secrets list
```
