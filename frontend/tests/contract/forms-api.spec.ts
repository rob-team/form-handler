import { test, expect } from "@playwright/test"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PB = "http://127.0.0.1:8090"

async function registerUser(
  request: Parameters<typeof test>[1] extends (
    args: { request: infer R }
  ) => unknown
    ? R
    : never,
  email: string,
  password: string
) {
  return request.post(`${PB}/api/collections/users/records`, {
    data: { email, password, passwordConfirm: password },
  })
}

async function loginUser(
  request: Parameters<typeof test>[1] extends (
    args: { request: infer R }
  ) => unknown
    ? R
    : never,
  email: string,
  password: string
) {
  return request.post(`${PB}/api/collections/users/auth-with-password`, {
    data: { identity: email, password },
  })
}

// ---------------------------------------------------------------------------
// CT-010 & CT-011 — User Registration
// ---------------------------------------------------------------------------

test.describe("User Registration (CT-010, CT-011)", () => {
  test("CT-010: register with unique email returns 200 and user record", async ({
    request,
  }) => {
    const email = `ct010-${Date.now()}@test.com`
    const res = await registerUser(request, email, "Password123!")
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty("id")
    // PocketBase v0.23+ hides email when emailVisibility is false
    expect(body.verified).toBe(false)
  })

  test("CT-011: register with duplicate email returns 400 with email validation error", async ({
    request,
  }) => {
    const email = `ct011-${Date.now()}@test.com`
    await registerUser(request, email, "Password123!")
    const res2 = await registerUser(request, email, "Password123!")
    expect(res2.status()).toBe(400)
    const body = await res2.json()
    expect(body).toHaveProperty("data.email")
  })
})

// ---------------------------------------------------------------------------
// CT-012 & CT-013 — Authentication
// ---------------------------------------------------------------------------

