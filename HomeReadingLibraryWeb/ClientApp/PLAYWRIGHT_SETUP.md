# Playwright E2E Tests - Configuration Summary

This project now supports configuration-based credentials for Playwright E2E tests with **environment variables** (CI/CD) and **local config files** (local development).

## Quick Start

### For Local Development

Create `.env.local` in `HomeReadingLibraryWeb/ClientApp/`:

```bash
{
  "baseUrl": "https://localhost:5001",
  "role": "volunteer",
  "username": "admin@example.com",
  "password": "your-password",
  "useLocalStack": true
}
```

Then run:
```bash
cd HomeReadingLibraryWeb/ClientApp
npm run e2e
```

### For CI/CD

Set environment variables:
```bash
export BAGGY_E2E_BASE_URL="https://localhost:5001"
export BAGGY_E2E_ROLE="volunteer"
export BAGGY_E2E_USERNAME="admin@example.com"
export BAGGY_E2E_PASSWORD="your-password"
```

## Configuration Files Created

| File | Purpose |
|------|---------|
| `playwright/config/load-config.ts` | Configuration loader with priority: env vars → config file → defaults |
| `playwright/config/credentials.example.json` | Template showing available config options |
| `PLAYWRIGHT_CONFIG.md` | Comprehensive documentation (40+ examples) |
| `.gitignore` | Updated to exclude local credential files |

## Configuration Priority

1. **Environment Variables** (highest priority - overrides everything)
2. **Config Files** (for local development; checked in order):
   - `.env.local`
   - `config/credentials.local.json`
   - `playwright/config/credentials.local.json`
3. **Defaults** (lowest priority - sensible defaults)

## Available Configuration Options

- `baseUrl` - Application URL (default: `https://localhost:5001`)
- `role` - Test role: `volunteer` or `admin` (default: `volunteer`)
- `username` - Username for authenticated tests
- `password` - Password for authenticated tests
- `loginUrl` - Custom login page URL
- `usernameSelector` - CSS selector for username field
- `passwordSelector` - CSS selector for password field
- `nextSelector` - CSS selector for "next" button
- `submitSelector` - CSS selector for submit button
- `postLoginConfirmSelector` - CSS selector for confirmation button
- `useLocalStack` - Start local dev servers (default: `true`)

## Environment Variables Supported

All options can be overridden via environment variables with `BAGGY_E2E_` prefix:
- `BAGGY_E2E_BASE_URL`
- `BAGGY_E2E_ROLE`
- `BAGGY_E2E_USERNAME`
- `BAGGY_E2E_PASSWORD`
- `BAGGY_E2E_LOGIN_URL`
- `BAGGY_E2E_USERNAME_SELECTOR`
- `BAGGY_E2E_PASSWORD_SELECTOR`
- `BAGGY_E2E_NEXT_SELECTOR`
- `BAGGY_E2E_SUBMIT_SELECTOR`
- `BAGGY_E2E_POST_LOGIN_CONFIRM_SELECTOR`
- `BAGGY_E2E_USE_LOCAL_STACK`
- `PLAYWRIGHT_BASE_URL` (standard Playwright variable)

## Running Tests

```bash
# All tests
npm run e2e

# With headed browser (visible)
npm run e2e:headed

# UI mode (interactive)
npm run e2e:ui

# Specific test file
npx playwright test tests/public/home.spec.ts

# Public tests only
npx playwright test --project chromium-public

# Authenticated tests (if credentials available)
npx playwright test --project chromium-authenticated

# Specific test pattern
npx playwright test --grep "sign-in"

# Debug mode
npx playwright test --debug
```

## Security Notes

✅ **Gitignored**: All local credential files are excluded from git:
- `.env.local`
- `config/credentials.local.json`
- `playwright/config/credentials.local.json`

✅ **No secrets in repo**: Example file is gitignored; only `credentials.example.json` is committed

✅ **CI/CD safe**: Environment variables are the recommended approach for CI/CD pipelines

## Implementation Details

**Files Modified:**
- `playwright.config.ts` - Now uses config loader
- `playwright/support/test-env.ts` - Now uses config loader
- `.gitignore` - Added patterns for local credential files

**Files Created:**
- `playwright/config/load-config.ts` - Loads credentials with priority system
- `playwright/config/credentials.example.json` - Template
- `PLAYWRIGHT_CONFIG.md` - Detailed documentation

## See Also

For comprehensive guide including examples, troubleshooting, and advanced options, see: **[PLAYWRIGHT_CONFIG.md](./PLAYWRIGHT_CONFIG.md)**
