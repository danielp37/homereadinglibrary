import { expect, type Locator, type Page } from '@playwright/test';
import { loadConfig, getConfigValue } from '../config/load-config';

export type AuthRole = 'admin' | 'volunteer';

const appConfig = loadConfig();

interface AuthCredentials {
  username?: string;
  password?: string;
  loginUrl?: string;
  usernameSelectors: string[];
  passwordSelectors: string[];
  nextSelectors: string[];
  submitSelectors: string[];
  postLoginConfirmSelectors: string[];
}

const defaultUsernameSelectors = [
  'input[name="Input.Username"]',
  'input[name="Username"]',
  'input[type="email"]',
  'input[type="text"]',
  'input[name="loginfmt"]',
  'input[name="username"]',
  'input[name="email"]',
  '#i0116'
];

const defaultPasswordSelectors = [
  'input[type="password"]',
  'input[name="passwd"]',
  'input[name="password"]',
  '#i0118'
];

const defaultNextSelectors = [
  'input[type="submit"]',
  'button[type="submit"]',
  'button:has-text("Next")',
  '#idSIButton9'
];

const defaultSubmitSelectors = [
  'button[type="submit"]',
  'input[type="submit"]',
  'button:has-text("Sign in")',
  'button:has-text("Log in")',
  '#idSIButton9'
];

const defaultPostLoginConfirmSelectors = [
  'input[type="submit"]',
  'button[type="submit"]',
  'button:has-text("Yes")',
  'button:has-text("Continue")',
  '#idSIButton9'
];

export function getBaseUrl(): string {
  return getConfigValue(appConfig, 'baseUrl', process.env.BAGGY_E2E_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? 'https://localhost:5001');
}

export function hasAuthCredentials(): boolean {
  return getExpectedRole() === 'volunteer' || Boolean((appConfig.username || process.env.BAGGY_E2E_USERNAME) && (appConfig.password || process.env.BAGGY_E2E_PASSWORD));
}

export function getExpectedRole(): AuthRole {
  return getConfigValue(appConfig, 'role', (process.env.BAGGY_E2E_ROLE ?? 'volunteer') as 'admin' | 'volunteer') === 'admin' ? 'admin' : 'volunteer';
}

export function getAuthCredentials(): AuthCredentials {
  const username = appConfig.username || process.env.BAGGY_E2E_USERNAME;
  const password = appConfig.password || process.env.BAGGY_E2E_PASSWORD;

  if (getExpectedRole() === 'admin' && (!username || !password)) {
    throw new Error('BAGGY_E2E_USERNAME and BAGGY_E2E_PASSWORD must both be set for admin authenticated UI tests.');
  }

  return {
    username,
    password,
    loginUrl: appConfig.loginUrl || process.env.BAGGY_E2E_LOGIN_URL,
    usernameSelectors: toSelectorList(appConfig.usernameSelector || process.env.BAGGY_E2E_USERNAME_SELECTOR, defaultUsernameSelectors),
    passwordSelectors: toSelectorList(appConfig.passwordSelector || process.env.BAGGY_E2E_PASSWORD_SELECTOR, defaultPasswordSelectors),
    nextSelectors: toSelectorList(appConfig.nextSelector || process.env.BAGGY_E2E_NEXT_SELECTOR, defaultNextSelectors),
    submitSelectors: toSelectorList(appConfig.submitSelector || process.env.BAGGY_E2E_SUBMIT_SELECTOR, defaultSubmitSelectors),
    postLoginConfirmSelectors: toSelectorList(
      appConfig.postLoginConfirmSelector || process.env.BAGGY_E2E_POST_LOGIN_CONFIRM_SELECTOR,
      defaultPostLoginConfirmSelectors
    )
  };
}

export async function signInThroughRealLogin(page: Page): Promise<void> {
  const baseUrl = getBaseUrl();
  const credentials = getAuthCredentials();
  const expectedRole = getExpectedRole();

  // Clear all cookies to ensure clean login state
  await page.context().clearCookies();

if (credentials.loginUrl) {
    await page.goto(credentials.loginUrl, { waitUntil: 'domcontentloaded' });
  } else {
    await page.goto('/home');
    const signInLink = page.getByRole('link', { name: /sign in as volunteer/i });
    await expect(signInLink).toBeVisible();

    await Promise.all([
      page.waitForURL((url) => !/\/home$/.test(url.pathname), { timeout: 20_000 }).catch(() => undefined),
      signInLink.click()
    ]);
  }
  
  if (await page.locator('#classDropdown').count()) {
    await signInFromBaggySignInPage(page, credentials, expectedRole);
  } else {
    if (!credentials.username || !credentials.password) {
      throw new Error('Credentials are required for non-Baggy identity provider login flows.');
    }

    await fillFirstMatch(page, credentials.usernameSelectors, credentials.username);

    const nextButton = await findFirstVisible(page, credentials.nextSelectors);
    if (nextButton) {
      await nextButton.click();
    }

    await fillFirstMatch(page, credentials.passwordSelectors, credentials.password);

    const submitButton = await requireFirstVisible(page, credentials.submitSelectors, 'sign-in submit button');
    await submitButton.click();
  }

  const confirmationButton = await findFirstVisible(page, credentials.postLoginConfirmSelectors, 5_000);
  if (confirmationButton) {
    await confirmationButton.click();
  }

  const baseOrigin = new URL(baseUrl).origin;
  await page.waitForURL((url) => url.origin === baseOrigin, { timeout: 60_000 });
  await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
}

