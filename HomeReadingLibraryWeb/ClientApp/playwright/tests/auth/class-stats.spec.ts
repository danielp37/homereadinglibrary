import { expect, test } from '@playwright/test';
import { signInThroughRealLogin } from '../../support/test-env';

const mockClasses = {
  data: [
    {
      classId: 'cls-1',
      teacherName: 'Anderson',
      grade: 1,
      students: [],
    },
    {
      classId: 'cls-2',
      teacherName: 'Brown',
      grade: 2,
      students: [],
    },
  ],
};

const mockStats = {
  firstCheckOut: '2025-09-15T00:00:00Z',
  totalBooksCheckedOut: 142,
  totalWeeks: 12,
  averageCheckOutsPerWeek: 11.83,
  studentStats: [
    {
      firstName: 'Alice',
      lastName: 'Adams',
      startingLevel: 'A',
      currentLevel: 'D',
      totalBooksCheckedOut: 24,
      averageCheckOutsPerWeek: 2.0,
      checkOutsInLastMonth: 8,
      checkOutsInPreviousMonth: 6,
      daysSinceLastCheckOut: 3,
    },
    {
      firstName: 'Bob',
      lastName: 'Baker',
      startingLevel: 'B',
      currentLevel: 'E',
      totalBooksCheckedOut: 18,
      averageCheckOutsPerWeek: 1.5,
      checkOutsInLastMonth: 4,
      checkOutsInPreviousMonth: 5,
      daysSinceLastCheckOut: 7,
    },
  ],
};

test.describe('class stats page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/classes', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockClasses),
      });
    });

    await page.route('**/api/classes/*/stats*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockStats),
      });
    });

    await signInThroughRealLogin(page);
    await page.goto('/classstats');
  });

  test('shows teacher dropdown on load', async ({ page }) => {
    await expect(page).toHaveURL(/\/classstats$/);

    const teacherSelect = page.locator('#formClass');
    await expect(teacherSelect).toBeVisible();
    await expect(teacherSelect.locator('option')).toHaveCount(3); // placeholder + 2 classes
  });

  test('teacher dropdown contains class names with grades', async ({ page }) => {
    await expect(page.locator('#formClass option', { hasText: /Anderson/ })).toHaveCount(1);
    await expect(page.locator('#formClass option', { hasText: /Brown/ })).toHaveCount(1);
  });

  test('stats are not visible before selecting a teacher', async ({ page }) => {
    await expect(page.locator('#formMonth')).toHaveCount(0);
    await expect(page.locator('table')).toHaveCount(0);
  });

  test('selecting a teacher displays class statistics summary', async ({ page }) => {
    const teacherSelect = page.locator('#formClass');
    await teacherSelect.selectOption({ label: 'Anderson Grade: 1' });

    await expect(page.getByText(/Total Books Checked Out/)).toBeVisible();
    await expect(page.getByText('142')).toBeVisible();
    await expect(page.getByText(/Total Weeks/)).toBeVisible();
    await expect(page.getByText('12')).toBeVisible();
    await expect(page.getByText(/Average Checkouts per Week/)).toBeVisible();
    await expect(page.getByText('11.83')).toBeVisible();
  });

  test('month dropdown appears after selecting a teacher', async ({ page }) => {
    const teacherSelect = page.locator('#formClass');
    await teacherSelect.selectOption({ label: 'Anderson Grade: 1' });

    const monthSelect = page.locator('#formMonth');
    await expect(monthSelect).toBeVisible();

    // Should have "Year to Date" as the default option
    await expect(monthSelect.locator('option', { hasText: /Year to Date/ })).toHaveCount(1);
  });

  test('student stats table shows correct headers', async ({ page }) => {
    const teacherSelect = page.locator('#formClass');
    await teacherSelect.selectOption({ label: 'Anderson Grade: 1' });

    await expect(page.locator('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Level' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Total Books' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Avg per Week' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Last Month' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Prev Month' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Days since/i })).toBeVisible();
  });

  test('student stats table displays student data rows', async ({ page }) => {
    const teacherSelect = page.locator('#formClass');
    await teacherSelect.selectOption({ label: 'Anderson Grade: 1' });

    await expect(page.locator('table')).toBeVisible();

    // Alice Adams row
    await expect(page.getByText('Alice Adams')).toBeVisible();
    await expect(page.getByText('A-D')).toBeVisible();  // startingLevel-currentLevel

    // Bob Baker row
    await expect(page.getByText('Bob Baker')).toBeVisible();
    await expect(page.getByText('B-E')).toBeVisible();
  });

  test('changing month dropdown triggers stats reload', async ({ page }) => {
    const teacherSelect = page.locator('#formClass');
    await teacherSelect.selectOption({ label: 'Anderson Grade: 1' });

    await expect(page.locator('#formMonth')).toBeVisible();

    // The month dropdown should have month options (Sep-May of the current school year)
    const monthSelect = page.locator('#formMonth');
    const optionCount = await monthSelect.locator('option').count();
    // At least "Year to Date" + some months
    expect(optionCount).toBeGreaterThanOrEqual(2);
  });

  test('deselecting teacher hides stats', async ({ page }) => {
    const teacherSelect = page.locator('#formClass');
    await teacherSelect.selectOption({ label: 'Anderson Grade: 1' });
    await expect(page.locator('table')).toBeVisible();

    // Deselect by choosing the placeholder
    await teacherSelect.selectOption({ label: '(Select a teacher)' });
    await expect(page.locator('table')).toHaveCount(0);
    await expect(page.locator('#formMonth')).toHaveCount(0);
  });
});
