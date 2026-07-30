// ASSIGNMENT 12 - AI USAGE TASK - IMPROVED VERSION
// Corrected against the real DOM of automationexercise.com (data-qa
// attributes confirmed via multiple independent sources).

const { test, expect } = require('@playwright/test');
const { closeAdIfPresent } = require('./helpers/adAndConsentGuard');

test.describe('Login flow with validation @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await closeAdIfPresent(page);
    await expect(page.getByText('Login to your account')).toBeVisible();
  });

  test('user can login with valid credentials', async ({ page }) => {
    await page.locator('[data-qa="login-email"]').fill('your-registered-email@example.com');
    await page.locator('[data-qa="login-password"]').fill('your-registered-password');
    await page.locator('[data-qa="login-button"]').click();
    await closeAdIfPresent(page);

    await expect(page.getByText(/Logged in as/i)).toBeVisible({ timeout: 15000 });
  });

  test('login fails with invalid credentials and shows the real error message', async ({ page }) => {
    await page.locator('[data-qa="login-email"]').fill('wrong@example.com');
    await page.locator('[data-qa="login-password"]').fill('wrongpass');
    await page.locator('[data-qa="login-button"]').click();
    await closeAdIfPresent(page);

    await expect(page.getByText('Your email or password is incorrect!')).toBeVisible({ timeout: 15000 });
  });
});
