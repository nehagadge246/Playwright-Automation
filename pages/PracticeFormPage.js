// Page Object: Practice Form (demoqa.com)
// Refactored (Assignment 83): extends BasePage, uses shared retry navigation.
const { BasePage } = require('./BasePage');

class PracticeFormPage extends BasePage {
  constructor(page) {
    super(page);
    this.firstName = page.locator('#firstName');
    this.lastName = page.locator('#lastName');
    this.email = page.locator('#userEmail');
    this.genderMaleLabel = page.locator("label[for='gender-radio-1']");
    this.mobile = page.locator('#userNumber');
    this.submitButton = page.locator('#submit');
    this.modalTitle = page.locator('#example-modal-sizes-title-lg');
    this.closeModalButton = page.locator('#closeLargeModal');
  }

  async goto() {
    await this.gotoWithRetry('https://demoqa.com/automation-practice-form', '#firstName');
    // demoqa often injects ad banners that push content around
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async fillBasicDetails({ firstName, lastName, email, mobile }) {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.email.fill(email);
    await this.genderMaleLabel.click();
    await this.mobile.fill(mobile);
  }

  async submit() {
    await this.submitButton.click();
  }

  async getConfirmationTitle() {
    return this.modalTitle.textContent();
  }

  async closeModal() {
    await this.closeModalButton.click();
  }
}

module.exports = { PracticeFormPage };