import { describe, expect, it } from "vitest";

import { outboundHost } from "./outbound";

const SITE = "www.samuelsantana.dev";

describe("outboundHost", () => {
  it("returns the hostname of a link to another site", () => {
    expect(outboundHost("https://github.com/samuelcsantana/pyxis-api", SITE)).toBe(
      "github.com"
    );
  });

  it("keeps only the hostname, never the path or the port", () => {
    expect(outboundHost("https://demo.pyxis-analytics.dev:8443/visits?x=1", SITE)).toBe(
      "demo.pyxis-analytics.dev"
    );
  });

  it("ignores links to the same site, absolute or relative", () => {
    expect(outboundHost(`https://${SITE}/blog/a-post`, SITE)).toBeNull();
    expect(outboundHost("/blog/a-post", SITE)).toBeNull();
    expect(outboundHost("#section", SITE)).toBeNull();
  });

  it("ignores mail, phone and javascript links", () => {
    expect(outboundHost("mailto:someone@example.com", SITE)).toBeNull();
    expect(outboundHost("tel:+5571999999999", SITE)).toBeNull();
    expect(outboundHost("javascript:void(0)", SITE)).toBeNull();
  });

  it("ignores a link it cannot parse", () => {
    expect(outboundHost("http://", SITE)).toBeNull();
  });
});
