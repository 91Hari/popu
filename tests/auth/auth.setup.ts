/**
 * Global auth setup — logs in as each role and saves storage state.
 * Primary strategy: API login → write storageState JSON directly (correct origin).
 * Fallback: UI login if API fails.
 */
import { test as setup, request as playwrightRequest } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { ENV } from '../utils/env';

setup.setTimeout(120_000);

const AUTH_DIR = path.join(__dirname, '../utils/.auth');
const API_BASE = ENV.API_URL;
const APP_ORIGIN = new URL(ENV.BASE_URL).origin; // e.g. https://popu-git-haridev-91haris-projects.vercel.app

async function saveAuthState(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
  stateFile: string,
  role: string,
) {
  // ── Strategy 1: API login → write storageState JSON with correct app origin ──
  try {
    const ctx = await playwrightRequest.newContext({ baseURL: API_BASE });
    const res = await ctx.post('/api/auth/login', {
      data: { username: email, password },
    });

    if (res.ok()) {
      // Read json BEFORE disposing context
      const { token, user } = await res.json() as { token: string; user: Record<string, unknown> };
      await ctx.dispose();

      // Write storageState JSON directly so localStorage is on the correct app origin.
      // Using browser evaluate sets it on whatever origin the page happens to land on
      // (often vercel.com SSO), which the app cannot read. Writing JSON directly
      // ensures the correct origin is used.
      const storageState = {
        cookies: [],
        origins: [{
          origin: APP_ORIGIN,
          localStorage: [
            { name: 'token', value: token },
            { name: 'user', value: JSON.stringify({ ...user, role: (user.role as string).toLowerCase() }) },
          ],
        }],
      };
      fs.mkdirSync(path.dirname(stateFile), { recursive: true });
      fs.writeFileSync(stateFile, JSON.stringify(storageState, null, 2));
      console.log(`[setup] ✓ ${role} authenticated via API (${email}) → origin: ${APP_ORIGIN}`);
      return;
    }
    await ctx.dispose();
  } catch (err) {
    console.warn(`[setup] API login failed for ${email}: ${(err as Error).message?.substring(0, 60)}`);
  }

  // ── Strategy 2: UI login ─────────────────────────────────────────────────
  try {
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 60_000 });
    const usernameInput = page.locator(
      'input[autocomplete="username"], input[name="username"]',
    ).first();
    await usernameInput.waitFor({ state: 'visible', timeout: 45_000 });
    await usernameInput.fill(email);
    await page.locator('input[type="password"]').first().waitFor({ state: 'visible', timeout: 10_000 });
    await page.locator('input[type="password"]').first().fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/(customer|caterer|rider|admin)/, { timeout: 30_000 });
    await page.context().storageState({ path: stateFile });
    console.log(`[setup] ✓ ${role} authenticated via UI`);
  } catch (err) {
    console.warn(`[setup] UI login also failed for ${email}. Saving unauthenticated state.`);
    console.warn(`[setup]   → ${(err as Error).message?.substring(0, 80)}`);
    await page.context().storageState({ path: stateFile });
  }
}

setup('authenticate as customer', async ({ page }) => {
  await saveAuthState(page, ENV.CUSTOMER_EMAIL, ENV.CUSTOMER_PASSWORD, path.join(AUTH_DIR, 'customer.json'), 'customer');
});

setup('authenticate as caterer', async ({ page }) => {
  await saveAuthState(page, ENV.CATERER_EMAIL, ENV.CATERER_PASSWORD, path.join(AUTH_DIR, 'caterer.json'), 'caterer');
});

setup('authenticate as rider', async ({ page }) => {
  await saveAuthState(page, ENV.RIDER_EMAIL, ENV.RIDER_PASSWORD, path.join(AUTH_DIR, 'rider.json'), 'rider');
});

setup('authenticate as admin', async ({ page }) => {
  await saveAuthState(page, ENV.ADMIN_EMAIL, ENV.ADMIN_PASSWORD, path.join(AUTH_DIR, 'admin.json'), 'admin');
});
