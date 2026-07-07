import { test, expect } from "@playwright/test";

// proxy.ts gates /dashboard/** and /profile behind an access_token cookie,
// stripping the locale prefix first so /dashboard, /en/dashboard, and
// /es/dashboard all resolve to the same gated route.
test.describe("dashboard gating (unauthenticated)", () => {
  test("redirects /dashboard/posts to the pt root", async ({ page }) => {
    await page.goto("/dashboard/posts");
    await expect(page).toHaveURL("/");
  });

  test("redirects /en/dashboard/posts to /en, preserving the locale", async ({
    page,
  }) => {
    await page.goto("/en/dashboard/posts");
    await expect(page).toHaveURL("/en");
  });

  test("redirects /profile to the pt root", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL("/");
  });
});
