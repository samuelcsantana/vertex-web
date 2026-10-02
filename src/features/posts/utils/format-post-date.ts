import { format, parseISO, type Locale as DateFnsLocale } from "date-fns";
import { enUS, es, ptBR } from "date-fns/locale";

import type { Locale } from "@/i18n/config";

const DATE_FNS_LOCALES: Record<Locale, DateFnsLocale> = { pt: ptBR, en: enUS, es };

// A pattern per locale, not just a month name per locale: the home cards used "MMMM d, yyyy" for
// every language, which printed "setembro 25, 2026" (English word order, Portuguese words), and
// both the cards and the post page mapped every non-English locale to pt-BR, so the Spanish pages
// read "02 de outubro de 2026".
const LONG_PATTERNS: Record<Locale, string> = {
  pt: "dd 'de' MMMM 'de' yyyy",
  en: "MMMM dd, yyyy",
  es: "dd 'de' MMMM 'de' yyyy",
};

function toLocale(locale: string): Locale {
  return locale in DATE_FNS_LOCALES ? (locale as Locale) : "pt";
}

/**
 * A post's date in the page's own language: "02 de outubro de 2026", "October 02, 2026",
 * "02 de octubre de 2026". Formatted where it renders, on the server, in the server's timezone.
 */
export function formatPostDate(isoDate: string, locale: string): string {
  const pageLocale = toLocale(locale);
  return format(parseISO(isoDate), LONG_PATTERNS[pageLocale], {
    locale: DATE_FNS_LOCALES[pageLocale],
  });
}
