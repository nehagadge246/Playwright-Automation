// Section 13 - Assignment 1: Sandbox Banner Visibility with API Mocking
// Site: Restful-Booker-Platform Admin Panel (https://automationintesting.online)
//
// Real, verifiable behaviour used here: the admin panel fetches the unread
// message count from GET **/message/count and renders it as a live badge
// next to the "Messages" nav link. That badge is exactly the kind of
// "API-driven on-page indicator" a sandbox/environment banner is - it only
// ever shows what the API told it to show. We intercept that call with
// page.route()/route.fulfill() and prove the UI reacts correctly to
// different mocked states, without ever hitting the real backend.

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://automationintesting.online';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password';

// RBP is a React SPA and can intermittently fail to mount behind a
// corporate proxy - same class of issue you hit with demoqa web tables.
async function gotoAdminWithRetry(page, attempts = 3, backoffMs = 1500) {
  for (let i = 1; i <= attempts; i++) {
    try {
      await page.goto(`${BASE_URL}/#/admin`, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('username').waitFor({ state: 'visible', timeout: 10000 });
      return;
    } catch (err) {
      if (i === attempts) throw err;
      await page.waitForTimeout(backoffMs * i);
    }
  }
}

async function loginAsAdmin(page) {
  await gotoAdminWithRetry(page);
  await page.getByTestId('username').fill(ADMIN_USER);
  await page.getByTestId('password').fill(ADMIN_PASS);
  await page.getByTestId('submit').click();
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible({ timeout: 10000 });
}

function mockMessageCount(page, count) {
  return page.route('**/message/count', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count }),
    })
  );
}

test.describe('Assignment 1: Sandbox banner (message badge) visibility via API mocking', () => {
  test('badge reflects a mocked non-zero message count', async ({ page }) => {
    await mockMessageCount(page, 7);
    await loginAsAdmin(page);

    const badge = page.locator('[href*="#/admin/messages"] span');
    await expect.poll(async () => (await badge.textContent())?.trim(), {
      message: 'message badge should reflect mocked count',
      timeout: 10000,
    }).toBe('7');
    await expect(badge).toBeVisible();
  });

  test('badge reflects a mocked zero message count', async ({ page }) => {
    await mockMessageCount(page, 0);
    await loginAsAdmin(page);

    const badge = page.locator('[href*="#/admin/messages"] span');
    await expect.poll(async () => (await badge.textContent())?.trim(), {
      message: 'message badge should reflect mocked zero count',
      timeout: 10000,
    }).toBe('0');
  });

  test('mock intercepts the network call instead of hitting the real API', async ({ page }) => {
    let interceptCount = 0;
    await page.route('**/message/count', (route) => {
      interceptCount++;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 3 }),
      });
    });

    await loginAsAdmin(page);
    const badge = page.locator('[href*="#/admin/messages"] span');
    await expect(badge).toHaveText('3');
    expect(interceptCount).toBeGreaterThan(0);
  });

  test.afterEach(async ({ page }) => {
    // idempotency: don't let a mocked route leak into another test run
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });
});