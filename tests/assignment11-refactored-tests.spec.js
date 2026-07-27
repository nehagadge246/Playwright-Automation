// Assignment 11 - Creating Page Objects and action methods - Part 2
// Assignment: Refactor the scripts
//
// What changed from the Part 1 (POM) version:
// 1. LoginPage / PracticeFormPage / WebTablesPage now extend a shared
//    BasePage that owns the retry-on-navigate logic (was duplicated before).
// 2. Tests no longer do "new LoginPage(page)" etc. - fixtures inject
//    loginPage / formPage / tablePage directly, so each test only contains
//    business logic, not setup boilerplate.

const { test, expect } = require('../fixtures/pageFixtures');

test.describe('Assignment 11: Refactored tests using fixtures + shared BasePage', () => {
  test('Test 1 - Login succeeds with valid credentials', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login('student', 'Password123');

    await expect(page.locator('.post-title')).toHaveText('Logged In Successfully');
    expect(await loginPage.isLogoutVisible()).toBeTruthy();
  });

  test('Test 2 - Practice form submits and shows confirmation', async ({ formPage }) => {
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

  test('Test 3 - New record is searchable in web table', async ({ tablePage }) => {
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