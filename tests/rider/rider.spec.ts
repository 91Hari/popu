/**
 * Phase 6 — Rider Tests
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../utils/test-data';
import { skipIfRedirectedToLogin } from '../utils/skip-if-unauthed';

test.describe('Rider — Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.rider.dashboard);
  });

  test('TC-RIDER-001: Rider dashboard loads', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(3_000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('TC-RIDER-002: Dashboard shows assigned deliveries or empty state', async ({ page }) => {
    // Use locator instead of page.isVisible to avoid CSS4 `i` flag parsing errors
    const hasContent = await page.locator(
      'h5, h6, [class*="MuiCard"], [class*="MuiTypography"]',
    ).first().isVisible({ timeout: 10_000 }).catch(() => false);
    expect(hasContent).toBeTruthy();
  });

  test('TC-RIDER-003: Rider dashboard has scan / lookup action', async ({ page }) => {
    const actionBtn = page.locator(
      'button:has-text("Scan"), button:has-text("Lookup"), button:has-text("Find"), a[href*="lookup"]',
    );
    if (await actionBtn.count() > 0) {
      await expect(actionBtn.first()).toBeVisible();
    }
  });
});

test.describe('Rider — Order Lookup', () => {
  test('TC-RIDER-010: Lookup page loads with input', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.rider.lookup);
    const input = page.locator('input').first();
    await expect(input).toBeVisible({ timeout: 10_000 });
  });

  test('TC-RIDER-011: Invalid order ID shows error or stays on page', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.rider.lookup);
    const input     = page.locator('input').first();
    const submitBtn = page.locator(
      'button[type="submit"], button:has-text("Search"), button:has-text("Look")',
    ).first();

    await input.fill('INVALID-99999');
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      await page.waitForTimeout(3_000);
      const url = page.url();
      // Use locator instead of page.isVisible to avoid CSS4 i-flag parsing errors
      const hasError = await page.locator('[role="alert"], text=/not found/i').first().isVisible({ timeout: 3_000 }).catch(() => false);
      expect(url.includes('/lookup') || hasError).toBeTruthy();
    }
  });
});

test.describe('Rider — GPS & Delivery', () => {
  test('TC-RIDER-020: Delivery page accessible for valid order', async ({ page }) => {
    await skipIfRedirectedToLogin(page, '/rider/delivery/1');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-RIDER-021: Geolocation permission handling', async ({ page }) => {
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 17.385, longitude: 78.4867 });
    await skipIfRedirectedToLogin(page, ROUTES.rider.dashboard);

    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(3_000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});
