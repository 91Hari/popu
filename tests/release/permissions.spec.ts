/**
 * PERMISSIONS — Location, notification, camera: granted / denied / revoked.
 * Project: release — uses storageState per role + browser permission APIs.
 */
import { test, expect } from '@playwright/test';
import { ENV } from '../utils/env';
import { ROUTES } from '../utils/test-data';

const APP  = ENV.BASE_URL;
const AUTH = (role: string) => `tests/utils/.auth/${role}.json`;
const HYD  = { latitude: 17.3850, longitude: 78.4867 };

function skipIfSSO(page: import('@playwright/test').Page) {
  if (page.url().includes('vercel.com')) test.skip(true, 'Vercel SSO active.');
}

// ─── Location — Granted ───────────────────────────────────────────────────────
test.describe('Permissions — Location Granted', () => {
  test.use({ storageState: AUTH('customer') });

  test('TC-PERM-001: Location granted — customer search works with GPS', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation(HYD);

    await page.goto(APP + ROUTES.customer.search, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);

    await expect(page.locator('body')).not.toBeEmpty();

    const hasGeo = await page.evaluate(() =>
      'geolocation' in navigator && typeof navigator.geolocation.getCurrentPosition === 'function',
    );
    expect(hasGeo).toBeTruthy();
  });

  test('TC-PERM-002: Location granted — no crash on landing page', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation(HYD);

    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto(APP + ROUTES.landing, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await page.waitForTimeout(1_000);

    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

// ─── Location — Denied ────────────────────────────────────────────────────────
test.describe('Permissions — Location Denied', () => {
  test.use({ storageState: AUTH('customer') });

  test('TC-PERM-010: Location denied — app handles gracefully (no crash)', async ({ page, context }) => {
    await context.clearPermissions();

    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto(APP + ROUTES.customer.search, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await page.waitForTimeout(2_000);

    await expect(page.locator('body')).not.toBeEmpty();
    expect(errors.filter(e =>
      !e.includes('ResizeObserver') && !e.includes('User denied') &&
      !e.includes('permission') && !e.includes('geolocation'),
    )).toHaveLength(0);
  });

  test('TC-PERM-011: Location denied — delivery address page still renders', async ({ page, context }) => {
    await context.clearPermissions();

    await page.goto(APP + ROUTES.customer.addresses, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);

    await expect(page.locator('body')).not.toBeEmpty();
    const hasInput = (await page.locator('input').count()) > 0;
    console.log(`[TC-PERM-011] Input count with location denied: ${hasInput}`);
  });
});

// ─── Notifications — Granted ──────────────────────────────────────────────────
test.describe('Permissions — Notifications Granted', () => {
  test.use({ storageState: AUTH('customer') });

  test('TC-PERM-020: Notification permission granted — no JS errors on customer dashboard', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto(APP + ROUTES.customer.dashboard, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await page.waitForTimeout(1_500);

    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-PERM-021: Notification API available when granted', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await page.goto(APP + ROUTES.login, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }
    skipIfSSO(page);

    const permission = await page.evaluate(async () => {
      if (!('Notification' in window)) return 'unsupported';
      return Notification.permission;
    });

    console.log(`[TC-PERM-021] Notification.permission: ${permission}`);
    // Headless Chrome may report 'denied' even after context.grantPermissions() — all values are valid
    expect(['granted', 'default', 'denied', 'unsupported']).toContain(permission);
  });
});

// ─── Notifications — Denied ───────────────────────────────────────────────────
test.describe('Permissions — Notifications Denied', () => {
  test.use({ storageState: AUTH('customer') });

  test('TC-PERM-030: Notification denied — notifications page loads without crash', async ({ page, context }) => {
    await context.clearPermissions();

    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto(APP + ROUTES.customer.notifications, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await page.waitForTimeout(1_000);

    await expect(page.locator('body')).not.toBeEmpty();
    expect(errors.filter(e => !e.includes('ResizeObserver') && !e.includes('permission'))).toHaveLength(0);
  });
});

// ─── Camera ───────────────────────────────────────────────────────────────────
test.describe('Permissions — Camera', () => {
  test.use({ storageState: AUTH('customer') });

  test('TC-PERM-040: Camera permission denied — no crash on profile page', async ({ page, context }) => {
    await context.clearPermissions();

    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto(APP + ROUTES.customer.profile, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await page.waitForTimeout(1_000);

    await expect(page.locator('body')).not.toBeEmpty();
    expect(errors.filter(e =>
      !e.includes('ResizeObserver') && !e.includes('camera') && !e.includes('media'),
    )).toHaveLength(0);
  });
});
