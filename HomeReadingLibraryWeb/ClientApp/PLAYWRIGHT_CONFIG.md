# Playwright E2E Tests Configuration Guide

This guide explains how to configure and run Playwright E2E tests for HomeReadingLibrary with local credentials and environment variables.

## Configuration Priority

Credentials and settings are loaded with the following priority (highest to lowest):

1. **Environment Variables** (CI/CD, local shell, `.env` files)
2. **Config Files** (local development without committing secrets)
3. **Defaults** (sensible defaults for public/unauthenticated tests)

## Configuration Methods

### Method 1: Environment Variables (Recommended for CI/CD)

Set environment variables before running tests:

```bash
# Bash/Linux/macOS
export BAGGY_E2E_BASE_URL="https://localhost:5001"
export BAGGY_E2E_ROLE="volunteer"
export BAGGY_E2E_USERNAME="admin@example.com"
export BAGGY_E2E_PASSWORD="YourPassword123!"

# Windows PowerShell
$env:BAGGY_E2E_BASE_URL = "https://localhost:5001"
$env:BAGGY_E2E_ROLE = "volunteer"
$env:BAGGY_E2E_USERNAME = "admin@example.com"
$env:BAGGY_E2E_PASSWORD = "YourPassword123!"
```

#### Supported Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BAGGY_E2E_BASE_URL` | Application base URL | `https://localhost:5001` |
| `PLAYWRIGHT_BASE_URL` | Playwright's standard base URL | (not set) |
| `BAGGY_E2E_ROLE` | Test role (`admin` or `volunteer`) | `volunteer` |
| `BAGGY_E2E_USERNAME` | Username for authenticated tests | (empty) |
| `BAGGY_E2E_PASSWORD` | Password for authenticated tests | (empty) |
| `BAGGY_E2E_LOGIN_URL` | Custom login page URL | (auto-detected) |
| `BAGGY_E2E_USERNAME_SELECTOR` | CSS selector for username field | (auto-detected) |
| `BAGGY_E2E_PASSWORD_SELECTOR` | CSS selector for password field | (auto-detected) |
| `BAGGY_E2E_NEXT_SELECTOR` | CSS selector for "next" button | (auto-detected) |
| `BAGGY_E2E_SUBMIT_SELECTOR` | CSS selector for submit button | (auto-detected) |
| `BAGGY_E2E_POST_LOGIN_CONFIRM_SELECTOR` | CSS selector for confirmation button | (auto-detected) |
| `BAGGY_E2E_USE_LOCAL_STACK` | Start local dev servers (`true` or `false`) | `true` |

### Method 2: Configuration File (Recommended for Local Development)

Create a JSON configuration file in one of these locations:

#### Option A: `.env.local` in ClientApp root (Simplest)

```bash
# File: HomeReadingLibraryWeb/ClientApp/.env.local
cat > .env.local << 'EOF'
{
  "baseUrl": "https://localhost:5001",
  "role": "volunteer",
  "username": "admin@example.com",
  "password": "YourSecurePassword123!",
  "useLocalStack": true
}
EOF
```

#### Option B: `config/credentials.local.json`

```bash
# File: HomeReadingLibraryWeb/ClientApp/config/credentials.local.json
mkdir -p config
cat > config/credentials.local.json << 'EOF'
{
  "baseUrl": "https://localhost:5001",
  "role": "volunteer",
  "username": "admin@example.com",
  "password": "YourSecurePassword123!"
}
EOF
```

#### Option C: `playwright/config/credentials.local.json`

```bash
# File: HomeReadingLibraryWeb/ClientApp/playwright/config/credentials.local.json
cat > playwright/config/credentials.local.json << 'EOF'
{
  "baseUrl": "https://localhost:5001",
  "role": "volunteer",
  "username": "admin@example.com",
  "password": "YourSecurePassword123!"
}
EOF
```

#### Configuration File Schema

```json
{
  "baseUrl": "https://localhost:5001",
  "role": "volunteer",
  "username": "your-username",
  "password": "your-password",
  "loginUrl": "https://your-identity-provider.com/account/login",
  "usernameSelector": "input[name='username']",
  "passwordSelector": "input[name='password']",
  "nextSelector": "button:has-text('Next')",
  "submitSelector": "button:has-text('Sign in')",
  "postLoginConfirmSelector": "button:has-text('Yes')",
  "useLocalStack": true
}
```

All fields are optional; unspecified fields use defaults or environment variables.

## Running Tests

### Prerequisites

1. Navigate to the ClientApp directory:
```bash
cd HomeReadingLibraryWeb/ClientApp
```

2. Install dependencies:
```bash
npm install
```

### Run All Tests

```bash
# Default: uses volunteer role, auto-detects base URL, starts local stack
npm run test:playwright

# With env vars
export BAGGY_E2E_BASE_URL="https://localhost:5001"
npm run test:playwright
```

### Run Specific Test Suites

```bash
# Public tests only (no authentication required)
npx playwright test --grep @public

# Authenticated tests (requires volunteer credentials)
npx playwright test --grep @auth
```

### Run Tests by Project

```bash
# Public pages only
npx playwright test --project chromium-public

# Authenticated pages only (if credentials available)
npx playwright test --project chromium-authenticated
```

