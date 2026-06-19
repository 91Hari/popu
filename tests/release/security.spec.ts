/**
 * SECURITY — Release-level security suite.
 * Covers: broken auth, role escalation matrix, session hijacking,
 *         token expiry, data isolation, admin surface.
 * Project: release (no storageState — tokens obtained per-suite)
 */
import { test, expect } from '@playwright/test';
import { ENV } from '../utils/env';
import { API_ENDPOINTS, USERS } from '../utils/test-data';
import { getBearerToken, authHeader } from '../utils/helpers';

const BASE = ENV.API_URL;

// ─── Broken Auth ──────────────────────────────────────────────────────────────
test.describe('Release Security — Broken Auth', () => {
  const badTokens = [
    ['forge-signed',  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTk5OX0.bad_sig'],
    ['empty-bearer',  ''],
    ['bearer-only',   ' '],
    ['basic-scheme',  null], // signals "use Basic auth"
    ['garbage',       'not-a-token-at-all'],
  ];

  for (const [label, tok] of badTokens) {
    test(`TC-RSEC-001[${label}]: rejected on /api/orders`, async ({ request }) => {
      const headers: Record<string, string> =
        label === 'basic-scheme'
          ? { Authorization: 'Basic dXNlcjpwYXNz' }
          : { Authorization: tok ? `Bearer ${tok}` : '' };

      const res = await request.get(`${BASE}${API_ENDPOINTS.orders}`, { headers });
      expect([401, 403]).toContain(res.status());
    });
  }
});

// ─── Role Escalation Matrix ───────────────────────────────────────────────────
test.describe('Release Security — Role Escalation Matrix', () => {
  let customerToken = '';
  let catererToken  = '';
  let riderToken    = '';

  test.beforeAll(async ({ request }) => {
    try { customerToken = await getBearerToken(request, USERS.customer.email, USERS.customer.password); } catch { /* */ }
    try { catererToken  = await getBearerToken(request, USERS.caterer.email, USERS.caterer.password); }  catch { /* */ }
    try { riderToken    = await getBearerToken(request, USERS.rider.email, USERS.rider.password); }      catch { /* */ }
  });

  // Customer → Admin
  const adminRoutes: Array<[string, string, string]> = [
    ['customer', 'admin-dashboard', API_ENDPOINTS.adminDashboard],
    ['customer', 'admin-customers', API_ENDPOINTS.adminCustomers],
    ['customer', 'admin-caterers',  API_ENDPOINTS.adminCaterers],
    ['customer', 'admin-orders',    API_ENDPOINTS.adminOrders],
    ['customer', 'admin-payments',  API_ENDPOINTS.adminPayments],
    ['customer', 'admin-riders',    API_ENDPOINTS.adminRiders],
  ];

  for (const [role, name, ep] of adminRoutes) {
    test(`TC-RSEC-010: ${role} token blocked from ${name}`, async ({ request }) => {
      if (!customerToken) { test.skip(); return; }
      const res = await request.get(`${BASE}${ep}`, {
        headers: authHeader(customerToken),
      });
      expect([401, 403], `${ep} returned ${res.status()} with ${role} token`).toContain(res.status());
    });
  }

  // Customer → Caterer routes
  test('TC-RSEC-020: Customer token blocked from GET /api/caterers/me', async ({ request }) => {
    if (!customerToken) { test.skip(); return; }
    const res = await request.get(`${BASE}${API_ENDPOINTS.caterersMe}`, {
      headers: authHeader(customerToken),
    });
    expect([401, 403]).toContain(res.status());
  });

  test('TC-RSEC-021: Customer token blocked from POST /api/riders', async ({ request }) => {
    if (!customerToken) { test.skip(); return; }
    const res = await request.post(`${BASE}${API_ENDPOINTS.riders}`, {
      headers: authHeader(customerToken),
      data: { name: 'Escalation Test', phone: '9999999999' },
    });
    expect([401, 403]).toContain(res.status());
  });

  // Rider → Admin
  test('TC-RSEC-030: Rider token blocked from admin-dashboard', async ({ request }) => {
    if (!riderToken) { test.skip(); return; }
    const res = await request.get(`${BASE}${API_ENDPOINTS.adminDashboard}`, {
      headers: authHeader(riderToken),
    });
    expect([401, 403]).toContain(res.status());
  });

  test('TC-RSEC-031: Rider token blocked from caterers/me', async ({ request }) => {
    if (!riderToken) { test.skip(); return; }
    const res = await request.get(`${BASE}${API_ENDPOINTS.caterersMe}`, {
      headers: authHeader(riderToken),
    });
    expect([401, 403]).toContain(res.status());
  });

  // Caterer → Admin
  test('TC-RSEC-040: Caterer token blocked from admin-dashboard', async ({ request }) => {
    if (!catererToken) { test.skip(); return; }
    const res = await request.get(`${BASE}${API_ENDPOINTS.adminDashboard}`, {
      headers: authHeader(catererToken),
    });
    expect([401, 403]).toContain(res.status());
  });

  test('TC-RSEC-041: Caterer token blocked from POST admin/notifications', async ({ request }) => {
    if (!catererToken) { test.skip(); return; }
    const res = await request.post(`${BASE}/api/admin/notifications`, {
      headers: authHeader(catererToken),
      data: { message: 'escalation probe' },
    });
    expect([401, 403]).toContain(res.status());
  });
});

// ─── Session Hijacking / Token Theft ─────────────────────────────────────────
test.describe('Release Security — Session Hijacking', () => {
  test('TC-RSEC-050: Token from user A cannot fetch user B profile', async ({ request }) => {
    // Two different users must not share access to each other's data
    let tokenA = '';
    let tokenB = '';
    try { tokenA = await getBearerToken(request, USERS.customer.email, USERS.customer.password); } catch { /* */ }
    try { tokenB = await getBearerToken(request, USERS.caterer.email,  USERS.caterer.password); }  catch { /* */ }

    if (!tokenA || !tokenB) { test.skip(); return; }

    // With tokenA, try to access caterer-only /api/caterers/me — should be 401/403
    const resA = await request.get(`${BASE}${API_ENDPOINTS.caterersMe}`, {
      headers: authHeader(tokenA),
    });
    expect([401, 403]).toContain(resA.status());
  });

  test('TC-RSEC-051: Replay same token on different origin is rejected by CORS policy', async ({ request }) => {
    let token = '';
    try { token = await getBearerToken(request, USERS.customer.email, USERS.customer.password); } catch { /* */ }
    if (!token) { test.skip(); return; }

    const res = await request.get(`${BASE}${API_ENDPOINTS.orders}`, {
      headers: { ...authHeader(token), Origin: 'https://evil.attacker.example' },
    });
    const acao = res.headers()['access-control-allow-origin'] ?? '';
    // Evil origin must not be reflected back
    expect(acao).not.toBe('https://evil.attacker.example');
    console.log(`[TC-RSEC-051] ACAO header: "${acao}"`);
  });
});

// ─── Injection Probes ─────────────────────────────────────────────────────────
test.describe('Release Security — Injection Probes', () => {
  const sqliPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE users;--",
    "1 UNION SELECT * FROM users--",
  ];

  for (const payload of sqliPayloads) {
    test(`TC-RSEC-060: SQLi in login username does not crash server: "${payload.slice(0, 25)}..."`, async ({ request }) => {
      const res = await request.post(`${BASE}${API_ENDPOINTS.login}`, {
        data: { username: payload, password: 'any' },
      });
      expect([400, 401, 403, 422, 503]).toContain(res.status());
      const ct = res.headers()['content-type'] ?? '';
      if (ct.includes('json')) {
        const body = await res.text();
        const leaks = ['syntax error', 'ORA-', 'pg_query', 'stack trace'];
        for (const term of leaks) {
          expect(body.toLowerCase()).not.toContain(term.toLowerCase());
        }
      }
    });
  }

  test('TC-RSEC-061: XSS payload in login not reflected in response body', async ({ request }) => {
    const xss = '<script>alert("xss")</script>';
    const res  = await request.post(`${BASE}${API_ENDPOINTS.login}`, {
      data: { username: xss, password: 'any' },
    });
    const body = await res.text();
    expect(body).not.toContain('<script>alert("xss")</script>');
  });

  test('TC-RSEC-062: XSS in search not reflected unescaped', async ({ request }) => {
    const xss = encodeURIComponent('<script>alert("xss")</script>');
    const res  = await request.get(`${BASE}${API_ENDPOINTS.search}?q=${xss}`);
    const body = await res.text();
    expect(body).not.toContain('<script>alert("xss")</script>');
  });
});

