import { test, expect, type APIRequestContext } from "@playwright/test"

// ---------------------------------------------------------------------------
// OAuth API Contract Tests  CT-OA-001 through CT-OA-008
// ---------------------------------------------------------------------------
//
// Tests for PocketBase built-in OAuth2 endpoints:
//   GET  /api/collections/users/auth-methods
//   GET  /api/collections/_externalAuths/records  (SDK: listExternalAuths)
//   DELETE /api/collections/_externalAuths/records/{id}  (SDK: unlinkExternalAuth)
//
// NOTE: CT-OA-001, CT-OA-001b depend on Google/GitHub being configured
// in the PocketBase Admin UI. These tests will be skipped if providers
// are not configured.

const PB = "http://127.0.0.1:8090"

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`
}

async function createAndLoginUser(
  request: APIRequestContext,
  prefix: string
) {
  const email = uniqueEmail(prefix)
  const password = "Password123!"
  await request.post(`${PB}/api/collections/users/records`, {
    data: { email, password, passwordConfirm: password },
  })
  const loginRes = await request.post(
    `${PB}/api/collections/users/auth-with-password`,
    { data: { identity: email, password } }
  )
  const body = await loginRes.json()
  return { token: body.token as string, userId: body.record.id as string, email }
}

// ---------------------------------------------------------------------------
// GET /api/collections/users/auth-methods — List Auth Methods
// ---------------------------------------------------------------------------

test.describe("GET /api/collections/users/auth-methods", () => {
  test("CT-OA-002: returns password method as enabled", async ({ request }) => {
    const res = await request.get(`${PB}/api/collections/users/auth-methods`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.password).toBeDefined()
    expect(body.password.enabled).toBe(true)
  })

  test("CT-OA-001: returns oauth2 with google provider (if configured)", async ({
    request,
  }) => {
    const res = await request.get(`${PB}/api/collections/users/auth-methods`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.oauth2).toBeDefined()

    const google = body.oauth2.providers?.find(
      (p: { name: string }) => p.name === "google"
    )

    // Skip if Google provider not configured
    if (!google) {
      test.skip(true, "Google OAuth2 provider not configured in PocketBase Admin UI")
      return
    }

    expect(google.displayName).toBe("Google")
    expect(google.authURL).toContain("accounts.google.com")
  })

  test("CT-OA-001b: returns oauth2 with github provider (if configured)", async ({
    request,
  }) => {
    const res = await request.get(`${PB}/api/collections/users/auth-methods`)
    expect(res.status()).toBe(200)
    const body = await res.json()

    const github = body.oauth2?.providers?.find(
      (p: { name: string }) => p.name === "github"
    )

    // Skip if GitHub provider not configured
    if (!github) {
      test.skip(true, "GitHub OAuth2 provider not configured in PocketBase Admin UI")
      return
    }

    expect(github.displayName).toBe("GitHub")
    expect(github.authURL).toContain("github.com")
  })
})

// ---------------------------------------------------------------------------
// _externalAuths collection — List External Auths (SDK: listExternalAuths)
// ---------------------------------------------------------------------------
// The PocketBase SDK v0.26.x queries the _externalAuths system collection
// directly with a recordRef filter, not via a sub-route on the users collection.

test.describe("_externalAuths collection — List External Auths", () => {
  test("CT-OA-005: user with no OAuth providers returns 200 with empty items", async ({
    request,
  }) => {
    const { token, userId } = await createAndLoginUser(request, "ct-oa-005")
    const filter = encodeURIComponent(`recordRef = "${userId}"`)
    const res = await request.get(
      `${PB}/api/collections/_externalAuths/records?filter=${filter}`,
      { headers: { Authorization: token } }
    )
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.items).toBeDefined()
    expect(body.items).toHaveLength(0)
    expect(body.totalItems).toBe(0)
  })

  test("CT-OA-003: authenticated user can list own external auths", async ({
    request,
  }) => {
    const { token, userId } = await createAndLoginUser(request, "ct-oa-003")
    const filter = encodeURIComponent(`recordRef = "${userId}"`)
    const res = await request.get(
      `${PB}/api/collections/_externalAuths/records?filter=${filter}`,
      { headers: { Authorization: token } }
    )
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.items).toBeDefined()
    expect(Array.isArray(body.items)).toBe(true)
  })

  test("CT-OA-004: _externalAuths collection returns 200 for list requests", async ({
    request,
  }) => {
    // PocketBase system collections allow listing — access control is via
    // the filter (recordRef) and collection-level rules, not 401.
    const res = await request.get(
      `${PB}/api/collections/_externalAuths/records?perPage=1`
    )
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.items).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// _externalAuths collection — Unlink External Auth (SDK: unlinkExternalAuth)
// ---------------------------------------------------------------------------
// The SDK finds the _externalAuths record by filter, then DELETEs it by ID.

test.describe("_externalAuths collection — Unlink External Auth", () => {
  test("CT-OA-007: delete non-existent _externalAuths record returns 404", async ({
    request,
  }) => {
    const { token } = await createAndLoginUser(request, "ct-oa-007")
    const res = await request.delete(
      `${PB}/api/collections/_externalAuths/records/nonexistent_id_12345`,
      { headers: { Authorization: token } }
    )
    expect(res.status()).toBe(404)
  })

  test("CT-OA-008: unauthenticated delete of _externalAuths record returns 404 or 403", async ({
    request,
  }) => {
    // Without auth, attempting to delete a non-existent record returns 404
    // (PocketBase checks existence before auth for system collections)
    const res = await request.delete(
      `${PB}/api/collections/_externalAuths/records/nonexistent_id_12345`
    )
    // PocketBase returns 404 for non-existent records regardless of auth
    expect([403, 404]).toContain(res.status())
  })
})
