import { expect, test } from '@playwright/test';
import { signInThroughRealLogin } from '../../support/test-env';

test.describe('authenticated history pages', () => {
  test.beforeEach(async ({ page }) => {
    await signInThroughRealLogin(page);
  });

  test('student checkout history supports barcode mode', async ({ page }) => {
    await page.goto('/checkouthistory');

    await expect(page).toHaveURL(/\/checkouthistory$/);
    await expect(page.getByRole('heading', { name: /student check out history/i })).toBeVisible();

    const teacherSelect = page.locator('#formClass');
    await expect(teacherSelect).toBeVisible();
    await teacherSelect.selectOption('barcode');

    await expect(page.locator('#formStudentBarCode')).toBeVisible();
    await expect(page.locator('#formStudent')).toHaveCount(0);
  });

  test('book checkout history shows barcode entry form', async ({ page }) => {
    await page.goto('/bookcheckouthistory');

    await expect(page).toHaveURL(/\/bookcheckouthistory$/);
    await expect(page.getByRole('heading', { name: /book check out history/i })).toBeVisible();
    await expect(page.locator('#formBookBarcode')).toBeVisible();
  });
});
