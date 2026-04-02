import { expect, test } from '@playwright/test';

test.describe('public sign-in page', () => {
  test('teacher selection reveals volunteer buttons', async ({ page }) => {
    await page.goto('/account/signin');

    await expect(page).toHaveURL(/\/account\/signin/i);
    await expect(
      page.getByRole('heading', { name: /select a teacher from the dropdown and then click on your name to login/i })
    ).toBeVisible();

    const classDropdown = page.locator('#classDropdown');
    await expect(classDropdown).toBeVisible();

    const teacherOptions = classDropdown.locator('option[value]:not([value=""])');
    const teacherOptionCount = await teacherOptions.count();
    expect(teacherOptionCount).toBeGreaterThan(0);

    const firstClassId = await teacherOptions.first().getAttribute('value');
    expect(firstClassId).toBeTruthy();

    await classDropdown.selectOption(firstClassId!);

    const volunteerButtons = page.locator(`div[data-class='${firstClassId}'] button[name='volunteer']`);
    await expect(volunteerButtons.first()).toBeVisible();
  });

  test('admin login modal exposes credential fields', async ({ page }) => {
    await page.goto('/account/signin');

    await page.getByRole('button', { name: /^admin login$/i }).click();

    const modal = page.locator('#adminLoginModel');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: /^admin login$/i })).toBeVisible();
    await expect(modal.locator('#username')).toBeVisible();
    await expect(modal.locator('#password')).toBeVisible();
    await expect(modal.locator('button[type="submit"]')).toBeVisible();
  });
});
