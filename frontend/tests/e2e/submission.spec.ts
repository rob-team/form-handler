import { test, expect } from "@playwright/test"

const PB = "http://127.0.0.1:8090"
const FRONTEND = "http://localhost:3000"

let testFormId: string
let authToken: string

test.beforeAll(async ({ request }) => {
  const email = `e2e-sub-${Date.now()}@test.com`
  const password = "Password123!"
  await request.post(`${PB}/api/collections/users/records`, {
    data: { email, password, passwordConfirm: password },
  })
  const loginRes = await request.post(
    `${PB}/api/collections/users/auth-with-password`,
    { data: { identity: email, password } }
  )
  const loginBody = await loginRes.json()
  authToken = loginBody.token
  const userId = loginBody.record.id

  const formRes = await request.post(`${PB}/api/collections/forms/records`, {
    headers: { Authorization: authToken },
    data: { name: "E2E Submission Form", user: userId },
  })
  testFormId = (await formRes.json()).id
})

test.afterAll(async ({ request }) => {
  if (testFormId) {
    await request.delete(`${PB}/api/collections/forms/records/${testFormId}`, {
      headers: { Authorization: authToken },
    })
  }
})

// ---------------------------------------------------------------------------
// US3 E2E — Submission handling with redirect logic
// ---------------------------------------------------------------------------

test("Submit with _next → browser lands on _next URL", async ({ page }) => {
  // Use a data URL as the _next target so we don't need a live external server
  const nextUrl = `${FRONTEND}/success?test_marker=from_next`

  await page.goto("about:blank")
  await page.evaluate(
    ([formId, pbUrl, next]) => {
      const f = document.createElement("form")
      f.method = "POST"
      f.action = `${pbUrl}/api/submit/${formId}`

      const email = document.createElement("input")
      email.name = "email"
      email.value = "e2e-user@example.com"
      f.appendChild(email)

      const nextInput = document.createElement("input")
      nextInput.name = "_next"
      nextInput.value = next
      f.appendChild(nextInput)

      document.body.appendChild(f)
      f.submit()
    },
    [testFormId, PB, nextUrl] as const
  )

  await expect(page).toHaveURL(new RegExp("test_marker=from_next"), {
    timeout: 8000,
  })
})

test("Submit without _next → browser lands on /success page", async ({ page }) => {
  await page.goto("about:blank")
  await page.evaluate(
    ([formId, pbUrl]) => {
      const f = document.createElement("form")
      f.method = "POST"
      f.action = `${pbUrl}/api/submit/${formId}`
      const email = document.createElement("input")
      email.name = "email"
      email.value = "no-next@example.com"
      f.appendChild(email)
      document.body.appendChild(f)
      f.submit()
    },
    [testFormId, PB] as const
  )

  await expect(page).toHaveURL(/\/success/, { timeout: 8000 })
  await expect(page.getByText(/submitted|success/i)).toBeVisible()
})

test("Submit with invalid _next (not http/https) → /success page shown", async ({
  page,
}) => {
  await page.goto("about:blank")
  await page.evaluate(
    ([formId, pbUrl]) => {
      const f = document.createElement("form")
      f.method = "POST"
      f.action = `${pbUrl}/api/submit/${formId}`
      const email = document.createElement("input")
      email.name = "email"
      email.value = "invalid-next@example.com"
      f.appendChild(email)
      const nextInput = document.createElement("input")
      nextInput.name = "_next"
      nextInput.value = "javascript:alert(1)"
      f.appendChild(nextInput)
      document.body.appendChild(f)
      f.submit()
    },
    [testFormId, PB] as const
  )

  await expect(page).toHaveURL(/\/success/, { timeout: 8000 })
  // Should NOT have navigated to any javascript: URL
  await expect(page.getByText(/submitted|success/i)).toBeVisible()
})

test("POST to non-existent form → 404 status returned", async ({ request }) => {
  const res = await request.post(`${PB}/api/submit/nonexistent000000`, {
    form: { email: "x@x.com" },
    maxRedirects: 0,
  })
  expect(res.status()).toBe(404)
})