test.describe("Authentication (CT-012, CT-013)", () => {
  let testEmail: string
  const testPassword = "Password123!"

  test.beforeAll(async ({ request }) => {
    testEmail = `ct012-${Date.now()}@test.com`
    await registerUser(request, testEmail, testPassword)
  })

  test("CT-012: login with valid credentials returns 200 and token", async ({
    request,
  }) => {
    const res = await loginUser(request, testEmail, testPassword)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty("token")
    expect(body).toHaveProperty("record")
    expect(body.record.email).toBe(testEmail)
  })

  test("CT-013: login with wrong password returns 400", async ({ request }) => {
    const res = await loginUser(request, testEmail, "WrongPassword!")
    expect(res.status()).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// CT-014 – CT-019 — Forms CRUD
// ---------------------------------------------------------------------------

test.describe("Forms CRUD (CT-014 to CT-019)", () => {
  let authToken: string
  let userId: string
  let otherToken: string
  const testPassword = "Password123!"

  test.beforeAll(async ({ request }) => {
    // User A
    const email = `ct014-${Date.now()}@test.com`
    await registerUser(request, email, testPassword)
    const loginRes = await loginUser(request, email, testPassword)
    const loginBody = await loginRes.json()
    authToken = loginBody.token
    userId = loginBody.record.id

    // User B (non-owner)
    const emailB = `ct014b-${Date.now()}@test.com`
    await registerUser(request, emailB, testPassword)
    const loginResB = await loginUser(request, emailB, testPassword)
    const loginBodyB = await loginResB.json()
    otherToken = loginBodyB.token
  })

  test("CT-014: authenticated user can create a form", async ({ request }) => {
    const res = await request.post(`${PB}/api/collections/forms/records`, {
      headers: { Authorization: authToken },
      data: { name: "CT-014 Form", user: userId },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty("id")
    expect(body.name).toBe("CT-014 Form")
  })

  test("CT-015: authenticated user only sees their own forms", async ({
    request,
  }) => {
    // Create a form for user A
    await request.post(`${PB}/api/collections/forms/records`, {
      headers: { Authorization: authToken },
      data: { name: "CT-015 Form", user: userId },
    })
    const res = await request.get(`${PB}/api/collections/forms/records`, {
      headers: { Authorization: authToken },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.items.every((f: { user: string }) => f.user === userId)).toBe(true)
  })

  test("CT-016: unauthenticated list returns empty (access rule filters)", async ({ request }) => {
    const res = await request.get(`${PB}/api/collections/forms/records`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.totalItems).toBe(0)
  })

  test("CT-017: owner can update form name", async ({ request }) => {
    const createRes = await request.post(`${PB}/api/collections/forms/records`, {
      headers: { Authorization: authToken },
      data: { name: "CT-017 Original", user: userId },
    })
    const form = await createRes.json()

    const updateRes = await request.patch(
      `${PB}/api/collections/forms/records/${form.id}`,
      {
        headers: { Authorization: authToken },
        data: { name: "CT-017 Renamed" },
      }
    )
    expect(updateRes.status()).toBe(200)
    const updated = await updateRes.json()
    expect(updated.name).toBe("CT-017 Renamed")
    expect(updated.id).toBe(form.id)
  })

  test("CT-018: non-owner cannot update form", async ({ request }) => {
    const createRes = await request.post(`${PB}/api/collections/forms/records`, {
      headers: { Authorization: authToken },
      data: { name: "CT-018 Form", user: userId },
    })
    const form = await createRes.json()

    const updateRes = await request.patch(
      `${PB}/api/collections/forms/records/${form.id}`,
      {
        headers: { Authorization: otherToken },
        data: { name: "Hacked" },
      }
    )
    // PocketBase v0.23+ returns 404 when updateRule hides records from non-owners
    expect([403, 404]).toContain(updateRes.status())
  })

  test("CT-019: owner can delete form", async ({ request }) => {
    const createRes = await request.post(`${PB}/api/collections/forms/records`, {
      headers: { Authorization: authToken },
      data: { name: "CT-019 Form", user: userId },
    })
    const form = await createRes.json()

    const deleteRes = await request.delete(
      `${PB}/api/collections/forms/records/${form.id}`,
      { headers: { Authorization: authToken } }
    )
    expect(deleteRes.status()).toBe(204)
  })
})

// ---------------------------------------------------------------------------
// CT-020 & CT-021 — Submissions list
// ---------------------------------------------------------------------------

test.describe("Submissions List (CT-020, CT-021)", () => {
  let authToken: string
  let userId: string
  let otherToken: string
  let formId: string
  const testPassword = "Password123!"

  test.beforeAll(async ({ request }) => {
    const email = `ct020-${Date.now()}@test.com`
    await registerUser(request, email, testPassword)
    const loginRes = await loginUser(request, email, testPassword)
    const loginBody = await loginRes.json()
    authToken = loginBody.token
    userId = loginBody.record.id

    const emailB = `ct020b-${Date.now()}@test.com`
    await registerUser(request, emailB, testPassword)
    const loginResB = await loginUser(request, emailB, testPassword)
    otherToken = (await loginResB.json()).token

    // Create a form
    const formRes = await request.post(`${PB}/api/collections/forms/records`, {
      headers: { Authorization: authToken },
      data: { name: "CT-020 Form", user: userId },
    })
    formId = (await formRes.json()).id

    // Submit 3 POSTs to create submissions
    for (let i = 1; i <= 3; i++) {
      await request.post(`${PB}/api/submit/${formId}`, {
        form: { email: `user${i}@example.com`, message: `Message ${i}` },
        maxRedirects: 0,
      })
    }
  })

  test("CT-020: owner can list submissions for their form, newest first", async ({
    request,
  }) => {
    const res = await request.get(`${PB}/api/collections/submissions/records`, {
      headers: { Authorization: authToken },
      params: {
        filter: `form="${formId}"`,
        sort: "-created",
      },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.totalItems).toBe(3)

    // Verify newest first ordering
    const dates = body.items.map((s: { created: string }) => s.created)
    expect(dates[0] >= dates[1]).toBe(true)

    // Verify data fields are present
    expect(body.items[0]).toHaveProperty("data")
    expect(body.items[0].data).toHaveProperty("email")
  })

  test("CT-021: non-owner sees no submissions (access rule returns empty)", async ({
    request,
  }) => {
    const res = await request.get(`${PB}/api/collections/submissions/records`, {
      headers: { Authorization: otherToken },
      params: { filter: `form="${formId}"` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.totalItems).toBe(0)
  })
})
