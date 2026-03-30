import { expect, test } from '@playwright/test';

test.describe('public access', () => {
  test('home page shows volunteer entry actions', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/home$/);
    await expect(
      page.getByRole('heading', { name: /welcome to the grovecrest home reading library/i })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in as volunteer/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /register as a new volunteer/i })).toBeVisible();
  });

  test('unauthenticated users are redirected away from protected routes', async ({ page }) => {
    await page.goto('/checkin');

    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole('link', { name: /sign in as volunteer/i })).toBeVisible();
  });
});