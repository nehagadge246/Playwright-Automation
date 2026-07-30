// Assignment 12 - Extend previous work (scenarios)
// Site: automationexercise.com (baseURL configured in playwright.config.js)
// Flow verified via Playwright codegen recording against the live site.
// Tags: run smoke tests with npx playwright test --grep "@smoke"
// or regression tests with npx playwright test --grep "@regression"

const { test, expect } = require('@playwright/test');
const { closeAdIfPresent } = require('./helpers/adAndConsentGuard');

test.describe('Assignment 12: Day 4-6 scenarios @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#header')).toContainText('Home');
  });

  test('Search flow - searching returns matching products @smoke', async ({ page }) => {
    await page.getByRole('listitem').filter({ hasText: 'Products' }).click();
    await closeAdIfPresent(page);
    await expect(page).toHaveURL(/\/products/);

    await page.getByRole('textbox', { name: 'Search Product' }).fill('tshirt');
    await page.locator('#submit_search').click();

    await expect(page.getByText('Searched Products')).toBeVisible();

    const results = page.locator('.product-image-wrapper');
    await expect.poll(async () => results.count(), { timeout: 10000 }).toBeGreaterThan(0);
  });

  test('Cart flow - add product to cart and verify it appears @smoke', async ({ page }) => {
    await page.getByRole('listitem').filter({ hasText: 'Products' }).click();
    await closeAdIfPresent(page);
    await expect(page).toHaveURL(/\/products/);

    await page.locator('.product-image-wrapper').first().hover();
    await page.locator('.product-image-wrapper').first().locator('.product-overlay .btn').click();

    await page.getByRole('button', { name: 'Continue Shopping' }).click();
    await closeAdIfPresent(page);

    // Google injects a fake role=link 'Cart Management' ad-annotation
    // element that collides with the real Cart link by accessible name -
    // target the real one by its href instead.
    await page.locator('a[href="/view_cart"]').first().click();
    await expect(page.getByText('Proceed To Checkout')).toBeVisible();
  });

  test('Filtering flow - selecting a category updates the product list', async ({ page }) => {
    await page.getByRole('listitem').filter({ hasText: 'Products' }).click();
    await closeAdIfPresent(page);
    await expect(page).toHaveURL(/\/products/);

    const firstCategoryLink = page.locator('.choose > .nav > li > a').first();
    await firstCategoryLink.click();

    const results = page.locator('.product-image-wrapper');
    await expect.poll(async () => results.count(), { timeout: 10000 }).toBeGreaterThan(0);
  });
});