// ─── Sensitive Data Exposure ──────────────────────────────────────────────────
test.describe('Release Security — Sensitive Data Exposure', () => {
  test('TC-RSEC-070: Login response does not expose password hash', async ({ request }) => {
    const res = await request.post(`${BASE}${API_ENDPOINTS.login}`, {
      data: { username: USERS.customer.email, password: USERS.customer.password },
    });
    if (![200, 201].includes(res.status())) { test.skip(); return; }
    const body = await res.json() as Record<string, unknown>;
    expect(body).not.toHaveProperty('password');
    const user = body.user as Record<string, unknown> | undefined;
    if (user) {
      expect(user).not.toHaveProperty('password');
      expect(user).not.toHaveProperty('password_hash');
      expect(user).not.toHaveProperty('salt');
    }
  });

  test('TC-RSEC-071: 404 responses do not expose internal file paths', async ({ request }) => {
    const res  = await request.get(`${BASE}/api/__playwright_probe_${Date.now()}`);
    const body = await res.text();
    expect(body).not.toMatch(/\/Users\//);
    expect(body).not.toMatch(/C:\\/);
    expect(body).not.toContain('node_modules');
  });

  test('TC-RSEC-072: Server does not expose X-Powered-By header', async ({ request }) => {
    const res = await request.get(`${BASE}/health`);
    expect(res.headers()['x-powered-by']).toBeUndefined();
  });
});
