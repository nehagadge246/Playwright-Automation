const { test, expect } = require('@playwright/test');
const { gotoWithRetry, clickWithAdRetry } = require('./utils/siteHelpers');

// ══════════════════════════════════════════════════════════
// Assignment 4 | Scenario 2: Search Flow
// Site: automationexercise.com/products
// Must: relevant results, no results, partial/exact match
// ══════════════════════════════════════════════════════════

test.describe('Assignment 4 - Scenario 2: Search Flow', () => {

  // ── Positive Case: Exact match search ─────────────────
  test('Search returns relevant results for exact keyword', async ({ page }) => {
    await gotoWithRetry(page, 'https://automationexercise.com/products');

    // Step 1 — Enter search keyword
    await page.locator('#search_product').fill('Tops');
    await clickWithAdRetry(page.locator('#submit_search'), page);

    // Validate 1 — URL reflects search
    await expect(page).toHaveURL(/products/);

    // Validate 2 — Search results heading appears
    await expect(page.getByText('Searched Products')).toBeVisible({ timeout: 15000 });

    // Validate 3 — At least one product result is shown
    const products = page.locator('.productinfo');
    await expect(products.first()).toBeVisible();

    // Validate 4 — Results contain the keyword
    const firstProduct = await products.first().locator('p').textContent();
    expect(firstProduct.toLowerCase()).toContain('top');
  });

  // ── Partial match search ───────────────────────────────
  test('Partial match search returns results', async ({ page }) => {
    await gotoWithRetry(page, 'https://automationexercise.com/products');

    // Step 1 — Enter partial keyword
    await page.locator('#search_product').fill('jean');
    await clickWithAdRetry(page.locator('#submit_search'), page);

    // Validate 1 — Results section appears
    await expect(page.getByText('Searched Products')).toBeVisible({ timeout: 15000 });

    // Validate 2 — Products are listed
    await expect(page.locator('.productinfo').first()).toBeVisible();
  });

  // ── Case sensitivity check ─────────────────────────────
  test('Search is not case sensitive', async ({ page }) => {
    await gotoWithRetry(page, 'https://automationexercise.com/products');

    // Search with lowercase first
    await page.locator('#search_product').fill('tops');
    await clickWithAdRetry(page.locator('#submit_search'), page);
    await expect(page.getByText('Searched Products')).toBeVisible({ timeout: 15000 });
    const lowerResults = await page.locator('.productinfo').count();

    // Search again with uppercase
    await page.locator('#search_product').fill('TOPS');
    await clickWithAdRetry(page.locator('#submit_search'), page);
    await expect(page.getByText('Searched Products')).toBeVisible({ timeout: 15000 });
    const upperResults = await page.locator('.productinfo').count();

    // Validate — same number of results regardless of case
    expect(upperResults).toBe(lowerResults);
  });

  // ── Negative Case: No results scenario ────────────────
  test('No results scenario — invalid keyword shows empty results', async ({ page }) => {
    await gotoWithRetry(page, 'https://automationexercise.com/products');

    // Step 1 — Enter keyword that returns no results
    await page.locator('#search_product').fill('xyzabc123notexist');
    await clickWithAdRetry(page.locator('#submit_search'), page);

    // Validate 1 — Still on products page
    await expect(page).toHaveURL(/products/);

    // Validate 2 — Searched Products heading shows
    await expect(page.getByText('Searched Products')).toBeVisible({ timeout: 15000 });

    // Validate 3 — No products listed
    const count = await page.locator('.productinfo').count();
    expect(count).toBe(0);
  });

});