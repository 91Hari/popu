/**
 * PRODUCTION READINESS — Scoring, Google Play checklist, release gate.
 *
 * Scoring:  🟢 ≥ 90%  →  SHIP
 *           🟡 70–89% →  SHIP WITH CAUTION
 *           🔴 < 70%  →  BLOCK RELEASE
 *
 * Categories (equal weight):
 *   1. Security (auth guards, no data exposure)
 *   2. Performance (SLA: dashboard < 3s, API < 2s)
 *   3. API Health (critical endpoints 200 + SLA)
 *   4. Functional (all roles can load their dashboards)
 *   5. Google Play Checklist (HTTPS, viewport, no console errors)
 *
 * Project: release — uses storageState per role for UI tests.
 */
import { test, expect } from '@playwright/test';
import { ENV } from '../utils/env';
import { API_ENDPOINTS, ROUTES, USERS } from '../utils/test-data';
import { getBearerToken, authHeader, measureApiResponse } from '../utils/helpers';

const AUTH = (role: string) => `tests/utils/.auth/${role}.json`;

const BASE = ENV.API_URL;
const APP  = ENV.BASE_URL;

interface CheckResult {
  id: string;
  category: string;
  description: string;
  passed: boolean;
  detail?: string;
}

const results: CheckResult[] = [];

function record(id: string, category: string, description: string, passed: boolean, detail?: string) {
  results.push({ id, category, description, passed, detail });
  const icon = passed ? '✅' : '❌';
  console.log(`  ${icon} [${id}] ${description}${detail ? ` — ${detail}` : ''}`);
}

function skipIfSSO(page: import('@playwright/test').Page) {
  if (page.url().includes('vercel.com')) {
    test.skip(true, 'Vercel SSO active — disable Deployment Protection.');
  }
}

// ─── 1. Security Checks ───────────────────────────────────────────────────────
test.describe('Production Readiness — 1. Security', () => {
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    try { customerToken = await getBearerToken(request, USERS.customer.email, USERS.customer.password); }
    catch { customerToken = ''; }
  });

  test('PR-SEC-001: Fake JWT rejected on protected route', async ({ request }) => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTk5OX0.bad';
    const res = await request.get(`${BASE}${API_ENDPOINTS.orders}`, {
      headers: authHeader(fakeToken),
    });
    const passed = [401, 403].includes(res.status());
    record('PR-SEC-001', 'Security', 'Fake JWT rejected', passed, `status: ${res.status()}`);
    expect(passed).toBeTruthy();
  });

  test('PR-SEC-002: Customer cannot access admin dashboard', async ({ request }) => {
    if (!customerToken) { record('PR-SEC-002', 'Security', 'Role escalation blocked', false, 'auth unavailable'); test.skip(); return; }
    const res = await request.get(`${BASE}${API_ENDPOINTS.adminDashboard}`, {
      headers: authHeader(customerToken),
    });
    const passed = [401, 403].includes(res.status());
    record('PR-SEC-002', 'Security', 'Customer blocked from admin', passed, `status: ${res.status()}`);
    expect(passed).toBeTruthy();
  });

  test('PR-SEC-003: Login response does not expose password', async ({ request }) => {
    const res = await request.post(`${BASE}${API_ENDPOINTS.login}`, {
      data: { username: USERS.customer.email, password: USERS.customer.password },
    });
    if (![200, 201].includes(res.status())) {
      record('PR-SEC-003', 'Security', 'No password in login response', false, `login failed: ${res.status()}`);
      test.skip(); return;
    }
    const body = await res.json() as Record<string, unknown>;
    const user = body.user as Record<string, unknown> | undefined;
    const exposed = 'password' in body || (user && ('password' in user || 'password_hash' in user));
    record('PR-SEC-003', 'Security', 'No password in login response', !exposed);
    expect(exposed).toBeFalsy();
  });

  test('PR-SEC-004: All admin API routes require auth', async ({ request }) => {
    const adminRoutes = [
      API_ENDPOINTS.adminDashboard,
      API_ENDPOINTS.adminCustomers,
      API_ENDPOINTS.adminCaterers,
      API_ENDPOINTS.adminOrders,
      API_ENDPOINTS.adminPayments,
    ];
    let allGuarded = true;
    for (const ep of adminRoutes) {
      const res = await request.get(`${BASE}${ep}`);
      if (![401, 403].includes(res.status())) {
        allGuarded = false;
        console.log(`  [PR-SEC-004] OPEN: ${ep} → ${res.status()}`);
      }
    }
    record('PR-SEC-004', 'Security', 'All admin routes auth-guarded', allGuarded);
    expect(allGuarded).toBeTruthy();
  });
});

