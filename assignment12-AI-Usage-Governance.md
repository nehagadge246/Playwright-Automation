# Assignment 12 - AI Usage + Governance

## Prompt used
Write Playwright test for login flow with validation

## Files
- tests/assignment12-ai-generated-login-test.spec.js - raw output from the prompt above
- tests/assignment12-ai-improved-login-test.spec.js - manually corrected version

## What the AI did right
- Correct overall test structure: test blocks, page.goto, fill then click then assert pattern
- Covered both the positive path and negative path without being asked explicitly for both
- Used sensible, readable test names

## What needed manual correction
1. Guessed selectors instead of verified ones - #email, #password, #login-btn, .dashboard, .error were all plausible but not the real DOM. The actual site uses data-qa=login-email, data-qa=login-password, data-qa=login-button.
2. Hard-coded waitForTimeout(2000) - removed and replaced with expect's built-in auto-retry.
3. Weak assertions - class-name guesses replaced with literal, specific success/error text.
4. No config awareness - now uses relative path with baseURL instead of full hardcoded URL.
5. No placeholder-account guidance - flagged the need for a real registered test account.

## Takeaway
AI is fast at producing a plausible shape for a test, but cannot know a live site's real DOM without being shown it. Every AI-generated selector should be verified against the real page before being trusted.
