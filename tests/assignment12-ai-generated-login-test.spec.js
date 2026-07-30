// ASSIGNMENT 12 - AI USAGE TASK - RAW OUTPUT (uncorrected)
// Prompt given: Write Playwright test for login flow with validation
// This is what a quick, ungrounded AI response typically produces -
// plausible-looking, but built on assumed selectors instead of the real
// page. Do NOT run this as-is - see assignment12-ai-improved-login-test.spec.js
// and assignment12-AI-Usage-Governance.md for the corrected version and reasoning.

const { test, expect } = require('@playwright/test');

test('user can login with valid credentials', async ({ page }) => {
  await page.goto('https://automationexercise.com/login');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password123');
  await page.click('#login-btn');
  await page.waitForTimeout(2000);
  await expect(page.locator('.dashboard')).toBeVisible();
});

test('login fails with invalid credentials', async ({ page }) => {
  await page.goto('https://automationexercise.com/login');
  await page.fill('#email', 'wrong@example.com');
  await page.fill('#password', 'wrongpass');
  await page.click('#login-btn');
  await page.waitForTimeout(2000);
  await expect(page.locator('.error')).toBeVisible();
});
