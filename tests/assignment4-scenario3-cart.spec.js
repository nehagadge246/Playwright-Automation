const { test, expect } = require('@playwright/test');
const { gotoWithRetry, clickWithAdRetry } = require('./utils/siteHelpers');

// ══════════════════════════════════════════════════════════
// Assignment 4 | Scenario 3: Cart / Content Selection Flow
// Site: automationexercise.com
// Must: select item, add to cart, validate count & data
// ══════════════════════════════════════════════════════════

test.describe('Assignment 4 - Scenario 3: Cart Flow', () => {

  // ── Positive Case: Add item to cart ───────────────────
  test('Select item, add to cart and validate cart summary', async ({ page }) => {
    await gotoWithRetry(page, 'https://automationexercise.com/products');

    // Step 1 — Hover first product and add to cart
    await page.locator('.productinfo').first().hover();
    await clickWithAdRetry(page.locator('.productinfo .add-to-cart').first(), page);

    // Wait for modal to appear then close it
    const modal = page.locator('#cartModal');
    await expect(modal).toBeVisible({ timeout: 15000 });
    await clickWithAdRetry(page.getByRole('button', { name: 'Continue Shopping' }), page);
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Step 2 — Hover second product and add to cart
    await page.locator('.productinfo').nth(1).hover();
    await clickWithAdRetry(page.locator('.productinfo .add-to-cart').nth(1), page);

    // Wait for modal to appear again then close it
    await expect(modal).toBeVisible({ timeout: 15000 });
    await clickWithAdRetry(page.getByRole('button', { name: 'Continue Shopping' }), page);
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Step 3 — Navigate to cart
    await clickWithAdRetry(page.locator('a[href="/view_cart"]').first(), page);

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
    await gotoWithRetry(page, 'https://automationexercise.com/view_cart');

    // Validate 1 — Cart page loaded
    await expect(page).toHaveURL(/view_cart/);

    // Validate 2 — Empty cart message shown
    await expect(page.locator('#empty_cart')).toBeVisible();

    // Validate 3 — No items in cart table
    const cartItems = await page.locator('#cart_info_table tbody tr').count();
    expect(cartItems).toBe(0);
  });

});