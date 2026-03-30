import { expect, test } from '@playwright/test';
import { getExpectedRole, signInThroughRealLogin } from '../../support/test-env';

test.describe('authenticated navigation smoke', () => {
  test.beforeEach(async ({ page }) => {
    await signInThroughRealLogin(page);
  });

  test('authenticated users can reach volunteer workflows', async ({ page }) => {
    await page.goto('/checkin');
    await expect(page).toHaveURL(/\/checkin$/);
    await expect(page.getByRole('heading', { name: /check in books/i })).toBeVisible();

    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByRole('heading', { name: /check out books/i })).toBeVisible();

    await page.goto('/classstats');
    await expect(page).toHaveURL(/\/classstats$/);
    await expect(page.getByLabel(/teacher:/i)).toBeVisible();
  });

  test('admin routes enforce role expectations', async ({ page }) => {
    const expectedRole = getExpectedRole();

    await page.goto('/booklist');

    if (expectedRole === 'admin') {
      await expect(page).toHaveURL(/\/booklist$/);
      await expect(page.getByRole('heading', { name: /book list/i })).toBeVisible();

      await page.goto('/classlists');
      await expect(page).toHaveURL(/\/classlists$/);
      await expect(page.getByRole('heading', { name: /class lists/i })).toBeVisible();
      return;
    }

    // Volunteers cannot access admin pages and are redirected back to volunteer landing flow.
    await expect(page).not.toHaveURL(/\/booklist$/);
    await expect(page).toHaveURL(/\/(|checkin|home)$/);
    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
  });

  test('logout clears the authenticated session', async ({ page }) => {
    await page.goto('/checkin');
    await page.getByRole('button', { name: /logout/i }).click();

    await expect(page).toHaveURL(/\/home$/);

    await page.goto('/checkin');
    await expect(page).toHaveURL(/\/home$/);
  });
});