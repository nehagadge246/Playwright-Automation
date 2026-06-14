const { test, expect } = require('@playwright/test');

// ══════════════════════════════════════════════════════════
// Assignment 5 | Refactor Real World Scenarios
// Site: automationexercise.com
// Part 1: Replace CSS/XPath with getByRole, getByText, getByLabel
// Part 2: Fix flaky steps, add proper waits & visibility checks
// ══════════════════════════════════════════════════════════

const BASE = 'https://automationexercise.com';

// ══════════════════════════════════════════════════════════
// Part 1: Refactored Locators
// ══════════════════════════════════════════════════════════

test.describe('Assignment 5 - Part 1: Refactored Locators', () => {

  // ── Refactor 1: Login form ─────────────────────────────
  test('Login page — refactored with getByPlaceholder and getByRole', async ({ page }) => {
    await page.goto(`${BASE}/login`,
      { waitUntil: 'domcontentloaded', timeout: 60000 });

    // ❌ Before: page.locator('[data-qa="login-email"]')
    // ✅ After:  getByPlaceholder
    await page.getByPlaceholder('Email Address').nth(0).fill('test@test.com');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Your email or password is incorrect!')).toBeVisible();
  });

  // ── Refactor 2: Signup form ────────────────────────────
  test('Signup form — refactored with getByPlaceholder and getByRole', async ({ page }) => {
    await page.goto(`${BASE}/login`,
      { waitUntil: 'domcontentloaded', timeout: 60000 });

    // ❌ Before: page.locator('[data-qa="signup-name"]')
    // ✅ After:  getByPlaceholder
    await page.getByPlaceholder('Name').fill('Neha Test');
    await page.getByPlaceholder('Email Address').nth(1).fill(`neha${Date.now()}@test.com`);
    await page.getByRole('button', { name: 'Signup' }).click();
    await expect(page).toHaveURL(/signup/);
    await expect(page.getByText('Enter Account Information')).toBeVisible();
  });

  // ── Refactor 3: Search ─────────────────────────────────
  test('Search — refactored with locator ID and getByText', async ({ page }) => {
    await page.goto(`${BASE}/products`,
      { waitUntil: 'domcontentloaded', timeout: 60000 });

    // ❌ Before: loose text selector
    // ✅ After:  specific ID locators to avoid strict mode violation
    await page.locator('#search_product').fill('Tops');
    await page.locator('#submit_search').click();

    // ✅ After: getByText
    await expect(page.getByText('Searched Products')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.productinfo').first()).toBeVisible();
  });

  // ── Refactor 4: Navigation ─────────────────────────────
  test('Navigation — refactored with direct goto and getByText', async ({ page }) => {
    // ❌ Before: clicking nav link from home (blocked by ad overlay)
    // ✅ After:  navigate directly to avoid ad overlay issue
    await page.goto(`${BASE}/products`,
      { waitUntil: 'domcontentloaded', timeout: 60000 });

    // ✅ getByText to validate heading
    await expect(page.getByText('All Products')).toBeVisible();
    await expect(page).toHaveURL(/products/);

    // Navigate to Cart using getByRole
    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page).toHaveURL(/view_cart/);
  });

  // ── Refactor 5: Contact Us form ───────────────────────
  test('Contact Us form — refactored with data-qa and getByPlaceholder', async ({ page }) => {
    await page.goto(`${BASE}/contact_us`,
      { waitUntil: 'domcontentloaded', timeout: 60000 });

    // ❌ Before: generic CSS selector
    // ✅ After:  data-qa for unique fields, getByPlaceholder for others
    await page.getByPlaceholder('Name').fill('Neha');

    // ✅ Fixed: use data-qa to avoid strict mode — 2 email fields on page
    await page.locator('[data-qa="email"]').fill('neha@test.com');

    await page.getByPlaceholder('Subject').fill('Test Subject');
    await page.getByPlaceholder('Your Message Here').fill('This is a test message.');

    // Visibility assertions
    await expect(page.getByPlaceholder('Name')).toBeVisible();
    await expect(page.locator('[data-qa="email"]')).toBeVisible();
  });

});

// ══════════════════════════════════════════════════════════
// Part 2: Improve Stability
// ══════════════════════════════════════════════════════════

test.describe('Assignment 5 - Part 2: Improved Stability', () => {

  // ── Fix 1: Replace hard wait with assertion-based wait ─
  test('Products page — no hard wait, assertion-based visibility', async ({ page }) => {
    await page.goto(`${BASE}/products`,
      { waitUntil: 'domcontentloaded', timeout: 60000 });

    // ❌ Flaky before: await page.waitForTimeout(3000)
    // ✅ Fixed: wait for element to be visible
    await expect(page.locator('.productinfo').first())
      .toBeVisible({ timeout: 10000 });

    await expect(page.getByText('All Products')).toBeVisible();

    const count = await page.locator('.productinfo').count();
    expect(count).toBeGreaterThan(0);
  });

  // ── Fix 2: Flaky cart — wait for modal before closing ──
  test('Add to cart — wait for modal visibility before clicking continue', async ({ page }) => {
    await page.goto(`${BASE}/products`,
      { waitUntil: 'domcontentloaded', timeout: 60000 });

    await page.locator('.productinfo').first().hover();
    await page.locator('.productinfo .add-to-cart').first().click();

    // ❌ Flaky before: immediately clicking continue
    // ✅ Fixed: wait for modal to be visible first
    const modal = page.locator('#cartModal');
    await expect(modal).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Continue Shopping' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue Shopping' }).click();
    await expect(modal).not.toBeVisible();
  });

  // ── Fix 3: Search stability ────────────────────────────
  test('Search — stable with waitFor and visibility assertion', async ({ page }) => {
    await page.goto(`${BASE}/products`,
      { waitUntil: 'domcontentloaded', timeout: 60000 });

    const searchBox = page.locator('#search_product');
    await expect(searchBox).toBeVisible({ timeout: 10000 });
    await searchBox.fill('dress');

    // ❌ Flaky before: getByRole('button', { name: '' }) — matches 2 elements
    // ✅ Fixed: specific ID selector
    await page.locator('#submit_search').click();

    await expect(page.getByText('Searched Products')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.productinfo').first()).toBeVisible({ timeout: 10000 });

    const results = await page.locator('.productinfo').count();
    expect(results).toBeGreaterThan(0);
  });

  // ── Fix 4: Navigation stability ────────────────────────
  test('Navigation — stable with URL and title assertions', async ({ page }) => {
    // ❌ Flaky before: clicking nav from home — blocked by ad overlay
    // ✅ Fixed: navigate directly to products page
    await page.goto(`${BASE}/products`,
      { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.getByText('All Products')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/products/);

    // Navigate directly to product detail — avoids ad overlay
    await page.goto(`${BASE}/product_details/1`,
      { waitUntil: 'domcontentloaded', timeout: 60000 });

    await expect(page).toHaveURL(/product_details/);

    // ✅ Fixed: broader selector for product info section
    await expect(page.locator('.product-information').first())
      .toBeVisible({ timeout: 10000 });

    // Validate back navigation
    await page.goBack();
    await expect(page).toHaveURL(/products/);
  });

});