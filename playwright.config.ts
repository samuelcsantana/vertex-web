import { defineConfig, devices } from "@playwright/test";

/**
 * This suite does **not** need vertex-api, and the belief that it did is what kept it out of CI.
 *
 * Measured rather than assumed: with nothing listening on :3333, all 18 specs pass. They assert
 * layout, locale routing, the auth gate's redirects and the federation boundary — none of them
 * reads a post, a topic or a profile, so none of them ever reaches the API. "Standing up Postgres
 * and vertex-api as CI services" was a real piece of work being done to satisfy a requirement that
 * did not exist.
 *
 * That is worth stating plainly rather than deleting quietly, because it also bounds what these
 * tests cover: **nothing here would notice vertex-api returning garbage.** Specs that assert on
 * real content are still owed, and they will bring the Postgres requirement with them.
 *
 * Tests tagged `@external` reach an origin this repository does not deploy — see
 * e2e/micro-frontends.spec.ts. CI runs them as a separate job so that "cygnus was down" and "this
 * PR broke the site" are never the same red X.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3021",
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
    // A production server in CI, the dev server locally. Not just for speed: /micro-frontends is
    // prerendered, and `next dev` renders it per request — so the spec asserting the remote is
    // absent from the server HTML would be checking a different pipeline than the one that ships.
    // CI builds in its own step, which keeps the build's output out of the test log.
    command: process.env.CI ? "npm start" : "npm run dev",
    url: "http://localhost:3021",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
