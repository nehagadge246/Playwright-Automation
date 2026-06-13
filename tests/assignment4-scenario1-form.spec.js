const { test, expect } = require('@playwright/test');

// ══════════════════════════════════════════════════════════
// Assignment 4 | Scenario 1: Form-Based Application
// Site: automationexercise.com/login (Register form)
// Must: 3+ assertions, 1 negative case, validation checks
// ══════════════════════════════════════════════════════════

test.describe('Assignment 4 - Scenario 1: Form-Based Application', () => {

  // ── Positive Case ──────────────────────────────────────
  test('Fill all required fields and submit registration form', async ({ page }) => {
    await page.goto('https://automationexercise.com/login', { waitUntil: 'domcontentloaded' });

    // Step 1 — Fill all required fields
    const uniqueEmail = `testuser${Date.now()}@example.com`;
    await page.locator('[data-qa="signup-name"]').fill('Neha Test');
    await page.locator('[data-qa="signup-email"]').fill(uniqueEmail);

    // Step 2 — Submit form
    await page.locator('[data-qa="signup-button"]').click();

    // Validate 1 — Moved to account details page
    await expect(page).toHaveURL(/signup/);

    // Validate 2 — Account info form is visible
    await expect(page.locator('h2.title')).toContainText('Enter Account Information');

    // Validate 3 — Name is pre-filled from signup
    await expect(page.locator('[data-qa="name"]')).toHaveValue('Neha Test');
  });

  // ── Negative Case: Invalid email format ────────────────
  test('Email format validation — invalid email shows error', async ({ page }) => {
    await page.goto('https://automationexercise.com/login', { waitUntil: 'domcontentloaded' });

    // Step 1 — Enter invalid email format
    await page.locator('[data-qa="signup-name"]').fill('Neha Test');
    await page.locator('[data-qa="signup-email"]').fill('invalid-email');

    // Step 2 — Submit
    await page.locator('[data-qa="signup-button"]').click();

    // Validate 1 — Still on login page (not redirected)
    await expect(page).toHaveURL(/login/);

    // Validate 2 — Email field is invalid (browser validation)
    const emailInput = page.locator('[data-qa="signup-email"]');
    const validationMessage = await emailInput.evaluate(el => el.validationMessage);
    expect(validationMessage).not.toBe('');
  });

  // ── Negative Case: Already registered email ────────────
  test('Required field validation — existing email shows error', async ({ page }) => {
    await page.goto('https://automationexercise.com/login', { waitUntil: 'domcontentloaded' });

    // Step 1 — Use an already registered email
    await page.locator('[data-qa="signup-name"]').fill('Neha Test');
    await page.locator('[data-qa="signup-email"]').fill('test@test.com');

    // Step 2 — Submit
    await page.locator('[data-qa="signup-button"]').click();

    // Validate 1 — Error message appears
    await expect(page.locator('p[style*="color: red"]'))
      .toContainText('Email Address already exist!');

    // Validate 2 — Still on login page
    await expect(page).toHaveURL(/login/);

    // Validate 3 — Error is visible
    await expect(page.locator('p[style*="color: red"]')).toBeVisible();
  });

});