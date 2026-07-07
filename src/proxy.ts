import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

// Gated routes are matched against the pathname with its locale prefix
// stripped, since "as-needed" means /dashboard (pt, the default) has no
// prefix but /en/dashboard and /es/dashboard do.
const LOCALE_PREFIX_PATTERN = new RegExp(
  `^/(${routing.locales.filter((locale) => locale !== routing.defaultLocale).join("|")})(?=/|$)`
);

function stripLocalePrefix(pathname: string) {
  const match = pathname.match(LOCALE_PREFIX_PATTERN);

  if (!match) {
    return { localePrefix: "", pathWithoutLocale: pathname };
  }

  const localePrefix = match[0];
  return {
    localePrefix,
    pathWithoutLocale: pathname.slice(localePrefix.length) || "/",
  };
}

export function proxy(request: NextRequest) {
  const { localePrefix, pathWithoutLocale } = stripLocalePrefix(
    request.nextUrl.pathname
  );

  const isGatedRoute =
    pathWithoutLocale.startsWith("/dashboard") ||
    pathWithoutLocale === "/profile";

  if (isGatedRoute && !request.cookies.get("access_token")) {
    return NextResponse.redirect(new URL(localePrefix || "/", request.url));
  }

  return handleI18nRouting(request);
}

export const config = {
  // "auth" is excluded so OAuth popup requests (proxied straight through to
  // vertex-api by the rewrite in next.config.ts) never get caught by
  // next-intl's locale negotiation — a visitor with a non-default locale
  // preference could otherwise get /auth/google redirected to /en/auth/google,
  // which the rewrite's "/auth/:path*" source would no longer match.
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
