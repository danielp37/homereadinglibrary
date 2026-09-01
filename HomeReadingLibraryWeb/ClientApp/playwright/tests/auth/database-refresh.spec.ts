import { expect, test } from '@playwright/test';
import { getExpectedRole, signInThroughRealLogin } from '../../support/test-env';

// Compute today's date in MM/dd/yyyy to match the component's confirmation token
function todayString(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

const successResponse = {
  message: 'Database refreshed successfully.',
  backupSuffix: 'backup_20240830120000'
};

const mockHistory = [
  { username: 'admin@school.org', refreshedAt: '2024-08-30T12:00:00Z', backupSuffix: 'backup_20240830120000' }
];

// ---------------------------------------------------------------------------
// Page structure — no API interaction
// ---------------------------------------------------------------------------

test.describe('database-refresh — page structure', () => {
  test.beforeEach(async ({ page }) => {
    await signInThroughRealLogin(page);
  });

  test('admin can see "Year-End Database Refresh" in the Admin dropdown nav', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin only');

    // Navigate to a stable page (home redirects logged-in users to /checkin)
    await page.goto('/checkin');
    const adminDropdown = page.locator('span[ngbDropdownToggle]').filter({ hasText: /admin/i });
    await adminDropdown.click();

    await expect(page.getByRole('link', { name: /year-end database refresh/i })).toBeVisible();
  });

  test('navigating to /databaserefresh shows the page heading', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin only');

    await page.goto('/databaserefresh');
    await expect(page).toHaveURL(/databaserefresh/);
    await expect(page.getByRole('heading', { name: /year-end database refresh/i })).toBeVisible();
  });

  test('danger alert warning is shown on page load', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin only');

    await page.goto('/databaserefresh');
    const dangerAlert = page.locator('.alert-danger');
    await expect(dangerAlert).toBeVisible();
    await expect(dangerAlert).toContainText(/destructive operation/i);
    await expect(dangerAlert).toContainText(/cannot be undone/i);
  });

  test('danger alert lists all data that will be deleted', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin only');

    await page.goto('/databaserefresh');
    const dangerAlert = page.locator('.alert-danger');
    await expect(dangerAlert).toContainText(/reservations/i);
    await expect(dangerAlert).toContainText(/volunteer/i);
    await expect(dangerAlert).toContainText(/classes/i);
    await expect(dangerAlert).toContainText(/lost.*damaged/i);
  });

  test('danger alert mentions that a backup will be created', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin only');

    await page.goto('/databaserefresh');
    await expect(page.locator('.alert-danger')).toContainText(/backup/i);
  });

  test('confirmation input field is present on page load', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin only');

    await page.goto('/databaserefresh');
    await expect(page.locator('#confirmInput')).toBeVisible();
  });

  test('refresh button is disabled on page load before any input', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin only');

    await page.goto('/databaserefresh');
    await expect(page.getByRole('button', { name: /refresh database/i })).toBeDisabled();
  });

  test('refresh button stays disabled when wrong text is entered', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin only');

    await page.goto('/databaserefresh');
    await page.locator('#confirmInput').fill('wrong');
    await expect(page.getByRole('button', { name: /refresh database/i })).toBeDisabled();
  });

  test('refresh button enables only when today\'s date is typed correctly', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin only');

    await page.goto('/databaserefresh');
    await page.locator('#confirmInput').fill(todayString());
    await expect(page.getByRole('button', { name: /refresh database/i })).toBeEnabled();
  });

  test('previous refreshes section is visible on page load', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin only');

    await page.goto('/databaserefresh');
    await expect(page.getByRole('heading', { name: /previous refreshes/i })).toBeVisible();
  });

  test('non-admin role cannot access /databaserefresh and is redirected', async ({ page }) => {
    test.skip(getExpectedRole() === 'admin', 'Non-admin only');

    await page.goto('/databaserefresh');
    await expect(page).not.toHaveURL(/databaserefresh/);
  });
});

// ---------------------------------------------------------------------------
// Successful refresh — mocked API
// ---------------------------------------------------------------------------

test.describe('database-refresh — successful refresh', () => {
  test.beforeEach(async ({ page }) => {
    await signInThroughRealLogin(page);
    await page.route('**/api/databaserefresh', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(successResponse)
        });
      } else if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      } else {
        await route.continue();
      }
    });
  });

  test('clicking Refresh Database with correct date shows success message', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin only');

    await page.goto('/databaserefresh');
    await page.locator('#confirmInput').fill(todayString());
    await page.getByRole('button', { name: /refresh database/i }).click();

    await expect(page.locator('.alert-success')).toBeVisible();
    await expect(page.locator('.alert-success')).toContainText(/refreshed successfully/i);
    await expect(page.locator('.alert-success')).toContainText(/backup/i);
  });

  test('confirmation form is hidden after a successful refresh', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin only');

    await page.goto('/databaserefresh');
    await page.locator('#confirmInput').fill(todayString());
    await page.getByRole('button', { name: /refresh database/i }).click();

    await expect(page.locator('.alert-success')).toBeVisible();
    await expect(page.locator('.card.border-danger')).toHaveCount(0);
  });

  test('POST request is sent with confirmationText in body', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin only');

    let capturedBody: string | null = null;
    await page.route('**/api/databaserefresh', async route => {
      if (route.request().method() === 'POST') {
        capturedBody = route.request().postData();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(successResponse)
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      }
    });

    await page.goto('/databaserefresh');
    await page.locator('#confirmInput').fill(todayString());
    await page.getByRole('button', { name: /refresh database/i }).click();

    await expect(page.locator('.alert-success')).toBeVisible();
    expect(capturedBody).toBeTruthy();
    const body = JSON.parse(capturedBody!);
    expect(body.confirmationText).toBe(todayString());
  });

  test('history table shows records after a successful refresh', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin only');

    let getCallCount = 0;
    await page.route('**/api/databaserefresh', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(successResponse) });
      } else {
        getCallCount++;
        // Return mock history on second GET (after refresh)
        const history = getCallCount > 1 ? mockHistory : [];
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(history) });
      }
    });

    await page.goto('/databaserefresh');
    await page.locator('#confirmInput').fill(todayString());
    await page.getByRole('button', { name: /refresh database/i }).click();

    await expect(page.locator('.alert-success')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('table')).toContainText('admin@school.org');
  });
});

// ---------------------------------------------------------------------------
// API error — mocked API
// ---------------------------------------------------------------------------

test.describe('database-refresh — API error handling', () => {
  test.beforeEach(async ({ page }) => {
    await signInThroughRealLogin(page);
    await page.route('**/api/databaserefresh', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error during refresh.' })
        });
      } else if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      } else {
        await route.continue();
      }
    });
  });

  test('shows error alert when API returns an error', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin only');

    await page.goto('/databaserefresh');
    await page.locator('#confirmInput').fill(todayString());
    await page.getByRole('button', { name: /refresh database/i }).click();

    await expect(page.locator('.alert-warning')).toBeVisible();
  });

  test('form remains visible after an error so user can retry', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin only');

    await page.goto('/databaserefresh');
    await page.locator('#confirmInput').fill(todayString());
    await page.getByRole('button', { name: /refresh database/i }).click();

    await expect(page.locator('.alert-warning')).toBeVisible();
    await expect(page.locator('.card.border-danger')).toBeVisible();
  });
});
