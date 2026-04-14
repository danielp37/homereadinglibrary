import { expect, test } from '@playwright/test';
import { signInThroughRealLogin } from '../../support/test-env';

test.describe('check-in page', () => {
  test.beforeEach(async ({ page }) => {
    await signInThroughRealLogin(page);
  });

  test('shows book barcode input on load', async ({ page }) => {
    await page.goto('/checkin');

    await expect(page).toHaveURL(/\/checkin$/);
    await expect(page.getByRole('heading', { name: /check in books/i })).toBeVisible();
    await expect(page.locator('#formBookBarcode')).toBeVisible();
    await expect(page.locator('#formBookBarcode')).toBeEditable();
  });

  test('shows success log entry after valid barcode scan', async ({ page }) => {
    await page.route('**/api/books/bookcopies/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          bookCopyBarCode: 'T1001',
          title: "Charlotte's Web",
          author: 'E.B. White',
          guidedReadingLevel: 'E',
          boxNumber: '1',
          bookId: 'abc123',
          isLost: false,
          isDamaged: false,
          comments: '',
        }),
      });
    });
    await page.route('**/api/bookcopyreservations/checkin/**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/checkin');
    await page.locator('#formBookBarcode').fill('T1001');
    await page.locator('#formBookBarcode').press('Enter');

    const successEntry = page.locator('span.bg-success').first();
    await expect(successEntry).toBeVisible();
    await expect(successEntry).toContainText("Charlotte's Web");
  });

  test('shows error log entry for unknown barcode', async ({ page }) => {
    await page.route('**/api/books/bookcopies/**', async route => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify('Book copy not found'),
      });
    });

    await page.goto('/checkin');
    await page.locator('#formBookBarcode').fill('NOTREAL999');
    await page.locator('#formBookBarcode').press('Enter');

    await expect(page.locator('.bg-warning').first()).toBeVisible();
  });
});
