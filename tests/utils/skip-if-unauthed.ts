import { Page, test } from '@playwright/test';

/**
 * Navigate to `url` and skip the test if the app redirected to a login page.
 *
 * Handles two redirect scenarios:
 *   1. App-level redirect   → URL contains /login  (React Router auth guard)
 *   2. Vercel SSO redirect  → URL contains vercel.com (Deployment Protection)
 *
 * Vercel uses a client-side JS redirect: the initial HTML loads first
 * (DOMContentLoaded fires), then a script redirects to vercel.com/sso-api.
 * We therefore wait up to 3 s after the initial load for any such redirect.
 */
export async function skipIfRedirectedToLogin(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Vercel Deployment Protection redirects via client-side JS after the initial
  // HTML loads. The SSO process makes network requests to vercel.com, so the page
  // cannot reach 'networkidle' until after it has settled on vercel.com/login.
  // Waiting for networkidle therefore reliably catches the SSO redirect without
  // needing a fixed timer.
  try {
    await page.waitForLoadState('networkidle', { timeout: 15_000 });
  } catch { /* page has ongoing network activity — fall through to URL check */ }

  const isProtected = (u: string) => u.includes('vercel.com') || u.includes('/login');
  if (isProtected(page.url())) {
    test.skip(
      true,
      page.url().includes('vercel.com')
        ? 'Vercel Deployment Protection is active — disable it or point BASE_URL at your production domain.'
        : 'Unauthenticated — seed test accounts and re-run setup.',
    );
  }
}
