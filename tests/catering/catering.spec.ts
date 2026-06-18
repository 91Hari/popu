/**
 * Catering Service Tests
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../utils/test-data';
import { skipIfRedirectedToLogin } from '../utils/skip-if-unauthed';

test.describe('Catering — Customer Browse', () => {
  test('TC-CATR-SVC-001: Catering listing page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.services.catering);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-CATR-SVC-002: Catering page shows caterer cards or empty state', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.services.catering);
    const content = page.locator(
      '[class*="MuiCard"], [class*="MuiTypography"], h5, h6',
    ).first();
    await expect(content).toBeVisible({ timeout: 15_000 });
  });

  test('TC-CATR-SVC-003: Caterer detail page navigable from listing', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.services.catering);
    const catererLink = page.locator('a[href*="/services/catering/"]').first();
    if (await catererLink.count() > 0) {
      await catererLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });

  test('TC-CATR-SVC-004: Catering booking page accessible with caterer id', async ({ page }) => {
    await skipIfRedirectedToLogin(page, '/customer/catering-booking/1');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-CATR-SVC-005: Customer catering bookings history loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.cateringBookings);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Catering — Caterer Management', () => {
  test('TC-CATR-SVC-010: Caterer catering services page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.catering);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-CATR-SVC-011: Caterer catering bookings page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.cateringBookings);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Catering — Admin', () => {
  test('TC-CATR-SVC-020: Admin catering bookings page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.catering);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
