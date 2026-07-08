const { test, expect } = require('@playwright/test');

// ══════════════════════════════════════════════════════════
// Assignment 8 | Validate UI Data Against Expected Data
// Site: the-internet.herokuapp.com/tables
// Task 1: Validate table data — name, price, color
// Task 2: Refactor — wait handling, assertions
// ══════════════════════════════════════════════════════════

const URL = 'https://the-internet.herokuapp.com/tables';

// ── Expected data (source of truth) ───────────────────────
const EXPECTED_TABLE_DATA = [
  { lastName: 'Smith',     firstName: 'John',    email: 'jsmith@gmail.com',        due: '$50.00',  webSite: 'http://www.jsmith.com',   action: 'edit delete' },
  { lastName: 'Bach',      firstName: 'Frank',   email: 'fbach@yahoo.com',          due: '$51.00',  webSite: 'http://www.frank.com',    action: 'edit delete' },
  { lastName: 'Doe',       firstName: 'Jason',   email: 'jdoe@hotmail.com',         due: '$100.00', webSite: 'http://www.jdoe.com',     action: 'edit delete' },
  { lastName: 'Conway',    firstName: 'Tim',     email: 'tconway@earthlink.net',    due: '$50.00',  webSite: 'http://www.timconway.com', action: 'edit delete' },
];

// ── Helper: navigate to tables page ───────────────────────
async function gotoTables(page) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await expect(page.locator('#table1')).toBeVisible({ timeout: 15000 });
}

// ── Helper: get all table rows from table1 ─────────────────
async function getTableRows(page) {
  const rows = [];
  const rowLocators = page.locator('#table1 tbody tr');
  const count = await rowLocators.count();

  for (let i = 0; i < count; i++) {
    const cells = rowLocators.nth(i).locator('td');
    const cellCount = await cells.count();
    if (cellCount < 5) continue;

    const [lastName, firstName, email, due, webSite, action] = await Promise.all([
      cells.nth(0).textContent(),
      cells.nth(1).textContent(),
      cells.nth(2).textContent(),
      cells.nth(3).textContent(),
      cells.nth(4).textContent(),
      cells.nth(5).textContent(),
    ]);

    rows.push({
      lastName:  lastName.trim(),
      firstName: firstName.trim(),
      email:     email.trim(),
      due:       due.trim(),
      webSite:   webSite.trim(),
      action:    action.trim().toLowerCase(),
    });
  }
  return rows;
}

// ══════════════════════════════════════════════════════════
// Task 1: Validate UI Data Against Expected Data
// ══════════════════════════════════════════════════════════

