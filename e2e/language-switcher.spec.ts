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
});
