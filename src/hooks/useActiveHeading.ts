import { useEffect, useState } from "react";

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
