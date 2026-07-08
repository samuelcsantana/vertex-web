"use client";

import { useTranslations } from "next-intl";

import { useActiveHeading } from "@/hooks/useActiveHeading";
import type { Heading } from "@/features/posts/utils/extract-headings";

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const t = useTranslations("Post");
  const activeId = useActiveHeading(headings.map((heading) => heading.id));

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={t("tableOfContents")}
      className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
    >
      <p className="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
        {t("tableOfContents")}
      </p>
      <ul className="space-y-2 border-l border-slate-800 text-sm">
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
