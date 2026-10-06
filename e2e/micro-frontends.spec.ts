import { expect, test } from "@playwright/test";

test.describe("Module Federation host", { tag: "@external" }, () => {
  test.describe.configure({ timeout: 90_000 });

  test("keeps the remote out of the server render", async ({ request }) => {
    const response = await request.get("/micro-frontends");
    const html = await response.text();

    expect(response.status()).toBe(200);
    expect(html).not.toContain("Calendário vacinal");
    expect(html).toContain("resolvido no browser");
  });

  test("mounts a component from another origin into this page's React tree", async ({ page }) => {
    await page.goto("/micro-frontends");

    await expect(page.getByText("Calendário vacinal")).toBeVisible({ timeout: 30_000 });
    await expect(page.locator(".cygnus-mf-row")).toHaveCount(6, { timeout: 60_000 });
  });

  test("resolves React to a single shared instance", async ({ page }) => {
    await page.goto("/micro-frontends");

    await expect(page.getByTestId("shares-use-state")).toHaveText("sim", { timeout: 30_000 });
    await expect(page.getByTestId("shares-create-element")).toHaveText("sim");
  });

  test("passes props in and callbacks back out", async ({ page }) => {
    await page.goto("/micro-frontends");

    const firstVaccine = page.locator(".cygnus-mf-name-button").first();
    await expect(firstVaccine).toBeVisible({ timeout: 60_000 });
    const name = (await firstVaccine.textContent())?.trim();

    await firstVaccine.click();

    await expect(page.getByText(`O remote avisou o host: "${name}"`)).toBeVisible();
    await expect(page).toHaveURL(/\/micro-frontends$/);
  });

  test("survives the remote being unreachable, and recovers", async ({ page }) => {
    await page.goto("/micro-frontends");
    await expect(page.getByText("Calendário vacinal")).toBeVisible({ timeout: 30_000 });

    await page.getByRole("button", { name: "Simular o remote fora do ar" }).click();

    await expect(page.getByText("O remote não respondeu")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("A negociação do React, medida")).toBeVisible();

    await page.getByRole("button", { name: "Restaurar o remote" }).click();
    await expect(page.getByText("Calendário vacinal")).toBeVisible({ timeout: 30_000 });
  });
});
