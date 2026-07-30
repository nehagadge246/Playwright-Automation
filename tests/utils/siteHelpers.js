// ══════════════════════════════════════════════════════════
// Shared helpers for automationexercise.com flakiness
//
// automationexercise.com is a public practice site that runs real
// Google Ads. Periodically a full-page "Vignette" ad interstitial
// takes over the tab: the URL gets a #google_vignette fragment
// appended, the page title goes blank, and every locator on the
// real page becomes unreachable until the ad is dismissed/skipped.
// That is the root cause behind symptoms like:
//   - toHaveURL() receiving ".../products#google_vignette"
//   - toHaveTitle() receiving ""
//   - a modal/element resolving but stuck "hidden"
//   - a fill()/click() hanging until the 60s test timeout
//
// These helpers wrap goto/click so a stray ad doesn't fail the test.
// ══════════════════════════════════════════════════════════

/**
 * Detect and dismiss the Google Vignette interstitial if it's showing.
 * Safe to call defensively — never throws, never fails a test on its own.
 */
async function closeAdIfPresent(page) {
  try {
    // Vignette redirects add this fragment to the current URL.
    if (page.url().includes('google_vignette')) {
      const cleanUrl = page.url().split('#')[0];
      await page.goto(cleanUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
      return;
    }

    // Some interstitials render as a dismissible top-layer iframe/close (x).
    // Escape closes most ad overlays without affecting the underlying page.
    await page.keyboard.press('Escape').catch(() => {});
  } catch {
    // Never let ad-cleanup itself fail a test.
  }
}

/**
 * page.goto() with retry + automatic ad-dismissal.
 * Use this in place of page.goto() for every navigation to automationexercise.com.
 */
async function gotoWithRetry(page, url, { attempts = 3, timeout = 30000 } = {}) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
      await closeAdIfPresent(page);
      return;
    } catch (err) {
      lastErr = err;
      await page.waitForTimeout(1000 * i);
    }
  }
  throw lastErr;
}

/**
 * Click that recovers once from an ad overlay swallowing the click.
 * Use this for any click that can trigger navigation or open a modal
 * (add-to-cart, category filters, nav links, checkout buttons, etc).
 */
async function clickWithAdRetry(locator, page, options = {}) {
  try {
    await locator.click(options);
  } catch (err) {
    await closeAdIfPresent(page);
    await locator.click(options);
  }
}

module.exports = { closeAdIfPresent, gotoWithRetry, clickWithAdRetry };