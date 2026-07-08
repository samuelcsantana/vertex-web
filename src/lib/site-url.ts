import { headers } from "next/headers";

// Derives the site's absolute origin from the incoming request's Host
// header instead of trusting NEXT_PUBLIC_SITE_URL to exactly match
// whichever domain variant is actually canonical. In production the
// apex domain (samuelsantana.dev) permanently redirects to www
// (www.samuelsantana.dev) — a SITE_URL env var pointing at apex made
// every generated absolute URL (canonical, og:url, og:image via
// metadataBase, sitemap entries) point at a URL that immediately
// redirects elsewhere. Social crawlers (confirmed live with LinkedIn's
// own bot user agent) don't reliably follow that redirect when
// validating og:url, and silently drop the rest of the card — title
// and image survive, description doesn't. Reading the actual Host
// header means these URLs are always self-consistent with whatever
// domain really served the request, regardless of which variant
// NEXT_PUBLIC_SITE_URL happens to be set to.
export async function getSiteUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host");

  if (!host) {
    return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  }

  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}
