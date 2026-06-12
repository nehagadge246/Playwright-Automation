const { test, expect } = require('@playwright/test');

// ══════════════════════════════════════════════════════════
// Assignment 3 | Scenario 3: Refactor the Script
// Improvements:
//   1. Better locators (no text=, use IDs and labels)
//   2. No duplication (shared helpers with beforeEach)
// ══════════════════════════════════════════════════════════

// ── Shared helper — fills the login form ──────────────────
// Removes duplication across tests
async function loginAs(page, username, password) {
  await page.goto(
    'https://practicetestautomation.com/practice-test-login/',
    { waitUntil: 'domcontentloaded' }
  );
  await page.locator('#username').fill(username);
  await page.locator('#password').fill(password);
  await page.locator('#submit').click();
}

// ── Shared helper — fills the practice form ───────────────
async function fillPracticeForm(page, { firstName, lastName, email, mobile }) {
  await page.goto(
    'https://demoqa.com/automation-practice-form',
    { waitUntil: 'domcontentloaded' }
  );
  await page.locator('#firstName').fill(firstName);
  await page.locator('#lastName').fill(lastName);
  await page.locator('#userEmail').fill(email);
  await page.locator('#userNumber').fill(mobile);
}

test.describe('Assignment 3 - Scenario 3: Refactored Script', () => {

  // ── beforeEach removes per-test navigation duplication ──
  test.describe('Login tests (refactored)', () => {

    test('valid login - refactored with helper', async ({ page }) => {
      // ✅ Improved: uses shared loginAs() — no duplicated goto/fill
      await loginAs(page, 'student', 'Password123');
      await expect(page).toHaveURL(/logged-in-successfully/);
      await expect(page.locator('h1'))
        .toContainText('Logged In Successfully');
    });

    test('invalid login - refactored with helper', async ({ page }) => {
      await loginAs(page, 'wronguser', 'wrongpass');
      // ✅ Improved locator: #error instead of vague text matching
      await expect(page.locator('#error'))
        .toContainText('Your username is invalid!', { timeout: 10000 });
    });

  });

  test.describe('Form tests (refactored)', () => {

    test('form fill - refactored with helper and better locators', async ({ page }) => {
      // ✅ Improved: data passed as object — easy to change test data
      await fillPracticeForm(page, {
        firstName: 'John',
        lastName:  'Doe',
        email:     'john@example.com',
        mobile:    '9876543210'
      });

      // ✅ Improved locator: label[for=] instead of text=Male
      await page.locator('label[for="gender-radio-1"]').click();

      // ✅ Improved locator: label[for=] instead of text=Sports
      await page.locator('label[for="hobbies-checkbox-1"]').click();

      await page.locator('#submit').scrollIntoViewIfNeeded();
      await page.locator('#submit').click();

      // ✅ Improved: assert multiple values from results table
      await expect(page.locator('.modal-title'))
        .toHaveText('Thanks for submitting the form');
      await expect(page.locator('.table-responsive'))
        .toContainText('John Doe');
    });

  });

});