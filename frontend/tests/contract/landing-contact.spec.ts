import { test, expect } from "@playwright/test"

// ---------------------------------------------------------------------------
// Landing Page Contact Form — Contract Tests
// ---------------------------------------------------------------------------
//
// Tests the AJAX form submission pattern used by the landing page contact form.
// The contact form POSTs JSON to /api/submit/{formId} with redirect: 'manual'
// (on the client side). Here we verify the server behavior with maxRedirects: 0.
//

const PB = "http://127.0.0.1:8090"

test("POST JSON to /api/submit/{formId} with valid form → 302", async ({
  request,
}) => {
  // Create a test user and form for this contract test.
  const email = `ct-landing-${Date.now()}@test.com`
  const password = "Password123!"
  await request.post(`${PB}/api/collections/users/records`, {
    data: { email, password, passwordConfirm: password },
  })
  const loginRes = await request.post(
    `${PB}/api/collections/users/auth-with-password`,
    { data: { identity: email, password } }
  )
  const loginBody = await loginRes.json()
  const token: string = loginBody.token
  const userId: string = loginBody.record.id

  const formRes = await request.post(`${PB}/api/collections/forms/records`, {
    headers: { Authorization: token },
    data: { name: "Landing Contact Test", user: userId },
  })
  const form = await formRes.json()
  const formId: string = form.id

  // Submit a JSON contact form like the landing page does.
  const res = await request.post(`${PB}/api/submit/${formId}`, {
    data: {
      name: "Test User",
      email: "visitor@example.com",
      message: "I want to learn more about your services.",
    },
    maxRedirects: 0,
  })

  // The /api/submit endpoint always responds with 302.
  expect(res.status()).toBe(302)
})

test("POST to /api/submit/{invalidId} → 404", async ({ request }) => {
  const res = await request.post(`${PB}/api/submit/nonexistent000000`, {
    data: {
      name: "Test",
      email: "test@example.com",
      message: "Should fail",
    },
    maxRedirects: 0,
  })
  expect(res.status()).toBe(404)
})
