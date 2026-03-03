import { test, expect } from "@playwright/test"

// ---------------------------------------------------------------------------
// US3 — Landing Page Documentation Links (P2)
// ---------------------------------------------------------------------------

test.describe("US3 — Landing Page Docs Links", () => {
  test("EN: header has Docs dropdown with both links", async ({ page }) => {
    await page.goto("/en")

    // Find and click the Docs dropdown trigger
    const docsTrigger = page.locator("header").getByText("Docs")
    await expect(docsTrigger).toBeVisible()
    await docsTrigger.click()

    // Dropdown should show both links
    await expect(page.getByRole("menuitem", { name: "Form Endpoints" })).toBeVisible()
    await expect(page.getByRole("menuitem", { name: "Inquiry Widget" })).toBeVisible()
  })

  test("EN: Docs dropdown Form Endpoints link navigates correctly", async ({ page }) => {
    await page.goto("/en")
    const docsTrigger = page.locator("header").getByText("Docs")
    await docsTrigger.click()
    await page.getByRole("menuitem", { name: "Form Endpoints" }).click()
    await expect(page).toHaveURL(/\/en\/docs\/form-endpoints/)
  })

  test("EN: Docs dropdown Inquiry Widget link navigates correctly", async ({ page }) => {
    await page.goto("/en")
    const docsTrigger = page.locator("header").getByText("Docs")
    await docsTrigger.click()
    await page.getByRole("menuitem", { name: "Inquiry Widget" }).click()
    await expect(page).toHaveURL(/\/en\/docs\/inquiry-widget/)
  })

  test("EN: service cards have View Docs links", async ({ page }) => {
    await page.goto("/en")
    const docsLinks = page.locator("#services").getByText("View Docs")
    const count = await docsLinks.count()
    expect(count).toBe(2)
  })

  test("EN: Form Endpoints View Docs link navigates to doc page", async ({ page }) => {
    await page.goto("/en")
    const serviceCards = page.locator("#services .grid > div")
    const formCard = serviceCards.first()
    await formCard.getByText("View Docs").click()
    await expect(page).toHaveURL(/\/en\/docs\/form-endpoints/)
  })

  test("ZH: header has Chinese Docs dropdown", async ({ page }) => {
    await page.goto("/zh")
    const docsTrigger = page.locator("header").getByText("文档")
    await expect(docsTrigger).toBeVisible()
    await docsTrigger.click()
    await expect(page.getByRole("menuitem", { name: "表单接收端点" })).toBeVisible()
    await expect(page.getByRole("menuitem", { name: "询盘聊天组件" })).toBeVisible()
  })

  test("ZH: Docs dropdown preserves locale on navigation", async ({ page }) => {
    await page.goto("/zh")
    const docsTrigger = page.locator("header").getByText("文档")
    await docsTrigger.click()
    await page.getByRole("menuitem", { name: "表单接收端点" }).click()
    await expect(page).toHaveURL(/\/zh\/docs\/form-endpoints/)
  })

  test("ZH: service cards have Chinese View Docs links", async ({ page }) => {
    await page.goto("/zh")
    const docsLinks = page.locator("#services").getByText("查看文档")
    const count = await docsLinks.count()
    expect(count).toBe(2)
  })
})
