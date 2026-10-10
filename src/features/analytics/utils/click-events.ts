import type { AnalyticsEvent, Properties } from "@/features/analytics/api/pyxis-client";
import { outboundClicked } from "@/features/analytics/utils/events";
import { outboundHost } from "@/features/analytics/utils/outbound";

export const TRACK_EVENT_ATTRIBUTE = "data-track-event";
export const POST_ATTRIBUTE = "data-post";

const TRACK_PREFIX = "track";
const EVENT_KEY = "trackEvent";
const POST_KEY = "post";
const INTEGER = /^\d+$/;

function propertyName(datasetKey: string): string {
  const name = datasetKey.slice(TRACK_PREFIX.length);
  return name.charAt(0).toLowerCase() + name.slice(1);
}

function propertyValue(value: string): string | number {
  return INTEGER.test(value) ? Number(value) : value;
}

function postOf(element: Element): string | null {
  const holder = element.closest<HTMLElement>(`[${POST_ATTRIBUTE}]`);
  return holder?.dataset.post ?? null;
}

function trackedEvent(element: HTMLElement): AnalyticsEvent | null {
  const name = element.dataset[EVENT_KEY];

  if (!name) return null;

  const properties: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(element.dataset)) {
    if (key === EVENT_KEY || !key.startsWith(TRACK_PREFIX) || value === undefined) continue;
    properties[propertyName(key)] = propertyValue(value);
  }

  if (!(POST_KEY in properties)) {
    const post = postOf(element);
    if (post !== null) properties[POST_KEY] = post;
  }

  return { name, properties: properties as Properties };
}

export function clickEvent(target: Element, currentHostname: string): AnalyticsEvent | null {
  const tracked = target.closest<HTMLElement>(`[${TRACK_EVENT_ATTRIBUTE}]`);

  if (tracked) return trackedEvent(tracked);

  const anchor = target.closest<HTMLAnchorElement>("a[href]");

  if (!anchor) return null;

  const host = outboundHost(anchor.getAttribute("href") ?? "", currentHostname);

  if (host === null) return null;

  return outboundClicked(host, postOf(anchor));
}
