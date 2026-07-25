"use client";

import { useTranslations } from "next-intl";

import { useActiveHeading } from "@/hooks/useActiveHeading";
import type { Heading } from "@/features/posts/utils/extract-headings";
import { GLASS_CARD } from "@/components/blog-identity/glassStyles";

interface TableOfContentsProps {
  headings: Heading[];
  // Lets callers outside the post page (About) supply their own label —
  // this component is shared, but "Neste artigo" doesn't fit a page that
  // isn't an article, so the Post-specific translation is only a default.
  label?: string;
}

export function TableOfContents({ headings, label }: TableOfContentsProps) {
  const t = useTranslations("Post");
  const activeId = useActiveHeading(headings.map((heading) => heading.id));

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={label ?? t("tableOfContents")}
      className={`hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto ${GLASS_CARD} p-5`}
    >
      <p className="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
        {label ?? t("tableOfContents")}
      </p>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => {
          const isActive = heading.id === activeId;
          return (
            <li key={heading.id} className={heading.level === 3 ? "pl-4" : ""}>
              <a
                href={`#${heading.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`-ml-px block border-l-2 py-0.5 pl-3 transition-colors ${
                  isActive
                    ? "border-emerald-400 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
