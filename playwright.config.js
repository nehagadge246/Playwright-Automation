// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  // Framework concept: parallel execution
  // ❌ Was: fullyParallel: true, workers: undefined (unbounded locally).
  // Several specs (assignment9-booking-flow, assignment4-scenario3-cart)
  // log into the SAME account or share server-side cart state on a live
  // site. Multiple workers hitting that shared state at once is what
  // caused item counts, "Logged in as", and cart-modal assertions to be
  // flaky/wrong. Running everything on a single worker, serially,
  // eliminates that class of failure entirely.
  fullyParallel: false,
  workers: 1,

  // Framework concept: retry logic (retries flaky failures automatically,
  // same behaviour you already saw as "Retry #1" in your test output)
  retries: process.env.CI ? 2 : 1,

  // Reporting: generates the HTML report viewable via `npx playwright show-report`
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    // Framework concept: baseURL - lets tests use page.goto('/') instead of
    // repeating the full domain everywhere. Existing tests that already
    // call page.goto() with a full https:// URL (demoqa, practicetestautomation,
    // etc.) are unaffected - an absolute URL always overrides baseURL.
    baseURL: 'https://automationexercise.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});