import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

/**
 * Runs against the production build served the way CloudFront serves it
 * (scripts/serve.ts). Build first with `VITE_API_URL=http://localhost:4173/api`
 * so the mocked contact API is same-origin under the CSP.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node scripts/serve.ts",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    env: { PORT: String(PORT) },
  },
});
