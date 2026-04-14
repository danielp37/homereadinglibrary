import { expect, test } from '@playwright/test';
import { getExpectedRole, signInThroughRealLogin } from '../../support/test-env';

test.describe('authenticated role-aware navigation', () => {
  test.beforeEach(async ({ page }) => {
    await signInThroughRealLogin(page);
  });

  test('navigation menu shows expected items for the current role', async ({ page }) => {
    const expectedRole = getExpectedRole();

    await page.goto('/home');

    await expect(page.getByRole('link', { name: /^Home$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Check Out$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Check In$/i })).toBeVisible();

    await page.goto('/booklist');
    if (expectedRole === 'admin') {
      await expect(page).toHaveURL(/\/booklist$/);
      return;
    }

    await expect(page).not.toHaveURL(/\/booklist$/);
  });

  test('admin-only report routes enforce role expectations', async ({ page }) => {
    const expectedRole = getExpectedRole();

    await page.goto('/bookscheckedout');

    if (expectedRole === 'admin') {
      await expect(page).toHaveURL(/\/bookscheckedout$/);
      await expect(page.getByRole('heading', { name: /books checked out/i })).toBeVisible();

      await page.goto('/logons');
      await expect(page).toHaveURL(/\/logons$/);
      await expect(page.getByRole('heading', { name: /volunteer logons/i })).toBeVisible();
      return;
    }

    await expect(page).not.toHaveURL(/\/bookscheckedout$/);
    await expect(page).toHaveURL(/\/(|checkin|home)$/);

    await page.goto('/logons');
    await expect(page).not.toHaveURL(/\/logons$/);
    await expect(page).toHaveURL(/\/(|checkin|home)$/);
  });
});
