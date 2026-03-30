import { test as setup } from '@playwright/test';
import { signInThroughRealLogin } from '../../support/test-env';

setup('authenticate volunteer or admin session', async ({ page }) => {
  await signInThroughRealLogin(page);
  await page.context().storageState({ path: './playwright/.auth/user.json' });
});