// ─── 2. Performance Checks ────────────────────────────────────────────────────
test.describe('Production Readiness — 2. Performance', () => {
  test.use({ storageState: AUTH('customer') }); // PR-PERF-004 needs customer auth
  test('PR-PERF-001: GET /health < 2s', async ({ request }) => {
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}/health`);
    const passed = status === 200 && ms < 2_000;
    record('PR-PERF-001', 'Performance', '/health < 2s', passed, `${ms}ms`);
    expect(passed).toBeTruthy();
  });

  test('PR-PERF-002: GET /api/foods < 2s', async ({ request }) => {
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.foods}`);
    const passed = status === 200 && ms < 2_000;
    record('PR-PERF-002', 'Performance', '/api/foods < 2s', passed, `${ms}ms`);
    expect(passed).toBeTruthy();
  });

  test('PR-PERF-003: GET /api/search < 2s', async ({ request }) => {
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.search}?q=rice`);
    const passed = status === 200 && ms < 2_000;
    record('PR-PERF-003', 'Performance', '/api/search < 2s', passed, `${ms}ms`);
    expect(passed).toBeTruthy();
  });

  test('PR-PERF-004: Customer dashboard DOMContentLoaded < 3s', async ({ page }) => {
    const t0 = Date.now();
    await page.goto(APP + ROUTES.customer.dashboard, { waitUntil: 'domcontentloaded' });
    const ms = Date.now() - t0;
    skipIfSSO(page);
    const passed = ms < 3_000;
    record('PR-PERF-004', 'Performance', 'Dashboard DOMContentLoaded < 3s', passed, `${ms}ms`);
    expect(passed).toBeTruthy();
  });
});

// ─── 3. API Health Checks ─────────────────────────────────────────────────────
test.describe('Production Readiness — 3. API Health', () => {
  test('PR-API-001: /health endpoint is live', async ({ request }) => {
    const { status } = await measureApiResponse(request, 'GET', `${BASE}/health`);
    const passed = status === 200;
    record('PR-API-001', 'API Health', '/health is live', passed, `status: ${status}`);
    expect(passed).toBeTruthy();
  });

  test('PR-API-002: Login endpoint works end-to-end', async ({ request }) => {
    const { status } = await measureApiResponse(request, 'POST', `${BASE}${API_ENDPOINTS.login}`, {
      data: { username: USERS.customer.email, password: USERS.customer.password },
    });
    const passed = [200, 201].includes(status);
    record('PR-API-002', 'API Health', 'Login endpoint end-to-end', passed, `status: ${status}`);
    expect(passed).toBeTruthy();
  });

  test('PR-API-003: Public food and caterer endpoints return data', async ({ request }) => {
    const foods    = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.foods}`);
    const caterers = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.caterers}`);
    const passed   = foods.status === 200 && caterers.status === 200;
    record('PR-API-003', 'API Health', 'Public data endpoints live', passed,
      `foods: ${foods.status}, caterers: ${caterers.status}`);
    expect(passed).toBeTruthy();
  });

  test('PR-API-004: Admin API returns data with admin token', async ({ request }) => {
    let token = '';
    try { token = await getBearerToken(request, USERS.admin.email, USERS.admin.password); }
    catch {
      record('PR-API-004', 'API Health', 'Admin API with valid token', false, 'admin auth failed');
      test.skip(); return;
    }
    const { status } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.adminDashboard}`, {
      headers: authHeader(token),
    });
    const passed = status === 200;
    record('PR-API-004', 'API Health', 'Admin API with valid token', passed, `status: ${status}`);
    expect(passed).toBeTruthy();
  });
});

