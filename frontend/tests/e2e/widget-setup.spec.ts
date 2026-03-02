import { test, expect } from "@playwright/test"

const PB = "http://127.0.0.1:8090"

async function setupUser(
  request: Parameters<typeof test.beforeAll>[0] extends (args: {
    request: infer R
  }) => unknown
    ? R
    : never
) {
  const email = `e2e-widget-${Date.now()}@test.com`
  const password = "Password123!"
  await request.post(`${PB}/api/collections/users/records`, {
    data: { email, password, passwordConfirm: password },
  })
  const loginRes = await request.post(
    `${PB}/api/collections/users/auth-with-password`,
    { data: { identity: email, password } }
  )
  const body = await loginRes.json()
  return { email, password, token: body.token, userId: body.record.id }
}

// ---------------------------------------------------------------------------
// E2E — Widget Creation and Question Configuration
// ---------------------------------------------------------------------------

test.describe("Widget Setup E2E", () => {
  let userEmail: string
  let userPassword: string

  test.beforeAll(async ({ request }) => {
    const user = await setupUser(request)
    userEmail = user.email
    userPassword = user.password
  })

  async function login(
    page: Parameters<typeof test>[1] extends (args: {
      page: infer P
    }) => unknown
      ? P
      : never
  ) {
    await page.goto("/login")
    await page.fill('[name="email"]', userEmail)
    await page.fill('[name="password"]', userPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 })
    await page.waitForLoadState("networkidle")
  }

  test("Create widget: click New Widget → widget card appears in dashboard", async ({
    page,
  }) => {
    await login(page)
    await page.getByRole("button", { name: /new widget/i }).click()

    // Widget card should appear with default name
    await expect(page.getByText("My Widget")).toBeVisible({ timeout: 8000 })
    // Should show Active badge
    await expect(page.getByText("Active")).toBeVisible()
    // Should show 0 inquiries
    await expect(page.getByText("0 inquiries")).toBeVisible()
  })

  test("Configure questions: navigate to settings → edit questions → save", async ({
    page,
  }) => {
    await login(page)

    // Create a widget first
    await page.getByRole("button", { name: /new widget/i }).click()
    await expect(page.getByText("My Widget")).toBeVisible({ timeout: 8000 })

    // Navigate to widget settings
    await page.getByRole("button", { name: /more|options/i }).first().click()
    await page.getByRole("menuitem", { name: /settings/i }).click()

    // Verify we're on the settings page
    await expect(page.getByText("Widget Settings")).toBeVisible({
      timeout: 8000,
    })

    // Verify default questions are present (at least the first one)
    await expect(
      page.locator('[aria-label="Question 1 label"]')
    ).toHaveValue(/country/i)

    // Save settings
    await page.getByRole("button", { name: /save/i }).click()
    await expect(page.getByText("Settings saved")).toBeVisible({
      timeout: 5000,
    })
  })

  test("Embed code: visible on settings page with widget ID", async ({
    page,
  }) => {
    await login(page)

    await page.getByRole("button", { name: /new widget/i }).click()
    await expect(page.getByText("My Widget")).toBeVisible({ timeout: 8000 })

    // Navigate to settings
    await page.getByRole("button", { name: /more|options/i }).first().click()
    await page.getByRole("menuitem", { name: /settings/i }).click()

    // Verify embed code section
    await expect(page.getByText("Embed Code", { exact: true })).toBeVisible({ timeout: 8000 })
    // Embed code should contain FormHandler config
    await expect(
      page.locator("pre").filter({ hasText: "FormHandler" })
    ).toBeVisible()
  })
})
