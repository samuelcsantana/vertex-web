export interface AboutContent {
  id: string;
  // content is the pt (default-locale) text; en/es are optional
  // translations that fall back to pt — same shape as Post's
  // content/contentEn/contentEs, so posts' localized-content helpers
  // work on this type too.
  content: string;
  contentEn: string | null;
  contentEs: string | null;
  updatedAt: string;
}
