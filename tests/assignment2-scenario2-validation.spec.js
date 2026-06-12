const { test, expect } = require('@playwright/test');

test.describe('Assignment 2 - Scenario 2: Validation Scenario', () => {

  test('Leave required fields empty, submit and validate error', async ({ page }) => {
    await page.goto('https://demoqa.com/automation-practice-form', { waitUntil: 'domcontentloaded' });
    await page.locator('#submit').scrollIntoViewIfNeeded();
    await page.locator('#submit').click();
    await expect(page.locator('.modal-title')).not.toBeVisible();
    await expect(page.locator('#firstName')).toHaveCSS('border-color', 'rgb(220, 53, 69)');
    await expect(page.locator('#lastName')).toHaveCSS('border-color', 'rgb(220, 53, 69)');
    await expect(page.locator('#userNumber')).toHaveCSS('border-color', 'rgb(220, 53, 69)');
  });

  test('Invalid email format shows validation error', async ({ page }) => {
    await page.goto('https://demoqa.com/automation-practice-form', { waitUntil: 'domcontentloaded' });
    await page.locator('#firstName').fill('John');
    await page.locator('#lastName').fill('Doe');
    await page.locator('#userEmail').fill('invalid-email');
    await page.locator('#userNumber').fill('9876543210');
    await page.locator('label[for="gender-radio-1"]').click();
    await page.locator('#submit').scrollIntoViewIfNeeded();
    await page.locator('#submit').click();
    await expect(page.locator('#userEmail')).toHaveCSS('border-color', 'rgb(220, 53, 69)');
    await expect(page.locator('.modal-title')).not.toBeVisible();
  });

});