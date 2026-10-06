export type PostLanguage = "pt" | "en" | "es";

export function getPostLanguageFields(language: PostLanguage) {
  switch (language) {
    case "en":
      return {
        titleField: "titleEn",
        contentField: "contentEn",
        slugField: "slugEn",
        metaDescriptionField: "metaDescriptionEn",
        coverUrlField: "coverUrlEn",
        coverAltField: "coverAltEn",
      } as const;
    case "es":
      return {
        titleField: "titleEs",
        contentField: "contentEs",
        slugField: "slugEs",
        metaDescriptionField: "metaDescriptionEs",
        coverUrlField: "coverUrlEs",
        coverAltField: "coverAltEs",
      } as const;
    default:
      return {
        titleField: "title",
        contentField: "content",
        slugField: "slug",
        metaDescriptionField: "metaDescription",
        coverUrlField: "coverUrl",
        coverAltField: "coverAlt",
      } as const;
  }
}
