const { test, expect } = require('@playwright/test');

// ══════════════════════════════════════════════════════════
// Assignment 2 | Scenario 1: Complex Form
// Site: demoqa.com/automation-practice-form
// Tasks: Select dropdown, Choose radio, Submit, Validate success
// ══════════════════════════════════════════════════════════

test.describe('Assignment 2 - Scenario 1: Complex Form', () => {

  test('Select dropdown, choose radio, submit and validate success', async ({ page }) => {

    // ── Navigate to form ───────────────────────────────────
    await page.goto(
      'https://demoqa.com/automation-practice-form',
      { waitUntil: 'domcontentloaded' }
    );

    // ── Fill basic text fields ─────────────────────────────
    await page.locator('#firstName').fill('John');
    await page.locator('#lastName').fill('Doe');
    await page.locator('#userEmail').fill('john@example.com');
    await page.locator('#userNumber').fill('9876543210');

    // ── Step 1: Select dropdown (Subjects) ─────────────────
    await page.locator('#subjectsInput').fill('Math');
    await page.locator('.subjects-auto-complete__option').first().click();

    // ── Step 2: Choose radio button (Male) ─────────────────
    await page.locator('label[for="gender-radio-1"]').click();

    // ── Select hobby checkbox ──────────────────────────────
    await page.locator('label[for="hobbies-checkbox-1"]').click();

    // ── Select State and City dropdowns ───────────────────
    await page.locator('#state').click();
    await page.locator('#react-select-3-option-0').click();
    await page.locator('#city').click();
    await page.locator('#react-select-4-option-0').click();

    // ── Step 3: Submit form ────────────────────────────────
    await page.locator('#submit').scrollIntoViewIfNeeded();
    await page.locator('#submit').click();

    // ── Step 4: Validate success ───────────────────────────
    await expect(page.locator('.modal-title'))
      .toHaveText('Thanks for submitting the form');
    await expect(page.locator('.table-responsive'))
      .toContainText('John Doe');
    await expect(page.locator('.table-responsive'))
      .toContainText('john@example.com');
    await expect(page.locator('.table-responsive'))
      .toContainText('Male');
    await expect(page.locator('.table-responsive'))
      .toContainText('Math');
    await expect(page.locator('.table-responsive'))
      .toContainText('Sports');
  });

});