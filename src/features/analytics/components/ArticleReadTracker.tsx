"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { track } from "@/features/analytics/api/pyxis-client";
import { articleRead, articleViewed } from "@/features/analytics/utils/events";
import {
  createVisibleClock,
  READ_DEPTHS,
  type ReadDepth,
} from "@/features/analytics/utils/read-depth";

interface ArticleReadTrackerProps {
  post: string;
  locale: string;
  readingMinutes: number;
  children: ReactNode;
}

export function ArticleReadTracker({
  post,
  locale,
  readingMinutes,
  children,
}: ArticleReadTrackerProps) {
  const sentinels = useRef(new Map<Element, ReadDepth>());
  const viewedPost = useRef<string | null>(null);

  useEffect(() => {
    if (viewedPost.current !== post) {
      viewedPost.current = post;
      track(articleViewed(post, locale, readingMinutes));
    }

    const clock = createVisibleClock(() => Date.now(), !document.hidden);
    const onVisibilityChange = () => {
      if (document.hidden) clock.hide();
      else clock.show();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const reached = new Set<ReadDepth>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const depth = sentinels.current.get(entry.target);

        if (depth === undefined || reached.has(depth)) continue;

        reached.add(depth);
        observer.unobserve(entry.target);
        track(articleRead(depth, post, locale, clock.elapsedSeconds()));
      }
    });
    for (const element of sentinels.current.keys()) observer.observe(element);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [post, locale, readingMinutes]);

  return (
    <div className="relative">
      {children}
      {READ_DEPTHS.map((depth) => (
        <span
          key={depth}
          aria-hidden="true"
          data-read-depth={depth}
          className="pointer-events-none absolute left-0 h-px w-px"
          style={{ top: `${depth}%` }}
          ref={(element) => {
            if (element === null) return;
            const registry = sentinels.current;
            registry.set(element, depth);
            return () => {
              registry.delete(element);
            };
          }}
        />
      ))}
    </div>
  );
}
