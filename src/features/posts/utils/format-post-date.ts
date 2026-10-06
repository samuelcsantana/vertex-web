import { format, parseISO, type Locale as DateFnsLocale } from "date-fns";
import { enUS, es, ptBR } from "date-fns/locale";

import type { Locale } from "@/i18n/config";

const DATE_FNS_LOCALES: Record<Locale, DateFnsLocale> = { pt: ptBR, en: enUS, es };

const PATTERNS: Record<PostDateStyle, Record<Locale, string>> = {
  long: {
    pt: "dd 'de' MMMM 'de' yyyy",
    en: "MMMM dd, yyyy",
    es: "dd 'de' MMMM 'de' yyyy",
  },
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
