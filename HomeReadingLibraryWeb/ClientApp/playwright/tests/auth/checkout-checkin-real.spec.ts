import { expect, test, type Page, type APIRequestContext } from '@playwright/test';
import { getExpectedRole, signInThroughRealLogin } from '../../support/test-env';

const configuredStudentBarCode = process.env.BAGGY_E2E_REAL_STUDENT_BARCODE;
const configuredBookBarCode = process.env.BAGGY_E2E_REAL_BOOK_BARCODE;

test.describe('real checkout/checkin flow', () => {
  test.beforeEach(async ({ page }) => {
    await signInThroughRealLogin(page);
  });

  test('checks out and then checks in the same real book for a real student via API', async ({ page, request }) => {
    const accessToken = await getAccessToken(page);
    if (!accessToken) {
      test.skip(true, 'No OAuth access token found after login.');
    }

    const studentBarCode = configuredStudentBarCode ?? (await getStudentBarCode(request, accessToken));
    const bookBarCode = configuredBookBarCode ?? (await getBookBarCode(request, accessToken));

    if (!studentBarCode || !bookBarCode) {
      test.skip(
        true,
        'Could not discover a student/book barcode from API. Set BAGGY_E2E_REAL_STUDENT_BARCODE and BAGGY_E2E_REAL_BOOK_BARCODE.'
      );
    }

    const checkoutResponse = await request.post('/api/bookcopyreservations', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        bookCopyBarCode: bookBarCode,
        studentBarCode,
      },
      timeout: 15_000,
    });

    await expect(checkoutResponse.ok()).toBeTruthy();

    const checkinResponse = await request.post(`/api/bookcopyreservations/checkin/${bookBarCode}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: 15_000,
    });

    await expect(checkinResponse.ok()).toBeTruthy();
  });
});

async function getAccessToken(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    return (
      window.localStorage.getItem('access_token') ??
      window.sessionStorage.getItem('access_token') ??
      window.localStorage.getItem('auth_token') ??
      window.sessionStorage.getItem('auth_token')
    );
  });
}

async function getStudentBarCode(request: APIRequestContext, token: string): Promise<string | null> {
  const response = await request.get('/api/classes', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 15_000,
  });

  if (!response.ok()) {
    return null;
  }

  const payload = await response.json();
  const classes = Array.isArray(payload?.data) ? payload.data : [];

  for (const cls of classes) {
    const students = Array.isArray(cls?.students) ? cls.students : [];
    for (const student of students) {
      const barCode = student?.barCode;
      if (typeof barCode === 'string' && barCode.trim().length > 0) {
        return barCode.trim();
      }
    }
  }

  return null;
}

async function getBookBarCode(request: APIRequestContext, token: string): Promise<string | null> {
  if (getExpectedRole() !== 'admin') {
    return null;
  }

  const booksResponse = await request.get('/api/books?offset=0&pageSize=50', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 15_000,
  });

  if (!booksResponse.ok()) {
    return null;
  }

  const payload = await booksResponse.json();
  return pickBookBarCode(payload?.data);
}

function pickBookBarCode(entries: unknown): string | null {
  const list = Array.isArray(entries) ? entries : [];

  for (const entry of list) {
    const copies = Array.isArray(entry?.bookCopies) ? entry.bookCopies : [];
    for (const copy of copies) {
      const nested = copy?.barCode;
      if (typeof nested === 'string' && nested.trim().length > 0) {
        return nested.trim();
      }
    }
  }

  return null;
}
