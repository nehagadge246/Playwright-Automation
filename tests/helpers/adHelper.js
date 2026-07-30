// ══════════════════════════════════════════════════════════
// Shared helper: dismiss Google Vignette / interstitial ads
// automationexercise.com intermittently shows a full-page Google ad
// overlay. When a click lands on the ad instead of the page underneath,
// Playwright doesn't error — the click "succeeds" but nothing on the
// actual page happens, and the URL sometimes gets a harmless-looking
// "#google_vignette" fragment appended to it. That's what was causing:
//   - toHaveURL(/category_products/) failing with ".../products#google_vignette"
//   - "Searched Products" / cart modal / heading assertions timing out
//   - toHaveTitle() receiving an empty string
// Call closeAdIfPresent(page) after page.goto() and before any click that
// matters, especially ones that trigger navigation or a modal.
// ══════════════════════════════════════════════════════════

async function closeAdIfPresent(page) {
  // Let any ad finish animating in before we look for it.
  await page.waitForTimeout(300);

  const adFrameSelectors = [
    'iframe[id^="google_ads_iframe"]',
    'iframe[name^="google_ads_iframe"]',
    'iframe[src*="googlesyndication"]',
    'iframe[src*="google_vignette"]',
  ];

  for (const sel of adFrameSelectors) {
    const frame = page.locator(sel).first();
    const count = await frame.count().catch(() => 0);
    if (count === 0) continue;

    const visible = await frame.isVisible().catch(() => false);
    if (!visible) continue;

    // Try a visible close/dismiss control first.
    const closeBtn = page
      .locator('[aria-label="Close ad"], .close-button, [id*="dismiss"], [class*="close"]')
      .first();
    const hasCloseBtn = (await closeBtn.count().catch(() => 0)) > 0;

    if (hasCloseBtn) {
      await closeBtn.click({ timeout: 2000 }).catch(() => {});
    } else {
      // Google's vignette overlay honours Escape.
      await page.keyboard.press('Escape').catch(() => {});
    }
    await page.waitForTimeout(300);
  }

  // If the ad already hijacked the URL, strip the fragment and reload the
  // real route instead of leaving the test stuck on the ad state.
  if (page.url().includes('google_vignette')) {
    const cleanUrl = page.url().replace(/#google_vignette.*$/, '');
    await page.goto(cleanUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(300);
  }
}

/**
 * Navigate + wait for the page to actually settle (not just DOM content
 * loaded, which can fire while an ad overlay is still covering everything
 * and before <title> is set) + dismiss any ad that shows up on load.
 */
async function gotoAndSettle(page, url, options = {}) {
  await page.goto(url, { waitUntil: 'load', timeout: 60000, ...options });
  await closeAdIfPresent(page);
}

module.exports = { closeAdIfPresent, gotoAndSettle };