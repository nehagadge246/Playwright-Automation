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
//
// ⚠️ This is a free, publicly-shared community demo site. It is known to
// occasionally go down or show a blank screen, and it resets its own state
// every 10 minutes. The changes below can't fix the site if it's actually
// down — but they make failures diagnostic instead of a bare 60s timeout,
// and they defend against the two most common non-outage causes: a cookie/
// consent banner intercepting clicks, and the login field's data-testid
// having changed.

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://automationintesting.online';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password';

// ── Dismiss a cookie/consent banner if one is blocking the page ───────────
async function dismissCookieBanner(page) {
  const candidates = [
    page.getByRole('button', { name: /accept/i }),
    page.getByRole('button', { name: /got it/i }),
    page.getByRole('button', { name: /close/i }),
    page.locator('[class*="cookie"] button'),
  ];
  for (const locator of candidates) {
    const count = await locator.count().catch(() => 0);
    if (count > 0 && (await locator.first().isVisible().catch(() => false))) {
      await locator.first().click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(300);
    }
  }
}

// ── Locate the username field even if its data-testid changed ─────────────
// Falls back through a few reasonable alternatives before giving up, so a
// small markup change doesn't produce the same opaque timeout.
function findUsernameField(page) {
  return page
    .getByTestId('username')
    .or(page.locator('#username'))
    .or(page.locator('input[name="username"]'))
    .or(page.getByPlaceholder(/username/i));
}

function findPasswordField(page) {
  return page
    .getByTestId('password')
    .or(page.locator('#password'))
    .or(page.locator('input[name="password"]'))
    .or(page.getByPlaceholder(/password/i));
}

function findSubmitButton(page) {
  return page
    .getByTestId('submit')
    .or(page.getByRole('button', { name: /login|sign in/i }));
}

// ── Quick health check before committing to the full login flow ───────────
// If the site itself is unreachable/broken, fail fast with a clear message
// instead of burning the full test timeout on a login form that will never
// appear.
async function assertSiteIsUp(page) {
  let response;
  try {
    response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  } catch (err) {
    throw new Error(
      `automationintesting.online did not respond within 20s. It may be down. Original error: ${err.message}`
    );
  }
  if (!response || !response.ok()) {
    throw new Error(
      `automationintesting.online responded with status ${response ? response.status() : 'unknown'} — site may be down or unreachable.`
    );
  }
}

async function gotoAdminWithRetry(page, attempts = 3, backoffMs = 2000) {
  await assertSiteIsUp(page);

  let lastError;
  for (let i = 1; i <= attempts; i++) {
    try {
      // ❌ Was: page.goto(`${BASE_URL}/#/admin`) directly. A screenshot from
      // a failed run showed this just renders the homepage — the site's
      // router no longer recognises that hash as a deep link (or never
      // reliably did behind a fresh page load). The "Admin" link IS present
      // in the homepage nav bar though, so click that instead of guessing
      // the URL scheme.
      await page.goto(BASE_URL, { waitUntil: 'load', timeout: 30000 });
      await dismissCookieBanner(page);
      // The page has two links whose accessible name contains "Admin":
      // the nav-bar link (name is exactly "Admin") and a separate
      // "Admin panel" link elsewhere on the page. exact: true picks the
      // nav-bar one and avoids the strict-mode violation.
      await page.getByRole('link', { name: 'Admin', exact: true }).click();
      await findUsernameField(page).first().waitFor({ state: 'visible', timeout: 15000 });
      return;
    } catch (err) {
      lastError = err;
      if (i < attempts) {
        await page.waitForTimeout(backoffMs * i);
      }
    }
  }

  // Every attempt failed — surface the page's actual state so the failure
  // is diagnostic instead of a bare "waiting for locator" timeout.
  const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '(could not read body)');
  throw new Error(
    `Admin login form never appeared after ${attempts} attempts.\n` +
    `Current URL: ${page.url()}\n` +
    `Visible page text (first 500 chars): ${bodyText.slice(0, 500)}\n` +
    `Original error: ${lastError && lastError.message}`
  );
}

async function loginAsAdmin(page) {
  await gotoAdminWithRetry(page);
  await findUsernameField(page).first().fill(ADMIN_USER);
  await findPasswordField(page).first().fill(ADMIN_PASS);
  await findSubmitButton(page).first().click();
  // ❌ Was: getByRole('link', { name: 'Logout' }). The site's admin panel
  // now renders Logout as a <button>, not an <a> — hence "element(s) not
  // found" even though login had actually succeeded (we were already on
  // /admin/rooms with a real Logout button visible in the a11y snapshot).
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible({ timeout: 15000 });
}

// ── Read the unread-message count off the "Messages" nav link ─────────────
// ❌ Was: page.locator('[href*="#/admin/messages"] span'). Two things
// changed on the site: the href is now "/admin/message" (no hash, singular)
// and the count isn't in its own <span> anymore — it's part of the link's
// own accessible name, e.g. "Messages 7" vs plain "Messages" when it's 0.
function messagesLink(page) {
  return page.getByRole('link', { name: /^Messages\b/ });
}

async function getMessageBadgeCount(page) {
  const text = (await messagesLink(page).textContent()) || '';
  const match = text.match(/(\d+)/);
  return match ? match[1] : '0';
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

    await expect.poll(() => getMessageBadgeCount(page), {
      message: 'message badge should reflect mocked count',
      timeout: 15000,
    }).toBe('7');
    await expect(messagesLink(page)).toBeVisible();
  });

  test('badge reflects a mocked zero message count', async ({ page }) => {
    await mockMessageCount(page, 0);
    await loginAsAdmin(page);

    await expect.poll(() => getMessageBadgeCount(page), {
      message: 'message badge should reflect mocked zero count',
      timeout: 15000,
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
    await expect.poll(() => getMessageBadgeCount(page), { timeout: 15000 }).toBe('3');
    expect(interceptCount).toBeGreaterThan(0);
  });

  test.afterEach(async ({ page }) => {
    // idempotency: don't let a mocked route leak into another test run
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });
});