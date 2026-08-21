import { describe, expect, it } from "vitest";

import { resolveSiteUrl } from "./site-url";

const CANONICAL = "https://www.samuelsantana.dev";

describe("resolveSiteUrl", () => {
  it("returns the canonical origin in a production build", () => {
    expect(resolveSiteUrl("production", undefined)).toBe(CANONICAL);
  });

  it("ignores the override in a production build", () => {
    // The whole point of the constant: a deployment variable pointing at
    // the apex, at a preview host or at nothing at all cannot change what
    // the published site calls itself.
    expect(resolveSiteUrl("production", "https://samuelsantana.dev")).toBe(
      CANONICAL
    );
    expect(resolveSiteUrl("production", "http://localhost:3000")).toBe(
      CANONICAL
    );
  });

  it("honors the override outside production", () => {
    expect(resolveSiteUrl("development", "http://localhost:3021")).toBe(
      "http://localhost:3021"
    );
  });

  it("falls back to the canonical origin when the override is absent or blank", () => {
    expect(resolveSiteUrl("development", undefined)).toBe(CANONICAL);
    expect(resolveSiteUrl("development", "   ")).toBe(CANONICAL);
  });

  it("strips trailing slashes so pathnames don't concatenate into a double slash", () => {
    expect(resolveSiteUrl("development", "http://localhost:3021/")).toBe(
      "http://localhost:3021"
    );
  });
});
