export type PostLanguage = "pt" | "en" | "es";

// Maps the active language tab in CreatePostForm/EditPostForm to the
// actual form field names — centralized so both forms (and their tests)
// agree on the same pt/titleEn/titleEs-style naming convention used by
// the API's CreatePostDto/Post entity.
export function getPostLanguageFields(language: PostLanguage) {
  switch (language) {
    case "en":
      return {
        titleField: "titleEn",
        contentField: "contentEn",
        slugField: "slugEn",
        metaDescriptionField: "metaDescriptionEn",
      } as const;
    case "es":
      return {
        titleField: "titleEs",
        contentField: "contentEs",
        slugField: "slugEs",
        metaDescriptionField: "metaDescriptionEs",
      } as const;
    default:
      return {
        titleField: "title",
        contentField: "content",
        slugField: "slug",
        metaDescriptionField: "metaDescription",
      } as const;
  }
}
