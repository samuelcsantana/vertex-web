import { describe, expect, it } from "vitest";

import { isBucketMediaUrl } from "./media-url";

const BASE = "https://blog-dev-apps.s3.sa-east-1.amazonaws.com";

describe("isBucketMediaUrl", () => {
  it("accepts an object URL on the bucket host", () => {
    expect(
      isBucketMediaUrl(`${BASE}/blog-media/2026-07/cover.png`, BASE)
    ).toBe(true);
  });

  it("rejects other hosts", () => {
    expect(
      isBucketMediaUrl("https://example.com/blog-media/cover.png", BASE)
    ).toBe(false);
  });

  it("rejects a host that merely starts with the bucket host string", () => {
    expect(
      isBucketMediaUrl(
        "https://blog-dev-apps.s3.sa-east-1.amazonaws.com.evil.com/cover.png",
        BASE
      )
    ).toBe(false);
  });

  it("rejects a different protocol on the same host", () => {
    expect(isBucketMediaUrl(`${BASE.replace("https", "http")}/x.png`, BASE)).toBe(
      false
    );
  });

  it("honors a base URL that carries a path prefix", () => {
    expect(isBucketMediaUrl(`${BASE}/blog-media/x.png`, `${BASE}/blog-media`)).toBe(
      true
    );
    expect(isBucketMediaUrl(`${BASE}/other/x.png`, `${BASE}/blog-media`)).toBe(
      false
    );
  });

  it("returns false when no base URL is configured", () => {
    expect(isBucketMediaUrl(`${BASE}/x.png`, undefined)).toBe(false);
  });

  it("returns false for unparseable URLs", () => {
    expect(isBucketMediaUrl("not a url", BASE)).toBe(false);
  });
});
