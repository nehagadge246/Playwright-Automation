const { test, expect } = require('@playwright/test');

// ══════════════════════════════════════════════════════════
// Assignment 3 | Scenario 2: Edge Case Scenario
// Site: demoqa.com/dynamic-properties + demoqa.com/select-menu
// Tasks: Dropdown loads after delay, button enabled after delay
// ══════════════════════════════════════════════════════════

test.describe('Assignment 3 - Scenario 2: Edge Cases', () => {

  test('Button enabled only after delay - wait for it', async ({ page }) => {

    await page.goto(
      'https://demoqa.com/dynamic-properties',
      { waitUntil: 'domcontentloaded' }
    );

    const enableAfterBtn = page.locator('#enableAfter');

    // Verify button is initially disabled
    await expect(enableAfterBtn).toBeDisabled();

    // Wait for button to become enabled after 5s
    await expect(enableAfterBtn).toBeEnabled({ timeout: 10000 });

    await enableAfterBtn.click();
  });

  test('Element appears after delay - wait for visibility', async ({ page }) => {

    await page.goto(
      'https://demoqa.com/dynamic-properties',
      { waitUntil: 'domcontentloaded' }
    );

    const visibleAfterBtn = page.locator('#visibleAfter');

    // Wait for it to appear after 5s
    await expect(visibleAfterBtn).toBeVisible({ timeout: 10000 });

    await visibleAfterBtn.click();
    await expect(visibleAfterBtn).toBeVisible();
  });

  test('Dropdown loads after interaction - select option', async ({ page }) => {

    await page.goto(
      'https://demoqa.com/select-menu',
      { waitUntil: 'domcontentloaded' }
    );

    // Click the Select Value dropdown
    await page.locator('#withOptGroup').click();

    // Wait for dropdown options to appear
    await expect(page.locator('[class$="-menu"]').first())
      .toBeVisible({ timeout: 8000 });

    // Click the first option available
    await page.locator('[class$="-option"]').first().click();

    // Validate dropdown now has a selected value
    await expect(page.locator('#withOptGroup')).toBeVisible();
  });

});