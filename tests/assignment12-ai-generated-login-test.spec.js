const { test, expect } = require('@playwright/test');

test.describe('Assignment 12 - AI Generated Login Test (Corrected)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://automationexercise.com/login');

    await expect(
      page.getByRole('heading', { name: 'Login to your account' })
    ).toBeVisible();
  });

  test('user can login with valid credentials', async ({ page }) => {
    await page.locator('[data-qa="login-email"]').fill('Neha@246');
    await page.locator('[data-qa="login-password"]').fill('Neha@246');

    await page.locator('[data-qa="login-button"]').click();

    await expect(page.getByText(/Logged in as/i)).toBeVisible({
      timeout: 15000,
    });
  });

  test('login fails with invalid credentials', async ({ page }) => {
    await page.locator('[data-qa="login-email"]').fill('invalid-user@example.com');
    await page.locator('[data-qa="login-password"]').fill('WrongPassword123');

    await page.locator('[data-qa="login-button"]').click();

    const errorMessage = page.locator('form[action="/login"] p');

    await expect(errorMessage).toBeVisible({ timeout: 15000 });
    await expect(errorMessage).toContainText(
      'Your email or password is incorrect!'
    );

    await expect(page).toHaveURL(/login/);
    await expect(page.getByText(/Logged in as/i)).toHaveCount(0);
  });

});