// ─── 4. Functional Checks ────────────────────────────────────────────────────
test.describe('Production Readiness — 4. Functional', () => {
  test('PR-FUNC-001: All 4 roles can authenticate', async ({ request }) => {
    const roles = [
      ['customer', USERS.customer.email, USERS.customer.password],
      ['caterer',  USERS.caterer.email,  USERS.caterer.password],
      ['rider',    USERS.rider.email,    USERS.rider.password],
      ['admin',    USERS.admin.email,    USERS.admin.password],
    ] as const;

    let allPassed = true;
    for (const [role, email, password] of roles) {
      try {
        const token = await getBearerToken(request, email, password);
        if (!token) { allPassed = false; console.log(`  [PR-FUNC-001] ${role}: no token`); }
      } catch (err) {
        allPassed = false;
        console.log(`  [PR-FUNC-001] ${role}: failed — ${String(err).slice(0, 60)}`);
      }
    }
    record('PR-FUNC-001', 'Functional', 'All 4 roles can authenticate', allPassed);
    expect(allPassed).toBeTruthy();
  });

  test('PR-FUNC-002: Customer dashboard loads', async ({ browser }) => {
    const ctx  = await browser.newContext({ storageState: AUTH('customer') });
    const page = await ctx.newPage();
    try {
      await page.goto(APP + ROUTES.customer.dashboard, { waitUntil: 'domcontentloaded' });
      try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
      skipIfSSO(page);
      const passed = !page.url().includes('/login');
      record('PR-FUNC-002', 'Functional', 'Customer dashboard loads', passed, page.url());
      expect(passed).toBeTruthy();
    } finally {
      await ctx.close();
    }
  });

  test('PR-FUNC-003: Admin dashboard loads', async ({ browser }) => {
    const ctx  = await browser.newContext({ storageState: AUTH('admin') });
    const page = await ctx.newPage();
    try {
      await page.goto(APP + ROUTES.admin.dashboard, { waitUntil: 'domcontentloaded' });
      try { await page.waitForLoadState('networkidle', { timeout: 10_000 }); } catch { /* ok */ }
      skipIfSSO(page);
      const passed = !page.url().includes('/login');
      record('PR-FUNC-003', 'Functional', 'Admin dashboard loads', passed, page.url());
      expect(passed).toBeTruthy();
    } finally {
      await ctx.close();
    }
  });

  test('PR-FUNC-004: Search returns results', async ({ request }) => {
    const { status } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.search}?q=rice`);
    const passed = status === 200;
    record('PR-FUNC-004', 'Functional', 'Search returns results', passed, `status: ${status}`);
    expect(passed).toBeTruthy();
  });
});

// ─── 5. Google Play Checklist ─────────────────────────────────────────────────
test.describe('Production Readiness — 5. Google Play Checklist', () => {
  test('PR-PLAY-001: App served over HTTPS', async ({ request }) => {
    const passed = APP.startsWith('https://') || APP.startsWith('http://localhost');
    record('PR-PLAY-001', 'Google Play', 'Served over HTTPS', passed, APP);
    expect(passed).toBeTruthy();
  });

  test('PR-PLAY-002: Login page has mobile viewport meta tag', async ({ page }) => {
    await page.goto(APP + ROUTES.login, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }
    skipIfSSO(page);

    const viewportMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta ? meta.getAttribute('content') : null;
    });

    const passed = viewportMeta !== null && viewportMeta.includes('width=device-width');
    record('PR-PLAY-002', 'Google Play', 'Mobile viewport meta tag', passed, viewportMeta ?? 'missing');
    expect(passed).toBeTruthy();
  });

  test('PR-PLAY-003: No JS errors on login page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(APP + ROUTES.login, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    await page.waitForTimeout(1_000);
    const criticalErrors = errors.filter(e => !e.includes('ResizeObserver'));
    const passed = criticalErrors.length === 0;
    record('PR-PLAY-003', 'Google Play', 'No JS errors on load', passed,
      passed ? 'clean' : criticalErrors.slice(0, 2).join('; '));
    expect(passed).toBeTruthy();
  });

  test('PR-PLAY-004: App does not overflow on 360×800 (Android)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(APP + ROUTES.login, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const passed = scrollWidth <= 380;
    record('PR-PLAY-004', 'Google Play', 'No horizontal overflow (360px)', passed, `scrollWidth: ${scrollWidth}px`);
    expect(passed).toBeTruthy();
  });

  test('PR-PLAY-005: Login page has valid <title>', async ({ page }) => {
    await page.goto(APP + ROUTES.login, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }
    skipIfSSO(page);
    const title = await page.title();
    const passed = title.length > 0 && title !== 'Untitled';
    record('PR-PLAY-005', 'Google Play', 'Valid page title', passed, `"${title}"`);
    expect(passed).toBeTruthy();
  });

  test('PR-PLAY-006: API backend on HTTPS', async ({ request }) => {
    const passed = BASE.startsWith('https://') || BASE.startsWith('http://localhost');
    record('PR-PLAY-006', 'Google Play', 'API served over HTTPS', passed, BASE);
    expect(passed).toBeTruthy();
  });

  test('PR-PLAY-007: Protected routes redirect to /login when unauthenticated', async ({ page }) => {
    const protectedRoutes = [
      ROUTES.customer.dashboard,
      ROUTES.caterer.dashboard,
      ROUTES.admin.dashboard,
      ROUTES.rider.dashboard,
    ];
    let allRedirect = true;
    for (const route of protectedRoutes) {
      await page.goto(APP + route, { waitUntil: 'domcontentloaded' });
      try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }
      const url = page.url();
      if (!url.includes('/login') && !url.includes('vercel.com')) {
        console.log(`  [PR-PLAY-007] ${route} → ${url} (not redirected to /login)`);
        allRedirect = false;
      }
    }
    record('PR-PLAY-007', 'Google Play', 'Protected routes redirect to /login', allRedirect);
    expect(allRedirect).toBeTruthy();
  });
});

// ─── Release Gate — Score + Go/No-Go ─────────────────────────────────────────
test.describe('Production Readiness — Release Gate', () => {
  test('RELEASE-GATE: Score ≥ 90% → SHIP (< 70% blocks release)', async () => {
    if (results.length === 0) {
      console.log('\n[RELEASE-GATE] No results collected yet — run full release suite first.');
      test.skip(); return;
    }

    const total  = results.length;
    const passed = results.filter(r => r.passed).length;
    const score  = Math.round((passed / total) * 100);

    const byCategory = results.reduce<Record<string, { pass: number; total: number }>>((acc, r) => {
      if (!acc[r.category]) acc[r.category] = { pass: 0, total: 0 };
      acc[r.category].total++;
      if (r.passed) acc[r.category].pass++;
      return acc;
    }, {});

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('  🚀 PRODUCTION READINESS REPORT — PO.PU');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`\n  Overall Score: ${passed}/${total} (${score}%)  ${score >= 90 ? '🟢 SHIP' : score >= 70 ? '🟡 CAUTION' : '🔴 BLOCK'}`);
    console.log('\n  By Category:');
    for (const [cat, { pass, total: tot }] of Object.entries(byCategory)) {
      const pct   = Math.round((pass / tot) * 100);
      const emoji = pct === 100 ? '🟢' : pct >= 70 ? '🟡' : '🔴';
      console.log(`    ${emoji} ${cat.padEnd(20)} ${pass}/${tot} (${pct}%)`);
    }
    console.log('\n  Failed Checks:');
    const failed = results.filter(r => !r.passed);
    if (failed.length === 0) {
      console.log('    — none —');
    } else {
      for (const r of failed) {
        console.log(`    ❌ [${r.id}] ${r.description}${r.detail ? ` — ${r.detail}` : ''}`);
      }
    }

    console.log('\n  Google Play Checklist (Automated):');
    const playItems = results.filter(r => r.category === 'Google Play');
    for (const r of playItems) {
      console.log(`    ${r.passed ? '✅' : '❌'} ${r.description}`);
    }

    console.log('\n  Google Play Checklist (Manual — complete before submission):');
    const manualChecklist = [
      ['APK / AAB built with release keystore (not debug)',               'Play Console → App Signing → Upload key'],
      ['versionCode incremented in build.gradle / pubspec.yaml',          'Must be higher than previous release'],
      ['targetSdkVersion ≥ 34 (Android 14)',                              'Enforced by Play since Aug 2024'],
      ['App icon 512×512 PNG (no transparency)',                           'Play Console → Store listing → Icon'],
      ['Feature graphic 1024×500 PNG',                                    'Play Console → Store listing'],
      ['At least 2 phone screenshots (min 320dp, max 3840px)',             'Play Console → Store listing'],
      ['Short description ≤ 80 chars',                                    'Play Console → Store listing'],
      ['Full description ≤ 4000 chars',                                   'Play Console → Store listing'],
      ['Privacy policy URL live and accessible',                          'Required for apps that collect user data'],
      ['Content rating questionnaire completed',                          'Play Console → Content rating'],
      ['Target audience and content declared',                            'Play Console → Target audience'],
      ['Data safety form filled (location, account data collected)',       'Play Console → Data safety'],
      ['Crash-free rate ≥ 99% in internal/alpha track before promoting',  'Play Console → Android vitals'],
      ['ANR rate < 0.47% (Play policy threshold)',                        'Play Console → Android vitals'],
      ['No policy violations flagged by pre-launch report',               'Automatic after uploading AAB'],
      ['Release notes written for this version (what\'s new)',            'Play Console → Release → What\'s new'],
    ];

    for (const [item, hint] of manualChecklist) {
      console.log(`    ☐  ${item}`);
      console.log(`       → ${hint}`);
    }

    console.log('════════════════════════════════════════════════════════════════\n');

    // Release Gate
    if (score < 70) {
      expect.soft(score, `🔴 RELEASE BLOCKED: score ${score}% < 70% minimum threshold`).toBeGreaterThanOrEqual(70);
    } else if (score < 90) {
      console.warn(`  ⚠️  SHIP WITH CAUTION: score ${score}% is below the 90% green threshold`);
    }

    expect(score, `Release score: ${score}%`).toBeGreaterThanOrEqual(70);
  });
});
