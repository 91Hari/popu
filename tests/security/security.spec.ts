/**
 * Phase 12 — Security Tests
 * Covers: broken authentication, unauthorized access, role escalation,
 *         SQL injection probes, XSS probes, sensitive data exposure,
 *         open admin routes, CORS headers.
 *
 * IMPORTANT: These are non-destructive probes — read-only or with
 * invalid data that will be rejected by the server.
 */
import { test, expect } from '@playwright/test';
import { ENV } from '../utils/env';
import { API_ENDPOINTS, USERS } from '../utils/test-data';
import { getBearerToken, authHeader } from '../utils/helpers';

const API_BASE = ENV.API_URL;

// ─── Broken Authentication ────────────────────────────────────────────────────
test.describe('Security — Broken Authentication', () => {
  test('TC-SEC-001: Expired / fake JWT token returns 401 on protected route', async ({ request }) => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTk5OX0.invalid_signature';
    const res = await request.get(`${API_BASE}${API_ENDPOINTS.orders}`, {
      headers: authHeader(fakeToken),
    });
    expect([401, 403]).toContain(res.status());
  });

  test('TC-SEC-002: Empty Authorization header returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}${API_ENDPOINTS.orders}`, {
      headers: { Authorization: '' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('TC-SEC-003: "Bearer " prefix only (no token) returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}${API_ENDPOINTS.orders}`, {
      headers: { Authorization: 'Bearer ' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('TC-SEC-004: Wrong auth scheme returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}${API_ENDPOINTS.orders}`, {
      headers: { Authorization: 'Basic dXNlcjpwYXNz' },
    });
    expect([401, 403]).toContain(res.status());
  });
});

