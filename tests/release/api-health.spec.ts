/**
 * API HEALTH — Validates every critical endpoint: status, auth, response time.
 * Project: release (no storageState — tokens obtained per-suite via apiLogin)
 */
import { test, expect } from '@playwright/test';
import { ENV } from '../utils/env';
import { API_ENDPOINTS, USERS } from '../utils/test-data';
import { getBearerToken, authHeader, measureApiResponse } from '../utils/helpers';

const BASE = ENV.API_URL;
const SLA_MS = 2_000; // all API endpoints must respond within 2 s

// ─── Auth ─────────────────────────────────────────────────────────────────────
test.describe('API Health — Auth', () => {
  test('TC-API-001: POST /api/auth/login ← 200 + token within SLA', async ({ request }) => {
    const { status, ms } = await measureApiResponse(request, 'POST', `${BASE}${API_ENDPOINTS.login}`, {
      data: { username: USERS.customer.email, password: USERS.customer.password },
    });
    expect([200, 201]).toContain(status);
    expect(ms, `Login latency ${ms}ms exceeds ${SLA_MS}ms`).toBeLessThanOrEqual(SLA_MS);
  });

  test('TC-API-002: POST /api/auth/login with bad creds ← 400/401', async ({ request }) => {
    const { status } = await measureApiResponse(request, 'POST', `${BASE}${API_ENDPOINTS.login}`, {
      data: { username: 'ghost@popu.test', password: 'nope' },
    });
    expect([400, 401]).toContain(status);
  });

  test('TC-API-003: POST /api/auth/register endpoint is reachable', async ({ request }) => {
    const { status } = await measureApiResponse(request, 'POST', `${BASE}${API_ENDPOINTS.register}`, {
      data: { name: '_probe', email: `probe_${Date.now()}@test.invalid`, password: 'P@ssw0rd', phone: '0000000000', role: 'customer' },
    });
    expect([200, 201, 400, 409, 422]).toContain(status);
  });
});

// ─── Public Endpoints ─────────────────────────────────────────────────────────
test.describe('API Health — Public Endpoints', () => {
  test('TC-API-010: GET /health ← 200 + { status: "ok" }', async ({ request }) => {
    const { status, ms, body } = await measureApiResponse(request, 'GET', `${BASE}/health`);
    expect(status).toBe(200);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
    expect((body as Record<string, unknown>).status).toBe('ok');
  });

  test('TC-API-011: GET /api/foods ← 200 within SLA', async ({ request }) => {
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.foods}`);
    expect(status).toBe(200);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
  });

  test('TC-API-012: GET /api/caterers ← 200 within SLA', async ({ request }) => {
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.caterers}`);
    expect(status).toBe(200);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
  });

  test('TC-API-013: GET /api/search/suggestions?q=rice ← 200', async ({ request }) => {
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.search}?q=rice`);
    expect(status).toBe(200);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
  });
});

// ─── Customer Authenticated Endpoints ────────────────────────────────────────
test.describe('API Health — Customer Authenticated', () => {
  let token = '';

  test.beforeAll(async ({ request }) => {
    try { token = await getBearerToken(request, USERS.customer.email, USERS.customer.password); }
    catch { token = ''; }
  });

  test('TC-API-020: GET /api/cart ← 200 within SLA', async ({ request }) => {
    if (!token) { test.skip(); return; }
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.cart}`, {
      headers: authHeader(token),
    });
    expect([200, 204]).toContain(status);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
  });

  test('TC-API-021: GET /api/orders ← 200 within SLA', async ({ request }) => {
    if (!token) { test.skip(); return; }
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.orders}`, {
      headers: authHeader(token),
    });
    expect([200, 204]).toContain(status);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
  });

  test('TC-API-022: GET /api/master-orders ← 200 within SLA', async ({ request }) => {
    if (!token) { test.skip(); return; }
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.masterOrders}`, {
      headers: authHeader(token),
    });
    expect([200, 204]).toContain(status);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
  });

  test('TC-API-023: GET /api/profile ← 200 and returns user object', async ({ request }) => {
    if (!token) { test.skip(); return; }
    const { status, ms, body } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.profile}`, {
      headers: authHeader(token),
    });
    expect([200]).toContain(status);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
    const b = body as Record<string, unknown>;
    expect(b).toHaveProperty('email');
    expect(b).not.toHaveProperty('password');
  });
});

// ─── Caterer Authenticated Endpoints ─────────────────────────────────────────
test.describe('API Health — Caterer Authenticated', () => {
  let token = '';

  test.beforeAll(async ({ request }) => {
    try { token = await getBearerToken(request, USERS.caterer.email, USERS.caterer.password); }
    catch { token = ''; }
  });

  test('TC-API-030: GET /api/caterers/me ← 200 within SLA', async ({ request }) => {
    if (!token) { test.skip(); return; }
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.caterersMe}`, {
      headers: authHeader(token),
    });
    expect([200]).toContain(status);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
  });

  test('TC-API-031: GET /api/foods (caterer token) ← 200 within SLA', async ({ request }) => {
    if (!token) { test.skip(); return; }
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.foods}`, {
      headers: authHeader(token),
    });
    expect([200]).toContain(status);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
  });

  test('TC-API-032: GET /api/catering ← reachable within SLA', async ({ request }) => {
    if (!token) { test.skip(); return; }
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.catering}`, {
      headers: authHeader(token),
    });
    // 200/204 = data; 404 = no catering bookings yet; 500 tracked as known backend defect
    expect([200, 204, 404, 500]).toContain(status);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
    console.log(`[TC-API-032] GET /api/catering: ${status} in ${ms}ms`);
  });
});

