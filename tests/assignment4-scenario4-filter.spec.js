const { test, expect } = require('@playwright/test');
const { gotoWithRetry, clickWithAdRetry } = require('./utils/siteHelpers');

// ══════════════════════════════════════════════════════════
// Assignment 4 | Scenario 4: Filtering / Listing Page
// Site: automationexercise.com
// Must: apply filters, validate results, multiple filters, reset
// ══════════════════════════════════════════════════════════

test.describe('Assignment 4 - Scenario 4: Filtering / Listing Page', () => {

  // ── Positive Case: Filter by category ─────────────────
  test('Apply category filter and validate results update', async ({ page }) => {
    await gotoWithRetry(page, 'https://automationexercise.com/products');

    // Step 1 — Apply Women category filter
    await clickWithAdRetry(page.locator('a[href="#Women"]'), page);

    // Wait for accordion animation
    await page.waitForTimeout(1000);

    // Wait for submenu to expand
    await expect(page.locator('a[href="/category_products/1"]'))
      .toBeVisible({ timeout: 10000 });
    await clickWithAdRetry(page.locator('a[href="/category_products/1"]'), page);

    // Validate 1 — URL updates to category
    await expect(page).toHaveURL(/category_products/);

    // Validate 2 — Category heading appears
    await expect(page.locator('h2.title')).toBeVisible();

    // Validate 3 — Products are listed
    await expect(page.locator('.productinfo').first()).toBeVisible();
  });

  // ── Multiple filters: Men > Tshirts ───────────────────
  test('Apply multiple filters — Men category then Tshirts', async ({ page }) => {
    await gotoWithRetry(page, 'https://automationexercise.com/products');

    // Step 1 — Click Men category to expand submenu
    await clickWithAdRetry(page.locator('a[href="#Men"]'), page);

    // Wait for accordion animation to complete
    await page.waitForTimeout(1000);

    // Step 2 — Apply Tshirts sub-filter
    await clickWithAdRetry(page.locator('a[href="/category_products/3"]'), page);

    // Validate 1 — URL updated
    await expect(page).toHaveURL(/category_products\/3/);

    // Validate 2 — Results visible
    await expect(page.locator('.productinfo').first()).toBeVisible();

    // Validate 3 — Page title updated
    await expect(page.locator('h2.title')).toContainText('Men');
  });

  // ── Reset filters ──────────────────────────────────────
  test('Reset filters by navigating back to all products', async ({ page }) => {
    await gotoWithRetry(page, 'https://automationexercise.com/products');

    // Apply a filter first
    await clickWithAdRetry(page.locator('a[href="#Women"]'), page);
    await page.waitForTimeout(1000);
    await expect(page.locator('a[href="/category_products/1"]'))
      .toBeVisible({ timeout: 10000 });
    await clickWithAdRetry(page.locator('a[href="/category_products/1"]'), page);
    await expect(page).toHaveURL(/category_products/);

    // Reset — use exact:true to avoid strict mode violation
    await clickWithAdRetry(page.getByRole('link', { name: 'Products', exact: true }), page);

    // Validate 1 — Back to all products page (ad-tolerant: allow trailing
    // query/hash fragments a stray interstitial may append)
    await expect(page).toHaveURL(/\/products/);

    // Validate 2 — All Products heading
    await expect(page.locator('h2.title')).toContainText('All Products');

    // Validate 3 — More products shown than filtered view
    const allCount = await page.locator('.productinfo').count();
    expect(allCount).toBeGreaterThan(3);
  });

});