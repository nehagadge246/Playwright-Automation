const { test, expect } = require('@playwright/test');

// ══════════════════════════════════════════════════════════
// Assignment 4 | Scenario 4: Filtering / Listing Page
// Site: automationexercise.com
// Must: apply filters, validate results, multiple filters, reset
// ══════════════════════════════════════════════════════════

test.describe('Assignment 4 - Scenario 4: Filtering / Listing Page', () => {

  // ── Positive Case: Filter by category ─────────────────
  test('Apply category filter and validate results update', async ({ page }) => {
    await page.goto('https://automationexercise.com/products', { waitUntil: 'domcontentloaded' });

    // Step 1 — Apply Women category filter
    await page.locator('a[href="#Women"]').click();
    await page.locator('a[href="/category_products/1"]').click();

    // Validate 1 — URL updates to category
    await expect(page).toHaveURL(/category_products/);

    // Validate 2 — Category heading appears
    await expect(page.locator('h2.title')).toBeVisible();

    // Validate 3 — Products are listed
    await expect(page.locator('.productinfo').first()).toBeVisible();
  });

  // ── Multiple filters: Men > Tshirts ───────────────────
  test('Apply multiple filters — Men category then Tshirts', async ({ page }) => {
    await page.goto('https://automationexercise.com/products', { waitUntil: 'domcontentloaded' });

    // Step 1 — Apply Men category
    await page.locator('a[href="#Men"]').click();

    // Step 2 — Apply Tshirts sub-filter
    await page.locator('a[href="/category_products/3"]').click();

    // Validate 1 — URL updated
    await expect(page).toHaveURL(/category_products\/3/);

    // Validate 2 — Results visible
    await expect(page.locator('.productinfo').first()).toBeVisible();

    // Validate 3 — Page title updated
    await expect(page.locator('h2.title')).toContainText('Men');
  });

  // ── Reset filters ──────────────────────────────────────
  test('Reset filters by navigating back to all products', async ({ page }) => {
    await page.goto('https://automationexercise.com/products', { waitUntil: 'domcontentloaded' });

    // Apply a filter first
    await page.locator('a[href="#Women"]').click();
    await page.locator('a[href="/category_products/1"]').click();
    await expect(page).toHaveURL(/category_products/);

    // Reset — fixed: use exact:true to avoid strict mode violation
    await page.getByRole('link', { name: 'Products', exact: true }).click();

    // Validate 1 — Back to all products page
    await expect(page).toHaveURL(/\/products$/);

    // Validate 2 — All Products heading
    await expect(page.locator('h2.title')).toContainText('All Products');

    // Validate 3 — More products shown than filtered view
    const allCount = await page.locator('.productinfo').count();
    expect(allCount).toBeGreaterThan(3);
  });

});