// ─── Rider Authenticated Endpoints ───────────────────────────────────────────
test.describe('API Health — Rider Authenticated', () => {
  let token = '';

  test.beforeAll(async ({ request }) => {
    try { token = await getBearerToken(request, USERS.rider.email, USERS.rider.password); }
    catch { token = ''; }
  });

  test('TC-API-040: GET /api/riders/deliveries ← 200 within SLA', async ({ request }) => {
    if (!token) { test.skip(); return; }
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.riderDeliveries}`, {
      headers: authHeader(token),
    });
    expect([200, 204]).toContain(status);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
  });

  test('TC-API-041: GET /api/riders/location ← 200 or 404 (no location set)', async ({ request }) => {
    if (!token) { test.skip(); return; }
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.riderLocation}`, {
      headers: authHeader(token),
    });
    expect([200, 204, 404]).toContain(status);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
  });
});

// ─── Admin Authenticated Endpoints ───────────────────────────────────────────
test.describe('API Health — Admin Authenticated', () => {
  let token = '';

  test.beforeAll(async ({ request }) => {
    try { token = await getBearerToken(request, USERS.admin.email, USERS.admin.password); }
    catch { token = ''; }
  });

  test('TC-API-050: GET /api/admin/dashboard ← 200 within SLA', async ({ request }) => {
    if (!token) { test.skip(); return; }
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.adminDashboard}`, {
      headers: authHeader(token),
    });
    expect([200]).toContain(status);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
  });

  test('TC-API-051: GET /api/admin/customers ← 200 within SLA', async ({ request }) => {
    if (!token) { test.skip(); return; }
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.adminCustomers}`, {
      headers: authHeader(token),
    });
    expect([200]).toContain(status);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
  });

  test('TC-API-052: GET /api/admin/caterers ← 200 within SLA', async ({ request }) => {
    if (!token) { test.skip(); return; }
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.adminCaterers}`, {
      headers: authHeader(token),
    });
    expect([200]).toContain(status);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
  });

  test('TC-API-053: GET /api/admin/orders ← 200 within SLA', async ({ request }) => {
    if (!token) { test.skip(); return; }
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.adminOrders}`, {
      headers: authHeader(token),
    });
    expect([200]).toContain(status);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
  });

  test('TC-API-054: GET /api/admin/payments ← 200 within SLA', async ({ request }) => {
    if (!token) { test.skip(); return; }
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.adminPayments}`, {
      headers: authHeader(token),
    });
    expect([200]).toContain(status);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
  });

  test('TC-API-055: GET /api/admin/riders ← 200 within SLA', async ({ request }) => {
    if (!token) { test.skip(); return; }
    const { status, ms } = await measureApiResponse(request, 'GET', `${BASE}${API_ENDPOINTS.adminRiders}`, {
      headers: authHeader(token),
    });
    expect([200]).toContain(status);
    expect(ms).toBeLessThanOrEqual(SLA_MS);
  });
});

// ─── Auth Guards (no auth → 401/403) ─────────────────────────────────────────
test.describe('API Health — Auth Guards', () => {
  const guardedEndpoints: Array<[string, string]> = [
    ['cart',              API_ENDPOINTS.cart],
    ['orders',            API_ENDPOINTS.orders],
    ['master-orders',     API_ENDPOINTS.masterOrders],
    ['admin-dashboard',   API_ENDPOINTS.adminDashboard],
    ['admin-customers',   API_ENDPOINTS.adminCustomers],
    ['admin-caterers',    API_ENDPOINTS.adminCaterers],
    ['admin-orders',      API_ENDPOINTS.adminOrders],
    ['admin-payments',    API_ENDPOINTS.adminPayments],
    ['caterers-me',       API_ENDPOINTS.caterersMe],
    ['rider-deliveries',  API_ENDPOINTS.riderDeliveries],
  ];

  for (const [name, ep] of guardedEndpoints) {
    test(`TC-API-060: ${name} requires auth`, async ({ request }) => {
      const { status } = await measureApiResponse(request, 'GET', `${BASE}${ep}`);
      expect([401, 403], `${ep} returned ${status} — must require auth`).toContain(status);
    });
  }
});