### Run with Custom Configuration

#### Using Environment Variables

```bash
# Linux/macOS
BAGGY_E2E_BASE_URL="https://example.com" BAGGY_E2E_ROLE="admin" BAGGY_E2E_USERNAME="admin@example.com" BAGGY_E2E_PASSWORD="pass123" npm run test:playwright

# Windows PowerShell
$env:BAGGY_E2E_BASE_URL="https://example.com"; $env:BAGGY_E2E_ROLE="admin"; $env:BAGGY_E2E_USERNAME="admin@example.com"; $env:BAGGY_E2E_PASSWORD="pass123"; npm run test:playwright
```

#### Using Config File

```bash
# Create .env.local and run (auto-loaded)
cat > .env.local << 'EOF'
{
  "baseUrl": "https://staging.example.com",
  "role": "admin",
  "username": "admin@example.com",
  "password": "staging-password"
}
EOF

npm run test:playwright
```

### Advanced Options

```bash
# Debug mode (opens inspector)
npx playwright test --debug

# Run with headed browser (see the browser)
npx playwright test --headed

# Run single test file
npx playwright test tests/public/home.spec.ts

# Run tests matching pattern
npx playwright test --grep "sign-in"

# Generate and open HTML report
npx playwright test
npx playwright show-report
```

## Best Practices

### Local Development Setup

1. **Create `.env.local` in `HomeReadingLibraryWeb/ClientApp/`:**
```bash
cd HomeReadingLibraryWeb/ClientApp
cat > .env.local << 'EOF'
{
  "baseUrl": "https://localhost:5001",
  "role": "volunteer",
  "username": "admin@example.com",
  "password": "your-local-password",
  "useLocalStack": true
}
EOF
chmod 600 .env.local  # Restrict permissions on Unix-like systems
```

2. **Never commit credentials:**
   - Files matching `*credentials*.local.json`, `*credentials*.local`, and `.env.local` are gitignored
   - Always use local config files for secrets in development
   - Use environment variables in CI/CD pipelines

3. **Share templates, not secrets:**
   - Use `credentials.example.json` as a template for team members
   - Document required fields in project README

### CI/CD Pipeline Setup

In GitHub Actions or other CI/CD:

```yaml
env:
  BAGGY_E2E_BASE_URL: ${{ secrets.E2E_BASE_URL }}
  BAGGY_E2E_ROLE: ${{ secrets.E2E_ROLE }}
  BAGGY_E2E_USERNAME: ${{ secrets.E2E_USERNAME }}
  BAGGY_E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}

- name: Run Playwright tests
  run: |
    cd HomeReadingLibraryWeb/ClientApp
    npm ci
    npm run test:playwright
```

### Troubleshooting

#### Tests skip authenticated tests
**Symptom:** `chromium-authenticated` project doesn't run

**Cause:** Missing credentials

**Solution:**
- Set `BAGGY_E2E_USERNAME` and `BAGGY_E2E_PASSWORD` environment variables, OR
- Create a config file with username and password fields

#### Wrong base URL
**Symptom:** Tests connect to wrong server

**Cause:** Config load order issue

**Solution:**
1. Check which config file was loaded (check console output)
2. Verify environment variables: `echo $BAGGY_E2E_BASE_URL` (Unix) or `echo $env:BAGGY_E2E_BASE_URL` (PowerShell)
3. Ensure environment variables take precedence

#### Selector mismatch errors
**Symptom:** "Could not locate login field" or similar

**Cause:** UI changed or custom identity provider has different selectors

**Solution:**
- Override selectors in config file:
```json
{
  "usernameSelector": "input#email",
  "passwordSelector": "input#pass"
}
```

## Configuration Examples

### Local Development (Volunteer Tests)

```json
{
  "baseUrl": "https://localhost:5001",
  "role": "volunteer",
  "useLocalStack": true
}
```

### Local Development (Admin Tests)

```json
{
  "baseUrl": "https://localhost:5001",
  "role": "admin",
  "username": "admin@example.com",
  "password": "your-local-password",
  "useLocalStack": true
}
```

### Staging Environment

```json
{
  "baseUrl": "https://staging.homereadinglibrary.com",
  "role": "volunteer",
  "useLocalStack": false
}
```

### Production Smoke Tests

```json
{
  "baseUrl": "https://homereadinglibrary.com",
  "role": "volunteer",
  "useLocalStack": false
}
```

## Test Structure

### Public Tests
Located in `tests/public/`:
- No authentication required
- Test public-facing features (home page, sign-in form, etc.)
- Run on `chromium-public` project

### Authenticated Tests
Located in `tests/auth/`:
- Require valid credentials
- Test logged-in features (checkout, book list, admin controls, etc.)
- Run on `chromium-authenticated` project (if credentials available)
- Automatically skip if credentials are missing

## Implementation Details

The configuration system is implemented in:
- `playwright/config/load-config.ts` - Configuration loader
- `playwright.config.ts` - Playwright configuration (uses loader)
- `playwright/support/test-env.ts` - Test helper functions (uses loader)

Configuration is loaded once at test startup and cached for all tests.
