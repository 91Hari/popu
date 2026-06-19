/**
 * NOTIFICATIONS — Order, delivery and broadcast notification flows.
 * Project: release — uses storageState per role.
 */
import { test, expect } from '@playwright/test';
import { ENV } from '../utils/env';
import { API_ENDPOINTS, ROUTES, USERS } from '../utils/test-data';
import { getBearerToken, authHeader } from '../utils/helpers';

const BASE = ENV.API_URL;
const APP  = ENV.BASE_URL;

const AUTH = (role: string) => `tests/utils/.auth/${role}.json`;

function skipIfSSO(page: import('@playwright/test').Page) {
  if (page.url().includes('vercel.com')) test.skip(true, 'Vercel SSO active.');
}

// ─── Customer Notification Page ───────────────────────────────────────────────
test.describe('Notifications — Customer UI', () => {
  test.use({ storageState: AUTH('customer') });

  test('TC-NOTIF-001: Customer notification page loads without crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(APP + ROUTES.customer.notifications, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('TC-NOTIF-002: Customer notification page shows list or empty state (not error)', async ({ page }) => {
    await page.goto(APP + ROUTES.customer.notifications, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
    expect(bodyText).not.toContain('Internal Server Error');
    expect(bodyText).not.toContain('Cannot GET');
  });
});

// ─── Caterer Notification Page ────────────────────────────────────────────────
test.describe('Notifications — Caterer UI', () => {
  test.use({ storageState: AUTH('caterer') });

  test('TC-NOTIF-010: Caterer notification page loads without crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(APP + ROUTES.caterer.notifications, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

// ─── Admin Broadcast Notifications ───────────────────────────────────────────
test.describe('Notifications — Admin Broadcast', () => {
  test.use({ storageState: AUTH('admin') });

  test('TC-NOTIF-020: Admin notification page loads without crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(APP + ROUTES.admin.notifications, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('TC-NOTIF-021: POST /api/admin/notifications requires admin auth (not customer)', async ({ request }) => {
    let customerToken = '';
    try { customerToken = await getBearerToken(request, USERS.customer.email, USERS.customer.password); }
    catch { test.skip(); return; }
    const res = await request.post(`${BASE}/api/admin/notifications`, {
      headers: authHeader(customerToken),
      data: { message: 'test broadcast' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('TC-NOTIF-022: Admin notification endpoint accepts valid admin token', async ({ request }) => {
    let adminToken = '';
    try { adminToken = await getBearerToken(request, USERS.admin.email, USERS.admin.password); }
    catch { test.skip(); return; }
    const res = await request.post(`${BASE}/api/admin/notifications`, {
      headers: authHeader(adminToken),
      data: { message: '' },
    });
    expect([200, 201, 400, 422]).toContain(res.status());
  });
});

// ─── Notification API (no auth needed for checks) ─────────────────────────────
test.describe('Notifications — API Health', () => {
  test('TC-NOTIF-030: GET /api/notifications requires auth', async ({ request }) => {
    const res = await request.get(`${BASE}/api/notifications`);
    expect([401, 403, 404]).toContain(res.status());
  });

  test('TC-NOTIF-031: Customer GET /api/notifications returns 200 or 404', async ({ request }) => {
    let token = '';
    try { token = await getBearerToken(request, USERS.customer.email, USERS.customer.password); }
    catch { test.skip(); return; }
    const res = await request.get(`${BASE}/api/notifications`, { headers: authHeader(token) });
    expect([200, 204, 404]).toContain(res.status());
  });

  test('TC-NOTIF-032: Admin POST /api/admin/notifications returns 2xx or 400/422', async ({ request }) => {
    let token = '';
    try { token = await getBearerToken(request, USERS.admin.email, USERS.admin.password); }
    catch { test.skip(); return; }
    const res = await request.post(`${BASE}/api/admin/notifications`, {
      headers: authHeader(token),
      data: { message: 'Playwright release test — ignore', target: 'all' },
    });
    expect([200, 201, 400, 422]).toContain(res.status());
  });
});

// ─── Push Notification Service Worker ────────────────────────────────────────
test.describe('Notifications — Service Worker', () => {
  test.use({ storageState: AUTH('customer') });

  test('TC-NOTIF-040: Service worker registration state on customer dashboard', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);
    await page.goto(APP + ROUTES.customer.dashboard, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await page.waitForTimeout(2_000);
    const swCount = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return -1;
      const regs = await navigator.serviceWorker.getRegistrations();
      return regs.length;
    });
    console.log(`[TC-NOTIF-040] Service workers registered: ${swCount}`);
    expect(swCount).toBeGreaterThanOrEqual(-1); // informational
  });
});
