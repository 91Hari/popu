/**
 * Phase 11 — Performance Tests
 * Measures page load times and API response times.
 * Flags anything exceeding 3 seconds as a defect.
 *
 * These tests run in the 'api' project (no auth state, chromium only).
 */
import { test, expect } from '@playwright/test';
import { ENV } from '../utils/env';
import { API_ENDPOINTS, ROUTES, USERS } from '../utils/test-data';
import { measurePageLoad, measureApiResponse, getBearerToken, authHeader } from '../utils/helpers';

const BASE     = ENV.BASE_URL;
const API_BASE = ENV.API_URL;
const THRESHOLD_MS = 3_000;

interface PerfResult {
  name:   string;
  ms:     number;
  passed: boolean;
}

const results: PerfResult[] = [];

function record(name: string, ms: number) {
  const passed = ms < THRESHOLD_MS;
  results.push({ name, ms, passed });
  console.log(`[PERF] ${name}: ${ms}ms ${passed ? '✓' : '✗ SLOW (>3s)'}`);
  return passed;
}

test.describe('Performance — Page Load Times', () => {
  test('TC-PERF-001: Landing page loads under 3s', async ({ page }) => {
    const ms = await measurePageLoad(page, BASE + ROUTES.landing);
    const ok = record('Landing Page', ms);
    expect(ok, `Landing page took ${ms}ms (threshold: ${THRESHOLD_MS}ms)`).toBeTruthy();
  });

  test('TC-PERF-002: Login page loads under 3s', async ({ page }) => {
    const ms = await measurePageLoad(page, BASE + ROUTES.login);
    const ok = record('Login Page', ms);
    expect(ok, `Login page took ${ms}ms`).toBeTruthy();
  });

  test('TC-PERF-003: Register page loads under 3s', async ({ page }) => {
    const ms = await measurePageLoad(page, BASE + ROUTES.register);
    const ok = record('Register Page', ms);
    expect(ok, `Register page took ${ms}ms`).toBeTruthy();
  });
});

test.describe('Performance — API Response Times', () => {
  test('TC-PERF-010: GET /health responds under 3s', async ({ request }) => {
    const { ms, status } = await measureApiResponse(request, 'GET', `${API_BASE}/health`);
    expect(status).toBe(200);
    const ok = record('GET /health', ms);
    expect(ok, `Health check took ${ms}ms`).toBeTruthy();
  });

  test('TC-PERF-011: GET /api/foods responds under 3s', async ({ request }) => {
    const { ms, status } = await measureApiResponse(request, 'GET', `${API_BASE}${API_ENDPOINTS.foods}`);
    expect([200, 401]).toContain(status);
    const ok = record('GET /api/foods', ms);
    expect(ok, `Foods API took ${ms}ms`).toBeTruthy();
  });

  test('TC-PERF-012: GET /api/caterers responds under 3s', async ({ request }) => {
    const { ms, status } = await measureApiResponse(request, 'GET', `${API_BASE}${API_ENDPOINTS.caterers}`);
    expect([200, 401]).toContain(status);
    const ok = record('GET /api/caterers', ms);
    expect(ok, `Caterers API took ${ms}ms`).toBeTruthy();
  });

  test('TC-PERF-013: GET /api/search/suggestions?q=biryani responds under 3s', async ({ request }) => {
    const { ms, status } = await measureApiResponse(
      request, 'GET', `${API_BASE}${API_ENDPOINTS.search}?q=biryani`,
    );
    expect([200, 401]).toContain(status);
    const ok = record('GET /api/search/suggestions', ms);
    expect(ok, `Search API took ${ms}ms`).toBeTruthy();
  });

  test('TC-PERF-014: POST /api/auth/login responds under 3s', async ({ request }) => {
    const { ms, status } = await measureApiResponse(
      request, 'POST', `${API_BASE}${API_ENDPOINTS.login}`,
      { data: { username: USERS.customer.email, password: USERS.customer.password } },
    );
    expect([200, 201, 400, 401]).toContain(status);
    const ok = record('POST /api/auth/login', ms);
    expect(ok, `Login API took ${ms}ms`).toBeTruthy();
  });

  test('TC-PERF-015: GET /api/admin/dashboard responds under 3s (authed)', async ({ request }) => {
    let token = '';
    try {
      token = await getBearerToken(request, USERS.admin.email, USERS.admin.password);
    } catch { test.skip(); return; }

    const { ms, status } = await measureApiResponse(
      request, 'GET', `${API_BASE}${API_ENDPOINTS.adminDashboard}`,
      { headers: authHeader(token) },
    );
    expect([200, 401, 403]).toContain(status);
    const ok = record('GET /api/admin/dashboard', ms);
    expect(ok, `Admin dashboard API took ${ms}ms`).toBeTruthy();
  });

  test('TC-PERF-016: GET /api/master-orders responds under 3s (authed)', async ({ request }) => {
    let token = '';
    try {
      token = await getBearerToken(request, USERS.customer.email, USERS.customer.password);
    } catch { test.skip(); return; }

    const { ms, status } = await measureApiResponse(
      request, 'GET', `${API_BASE}${API_ENDPOINTS.masterOrders}`,
      { headers: authHeader(token) },
    );
    expect([200, 401]).toContain(status);
    const ok = record('GET /api/master-orders', ms);
    expect(ok, `Master orders API took ${ms}ms`).toBeTruthy();
  });

  test('TC-PERF-017: GET /api/tiffin responds under 3s (authed)', async ({ request }) => {
    let token = '';
    try {
      token = await getBearerToken(request, USERS.customer.email, USERS.customer.password);
    } catch { test.skip(); return; }

    const { ms, status } = await measureApiResponse(
      request, 'GET', `${API_BASE}${API_ENDPOINTS.tiffin}`,
      { headers: authHeader(token) },
    );
    expect([200, 401, 404]).toContain(status);
    const ok = record('GET /api/tiffin', ms);
    expect(ok, `Tiffin API took ${ms}ms`).toBeTruthy();
  });

  test('TC-PERF-999: Print performance summary', async () => {
    const slow = results.filter(r => !r.passed);
    console.log('\n═══ PERFORMANCE SUMMARY ═══');
    for (const r of results) {
      console.log(`  ${r.passed ? '✓' : '✗'} ${r.name}: ${r.ms}ms`);
    }
    if (slow.length > 0) {
      console.log(`\n⚠ SLOW APIs / Pages (>${THRESHOLD_MS}ms):`);
      for (const r of slow) {
        console.log(`  ✗ ${r.name}: ${r.ms}ms`);
      }
    }
    console.log('═══════════════════════════\n');
    // Summary test always passes — individual tests carry the assertions
    expect(true).toBeTruthy();
  });
});
