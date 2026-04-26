import { expect, test } from '@playwright/test';
import { getExpectedRole, signInThroughRealLogin } from '../../support/test-env';

const mockReservationsData = {
  count: 2,
  data: [
    {
      id: 'res1',
      checkedOutDate: '2025-01-05T00:00:00Z',
      checkedOutBy: 'Volunteer1',
      bookCopy: {
        bookCopyBarCode: 'BC001',
        title: 'The Cat in the Hat',
        author: 'Dr. Seuss',
        guidedReadingLevel: 'B',
        boxNumber: '3',
        bookId: 'book1',
        isLost: false,
        isDamaged: false,
        lostDate: null,
        damagedDate: null,
        comments: ''
      },
      student: {
        studentBarCode: 'STU001',
        teacherName: 'Ms. Smith',
        grade: 3,
        firstName: 'Alice',
        lastName: 'Johnson',
        teacherId: 'teacher1'
      }
    },
    {
      id: 'res2',
      checkedOutDate: '2025-01-10T00:00:00Z',
      checkedOutBy: 'Volunteer2',
      bookCopy: {
        bookCopyBarCode: 'BC002',
        title: 'Green Eggs and Ham',
        author: 'Dr. Seuss',
        guidedReadingLevel: 'A',
        boxNumber: '1',
        bookId: 'book2',
        isLost: false,
        isDamaged: false,
        lostDate: null,
        damagedDate: null,
        comments: ''
      },
      student: {
        studentBarCode: 'STU002',
        teacherName: 'Mr. Brown',
        grade: 2,
        firstName: 'Bob',
        lastName: 'Williams',
        teacherId: 'teacher2'
      }
    }
  ]
};

test.describe('late notices — UI controls on books checked out page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/bookcopyreservations**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockReservationsData),
      });
    });

    await signInThroughRealLogin(page);
  });

  test('Customize Notice Templates and Generate Late Notices buttons are visible', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only page checks.');

    await page.goto('/bookscheckedout');
    await expect(page).toHaveURL(/\/bookscheckedout$/);

    await expect(page.getByRole('button', { name: /customize notice templates/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /generate late notices/i })).toBeVisible();
  });

  test('template selector dropdown is visible near Generate button', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only page checks.');

    await page.goto('/bookscheckedout');
    await expect(page.locator('select#selectedTemplateId')).toBeVisible();
    // Default template should be the only option
    const options = page.locator('select#selectedTemplateId option');
    await expect(options).toHaveCount(1);
    await expect(options.first()).toContainText('Default');
  });

  test('Customize Notice Templates button opens modal with template list and editor', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only page checks.');

    await page.goto('/bookscheckedout');

    await page.getByRole('button', { name: /customize notice templates/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('heading', { name: /customize notice templates/i })).toBeVisible();
    await expect(page.getByLabel(/notice template markdown/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /reset to default/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    // Template list
    await expect(page.locator('.list-group-item')).toHaveCount(1);
    await expect(page.locator('.list-group-item').first()).toContainText('Default');
  });

  test('template editor shows live preview with sample data', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only page checks.');

    await page.goto('/bookscheckedout');
    await page.getByRole('button', { name: /customize notice templates/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    const preview = page.locator('.notice-preview');
    await expect(preview).toBeVisible();
    await expect(preview).toContainText('John Smith');
  });

  test('template editor live preview updates when template text changes', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only page checks.');

    await page.goto('/bookscheckedout');
    await page.getByRole('button', { name: /customize notice templates/i }).click();

    const textarea = page.getByLabel(/notice template markdown/i);
    await textarea.fill('Custom notice: {{studentName}} owes books!');

    const preview = page.locator('.notice-preview');
    await expect(preview).toContainText('Custom notice:');
    await expect(preview).toContainText('John Smith');
  });

  test('cancel button closes the template editor modal', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only page checks.');

    await page.goto('/bookscheckedout');
    await page.getByRole('button', { name: /customize notice templates/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('can add a new template and it appears in the list', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only page checks.');

    await page.goto('/bookscheckedout');
    await page.getByRole('button', { name: /customize notice templates/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: /\+ new template/i }).click();

    // Two templates now in the list
    const items = page.locator('.list-group-item');
    await expect(items).toHaveCount(2);

    // New template is selected and shows default name
    await expect(page.locator('input[name="editableTemplateName"]')).toHaveValue(/New Template/i);
  });

  test('delete button is disabled when only one template exists', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only page checks.');

    await page.goto('/bookscheckedout');
    await page.getByRole('button', { name: /customize notice templates/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await expect(page.getByRole('button', { name: /delete template/i })).toBeDisabled();
  });

  test('can delete a template when two exist', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only page checks.');

    await page.goto('/bookscheckedout');
    await page.getByRole('button', { name: /customize notice templates/i }).click();
    await page.getByRole('button', { name: /\+ new template/i }).click();

    // Now 2 templates — delete should be enabled
    await expect(page.getByRole('button', { name: /delete template/i })).toBeEnabled();
    await page.getByRole('button', { name: /delete template/i }).click();

    await expect(page.locator('.list-group-item')).toHaveCount(1);
  });

  test('saved template appears in generation dropdown', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only page checks.');

    await page.goto('/bookscheckedout');
    await page.getByRole('button', { name: /customize notice templates/i }).click();

    // Rename the default template
    const nameInput = page.locator('input[name="editableTemplateName"]');
    await nameInput.fill('Holiday Notice');
    await page.getByRole('button', { name: /^save$/i }).click();
    await page.getByRole('button', { name: /cancel/i }).click();

    // Generation dropdown should show updated name
    const options = page.locator('select#selectedTemplateId option');
    await expect(options.first()).toContainText('Holiday Notice');
  });

  test('Generate Late Notices shows notice overlay with student notices', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only page checks.');

    await page.goto('/bookscheckedout');

    await page.getByRole('button', { name: /generate late notices/i }).click();

    const printOverlay = page.locator('.late-notices-print-overlay');
    await expect(printOverlay).toBeVisible();

    await expect(page.getByRole('button', { name: /print notices/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /close/i })).toBeVisible();

    const noticeBoxes = page.locator('.notice-box');
    await expect(noticeBoxes).toHaveCount(2);

    await expect(printOverlay).toContainText('Alice Johnson');
    await expect(printOverlay).toContainText('Bob Williams');
    await expect(printOverlay).toContainText('The Cat in the Hat');
    await expect(printOverlay).toContainText('Green Eggs and Ham');
  });

  test('Close button dismisses the notice overlay', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only page checks.');

    await page.goto('/bookscheckedout');
    await page.getByRole('button', { name: /generate late notices/i }).click();

    await expect(page.locator('.late-notices-print-overlay')).toBeVisible();

    await page.getByRole('button', { name: /^close$/i }).click();

    await expect(page.locator('.late-notices-print-overlay')).toHaveCount(0);
  });

  test('notices are sorted by teacher name then student last name', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Admin-only page checks.');

    await page.goto('/bookscheckedout');
    await page.getByRole('button', { name: /generate late notices/i }).click();

    const noticeBoxes = page.locator('.notice-box');
    await expect(noticeBoxes).toHaveCount(2);

    // Mr. Brown comes before Ms. Smith alphabetically
    const firstNotice = noticeBoxes.first();
    const secondNotice = noticeBoxes.last();
    await expect(firstNotice).toContainText('Bob Williams');
    await expect(secondNotice).toContainText('Alice Johnson');
  });
});
