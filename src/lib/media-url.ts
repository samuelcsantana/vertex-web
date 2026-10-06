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
