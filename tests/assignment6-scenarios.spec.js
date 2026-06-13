const { test, expect } = require('@playwright/test');

test.describe('Assignment 6 - Scenario 1: Alert Handling', () => {

  test('Trigger simple alert and accept it', async ({ page }) => {
    await page.goto('https://demoqa.com/alerts', { waitUntil: 'domcontentloaded' });
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toBe('You clicked a button');
      await dialog.accept();
    });
    await page.locator('#alertButton').click();
    await expect(page.locator('#alertButton')).toBeVisible();
  });

  test('Trigger confirm alert, accept and validate result', async ({ page }) => {
    await page.goto('https://demoqa.com/alerts', { waitUntil: 'domcontentloaded' });
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });
    await page.locator('#confirmButton').click();
    await expect(page.locator('#confirmResult')).toContainText('You selected Ok');
    await expect(page.locator('#confirmResult')).toBeVisible();
  });

  test('Trigger confirm alert, dismiss and validate result', async ({ page }) => {
    await page.goto('https://demoqa.com/alerts', { waitUntil: 'domcontentloaded' });
    page.once('dialog', async dialog => {
      await dialog.dismiss();
    });
    await page.locator('#confirmButton').click();
    await expect(page.locator('#confirmResult')).toContainText('You selected Cancel');
    await expect(page.locator('#confirmResult')).toBeVisible();
  });

  test('Trigger prompt alert, enter text and validate', async ({ page }) => {
    await page.goto('https://demoqa.com/alerts', { waitUntil: 'domcontentloaded' });
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('prompt');
      await dialog.accept('Neha');
    });
    await page.locator('#promtButton').click();
    await expect(page.locator('#promptResult')).toContainText('You entered Neha');
    await expect(page.locator('#promptResult')).toBeVisible();
  });

});

test.describe('Assignment 6 - Scenario 3: Visibility Assertion', () => {

  test('Validate elements are visible on page load', async ({ page }) => {
    await page.goto('https://demoqa.com/dynamic-properties', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#enableAfter')).toBeVisible();
    await expect(page.getByText('Will enable 5 seconds')).toBeVisible();
    await expect(page.locator('#visibleAfter')).not.toBeVisible();
  });

  test('Validate element disabled on load then enabled after delay', async ({ page }) => {
    await page.goto('https://demoqa.com/dynamic-properties', { waitUntil: 'domcontentloaded' });
    const btn = page.locator('#enableAfter');
    await expect(btn).toBeDisabled();
    await expect(btn).toBeEnabled({ timeout: 10000 });
    await btn.click();
    await expect(btn).toBeVisible();
  });

  test('Validate element hidden on load then becomes visible', async ({ page }) => {
    await page.goto('https://demoqa.com/dynamic-properties', { waitUntil: 'domcontentloaded' });
    const btn = page.locator('#visibleAfter');
    await expect(btn).not.toBeVisible();
    await expect(btn).toBeVisible({ timeout: 10000 });
    await expect(btn).toBeEnabled();
  });

  test('Validate all button states on dynamic properties page', async ({ page }) => {
    await page.goto('https://demoqa.com/dynamic-properties', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#enableAfter')).toBeDisabled();
    await expect(page.locator('#visibleAfter')).not.toBeVisible();
    await expect(page.locator('#enableAfter')).toBeEnabled({ timeout: 10000 });
    await expect(page.locator('#visibleAfter')).toBeVisible({ timeout: 10000 });
  });
});
