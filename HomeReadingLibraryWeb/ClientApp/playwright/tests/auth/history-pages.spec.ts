import { expect, test } from '@playwright/test';
import { signInThroughRealLogin } from '../../support/test-env';

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
  ],
};

const mockStudentReservations = {
  count: 2,
  data: [
    {
      id: 'res-1',
      bookCopy: {
        bookCopyBarCode: 'T1001',
        title: "Charlotte's Web",
        author: 'E.B. White',
        guidedReadingLevel: 'E',
        boxNumber: '1',
        isLost: false,
        isDamaged: false,
        comments: '',
      },
      student: {
        studentBarCode: 'S1001',
        firstName: 'Alice',
        lastName: 'Adams',
        teacherName: 'Anderson',
        grade: 1,
      },
      checkedOutDate: '2025-11-01T00:00:00Z',
      checkedOutBy: 'Volunteer A',
      checkedInDate: '2025-11-08T00:00:00Z',
      checkedInBy: 'Volunteer B',
    },
    {
      id: 'res-2',
      bookCopy: {
        bookCopyBarCode: 'T2002',
        title: 'Green Eggs and Ham',
        author: 'Dr. Seuss',
        guidedReadingLevel: 'C',
        boxNumber: '2',
        isLost: false,
        isDamaged: false,
        comments: '',
      },
      student: {
        studentBarCode: 'S1001',
        firstName: 'Alice',
        lastName: 'Adams',
        teacherName: 'Anderson',
        grade: 1,
      },
      checkedOutDate: '2025-11-10T00:00:00Z',
      checkedOutBy: 'Volunteer A',
      checkedInDate: null,
      checkedInBy: null,
    },
  ],
};

const mockBookReservations = {
  count: 1,
  data: [
    {
      id: 'res-3',
      bookCopy: {
        bookCopyBarCode: 'T1001',
        title: "Charlotte's Web",
        author: 'E.B. White',
        guidedReadingLevel: 'E',
        boxNumber: '1',
        isLost: true,
        lostDate: '2025-12-01T00:00:00Z',
        isDamaged: false,
        damagedDate: null,
        comments: 'Cover torn',
      },
      student: {
        studentBarCode: 'S1001',
        firstName: 'Alice',
        lastName: 'Adams',
        teacherName: 'Anderson',
        grade: 1,
      },
      checkedOutDate: '2025-11-01T00:00:00Z',
      checkedOutBy: 'Volunteer A',
      checkedInDate: '2025-11-08T00:00:00Z',
      checkedInBy: 'Volunteer B',
    },
  ],
};

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

  test('student history: selecting teacher shows student dropdown', async ({ page }) => {
    await page.route('**/api/classes', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockClasses),
      });
    });

    await page.goto('/checkouthistory');
    const teacherSelect = page.locator('#formClass');
    await teacherSelect.selectOption({ label: 'Anderson Grade: 1' });

    const studentSelect = page.locator('#formStudent');
    await expect(studentSelect).toBeVisible();
    await expect(studentSelect.locator('option', { hasText: /Adams, Alice/ })).toHaveCount(1);
    await expect(studentSelect.locator('option', { hasText: /Baker, Bob/ })).toHaveCount(1);
  });

  test('student history: selecting student shows reservation table', async ({ page }) => {
    await page.route('**/api/classes', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockClasses),
      });
    });
    await page.route('**/api/bookcopyreservations?*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockStudentReservations),
      });
    });

    await page.goto('/checkouthistory');
    await page.locator('#formClass').selectOption({ label: 'Anderson Grade: 1' });
    await page.locator('#formStudent').selectOption({ label: 'Adams, Alice' });

    await expect(page.locator('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Bar Code/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Title/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Author/i })).toBeVisible();
    await expect(page.getByText("Charlotte's Web")).toBeVisible();
    await expect(page.getByText('Green Eggs and Ham')).toBeVisible();
  });

  test('student history: barcode mode shows student info after scan', async ({ page }) => {
    await page.route('**/api/students/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          teacherName: 'Anderson',
          student: { firstName: 'Alice', lastName: 'Adams' },
        }),
      });
    });
    await page.route('**/api/bookcopyreservations?*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockStudentReservations),
      });
    });

    await page.goto('/checkouthistory');
    await page.locator('#formClass').selectOption('barcode');
    await page.locator('#formStudentBarCode').fill('S1001');
    await page.locator('#formStudentBarCode').press('Enter');

    await expect(page.getByText(/Alice Adams/)).toBeVisible();
    await expect(page.getByText(/Anderson/)).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    await expect(page.getByText("Charlotte's Web")).toBeVisible();
  });

  test('book history: entering barcode shows reservation table', async ({ page }) => {
    await page.route('**/api/bookcopyreservations?*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBookReservations),
      });
    });

    await page.goto('/bookcheckouthistory');
    await page.locator('#formBookBarcode').fill('T1001');
    await page.locator('#formBookBarcode').press('Enter');

    await expect(page.locator('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Student/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Teacher/i })).toBeVisible();
    await expect(page.getByText('Alice Adams')).toBeVisible();
    await expect(page.getByText(/Anderson/)).toBeVisible();
  });

  test('book history: shows lost indicator when book is lost', async ({ page }) => {
    await page.route('**/api/bookcopyreservations?*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBookReservations),
      });
    });

    await page.goto('/bookcheckouthistory');
    await page.locator('#formBookBarcode').fill('T1001');
    await page.locator('#formBookBarcode').press('Enter');

    await expect(page.getByText(/marked lost/i)).toBeVisible();
  });

  test('book history: shows comments when present', async ({ page }) => {
    await page.route('**/api/bookcopyreservations?*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBookReservations),
      });
    });

    await page.goto('/bookcheckouthistory');
    await page.locator('#formBookBarcode').fill('T1001');
    await page.locator('#formBookBarcode').press('Enter');

    await expect(page.getByText('Cover torn')).toBeVisible();
  });
});
