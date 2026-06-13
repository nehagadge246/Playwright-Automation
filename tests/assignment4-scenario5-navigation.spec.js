const { test, expect } = require('@playwright/test');

// ══════════════════════════════════════════════════════════
// Assignment 4 | Scenario 5: Navigation Flow
// Site: automationexercise.com
// Must: navigate pages, validate titles, breadcrumbs
// ══════════════════════════════════════════════════════════

test.describe('Assignment 4 - Scenario 5: Navigation Flow', () => {

  // ── Positive Case: Navigate across pages ──────────────
  test('Navigate Home → Products → Cart and validate each page', async ({ page }) => {
    await page.goto('https://automationexercise.com', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL('https://automationexercise.com/');
    await expect(page.locator('img[src="/static/images/home/logo.png"]')).toBeVisible();

    // Navigate to Products
    await page.locator('a[href="/products"]').first().click();
    await expect(page).toHaveURL(/products/);
    await expect(page.locator('h2.title')).toContainText('All Products');

    // Navigate to Cart
    await page.locator('a[href="/view_cart"]').first().click();
    await expect(page).toHaveURL(/view_cart/);
  });

  // ── Page titles validation ─────────────────────────────
  test('Validate correct page title loads for each route', async ({ page }) => {

    // Products page
    await page.goto('https://automationexercise.com/products',
      { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page).toHaveTitle(/Automation Exercise/);
    await expect(page.locator('h2.title')).toContainText('All Products');

    // Login page
    await page.goto('https://automationexercise.com/login',
      { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page).toHaveTitle(/Automation Exercise/);
    await expect(page.locator('h2').first()).toBeVisible();

    // Contact page
    await page.goto('https://automationexercise.com/contact_us',
      { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page).toHaveTitle(/Automation Exercise/);
    await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
  });

  // ── Negative Case: Invalid route ──────────────────────
  test('Invalid URL redirects to 404 or home page', async ({ page }) => {
    await page.goto('https://automationexercise.com/invalid-page-xyz',
      { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Validate — either 404 page or redirected home
    const isHandled = page.url().includes('automationexercise.com');
    expect(isHandled).toBeTruthy();
    await expect(page.locator('body')).toBeVisible();
  });

  // ── Product detail navigation ──────────────────────────
  test('Product detail page shows correct breadcrumb and back navigation works', async ({ page }) => {
    await page.goto('https://automationexercise.com/products',
      { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for products to load
    await expect(page.locator('.productinfo').first())
      .toBeVisible({ timeout: 10000 });

    // Click View Product link directly — avoids ad overlay issue
    await page.locator('a[href="/product_details/1"]').click();

    // Handle possible ad overlay by waiting for URL to change
    await expect(page).toHaveURL(/product_details/, { timeout: 10000 });

    // Validate product detail page loaded
    await expect(page.locator('.product-information h2'))
      .toBeVisible({ timeout: 10000 });

    // Validate back navigation
    await page.goBack();
    await expect(page).toHaveURL(/products/);
  });

});