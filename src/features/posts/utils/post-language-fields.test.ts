import { describe, expect, it } from "vitest";

import { getPostLanguageFields } from "./post-language-fields";

describe("getPostLanguageFields", () => {
  it("returns the default (pt) field names for pt", () => {
    expect(getPostLanguageFields("pt")).toEqual({
      titleField: "title",
      contentField: "content",
      slugField: "slug",
      metaDescriptionField: "metaDescription",
    });
  });

  it("returns the En-suffixed field names for en", () => {
    expect(getPostLanguageFields("en")).toEqual({
      titleField: "titleEn",
      contentField: "contentEn",
      slugField: "slugEn",
      metaDescriptionField: "metaDescriptionEn",
    });
  });

  it("returns the Es-suffixed field names for es", () => {
    expect(getPostLanguageFields("es")).toEqual({
      titleField: "titleEs",
      contentField: "contentEs",
      slugField: "slugEs",
      metaDescriptionField: "metaDescriptionEs",
    });
  });
});
