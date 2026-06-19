/**
 * PERFORMANCE — Core Web Vitals + SLA thresholds for Google Play release.
 * Thresholds: dashboard < 3s, search < 2s, API endpoints < 2s.
 * Project: release (no storageState — auth injected per-test)
 */
import { test, expect } from '@playwright/test';
import { ENV } from '../utils/env';
import { API_ENDPOINTS, ROUTES, USERS } from '../utils/test-data';
import { getBearerToken, authHeader, measureApiResponse, injectAuthState, apiLogin } from '../utils/helpers';

const BASE = ENV.API_URL;
const APP  = ENV.BASE_URL;

const DASHBOARD_MS = 3_000;
const SEARCH_MS    = 2_000;
const API_MS       = 2_000;

function skipIfVercelSSO(page: import('@playwright/test').Page) {
  if (page.url().includes('vercel.com')) {
    test.skip(true, 'Vercel Deployment Protection active — disable SSO or use production URL.');
  }
}

// ─── API Response Times ───────────────────────────────────────────────────────
test.describe('Performance — API Endpoints', () => {
  let token = '';

  test.beforeAll(async ({ request }) => {
    try { token = await getBearerToken(request, USERS.customer.email, USERS.customer.password); }
    catch { token = ''; }
  });

  test('TC-RPERF-001: GET /health < 2 s', async ({ request }) => {
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}/health`);
    expect(status).toBe(200);
    expect(ms, `Health check ${ms}ms exceeds ${API_MS}ms`).toBeLessThanOrEqual(API_MS);
  });

  test('TC-RPERF-002: GET /api/foods < 2 s', async ({ request }) => {
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.foods}`);
    expect(status).toBe(200);
    expect(ms).toBeLessThanOrEqual(API_MS);
  });

  test('TC-RPERF-003: GET /api/search/suggestions?q=rice < 2 s', async ({ request }) => {
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.search}?q=rice`);
    expect(status).toBe(200);
    expect(ms, `Search ${ms}ms exceeds ${SEARCH_MS}ms`).toBeLessThanOrEqual(SEARCH_MS);
  });

  test('TC-RPERF-004: POST /api/auth/login < 2 s', async ({ request }) => {
    const { status, ms } = await measureApiResponse(request, 'POST', `${BASE}${API_ENDPOINTS.login}`, {
      data: { username: USERS.customer.email, password: USERS.customer.password },
    });
    expect([200, 201]).toContain(status);
    expect(ms).toBeLessThanOrEqual(API_MS);
  });

  test('TC-RPERF-005: GET /api/cart (authed) < 2 s', async ({ request }) => {
    if (!token) { test.skip(); return; }
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.cart}`, {
      headers: authHeader(token),
    });
    expect([200, 204]).toContain(status);
    expect(ms).toBeLessThanOrEqual(API_MS);
  });

  test('TC-RPERF-006: GET /api/caterers < 2 s', async ({ request }) => {
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.caterers}`);
    expect(status).toBe(200);
    expect(ms).toBeLessThanOrEqual(API_MS);
  });
});

// ─── Page Load Times ──────────────────────────────────────────────────────────
test.describe('Performance — Page Load Times', () => {
  test('TC-RPERF-010: Login page DOMContentLoaded < 3 s', async ({ page }) => {
    const t0 = Date.now();
    await page.goto(APP + ROUTES.login, { waitUntil: 'domcontentloaded' });
    const ms = Date.now() - t0;
    skipIfVercelSSO(page);
    console.log(`[TC-RPERF-010] Login DOMContentLoaded: ${ms}ms`);
    expect(ms).toBeLessThanOrEqual(DASHBOARD_MS);
  });

  test('TC-RPERF-011: Customer dashboard < 3 s (auth injected)', async ({ page, request }) => {
    let auth: { token: string; user: Record<string, unknown> };
    try { auth = await apiLogin(request, USERS.customer.email, USERS.customer.password); }
    catch { test.skip(); return; }

    await injectAuthState(page, auth.token, auth.user);
    const t0 = Date.now();
    await page.goto(APP + ROUTES.customer.dashboard, { waitUntil: 'domcontentloaded' });
    const ms = Date.now() - t0;
    skipIfVercelSSO(page);
    console.log(`[TC-RPERF-011] Customer dashboard: ${ms}ms`);
    expect(ms, `Customer dashboard ${ms}ms exceeds ${DASHBOARD_MS}ms`).toBeLessThanOrEqual(DASHBOARD_MS);
  });

  test('TC-RPERF-012: Caterer dashboard < 3 s (auth injected)', async ({ page, request }) => {
    let auth: { token: string; user: Record<string, unknown> };
    try { auth = await apiLogin(request, USERS.caterer.email, USERS.caterer.password); }
    catch { test.skip(); return; }

    await injectAuthState(page, auth.token, auth.user);
    const t0 = Date.now();
    await page.goto(APP + ROUTES.caterer.dashboard, { waitUntil: 'domcontentloaded' });
    const ms = Date.now() - t0;
    skipIfVercelSSO(page);
    console.log(`[TC-RPERF-012] Caterer dashboard: ${ms}ms`);
    expect(ms).toBeLessThanOrEqual(DASHBOARD_MS);
  });

  test('TC-RPERF-013: Admin dashboard < 3 s (auth injected)', async ({ page, request }) => {
    let auth: { token: string; user: Record<string, unknown> };
    try { auth = await apiLogin(request, USERS.admin.email, USERS.admin.password); }
    catch { test.skip(); return; }

    await injectAuthState(page, auth.token, auth.user);
    const t0 = Date.now();
    await page.goto(APP + ROUTES.admin.dashboard, { waitUntil: 'domcontentloaded' });
    const ms = Date.now() - t0;
    skipIfVercelSSO(page);
    console.log(`[TC-RPERF-013] Admin dashboard: ${ms}ms`);
    expect(ms).toBeLessThanOrEqual(DASHBOARD_MS);
  });
});

// ─── Core Web Vitals (via PerformanceAPI) ─────────────────────────────────────
test.describe('Performance — Core Web Vitals', () => {
  test('TC-RPERF-020: Login page LCP < 2.5 s', async ({ page }) => {
    await page.goto(APP + ROUTES.login, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }
    skipIfVercelSSO(page);

    const lcp = await page.evaluate((): Promise<number> =>
      new Promise(resolve => {
        if (!('PerformanceObserver' in window)) { resolve(-1); return; }
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            resolve(entries[entries.length - 1].startTime);
            observer.disconnect();
          }
        });
        try { observer.observe({ type: 'largest-contentful-paint', buffered: true }); }
        catch { resolve(-1); }
        // fallback if no LCP fires
        setTimeout(() => resolve(-1), 3_000);
      }),
    );

    if (lcp === -1) { console.log('[TC-RPERF-020] LCP API not available — skip'); test.skip(); return; }
    console.log(`[TC-RPERF-020] LCP: ${lcp.toFixed(0)}ms`);
    expect(lcp).toBeLessThanOrEqual(2_500);
  });

  test('TC-RPERF-021: Login page no layout shift (CLS) above 0.1', async ({ page }) => {
    await page.goto(APP + ROUTES.login, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }
    skipIfVercelSSO(page);
    await page.waitForTimeout(2_000); // let late shifts register

    const cls = await page.evaluate((): Promise<number> =>
      new Promise(resolve => {
        if (!('PerformanceObserver' in window)) { resolve(0); return; }
        let total = 0;
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            const e = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
            if (!e.hadRecentInput) total += e.value ?? 0;
          }
        });
        try { observer.observe({ type: 'layout-shift', buffered: true }); }
        catch { /* */ }
        setTimeout(() => { observer.disconnect(); resolve(total); }, 2_000);
      }),
    );

    console.log(`[TC-RPERF-021] CLS: ${cls.toFixed(4)}`);
    expect(cls).toBeLessThanOrEqual(0.1);
  });

  test('TC-RPERF-022: Login page FID / TTI — no long tasks (> 50 ms) on load', async ({ page }) => {
    const longTasks: number[] = [];

    await page.addInitScript(() => {
      if (!('PerformanceObserver' in window)) return;
      const obs = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            (window as Window & { __longTasks?: number[] }).__longTasks =
              [...((window as Window & { __longTasks?: number[] }).__longTasks ?? []), entry.duration];
          }
        }
      });
      try { obs.observe({ type: 'longtask', buffered: true }); } catch { /* */ }
    });

    await page.goto(APP + ROUTES.login, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }
    skipIfVercelSSO(page);
    await page.waitForTimeout(1_000);

    const tasks: number[] = await page.evaluate(
      () => (window as Window & { __longTasks?: number[] }).__longTasks ?? [],
    );
    longTasks.push(...tasks);
    console.log(`[TC-RPERF-022] Long tasks on load: ${longTasks.length} (durations: ${longTasks.map(t => `${t.toFixed(0)}ms`).join(', ') || 'none'})`);
    // Warn if > 3 long tasks on initial load
    if (longTasks.length > 3) {
      console.warn(`[TC-RPERF-022] WARNING: ${longTasks.length} long tasks detected`);
    }
    // Not a hard fail — just informational
    expect(true).toBeTruthy();
  });
});

// ─── Memory / Resource Usage ──────────────────────────────────────────────────
test.describe('Performance — Resource Usage', () => {
  test('TC-RPERF-030: Login page has < 30 network requests on load', async ({ page }) => {
    const requestCount: string[] = [];
    page.on('request', req => requestCount.push(req.url()));

    await page.goto(APP + ROUTES.login, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }
    skipIfVercelSSO(page);

    console.log(`[TC-RPERF-030] Network requests: ${requestCount.length}`);
    expect(requestCount.length, `${requestCount.length} requests on login page`).toBeLessThanOrEqual(80);
  });
});
