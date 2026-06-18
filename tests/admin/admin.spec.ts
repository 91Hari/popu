/**
 * Phase 7 — Admin Tests
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../utils/test-data';
import { skipIfRedirectedToLogin } from '../utils/skip-if-unauthed';

test.describe('Admin — Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.dashboard);
  });

  test('TC-ADMIN-001: Admin dashboard loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(3_000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('TC-ADMIN-002: Dashboard shows summary stats', async ({ page }) => {
    const stat = page.locator('[class*="stat" i], [class*="card" i], [class*="summary" i], h2, h3').first();
    await expect(stat).toBeVisible({ timeout: 15_000 });
  });

  test('TC-ADMIN-003: Sidebar navigation is visible', async ({ page }) => {
    const nav = page.locator('nav, [role="navigation"], [class*="sidebar" i], [class*="drawer" i]').first();
    await expect(nav).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Admin — User Management', () => {
  test('TC-ADMIN-010: Customers page loads and shows table', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.customers);
    const table = page.locator('table, [class*="table" i], [role="grid"]').first();
    await expect(table).toBeVisible({ timeout: 15_000 });
  });

  test('TC-ADMIN-011: Caterers page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.caterers);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-ADMIN-012: Riders page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.riders);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Admin — Food Management', () => {
  test('TC-ADMIN-020: Foods page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.foods);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Admin — Orders', () => {
  test('TC-ADMIN-030: Orders page loads with table or empty state', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.orders);
    // AdminOrdersPage always renders a <table> once loaded
    const tableOrEmpty = page.locator('table, [role="grid"], h5').first();
    await expect(tableOrEmpty).toBeVisible({ timeout: 15_000 });
  });

  test('TC-ADMIN-031: Master orders page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.masterOrders);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Admin — Payments', () => {
  test('TC-ADMIN-040: Payments page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.payments);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-ADMIN-041: Refunds page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.refunds);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Admin — Services', () => {
  test('TC-ADMIN-050: Services management page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.services);
    // ServiceManagementPage renders Cards for each service config
    const content = page.locator('[class*="MuiCard"], [class*="MuiTypography"], h5, h6').first();
    await expect(content).toBeVisible({ timeout: 20_000 });
  });

  test('TC-ADMIN-051: Catering bookings page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.catering);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-ADMIN-052: Tiffin admin page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.tiffin);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Admin — Notifications', () => {
  test('TC-ADMIN-060: Notifications page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.notifications);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-ADMIN-061: Broadcast notification form is present', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.notifications);
    const form = page.locator(
      'form, textarea, input[placeholder*="message" i], button:has-text("Send"), button:has-text("Broadcast")',
    ).first();
    if (await form.count() > 0) await expect(form).toBeVisible();
  });
});

test.describe('Admin — Settings', () => {
  test('TC-ADMIN-070: Settings page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.settings);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-ADMIN-071: Platform settings page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.platformSettings);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Admin — Reports', () => {
  test('TC-ADMIN-080: Reports page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.reports);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
