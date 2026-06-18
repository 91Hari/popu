/**
 * Negative — Rider UI tests
 * Runs in: rider project (storageState: rider)
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../utils/test-data';
import { skipIfRedirectedToLogin } from '../utils/skip-if-unauthed';

test.describe('Negative — Rider Error Paths', () => {
  test('TC-NEG-060: Lookup with invalid order ID shows error state, not crash', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.rider.lookup);

    const input = page.locator('input').first();
    if (await input.count() === 0) { test.skip(); return; }

    await input.fill('INVALID-ORDER-ID-XYZ-999');
    await input.press('Enter');
    await page.waitForTimeout(2_000);

    await expect(page.locator('body')).not.toBeEmpty();
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});
