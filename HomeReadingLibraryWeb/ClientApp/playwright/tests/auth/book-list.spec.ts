import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { getExpectedRole, signInThroughRealLogin } from '../../support/test-env';

interface CreatedBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  guidedReadingLevel: string;
  boxNumber: string;
}

test.describe('book list real API workflows', () => {
  test.beforeEach(async ({ page }) => {
    await signInThroughRealLogin(page);
    test.skip(getExpectedRole() !== 'admin', 'Book list is an admin page.');
  });

  test('opening add-book modal displays form', async ({ page, request }) => {
    const token = await requireAccessToken(page);
    const id = uniqueId();
    const title = `E2E-AddModal-${id}`;
    const author = `E2E-AddModalAuthor-${id}`;

    await createBook(request, token, {
      title,
      author,
      guidedReadingLevel: 'A',
      boxNumber: '1',
      isbn: buildUniqueIsbn('978'),
    });
    await waitForBookVisibleViaApi(request, token, `title=${encodeURIComponent(title)}`);

    await openBookList(page);
    await page.getByRole('button', { name: /add book/i }).click();
    await expect(page.getByLabel('Title')).toBeVisible();
    await expect(page.getByLabel('Author')).toBeVisible();
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible();
  });

  test('opening edit-book modal displays form with existing data', async ({ page, request }) => {
    const token = await requireAccessToken(page);
    const id = uniqueId();
    const created = await createBook(request, token, {
      title: `E2E-EditModal-${id}`,
      author: `E2E-EditModalAuthor-${id}`,
      guidedReadingLevel: 'B',
      boxNumber: '2',
      isbn: buildUniqueIsbn('979'),
    });
    await waitForBookVisibleViaApi(request, token, `title=${encodeURIComponent(created.title)}`);

    await openBookList(page);
    await searchBooks(page, 'Title', created.title);
    await page.getByRole('button', { name: /^edit$/i }).first().click();
    await expect(page.getByDisplayValue(created.title)).toBeVisible();
    await expect(page.getByDisplayValue(created.author)).toBeVisible();
    await expect(page.getByRole('button', { name: /update book/i })).toBeVisible();
  });

  test('opening add-copy modal displays copy form', async ({ page, request }) => {
    const token = await requireAccessToken(page);
    const id = uniqueId();
    const created = await createBook(request, token, {
      title: `E2E-AddCopyModal-${id}`,
      author: `E2E-AddCopyModalAuthor-${id}`,
      guidedReadingLevel: 'C',
      boxNumber: '3',
      isbn: buildUniqueIsbn('977'),
    });
    await waitForBookVisibleViaApi(request, token, `title=${encodeURIComponent(created.title)}`);

    await openBookList(page);
    await searchBooks(page, 'Title', created.title);
    await page.getByRole('button', { name: /^add copy$/i }).first().click();
    await expect(page.getByText(created.title)).toBeVisible();
    await expect(page.getByLabel('Book Copy Barcode')).toBeVisible();
  });

  test('search by Title', async ({ page, request }) => {
    const token = await requireAccessToken(page);
    const id = uniqueId();
    const title = `E2E-Title-${id}`;
    const author = `E2E-Author-${id}`;

    await createBook(request, token, {
      title,
      author,
      guidedReadingLevel: 'M',
      boxNumber: '10',
      isbn: buildUniqueIsbn('978'),
    });
    await waitForBookVisibleViaApi(request, token, `title=${encodeURIComponent(title)}`);

    await openBookList(page);
    await searchBooks(page, 'Title', title);

    await expect(page.getByRole('cell', { name: title })).toBeVisible();
    await expect(page.getByRole('cell', { name: author })).toBeVisible();
  });

  test('search by Author', async ({ page, request }) => {
    const token = await requireAccessToken(page);
    const id = uniqueId();
    const title = `E2E-AuthorTitle-${id}`;
    const author = `E2E-SearchAuthor-${id}`;

    await createBook(request, token, {
      title,
      author,
      guidedReadingLevel: 'N',
      boxNumber: '9',
      isbn: buildUniqueIsbn('979'),
    });
    await waitForBookVisibleViaApi(request, token, `author=${encodeURIComponent(author)}`);

    await openBookList(page);
    await searchBooks(page, 'Author', author);

    await expect(page.getByRole('cell', { name: title })).toBeVisible();
    await expect(page.getByRole('cell', { name: author })).toBeVisible();
  });

  test('search by ReadingLevel/Box', async ({ page, request }) => {
    const token = await requireAccessToken(page);
    const id = uniqueId();
    const title = `E2E-BoxTitle-${id}`;
    const author = `E2E-BoxAuthor-${id}`;
    const readingLevel = 'Q';
    const boxNumber = '24';

    await createBook(request, token, {
      title,
      author,
      guidedReadingLevel: readingLevel,
      boxNumber,
      isbn: buildUniqueIsbn('977'),
    });
    await waitForBookVisibleViaApi(request, token, `boxNumber=${encodeURIComponent(`${readingLevel}${boxNumber}`)}`);

    await openBookList(page);
    await searchBooks(page, 'ReadingLevel/Box', `${readingLevel}${boxNumber}`);

    await expect(page.getByRole('cell', { name: title })).toBeVisible();
    await expect(page.getByRole('cell', { name: author })).toBeVisible();
  });

  test('search by Book BarCode', async ({ page, request }) => {
    const token = await requireAccessToken(page);
    const id = uniqueId();
    const barCode = buildUniqueBarCode('E2EBC');
    const created = await createBook(request, token, {
      title: `E2E-BarCodeTitle-${id}`,
      author: `E2E-BarCodeAuthor-${id}`,
      guidedReadingLevel: 'P',
      boxNumber: '18',
      isbn: buildUniqueIsbn('976'),
    });
    await addBookCopy(request, token, created.id, barCode);
    await waitForBookVisibleViaApi(request, token, `bookBarCode=${encodeURIComponent(barCode)}`);

    await openBookList(page);
    await searchBooks(page, 'Book BarCode', barCode);

    await expect(page.getByRole('cell', { name: created.title })).toBeVisible();
    await expect(page.getByRole('cell', { name: created.author })).toBeVisible();
  });

  test('Add book', async ({ page, request }) => {
    const token = await requireAccessToken(page);
    const id = uniqueId();
    const title = `E2E-AddBook-${id}`;
    const author = `E2E-AddBookAuthor-${id}`;

    await createBook(request, token, {
      title,
      author,
      guidedReadingLevel: 'B',
      boxNumber: '5',
      isbn: buildUniqueIsbn('969'),
    });
    await waitForBookVisibleViaApi(request, token, `title=${encodeURIComponent(title)}`);

    await openBookList(page);
    await searchBooks(page, 'Title', title);

    await expect(page.getByRole('cell', { name: title })).toBeVisible();
    await expect(page.getByRole('cell', { name: author })).toBeVisible();
  });

  test('Add book barcode', async ({ page, request }) => {
    const token = await requireAccessToken(page);
    const id = uniqueId();
    const barcode = buildUniqueBarCode('E2EADD');
    const created = await createBook(request, token, {
      title: `E2E-AddBarcode-${id}`,
      author: `E2E-AddBarcodeAuthor-${id}`,
      guidedReadingLevel: 'G',
      boxNumber: '6',
      isbn: buildUniqueIsbn('975'),
    });

    await openBookList(page);
    await searchBooks(page, 'Title', created.title);
    await page.getByRole('cell', { name: created.title }).first().click();
    await page.locator('#formBookBarcode').fill(barcode);
    await page.locator('#formBookBarcode').press('Enter');

    await expect(page.locator('li', { hasText: barcode })).toBeVisible();
  });

  test('Delete book barcode', async ({ page, request }) => {
    const token = await requireAccessToken(page);
    const id = uniqueId();
    const barcode = buildUniqueBarCode('E2EDEL');
    const created = await createBook(request, token, {
      title: `E2E-DeleteBarcode-${id}`,
      author: `E2E-DeleteBarcodeAuthor-${id}`,
      guidedReadingLevel: 'H',
      boxNumber: '7',
      isbn: buildUniqueIsbn('974'),
    });
    await addBookCopy(request, token, created.id, barcode);

    await openBookList(page);
    await searchBooks(page, 'Title', created.title);
    await page.getByRole('cell', { name: created.title }).first().click();

    page.once('dialog', dialog => dialog.accept());
    await page.locator('li', { hasText: barcode }).getByRole('button', { name: /delete/i }).click();

    await expect(page.locator('li', { hasText: barcode })).toHaveCount(0);
  });

  test('Mark Lost book barcode', async ({ page, request }) => {
    const token = await requireAccessToken(page);
    const id = uniqueId();
    const barcode = buildUniqueBarCode('E2ELOS');
    const created = await createBook(request, token, {
      title: `E2E-MarkLost-${id}`,
      author: `E2E-MarkLostAuthor-${id}`,
      guidedReadingLevel: 'I',
      boxNumber: '8',
      isbn: buildUniqueIsbn('973'),
    });
    await addBookCopy(request, token, created.id, barcode);
    await markBookCopyLost(request, token, created.id, barcode);

    await openBookList(page);
    await searchBooks(page, 'Title', created.title);
    await page.getByRole('cell', { name: created.title }).first().click();

    await expect(page.locator('li', { hasText: barcode }).getByRole('button', { name: /mark found/i })).toBeVisible();
  });

  test('Mark damaged book barcode', async ({ page, request }) => {
    const token = await requireAccessToken(page);
    const id = uniqueId();
    const barcode = buildUniqueBarCode('E2EDMG');
    const created = await createBook(request, token, {
      title: `E2E-MarkDamaged-${id}`,
      author: `E2E-MarkDamagedAuthor-${id}`,
      guidedReadingLevel: 'J',
      boxNumber: '4',
      isbn: buildUniqueIsbn('972'),
    });
    await addBookCopy(request, token, created.id, barcode);
    await markBookCopyDamaged(request, token, created.id, barcode);

    await openBookList(page);
    await searchBooks(page, 'Title', created.title);
    await page.getByRole('cell', { name: created.title }).first().click();

    await expect(page.locator('li', { hasText: barcode }).getByRole('button', { name: /mark damaged/i })).toHaveCount(0);
  });

  test('Add Comments book barcode', async ({ page, request }) => {
    const token = await requireAccessToken(page);
    const id = uniqueId();
    const barcode = buildUniqueBarCode('E2ECOM');
    const comment = `E2E comment ${id}`;
    const created = await createBook(request, token, {
      title: `E2E-Comments-${id}`,
      author: `E2E-CommentsAuthor-${id}`,
      guidedReadingLevel: 'K',
      boxNumber: '11',
      isbn: buildUniqueIsbn('971'),
    });
    await addBookCopy(request, token, created.id, barcode);
    await addCommentToBookCopy(request, token, created.id, barcode, comment);

    await openBookList(page);
    await searchBooks(page, 'Title', created.title);
    await page.getByRole('cell', { name: created.title }).first().click();

    await expect(page.locator('li', { hasText: barcode }).getByRole('button', { name: /edit comments/i })).toBeVisible();
    await expect(page.getByText(`Comments: ${comment}`)).toBeVisible();
  });

  test('Edit title and author on existing book', async ({ page, request }) => {
    const token = await requireAccessToken(page);
    const id = uniqueId();
    const created = await createBook(request, token, {
      title: `E2E-OriginalTitle-${id}`,
      author: `E2E-OriginalAuthor-${id}`,
      guidedReadingLevel: 'L',
      boxNumber: '15',
      isbn: buildUniqueIsbn('970'),
    });

    const updatedTitle = `E2E-UpdatedTitle-${id}`;
    const updatedAuthor = `E2E-UpdatedAuthor-${id}`;

    await openBookList(page);
    await searchBooks(page, 'Title', created.title);
    await page.getByRole('cell', { name: created.title }).first().click();
    await page.getByRole('button', { name: /^edit book$/i }).click();
    await page.locator('#formEditTitle').fill(updatedTitle);
    await page.locator('#formEditAuthor').fill(updatedAuthor);
    await Promise.all([
      page.waitForResponse(response => {
        return response.url().includes(`/api/books/${created.id}`) && response.request().method() === 'PUT' && response.status() === 200;
      }),
      page.getByRole('button', { name: /^update book$/i }).click(),
    ]);
    await waitForBookVisibleViaApi(request, token, `title=${encodeURIComponent(updatedTitle)}`);

    await searchBooks(page, 'Title', updatedTitle);
    await expect(page.getByRole('cell', { name: updatedTitle })).toBeVisible();
    await expect(page.getByRole('cell', { name: updatedAuthor })).toBeVisible();
  });
});