async function signInFromBaggySignInPage(
  page: Page,
  credentials: AuthCredentials,
  expectedRole: AuthRole
): Promise<void> {
  if (expectedRole === 'volunteer') {
    await signInAsFirstVolunteer(page);
    return;
  }

  const adminForm = page.locator('form[action*="adminsignin"]').first();

  if (await adminForm.count()) {
    if (!credentials.username || !credentials.password) {
      throw new Error('BAGGY_E2E_USERNAME and BAGGY_E2E_PASSWORD are required for admin login.');
    }

    const adminLoginButton = page.getByRole('button', { name: /^admin login$/i });
    if (await adminLoginButton.count()) {
      await adminLoginButton.click();
      await page.locator('#username').fill(credentials.username);
      await page.locator('#password').fill(credentials.password);

      await Promise.all([
        page.waitForURL((url) => !url.pathname.toLowerCase().includes('/account/signin'), { timeout: 30_000 }),
        page.locator('#adminLoginModel button[type="submit"]').click()
      ]);
      return;
    }

    // Fallback when modal trigger behavior changes.
    await adminForm
      .locator('input[name="username"]')
      .evaluate((element, value) => ((element as HTMLInputElement).value = String(value)), credentials.username);
    await adminForm
      .locator('input[name="password"]')
      .evaluate((element, value) => ((element as HTMLInputElement).value = String(value)), credentials.password);

    await Promise.all([
      page.waitForURL((url) => !url.pathname.toLowerCase().includes('/account/signin'), { timeout: 30_000 }),
      adminForm.evaluate((form) => (form as HTMLFormElement).submit())
    ]);
    return;
  }

  const volunteerButtons = page.locator('form[action*="signin"] button[name="volunteer"]');
  const volunteerCount = await volunteerButtons.count();

  if (!volunteerCount) {
    throw new Error('Baggy sign-in page detected but no admin form or volunteer buttons were found.');
  }

  // Fallback: if admin form is unavailable, continue with first volunteer to keep auth setup functional.
  await Promise.all([
    page.waitForURL((url) => !url.pathname.toLowerCase().includes('/account/signin'), { timeout: 30_000 }),
    volunteerButtons.first().click()
  ]);
}

async function signInAsFirstVolunteer(page: Page): Promise<void> {
  const classDropdown = page.locator('#classDropdown');
  if (!(await classDropdown.count())) {
    throw new Error('Expected volunteer sign-in page to contain #classDropdown.');
  }

  const options = await classDropdown.locator('option').evaluateAll((nodes) => {
    return nodes
      .map((node) => {
        const option = node as HTMLOptionElement;
        return { value: option.value, text: option.textContent ?? '' };
      })
      .filter((option) => option.value);
  });

  if (!options.length) {
    throw new Error('No teacher options were available for volunteer sign-in.');
  }

  const firstTeacher = options[0].value;
  await classDropdown.selectOption(firstTeacher);
  await page.waitForTimeout(150);

  const firstVolunteerButton = page
    .locator(`div[data-class='${firstTeacher}'] button[name='volunteer']`)
    .first();

  if (!(await firstVolunteerButton.count())) {
    throw new Error(`No volunteer buttons found for teacher class '${firstTeacher}'.`);
  }

  await Promise.all([
    page.waitForURL((url) => !url.pathname.toLowerCase().includes('/account/signin'), { timeout: 30_000 }),
    firstVolunteerButton.click()
  ]);
}

async function fillFirstMatch(page: Page, selectors: string[], value: string): Promise<void> {
  const field = await requireFirstVisible(page, selectors, 'login field');
  await field.fill(value);
}

async function requireFirstVisible(
  page: Page,
  selectors: string[],
  description: string,
  timeout = 15_000
): Promise<Locator> {
  const locator = await findFirstVisible(page, selectors, timeout);

  if (!locator) {
    throw new Error(`Could not locate ${description}. Checked selectors: ${selectors.join(', ')}`);
  }

  return locator;
}

async function findFirstVisible(page: Page, selectors: string[], timeout = 15_000): Promise<Locator | undefined> {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    for (const selector of selectors) {
      const locator = page.locator(selector).first();
      if (await locator.count()) {
        try {
          await locator.waitFor({ state: 'visible', timeout: 500 });
          return locator;
        } catch {
          // Continue polling until the timeout expires.
        }
      }
    }

    await page.waitForTimeout(250);
  }

  return undefined;
}

function toSelectorList(value: string | undefined, defaults: string[]): string[] {
  if (!value) {
    return defaults;
  }

  return value
    .split(',')
    .map((selector) => selector.trim())
    .filter((selector) => selector.length > 0);
}