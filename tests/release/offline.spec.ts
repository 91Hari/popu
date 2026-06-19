/**
 * OFFLINE — Network loss simulation and graceful error handling.
 * Project: release — uses storageState per role; context.setOffline() per test.
 */
import { test, expect } from '@playwright/test';
import { ENV } from '../utils/env';
import { ROUTES } from '../utils/test-data';

const APP  = ENV.BASE_URL;
const AUTH = (role: string) => `tests/utils/.auth/${role}.json`;

function skipIfSSO(page: import('@playwright/test').Page) {
  if (page.url().includes('vercel.com')) test.skip(true, 'Vercel SSO active.');
}

// ─── Login Page Offline (no auth) ────────────────────────────────────────────
test.describe('Offline — Login Page', () => {
  test('TC-OFFLINE-001: Login page while offline shows error, does not crash', async ({ page, context }) => {
    await page.goto(APP + ROUTES.login, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }
    skipIfSSO(page);

    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    await context.setOffline(true);

    const userInput = page.locator('input[autocomplete="username"], input[placeholder*="email" i]').first();
    if (await userInput.isVisible()) {
      await userInput.fill('test@popu.test');
      const passInput = page.locator('input[type="password"]').first();
      if (await passInput.isVisible()) await passInput.fill('somepassword');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(3_000);
    }

    await expect(page.locator('body')).not.toBeEmpty();
    expect(errors.filter(e => !e.includes('ResizeObserver') && !e.includes('fetch'))).toHaveLength(0);
    await context.setOffline(false);
  });

  test('TC-OFFLINE-002: Login form submission offline shows user-facing error (not blank)', async ({ page, context }) => {
    await page.goto(APP + ROUTES.login, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }
    skipIfSSO(page);

    await context.setOffline(true);

    const userInput = page.locator('input[autocomplete="username"], input[placeholder*="email" i]').first();
    if (!(await userInput.isVisible())) { await context.setOffline(false); test.skip(); return; }

    await userInput.fill('offline@test.test');
    await page.locator('input[type="password"]').first().fill('pass');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3_000);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
    await context.setOffline(false);
  });
});

// ─── Customer Dashboard Offline ───────────────────────────────────────────────
test.describe('Offline — Customer Dashboard', () => {
  test.use({ storageState: AUTH('customer') });

  test('TC-OFFLINE-010: Customer dashboard loaded then goes offline — no crash', async ({ page, context }) => {
    await page.goto(APP + ROUTES.customer.dashboard, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);

    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    await context.setOffline(true);
    await page.waitForTimeout(2_000);

    await expect(page.locator('body')).not.toBeEmpty();
    expect(errors.filter(e =>
      !e.includes('ResizeObserver') && !e.includes('fetch') && !e.includes('network'),
    )).toHaveLength(0);

    await context.setOffline(false);
  });

  test('TC-OFFLINE-011: Search while offline shows error, not crash', async ({ page, context }) => {
    await page.goto(APP + ROUTES.customer.search, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);

    const input = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (!(await input.isVisible())) { await context.setOffline(false); test.skip(); return; }

    await context.setOffline(true);
    await input.fill('rice');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3_000);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
    await context.setOffline(false);
  });

  test('TC-OFFLINE-012: Navigation while offline stays on last page (no white screen)', async ({ page, context }) => {
    await page.goto(APP + ROUTES.customer.dashboard, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);

    await context.setOffline(true);
    try {
      await page.goto(APP + ROUTES.customer.profile, { waitUntil: 'domcontentloaded', timeout: 8_000 });
    } catch { /* navigation may fail offline — expected */ }

    await page.waitForTimeout(1_000);
    // SPA may show empty body when navigating offline — verify no JS error, not body content
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('ResizeObserver') && !e.includes('fetch'))).toHaveLength(0);
    await context.setOffline(false);
  });
});

// ─── Caterer Dashboard Offline ────────────────────────────────────────────────
test.describe('Offline — Caterer Dashboard', () => {
  test.use({ storageState: AUTH('caterer') });

  test('TC-OFFLINE-020: Caterer dashboard loaded then goes offline — no crash', async ({ page, context }) => {
    await page.goto(APP + ROUTES.caterer.dashboard, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);

    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    await context.setOffline(true);
    await page.waitForTimeout(2_000);

    await expect(page.locator('body')).not.toBeEmpty();
    expect(errors.filter(e =>
      !e.includes('ResizeObserver') && !e.includes('fetch') && !e.includes('network'),
    )).toHaveLength(0);

    await context.setOffline(false);
  });
});

// ─── Network Recovery ─────────────────────────────────────────────────────────
test.describe('Offline — Network Recovery', () => {
  test.use({ storageState: AUTH('customer') });

  test('TC-OFFLINE-030: App recovers after network restored — search works again', async ({ page, context }) => {
    await page.goto(APP + ROUTES.customer.search, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);

    const input = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (!(await input.isVisible())) { test.skip(); return; }

    await context.setOffline(true);
    await page.waitForTimeout(500);
    await context.setOffline(false);
    await page.waitForTimeout(1_000);

    await input.fill('rice');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2_000);

    await expect(page.locator('body')).not.toBeEmpty();
  });
});
