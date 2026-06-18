import { Page, test } from '@playwright/test';

/**
 * Navigate to `url` and skip the test if the app redirected to a login page.
 * Handles two redirect scenarios:
 *   1. App-level redirect  → URL contains /login  (React Router auth guard)
 *   2. Vercel SSO redirect → URL contains vercel.com (Deployment Protection)
 */
export async function skipIfRedirectedToLogin(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const current = page.url();
  if (current.includes('/login') || current.includes('vercel.com')) {
    test.skip(
      true,
      current.includes('vercel.com')
        ? 'Vercel Deployment Protection is active — disable it or use the production URL.'
        : 'Unauthenticated — seed test accounts in the DB and re-run setup to enable this test.',
    );
  }
}
