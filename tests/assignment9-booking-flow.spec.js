const { test, expect } = require('@playwright/test');
const { closeAdIfPresent, gotoAndSettle } = require('./helpers/adHelper');

// ══════════════════════════════════════════════════════════
// Assignment 9 | Full Booking Flow + Refund Eligibility
// Site: automationexercise.com
// ══════════════════════════════════════════════════════════

// ── Shared login helper ────────────────────────────────────
async function loginUser(page) {
  await gotoAndSettle(page, 'https://automationexercise.com/login');
  await page.getByPlaceholder('Email Address').nth(0).fill('Neha@246');
  await page.getByPlaceholder('Password').fill('Neha@246');
  await closeAdIfPresent(page);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('a:has-text("Logged in as")')).toBeVisible({ timeout: 15000 });
}

// ── Clear any leftover items from previous runs ─────────────
// Neha@246 is a shared, reused account — its server-side cart persists
// between test runs. Without this, "add 1 item" assertions further down
// can see 2+ items just because a prior run's item was never removed.
// Now that playwright.config.js runs everything on a single worker, this
// is safe to call at the start of any test that depends on cart state.
async function clearCart(page) {
  await gotoAndSettle(page, 'https://automationexercise.com/view_cart');
  const deleteButtons = page.locator('.cart_quantity_delete');
  // Keep clicking the first delete button until the cart reports empty.
  for (let i = 0; i < 10; i++) {
    const remaining = await deleteButtons.count();
    if (remaining === 0) break;
    await deleteButtons.first().click();
    await page.waitForTimeout(500);
  }
}

// ── Shared add to cart helper ──────────────────────────────
async function addToCart(page) {
  await gotoAndSettle(page, 'https://automationexercise.com/products');
  await expect(page.locator('.productinfo').first()).toBeVisible({ timeout: 10000 });
  await closeAdIfPresent(page);
  await page.locator('.productinfo').first().hover();
  await page.locator('.productinfo .add-to-cart').first().click();
  const modal = page.locator('#cartModal');
  await expect(modal).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Continue Shopping' }).click();
  await expect(modal).not.toBeVisible({ timeout: 5000 });
}

// ══════════════════════════════════════════════════════════
// Assignment 9A: Full Booking Flow with Event Creation
// ══════════════════════════════════════════════════════════

