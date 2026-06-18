/**
 * Negative — Customer UI tests
 * Runs in: customer project (storageState: customer)
 */
import { test, expect } from '@playwright/test';
import { ENV } from '../utils/env';
import { ROUTES } from '../utils/test-data';
import { skipIfRedirectedToLogin } from '../utils/skip-if-unauthed';

test.describe('Negative — Customer Cart & Checkout', () => {
  test('TC-NEG-040: Empty cart renders a valid page, not an error screen', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.cart);

    const body = await page.locator('body').innerHTML();
    expect(body.trim().length).toBeGreaterThan(100);

    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(1_500);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('TC-NEG-041: Checkout with no cart items shows content, not a crash', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.checkout);

    const body = await page.locator('body').innerHTML();
    expect(body.trim().length).toBeGreaterThan(100);

    const hasErrorPage = await page.isVisible('text=500');
    expect(hasErrorPage).toBeFalsy();
  });

  test('TC-NEG-042: Navigate to invalid food ID does not crash the app', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.dashboard);

    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto(`${ENV.BASE_URL}/food/999999999`, { waitUntil: 'domcontentloaded' });
    try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch { /* ok */ }

    const body = await page.locator('body').innerHTML();
    expect(body.trim().length).toBeGreaterThan(50);

    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

test.describe('Negative — Search Edge Cases', () => {
  test('TC-NEG-050: Empty search query does not crash the page', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.search);

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (await searchInput.count() === 0) { test.skip(); return; }

    await searchInput.fill('');
    await searchInput.press('Enter');
    await page.waitForTimeout(1_500);

    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-NEG-051: Search with special characters does not cause JS error', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.search);

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (await searchInput.count() === 0) { test.skip(); return; }

    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    await searchInput.fill('<script>alert(1)</script>');
    await searchInput.press('Enter');
    await page.waitForTimeout(2_000);

    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});
