const { test, expect } = require('@playwright/test');

test.describe('Assignment 3 - Scenario 2: Edge Cases', () => {

  test('Button enabled only after delay - wait for it', async ({ page }) => {
    await page.goto('https://demoqa.com/dynamic-properties', { waitUntil: 'domcontentloaded' });
    const enableAfterBtn = page.locator('#enableAfter');
    await expect(enableAfterBtn).toBeDisabled();
    await expect(enableAfterBtn).toBeEnabled({ timeout: 10000 });
    await enableAfterBtn.click();
  });

  test('Element appears after delay - wait for visibility', async ({ page }) => {
    await page.goto('https://demoqa.com/dynamic-properties', { waitUntil: 'domcontentloaded' });
    const visibleAfterBtn = page.locator('#visibleAfter');
    await expect(visibleAfterBtn).toBeVisible({ timeout: 10000 });
    await visibleAfterBtn.click();
    await expect(visibleAfterBtn).toBeVisible();
  });

  test('Dropdown loads after interaction - select option', async ({ page }) => {
    await page.goto('https://demoqa.com/select-menu', { waitUntil: 'domcontentloaded' });
    await page.locator('#withOptGroup').click();
    await page.locator('#react-select-2-option-0-0').click();
    await expect(page.locator('#withOptGroup')).toBeVisible();
  });

});