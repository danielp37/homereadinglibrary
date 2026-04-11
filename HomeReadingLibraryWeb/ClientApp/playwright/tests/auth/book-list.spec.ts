import { expect, test } from '@playwright/test';
import { getExpectedRole, signInThroughRealLogin } from '../../support/test-env';

const allBooks = [
  {
    id: 'book-1',
    title: 'Magic Tree House',
    author: 'Mary Pope Osborne',
    guidedReadingLevel: 'M',
    publisherText: 'Random House',
    boxNumber: '12',
    isbn: '9780679824114',
    reservedCopies: 1,
    bookCopies: [{ barCode: 'BC1001' }, { barCode: 'BC1002' }],
  },
  {
    id: 'book-2',
    title: 'Charlotte\'s Web',
    author: 'E.B. White',
    guidedReadingLevel: 'R',
    publisherText: 'HarperCollins',
    boxNumber: '3',
    isbn: '9780061124952',
    reservedCopies: 0,
    bookCopies: [{ barCode: 'BC2001' }],
  },
];

test.describe('book list page', () => {
  test.beforeEach(async ({ page }) => {
    await signInThroughRealLogin(page);
  });

  test('shows search controls and renders table rows', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Book list is an admin page.');

    await page.route('**/api/books*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: allBooks.length, data: allBooks }),
      });
    });

    await page.goto('/booklist');

    await expect(page).toHaveURL(/\/booklist$/);
    await expect(page.getByRole('heading', { name: /book list/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /add book/i })).toBeVisible();

    await expect(page.locator('#searchType')).toBeVisible();
    await expect(page.locator('#searchText')).toBeVisible();
    await expect(page.getByRole('button', { name: /^search$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /export to file/i })).toBeVisible();

    await expect(page.getByText('Magic Tree House')).toBeVisible();
    await expect(page.getByText('Charlotte\'s Web')).toBeVisible();
  });

  test('title search maps to title query parameter', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Book list is an admin page.');

    await page.route('**/api/books*', async route => {
      const requestUrl = new URL(route.request().url());
      const titleFilter = requestUrl.searchParams.get('title');
      const filteredBooks = titleFilter
        ? allBooks.filter(book => book.title.toLowerCase().includes(titleFilter.toLowerCase()))
        : allBooks;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: filteredBooks.length, data: filteredBooks }),
      });
    });

    await page.goto('/booklist');

    await page.locator('#searchType').selectOption('Title');
    await page.locator('#searchText').fill('Magic');

    const filteredRequest = page.waitForRequest(request => {
      return request.url().includes('/api/books?') && request.url().includes('title=Magic');
    });

    await page.getByRole('button', { name: /^search$/i }).click();
    await filteredRequest;

    await expect(page.getByText('Magic Tree House')).toBeVisible();
    await expect(page.getByText('Charlotte\'s Web')).toHaveCount(0);
  });

  test('book barcode search maps to bookBarCode query parameter', async ({ page }) => {
    test.skip(getExpectedRole() !== 'admin', 'Book list is an admin page.');

    await page.route('**/api/books*', async route => {
      const requestUrl = new URL(route.request().url());
      const barCodeFilter = requestUrl.searchParams.get('bookBarCode');
      const filteredBooks = barCodeFilter
        ? allBooks.filter(book => book.bookCopies.some(copy => copy.barCode === barCodeFilter))
        : allBooks;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: filteredBooks.length, data: filteredBooks }),
      });
    });

    await page.goto('/booklist');

    await page.locator('#searchType').selectOption('Book BarCode');
    await page.locator('#searchText').fill('BC1002');

    const filteredRequest = page.waitForRequest(request => {
      return request.url().includes('/api/books?') && request.url().includes('bookBarCode=BC1002');
    });

    await page.getByRole('button', { name: /^search$/i }).click();
    await filteredRequest;

    await expect(page.getByText('Magic Tree House')).toBeVisible();
    await expect(page.getByText('Charlotte\'s Web')).toHaveCount(0);
  });
});
