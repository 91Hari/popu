import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Load .env.test if it exists (credentials / URLs for local runs).
// In CI, set these as environment variables directly.
try {
  const raw = fs.readFileSync(path.join(__dirname, '.env.test'), 'utf-8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([^#=\s][^=]*?)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  }
} catch { /* .env.test not present — fall back to process.env / defaults below */ }

// ── URLs ────────────────────────────────────────────────────────────────────
// BASE_URL  : the deployed frontend (Vercel). Vercel Deployment Protection must
//             be disabled for the target URL, or use your production domain.
// API_URL   : the deployed backend (Render).
// Set these in .env.test or export them before running npx playwright test.
export const BASE_URL = process.env.BASE_URL || 'https://popu-git-haridev-91haris-projects.vercel.app';
export const API_URL  = process.env.API_URL  || 'https://popu-backend.onrender.com';

const AUTH = (role: string) =>
  path.join(__dirname, `tests/utils/.auth/${role}.json`);

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  timeout: 60_000,
  expect: { timeout: 15_000 },

  reporter: [
    ['html', { outputFolder: 'playwright-report/html', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],

  use: {
    baseURL: BASE_URL,
    trace:             'retain-on-failure',
    screenshot:        'only-on-failure',
    video:             'retain-on-failure',
    actionTimeout:     20_000,
    navigationTimeout: 30_000,
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 800 },
  },

  projects: [
    // ── Auth state setup (runs first) ──────────────────────────────────────────
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // ── Unauthenticated tests (login page, register, unauthorized redirects) ──
    {
      name: 'auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/auth/login.spec.ts'],
    },

    // ── Customer role ──────────────────────────────────────────────────────────
    {
      name: 'customer',
      use: { ...devices['Desktop Chrome'], storageState: AUTH('customer') },
      dependencies: ['setup'],
      testMatch: [
        '**/customer/**/*.spec.ts',
        '**/payments/**/*.spec.ts',
        '**/notifications/**/*.spec.ts',
        '**/maps/**/*.spec.ts',
        '**/lunchbox/**/*.spec.ts',
        '**/catering/**/*.spec.ts',
      ],
    },

    // ── Caterer role ───────────────────────────────────────────────────────────
    {
      name: 'caterer',
      use: { ...devices['Desktop Chrome'], storageState: AUTH('caterer') },
      dependencies: ['setup'],
      testMatch: ['**/caterer/**/*.spec.ts'],
    },

    // ── Rider role ─────────────────────────────────────────────────────────────
    {
      name: 'rider',
      use: { ...devices['Desktop Chrome'], storageState: AUTH('rider') },
      dependencies: ['setup'],
      testMatch: ['**/rider/**/*.spec.ts'],
    },

    // ── Admin role ─────────────────────────────────────────────────────────────
    {
      name: 'admin',
      use: { ...devices['Desktop Chrome'], storageState: AUTH('admin') },
      dependencies: ['setup'],
      testMatch: ['**/admin/**/*.spec.ts'],
    },

    // ── API / Security / Performance ───────────────────────────────────────────
    {
      name: 'api',
      use: { ...devices['Desktop Chrome'] },
      testMatch: [
        '**/api/**/*.spec.ts',
        '**/security/**/*.spec.ts',
        '**/performance/**/*.spec.ts',
      ],
    },
  ],
});
