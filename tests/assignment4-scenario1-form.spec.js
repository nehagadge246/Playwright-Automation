const { test, expect } = require('@playwright/test');
const { gotoWithRetry, clickWithAdRetry } = require('./utils/siteHelpers');

// ══════════════════════════════════════════════════════════
// Assignment 4 | Scenario 1: Form-Based Application
// Site: automationexercise.com/login (Register form)
// Must: 3+ assertions, 1 negative case, validation checks
// ══════════════════════════════════════════════════════════

test.describe('Assignment 4 - Scenario 1: Form-Based Application', () => {

  // ── Positive Case ──────────────────────────────────────
  test('Fill all required fields and submit registration form', async ({ page }) => {
    await gotoWithRetry(page, 'https://automationexercise.com/login');

    // Step 1 — Fill all required fields
    const uniqueEmail = `testuser${Date.now()}@example.com`;
    await page.locator('[data-qa="signup-name"]').fill('Neha Test');
    await page.locator('[data-qa="signup-email"]').fill(uniqueEmail);

    // Step 2 — Submit form
    await clickWithAdRetry(page.locator('[data-qa="signup-button"]'), page);

    // Validate 1 — Moved to account details page
    await expect(page).toHaveURL(/signup/);

    // Validate 2 — Account info heading is visible (fixed: getByRole)
    await expect(page.getByRole('heading', { name: 'Enter Account Information' }))
      .toBeVisible();

    // Validate 3 — Name is pre-filled from signup
    await expect(page.locator('[data-qa="name"]')).toHaveValue('Neha Test');
  });

  // ── Negative Case: Invalid email format ────────────────
  test('Email format validation — invalid email shows error', async ({ page }) => {
    await gotoWithRetry(page, 'https://automationexercise.com/login');

    // Step 1 — Enter invalid email format
    await page.locator('[data-qa="signup-name"]').fill('Neha Test');
    await page.locator('[data-qa="signup-email"]').fill('invalid-email');

    // Step 2 — Submit
    await clickWithAdRetry(page.locator('[data-qa="signup-button"]'), page);

    // Validate 1 — Still on login page (not redirected)
    await expect(page).toHaveURL(/login/);

    // Validate 2 — Email field has browser validation error
    const emailInput = page.locator('[data-qa="signup-email"]');
    const validationMessage = await emailInput.evaluate(el => el.validationMessage);
    expect(validationMessage).not.toBe('');

    // Validate 3 — Email field is still visible
    await expect(emailInput).toBeVisible();
  });

  // ── Negative Case: Already registered email ────────────
  test('Required field validation — existing email shows error', async ({ page }) => {
    await gotoWithRetry(page, 'https://automationexercise.com/login');

    // Step 1 — Use an already registered email
    await page.locator('[data-qa="signup-name"]').fill('Neha Test');
    await page.locator('[data-qa="signup-email"]').fill('test@test.com');

    // Step 2 — Submit
    await clickWithAdRetry(page.locator('[data-qa="signup-button"]'), page);

    // Validate 1 — Error message appears
    await expect(page.locator('p[style*="color: red"]'))
      .toContainText('Email Address already exist!', { timeout: 15000 });

    // Validate 2 — Still on signup page (fixed: was /login, actually goes to /signup)
    await expect(page).toHaveURL(/signup/);

    // Validate 3 — Error is visible
    await expect(page.locator('p[style*="color: red"]')).toBeVisible();
  });

});