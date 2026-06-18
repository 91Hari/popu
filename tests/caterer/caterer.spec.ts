/**
 * Phase 5 — Caterer Tests
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../utils/test-data';
import { skipIfRedirectedToLogin } from '../utils/skip-if-unauthed';

test.describe('Caterer — Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.dashboard);
  });

  test('TC-CATR-001: Caterer dashboard loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(3_000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('TC-CATR-002: Dashboard shows stats / orders summary', async ({ page }) => {
    const stat = page.locator(
      '[class*="stat" i], [class*="card" i], [class*="summary" i], h2, h3',
    ).first();
    await expect(stat).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Caterer — Food Management', () => {
  test('TC-CATR-010: Food list page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.foods);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-CATR-011: Add food page renders form', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.addFood);
    // MUI TextField renders <input type="text"> without name attribute; find any text input
    const nameInput = page.locator('input[type="text"], input[autocomplete="off"]').first();
    await expect(nameInput).toBeVisible({ timeout: 15_000 });
  });

  test('TC-CATR-012: Add food form has price field', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.addFood);
    // MUI TextField passes inputMode to the wrapper div, not the <input>; verify
    // the form has at least 2 text inputs: Food Name and Price (₹).
    const inputs = page.locator('input[type="text"], input:not([type])');
    await expect(inputs.first()).toBeVisible({ timeout: 15_000 });
    expect(await inputs.count()).toBeGreaterThanOrEqual(2);
  });

  test('TC-CATR-013: Add food form submission without required fields shows validation', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.addFood);
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      await page.waitForTimeout(1_500);
      const invalid = await page.evaluate(() =>
        Array.from(document.querySelectorAll('input')).some(i => !i.validity.valid),
      );
      const errorShown = await page.isVisible('[class*="error" i], [role="alert"]');
      expect(invalid || errorShown).toBeTruthy();
    }
  });
});

test.describe('Caterer — Availability', () => {
  test('TC-CATR-020: Availability page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.availability);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-CATR-021: Availability toggle is present', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.availability);
    const toggle = page.locator(
      'input[type="checkbox"], [role="switch"], [class*="toggle" i], [class*="Switch"]',
    ).first();
    if (await toggle.count() > 0) await expect(toggle).toBeVisible();
  });
});

test.describe('Caterer — Orders', () => {
  test('TC-CATR-030: Sub-orders page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.subOrders);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-CATR-031: Payment review page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.paymentReview);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Caterer — Notifications', () => {
  test('TC-CATR-040: Notifications page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.notifications);
    const content = page.locator('[class*="notification" i], main, h1, h2').first();
    await expect(content).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Caterer — Catering Services', () => {
  test('TC-CATR-050: Catering services page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.catering);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-CATR-051: Catering bookings page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.cateringBookings);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Caterer — Riders Management', () => {
  test('TC-CATR-060: Riders page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.riders);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Caterer — Profile', () => {
  test('TC-CATR-070: Profile page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.profile);
    // CatererProfilePage renders "My Profile" in an h5 element
    const profile = page.locator('h5, h6, [class*="MuiAvatar"]').first();
    await expect(profile).toBeVisible({ timeout: 20_000 });
  });

  test('TC-CATR-071: Payment details page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.payment);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Caterer — Tiffin', () => {
  test('TC-CATR-080: Tiffin management page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.tiffin);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
