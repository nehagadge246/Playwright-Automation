// BasePage: shared behaviour all page objects inherit.
// Centralizes the retry-on-navigate logic instead of repeating it in every page.
class BasePage {
  constructor(page) {
    this.page = page;
  }

  // demoqa.com's React app can intermittently fail to mount behind a
  // corporate proxy - retry the navigation instead of duplicating this
  // try/catch in every page object.
  async gotoWithRetry(url, readySelector, attempts = 3, backoffMs = 1500) {
    for (let i = 1; i <= attempts; i++) {
      try {
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
        if (readySelector) {
          await this.page.locator(readySelector).waitFor({ state: 'visible', timeout: 10000 });
        }
        return;
      } catch (err) {
        if (i === attempts) throw err;
        await this.page.waitForTimeout(backoffMs * i);
      }
    }
  }
}

module.exports = { BasePage };