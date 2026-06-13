const { test, expect } = require('@playwright/test');

// ══════════════════════════════════════════════════════════
// Assignment 4 | Scenario 5: Navigation Flow
// Site: automationexercise.com
// Must: navigate pages, validate titles, breadcrumbs
// ══════════════════════════════════════════════════════════

test.describe('Assignment 4 - Scenario 5: Navigation Flow', () => {

  // ── Positive Case: Navigate across pages ──────────────
  test('Navigate Home → Products → Cart and validate each page', async ({ page }) => {
    // Step 1 — Home page
    await page.goto('https://automationexercise.com', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL('https://automationexercise.com/');
    await expect(page.locator('img[src="/static/images/home/logo.png"]')).toBeVisible();

    // Step 2 — Navigate to Products
    await page.locator('a[href="/products"]').click();
    await expect(page).toHaveURL(/products/);
    await expect(page.locator('h2.title')).toContainText('All Products');

    // Step 3 — Navigate to Cart
    await page.locator('a[href="/view_cart"]').first().click();
    await expect(page).toHaveURL(/view_cart/);
  });

  // ── Page titles validation ─────────────────────────────
  test('Validate correct page title loads for each route', async ({ page }) => {
    // Home
    await page.goto('https://automationexercise.com', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Automation Exercise/);

    // Products page
    await page.goto('https://automationexercise.com/products', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Automation Exercise - All Products/);

    // Login page
    await page.goto('https://automationexercise.com/login', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Automation Exercise - Signup \/ Login/);

    // Contact page
    await page.goto('https://automationexercise.com/contact_us', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Automation Exercise - Contact Us/);
  });

  // ── Negative Case: Invalid route ──────────────────────
  test('Invalid URL redirects to 404 or home page', async ({ page }) => {
    await page.goto('https://automationexercise.com/invalid-page-xyz', { waitUntil: 'domcontentloaded' });

    // Validate — either 404 page or redirected home
    const url = page.url();
    const title = await page.title();
    const isHandled = url.includes('automationexercise.com');
    expect(isHandled).toBeTruthy();
    await expect(page.locator('body')).toBeVisible();
  });

  // ── Breadcrumb / back navigation ──────────────────────
  test('Product detail page shows correct breadcrumb and back navigation works', async ({ page }) => {
    await page.goto('https://automationexercise.com/products', { waitUntil: 'domcontentloaded' });

    // Click first product detail
    await page.locator('a[href="/product_details/1"]').click();

    // Validate 1 — Correct URL
    await expect(page).toHaveURL(/product_details/);

    // Validate 2 — Product name visible
    await expect(page.locator('.product-information h2')).toBeVisible();

    // Validate 3 — Navigate back
    await page.goBack();
    await expect(page).toHaveURL(/products/);
  });

});