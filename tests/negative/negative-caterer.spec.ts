/**
 * Negative — Caterer UI tests
 * Runs in: caterer project (storageState: caterer)
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../utils/test-data';
import { skipIfRedirectedToLogin } from '../utils/skip-if-unauthed';

test.describe('Negative — Caterer Food Form', () => {
  test('TC-NEG-030: Add food form rejects empty submission', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.addFood);

    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.count() === 0) { test.skip(); return; }

    await submitBtn.click();
    await page.waitForTimeout(1_000);

    const nativeInvalid = await page.evaluate(() =>
      Array.from(document.querySelectorAll('input, textarea'))
        .some(el => !(el as HTMLInputElement).validity.valid),
    );
    const errorVisible = await page.isVisible('[class*="error" i], [role="alert"], [class*="Mui-error"]');
    const stillOnForm  = page.url().includes('add-food');
    expect(nativeInvalid || errorVisible || stillOnForm).toBeTruthy();
  });

  test('TC-NEG-031: Add food with only whitespace name does not submit', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.caterer.addFood);

    const nameInput = page.locator('input[type="text"]').first();
    if (await nameInput.count() === 0) { test.skip(); return; }

    await nameInput.fill('   ');
    await page.waitForTimeout(150);

    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.count() > 0) await submitBtn.click();
    await page.waitForTimeout(1_000);

    const stillOnForm  = page.url().includes('add-food');
    const errorVisible = await page.isVisible('[class*="error" i], [role="alert"], [class*="Mui-error"]');
    expect(stillOnForm || errorVisible).toBeTruthy();
  });
});
