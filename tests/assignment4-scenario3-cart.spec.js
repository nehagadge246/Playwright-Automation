const { test, expect } = require('@playwright/test');

// ══════════════════════════════════════════════════════════
// Assignment 4 | Scenario 3: Cart / Content Selection Flow
// Site: automationexercise.com
// Must: select item, add to cart, validate count & data
// ══════════════════════════════════════════════════════════

test.describe('Assignment 4 - Scenario 3: Cart Flow', () => {

  // ── Positive Case: Add item to cart ───────────────────
  test('Select item, add to cart and validate cart summary', async ({ page }) => {
    await page.goto('https://automationexercise.com/products', { waitUntil: 'domcontentloaded' });

    // Step 1 — Hover first product to reveal Add to Cart
    await page.locator('.productinfo').first().hover();
    await page.locator('.productinfo .add-to-cart').first().click();

    // Handle modal — click Continue Shopping
    await page.locator('button:has-text("Continue Shopping")').click();

    // Step 2 — Add second product
    await page.locator('.productinfo').nth(1).hover();
    await page.locator('.productinfo .add-to-cart').nth(1).click();
    await page.locator('button:has-text("Continue Shopping")').click();

    // Step 3 — Navigate to cart
    await page.locator('a[href="/view_cart"]').first().click();

    // Validate 1 — Cart page loaded
    await expect(page).toHaveURL(/view_cart/);

    // Validate 2 — Correct number of items in cart
    const cartItems = page.locator('#cart_info_table tbody tr');
    await expect(cartItems).toHaveCount(2);

    // Validate 3 — Cart is not empty
    await expect(page.locator('#cart_info_table')).toBeVisible();

    // Validate 4 — Total price column is visible
    await expect(page.locator('.cart_total_price').first()).toBeVisible();
  });

  // ── Negative Case: Cart empty by default ──────────────
  test('Cart is empty on first visit', async ({ page }) => {
    await page.goto('https://automationexercise.com/view_cart', { waitUntil: 'domcontentloaded' });

    // Validate 1 — Cart page loaded
    await expect(page).toHaveURL(/view_cart/);

    // Validate 2 — Empty cart message shown
    await expect(page.locator('#empty_cart')).toBeVisible();

    // Validate 3 — No items in cart table
    const cartItems = await page.locator('#cart_info_table tbody tr').count();
    expect(cartItems).toBe(0);
  });

});