// ASSIGNMENT 12 - AI USAGE TASK - IMPROVED VERSION
// Corrected against the real DOM of automationexercise.com (data-qa
// attributes confirmed via multiple independent sources).

const { test, expect } = require('@playwright/test');
const { closeAdIfPresent } = require('./helpers/adAndConsentGuard');

// If an assertion about page state fails, capture what the page actually
// shows (URL + visible text) and attach it to the thrown error, so the
// failure output is self-explanatory without needing to dig up a
// screenshot or trace afterwards.
async function withPageDiagnostics(page, fn) {
  try {
    await fn();
  } catch (err) {
    const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '(could not read body)');
    err.message =
      `${err.message}\n\n` +
      `--- Page diagnostics ---\n` +
      `URL: ${page.url()}\n` +
      `Visible text (first 800 chars): ${bodyText.slice(0, 800)}`;
    throw err;
  }
}

test.describe('Login flow with validation @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await closeAdIfPresent(page);
    await expect(page.getByText('Login to your account')).toBeVisible();
  });

  test('user can login with valid credentials', async ({ page }) => {
    // ❌ Was: 'your-registered-email@example.com' / 'your-registered-password'
    // — literal placeholder text, not a real account. The site correctly
    // rejects it, so "Logged in as" never appears. Swapped in the real
    // registered test account used elsewhere in this suite.
    await page.locator('[data-qa="login-email"]').fill('Neha@246');
    await page.locator('[data-qa="login-password"]').fill('Neha@246');
    await closeAdIfPresent(page);
    await page.locator('[data-qa="login-button"]').click();
    await closeAdIfPresent(page);

    await withPageDiagnostics(page, () =>
      expect(page.getByText(/Logged in as/i)).toBeVisible({ timeout: 15000 })
    );
  });

  test('login fails with invalid credentials and shows the real error message', async ({ page }) => {
    // ❌ Was: 'wrong@example.com' / 'wrongpass'. Page diagnostics from a
    // failed run showed the site actually logged in ("Logged in as
    // wrong@example.com") — on a shared public demo site, an obvious fake
    // credential like this is exactly the kind of thing someone else
    // (another student, a bot, an earlier test run) ends up registering
    // for real. A timestamped, effectively-unique email can't collide with
    // anything anyone has ever actually signed up with.
    const guaranteedUnregisteredEmail = `no-such-user-${Date.now()}@nonexistent-test-domain.invalid`;

    await page.locator('[data-qa="login-email"]').fill(guaranteedUnregisteredEmail);
    await page.locator('[data-qa="login-password"]').fill('wrongpass');
    await closeAdIfPresent(page);
    await page.locator('[data-qa="login-button"]').click();
    await closeAdIfPresent(page);

    await withPageDiagnostics(page, () =>
      expect(page.getByText('Your email or password is incorrect!')).toBeVisible({ timeout: 15000 })
    );
  });
});