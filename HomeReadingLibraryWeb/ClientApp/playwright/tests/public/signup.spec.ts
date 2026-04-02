import { expect, test } from '@playwright/test';

test.describe('public volunteer signup form', () => {
  test('shows required contact fields and action buttons', async ({ page }) => {
    await page.goto('/signup');

    const firstName = page.locator('#formFirstName');
    const lastName = page.locator('#formLastName');
    const phone = page.locator('#formPhone');
    const email = page.locator('#formEmail');

    await expect(firstName).toBeVisible();
    await expect(lastName).toBeVisible();
    await expect(phone).toBeVisible();
    await expect(email).toBeVisible();

    await expect(firstName).toHaveAttribute('required', '');
    await expect(lastName).toHaveAttribute('required', '');
    await expect(phone).toHaveAttribute('required', '');
    await expect(email).toHaveAttribute('required', '');

    await expect(page.getByRole('button', { name: /add volunteer to class/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /remove volunteer from class/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /add new volunteer/i })).toBeVisible();
  });

  test('accepts contact input values', async ({ page }) => {
    await page.goto('/signup');

    const firstName = page.locator('#formFirstName');
    const lastName = page.locator('#formLastName');
    const phone = page.locator('#formPhone');
    const email = page.locator('#formEmail');

    await firstName.fill('Playwright');
    await lastName.fill('Volunteer');
    await phone.fill('(555) 555-1234');
    await email.fill('playwright@example.com');

    await expect(firstName).toHaveValue('Playwright');
    await expect(lastName).toHaveValue('Volunteer');
    await expect(phone).toHaveValue('(555) 555-1234');
    await expect(email).toHaveValue('playwright@example.com');
  });
});
