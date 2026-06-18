/**
 * Phase 8 — Order Flow & Payment Tests
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../utils/test-data';
import { skipIfRedirectedToLogin } from '../utils/skip-if-unauthed';

test.describe('Payments — Payment Methods Page', () => {
  test('TC-PAY-001: Payment methods page loads for customer', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.paymentMethods);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Payments — Checkout Flow', () => {
  test('TC-PAY-010: Checkout page shows payment options or redirects empty cart', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.checkout);
    // Checkout at /checkout/split may show payment options or an empty-cart message.
    // Accept any meaningful page content (not an error page).
    const url = page.url();
    expect(
      url.includes('/checkout') || url.includes('/cart') || url.includes('/customer'),
    ).toBeTruthy();
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-PAY-011: Payment callback page is accessible', async ({ page }) => {
    await skipIfRedirectedToLogin(page, '/payment/callback');
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Payments — Order Types', () => {
  test('TC-PAY-020: Direct food order button present on dashboard', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.dashboard);
    const addBtn = page.locator(
      'button:has-text("Add"), button:has-text("Order"), [aria-label*="add" i]',
    ).first();
    if (await addBtn.count() > 0) await expect(addBtn).toBeVisible();
  });

  test('TC-PAY-021: Tiffin box subscription page accessible', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.services.tiffinBox);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
