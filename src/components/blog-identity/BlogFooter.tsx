import { useTranslations } from "next-intl";

import { SOCIAL_PROFILES } from "@/lib/social-profiles";

export function BlogFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
        <div className="flex items-center gap-4">
          <a
            href={SOCIAL_PROFILES.github}
            rel="me noopener noreferrer"
            target="_blank"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href={SOCIAL_PROFILES.linkedin}
            rel="me noopener noreferrer"
            target="_blank"
            className="transition-colors hover:text-foreground"
          >
            LinkedIn
          </a>
        </div>
        <span>{t("copyright", { year: new Date().getFullYear() })}</span>
      </div>
    </footer>
  );
}
