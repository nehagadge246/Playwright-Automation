const { test, expect } = require('@playwright/test');

test.describe('Task 2: Form Automation', () => {

  test('fill and submit the practice form', async ({ page }) => {
    await page.goto('https://demoqa.com/automation-practice-form');
    await page.locator('#firstName').fill('John');
    await page.locator('#lastName').fill('Doe');
    await page.locator('#userEmail').fill('john@example.com');
    await page.locator('#userNumber').fill('9876543210');
    await page.locator('label[for="gender-radio-1"]').click();
    await page.locator('label[for="hobbies-checkbox-1"]').click();
    await page.locator('#submit').scrollIntoViewIfNeeded();
    await page.locator('#submit').click();
    await expect(page.locator('.modal-title')).toHaveText('Thanks for submitting the form');
    await expect(page.locator('.table-responsive')).toContainText('John Doe');
  });

  test('validate field values before submitting', async ({ page }) => {
    await page.goto('https://demoqa.com/automation-practice-form');
    await page.locator('#firstName').fill('Jane');
    await page.locator('#userEmail').fill('jane@test.com');
    await expect(page.locator('#firstName')).toHaveValue('Jane');
    await expect(page.locator('#userEmail')).toHaveValue('jane@test.com');
  });

});