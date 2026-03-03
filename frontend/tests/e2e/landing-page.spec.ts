import { test, expect } from "@playwright/test"

// ---------------------------------------------------------------------------
// US1 — Visitor Understands the Product Value (P1)
// ---------------------------------------------------------------------------

test.describe("US1 — Landing Page Content", () => {
  test("EN: displays hero section with headline and CTA", async ({ page }) => {
    await page.goto("/en")
    await expect(page.locator("h1")).toContainText("Simplify B2B Lead Generation")
    await expect(page.locator("main")).toContainText("Get Started Free")
  })

  test("EN: displays two service sections with titles and benefits", async ({ page }) => {
    await page.goto("/en")
    await expect(page.locator("#services")).toBeVisible()
    await expect(page.locator("#services")).toContainText("Form Endpoints")
    await expect(page.locator("#services")).toContainText("Inquiry Widget")
    // Verify benefits are listed
    await expect(page.locator("#services")).toContainText("Telegram notifications")
    await expect(page.locator("#services")).toContainText("Embed on any website")
  })

  test("ZH: displays hero section with Chinese headline", async ({ page }) => {
    await page.goto("/zh")
    await expect(page.locator("h1")).toContainText("让B2B获客变得简单")
    await expect(page.locator("main")).toContainText("免费开始使用")
  })

  test("ZH: displays two service sections with Chinese titles", async ({ page }) => {
    await page.goto("/zh")
    await expect(page.locator("#services")).toBeVisible()
    await expect(page.locator("#services")).toContainText("表单接收端点")
    await expect(page.locator("#services")).toContainText("询盘聊天组件")
  })

  test("page uses semantic HTML structure", async ({ page }) => {
    await page.goto("/en")
    await expect(page.locator("main")).toBeVisible()
    const sections = page.locator("main > section")
    await expect(sections).toHaveCount(3) // hero + services + contact
  })

  test("page has correct SEO metadata for EN", async ({ page }) => {
    await page.goto("/en")
    const title = await page.title()
    expect(title).toContain("FormHandler")
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute("content", /B2B/)
  })

  test("page has correct SEO metadata for ZH", async ({ page }) => {
    await page.goto("/zh")
    const title = await page.title()
    expect(title).toContain("FormHandler")
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute("content", /B2B/)
  })
})

// ---------------------------------------------------------------------------
// US2 — Visitor Navigates to Sign Up or Log In (P2)
// ---------------------------------------------------------------------------

test.describe("US2 — CTA Navigation", () => {
  test("hero CTA button navigates to login page", async ({ page }) => {
    await page.goto("/en")
    await page.click("main >> text=Get Started Free")
    await expect(page).toHaveURL(/\/login/)
  })

  test("service section CTA links navigate to login page", async ({ page }) => {
    await page.goto("/en")
    const ctaLinks = page.locator("#services a[href='/login']")
    const count = await ctaLinks.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test("root URL redirects to /en or /zh", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/(en|zh)/)
  })

  test("authenticated user is redirected away from /en", async ({ page, context }) => {
    // Set a pb_auth cookie to simulate logged-in state
    await context.addCookies([
      {
        name: "pb_auth",
        value: "fake-auth-token",
        url: "http://localhost:3000",
      },
    ])
    await page.goto("/en")
    // User should be redirected away from the landing page
    // (to /dashboard, which may further redirect to /login if token is invalid)
    const url = page.url()
    expect(url).not.toContain("/en")
  })
})

// ---------------------------------------------------------------------------
// US4 — Live Services (Contact Form + Widget) (P2)
// ---------------------------------------------------------------------------

test.describe("US4 — Contact Form & Widget", () => {
  test("contact form section is visible with 3 input fields", async ({ page }) => {
    await page.goto("/en")
    const contact = page.locator("#contact")
    await expect(contact).toBeVisible()
    await expect(contact.locator("input[name='name']")).toBeVisible()
    await expect(contact.locator("input[name='email']")).toBeVisible()
    await expect(contact.locator("textarea[name='message']")).toBeVisible()
  })

  test("contact form shows validation on empty submit", async ({ page }) => {
    await page.goto("/en")
    const contact = page.locator("#contact")
    const submitBtn = contact.locator("button[type='submit']")
    await submitBtn.click()
    // HTML5 required validation prevents submission — form should still be visible
    await expect(contact.locator("input[name='name']")).toBeVisible()
  })

  test("contact form has correct Chinese labels", async ({ page }) => {
    await page.goto("/zh")
    const contact = page.locator("#contact")
    await expect(contact).toContainText("联系我们")
    await expect(contact.locator("button[type='submit']")).toContainText("发送消息")
  })
})
