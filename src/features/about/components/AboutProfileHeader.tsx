import Image from "next/image";
import { useTranslations } from "next-intl";

import { CONTACT_EMAIL, SOCIAL_PROFILES } from "@/lib/social-profiles";

// Strips the scheme (and LinkedIn's trailing slash) so the chip shows the
// same host+path a visitor would type, e.g. "github.com/samuelcsantana" —
// derived from SOCIAL_PROFILES rather than hardcoded so it can't drift
// from the actual href.
function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

// Purely decorative chrome, not a heading — about/page.tsx's own Markdown
// content still owns the page's single real h1 (see the startsWithHeading
// handling there). Keeping the name/role here as plain text avoids a
// second, competing heading in the outline.
export function AboutProfileHeader() {
  const t = useTranslations("About");

  const chipClass =
    "rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70";

  return (
    <div className="mb-12 flex flex-col items-center gap-7 text-center sm:flex-row sm:text-left">
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
        <span className="w-fit rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-300">
          {t("roleTagline")}
        </span>
        <div className="mt-1 flex flex-wrap justify-center gap-2 sm:justify-start">
          <a
            href={SOCIAL_PROFILES.github}
            rel="me noopener noreferrer"
            target="_blank"
            aria-label={t("profileGithub")}
            className={chipClass}
          >
            {displayUrl(SOCIAL_PROFILES.github)}
          </a>
          <a
            href={SOCIAL_PROFILES.linkedin}
            rel="me noopener noreferrer"
            target="_blank"
            aria-label={t("profileLinkedin")}
            className={chipClass}
          >
            {displayUrl(SOCIAL_PROFILES.linkedin)}
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            aria-label={t("profileEmail")}
            className={chipClass}
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
}
