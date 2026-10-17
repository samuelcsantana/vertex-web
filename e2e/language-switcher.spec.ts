import { test, expect } from "@playwright/test";

test.describe("language switcher", () => {
  test("switching to English navigates to /en and updates html lang", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("switching back to Português from /en returns to the unprefixed root", async ({
    page,
  }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: "Português" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt");
  });

  test("switching preserves the current page, not just the locale root", async ({
    page,
  }) => {
    await page.goto("/about");
    await page.getByRole("button", { name: "English" }).click();
    await expect(page).toHaveURL("/en/about");
  });

  test("a late /es prefetch does not flip the locale back after switching to Português", async ({
    page,
    context,
  }) => {
    await page.route("**/*", async (route) => {
      const request = route.request();
      if (
        request.headers()["next-router-prefetch"] &&
        new URL(request.url()).pathname.startsWith("/es")
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      await route.continue();
    });

    await page.goto("/");
    await page.getByRole("button", { name: "Español" }).click();
    await expect(page).toHaveURL(/\/es\/?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await page.getByRole("button", { name: "Português" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt");

    await page.waitForTimeout(2500);
    const localeCookie = (await context.cookies()).find(
      (cookie) => cookie.name === "NEXT_LOCALE"
    );
    expect(localeCookie?.value).toBe("pt");

    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt");
  });
});
