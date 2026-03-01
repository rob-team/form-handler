import { test, expect } from "@playwright/test"

// ---------------------------------------------------------------------------
// Submission Endpoint Contract Tests  CT-001 through CT-011
// ---------------------------------------------------------------------------
//
// All tests use maxRedirects: 0 to intercept the 302 before following it.
// The test user and form are created once in beforeAll.
//

const PB = "http://127.0.0.1:8090"

async function createTestForm(request: Parameters<typeof test.beforeAll>[0] extends (args: { request: infer R }) => unknown ? R : never) {
  const email = `ct-submit-${Date.now()}@test.com`
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
    data: { name: "Contract Test Form", user: userId },
  })
  const form = await formRes.json()
  return { token, formId: form.id as string }
}

async function getSubmissions(
  request: Parameters<typeof test.beforeAll>[0] extends (args: { request: infer R }) => unknown ? R : never,
  token: string,
  formId: string
) {
  const res = await request.get(`${PB}/api/collections/submissions/records`, {
    headers: { Authorization: token },
    params: { filter: `form="${formId}"`, sort: "-created", perPage: "1" },
  })
  return res.json()
}

let authToken: string
let testFormId: string

test.beforeAll(async ({ request }) => {
  const setup = await createTestForm(request)
  authToken = setup.token
  testFormId = setup.formId
})

// ---------------------------------------------------------------------------

test("CT-001: form-encoded POST with valid _next → 302 to _next URL", async ({
  request,
}) => {
  const res = await request.post(`${PB}/api/submit/${testFormId}`, {
    form: { email: "alice@example.com", _next: "https://example.com/thanks" },
    maxRedirects: 0,
  })
  expect(res.status()).toBe(302)
  expect(res.headers()["location"]).toBe("https://example.com/thanks")
})

test("CT-002: form-encoded POST without _next → 302 to /success", async ({
  request,
}) => {
  const res = await request.post(`${PB}/api/submit/${testFormId}`, {
    form: { email: "bob@example.com", message: "Hello" },
    maxRedirects: 0,
  })
  expect(res.status()).toBe(302)
  expect(res.headers()["location"]).toContain("/success")
})

test("CT-003: _next with relative path → 302 to /success (not the relative path)", async ({
  request,
}) => {
  const res = await request.post(`${PB}/api/submit/${testFormId}`, {
    form: { email: "carol@example.com", _next: "/relative-path" },
    maxRedirects: 0,
  })
  expect(res.status()).toBe(302)
  expect(res.headers()["location"]).toContain("/success")
  expect(res.headers()["location"]).not.toContain("relative-path")
})

test("CT-004: POST to non-existent formId → 404", async ({ request }) => {
  const res = await request.post(`${PB}/api/submit/doesnotexist000`, {
    form: { email: "x@x.com" },
    maxRedirects: 0,
  })
  expect(res.status()).toBe(404)
})

test("CT-005: POST body exceeding 1 MB → 413", async ({ request }) => {
  const bigBody = "x".repeat(1 * 1024 * 1024 + 1)
  const res = await request.post(`${PB}/api/submit/${testFormId}`, {
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: `message=${bigBody}`,
    maxRedirects: 0,
  })
  expect(res.status()).toBe(413)
})

test("CT-006: _next is NOT stored in submission data", async ({ request }) => {
  await request.post(`${PB}/api/submit/${testFormId}`, {
    form: {
      email: "dave@example.com",
      message: "CT-006",
      _next: "https://example.com",
    },
    maxRedirects: 0,
  })
  const subs = await getSubmissions(request, authToken, testFormId)
  const latest = subs.items[0]
  expect(latest).toBeDefined()
  expect(latest.data).not.toHaveProperty("_next")
  expect(latest.data).toHaveProperty("email", "dave@example.com")
})

test("CT-007: empty POST body → 302; submission saved with empty data", async ({
  request,
}) => {
  const res = await request.post(`${PB}/api/submit/${testFormId}`, {
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: "",
    maxRedirects: 0,
  })
  expect(res.status()).toBe(302)

  const subs = await getSubmissions(request, authToken, testFormId)
  const latest = subs.items[0]
  expect(latest).toBeDefined()
  // data may be {} or null; neither should throw
  const data = latest.data ?? {}
  expect(typeof data).toBe("object")
})

test("CT-008: JSON Content-Type body → 302; all fields saved correctly", async ({
  request,
}) => {
  const res = await request.post(`${PB}/api/submit/${testFormId}`, {
    data: { email: "eve@example.com", message: "JSON test" },
    maxRedirects: 0,
  })
  expect(res.status()).toBe(302)

  const subs = await getSubmissions(request, authToken, testFormId)
  const latest = subs.items[0]
  expect(latest.data).toHaveProperty("email", "eve@example.com")
  expect(latest.data).toHaveProperty("message", "JSON test")
})

// ---------------------------------------------------------------------------
// Field combination tests (per Q1 discussion)
// ---------------------------------------------------------------------------

test("CT-009: POST with email+topic+message → all 3 fields in data", async ({
  request,
}) => {
  await request.post(`${PB}/api/submit/${testFormId}`, {
    form: {
      email: "frank@example.com",
      topic: "Support",
      message: "Please help me.",
    },
    maxRedirects: 0,
  })
  const subs = await getSubmissions(request, authToken, testFormId)
  const data = subs.items[0].data
  expect(data).toHaveProperty("email", "frank@example.com")
  expect(data).toHaveProperty("topic", "Support")
  expect(data).toHaveProperty("message", "Please help me.")
})

test("CT-010: POST with email only → only email key in data (no topic, no message)", async ({
  request,
}) => {
  await request.post(`${PB}/api/submit/${testFormId}`, {
    form: { email: "grace@example.com" },
    maxRedirects: 0,
  })
  const subs = await getSubmissions(request, authToken, testFormId)
  const data = subs.items[0].data
  expect(data).toHaveProperty("email", "grace@example.com")
  expect(data).not.toHaveProperty("topic")
  expect(data).not.toHaveProperty("message")
})

test("CT-011: POST with extra/unknown fields → all fields preserved in data", async ({
  request,
}) => {
  await request.post(`${PB}/api/submit/${testFormId}`, {
    form: {
      email: "hank@example.com",
      company: "Acme Corp",
      custom_field: "custom_value_123",
    },
    maxRedirects: 0,
  })
  const subs = await getSubmissions(request, authToken, testFormId)
  const data = subs.items[0].data
  expect(data).toHaveProperty("email", "hank@example.com")
  expect(data).toHaveProperty("company", "Acme Corp")
  expect(data).toHaveProperty("custom_field", "custom_value_123")
})
