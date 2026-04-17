# Developer Quick Reference: Playwright Test Setup

## For Test Development and Debugging

### Step 1: Create Local Config File

In `HomeReadingLibraryWeb/ClientApp/`, create `.env.local`:

**Option A: Using Volunteer Role (Simplest)**
```bash
cat > .env.local << 'EOF'
{
  "baseUrl": "https://localhost:5001",
  "role": "volunteer",
  "useLocalStack": true
}
EOF
```

**Option B: Using Admin Role (If You Have Admin Credentials)**
```bash
cat > .env.local << 'EOF'
{
  "baseUrl": "https://localhost:5001",
  "role": "admin",
  "username": "admin@example.com",
  "password": "YourPassword123!",
  "useLocalStack": true
}
EOF
```

### Step 2: Install Dependencies (First Time Only)
```bash
cd HomeReadingLibraryWeb/ClientApp
npm install
```

### Step 3: Run Tests

```bash
# All tests (uses .env.local)
npm run e2e

# See what's happening (headed mode)
npm run e2e:headed

# Interactive browser control
npm run e2e:ui

# Just one test file
npx playwright test tests/public/home.spec.ts

# Just public tests (no auth needed)
npx playwright test --project chromium-public

# Just auth tests (needs credentials)
npx playwright test --project chromium-authenticated

# Watch specific test and re-run on changes
npx playwright test tests/auth/checkout.spec.ts --watch

# Debug with inspector
npx playwright test --debug
```

## Configuration Examples for Different Scenarios

### Scenario 1: Local Testing (Default)
**File**: `.env.local`
```json
{
  "baseUrl": "https://localhost:5001",
  "role": "volunteer",
  "useLocalStack": true
}
```
**Run**: `npm run e2e`
**Notes**: Starts both Angular dev server and .NET API locally

### Scenario 2: Testing Against Running Servers
**File**: `.env.local`
```json
{
  "baseUrl": "https://localhost:5001",
  "role": "volunteer",
  "useLocalStack": false
}
```
**Prerequisites**: 
```bash
# Terminal 1: Angular dev server
npm start

# Terminal 2: .NET API
cd ../
dotnet run --project HomeReadingLibraryWeb.csproj --launch-profile HomeReadingLibraryWeb
```
**Run**: `npm run e2e`

### Scenario 3: Testing Staging Environment
**File**: `.env.local`
```json
{
  "baseUrl": "https://staging.homereadinglibrary.com",
  "role": "volunteer",
  "useLocalStack": false
}
```
**Run**: `npm run e2e`

### Scenario 4: Testing with Admin Privileges
**File**: `.env.local`
```json
{
  "baseUrl": "https://localhost:5001",
  "role": "admin",
  "username": "admin@example.com",
  "password": "your-admin-password",
  "useLocalStack": true
}
```
**Run**: `npm run e2e`
**Result**: Runs both public and authenticated tests with admin role

### Scenario 5: Custom Identity Provider
**File**: `.env.local`
```json
{
  "baseUrl": "https://localhost:5001",
  "role": "admin",
  "username": "admin@custom-idp.com",
  "password": "your-password",
  "loginUrl": "https://custom-idp.com/oauth/authorize",
  "usernameSelector": "input#email",
  "passwordSelector": "input#password",
  "submitSelector": "button#loginBtn",
  "useLocalStack": true
}
```
**Run**: `npm run e2e`

## Common Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run e2e` | Run all tests |
| `npm run e2e:headed` | Run with browser visible |
| `npm run e2e:ui` | Interactive UI mode |
| `npx playwright test --debug` | Debug mode with inspector |
| `npx playwright test --grep "pattern"` | Run tests matching pattern |
| `npx playwright test path/to/file.spec.ts` | Run single file |
| `npx playwright test --project chromium-public` | Public tests only |
| `npx playwright test --project chromium-authenticated` | Auth tests only |
| `npx playwright test --headed --project chromium-public` | Public tests with browser |
| `npx playwright show-report` | View HTML test report |

## Troubleshooting

### Tests Skip Authenticated Tests
**Problem**: Chromium-authenticated project doesn't run
**Solution**: Add credentials to `.env.local`:
```json
{
  "username": "admin@example.com",
  "password": "your-password"
}
```

### "Could not locate login field"
**Problem**: Selector doesn't match your identity provider UI
**Solution**: Override in `.env.local`:
```json
{
  "usernameSelector": "input#your-email-field",
  "passwordSelector": "input#your-password-field"
}
```

### Tests Connect to Wrong Server
**Problem**: Using staging URL instead of localhost
**Solution**: Check `.env.local` or environment variables:
```bash
# View loaded config
cat .env.local
# Or clear and recreate
rm .env.local
cat > .env.local << 'EOF'
{
  "baseUrl": "https://localhost:5001"
}
EOF
```

### Cannot Start Local Stack
**Problem**: "Port 5001 already in use" or Angular dev server fails
**Solution**: Set `useLocalStack: false` and start servers manually:
```json
{
  "baseUrl": "https://localhost:5001",
  "useLocalStack": false
}
```

## File Locations

```
HomeReadingLibraryWeb/
├── ClientApp/
│   ├── .env.local (CREATE THIS - gitignored, has your secrets)
│   ├── playwright/
│   │   ├── config/
│   │   │   ├── load-config.ts (config loader)
│   │   │   └── credentials.example.json (template, committed to repo)
│   │   ├── tests/
│   │   │   ├── public/ (no auth required)
│   │   │   └── auth/ (auth required)
│   │   └── support/
│   │       └── test-env.ts (helpers)
│   ├── playwright.config.ts (uses config loader)
│   ├── PLAYWRIGHT_SETUP.md (this guide)
│   └── PLAYWRIGHT_CONFIG.md (detailed docs)
└── ...
```

## Environment Variables (Alternative to .env.local)

If you prefer environment variables instead of `.env.local`:

**Bash/Linux/macOS**:
```bash
export BAGGY_E2E_BASE_URL="https://localhost:5001"
export BAGGY_E2E_ROLE="volunteer"
export BAGGY_E2E_USERNAME="admin@example.com"
export BAGGY_E2E_PASSWORD="your-password"
npm run e2e
```

**Windows PowerShell**:
```powershell
$env:BAGGY_E2E_BASE_URL = "https://localhost:5001"
$env:BAGGY_E2E_ROLE = "volunteer"
$env:BAGGY_E2E_USERNAME = "admin@example.com"
$env:BAGGY_E2E_PASSWORD = "your-password"
npm run e2e
```

**Windows Command Prompt**:
```cmd
set BAGGY_E2E_BASE_URL=https://localhost:5001
set BAGGY_E2E_ROLE=volunteer
set BAGGY_E2E_USERNAME=admin@example.com
set BAGGY_E2E_PASSWORD=your-password
npm run e2e
```

## Complete Local Setup Workflow

```bash
# 1. Navigate to ClientApp
cd HomeReadingLibraryWeb/ClientApp

# 2. Create local config
cat > .env.local << 'EOF'
{
  "baseUrl": "https://localhost:5001",
  "role": "volunteer",
  "useLocalStack": true
}
EOF

# 3. Install dependencies (first time only)
npm install

# 4. Run tests
npm run e2e

# 5. View report
npx playwright show-report

# 6. Iterate: edit test, re-run
npm run e2e:headed
```

## Next: Detailed Documentation

For more details, selector customization, CI/CD setup, and advanced options:
👉 See **[PLAYWRIGHT_CONFIG.md](./PLAYWRIGHT_CONFIG.md)**
