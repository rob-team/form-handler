import { test, expect } from "@playwright/test"

// ---------------------------------------------------------------------------
// US1 — Form Endpoints Documentation Page (P1)
// ---------------------------------------------------------------------------

test.describe("US1 — Form Endpoints Documentation", () => {
  test("EN: page loads with quickstart steps and sections", async ({ page }) => {
    await page.goto("/en/docs/form-endpoints")

    // Title
    await expect(page.locator("h1")).toContainText("Form Endpoints Documentation")

    // Quickstart steps
    await expect(page.locator("article")).toContainText("Step 1")
    await expect(page.locator("article")).toContainText("Step 2")
    await expect(page.locator("article")).toContainText("Step 3")
    await expect(page.locator("article")).toContainText("Step 4")

    // Reference sections
    await expect(page.locator("article")).toContainText("Custom Redirect")
    await expect(page.locator("article")).toContainText("Viewing and Managing Submissions")
    await expect(page.locator("article")).toContainText("Telegram Notifications")
    await expect(page.locator("article")).toContainText("Full Example")
  })

  test("EN: code examples are present with placeholder IDs", async ({ page }) => {
    await page.goto("/en/docs/form-endpoints")
    await expect(page.locator("article")).toContainText("YOUR_FORM_ID")
    await expect(page.locator("article")).toContainText("_next")

    // At least one code block exists
    const codeBlocks = page.locator("pre code")
    const count = await codeBlocks.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test("EN: screenshots are present", async ({ page }) => {
    await page.goto("/en/docs/form-endpoints")
    const images = page.locator("article img")
    const count = await images.count()
    expect(count).toBeGreaterThanOrEqual(4)
  })

  test("ZH: page loads with Chinese content", async ({ page }) => {
    await page.goto("/zh/docs/form-endpoints")

    await expect(page.locator("h1")).toContainText("表单端点使用文档")
    await expect(page.locator("article")).toContainText("快速开始")
    await expect(page.locator("article")).toContainText("自定义重定向")
    await expect(page.locator("article")).toContainText("Telegram 通知")
    await expect(page.locator("article")).toContainText("完整示例")
  })

  test("EN: page has correct SEO metadata", async ({ page }) => {
    await page.goto("/en/docs/form-endpoints")
    const title = await page.title()
    expect(title).toContain("Form Endpoints Documentation")
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute("content", /form endpoint/)
  })

  test("EN: header and footer are present", async ({ page }) => {
    await page.goto("/en/docs/form-endpoints")
    await expect(page.locator("header")).toBeVisible()
    await expect(page.locator("footer")).toBeVisible()
  })

  test("EN: back to home link navigates correctly", async ({ page }) => {
    await page.goto("/en/docs/form-endpoints")
    await page.click("text=Back to Home")
    await expect(page).toHaveURL(/\/en/)
  })
})
