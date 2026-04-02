import { defineConfig, devices, type PlaywrightTestConfig, type Project } from '@playwright/test';

const baseURL = process.env.BAGGY_E2E_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? 'https://localhost:5001';
const requestedRole = process.env.BAGGY_E2E_ROLE ?? 'volunteer';
const hasAuthCredentials = requestedRole === 'volunteer' || Boolean(process.env.BAGGY_E2E_USERNAME && process.env.BAGGY_E2E_PASSWORD);
const useManagedLocalStack =
  !process.env.BAGGY_E2E_BASE_URL &&
  !process.env.PLAYWRIGHT_BASE_URL &&
  process.env.BAGGY_E2E_USE_LOCAL_STACK !== 'false';

const projects: Project[] = [
  {
    name: 'chromium-public',
    testMatch: /public\/.*\.spec\.ts/,
    use: {
      ...devices['Desktop Chrome']
    }
  }
];

if (hasAuthCredentials) {
  projects.push(
    {
      name: 'chromium-authenticated',
      testMatch: /auth\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome']
      }
    }
  );
}

export default defineConfig({
  testDir: './playwright/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  timeout: 90_000,
  expect: {
    timeout: 15_000
  },
  use: {
    baseURL,
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: useManagedLocalStack
    ? [
        {
          command: 'npm start -- --host 127.0.0.1 --port 4200',
          url: 'http://localhost:4200/home',
          cwd: '.',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          stdout: 'pipe',
          stderr: 'pipe'
        },
        {
          command: 'dotnet run --project ..\\HomeReadingLibraryWeb.csproj --launch-profile HomeReadingLibraryWeb',
          url: 'https://localhost:5001',
          cwd: '.',
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
          ignoreHTTPSErrors: true,
          stdout: 'pipe',
          stderr: 'pipe'
        }

      ]
    : undefined,
  projects: projects as PlaywrightTestConfig['projects']
});