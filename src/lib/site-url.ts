const CANONICAL_ORIGIN = "https://www.samuelsantana.dev";

export function resolveSiteUrl(
  nodeEnv: string | undefined,
  override: string | undefined
): string {
  const trimmed = override?.trim();

  if (nodeEnv !== "production" && trimmed) {
    return trimmed.replace(/\/+$/, "");
  }

  return CANONICAL_ORIGIN;
}

export const SITE_URL = resolveSiteUrl(
  process.env.NODE_ENV,
  process.env.NEXT_PUBLIC_SITE_URL
);
