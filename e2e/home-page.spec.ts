import { test, expect } from "@playwright/test";

test.describe("home page", () => {
  test("renders the hero and does not overflow at a mobile viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(page.locator("h1")).toBeVisible();

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test("the mobile hamburger menu opens and its links stay on the current locale", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/en");

    await page.getByRole("button", { name: /open menu|abrir menu/i }).click();
    const nav = page.locator("nav.absolute");
    await expect(nav).toBeVisible();

    const hrefs = await nav.locator("a").evaluateAll((links) =>
      links.map((link) => link.getAttribute("href"))
    );
    for (const href of hrefs) {
      expect(href?.startsWith("/en")).toBe(true);
    }
  });
});
