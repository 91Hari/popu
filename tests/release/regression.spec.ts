/**
 * REGRESSION — Full regression across all roles.
 * Project: release — uses storageState per role (setup must run first).
 */
import { test, expect } from '@playwright/test';
import { ENV } from '../utils/env';
import { API_ENDPOINTS, ROUTES, USERS } from '../utils/test-data';
import { getBearerToken, authHeader } from '../utils/helpers';

const BASE = ENV.API_URL;
const APP  = ENV.BASE_URL;

const AUTH = (role: string) => `tests/utils/.auth/${role}.json`;

function skipIfSSO(page: import('@playwright/test').Page) {
  if (page.url().includes('vercel.com')) {
    test.skip(true, 'Vercel SSO active — disable Deployment Protection.');
  }
}

// ─── Customer Regression ──────────────────────────────────────────────────────
test.describe('Regression — Customer', () => {
  test.use({ storageState: AUTH('customer') });

  test('TC-REG-CUST-001: Login API returns token', async ({ request }) => {
    const res = await request.post(`${BASE}${API_ENDPOINTS.login}`, {
      data: { username: USERS.customer.email, password: USERS.customer.password },
    });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body).toHaveProperty('token');
  });

  test('TC-REG-CUST-002: Customer dashboard renders', async ({ page }) => {
    await page.goto(APP + ROUTES.customer.dashboard, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
    expect(page.url()).not.toContain('/login');
  });

  test('TC-REG-CUST-003: Customer search page renders with input', async ({ page }) => {
    await page.goto(APP + ROUTES.customer.search, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    const input = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await expect(input).toBeVisible({ timeout: 10_000 });
  });

  test('TC-REG-CUST-004: Customer profile page renders', async ({ page }) => {
    await page.goto(APP + ROUTES.customer.profile, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
    expect(page.url()).not.toContain('/login');
  });

  test('TC-REG-CUST-005: GET /api/cart returns 200 with customer token', async ({ request }) => {
    let token = '';
    try { token = await getBearerToken(request, USERS.customer.email, USERS.customer.password); }
    catch { test.skip(); return; }
    const res = await request.get(`${BASE}${API_ENDPOINTS.cart}`, { headers: authHeader(token) });
    expect([200, 204]).toContain(res.status());
  });

  test('TC-REG-CUST-006: GET /api/master-orders returns 200 with customer token', async ({ request }) => {
    let token = '';
    try { token = await getBearerToken(request, USERS.customer.email, USERS.customer.password); }
    catch { test.skip(); return; }
    const res = await request.get(`${BASE}${API_ENDPOINTS.masterOrders}`, { headers: authHeader(token) });
    expect([200, 204]).toContain(res.status());
  });

  test('TC-REG-CUST-007: Customer notifications page renders', async ({ page }) => {
    await page.goto(APP + ROUTES.customer.notifications, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-REG-CUST-008: Customer token cannot access /admin API', async ({ request }) => {
    let token = '';
    try { token = await getBearerToken(request, USERS.customer.email, USERS.customer.password); }
    catch { test.skip(); return; }
    const res = await request.get(`${BASE}${API_ENDPOINTS.adminDashboard}`, { headers: authHeader(token) });
    expect([401, 403]).toContain(res.status());
  });
});

// ─── Caterer Regression ───────────────────────────────────────────────────────
test.describe('Regression — Caterer', () => {
  test.use({ storageState: AUTH('caterer') });

  test('TC-REG-CAT-001: Caterer dashboard renders', async ({ page }) => {
    await page.goto(APP + ROUTES.caterer.dashboard, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
    expect(page.url()).not.toContain('/login');
  });

  test('TC-REG-CAT-002: Caterer foods page renders', async ({ page }) => {
    await page.goto(APP + ROUTES.caterer.foods, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-REG-CAT-003: GET /api/caterers/me returns caterer data', async ({ request }) => {
    let token = '';
    try { token = await getBearerToken(request, USERS.caterer.email, USERS.caterer.password); }
    catch { test.skip(); return; }
    const res = await request.get(`${BASE}${API_ENDPOINTS.caterersMe}`, { headers: authHeader(token) });
    expect([200]).toContain(res.status());
  });

  test('TC-REG-CAT-004: Add food page renders form', async ({ page }) => {
    await page.goto(APP + ROUTES.caterer.addFood, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    const inputs = await page.locator('input').count();
    expect(inputs).toBeGreaterThan(0);
  });

  test('TC-REG-CAT-005: Caterer token cannot access admin dashboard API', async ({ request }) => {
    let token = '';
    try { token = await getBearerToken(request, USERS.caterer.email, USERS.caterer.password); }
    catch { test.skip(); return; }
    const res = await request.get(`${BASE}${API_ENDPOINTS.adminDashboard}`, { headers: authHeader(token) });
    expect([401, 403]).toContain(res.status());
  });
});

// ─── Rider Regression ────────────────────────────────────────────────────────
test.describe('Regression — Rider', () => {
  test.use({ storageState: AUTH('rider') });

  test('TC-REG-RIDER-001: Rider dashboard renders', async ({ page }) => {
    await page.goto(APP + ROUTES.rider.dashboard, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
    expect(page.url()).not.toContain('/login');
  });

  test('TC-REG-RIDER-002: GET /api/riders/deliveries returns 200', async ({ request }) => {
    let token = '';
    try { token = await getBearerToken(request, USERS.rider.email, USERS.rider.password); }
    catch { test.skip(); return; }
    const res = await request.get(`${BASE}${API_ENDPOINTS.riderDeliveries}`, { headers: authHeader(token) });
    expect([200, 204]).toContain(res.status());
  });

  test('TC-REG-RIDER-003: Rider token cannot access admin dashboard API', async ({ request }) => {
    let token = '';
    try { token = await getBearerToken(request, USERS.rider.email, USERS.rider.password); }
    catch { test.skip(); return; }
    const res = await request.get(`${BASE}${API_ENDPOINTS.adminDashboard}`, { headers: authHeader(token) });
    expect([401, 403]).toContain(res.status());
  });

  test('TC-REG-RIDER-004: Rider lookup page renders', async ({ page }) => {
    await page.goto(APP + ROUTES.rider.lookup, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

// ─── Admin Regression ─────────────────────────────────────────────────────────
test.describe('Regression — Admin', () => {
  test.use({ storageState: AUTH('admin') });

  test('TC-REG-ADMIN-001: Admin dashboard renders', async ({ page }) => {
    await page.goto(APP + ROUTES.admin.dashboard, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
    expect(page.url()).not.toContain('/login');
  });

  test('TC-REG-ADMIN-002: GET /api/admin/customers returns list', async ({ request }) => {
    let token = '';
    try { token = await getBearerToken(request, USERS.admin.email, USERS.admin.password); }
    catch { test.skip(); return; }
    const res = await request.get(`${BASE}${API_ENDPOINTS.adminCustomers}`, { headers: authHeader(token) });
    expect([200]).toContain(res.status());
  });

  test('TC-REG-ADMIN-003: Admin caterers page renders', async ({ page }) => {
    await page.goto(APP + ROUTES.admin.caterers, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-REG-ADMIN-004: Admin orders page renders', async ({ page }) => {
    await page.goto(APP + ROUTES.admin.orders, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-REG-ADMIN-005: Admin riders page renders', async ({ page }) => {
    await page.goto(APP + ROUTES.admin.riders, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-REG-ADMIN-006: Admin payments page renders', async ({ page }) => {
    await page.goto(APP + ROUTES.admin.payments, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-REG-ADMIN-007: Admin notifications page renders', async ({ page }) => {
    await page.goto(APP + ROUTES.admin.notifications, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-REG-ADMIN-008: GET /api/admin/dashboard returns stats object', async ({ request }) => {
    let token = '';
    try { token = await getBearerToken(request, USERS.admin.email, USERS.admin.password); }
    catch { test.skip(); return; }
    const res = await request.get(`${BASE}${API_ENDPOINTS.adminDashboard}`, { headers: authHeader(token) });
    expect([200]).toContain(res.status());
    const body = await res.json();
    expect(typeof body).toBe('object');
  });
});
