import { defineConfig, devices } from "@playwright/test";

// These tests hit a real vertex-api instance (no mocking) — start it
// separately (npm run start:dev in vertex-api, with Postgres up) before
// running this suite. Not wired into CI yet: standing up Postgres +
// vertex-api as CI services is a separate, bigger piece of work.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    // Pinned so locale-routing tests are deterministic: next-intl's locale
    // detection negotiates from Accept-Language on a visitor's first request
    // (before any NEXT_LOCALE cookie exists), so an unpinned browser locale
    // would make "/" resolve to whatever language the test runner's own
    // environment happens to prefer instead of this app's actual default.
    locale: "pt-BR",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
