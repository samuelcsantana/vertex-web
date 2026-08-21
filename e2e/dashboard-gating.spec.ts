import { test, expect } from "@playwright/test";

// proxy.ts gates everything under /admin behind an access_token cookie.
//
// That prefix is the whole gate now. The panel used to live inside the
// [locale] segment, where "as-needed" gave the default locale no prefix and
// the others their own, so /dashboard, /en/dashboard and /es/dashboard were
// three spellings of one route and the gate had to undo next-intl's URL
// scheme before it could match. These tests pin the replacement: one prefix,
// no locale variants, and no way in through an old URL.
test.describe("admin gating (unauthenticated)", () => {
  test("redirects a dashboard URL to the site root", async ({ page }) => {
    await page.goto("/admin/dashboard/posts");
    await expect(page).toHaveURL("/");
  });

  test("redirects the profile page to the site root", async ({ page }) => {
    await page.goto("/admin/profile");
    await expect(page).toHaveURL("/");
  });

  // The locale survives the bounce, just not in the admin URL: the redirect
  // lands on "/", and next-intl's own detection sends a visitor whose
  // NEXT_LOCALE says "en" on to /en. Worth pinning, because moving the panel
  // out of [locale] is exactly the kind of change that could have dropped a
  // signed-out English reader onto the Portuguese home page.
  test("keeps the visitor's language through the bounce", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      { name: "NEXT_LOCALE", value: "en", url: "http://localhost:3021" },
    ]);

    await page.goto("/admin/dashboard/posts");
    await expect(page).toHaveURL("/en");
  });

  // The old URLs are gone rather than aliased, and so is any locale-prefixed
  // spelling of the new one. A route that still answered here would mean the
  // panel had two addresses, only one of which the gate above checks.
  test("does not answer at the pre-move URLs", async ({ request }) => {
    for (const path of [
      "/dashboard/posts",
      "/en/dashboard/posts",
      "/profile",
      "/en/admin/dashboard/posts",
    ]) {
      const response = await request.get(path);
      expect(response.status(), `expected 404 for ${path}`).toBe(404);
    }
  });
});
