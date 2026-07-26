import { useEffect, useRef, useState } from "react";

// Tracks which heading is currently "active" for a scroll-linked sidebar
// nav (<TableOfContents>). The sticky header is ~80px tall, so a heading
// only counts as read once it clears that line; biasing the bottom edge
// to -70% keeps just the top slice of the viewport in play — otherwise
// every heading on a tall screen would register as "visible" at once.
// The last known active id is kept when nothing currently intersects
// (e.g. mid-scroll between two sections), so the highlight doesn't blink
// off between headings.
export function useActiveHeading(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const idsKey = ids.join(",");
  // Timestamp until which the IntersectionObserver/scroll-bottom logic
  // below should defer to whatever syncFromHash last set, instead of
  // overwriting it — see the comment on that effect for why.
  const suppressUntilRef = useRef(0);

  // Clicking a TOC link (a plain <a href="#id">) fires a native
  // hashchange — react to it directly instead of waiting on the
  // IntersectionObserver below. That observer only recognizes a heading
  // once it crosses into a narrow band near the top of the viewport; a
  // short section can land outside that band entirely after the jump
  // (or, on a tall viewport, the *next* section can already be poking
  // into the same band), leaving the highlight on the wrong heading or
  // stuck on whatever was active before the click. This also covers
  // loading the page with a hash already in the URL.
  useEffect(() => {
    if (!idsKey) return;
    const validIds = new Set(idsKey.split(","));

    function syncFromHash() {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (validIds.has(hash)) {
        setActiveId(hash);
        // Long enough to outlast the browser's smooth-scroll landing
        // (html has scroll-behavior: smooth) so the observer doesn't
        // immediately re-decide based on whatever's mid-transit.
        suppressUntilRef.current = Date.now() + 1000;
      }
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [idsKey]);

  useEffect(() => {
    if (!idsKey) return;

    const elements = idsKey
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < suppressUntilRef.current) return;

        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        }

        const firstVisible = idsKey.split(",").find((id) => visible.has(id));
        if (firstVisible) {
          setActiveId(firstVisible);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    );

    for (const element of elements) observer.observe(element);

    // The rootMargin bias above only activates a heading once it nears the
    // top of the viewport — for a short final section, there may not be
    // enough content below it to scroll that far, so it never crosses the
    // line and the highlight gets stuck on an earlier heading. Force the
    // last heading active once the page is scrolled to (or near) its end.
    function handleScrollToBottom() {
      if (Date.now() < suppressUntilRef.current) return;

      const scrolledToBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 4;
      if (scrolledToBottom) {
        setActiveId(elements[elements.length - 1].id);
      }
    }

    window.addEventListener("scroll", handleScrollToBottom, { passive: true });
    handleScrollToBottom();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScrollToBottom);
    };
  }, [idsKey]);

  return activeId;
}
