import { format, parseISO, type Locale as DateFnsLocale } from "date-fns";
import { enUS, es, ptBR } from "date-fns/locale";

import type { Locale } from "@/i18n/config";

const DATE_FNS_LOCALES: Record<Locale, DateFnsLocale> = { pt: ptBR, en: enUS, es };

// A pattern per locale, not just a month name per locale: the home cards used "MMMM d, yyyy" for
// every language, which printed "setembro 25, 2026" (English word order, Portuguese words), and
// both the cards and the post page mapped every non-English locale to pt-BR, so the Spanish pages
// read "02 de outubro de 2026".
const PATTERNS: Record<PostDateStyle, Record<Locale, string>> = {
  long: {
    pt: "dd 'de' MMMM 'de' yyyy",
    en: "MMMM dd, yyyy",
    es: "dd 'de' MMMM 'de' yyyy",
  },
  // The grid cards. At four columns a card's text is 202px wide, and "25 de setembro de 2026"
  // next to the reading time broke both onto two lines; "25 set 2026" fits with room for "10 min".
  short: {
    pt: "dd MMM yyyy",
    en: "MMM dd, yyyy",
    es: "dd MMM yyyy",
  },
};

export type PostDateStyle = "long" | "short";

function toLocale(locale: string): Locale {
  return locale in DATE_FNS_LOCALES ? (locale as Locale) : "pt";
}

/**
 * A post's date in the page's own language. `long`: "02 de outubro de 2026", "October 02, 2026",
 * "02 de octubre de 2026". `short`: "02 out 2026", "Oct 02, 2026", "02 oct 2026". Formatted where
 * it renders, on the server, in the server's timezone.
 */
export function formatPostDate(
  isoDate: string,
  locale: string,
  style: PostDateStyle = "long"
): string {
  const pageLocale = toLocale(locale);
  return format(parseISO(isoDate), PATTERNS[style][pageLocale], {
    locale: DATE_FNS_LOCALES[pageLocale],
  });
}
