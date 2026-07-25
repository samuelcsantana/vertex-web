import { useTranslations } from "next-intl";

import { SOCIAL_PROFILES } from "@/lib/social-profiles";

export function BlogFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center text-sm text-slate-400 sm:px-6">
        {/* rel="me" is what lets GitHub verify this site as this account's
            own website (Settings > Public profile > Social accounts),
            showing a checkmark next to the link there — the reciprocal,
            off-site half of the sameAs signal in the Person JSON-LD
            (about/page.tsx, blog/[slug]/page.tsx) that helps search
            engines tell this person's profiles apart from same-named
            people's. */}
        <div className="flex items-center gap-4">
          <a
            href={SOCIAL_PROFILES.github}
            rel="me noopener noreferrer"
            target="_blank"
            className="transition-colors hover:text-white"
          >
            GitHub
          </a>
          <a
            href={SOCIAL_PROFILES.linkedin}
            rel="me noopener noreferrer"
            target="_blank"
            className="transition-colors hover:text-white"
          >
            LinkedIn
          </a>
        </div>
        <span>{t("copyright", { year: new Date().getFullYear() })}</span>
      </div>
    </footer>
  );
}
