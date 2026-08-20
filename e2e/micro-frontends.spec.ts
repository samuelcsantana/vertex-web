import { expect, test } from "@playwright/test";

/**
 * End-to-end proof that Module Federation works across two origins.
 *
 * **This suite reaches a container this app does not deploy** — by default the live one at
 * cygnus.samuelsantana.dev. That is the property under test, not an accident of setup: a host page
 * resolving a remote at runtime genuinely does depend on another origin being up, and a test that
 * mocked it away would assert nothing worth asserting. Point `NEXT_PUBLIC_CYGNUS_REMOTE_ENTRY` at a
 * locally served `cygnus/dist/mf/remoteEntry.js` to run it offline.
 *
 * Like the rest of e2e/, not wired into CI.
 */
test.describe("Module Federation host", () => {
  test("keeps the remote out of the server render", async ({ request }) => {
    // The whole claim is runtime resolution. If the widget's markup were in the HTML, the remote
    // would have been resolved at build time and this would be a bundling demo.
    const response = await request.get("/micro-frontends");
    const html = await response.text();

    expect(response.status()).toBe(200);
    expect(html).not.toContain("Calendário vacinal");
    expect(html).toContain("resolvido no browser");
  });

  test("mounts a component from another origin into this page's React tree", async ({ page }) => {
    await page.goto("/micro-frontends");

    await expect(page.getByText("Calendário vacinal")).toBeVisible({ timeout: 30_000 });
    // Rows come from the remote's own fetch to the Cygnus API, made from this origin.
    await expect(page.locator(".cygnus-mf-row")).toHaveCount(6);
  });

  test("resolves React to a single shared instance", async ({ page }) => {
    await page.goto("/micro-frontends");

    // "sim" here means the remote's `useState` is the *same function object* as this page's. It
    // cannot be true unless exactly one React exists across both bundles.
    await expect(page.getByTestId("shares-use-state")).toHaveText("sim", { timeout: 30_000 });
    await expect(page.getByTestId("shares-create-element")).toHaveText("sim");
  });

  test("passes props in and callbacks back out", async ({ page }) => {
    await page.goto("/micro-frontends");

    const firstVaccine = page.locator(".cygnus-mf-name-button").first();
    await expect(firstVaccine).toBeVisible({ timeout: 30_000 });
    const name = (await firstVaccine.textContent())?.trim();

    await firstVaccine.click();

    // The remote never navigates the host — it reports, and the host decides.
    await expect(page.getByText(`O remote avisou o host: "${name}"`)).toBeVisible();
    await expect(page).toHaveURL(/\/micro-frontends$/);
  });

  test("survives the remote being unreachable, and recovers", async ({ page }) => {
    await page.goto("/micro-frontends");
    await expect(page.getByText("Calendário vacinal")).toBeVisible({ timeout: 30_000 });

    await page.getByRole("button", { name: "Simular o remote fora do ar" }).click();

    await expect(page.getByText("O remote não respondeu")).toBeVisible({ timeout: 20_000 });
    // The cost of runtime resolution is a dependency on somebody else's uptime. The point of this
    // assertion is that the cost stops at the widget.
    await expect(page.getByText("A negociação do React, medida")).toBeVisible();

    await page.getByRole("button", { name: "Restaurar o remote" }).click();
    await expect(page.getByText("Calendário vacinal")).toBeVisible({ timeout: 30_000 });
  });
});
