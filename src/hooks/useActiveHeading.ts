import { useEffect, useState } from "react";

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
