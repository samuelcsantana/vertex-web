import { describe, expect, it } from "vitest";

import {
  getLocalizedContent,
  getLocalizedSlug,
  getLocalizedTitle,
} from "./localized-content";

describe("getLocalizedTitle", () => {
  it("returns the English title when locale is en and titleEn is set", () => {
    const post = { title: "Título", titleEn: "Title", titleEs: null };
    expect(getLocalizedTitle(post, "en")).toBe("Title");
  });

  it("falls back to the default title when locale is en but titleEn is null", () => {
    const post = { title: "Título", titleEn: null, titleEs: null };
    expect(getLocalizedTitle(post, "en")).toBe("Título");
  });

  it("returns the default title for pt regardless of titleEn/titleEs", () => {
    const post = { title: "Título", titleEn: "Title", titleEs: "Título ES" };
    expect(getLocalizedTitle(post, "pt")).toBe("Título");
  });

  it("returns the Spanish title when locale is es and titleEs is set", () => {
    const post = { title: "Título", titleEn: "Title", titleEs: "Título ES" };
    expect(getLocalizedTitle(post, "es")).toBe("Título ES");
  });

  it("falls back to the default title when locale is es but titleEs is null", () => {
    const post = { title: "Título", titleEn: "Title", titleEs: null };
    expect(getLocalizedTitle(post, "es")).toBe("Título");
  });
});

describe("getLocalizedContent", () => {
  it("returns the English content when locale is en and contentEn is set", () => {
    const post = { content: "Conteúdo", contentEn: "Content", contentEs: null };
    expect(getLocalizedContent(post, "en")).toBe("Content");
  });

  it("falls back to the default content when contentEn is null", () => {
    const post = { content: "Conteúdo", contentEn: null, contentEs: null };
    expect(getLocalizedContent(post, "en")).toBe("Conteúdo");
  });

  it("returns the Spanish content when locale is es and contentEs is set", () => {
    const post = {
      content: "Conteúdo",
      contentEn: null,
      contentEs: "Contenido",
    };
    expect(getLocalizedContent(post, "es")).toBe("Contenido");
  });

  it("falls back to the default content when contentEs is null", () => {
    const post = { content: "Conteúdo", contentEn: null, contentEs: null };
    expect(getLocalizedContent(post, "es")).toBe("Conteúdo");
  });
});

describe("getLocalizedSlug", () => {
  it("returns the English slug when locale is en and slugEn is set", () => {
    const post = { slug: "cafe-com-leite", slugEn: "coffee-with-milk", slugEs: null };
    expect(getLocalizedSlug(post, "en")).toBe("coffee-with-milk");
  });

  it("falls back to the default slug when slugEn is null", () => {
    const post = { slug: "cafe-com-leite", slugEn: null, slugEs: null };
    expect(getLocalizedSlug(post, "en")).toBe("cafe-com-leite");
  });

  it("returns the Spanish slug when locale is es and slugEs is set", () => {
    const post = {
      slug: "cafe-com-leite",
      slugEn: null,
      slugEs: "cafe-con-leche",
    };
    expect(getLocalizedSlug(post, "es")).toBe("cafe-con-leche");
  });

  it("falls back to the default slug when slugEs is null", () => {
    const post = { slug: "cafe-com-leite", slugEn: null, slugEs: null };
    expect(getLocalizedSlug(post, "es")).toBe("cafe-com-leite");
  });

  it("returns the default slug for pt regardless of slugEn/slugEs", () => {
    const post = {
      slug: "cafe-com-leite",
      slugEn: "coffee-with-milk",
      slugEs: "cafe-con-leche",
    };
    expect(getLocalizedSlug(post, "pt")).toBe("cafe-com-leite");
  });
});
