const { test, expect } = require('@playwright/test');

// ══════════════════════════════════════════════════════════
// Assignment 3 | Scenario 1: Child Window / Popup Handling
// Site: demoqa.com/browser-windows
// Tasks: Click → new window, switch context, validate, return
// ══════════════════════════════════════════════════════════

test.describe('Assignment 3 - Scenario 1: Child Window Handling', () => {

  test('Click opens new window, switch context, validate, return to main', async ({ page, context }) => {

    // ── Navigate to browser windows page ──────────────────
    await page.goto(
      'https://demoqa.com/browser-windows',
      { waitUntil: 'domcontentloaded' }
    );

    // ── Validate main page loaded ──────────────────────────
    await expect(page.locator('h1.text-center'))
      .toHaveText('Browser Windows');

    // ── Step 1: Click button that opens a new window ───────
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('#windowButton').click()
    ]);

    // ── Step 2: Switch context to new window ───────────────
    await newPage.waitForLoadState('domcontentloaded');

    // ── Step 3: Validate something in the new window ───────
    await expect(newPage.locator('#sampleHeading'))
      .toHaveText('This is a sample page');

    // ── Close child window ─────────────────────────────────
    await newPage.close();

    // ── Step 4: Return to main page and validate ───────────
    await expect(page.locator('h1.text-center'))
      .toHaveText('Browser Windows');
    await expect(page).toHaveURL(/browser-windows/);
  });

  test('Click opens new tab, switch context, validate, return to main', async ({ page, context }) => {

    await page.goto(
      'https://demoqa.com/browser-windows',
      { waitUntil: 'domcontentloaded' }
    );

    // ── Step 1: Click button that opens a new tab ──────────
    const [newTab] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('#tabButton').click()
    ]);

    // ── Step 2: Switch context to new tab ─────────────────
    await newTab.waitForLoadState('domcontentloaded');

    // ── Step 3: Validate content in new tab ───────────────
    await expect(newTab.locator('#sampleHeading'))
      .toHaveText('This is a sample page');

    // ── Close new tab ──────────────────────────────────────
    await newTab.close();

    // ── Step 4: Return to main page ────────────────────────
    await expect(page).toHaveURL(/browser-windows/);
    await expect(page.locator('h1.text-center'))
      .toHaveText('Browser Windows');
  });

});