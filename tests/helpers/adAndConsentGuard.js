// Shared stability helper: automationexercise.com shows a Google ad
// interstitial inside an iframe named aswift_N (N varies) after certain
// navigations, with a 'Close ad' button inside that iframe. It blocks all
// further clicks until dismissed. There is no cookie-consent popup on
// this site (confirmed via codegen recording) - the earlier guess was wrong.

async function closeAdIfPresent(page, timeout = 4000) {
  const adFrames = page.locator('iframe[id^="aswift_"], iframe[name^="aswift_"]');
  const count = await adFrames.count().catch(() => 0);

  for (let i = 0; i < count; i++) {
    try {
      const closeBtn = page
        .frameLocator('iframe[id^="aswift_"], iframe[name^="aswift_"]')
        .nth(i)
        .getByRole('button', { name: 'Close ad' });
      await closeBtn.waitFor({ state: 'visible', timeout });
      await closeBtn.click();
      return;
    } catch {
      // this frame didn't have a closeable ad - try the next one
    }
  }
}

module.exports = { closeAdIfPresent };
