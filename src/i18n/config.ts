export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
export const LOCALES = ["pt", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "pt";

export function isValidLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}
