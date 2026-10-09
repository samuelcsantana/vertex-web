const WEB_PROTOCOLS = new Set(["http:", "https:"]);

export function outboundHost(href: string, currentHostname: string): string | null {
  let url: URL;

  try {
    url = new URL(href, `https://${currentHostname}`);
  } catch {
    return null;
  }

  if (!WEB_PROTOCOLS.has(url.protocol)) return null;
  if (url.hostname === currentHostname) return null;

  return url.hostname;
}
