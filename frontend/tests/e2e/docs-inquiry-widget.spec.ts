import { test, expect } from "@playwright/test"

// ---------------------------------------------------------------------------
// US2 — Inquiry Widget Documentation Page (P1)
// ---------------------------------------------------------------------------

test.describe("US2 — Inquiry Widget Documentation", () => {
  test("EN: page loads with quickstart steps and sections", async ({ page }) => {
    await page.goto("/en/docs/inquiry-widget")

    // Title
    await expect(page.locator("h1")).toContainText("Inquiry Widget Documentation")

    // Quickstart steps
    await expect(page.locator("article")).toContainText("Step 1")
    await expect(page.locator("article")).toContainText("Step 2")
    await expect(page.locator("article")).toContainText("Step 3")
    await expect(page.locator("article")).toContainText("Step 4")
    await expect(page.locator("article")).toContainText("Step 5")

    // Reference sections
    await expect(page.locator("article")).toContainText("Question Types in Detail")
    await expect(page.locator("article")).toContainText("Customizing the Widget")
    await expect(page.locator("article")).toContainText("Viewing and Managing Inquiries")
    await expect(page.locator("article")).toContainText("Telegram Notifications")
    await expect(page.locator("article")).toContainText("Visitor Analytics")
    await expect(page.locator("article")).toContainText("Full Example")
  })

  test("EN: code examples are present with placeholder IDs", async ({ page }) => {
    await page.goto("/en/docs/inquiry-widget")
    await expect(page.locator("article")).toContainText("YOUR_WIDGET_ID")

    // At least one code block exists
    const codeBlocks = page.locator("pre code")
    const count = await codeBlocks.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test("EN: question types are documented", async ({ page }) => {
    await page.goto("/en/docs/inquiry-widget")
    await expect(page.locator("article")).toContainText("Text")
    await expect(page.locator("article")).toContainText("Email")
    await expect(page.locator("article")).toContainText("Single-Select")
  })

  test("EN: screenshots are present", async ({ page }) => {
    await page.goto("/en/docs/inquiry-widget")
    const images = page.locator("article img")
    const count = await images.count()
    expect(count).toBeGreaterThanOrEqual(5)
  })

  test("ZH: page loads with Chinese content", async ({ page }) => {
    await page.goto("/zh/docs/inquiry-widget")

    await expect(page.locator("h1")).toContainText("询盘组件使用文档")
    await expect(page.locator("article")).toContainText("快速开始")
    await expect(page.locator("article")).toContainText("问题类型详解")
    await expect(page.locator("article")).toContainText("自定义组件")
    await expect(page.locator("article")).toContainText("Telegram 通知")
    await expect(page.locator("article")).toContainText("访客分析")
    await expect(page.locator("article")).toContainText("完整示例")
  })

  test("EN: page has correct SEO metadata", async ({ page }) => {
    await page.goto("/en/docs/inquiry-widget")
    const title = await page.title()
    expect(title).toContain("Inquiry Widget Documentation")
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute("content", /inquiry widget/)
  })

  test("EN: header and footer are present", async ({ page }) => {
    await page.goto("/en/docs/inquiry-widget")
    await expect(page.locator("header")).toBeVisible()
    await expect(page.locator("footer")).toBeVisible()
  })
})
