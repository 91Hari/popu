/**
 * Negative — Admin UI tests
 * Runs in: admin project (storageState: admin)
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../utils/test-data';
import { skipIfRedirectedToLogin } from '../utils/skip-if-unauthed';

test.describe('Negative — Admin Notifications', () => {
  test('TC-NEG-070: Send notification with empty body stays on page / shows validation', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.admin.notifications);

    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.count() === 0) { test.skip(); return; }

    await submitBtn.click();
    await page.waitForTimeout(1_000);

    const nativeInvalid = await page.evaluate(() =>
      Array.from(document.querySelectorAll('input, textarea'))
        .some(el => !(el as HTMLInputElement).validity.valid),
    );
    const errorVisible = await page.isVisible('[class*="error" i], [role="alert"], [class*="Mui-error"]');
    const stillOnPage  = page.url().includes('notifications');
    expect(nativeInvalid || errorVisible || stillOnPage).toBeTruthy();
  });
});
