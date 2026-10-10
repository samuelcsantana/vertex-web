import type { AnalyticsEvent } from "@/features/analytics/api/pyxis-client";
import { type ReadDepth, timeBucket } from "@/features/analytics/utils/read-depth";

export const ARTICLE_VIEWED = "article_viewed";
export const ARTICLE_CARD_CLICKED = "article_card_clicked";
export const TOC_CLICKED = "toc_clicked";
export const SHARE_CLICKED = "share_clicked";
export const CODE_COPIED = "code_copied";
export const OUTBOUND_CLICKED = "outbound_clicked";
export const LANGUAGE_SWITCHED = "language_switched";

export type ShareMethod = "native" | "copy";

export function articleReadEventName(depth: ReadDepth): string {
  return `article_read_${depth}`;
}

export function articleViewed(
  post: string,
  locale: string,
  readingMinutes: number
): AnalyticsEvent {
  return {
    name: ARTICLE_VIEWED,
    properties: { post, locale, reading_minutes: readingMinutes },
  };
}

export function articleRead(
  depth: ReadDepth,
  post: string,
  locale: string,
  seconds: number
): AnalyticsEvent {
  return {
    name: articleReadEventName(depth),
    properties: { post, locale, seconds, time_bucket: timeBucket(seconds) },
  };
}

export function articleCardClicked(
  post: string,
  position: number,
  locale: string
): AnalyticsEvent {
  return { name: ARTICLE_CARD_CLICKED, properties: { post, position, locale } };
}

export function tocClicked(post: string, heading: string): AnalyticsEvent {
  return { name: TOC_CLICKED, properties: { post, heading } };
}

export function shareClicked(post: string, method: ShareMethod): AnalyticsEvent {
  return { name: SHARE_CLICKED, properties: { post, method } };
}

export function codeCopied(post: string): AnalyticsEvent {
  return { name: CODE_COPIED, properties: { post } };
}

export function outboundClicked(host: string, post: string | null): AnalyticsEvent {
  return {
    name: OUTBOUND_CLICKED,
    properties: post === null ? { host } : { host, post },
  };
}

export function languageSwitched(from: string, to: string): AnalyticsEvent {
  return { name: LANGUAGE_SWITCHED, properties: { from, to } };
}
