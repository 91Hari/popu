/**
 * SMOKE TESTS — Run before every deployment.
 * Validates the critical paths in < 5 minutes.
 * Project: release — uses storageState per role (setup must run first).
 */
import { test, expect } from '@playwright/test';
import { ENV } from '../utils/env';
import { API_ENDPOINTS, ROUTES, USERS } from '../utils/test-data';

const BASE = ENV.API_URL;
const APP  = ENV.BASE_URL;

const AUTH = (role: string) => `tests/utils/.auth/${role}.json`;

function skipIfSSO(page: import('@playwright/test').Page) {
  if (page.url().includes('vercel.com')) {
    test.skip(true, 'Vercel SSO active — disable Deployment Protection.');
  }
}

// ─── 1. Application Loads (public — no auth) ──────────────────────────────────
test.describe('Smoke — Application Loads', () => {
  test('TC-SMOKE-001: Landing page renders without crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(APP + ROUTES.landing, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('TC-SMOKE-002: Login page loads with email, password, submit', async ({ page }) => {
    await page.goto(APP + ROUTES.login, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('input[autocomplete="username"], input[placeholder*="email" i]').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]').first()).toBeVisible();
  });

  test('TC-SMOKE-003: App loads on Android viewport (360×800)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(APP + ROUTES.login, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(380);
  });

  test('TC-SMOKE-004: App loads on iPhone viewport (390×844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(APP + ROUTES.login, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await expect(page.locator('body')).not.toBeEmpty();
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(410);
  });
});

// ─── 2. Login Works (API — no auth) ──────────────────────────────────────────
test.describe('Smoke — Login Works', () => {
  test('TC-SMOKE-010: POST /api/auth/login returns token + user', async ({ request }) => {
    const res = await request.post(`${BASE}${API_ENDPOINTS.login}`, {
      data: { username: USERS.customer.email, password: USERS.customer.password },
    });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body).toHaveProperty('token');
    expect(body).toHaveProperty('user');
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(10);
  });

  test('TC-SMOKE-011: Invalid credentials returns 401 (not 500)', async ({ request }) => {
    const res = await request.post(`${BASE}${API_ENDPOINTS.login}`, {
      data: { username: 'nobody@popu.test', password: 'wrongpass' },
    });
    expect([400, 401]).toContain(res.status());
  });
});

// ─── 3. Dashboard Loads — Customer ───────────────────────────────────────────
test.describe('Smoke — Dashboard Loads › Customer', () => {
  test.use({ storageState: AUTH('customer') });

  test('TC-SMOKE-020: Customer dashboard loads', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(APP + ROUTES.customer.dashboard, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    expect(page.url()).not.toContain('/login');
    await expect(page.locator('body')).not.toBeEmpty();
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('TC-SMOKE-031: Search page renders input field', async ({ page }) => {
    await page.goto(APP + ROUTES.customer.search, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    const input = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await expect(input).toBeVisible({ timeout: 10_000 });
  });
});

// ─── 3. Dashboard Loads — Caterer ────────────────────────────────────────────
test.describe('Smoke — Dashboard Loads › Caterer', () => {
  test.use({ storageState: AUTH('caterer') });

  test('TC-SMOKE-021: Caterer dashboard loads', async ({ page }) => {
    await page.goto(APP + ROUTES.caterer.dashboard, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    expect(page.url()).not.toContain('/login');
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

// ─── 3. Dashboard Loads — Admin ───────────────────────────────────────────────
test.describe('Smoke — Dashboard Loads › Admin', () => {
  test.use({ storageState: AUTH('admin') });

  test('TC-SMOKE-022: Admin dashboard loads', async ({ page }) => {
    await page.goto(APP + ROUTES.admin.dashboard, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    expect(page.url()).not.toContain('/login');
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

// ─── 3. Dashboard Loads — Rider ───────────────────────────────────────────────
test.describe('Smoke — Dashboard Loads › Rider', () => {
  test.use({ storageState: AUTH('rider') });

  test('TC-SMOKE-023: Rider dashboard loads', async ({ page }) => {
    await page.goto(APP + ROUTES.rider.dashboard, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    expect(page.url()).not.toContain('/login');
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

// ─── 4. Search Works (API — no auth) ─────────────────────────────────────────
test.describe('Smoke — Search Works', () => {
  test('TC-SMOKE-030: GET /api/search/suggestions?q=rice returns results', async ({ request }) => {
    const res = await request.get(`${BASE}${API_ENDPOINTS.search}?q=rice`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toBeDefined();
  });
});

// ─── 5. Health Check (API — no auth) ─────────────────────────────────────────
test.describe('Smoke — API Health', () => {
  test('TC-SMOKE-040: GET /health returns 200 and { status: "ok" }', async ({ request }) => {
    const res = await request.get(`${BASE}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('TC-SMOKE-041: GET /api/foods returns data (public)', async ({ request }) => {
    const res = await request.get(`${BASE}${API_ENDPOINTS.foods}`);
    expect(res.status()).toBe(200);
  });

  test('TC-SMOKE-042: GET /api/caterers returns data (public)', async ({ request }) => {
    const res = await request.get(`${BASE}${API_ENDPOINTS.caterers}`);
    expect([200]).toContain(res.status());
  });

  test('TC-SMOKE-043: Protected endpoints require auth', async ({ request }) => {
    const endpoints = [
      API_ENDPOINTS.cart,
      API_ENDPOINTS.masterOrders,
      API_ENDPOINTS.adminDashboard,
    ];
    for (const ep of endpoints) {
      const res = await request.get(`${BASE}${ep}`);
      expect([401, 403], `${ep} must require auth`).toContain(res.status());
    }
  });
});
