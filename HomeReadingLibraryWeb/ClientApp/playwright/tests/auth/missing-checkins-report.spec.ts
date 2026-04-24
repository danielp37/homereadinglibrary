import { expect, test } from '@playwright/test';
import { getExpectedRole, signInThroughRealLogin } from '../../support/test-env';

const mockMissingCheckinsData = {
  data: [
    {
      studentFirstName: 'Alice',
      studentLastName: 'Smith',
      bookTitle: 'The Great Adventure',
      bookCopyBarCode: 'BC001',
      readingLevel: 'M',
      boxNumber: 'Box 3',
      checkedOutDate: '2024-01-15T00:00:00Z'
    },
    {
      studentFirstName: 'Bob',
      studentLastName: 'Jones',
      bookTitle: 'Science Fun',
      bookCopyBarCode: 'BC002',
      readingLevel: 'J',
      boxNumber: 'Box 1',
      checkedOutDate: '2024-02-01T00:00:00Z'
    }
  ]
};

test.describe('missing check-ins report — navigation and page structure', () => {
  test.beforeEach(async ({ page }) => {
    await signInThroughRealLogin(page);
  });

  test('admin can see "Possible Missing Check-ins" in the Reports dropdown nav', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'This test is only for admin users');

    await page.goto('/home');
    const reportsDropdown = page.locator('span[ngbDropdownToggle]').filter({ hasText: /reports/i });
    await reportsDropdown.click();

    await expect(page.getByRole('link', { name: /possible missing check-ins/i })).toBeVisible();
  });

  test('navigating to /missingcheckins shows the heading "Possible Missing Check-ins"', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'This test is only for admin users');

    await page.goto('/missingcheckins');
    await expect(page).toHaveURL(/missingcheckins/);
    await expect(page.getByRole('heading', { name: /possible missing check-ins/i })).toBeVisible();
  });

  test('Run Report button is visible on page load', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'This test is only for admin users');

    await page.goto('/missingcheckins');
    await expect(page.getByRole('button', { name: /run report/i })).toBeVisible();
  });

  test('report does not auto-run on page load — no table or "No data found" visible', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'This test is only for admin users');

    await page.goto('/missingcheckins');
    await expect(page.locator('table')).toHaveCount(0);
    await expect(page.getByText(/no data found/i)).toHaveCount(0);
  });
});

test.describe('missing check-ins report — data and empty state', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/reports/missingcheckins', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockMissingCheckinsData),
      });
    });

    await signInThroughRealLogin(page);
  });

  test('shows table with correct column headers and 2 data rows after clicking Run Report', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'This test is only for admin users');

    await page.goto('/missingcheckins');
    await page.getByRole('button', { name: /run report/i }).click();

    await expect(page.getByRole('columnheader', { name: /last name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /first name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /book title/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /barcode/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /reading level/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /box number/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /checked out/i })).toBeVisible();

    await expect(page.locator('tbody tr')).toHaveCount(2);
  });
});

test.describe('missing check-ins report — empty state', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/reports/missingcheckins', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await signInThroughRealLogin(page);
  });

  test('shows "No data found" and no table rows when endpoint returns empty data', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'This test is only for admin users');

    await page.goto('/missingcheckins');
    await page.getByRole('button', { name: /run report/i }).click();

    await expect(page.getByText(/no data found/i)).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(0);
  });
});
