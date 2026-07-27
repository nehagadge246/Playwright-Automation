const { test, expect } = require('@playwright/test');

test.describe('Task 1: Login Flow', () => {

  test('valid login shows Logged In page', async ({ page }) => {
    await page.goto(
      'https://practicetestautomation.com/practice-test-login/',
      { waitUntil: 'domcontentloaded' }
    );
    await page.locator('#username').fill('student');
    await page.locator('#password').fill('Password123');
    await page.locator('#submit').click();
    await expect(page).toHaveURL(/logged-in-successfully/);
    await expect(page.locator('h1')).toContainText('Logged In Successfully');
    await expect(page.locator('.post-title')).toBeVisible();
  });

  test('invalid login shows error message', async ({ page }) => {
    await page.goto(
      'https://practicetestautomation.com/practice-test-login/',
      { waitUntil: 'domcontentloaded' }
    );
    await page.locator('#username').fill('wronguser');
    await page.locator('#password').fill('wrongpass');
    await page.locator('#submit').click();
    await expect(page.locator('#error'))
      .toContainText('Your username is invalid!', { timeout: 10000 });
    await expect(page).toHaveURL(/practice-test-login/);
  });

  test('logout works after login', async ({ page }) => {
    await page.goto(
      'https://practicetestautomation.com/practice-test-login/',
      { waitUntil: 'domcontentloaded' }
    );
    await page.locator('#username').fill('student');
    await page.locator('#password').fill('Password123');
    await page.locator('#submit').click();
    await expect(page).toHaveURL(/logged-in-successfully/);

    // Click logout and explicitly wait for the resulting navigation to
    // finish before asserting on the URL. toHaveURL alone can catch the
    // page mid-navigation (transient blank/about:blank state) and time
    // out reading an empty string even though the navigation succeeds
    // moments later. waitForURL blocks until navigation actually lands.
    await page.locator('text=Log out').click();
    await page.waitForURL(/practice-test-login/, { timeout: 15000 });
    await expect(page).toHaveURL(/practice-test-login/);
  });

});