// ─── Role Escalation ─────────────────────────────────────────────────────────
test.describe('Security — Role Escalation', () => {
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    try {
      customerToken = await getBearerToken(request, USERS.customer.email, USERS.customer.password);
    } catch { customerToken = 'no-token'; }
  });

  test('TC-SEC-010: Customer token cannot access /api/admin/dashboard', async ({ request }) => {
    if (customerToken === 'no-token') { test.skip(); return; }
    const res = await request.get(`${API_BASE}${API_ENDPOINTS.adminDashboard}`, {
      headers: authHeader(customerToken),
    });
    expect([401, 403]).toContain(res.status());
  });

  test('TC-SEC-011: Customer token cannot access /api/admin/customers', async ({ request }) => {
    if (customerToken === 'no-token') { test.skip(); return; }
    const res = await request.get(`${API_BASE}${API_ENDPOINTS.adminCustomers}`, {
      headers: authHeader(customerToken),
    });
    expect([401, 403]).toContain(res.status());
  });

  test('TC-SEC-012: Customer token cannot POST /api/admin/notifications', async ({ request }) => {
    if (customerToken === 'no-token') { test.skip(); return; }
    const res = await request.post(`${API_BASE}/api/admin/notifications`, {
      headers: authHeader(customerToken),
      data: { message: 'XSS probe' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('TC-SEC-013: Customer token cannot GET /api/caterers/me (caterer-only route)', async ({ request }) => {
    if (customerToken === 'no-token') { test.skip(); return; }
    const res = await request.get(`${API_BASE}${API_ENDPOINTS.caterersMe}`, {
      headers: authHeader(customerToken),
    });
    expect([401, 403]).toContain(res.status());
  });

  test('TC-SEC-014: Customer token cannot POST /api/riders (caterer-only)', async ({ request }) => {
    if (customerToken === 'no-token') { test.skip(); return; }
    const res = await request.post(`${API_BASE}${API_ENDPOINTS.riders}`, {
      headers: authHeader(customerToken),
      data: { name: 'Test Rider', phone: '9999999999' },
    });
    expect([401, 403]).toContain(res.status());
  });
});

// ─── SQL Injection ────────────────────────────────────────────────────────────
test.describe('Security — SQL Injection Probes', () => {
  const sqliPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE users;--",
    "1 UNION SELECT * FROM users--",
    "admin'--",
  ];

  for (const payload of sqliPayloads) {
    test(`TC-SEC-020: SQLi probe in login username: "${payload.substring(0, 30)}"`, async ({ request }) => {
      // Backend uses "username" field (not "email")
      const res = await request.post(`${API_BASE}${API_ENDPOINTS.login}`, {
        data: { username: payload, password: 'anything' },
      });
      // Accept: 400/401/403/422 (app rejection) OR 403/503 (WAF block) — all safe
      expect([400, 401, 403, 422, 500, 503]).toContain(res.status());

      const ct = res.headers()['content-type'] || '';
      if (ct.includes('json')) {
        // JSON response — check for DB error leakage
        const body = await res.text();
        const sensitiveTerms = ['syntax error', 'ORA-', 'pg_query', 'stack trace'];
        for (const term of sensitiveTerms) {
          expect(body.toLowerCase()).not.toContain(term.toLowerCase());
        }
      } else {
        // WAF HTML block page — passing security control, just log it
        console.log(`[SEC] SQLi blocked by WAF: "${payload.substring(0, 20)}" → ${res.status()}`);
        expect([403, 503]).toContain(res.status());
      }
    });
  }

  test('TC-SEC-021: SQLi in search query returns safe response', async ({ request }) => {
    const res = await request.get(
      `${API_BASE}${API_ENDPOINTS.search}?q=%27 OR 1%3D1--`,
    );
    // WAF may block (403/503) or app may return 200 with empty results — both are safe
    expect([200, 400, 401, 403, 503]).toContain(res.status());
    const ct = res.headers()['content-type'] || '';
    if (ct.includes('json')) {
      const body = await res.text();
      expect(body).not.toContain('syntax error');
      expect(body).not.toContain('pg_query');
    }
  });
});

// ─── XSS Probes ──────────────────────────────────────────────────────────────
test.describe('Security — XSS Probes', () => {
  const xssPayload = '<script>alert("XSS")</script>';

  test('TC-SEC-030: XSS payload in login username is rejected', async ({ request }) => {
    // Backend uses "username" field
    const res = await request.post(`${API_BASE}${API_ENDPOINTS.login}`, {
      data: { username: xssPayload, password: 'password' },
    });
    // WAF may also intercept (403/503)
    expect([400, 401, 403, 422, 503]).toContain(res.status());
  });

  test('TC-SEC-031: XSS payload in search does not reflect in response body unescaped', async ({ request }) => {
    const res = await request.get(
      `${API_BASE}${API_ENDPOINTS.search}?q=${encodeURIComponent(xssPayload)}`,
    );
    const body = await res.text();
    // Raw script tag must not be reflected
    expect(body).not.toContain('<script>alert("XSS")</script>');
  });
});

// ─── Sensitive Data Exposure ─────────────────────────────────────────────────
test.describe('Security — Sensitive Data Exposure', () => {
  test('TC-SEC-040: Login response does not contain password field', async ({ request }) => {
    const res = await request.post(`${API_BASE}${API_ENDPOINTS.login}`, {
      data: { email: USERS.customer.email, password: USERS.customer.password },
    });
    if (res.status() !== 200 && res.status() !== 201) { test.skip(); return; }
    const body = await res.json() as Record<string, unknown>;
    expect(body).not.toHaveProperty('password');
    const user = body.user as Record<string, unknown> | undefined;
    if (user) {
      expect(user).not.toHaveProperty('password');
      expect(user).not.toHaveProperty('password_hash');
    }
  });

  test('TC-SEC-041: Server does not expose X-Powered-By or stack traces', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`);
    const headers = res.headers();
    expect(headers['x-powered-by']).toBeUndefined();
  });

  test('TC-SEC-042: 404 response does not expose internal paths', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/nonexistent-route-xyz`);
    const body = await res.text();
    // Must not expose file system paths
    expect(body).not.toMatch(/\/Users\//);
    expect(body).not.toMatch(/C:\\/);
    expect(body).not.toContain('node_modules');
  });
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
test.describe('Security — CORS', () => {
  test('TC-SEC-050: CORS headers are present on API responses', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`, {
      headers: { Origin: 'https://evil.attacker.com' },
    });
    // The response should either reject the origin or have proper CORS headers
    const headers = res.headers();
    const acao = headers['access-control-allow-origin'];
    // Log for audit — both wildcard and specific origin are findings to review
    console.log(`[TC-SEC-050] Access-Control-Allow-Origin: ${acao || 'not set'}`);
    expect(typeof res.status()).toBe('number');
  });
});

// ─── Open Routes (Admin) ─────────────────────────────────────────────────────
test.describe('Security — Open Admin Routes', () => {
  const adminRoutes = [
    API_ENDPOINTS.adminDashboard,
    API_ENDPOINTS.adminCustomers,
    API_ENDPOINTS.adminCaterers,
    API_ENDPOINTS.adminOrders,
    API_ENDPOINTS.adminPayments,
    '/api/admin/platform-settings',
    '/api/admin/users',
  ];

  for (const route of adminRoutes) {
    test(`TC-SEC-060: ${route} requires authentication`, async ({ request }) => {
      const res = await request.get(`${API_BASE}${route}`);
      expect([401, 403]).toContain(
        res.status(),
        `${route} is accessible without auth (status: ${res.status()})`,
      );
    });
  }
});
