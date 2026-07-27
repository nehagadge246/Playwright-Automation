// Page Object: Login (practicetestautomation.com)
// Refactored (Assignment 83): extends BasePage, uses shared retry navigation.
const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('#submit');
    this.successMessage = page.locator('.post-title');
    this.errorMessage = page.locator('#error');
    // Fixed: there is no #logout element on the real page — the
    // "Log out" element is a plain link identified by its visible text.
    this.logoutButton = page.getByRole('link', { name: 'Log out' });
  }

  async goto() {
    await this.gotoWithRetry('https://practicetestautomation.com/practice-test-login/', '#username');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getSuccessMessage() {
    return this.successMessage.textContent();
  }

  async getErrorMessage() {
    return this.errorMessage.textContent();
  }

  async isLogoutVisible() {
    return this.logoutButton.isVisible();
  }
}

module.exports = { LoginPage };