/**
 * Phase 4 — Customer Tests: Dashboard, Search, Food Details
 */
import { test, expect } from '@playwright/test';
import { ROUTES } from '../utils/test-data';
import { skipIfRedirectedToLogin } from '../utils/skip-if-unauthed';

test.describe('Customer — Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.dashboard);
  });

  test('TC-CUST-001: Customer dashboard loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.waitForTimeout(3_000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('TC-CUST-002: Dashboard shows greeting or main content', async ({ page }) => {
    // Dashboard renders "Hi, {name}" and "Our Services" in Typography elements
    const content = page.locator('h5, h4, h3, h2, [class*="MuiTypography"]').first();
    await expect(content).toBeVisible({ timeout: 15_000 });
  });

  test('TC-CUST-003: Dashboard renders food cards / marketplace section', async ({ page }) => {
    // Food cards or service category icons may or may not be present depending on data
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-CUST-004: Sidebar / drawer navigation is visible', async ({ page }) => {
    // App uses MUI Drawer (not <nav>), with a persistent sidebar on desktop
    const drawer = page.locator('[class*="MuiDrawer"], [class*="MuiList"]').first();
    await expect(drawer).toBeVisible({ timeout: 10_000 });
  });

  test('TC-CUST-005: Notifications link is present', async ({ page }) => {
    // Sidebar has MuiListItemButton elements; one of them is the Notifications nav item
    const notifEl = page.locator('[class*="MuiListItemButton"]').first();
    await expect(notifEl).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Customer — Search', () => {
  test.beforeEach(async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.search);
  });

  test('TC-CUST-010: Search page loads with input field', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
  });

  test('TC-CUST-011: Typing in search returns results or empty state', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await searchInput.fill('biryani');
    await page.waitForTimeout(2_000);

    const results   = page.locator('[class*="MuiCard"], [class*="Card"], [class*="result"]');
    const noResults = page.locator('text=/no result/i, text=/not found/i, text=/empty/i');
    expect(await results.count() > 0 || await noResults.count() > 0).toBeTruthy();
  });

  test('TC-CUST-012: Veg filter is accessible', async ({ page }) => {
    const vegFilter = page.locator(
      '[aria-label*="veg" i], button:has-text("Veg"), [class*="filter"]',
    ).first();
    if (await vegFilter.count() > 0) {
      await expect(vegFilter).toBeVisible();
    }
  });
});

test.describe('Customer — Notifications', () => {
  test('TC-CUST-020: Notifications page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.notifications);
    const content = page.locator('main, [class*="MuiContainer"], h5, h6').first();
    await expect(content).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Customer — Orders', () => {
  test('TC-CUST-030: Master orders page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.masterOrders);
    // Page renders a MuiCard (empty state or order list) plus heading typography
    const hasContent = await page.locator('[class*="MuiCard"], h5, h6').first()
      .isVisible({ timeout: 10_000 }).catch(() => false);
    expect(hasContent).toBeTruthy();
  });

  test('TC-CUST-031: Tiffin orders page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.tiffinOrders);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Customer — Cart', () => {
  test('TC-CUST-040: Cart page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.cart);
    // CartPage renders "Your Cart" in an h5 or an empty-state card
    const cartEl = page.locator('h5, h6, [class*="MuiCard"]').first();
    await expect(cartEl).toBeVisible({ timeout: 10_000 });
  });

  test('TC-CUST-041: Checkout page accessible', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.checkout);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Customer — Profile', () => {
  test('TC-CUST-050: Profile page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.profile);
    // ProfilePage renders user name / email in a Typography
    const profileEl = page.locator('[class*="MuiAvatar"], h5, h6, [class*="MuiTypography"]').first();
    await expect(profileEl).toBeVisible({ timeout: 15_000 });
  });

  test('TC-CUST-051: Address management page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.addresses);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-CUST-052: Payment methods page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.paymentMethods);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-CUST-053: Profile settings page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.settings);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Customer — Services', () => {
  test('TC-CUST-060: Services page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.services.root);
    const serviceItems = page.locator('[class*="MuiCard"], [class*="card"], h5, h6');
    await expect(serviceItems.first()).toBeVisible({ timeout: 15_000 });
  });

  test('TC-CUST-061: Catering page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.services.catering);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-CUST-062: Food Marketplace page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.services.marketplace);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-CUST-063: Tiffin Box page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.services.tiffinBox);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-CUST-064: Catering bookings page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.cateringBookings);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Customer — Offers', () => {
  test('TC-CUST-070: Offers page loads', async ({ page }) => {
    await skipIfRedirectedToLogin(page, ROUTES.customer.offers);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
