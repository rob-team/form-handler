import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",

  projects: [
    {
      name: "api-contracts",
      testMatch: "tests/contract/**/*.spec.ts",
      use: {
        baseURL: "http://127.0.0.1:8090",
        extraHTTPHeaders: {
          Accept: "application/json",
        },
      },
    },
    {
      name: "e2e",
      testMatch: "tests/e2e/**/*.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3000",
      },
    },
  ],
})
