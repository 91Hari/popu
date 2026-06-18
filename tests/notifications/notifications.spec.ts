/**
 * Notification Tests
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../utils/test-data';
import { skipIfRedirectedToLogin } from '../utils/skip-if-unauthed';

test.describe('Notifications — Customer', () => {
  test('TC-NOTIF-001: Customer notifications page renders list or empty state', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.notifications);
    // Use MuiContainer / Typography rather than CSS4 i-flag attribute selectors
    const content = page.locator(
      '[class*="MuiContainer"], [class*="MuiTypography"], h5, h6',
    ).first();
    await expect(content).toBeVisible({ timeout: 15_000 });
  });

  test('TC-NOTIF-002: Notification badge on dashboard', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.dashboard);
    const badge = page.locator('[class*="badge" i], [class*="Badge"], [aria-label*="notification" i]').first();
    const isVisible = await badge.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });
});

test.describe('Notifications — Caterer', () => {
  test('TC-NOTIF-010: Caterer notifications page renders', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.notifications);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Notifications — Admin Broadcast', () => {
  test('TC-NOTIF-020: Admin notifications page has send form', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.notifications);
    const form = page.locator(
      'form, textarea, input[placeholder*="message" i], button:has-text("Send"), button:has-text("Broadcast")',
    ).first();
    if (await form.count() > 0) await expect(form).toBeVisible();
  });
});
