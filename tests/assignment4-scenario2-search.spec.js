const { test, expect } = require('@playwright/test');

// ══════════════════════════════════════════════════════════
// Assignment 4 | Scenario 2: Search Flow
// Site: automationexercise.com/products
// Must: relevant results, no results, partial/exact match
// ══════════════════════════════════════════════════════════

test.describe('Assignment 4 - Scenario 2: Search Flow', () => {

  // ── Positive Case: Exact match search ─────────────────
  test('Search returns relevant results for exact keyword', async ({ page }) => {
    await page.goto('https://automationexercise.com/products', { waitUntil: 'domcontentloaded' });

    // Step 1 — Enter search keyword
    await page.locator('#search_product').fill('Tops');
    await page.locator('#submit_search').click();

    // Validate 1 — URL reflects search
    await expect(page).toHaveURL(/products/);

    // Validate 2 — Search results heading appears
    await expect(page.locator('h2.title')).toContainText('Searched Products');

    // Validate 3 — At least one product result is shown
    const products = page.locator('.productinfo');
    await expect(products.first()).toBeVisible();

    // Validate 4 — Results contain the keyword
    const firstProduct = await products.first().locator('p').textContent();
    expect(firstProduct.toLowerCase()).toContain('top');
  });

  // ── Partial match search ───────────────────────────────
  test('Partial match search returns results', async ({ page }) => {
    await page.goto('https://automationexercise.com/products', { waitUntil: 'domcontentloaded' });

    // Step 1 — Enter partial keyword
    await page.locator('#search_product').fill('jean');
    await page.locator('#submit_search').click();

    // Validate 1 — Results section appears
    await expect(page.locator('h2.title')).toContainText('Searched Products');

    // Validate 2 — Products are listed
    await expect(page.locator('.productinfo').first()).toBeVisible();
  });

  // ── Case sensitivity check ─────────────────────────────
  test('Search is not case sensitive', async ({ page }) => {
    await page.goto('https://automationexercise.com/products', { waitUntil: 'domcontentloaded' });

    // Search with uppercase
    await page.locator('#search_product').fill('TOPS');
    await page.locator('#submit_search').click();

    await expect(page.locator('h2.title')).toContainText('Searched Products');
    const upperResults = await page.locator('.productinfo').count();

    // Search again with lowercase
    await page.locator('#search_product').fill('tops');
    await page.locator('#submit_search').click();

    const lowerResults = await page.locator('.productinfo').count();

    // Validate — same number of results regardless of case
    expect(upperResults).toBe(lowerResults);
  });

  // ── Negative Case: No results scenario ────────────────
  test('No results scenario — invalid keyword shows empty results', async ({ page }) => {
    await page.goto('https://automationexercise.com/products', { waitUntil: 'domcontentloaded' });

    // Step 1 — Enter keyword that returns no results
    await page.locator('#search_product').fill('xyzabc123notexist');
    await page.locator('#submit_search').click();

    // Validate 1 — Still on products page
    await expect(page).toHaveURL(/products/);

    // Validate 2 — Searched Products heading shows
    await expect(page.locator('h2.title')).toContainText('Searched Products');

    // Validate 3 — No products listed
    const count = await page.locator('.productinfo').count();
    expect(count).toBe(0);
  });

});