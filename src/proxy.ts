import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

const ADMIN_PREFIX = "/admin";
const LOCALE_COOKIE = "NEXT_LOCALE";

// next-intl rewrites the locale cookie to match the URL prefix of every
// request. RSC requests (prefetches and client-side navigations) can land
// after the user has already switched language — e.g. a slow prefetch of
// /es/about finishing after a switch to pt — and would silently flip the
// cookie back. Client-side switches already write the cookie in the browser,
// so only full document loads are allowed to set it from the server.
//
// Next strips the `RSC`/`Next-Router-*` headers and `_rsc` param before the
// proxy runs, so router requests are told apart by `Next-Url` (sent by the
// client router) and the browser's `Sec-Fetch-Dest`.
function isDocumentRequest(request: NextRequest) {
  if (request.headers.has("next-url")) return false;

  const dest = request.headers.get("sec-fetch-dest");
  return dest === null || dest === "document";
}

function stripLocaleCookie(response: NextResponse) {
  const cookies = response.headers.getSetCookie();
  const kept = cookies.filter(
    (cookie) => !cookie.startsWith(`${LOCALE_COOKIE}=`)
  );
  if (kept.length === cookies.length) return;

  response.headers.delete("set-cookie");
  for (const cookie of kept) response.headers.append("set-cookie", cookie);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)) {
    if (!request.cookies.get("access_token")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  const response = handleI18nRouting(request);

  if (!isDocumentRequest(request)) {
    stripLocaleCookie(response);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|embed-demo|micro-frontends|_next|_vercel|.*\\..*).*)"],
};
