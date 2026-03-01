import { test, expect } from "@playwright/test"

const PB = "http://127.0.0.1:8090"

async function setupUser(request: Parameters<typeof test.beforeAll>[0] extends (args: { request: infer R }) => unknown ? R : never) {
  const email = `e2e-forms-${Date.now()}@test.com`
  const password = "Password123!"
  await request.post(`${PB}/api/collections/users/records`, {
    data: { email, password, passwordConfirm: password },
  })
  const loginRes = await request.post(`${PB}/api/collections/users/auth-with-password`, {
    data: { identity: email, password },
  })
  const body = await loginRes.json()
  return { email, password, token: body.token, userId: body.record.id }
}

// ---------------------------------------------------------------------------
// US2 E2E — Form Creation and Management
// ---------------------------------------------------------------------------

test.describe("US2 — Form Creation and Management", () => {
  let userEmail: string
  let userPassword: string

  test.beforeAll(async ({ request }) => {
    const user = await setupUser(request)
    userEmail = user.email
    userPassword = user.password
  })

  async function login(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never) {
    await page.goto("/login")
    await page.fill('[name="email"]', userEmail)
    await page.fill('[name="password"]', userPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 })
    await page.waitForLoadState("networkidle")
  }

  test("Create form: click New Form → fill name → form card appears with endpoint URL", async ({
    page,
  }) => {
    await login(page)
    await page.getByRole("button", { name: /new form/i }).click()
    await page.fill('[placeholder*="form name" i], [name="name"]', "My Contact Form")
    await page.getByRole("button", { name: /^create$/i }).click()

    await expect(page.getByText("My Contact Form")).toBeVisible({ timeout: 8000 })
    // Endpoint URL should contain /api/submit/ (shown in a read-only input)
    await expect(page.locator('[aria-label="Submission endpoint URL"]')).toHaveValue(/\/api\/submit\//)
  })

  test("Rename form: open menu → rename → new name shown, endpoint URL unchanged", async ({
    page,
  }) => {
    await login(page)
    // Create a form first
    await page.getByRole("button", { name: /new form/i }).click()
    await page.fill('[placeholder*="form name" i], [name="name"]', "To Rename")
    await page.getByRole("button", { name: /^create$/i }).click()
    await expect(page.getByText("To Rename")).toBeVisible({ timeout: 8000 })

    // Open dropdown and rename
    await page.getByRole("button", { name: /more|options|⋮|…/i }).first().click()
    await page.getByRole("menuitem", { name: /rename/i }).click()
    await page.fill('[placeholder*="name" i], [name="name"]', "Renamed Form")
    await page.getByRole("button", { name: /save|rename|update/i }).click()

    await expect(page.getByText("Renamed Form")).toBeVisible({ timeout: 8000 })
    await expect(page.locator('[aria-label="Submission endpoint URL"]')).toHaveValue(/\/api\/submit\//)
  })

  test("Delete form: open menu → delete → confirm → card removed", async ({
    page,
  }) => {
    await login(page)
    await page.getByRole("button", { name: /new form/i }).click()
    await page.fill('[placeholder*="form name" i], [name="name"]', "To Delete")
    await page.getByRole("button", { name: /^create$/i }).click()
    await expect(page.getByText("To Delete")).toBeVisible({ timeout: 8000 })

    await page.getByRole("button", { name: /more|options|⋮|…/i }).first().click()
    await page.getByRole("menuitem", { name: /delete/i }).click()
    await page.getByRole("button", { name: /confirm|yes|delete/i }).click()

    // After deletion, the form card link should no longer be visible
    await expect(page.locator('a', { hasText: 'To Delete' })).not.toBeVisible({ timeout: 8000 })
  })

  test("Empty state: new user sees 'No forms' message", async ({ page, request }) => {
    const user = await setupUser(request)
    await page.goto("/login")
    await page.fill('[name="email"]', user.email)
    await page.fill('[name="password"]', user.password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 })
    await expect(page.getByText("No forms yet")).toBeVisible()
  })
})