test.describe('Assignment 9A - Full Booking Flow with Event Creation', () => {

  const USER = {
    cardName: 'Neha Test',
    card:     '4111111111111111',
    cardCVV:  '123',
  };

  // ── Step 1: Register new user ──────────────────────────
  test('Step 1 — Register new user account', async ({ page }) => {
    await gotoAndSettle(page, 'https://automationexercise.com/login');

    await expect(page.getByText('New User Signup!')).toBeVisible({ timeout: 10000 });

    await page.getByPlaceholder('Name').fill('Neha Test');
    await page.getByPlaceholder('Email Address').nth(1)
      .fill(`neha${Date.now()}@test.com`);
    await closeAdIfPresent(page);
    await page.getByRole('button', { name: 'Signup' }).click();

    await expect(page).toHaveURL(/signup/, { timeout: 15000 });
    await expect(page.getByText('Enter Account Information')).toBeVisible({ timeout: 10000 });

    // Fill account details
    await page.locator('#id_gender1').click();
    await page.locator('#password').fill('Test@1234');
    await page.locator('#days').selectOption('15');
    await page.locator('#months').selectOption('6');
    await page.locator('#years').selectOption('1995');
    await page.locator('#first_name').fill('Neha');
    await page.locator('#last_name').fill('Test');
    await page.locator('#address1').fill('123 Test Street');
    await page.locator('#country').selectOption('India');
    await page.locator('#state').fill('Maharashtra');
    await page.locator('#city').fill('Pune');
    await page.locator('#zipcode').fill('411001');
    await page.locator('#mobile_number').fill('9876543210');
    await closeAdIfPresent(page);
    await page.locator('[data-qa="create-account"]').click();

    // Validate account created
    await expect(page.getByText('Account Created!')).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/account_created/);
    await page.locator('[data-qa="continue-button"]').click();
    await expect(page).toHaveURL('https://automationexercise.com/', { timeout: 15000 });

    console.log('✅ Step 1: User registered successfully');
  });

  // ── Step 2: Login ──────────────────────────────────────
  test('Step 2 — Login with valid credentials', async ({ page }) => {
    await gotoAndSettle(page, 'https://automationexercise.com/login');

    await page.getByPlaceholder('Email Address').nth(0).fill('Neha@246');
    await page.getByPlaceholder('Password').fill('Neha@246');
    await closeAdIfPresent(page);
    await page.getByRole('button', { name: 'Login' }).click();

    // Validate logged in
    await expect(page.locator('a:has-text("Logged in as")')).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL('https://automationexercise.com/');

    console.log('✅ Step 2: Login successful');
  });

  // ── Step 3: Add product to cart ───────────────────────
  test('Step 3 — Browse products and add to cart', async ({ page }) => {
    await loginUser(page);
    await clearCart(page);
    await addToCart(page);

    // Navigate to cart
    await gotoAndSettle(page, 'https://automationexercise.com/view_cart');

    // Validate item in cart
    await expect(page.locator('#cart_info_table')).toBeVisible({ timeout: 10000 });
    const cartItems = await page.locator('#cart_info_table tbody tr').count();
    expect(cartItems).toBeGreaterThan(0);

    console.log(`✅ Step 3: ${cartItems} item(s) added to cart`);
  });

  // ── Step 4: Proceed to checkout ───────────────────────
  test('Step 4 — Proceed to checkout and validate order summary', async ({ page }) => {
    await loginUser(page);
    await clearCart(page);
    await addToCart(page);

    // Go to cart and checkout
    await gotoAndSettle(page, 'https://automationexercise.com/view_cart');
    await closeAdIfPresent(page);
    await page.locator('.btn.btn-default.check_out').click();
    await expect(page).toHaveURL(/checkout/, { timeout: 15000 });

    // Validate checkout page elements
    await expect(page.getByText('Review Your Order')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#cart_info')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#address_delivery')).toBeVisible({ timeout: 10000 });

    console.log('✅ Step 4: Checkout page validated');
  });

  // ── Step 5: Place order ────────────────────────────────
  test('Step 5 — Place order and validate confirmation', async ({ page }) => {
    await loginUser(page);
    await clearCart(page);
    await addToCart(page);

    // Go to cart
    await gotoAndSettle(page, 'https://automationexercise.com/view_cart');
    await closeAdIfPresent(page);
    await page.locator('.btn.btn-default.check_out').click();

    // Add comment and proceed to payment
    await page.locator('textarea[name="message"]').fill('Please deliver between 9am-5pm');
    await closeAdIfPresent(page);
    await page.locator('.btn.btn-default.check_out').click();
    await expect(page).toHaveURL(/payment/, { timeout: 15000 });

    // Fill payment details
    await page.locator('[data-qa="name-on-card"]').fill(USER.cardName);
    await page.locator('[data-qa="card-number"]').fill(USER.card);
    await page.locator('[data-qa="cvc"]').fill(USER.cardCVV);
    await page.locator('[data-qa="expiry-month"]').fill('12');
    await page.locator('[data-qa="expiry-year"]').fill('2026');

    // Confirm order
    await closeAdIfPresent(page);
    await page.locator('[data-qa="pay-button"]').click();

    // Validate order confirmed
    await expect(page.getByText('Order Placed!')).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/payment_done/);

    console.log('✅ Step 5: Order placed and confirmed!');
  });

});

// ══════════════════════════════════════════════════════════
// Assignment 9B: Refund Eligibility Check
// ══════════════════════════════════════════════════════════

