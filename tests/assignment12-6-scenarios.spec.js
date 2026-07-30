// Assignment 12 - Extend previous work (scenarios)
// Site: automationexercise.com (baseURL configured in playwright.config.js)
// Flow verified against the live site.

const { test, expect } = require('@playwright/test');
const { closeAdIfPresent } = require('./helpers/adAndConsentGuard');

test.describe('Assignment 12: Day 4-6 scenarios @regression', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await closeAdIfPresent(page);
    await expect(page.locator('#header')).toContainText('Home');
  });

  test('Search flow - searching returns matching products @smoke', async ({ page }) => {
    await page.getByRole('link', { name: 'Products' }).click();
    await closeAdIfPresent(page);

    await expect(page).toHaveURL(/\/products/);

    await page.locator('#search_product').fill('tshirt');
    await page.locator('#submit_search').click();

    await expect(page.getByText('Searched Products')).toBeVisible();

    const products = page.locator('.features_items .product-image-wrapper');

    await expect(products.first()).toBeVisible({ timeout: 15000 });
    expect(await products.count()).toBeGreaterThan(0);
  });

  test('Cart flow - add product to cart and verify it appears @smoke', async ({ page }) => {
    await page.getByRole('link', { name: 'Products' }).click();
    await closeAdIfPresent(page);

    await expect(page).toHaveURL(/\/products/);

    const firstProduct = page.locator('.product-image-wrapper').first();

    await firstProduct.hover();
    await firstProduct.locator('.product-overlay a.add-to-cart').click();

    await page.getByRole('button', { name: 'Continue Shopping' }).click();

    await closeAdIfPresent(page);

    await page.locator('a[href="/view_cart"]').first().click();

    await expect(page.getByText('Proceed To Checkout')).toBeVisible();
  });

  test('Filtering flow - selecting a category updates the product list', async ({ page }) => {

    await page.goto('/products');
    await closeAdIfPresent(page);

    await expect(page).toHaveURL(/\/products/);

    // Expand Women category
    await page.locator('a[href="#Women"]').click();

    // Wait for submenu
    await expect(page.locator('#Women')).toBeVisible();

    // Select Dress category
    await page.locator('#Women a[href="/category_products/1"]').click();

    await closeAdIfPresent(page);

    // Verify navigation
    await expect(page).toHaveURL(/category_products/);

    // Verify heading
    await expect(page.locator('.title.text-center'))
      .toContainText('Women');

    // Verify products exist
    const products = page.locator('.features_items .product-image-wrapper');

    await expect(products.first()).toBeVisible({
      timeout: 15000
    });

    expect(await products.count()).toBeGreaterThan(0);
  });

});