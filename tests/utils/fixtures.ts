import { test as base, Page, APIRequestContext } from '@playwright/test';
import path from 'path';
import { ENV } from './env';
import { apiLogin, injectAuthState } from './helpers';

type Role = 'customer' | 'caterer' | 'rider' | 'admin';

interface AuthFixtures {
  customerPage: Page;
  catererPage:  Page;
  riderPage:    Page;
  adminPage:    Page;
  authedRequest: APIRequestContext;
}

async function buildAuthPage(
  base: Page,
  request: APIRequestContext,
  email: string,
  password: string,
  role: Role,
): Promise<Page> {
  const { token, user } = await apiLogin(request, email, password);
  await injectAuthState(base, token, user as Record<string, unknown>);
  return base;
}

export const test = base.extend<AuthFixtures>({
  customerPage: async ({ page, request }, use) => {
    const p = await buildAuthPage(page, request, ENV.CUSTOMER_EMAIL, ENV.CUSTOMER_PASSWORD, 'customer');
    await use(p);
  },

  catererPage: async ({ page, request }, use) => {
    const p = await buildAuthPage(page, request, ENV.CATERER_EMAIL, ENV.CATERER_PASSWORD, 'caterer');
    await use(p);
  },

  riderPage: async ({ page, request }, use) => {
    const p = await buildAuthPage(page, request, ENV.RIDER_EMAIL, ENV.RIDER_PASSWORD, 'rider');
    await use(p);
  },

  adminPage: async ({ page, request }, use) => {
    const p = await buildAuthPage(page, request, ENV.ADMIN_EMAIL, ENV.ADMIN_PASSWORD, 'admin');
    await use(p);
  },

  authedRequest: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({
      baseURL: ENV.API_URL,
    });
    await use(ctx);
    await ctx.dispose();
  },
});

export { expect } from '@playwright/test';
