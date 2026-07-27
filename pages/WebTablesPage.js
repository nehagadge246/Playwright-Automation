// Page Object: Web Tables (demoqa.com)
// Selectors verified via Playwright codegen against the live site.
const { BasePage } = require('./BasePage');

class WebTablesPage extends BasePage {
  constructor(page) {
    super(page);
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.firstName = page.getByRole('textbox', { name: 'First Name' });
    this.lastName = page.getByRole('textbox', { name: 'Last Name' });
    this.email = page.getByRole('textbox', { name: 'name@example.com' });
    this.age = page.getByRole('textbox', { name: 'Age' });
    this.salary = page.getByRole('textbox', { name: 'Salary' });
    this.department = page.getByRole('textbox', { name: 'Department' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.searchBox = page.getByRole('textbox', { name: 'Type to search' });
  }

  async goto() {
    // demoqa embeds Google Ads iframes that float over page controls
    // and can block Playwright's pointer-event checks - block them
    // outright so they never load.
    await this.page.route(/(doubleclick|googlesyndication|googleadservices)/, (route) =>
      route.abort()
    );
    await this.gotoWithRetry('https://demoqa.com/webtables', 'button:has-text("Add")');
  }

  async addRecord({ firstName, lastName, email, age, salary, department }) {
    await this.addButton.click();
    await this.firstName.waitFor({ state: 'visible' });
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.email.fill(email);
    await this.age.fill(age);
    await this.salary.fill(salary);
    await this.department.fill(department);
    await this.submitButton.click();
    // Confirm the record actually saved: the modal's First Name field
    // must disappear once submission succeeds. If it stays visible,
    // submission was blocked (validation error / overlay) and no
    // record was added.
    await this.firstName.waitFor({ state: 'hidden', timeout: 10000 });
  }

  async searchRecord(term) {
    await this.searchBox.fill(term);
  }

  async isEmailVisibleInTable(email) {
    // Text-based, page-wide check - independent of the table's internal
    // DOM structure (class names, row/cell markup), so it won't break if
    // demoqa changes its table library again.
    return this.page.getByText(email).first().isVisible();
  }
}

module.exports = { WebTablesPage };