async function openBookList(page: Page): Promise<void> {
  await page.goto('/booklist');
  await expect(page).toHaveURL(/\/booklist$/);
  await expect(page.getByRole('heading', { name: /book list/i })).toBeVisible();
}

async function searchBooks(page: Page, searchType: string, searchText: string): Promise<void> {
  await page.locator('#searchType').selectOption(searchType);
  await page.locator('#searchText').fill(searchText);
  await page.getByRole('button', { name: /^search$/i }).click();
}

async function requireAccessToken(page: Page): Promise<string> {
  const token = await page.evaluate(() => {
    return window.localStorage.getItem('access_token') ?? window.sessionStorage.getItem('access_token');
  });

  if (!token) {
    throw new Error('Expected OAuth access_token after login.');
  }

  return token;
}

function uniqueId(): string {
  const datePortion = Date.now().toString();
  const randomPortion = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
  return `${datePortion}${randomPortion}`;
}

function buildUniqueIsbn(prefix: string): string {
  const digits = `${Date.now()}${Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, '0')}`;
  return `${prefix}${digits.slice(-10)}`;
}

function buildUniqueBarCode(prefix: string): string {
  const digits = `${Date.now()}${Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0')}`;
  return `${prefix}${digits.slice(-8)}`;
}

async function createBook(
  request: APIRequestContext,
  token: string,
  payload: {
    title: string;
    author: string;
    guidedReadingLevel: string;
    boxNumber: string;
    isbn: string;
  }
): Promise<CreatedBook> {
  const response = await request.post('/api/books', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: {
      title: payload.title,
      author: payload.author,
      guidedReadingLevel: payload.guidedReadingLevel,
      boxNumber: payload.boxNumber,
      isbn: payload.isbn,
      publisherText: 'E2E Publisher',
    },
    timeout: 20_000,
  });

  if (!response.ok()) {
    throw new Error(`createBook failed with status ${response.status()}`);
  }

  const body = await response.json();
  const data = body?.data ?? body?.Data;
  const id = data?.id ?? data?.Id;

  if (!id) {
    throw new Error(`createBook returned unexpected payload: ${JSON.stringify(body)}`);
  }

  return {
    id,
    title: data?.title ?? data?.Title ?? payload.title,
    author: data?.author ?? data?.Author ?? payload.author,
    isbn: data?.isbn ?? data?.Isbn ?? payload.isbn,
    guidedReadingLevel:
      data?.guidedReadingLevel ?? data?.GuidedReadingLevel ?? payload.guidedReadingLevel,
    boxNumber: data?.boxNumber ?? data?.BoxNumber ?? payload.boxNumber,
  };
}

