import { test, expect } from "@playwright/test"

const PB = "http://127.0.0.1:8090"

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`
}

// ---------------------------------------------------------------------------
// US1 E2E — Registration, Login, Logout
// ---------------------------------------------------------------------------

test.describe("US1 — User Registration and Login", () => {
  test("Registration: submit form → see verification-sent confirmation", async ({
    page,
  }) => {
    const email = uniqueEmail("e2e-register")
    await page.goto("/register")
    await page.fill('[name="email"]', email)
    await page.fill('[name="password"]', "Password123!")
    await page.fill('[name="passwordConfirm"]', "Password123!")
    await page.click('button[type="submit"]')

    // After submit, the registration page should show a success/verification message
    await expect(
      page.getByText("Check your email")
    ).toBeVisible({ timeout: 8000 })
  })

  test("Login: correct credentials → dashboard visible", async ({
    page,
    request,
  }) => {
    // Register a user directly via API (skip email verification for test purposes)
    const email = uniqueEmail("e2e-login")
    const password = "Password123!"
    await request.post(`${PB}/api/collections/users/records`, {
      data: { email, password, passwordConfirm: password },
    })

    await page.goto("/login")
    await page.fill('[name="email"]', email)
    await page.fill('[name="password"]', password)
    await page.click('button[type="submit"]')

    // Should land on dashboard (or be redirected there)
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 })
  })

  test("Login: wrong password → inline error shown, stay on login page", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("e2e-wrongpwd")
    const password = "Password123!"
    await request.post(`${PB}/api/collections/users/records`, {
      data: { email, password, passwordConfirm: password },
    })

    await page.goto("/login")
    await page.fill('[name="email"]', email)
    await page.fill('[name="password"]', "WrongPassword!")
    await page.click('button[type="submit"]')

    await expect(page.getByRole("alert")).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test("Logout: click logout → redirected to /login, dashboard redirects back to /login", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("e2e-logout")
    const password = "Password123!"
    await request.post(`${PB}/api/collections/users/records`, {
      data: { email, password, passwordConfirm: password },
    })

    // Log in via UI
    await page.goto("/login")
    await page.fill('[name="email"]', email)
    await page.fill('[name="password"]', password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 })
    await page.waitForLoadState("networkidle")

    // Click logout (window.location.href causes full page navigation)
    await page.getByRole("button", { name: /log ?out|sign ?out/i }).click()
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })

    // Navigating to /dashboard should redirect back to /login
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })
})
