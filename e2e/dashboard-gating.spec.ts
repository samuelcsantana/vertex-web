import { test, expect } from "@playwright/test";

test.describe("admin gating (unauthenticated)", () => {
  test("redirects a dashboard URL to the site root", async ({ page }) => {
    await page.goto("/admin/dashboard/posts");
    await expect(page).toHaveURL("/");
  });

  test("redirects the profile page to the site root", async ({ page }) => {
    await page.goto("/admin/profile");
    await expect(page).toHaveURL("/");
  });

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
