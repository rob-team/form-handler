import { test, expect } from "@playwright/test"

const PB = "http://127.0.0.1:8090"

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`
}

// ---------------------------------------------------------------------------
// US1/US2 E2E — OAuth Sign-in Buttons on Login Page
// ---------------------------------------------------------------------------

test.describe("US1/US2 — OAuth Login Buttons", () => {
  test("Login page shows OAuth buttons when providers are configured", async ({
    page,
    request,
  }) => {
    // Check if providers are configured
    const res = await request.get(`${PB}/api/collections/users/auth-methods`)
    const methods = await res.json()
    const hasProviders =
      methods.oauth2?.providers && methods.oauth2.providers.length > 0

    await page.goto("/login")

    if (hasProviders) {
      // Wait for at least one OAuth button to render (they load via API call)
      await expect(
        page.getByRole("button", { name: /sign in with/i }).first()
      ).toBeVisible({ timeout: 5000 })

      // Verify each configured provider has a button
      for (const provider of methods.oauth2.providers) {
        const btn = page.getByRole("button", {
          name: new RegExp(`sign in with ${provider.displayName}`, "i"),
        })
        await expect(btn).toBeVisible()
      }
    } else {
      // If no providers configured, OAuth section should not render
      await page.waitForTimeout(2000)
      await expect(
        page.getByRole("button", { name: /sign in with/i })
      ).not.toBeVisible()
    }
  })

  test("Login page still shows email/password form alongside OAuth", async ({
    page,
  }) => {
    await page.goto("/login")

    // Email/password form should always be present
    await expect(page.locator('[name="email"]')).toBeVisible()
    await expect(page.locator('[name="password"]')).toBeVisible()
    await expect(page.getByRole("button", { name: /log in/i })).toBeVisible()
  })

  test("Or separator is visible when OAuth providers exist", async ({
    page,
    request,
  }) => {
    const res = await request.get(`${PB}/api/collections/users/auth-methods`)
    const methods = await res.json()
    const hasProviders =
      methods.oauth2?.providers && methods.oauth2.providers.length > 0

    if (!hasProviders) {
      test.skip(true, "No OAuth providers configured")
      return
    }

    await page.goto("/login")
    // The "or" separator is inside a div with uppercase styling
    await expect(
      page.locator(".uppercase", { hasText: "or" })
    ).toBeVisible({ timeout: 5000 })
  })
})

// ---------------------------------------------------------------------------
// US3 E2E — Account Settings Page
// ---------------------------------------------------------------------------

test.describe("US3 — Account Settings Page", () => {
  test("Authenticated user can view settings page with connected accounts section", async ({
    page,
    request,
  }) => {
    // Create and login a user
    const email = uniqueEmail("e2e-settings")
    const password = "Password123!"
    await request.post(`${PB}/api/collections/users/records`, {
      data: { email, password, passwordConfirm: password },
    })

    await page.goto("/login")
    await page.fill('[name="email"]', email)
    await page.fill('[name="password"]', password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 })

    // Navigate to settings
    await page.goto("/settings")
    await expect(page).toHaveURL(/\/settings/, { timeout: 5000 })

    // Should show the connected accounts section
    await expect(
      page.getByText(/connected accounts/i)
    ).toBeVisible({ timeout: 5000 })
  })

  test("Settings page shows user email", async ({ page, request }) => {
    const email = uniqueEmail("e2e-settings-email")
    const password = "Password123!"
    await request.post(`${PB}/api/collections/users/records`, {
      data: { email, password, passwordConfirm: password },
    })

    await page.goto("/login")
    await page.fill('[name="email"]', email)
    await page.fill('[name="password"]', password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 })

    await page.goto("/settings")
    await expect(page.getByText(email)).toBeVisible({ timeout: 5000 })
  })
})
