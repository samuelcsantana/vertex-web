import { expect, test, type Page } from "@playwright/test";

interface InstrumentedWindow {
  __pyxisRequests: string[];
}

async function recordPyxisRequests(page: Page) {
  await page.addInitScript(() => {
    const requests: string[] = [];
    (window as unknown as InstrumentedWindow).__pyxisRequests = requests;

    const beacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = (url, data) => {
      requests.push(String(url));
      return beacon(url, data);
    };

    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      requests.push(input instanceof Request ? input.url : String(input));
      return originalFetch(input, init);
    };
  });
}

async function batchRequests(page: Page): Promise<string[]> {
  const requests = await page.evaluate(
    () => (window as unknown as InstrumentedWindow).__pyxisRequests
  );
  return requests.filter((url) => url.includes("/v1/batch"));
}

test.describe("usage analytics", () => {
  test("a build without a Pyxis key measures nothing and shows no switch", async ({
    page,
  }) => {
    await recordPyxisRequests(page);

    for (const path of ["/", "/about", "/en"]) {
      await page.goto(path);
      await expect(page.locator("footer")).toBeVisible();

      expect(await batchRequests(page)).toEqual([]);
      expect(
        await page.evaluate(() => window.sessionStorage.getItem("pyxis:session"))
      ).toBeNull();
      await expect(page.locator("footer").getByRole("button")).toHaveCount(0);
    }
  });
});
