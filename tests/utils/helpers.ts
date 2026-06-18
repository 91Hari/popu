import { Page, APIRequestContext, expect } from '@playwright/test';
import { ENV } from './env';

/** Inject a JWT token + user object into localStorage to bypass the login UI. */
export async function injectAuthState(
  page: Page,
  token: string,
  user: Record<string, unknown>,
) {
  await page.addInitScript(
    ({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    { token, user },
  );
}

/** POST /api/auth/login and return { token, user }
 *  Backend expects "username" (email or mobile number), not "email".
 */
export async function apiLogin(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<{ token: string; user: Record<string, unknown> }> {
  const res = await request.post(`${ENV.API_URL}/api/auth/login`, {
    data: { username: email, password },
  });
  if (!res.ok()) {
    throw new Error(
      `Login failed for ${email}: ${res.status()} ${await res.text()}`,
    );
  }
  return res.json();
}

/** Wait for the network to become idle after navigation. */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
}

/** Assert a page redirects to /login when token is absent. */
export async function assertRedirectsToLogin(page: Page, url: string) {
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
  await page.goto(url);
  await page.waitForURL('**/login');
  expect(page.url()).toContain('/login');
}

/** Measure page load time in milliseconds. */
export async function measurePageLoad(page: Page, url: string): Promise<number> {
  const start = Date.now();
  await page.goto(url, { waitUntil: 'networkidle' });
  return Date.now() - start;
}

/** Measure an API call response time in milliseconds. */
export async function measureApiResponse(
  request: APIRequestContext,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  options?: { headers?: Record<string, string>; data?: unknown },
): Promise<{ status: number; ms: number; body: unknown }> {
  const start = Date.now();
  const res = await request[method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete'](
    url,
    options,
  );
  const ms = Date.now() - start;
  let body: unknown;
  try { body = await res.json(); } catch { body = await res.text(); }
  return { status: res.status(), ms, body };
}

/** Fill the login form and submit.
 *  The PO.PU login form uses autoComplete="username" with a text input
 *  (accepts email or 10-digit mobile number).
 */
export async function fillLoginForm(page: Page, email: string, password: string) {
  const usernameInput = page.locator('input[autocomplete="username"]').first();
  await usernameInput.waitFor({ state: 'visible', timeout: 15_000 });

  // Use Playwright's fill() which fires the correct input events for React controlled components.
  // After each fill(), wait briefly so React 18's concurrent scheduler can commit the state
  // update before the next action reads it (React batches setState calls as microtasks; if we
  // move to the next CDP action too fast, handleSubmit may still see the old empty string).
  await usernameInput.fill(email);
  await page.waitForTimeout(150);

  const passwordInput = page.locator('input[autocomplete="current-password"], input[type="password"]').first();
  await passwordInput.fill(password);
  await page.waitForTimeout(150);

  await page.click('button[type="submit"]');
}

/** Dismiss any open Material-UI Snackbar / Toast. */
export async function dismissSnackbar(page: Page) {
  const snackbar = page.locator('[class*="Snackbar"] button, [role="alert"] button');
  if (await snackbar.isVisible()) await snackbar.click();
}

/** Return true if the selector is visible within the timeout. */
export async function isVisible(
  page: Page,
  selector: string,
  timeout = 8_000,
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/** Return bearer auth header from env credentials (cached). */
let _tokenCache: Record<string, string> = {};
export async function getBearerToken(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<string> {
  const key = `${email}:${password}`;
  if (!_tokenCache[key]) {
    const { token } = await apiLogin(request, email, password);
    _tokenCache[key] = token;
  }
  return _tokenCache[key];
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