async function addBookCopy(request: APIRequestContext, token: string, bookId: string, barCode: string): Promise<void> {
  const response = await request.post(`/api/books/${bookId}/bookcopy`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: {
      barCode,
    },
    timeout: 20_000,
  });

  if (!response.ok()) {
    throw new Error(`addBookCopy failed with status ${response.status()}`);
  }
}

async function markBookCopyLost(request: APIRequestContext, token: string, bookId: string, barCode: string): Promise<void> {
  const response = await request.put(`/api/books/${bookId}/bookcopy/${barCode}/marklost`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 20_000,
  });

  if (!response.ok()) {
    throw new Error(`markBookCopyLost failed with status ${response.status()}`);
  }
}

async function markBookCopyDamaged(request: APIRequestContext, token: string, bookId: string, barCode: string): Promise<void> {
  const response = await request.put(`/api/books/${bookId}/bookcopy/${barCode}/markdamaged`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 20_000,
  });

  if (!response.ok()) {
    throw new Error(`markBookCopyDamaged failed with status ${response.status()}`);
  }
}

async function addCommentToBookCopy(
  request: APIRequestContext,
  token: string,
  bookId: string,
  barCode: string,
  comment: string
): Promise<void> {
  const response = await request.put(`/api/books/${bookId}/bookcopy/${barCode}/comments`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: {
      comments: comment,
    },
    timeout: 20_000,
  });

  if (!response.ok()) {
    throw new Error(`addCommentToBookCopy failed with status ${response.status()}`);
  }
}

async function waitForBookVisibleViaApi(request: APIRequestContext, token: string, query: string): Promise<void> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const response = await request.get(`/api/books?${query}&offset=0&pageSize=5`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 15_000,
    });

    if (response.ok()) {
      const body = await response.json();
      if (typeof body?.count === 'number' && body.count > 0) {
        return;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  throw new Error(`Book not visible via API for query: ${query}`);
}
