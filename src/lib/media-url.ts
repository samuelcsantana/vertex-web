/**
 * Whether a URL points at our own media bucket (the S3 bucket vertex-api's
 * presigned uploads land in). Only these URLs are safe to hand to next/image:
 * the bucket host is the sole entry in next.config.ts's images.remotePatterns,
 * so any other host would 400 in the optimizer. Cover URLs can also be
 * arbitrary addresses pasted into the form — those keep rendering as a plain
 * <img> (see CoverImage.tsx).
 *
 * Compared via parsed origin + pathname prefix, not startsWith on the raw
 * string, so "https://bucket.example.com.evil.com/x" can't spoof a match.
 */
export function isBucketMediaUrl(
  url: string,
  baseUrl: string | undefined = process.env.NEXT_PUBLIC_MEDIA_BASE_URL
): boolean {
  if (!baseUrl) {
    return false;
  }

  let target: URL;
  let base: URL;

  try {
    target = new URL(url);
    base = new URL(baseUrl);
  } catch {
    return false;
  }

  const basePath = base.pathname.endsWith("/")
    ? base.pathname
    : `${base.pathname}/`;

  return target.origin === base.origin && target.pathname.startsWith(basePath);
}
