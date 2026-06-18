/**
 * Tiffin Box / Lunch Box Tests
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../utils/test-data';
import { skipIfRedirectedToLogin } from '../utils/skip-if-unauthed';

test.describe('Tiffin Box — Customer', () => {
  test('TC-TIFF-001: Tiffin Box page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.services.tiffinBox);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-TIFF-002: Tiffin Box page shows content', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.services.tiffinBox);
    const content = page.locator(
      '[class*="MuiCard"], [class*="MuiTypography"], h5, h6',
    ).first();
    await expect(content).toBeVisible({ timeout: 15_000 });
  });

  test('TC-TIFF-003: Tiffin orders history page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.tiffinOrders);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Tiffin Box — Caterer', () => {
  test('TC-TIFF-010: Caterer tiffin management page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.tiffin);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-TIFF-011: Caterer tiffin page shows schedule config or empty state', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.tiffin);
    const config = page.locator(
      '[class*="MuiTypography"], h5, h6',
    ).first();
    await expect(config).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Tiffin Box — Admin', () => {
  test('TC-TIFF-020: Admin tiffin page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.tiffin);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
