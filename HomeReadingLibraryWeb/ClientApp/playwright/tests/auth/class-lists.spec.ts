import { expect, test } from '@playwright/test';
import { getExpectedRole, signInThroughRealLogin } from '../../support/test-env';

const mockClasses = {
  data: [
    {
      classId: 'cls-1',
      teacherName: 'Anderson',
      grade: 1,
      students: [
        { firstName: 'Alice', lastName: 'Adams', barCode: 'S1001' },
        { firstName: 'Bob', lastName: 'Baker', barCode: 'S1002' },
      ],
    },
    {
      classId: 'cls-2',
      teacherName: 'Brown',
      grade: 2,
      students: [
        { firstName: 'Charlie', lastName: 'Clark', barCode: 'S2001' },
      ],
    },
  ],
};

test.describe('class lists page', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only page.');

    await page.route('**/api/classes', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockClasses),
        });
      } else {
        await route.continue();
      }
    });

    await signInThroughRealLogin(page);
    await page.goto('/classlists');
  });

  test('shows heading and teacher dropdown on load', async ({ page }) => {
    await expect(page).toHaveURL(/\/classlists$/);
    await expect(page.getByRole('heading', { name: /class lists/i })).toBeVisible();

    const teacherSelect = page.locator('#formClass');
    await expect(teacherSelect).toBeVisible();
    await expect(teacherSelect.locator('option')).toHaveCount(3); // placeholder + 2 classes
  });

  test('teacher dropdown contains class names with grades', async ({ page }) => {
    await expect(page.locator('#formClass option', { hasText: /Anderson/ })).toHaveCount(1);
    await expect(page.locator('#formClass option', { hasText: /Grade: 1/ })).toHaveCount(1);
    await expect(page.locator('#formClass option', { hasText: /Brown/ })).toHaveCount(1);
    await expect(page.locator('#formClass option', { hasText: /Grade: 2/ })).toHaveCount(1);
  });

  test('Add New Class button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /add new class/i })).toBeVisible();
  });

  test('selecting a teacher shows student table with correct data', async ({ page }) => {
    const teacherSelect = page.locator('#formClass');
    await teacherSelect.selectOption({ label: 'Anderson Grade: 1' });

    // ngx-datatable renders cells as datatable-body-cell
    await expect(page.locator('ngx-datatable')).toBeVisible();
    await expect(page.getByText('Alice')).toBeVisible();
    await expect(page.getByText('Adams')).toBeVisible();
    await expect(page.getByText('S1001')).toBeVisible();
    await expect(page.getByText('Bob')).toBeVisible();
    await expect(page.getByText('Baker')).toBeVisible();
    await expect(page.getByText('S1002')).toBeVisible();
  });

  test('selecting a different teacher shows that class students', async ({ page }) => {
    const teacherSelect = page.locator('#formClass');
    await teacherSelect.selectOption({ label: 'Brown Grade: 2' });

    await expect(page.getByText('Charlie')).toBeVisible();
    await expect(page.getByText('Clark')).toBeVisible();
    await expect(page.getByText('S2001')).toBeVisible();

    // Students from first class should not appear
    await expect(page.getByText('Alice')).toHaveCount(0);
  });

  test('add student form is visible when class is selected', async ({ page }) => {
    const teacherSelect = page.locator('#formClass');
    await teacherSelect.selectOption({ label: 'Anderson Grade: 1' });

    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.getByRole('button', { name: /add student/i })).toBeVisible();
  });

  test('add multiple students button is visible when class is selected', async ({ page }) => {
    const teacherSelect = page.locator('#formClass');
    await teacherSelect.selectOption({ label: 'Anderson Grade: 1' });

    await expect(page.getByRole('button', { name: /add multiple students/i })).toBeVisible();
  });

  test('add new class modal opens with teacher name and grade fields', async ({ page }) => {
    await page.getByRole('button', { name: /add new class/i }).click();

    await expect(page.getByRole('heading', { name: /add new class/i })).toBeVisible();
    await expect(page.locator('#teacherName')).toBeVisible();
    await expect(page.locator('#grade')).toBeVisible();
    await expect(page.getByRole('button', { name: /^add class$/i })).toBeVisible();
  });

  test('add new class modal can be closed', async ({ page }) => {
    await page.getByRole('button', { name: /add new class/i }).click();
    await expect(page.getByRole('heading', { name: /add new class/i })).toBeVisible();

    await page.getByLabel('Close').click();
    await expect(page.getByRole('heading', { name: /add new class/i })).toHaveCount(0);
  });

  test('add multiple students modal opens with textarea', async ({ page }) => {
    const teacherSelect = page.locator('#formClass');
    await teacherSelect.selectOption({ label: 'Anderson Grade: 1' });

    await page.getByRole('button', { name: /add multiple students/i }).click();

    await expect(page.getByRole('heading', { name: /add multiple students/i })).toBeVisible();
    await expect(page.locator('#students')).toBeVisible();
    await expect(page.getByRole('button', { name: /upload students/i })).toBeVisible();
  });

  test('adding a student via form updates the class list', async ({ page }) => {
    const updatedClass = {
      ...mockClasses.data[0],
      students: [
        ...mockClasses.data[0].students,
        { firstName: 'Diana', lastName: 'Drake', barCode: 'S1003' },
      ],
    };

    await page.route('**/api/classes/cls-1/students', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: updatedClass }),
        });
      } else {
        await route.continue();
      }
    });

    const teacherSelect = page.locator('#formClass');
    await teacherSelect.selectOption({ label: 'Anderson Grade: 1' });

    await page.locator('#firstName').fill('Diana');
    await page.locator('input[placeholder="Last Name"]').fill('Drake');
    await page.getByRole('button', { name: /add student/i }).click();

    await expect(page.getByText('Diana')).toBeVisible();
    await expect(page.getByText('Drake')).toBeVisible();
  });

  test('adding a class via modal triggers class list refresh', async ({ page }) => {
    const newClass = {
      classId: 'cls-3',
      teacherName: 'Cooper',
      grade: 0,
      students: [],
    };

    await page.route('**/api/classes', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: newClass }),
        });
      } else {
        // Return updated list including new class on subsequent GETs
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [...mockClasses.data, newClass],
          }),
        });
      }
    });

    await page.getByRole('button', { name: /add new class/i }).click();
    await page.locator('#teacherName').fill('Cooper');
    await page.locator('#grade').selectOption('0');
    await page.getByRole('button', { name: /^add class$/i }).click();

    // Success message should appear
    await expect(page.getByText(/successfully added/i)).toBeVisible();
  });
});
