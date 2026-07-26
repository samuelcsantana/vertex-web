import Image from "next/image";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";

import { CONTACT_EMAIL, SOCIAL_PROFILES } from "@/lib/social-profiles";

// Lucide dropped brand marks a while back (trademark concerns), so GitHub/
// LinkedIn are hand-drawn inline SVGs here rather than lucide-react imports
// — same reasoning as the footer's plain-text links, just with glyphs.
function GithubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.725-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.084-.729.084-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.42-1.305.763-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.469-2.38 1.236-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.652.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.805 5.624-5.478 5.92.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .32.216.694.825.576C20.565 21.795 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// Purely decorative chrome, not a heading — about/page.tsx's own Markdown
// content still owns the page's single real h1 (see the startsWithHeading
// handling there). Keeping the name/role here as plain text avoids a
// second, competing heading in the outline.
export function AboutProfileHeader() {
  const t = useTranslations("About");

  const iconLinkClass =
    "flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800/60 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70";

  return (
    <div className="mb-8 flex flex-col items-center gap-5 rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-center sm:flex-row sm:text-left">
      <Image
        src="/samuel-santana.jpg"
        alt={t("avatarAlt")}
        width={112}
        height={112}
        priority
        className="size-28 shrink-0 rounded-full object-cover ring-2 ring-emerald-500/70"
      />
      <div className="flex flex-col items-center gap-2 sm:items-start">
        <p className="text-2xl font-bold text-white">Samuel Santana</p>
        <p className="text-sm text-slate-400">{t("roleTagline")}</p>
        <div className="mt-1 flex items-center gap-2">
          <a
            href={SOCIAL_PROFILES.github}
            rel="me noopener noreferrer"
            target="_blank"
            aria-label={t("profileGithub")}
            className={iconLinkClass}
          >
            <GithubIcon />
          </a>
          <a
            href={SOCIAL_PROFILES.linkedin}
            rel="me noopener noreferrer"
            target="_blank"
            aria-label={t("profileLinkedin")}
            className={iconLinkClass}
          >
            <LinkedinIcon />
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            aria-label={t("profileEmail")}
            className={iconLinkClass}
          >
            <Mail className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
