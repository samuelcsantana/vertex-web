// The one origin every absolute URL in this app is built from: canonical
// links, og:url, the root layout's metadataBase, sitemap entries, robots'
// sitemap pointer and the JSON-LD @id fields.
//
// It is a constant in the repository rather than a value read per request
// or per deployment, for two independent reasons.
//
// Correctness. Production serves www; the apex (samuelsantana.dev) answers
// with a permanent redirect to it. When this origin came from an env var
// pointing at the apex, every absolute URL the app generated pointed at a
// URL that immediately redirected somewhere else, and LinkedIn's crawler
// (confirmed live against its own user agent) silently dropped og:description
// while validating og:url — the title and image survived, so the card looked
// almost right. Reading the request's Host header fixed that by making the
// URLs self-consistent with whatever domain served them, but the actual
// defect was a value that could disagree with the domain, and a constant
// next to the code cannot drift the way a dashboard setting can.
//
// Renderability. Host lives on the request, so reading it is a dynamic API:
// every page needing an absolute URL was re-rendered per request purely to
// learn its own domain — including /about, which has no per-request data at
// all. The canonical origin is a build-time fact, and treating it as one is
// what lets these pages be prerendered.
//
// Preview deployments therefore report the production origin instead of
// their own *.vercel.app host. That is deliberate: a preview that
// self-references invites search engines to index it as a second copy of
// the site, while one pointing at production consolidates back to the real
// page. The cost is that a preview's canonical describes a page other than
// the one on screen — so verifying a preview means asking "is this the right
// origin?", never "does it match the host I'm on?".
const CANONICAL_ORIGIN = "https://www.samuelsantana.dev";

/**
 * Resolves the site origin from the build environment.
 *
 * The override is honored outside production builds only, so that local
 * development can point absolute URLs at localhost while no missing,
 * stale or misspelled deployment variable can ever decide what the
 * published site calls itself. The previous shape of this code fell back
 * to `http://localhost:3000` whenever the variable was unset, which meant
 * a deploy landing before the variable did would publish canonical and
 * og:url pointing at localhost — worse than the bug it replaced, and
 * silent. Ignoring the override in production removes that failure mode
 * rather than documenting it.
 *
 * Exported for tests; application code reads {@link SITE_URL}.
 */
export function resolveSiteUrl(
  nodeEnv: string | undefined,
  override: string | undefined
): string {
  const trimmed = override?.trim();

  if (nodeEnv !== "production" && trimmed) {
    // A trailing slash would double up against the leading slash of every
    // pathname concatenated onto this.
    return trimmed.replace(/\/+$/, "");
  }

  return CANONICAL_ORIGIN;
}

export const SITE_URL = resolveSiteUrl(
  process.env.NODE_ENV,
  process.env.NEXT_PUBLIC_SITE_URL
);
