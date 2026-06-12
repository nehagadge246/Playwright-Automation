const { test, expect } = require('@playwright/test');

test('Bug 1 - fix the broken locator', async ({ page }) => {
  await page.goto(
    'https://practicetestautomation.com/practice-test-login/',
    { waitUntil: 'domcontentloaded' }
  );
  await page.locator('#username').fill('student');
  await page.locator('#password').fill('Password123');

  // ✅ FIXED: was #submitBtn (did not exist), now #submit
  await page.locator('#submit').click();

  await expect(page).toHaveURL(/logged-in-successfully/);
});

test('Bug 2 - fix the failed assertion', async ({ page }) => {
  await page.goto(
    'https://practicetestautomation.com/practice-test-login/',
    { waitUntil: 'domcontentloaded' }
  );
  await page.locator('#username').fill('student');
  await page.locator('#password').fill('Password123');
  await page.locator('#submit').click();

  // ✅ FIXED: was 'Welcome back, student!' (wrong text), now correct
  await expect(page.locator('h1')).toContainText('Logged In Successfully');
});