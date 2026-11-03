import { expect, test, type Page } from '@playwright/test';
import { getExpectedRole, signInThroughRealLogin } from '../../support/test-env';

const anderson = {
  classId: 'cls-1',
  teacherName: 'Anderson',
  grade: 1,
  students: [
    { firstName: 'Alice', lastName: 'Adams', barCode: 'S1001' },
    { firstName: 'Bob', lastName: 'Baker', barCode: 'S1002' },
  ],
};

const brown = {
  classId: 'cls-2',
  teacherName: 'Brown',
  grade: 2,
  students: [{ firstName: 'Charlie', lastName: 'Clark', barCode: 'S2001' }],
};

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

async function selectAnderson(page: Page) {
  await page.locator('#formClass').selectOption({ label: 'Anderson Grade: 1' });
  await expect(page.getByTestId('edit-student-S1001')).toBeVisible();
}

test.describe('class lists editing (admin)', () => {
  let mutations: { method: string; url: string; body: string | null }[];

  test.beforeEach(async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only editing features.');
    mutations = [];

    await page.route('**/api/classes', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill(json({ data: [anderson, brown] }));
      } else {
        await route.continue();
      }
    });

    await page.route('**/api/classes/**', async route => {
      const request = route.request();
      const method = request.method();
      if (method !== 'PUT' && method !== 'DELETE') {
        await route.continue();
        return;
      }

      mutations.push({ method, url: new URL(request.url()).pathname, body: request.postData() });
      const url = new URL(request.url()).pathname;

      if (method === 'PUT' && url.endsWith('/students/S1001')) {
        const body = request.postDataJSON();
        await route.fulfill(json({
          data: {
            ...anderson,
            students: [{ ...anderson.students[0], ...body }, anderson.students[1]],
          },
        }));
      } else if (method === 'DELETE' && url.endsWith('/students/S1001')) {
        await route.fulfill(json({ data: { ...anderson, students: [anderson.students[1]] } }));
      } else if (method === 'PUT' && url.endsWith('/api/classes/cls-1')) {
        const body = request.postDataJSON();
        await route.fulfill(json({ data: { ...anderson, ...body } }));
      } else if (method === 'DELETE' && url.endsWith('/api/classes/cls-1')) {
        await route.fulfill(json({ data: 'cls-1' }));
      } else {
        await route.fulfill({ status: 404 });
      }
    });

    await signInThroughRealLogin(page);
    await page.goto('/classlists');
    await selectAnderson(page);
  });

  test('edits a student name', async ({ page }) => {
    await page.getByTestId('edit-student-S1001').click();
    await expect(page.getByTestId('edit-first-name')).toHaveValue('Alice');
    await expect(page.getByTestId('edit-last-name')).toHaveValue('Adams');

    await page.getByTestId('edit-first-name').fill('Alicia');
    await page.getByTestId('edit-last-name').fill('Adamson');
    await page.getByTestId('save-student').click();

    await expect(page.getByTestId('save-student')).toHaveCount(0);
    await expect(page.getByText('Alicia', { exact: true })).toBeVisible();
    await expect(page.getByText('Adamson', { exact: true })).toBeVisible();
    expect(mutations).toHaveLength(1);
    expect(mutations[0].method).toBe('PUT');
    expect(JSON.parse(mutations[0].body!)).toEqual({ firstName: 'Alicia', lastName: 'Adamson' });
  });

  test('cancelling a student edit makes no request', async ({ page }) => {
    await page.getByTestId('edit-student-S1001').click();
    await page.getByTestId('edit-first-name').fill('Changed');
    await page.getByTestId('cancel-edit-student').click();

    await expect(page.getByTestId('save-student')).toHaveCount(0);
    await expect(page.getByText('Alice', { exact: true })).toBeVisible();
    await expect(page.getByText('Changed')).toHaveCount(0);
    expect(mutations).toHaveLength(0);
  });

  test('removes a student after confirming the checkout history warning', async ({ page }) => {
    await page.getByTestId('remove-student-S1001').click();
    await expect(page.getByText(/checkout history/i)).toBeVisible();
    await expect(page.getByText(/Remove Alice Adams from this class/)).toBeVisible();
    await page.getByTestId('confirm-remove-student').click();

    await expect(page.getByTestId('confirm-remove-student')).toHaveCount(0);
    await expect(page.getByText('S1001')).toHaveCount(0);
    await expect(page.getByText('S1002')).toBeVisible();
    expect(mutations).toHaveLength(1);
    expect(mutations[0].method).toBe('DELETE');
    expect(mutations[0].url).toMatch(/\/api\/classes\/cls-1\/students\/S1001$/);
  });

  test('cancelling a student removal keeps the student', async ({ page }) => {
    await page.getByTestId('remove-student-S1001').click();
    await page.getByTestId('cancel-remove-student').click();

    await expect(page.getByTestId('confirm-remove-student')).toHaveCount(0);
    await expect(page.getByText('S1001')).toBeVisible();
    expect(mutations).toHaveLength(0);
  });

  test('edits the class teacher name and grade', async ({ page }) => {
    await page.getByTestId('edit-class-button').click();
    await expect(page.getByTestId('edit-teacher-name')).toHaveValue('Anderson');
    await expect(page.getByTestId('edit-grade')).toHaveValue('1');

    await page.getByTestId('edit-teacher-name').fill('Andersen');
    await page.getByTestId('edit-grade').fill('3');
    await page.getByTestId('save-class').click();

    await expect(page.getByTestId('save-class')).toHaveCount(0);
    await expect(page.locator('#formClass option', { hasText: 'Andersen Grade: 3' })).toHaveCount(1);
    expect(mutations).toHaveLength(1);
    expect(mutations[0].method).toBe('PUT');
    expect(JSON.parse(mutations[0].body!)).toEqual({ teacherName: 'Andersen', grade: 3 });
  });

  test('cancelling a class edit makes no request', async ({ page }) => {
    await page.getByTestId('edit-class-button').click();
    await page.getByTestId('edit-teacher-name').fill('Nobody');
    await page.getByTestId('cancel-edit-class').click();

    await expect(page.getByTestId('save-class')).toHaveCount(0);
    await expect(page.locator('#formClass option', { hasText: 'Anderson Grade: 1' })).toHaveCount(1);
    expect(mutations).toHaveLength(0);
  });

  test('deletes a class after confirming', async ({ page }) => {
    await page.getByTestId('delete-class-button').click();
    await expect(page.getByText(/cannot be undone/i)).toBeVisible();
    await page.getByTestId('confirm-delete-class').click();

    await expect(page.getByTestId('confirm-delete-class')).toHaveCount(0);
    await expect(page.locator('#formClass option', { hasText: 'Anderson' })).toHaveCount(0);
    await expect(page.locator('#formClass option', { hasText: 'Brown' })).toHaveCount(1);
    await expect(page.locator('ngx-datatable')).toHaveCount(0);
    expect(mutations).toHaveLength(1);
    expect(mutations[0].method).toBe('DELETE');
    expect(mutations[0].url).toMatch(/\/api\/classes\/cls-1$/);
  });

  test('cancelling a class deletion keeps the class', async ({ page }) => {
    await page.getByTestId('delete-class-button').click();
    await page.getByTestId('cancel-delete-class').click();

    await expect(page.getByTestId('confirm-delete-class')).toHaveCount(0);
    await expect(page.locator('#formClass option', { hasText: 'Anderson' })).toHaveCount(1);
    await expect(page.getByTestId('edit-student-S1001')).toBeVisible();
    expect(mutations).toHaveLength(0);
  });
});