test.describe('Assignment 8 - Task 1: UI Data Validation', () => {

  // ── Validate row count ─────────────────────────────────
  test('Validate table row count matches expected', async ({ page }) => {
    await gotoTables(page);

    const rows = await getTableRows(page);

    // Validate row count
    expect(rows.length).toBe(EXPECTED_TABLE_DATA.length);
    console.log(`✅ Row count validated: ${rows.length} rows`);
  });

  // ── Validate data correctness ──────────────────────────
  test('Validate all table data matches expected values', async ({ page }) => {
    await gotoTables(page);

    const rows = await getTableRows(page);

    // Sort both arrays by lastName for consistent comparison
    const sortedActual   = [...rows].sort((a, b) => a.lastName.localeCompare(b.lastName));
    const sortedExpected = [...EXPECTED_TABLE_DATA].sort((a, b) => a.lastName.localeCompare(b.lastName));

    for (let i = 0; i < sortedExpected.length; i++) {
      const expected = sortedExpected[i];
      const actual   = sortedActual[i];

      expect(actual.lastName).toBe(expected.lastName);
      expect(actual.firstName).toBe(expected.firstName);
      expect(actual.email).toBe(expected.email);
      expect(actual.due).toBe(expected.due);

      console.log(`✅ Row ${i + 1} validated: ${actual.firstName} ${actual.lastName}`);
    }
  });

  // ── Validate specific value match ──────────────────────
  test('Validate specific values — name, due amount, email', async ({ page }) => {
    await gotoTables(page);

    const rows = await getTableRows(page);

    // Validate specific last names exist
    const lastNames = rows.map(r => r.lastName);
    expect(lastNames).toContain('Smith');
    expect(lastNames).toContain('Bach');
    expect(lastNames).toContain('Doe');
    expect(lastNames).toContain('Conway');

    // Validate specific due amounts
    const dues = rows.map(r => r.due);
    expect(dues).toContain('$50.00');
    expect(dues).toContain('$51.00');
    expect(dues).toContain('$100.00');

    // Validate specific emails
    const emails = rows.map(r => r.email);
    expect(emails).toContain('jsmith@gmail.com');
    expect(emails).toContain('jdoe@hotmail.com');

    console.log('✅ Specific value match validated');
  });

  // ── Validate sorting by last name ──────────────────────
  test('Validate table sorts correctly by last name', async ({ page }) => {
    await gotoTables(page);

    // Click Last Name column header to sort
    await page.locator('#table1 th').filter({ hasText: 'Last Name' }).click();
    await page.waitForTimeout(500);

    const rows = await getTableRows(page);
    const lastNames = rows.map(r => r.lastName);

    // Validate sorted order
    const sorted = [...lastNames].sort();
    expect(lastNames).toEqual(sorted);

    console.log('✅ Sort validation passed:', lastNames);
  });

  // ── Negative Case: Validate incorrect data is NOT present
  test('Validate incorrect data is not in table', async ({ page }) => {
    await gotoTables(page);

    const rows = await getTableRows(page);

    const lastNames = rows.map(r => r.lastName);
    const emails    = rows.map(r => r.email);

    // Validate fake data does not exist
    expect(lastNames).not.toContain('FakePerson');
    expect(emails).not.toContain('fake@fake.com');

    // Validate row count is not wrong
    expect(rows.length).not.toBe(0);
    expect(rows.length).not.toBeGreaterThan(10);

    console.log('✅ Negative validation passed');
  });

});

// ══════════════════════════════════════════════════════════
// Task 2: Refactor — improved reliability
// ══════════════════════════════════════════════════════════

test.describe('Assignment 8 - Task 2: Refactored Validation', () => {

  // ── Refactor 1: Improved wait handling ─────────────────
  test('Refactored — assertion-based waits instead of hard waits', async ({ page }) => {
    await gotoTables(page);

    // ❌ Before: await page.waitForTimeout(3000)
    // ✅ After:  assertion-based wait
    await expect(page.locator('#table1 tbody tr').first())
      .toBeVisible({ timeout: 10000 });

    const rows = await getTableRows(page);
    expect(rows.length).toBeGreaterThan(0);
    console.log('✅ Improved wait handling validated');
  });

  // ── Refactor 2: Improved assertions ───────────────────
  test('Refactored — specific assertions with clear error messages', async ({ page }) => {
    await gotoTables(page);

    const rows = await getTableRows(page);

    // ❌ Before: expect(rows[0]).toBeTruthy()
    // ✅ After:  specific field assertions
    expect(rows[0].lastName).toBeTruthy();
    expect(rows[0].firstName).toBeTruthy();
    expect(rows[0].email).toContain('@');
    expect(rows[0].due).toMatch(/^\$\d+\.\d{2}$/);

    // Validate all rows have valid email format
    for (const row of rows) {
      expect(row.email).toContain('@');
      expect(row.due).toMatch(/^\$/);
    }

    // Validate data types
    expect(typeof rows[0].firstName).toBe('string');
    expect(typeof rows[0].due).toBe('string');

    console.log('✅ Improved assertions validated');
  });

  // ── Refactor 3: Validate second table ─────────────────
  test('Refactored — validate table 2 has same structure', async ({ page }) => {
    await gotoTables(page);

    // Validate table 2 also exists and has data
    await expect(page.locator('#table2')).toBeVisible({ timeout: 10000 });

    const table2Rows = page.locator('#table2 tbody tr');
    const count = await table2Rows.count();

    // Validate table 2 has rows
    expect(count).toBeGreaterThan(0);

    // Validate same number of rows as table 1
    const table1Rows = await page.locator('#table1 tbody tr').count();
    expect(count).toBe(table1Rows);

    console.log(`✅ Table 2 validated: ${count} rows`);
  });

});