// Refactor (Assignment 83): custom fixtures so tests no longer need to
// write "new LoginPage(page)" etc. in every test - Playwright injects
// ready-to-use page objects automatically.
const base = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { PracticeFormPage } = require('../pages/PracticeFormPage');
const { WebTablesPage } = require('../pages/WebTablesPage');

exports.test = base.test.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  formPage: async ({ page }, use) => {
    await use(new PracticeFormPage(page));
  },
  tablePage: async ({ page }, use) => {
    await use(new WebTablesPage(page));
  },
});

exports.expect = base.expect;