test.describe('Assignment 9B - Refund Eligibility Check', () => {

  // ── Refund eligible — remove item from cart ────────────
  test('Refund eligible — item in cart can be removed', async ({ page }) => {
    await loginUser(page);
    await clearCart(page);
    await addToCart(page);

    // Go to cart
    await gotoAndSettle(page, 'https://automationexercise.com/view_cart');

    const cartItems = await page.locator('#cart_info_table tbody tr').count();
    expect(cartItems).toBeGreaterThan(0);

    // Remove item — refund simulation
    await page.locator('.cart_quantity_delete').first().click();

    // Validate cart empty after removal
    await expect(page.locator('#empty_cart')).toBeVisible({ timeout: 15000 });

    console.log('✅ Refund eligible: Item removed from cart successfully');
  });

  // ── Negative — empty cart not refundable ───────────────
  test('Refund not eligible — empty cart has nothing to refund', async ({ page }) => {
    await gotoAndSettle(page, 'https://automationexercise.com/view_cart');

    // Validate cart is empty
    await expect(page.locator('#empty_cart')).toBeVisible({ timeout: 10000 });

    // Checkout button should not exist
    const checkoutBtn = page.locator('.btn.btn-default.check_out');
    const isVisible = await checkoutBtn.isVisible();
    expect(isVisible).toBeFalsy();

    console.log('✅ Refund not eligible: Cart is empty');
  });

  // ── Refund partial — quantity check ───────────────────
  test('Refund partial — reduce quantity before checkout', async ({ page }) => {
    await loginUser(page);
    await clearCart(page);

    // Go to product detail
    await gotoAndSettle(page, 'https://automationexercise.com/product_details/1');

    // Set quantity to 2
    await page.locator('#quantity').clear();
    await page.locator('#quantity').fill('2');
    await closeAdIfPresent(page);
    await page.locator('.cart').click();

    // Wait for modal
    const modal = page.locator('#cartModal');
    await expect(modal).toBeVisible({ timeout: 15000 });

    // ❌ Was: clicking the modal's "View Cart" link. The page has TWO
    // elements with that accessible name (one in the modal, one in the
    // nav bar), so getByRole('link', { name: 'View Cart' }) was ambiguous.
    // Depending on which one actually got clicked, the URL could change to
    // /view_cart before the add-to-cart action had finished committing —
    // landing on an empty cart and hanging on the quantity locator.
    // ✅ Fixed: close the modal the same deterministic way every other
    // test in this file does, then navigate directly.
    await page.getByRole('button', { name: 'Continue Shopping' }).click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });
    await gotoAndSettle(page, 'https://automationexercise.com/view_cart');

    // Validate quantity is 2 — assert the table itself is populated first,
    // so a genuinely empty cart fails fast with a clear message instead of
    // hanging for the full test timeout on the quantity locator.
    await expect(page).toHaveURL(/view_cart/, { timeout: 15000 });
    await expect(page.locator('#cart_info_table')).toBeVisible({ timeout: 15000 });
    const quantity = await page.locator('.cart_quantity button').first().textContent();
    expect(quantity.trim()).toBe('2');

    console.log('✅ Refund partial: Quantity 2 — partial refund eligible');
  });

  // ── Refund request via Contact Us ─────────────────────
  test('Refund request — submit via Contact Us form', async ({ page }) => {
    await gotoAndSettle(page, 'https://automationexercise.com/contact_us');

    await expect(page.getByText('Get In Touch')).toBeVisible({ timeout: 10000 });

    await page.getByPlaceholder('Name').fill('Neha Test');
    await page.locator('[data-qa="email"]').fill('Neha@246');
    await page.getByPlaceholder('Subject').fill('Refund Request - Order #12345');
    await page.getByPlaceholder('Your Message Here')
      .fill('I would like to request a refund for my recent order. Item was damaged.');

    // Accept dialog and submit
    page.once('dialog', async dialog => await dialog.accept());
    await closeAdIfPresent(page);
    await page.locator('[data-qa="submit-button"]').click();

    // Validate submission success
    await expect(page.locator('#contact-page .status.alert.alert-success'))
      .toBeVisible({ timeout: 15000 });

    console.log('✅ Refund request submitted successfully');
  });

});