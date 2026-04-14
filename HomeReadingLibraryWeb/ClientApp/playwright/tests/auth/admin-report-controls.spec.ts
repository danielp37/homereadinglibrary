import { expect, test } from '@playwright/test';
import { getExpectedRole, signInThroughRealLogin } from '../../support/test-env';

test.describe('admin report controls', () => {
  test.beforeEach(async ({ page }) => {
    await signInThroughRealLogin(page);
  });

  test('books checked out report exposes filters and search controls', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only report page checks.');

    await page.goto('/bookscheckedout');
    await expect(page).toHaveURL(/\/bookscheckedout$/);
    await expect(page.getByRole('heading', { name: /books checked out/i })).toBeVisible();

    await expect(page.locator('#daysBack')).toBeVisible();
    await expect(page.locator('#showOnlyMultiples')).toBeVisible();
    await expect(page.locator('#searchType')).toBeVisible();
    await expect(page.locator('#searchText')).toBeVisible();

    await expect(page.getByRole('button', { name: /^submit$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^search$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /export to file/i })).toBeVisible();
  });

  test('volunteer logons report exposes date filter and table headers', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only report page checks.');

    await page.goto('/logons');
    await expect(page).toHaveURL(/\/logons$/);
    await expect(page.getByRole('heading', { name: /volunteer logons/i })).toBeVisible();

    await expect(page.locator('#daysBack')).toBeVisible();
    await expect(page.getByRole('button', { name: /^submit$/i })).toBeVisible();

    await expect(page.getByRole('columnheader', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /classes/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /firstlogon/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /lastlogon/i })).toBeVisible();
  });

  test('books checked out report accepts filter updates before submit', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only report page checks.');

    await page.goto('/bookscheckedout');

    const daysBack = page.locator('#daysBack');
    const showOnlyMultiples = page.locator('#showOnlyMultiples');
    const searchType = page.locator('#searchType');
    const searchText = page.locator('#searchText');

    await daysBack.fill('7');
    await showOnlyMultiples.check();
    await searchType.selectOption('Teacher');
    await searchText.fill('smith');

    await page.getByRole('button', { name: /^submit$/i }).click();

    await expect(page).toHaveURL(/\/bookscheckedout$/);
    await expect(daysBack).toHaveValue('7');
    await expect(showOnlyMultiples).toBeChecked();
    await expect(searchType).toHaveValue('Teacher');
    await expect(searchText).toHaveValue('smith');
  });

  test('volunteer logons report allows changing days back before submit', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only report page checks.');

    await page.goto('/logons');

    const daysBack = page.locator('#daysBack');
    await daysBack.fill('30');
    await page.getByRole('button', { name: /^submit$/i }).click();

    await expect(page).toHaveURL(/\/logons$/);
    await expect(daysBack).toHaveValue('30');
  });
});
