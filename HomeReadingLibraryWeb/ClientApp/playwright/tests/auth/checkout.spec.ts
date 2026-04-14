import { expect, test } from '@playwright/test';
import { signInThroughRealLogin } from '../../support/test-env';

const mockStudent = {
  teacherName: 'Mrs. Smith',
  student: { firstName: 'Jane', lastName: 'Doe' },
};

const mockBook = {
  bookCopyBarCode: 'T2002',
  title: "Charlotte's Web",
  author: 'E.B. White',
  guidedReadingLevel: 'E',
  boxNumber: '1',
  bookId: 'abc123',
  isLost: false,
  isDamaged: false,
  comments: '',
};

test.describe('check-out page', () => {
  test.beforeEach(async ({ page }) => {
    await signInThroughRealLogin(page);
  });

  test('shows student barcode input and add new student button on load', async ({ page }) => {
    await page.goto('/checkout');

    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByRole('heading', { name: /check out books/i })).toBeVisible();
    await expect(page.locator('#formStudentBarCode')).toBeVisible();
    await expect(page.locator('#formStudentBarCode')).toBeEditable();
    await expect(page.getByRole('button', { name: /add new student/i })).toBeVisible();
  });

  test('book barcode field is absent until student barcode is entered', async ({ page }) => {
    await page.goto('/checkout');

    await expect(page.locator('#formBookBarcode')).toHaveCount(0);
  });

  test('reveals student info and book barcode after valid student barcode scan', async ({ page }) => {
    await page.route('**/api/students/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockStudent),
      });
    });

    await page.goto('/checkout');
    await page.locator('#formStudentBarCode').fill('S0042');
    await page.locator('#formStudentBarCode').press('Enter');

    await expect(page.locator('#formBookBarcode')).toBeVisible();
    await expect(page.getByText(/Mrs\. Smith/)).toBeVisible();
    await expect(page.getByText(/Jane Doe/)).toBeVisible();
  });

  test('add new student modal shows class dropdown after opening', async ({ page }) => {
    await page.route('**/api/classes', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ classId: 'c1', teacherName: 'Mrs. Brown', grade: '3' }] }),
      });
    });

    await page.goto('/checkout');
    await page.getByRole('button', { name: /add new student/i }).click();

    await expect(page.getByRole('heading', { name: /add new student/i })).toBeVisible();
    await expect(page.locator('#formClass')).toBeVisible();
    await expect(page.locator('#formClass option', { hasText: /Mrs\. Brown/i })).toHaveCount(1);
  });

  test('logs successful checkout after full barcode entry flow', async ({ page }) => {
    await page.route('**/api/students/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockStudent),
      });
    });
    await page.route('**/api/books/bookcopies/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBook),
      });
    });
    await page.route('**/api/bookcopyreservations', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      } else {
        await route.continue();
      }
    });

    await page.goto('/checkout');
    await page.locator('#formStudentBarCode').fill('S0042');
    await page.locator('#formStudentBarCode').press('Enter');
    await expect(page.locator('#formBookBarcode')).toBeVisible();

    await page.locator('#formBookBarcode').fill('T2002');
    await page.locator('#formBookBarcode').press('Enter');

    const successEntry = page.locator('span.bg-success').first();
    await expect(successEntry).toBeVisible();
    await expect(successEntry).toContainText("Charlotte's Web");
    await expect(successEntry).toContainText('Jane Doe');
  });
});
