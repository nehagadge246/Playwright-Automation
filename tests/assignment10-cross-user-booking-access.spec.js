// Section 13 - Assignment 2: Cross-User Booking Access Denied
// Site: Restful-Booker API (https://restful-booker.herokuapp.com)
//
// Real, documented behaviour used here: PUT/DELETE /booking/{id} requires a
// valid auth token, sent as a Cookie header (token=<value>), obtained from
// POST /auth. A booking can only be changed by whoever holds that token -
// the "owner". Anyone else - no token, or a forged/invalid token, i.e. a
// different, unauthorized "user" - must be denied with 403 Forbidden.

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://restful-booker.herokuapp.com';
const VALID_CREDS = { username: 'admin', password: 'password123' };

async function getAuthToken(request) {
  const res = await request.post(`${BASE_URL}/auth`, { data: VALID_CREDS });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.token).toBeTruthy();
  return body.token;
}

async function createBooking(request) {
  const res = await request.post(`${BASE_URL}/booking`, {
    data: {
      firstname: 'Neha',
      lastname: 'Gadge',
      totalprice: 150,
      depositpaid: true,
      bookingdates: { checkin: '2026-08-01', checkout: '2026-08-05' },
      additionalneeds: 'Breakfast',
    },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.bookingid).toBeDefined();
  return body.bookingid;
}

test.describe('Assignment 2: Cross-user booking access is denied without a valid token', () => {
  let ownerToken;
  let bookingId;

  test.beforeEach(async ({ request }) => {
    ownerToken = await getAuthToken(request);
    bookingId = await createBooking(request);
  });

  test('unauthenticated user (no token) cannot update the booking', async ({ request }) => {
    const res = await request.put(`${BASE_URL}/booking/${bookingId}`, {
      data: {
        firstname: 'Intruder',
        lastname: 'User',
        totalprice: 1,
        depositpaid: false,
        bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' },
        additionalneeds: 'None',
      },
    });
    expect(res.status()).toBe(403);
  });

  test('unauthenticated user (no token) cannot delete the booking', async ({ request }) => {
    const res = await request.delete(`${BASE_URL}/booking/${bookingId}`);
    expect(res.status()).toBe(403);
  });

  test('user with a forged/invalid token cannot update the booking', async ({ request }) => {
    const res = await request.put(`${BASE_URL}/booking/${bookingId}`, {
      headers: { Cookie: 'token=not-a-real-token' },
      data: {
        firstname: 'Forged',
        lastname: 'Token',
        totalprice: 1,
        depositpaid: false,
        bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' },
        additionalneeds: 'None',
      },
    });
    expect(res.status()).toBe(403);
  });

  test('sanity check: the rightful owner (valid token) CAN update the booking', async ({ request }) => {
    const res = await request.put(`${BASE_URL}/booking/${bookingId}`, {
      headers: { Cookie: `token=${ownerToken}` },
      data: {
        firstname: 'Neha',
        lastname: 'Gadge',
        totalprice: 200,
        depositpaid: true,
        bookingdates: { checkin: '2026-08-01', checkout: '2026-08-06' },
        additionalneeds: 'Late checkout',
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.totalprice).toBe(200);
  });

  test.afterEach(async ({ request }) => {
    // idempotent cleanup with the valid owner token, regardless of what
    // each individual test attempted
    if (bookingId) {
      await request
        .delete(`${BASE_URL}/booking/${bookingId}`, { headers: { Cookie: `token=${ownerToken}` } })
        .catch(() => {});
    }
  });
});