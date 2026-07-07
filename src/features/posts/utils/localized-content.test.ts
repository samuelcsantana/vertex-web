import { describe, expect, it } from "vitest";

import { getLocalizedContent, getLocalizedTitle } from "./localized-content";

describe("getLocalizedTitle", () => {
  it("returns the English title when locale is en and titleEn is set", () => {
    const post = { title: "Título", titleEn: "Title" };
    expect(getLocalizedTitle(post, "en")).toBe("Title");
  });

  it("falls back to the default title when locale is en but titleEn is null", () => {
    const post = { title: "Título", titleEn: null };
    expect(getLocalizedTitle(post, "en")).toBe("Título");
  });

  it("returns the default title for pt regardless of titleEn", () => {
    const post = { title: "Título", titleEn: "Title" };
    expect(getLocalizedTitle(post, "pt")).toBe("Título");
  });

  it("returns the default title for es, since there is no titleEs field", () => {
    const post = { title: "Título", titleEn: "Title" };
    expect(getLocalizedTitle(post, "es")).toBe("Título");
  });
});

describe("getLocalizedContent", () => {
  it("returns the English content when locale is en and contentEn is set", () => {
    const post = { content: "Conteúdo", contentEn: "Content" };
    expect(getLocalizedContent(post, "en")).toBe("Content");
  });

  it("falls back to the default content when contentEn is null", () => {
    const post = { content: "Conteúdo", contentEn: null };
    expect(getLocalizedContent(post, "en")).toBe("Conteúdo");
  });
});
