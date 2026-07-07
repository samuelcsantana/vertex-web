import { test, expect } from "@playwright/test";

// Sub-path i18n via next-intl: pt is the default locale and stays
// unprefixed at the root; en/es get a real /en, /es prefix.
test.describe("locale routing", () => {
  test("pt serves at the root with html lang=pt", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt");
  });

  test("en serves at /en with html lang=en", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("es serves at /es with html lang=es", async ({ page }) => {
    await page.goto("/es");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });

  test("explicit /pt canonicalizes back to the unprefixed root", async ({
    page,
  }) => {
    await page.goto("/pt");
    await expect(page).toHaveURL("/");
  });

  test("the about page is reachable in all three locales", async ({
    page,
  }) => {
    await page.goto("/about");
    await expect(page).toHaveURL("/about");

    await page.goto("/en/about");
    await expect(page).toHaveURL("/en/about");

    await page.goto("/es/about");
    await expect(page).toHaveURL("/es/about");
  });
});
