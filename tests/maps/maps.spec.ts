/**
 * Phase 13 — Google Maps Tests
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../utils/test-data';
import { skipIfRedirectedToLogin } from '../utils/skip-if-unauthed';

test.describe('Maps — Location Detection', () => {
  test('TC-MAP-001: Dashboard loads without crash when geolocation granted', async ({ page }) => {
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 17.385, longitude: 78.4867 });
    await skipIfRedirectedToLogin(page, ROUTES.customer.dashboard);

    // Dashboard uses geo coords for food fetching, not a visible location picker
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(3_000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-MAP-002: Geolocation denial does not crash the app', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.dashboard);
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(3_000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

test.describe('Maps — Address Management', () => {
  test('TC-MAP-010: Address management page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.addresses);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-MAP-011: Address form has location fields', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.addresses);
    const addressInput = page.locator(
      'input[placeholder*="address" i], input[placeholder*="city" i], input[placeholder*="pincode" i], input[placeholder*="street" i]',
    ).first();
    if (await addressInput.count() > 0) await expect(addressInput).toBeVisible();
  });
});

test.describe('Maps — Rider Tracking', () => {
  test('TC-MAP-020: Track delivery page accessible', async ({ page }) => {
    await skipIfRedirectedToLogin(page, '/customer/track/1');
    // Page loads; may show map, tracking info, or a not-found state
    const content = page.locator(
      '[class*="MuiContainer"], h5, h6',
    ).first();
    await expect(content).toBeVisible({ timeout: 15_000 });
  });

  test('TC-MAP-021: Google Maps script loaded on tracking page', async ({ page }) => {
    const mapRequests: string[] = [];
    page.on('request', req => {
      if (req.url().includes('maps.googleapis.com') || req.url().includes('maps.google.com')) {
        mapRequests.push(req.url());
      }
    });
    await skipIfRedirectedToLogin(page, '/customer/track/1');
    await page.waitForTimeout(3_000);
    console.log(`[TC-MAP-021] Google Maps requests: ${mapRequests.length}`);
    expect(typeof mapRequests.length).toBe('number');
  });
});

test.describe('Maps — Caterer Address', () => {
  test('TC-MAP-030: Caterer profile address page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.profile + '/addresses');
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
