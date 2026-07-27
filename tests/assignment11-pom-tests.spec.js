// Assignment 11 - Creating Page Objects and action methods - Part 1
// Assignment: Convert 3 tests -> POM
// Converted: Login (practicetestautomation.com), Practice Form (demoqa.com), Web Tables (demoqa.com)

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { PracticeFormPage } = require('../pages/PracticeFormPage');
const { WebTablesPage } = require('../pages/WebTablesPage');

test.describe('Assignment 11: Tests converted to Page Object Model', () => {
  test('Test 1 - Login succeeds with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('student', 'Password123');

    await expect(page.locator('.post-title')).toHaveText('Logged In Successfully');
    expect(await loginPage.isLogoutVisible()).toBeTruthy();
  });

  test('Test 2 - Practice form submits and shows confirmation', async ({ page }) => {
    const formPage = new PracticeFormPage(page);
    await formPage.goto();
    await formPage.fillBasicDetails({
      firstName: 'Neha',
      lastName: 'Gadge',
      email: 'neha.pom@example.com',
      mobile: '9876543210',
    });
    await formPage.submit();

    await expect
      .poll(async () => formPage.getConfirmationTitle(), { timeout: 10000 })
      .toBe('Thanks for submitting the form');
  });

  test('Test 3 - New record is searchable in web table', async ({ page }) => {
    const tablePage = new WebTablesPage(page);
    await tablePage.goto();
    await tablePage.addRecord({
      firstName: 'Neha',
      lastName: 'Gadge',
      email: 'neha.table@example.com',
      age: '28',
      salary: '50000',
      department: 'QA',
    });
    await tablePage.searchRecord('neha.table@example.com');

    await expect
      .poll(() => tablePage.isEmailVisibleInTable('neha.table@example.com'), { timeout: 10000 })
      .toBeTruthy();
  });
});