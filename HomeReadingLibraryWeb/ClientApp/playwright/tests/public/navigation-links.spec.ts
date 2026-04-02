import { expect, test } from '@playwright/test';

test.describe('public navigation links', () => {
  test('home sign-in link navigates to account sign-in page', async ({ page }) => {
    await page.goto('/home');

    await page.getByRole('link', { name: /sign in as volunteer/i }).click();
    await expect(page).toHaveURL(/\/account\/signin(\?.*)?$/i);
    await expect(page.locator('#classDropdown')).toBeVisible();
  });

  test('home registration link navigates to volunteer signup page', async ({ page }) => {
    await page.goto('/home');

    await page.getByRole('link', { name: /register as a new volunteer/i }).click();
    await expect(page).toHaveURL(/\/signup$/i);
    await expect(page.locator('#formFirstName')).toBeVisible();
  });
});
