import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME } from "@/i18n/config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value || DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
