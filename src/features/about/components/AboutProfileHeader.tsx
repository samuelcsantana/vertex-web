import Image from "next/image";
import { ArrowUpRight, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

import { CONTACT_EMAIL, SOCIAL_PROFILES } from "@/lib/social-profiles";

// Lucide dropped brand marks a while back (trademark concerns), so GitHub/
// LinkedIn are hand-drawn inline SVGs here rather than lucide-react imports
// — same reasoning as the footer's plain-text links, just with glyphs.
function GithubIcon(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.725-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.084-.729.084-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.42-1.305.763-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.469-2.38 1.236-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.652.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.805 5.624-5.478 5.92.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .32.216.694.825.576C20.565 21.795 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// Just the username — the last path segment — rather than the full
// host+path: with the icon/label already naming the service, "GitHub
// samuelcsantana" reads cleaner than repeating "github.com" too, and
// stays short enough to never need truncation. Derived from
// SOCIAL_PROFILES rather than hardcoded so it can't drift from the
// actual href.
function displayHandle(url: string): string {
  const trimmed = url.replace(/\/$/, "");
  return trimmed.slice(trimmed.lastIndexOf("/") + 1);
}

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: SOCIAL_PROFILES.github,
    handle: displayHandle(SOCIAL_PROFILES.github),
    Icon: GithubIcon,
    external: true,
  },
  {
    label: "LinkedIn",
    href: SOCIAL_PROFILES.linkedin,
    handle: displayHandle(SOCIAL_PROFILES.linkedin),
    Icon: LinkedinIcon,
    external: true,
  },
  {
    label: "Email",
    href: `mailto:${CONTACT_EMAIL}`,
    handle: CONTACT_EMAIL,
    Icon: Mail,
    external: false,
  },
] as const;

// Purely decorative chrome, not a heading — about/page.tsx's own Markdown
// content still owns the page's single real h1 (see the startsWithHeading
// handling there). Keeping the name here as a styled <p>, not an <h1>,
// avoids a second, competing heading in the outline.
export function AboutProfileHeader() {
  const t = useTranslations("About");

  return (
    <div className="group relative rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-[0_8px_30px_rgb(16,185,129,0.03)] backdrop-blur-xl transition-all duration-500 hover:border-white/15 hover:shadow-[0_8px_40px_rgb(16,185,129,0.06)] md:p-8">
      <div className="relative mb-6 size-24">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 opacity-30 blur-md transition-opacity duration-500 group-hover:opacity-60" />
        <div className="relative size-full rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 p-[2px]">
          <Image
            src="/samuel-santana.jpg"
            alt={t("avatarAlt")}
            width={96}
            height={96}
            priority
            className="size-full rounded-[14px] bg-slate-950 object-cover"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs font-semibold text-emerald-400">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          {"<"}
          {t("roleTagline")}
          {" />"}
        </div>

        <p className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          Samuel Santana
        </p>
      </div>

      <hr className="my-6 border-white/5" />

      <div className="space-y-3 font-mono text-sm">
        <span className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
          {"// "}
          {t("connect")}
        </span>

        {SOCIAL_LINKS.map(({ label, href, handle, Icon, external }) => (
          <a
            key={label}
            href={href}
            {...(external ? { target: "_blank", rel: "me noopener noreferrer" } : {})}
            className="group/link flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-slate-300 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:bg-emerald-950/30 focus-visible:outline-none"
          >
            <span className="flex shrink-0 items-center gap-2">
              <Icon className="size-4 text-slate-400 transition-colors group-hover/link:text-emerald-400" />
              {label}
            </span>
            <span className="flex min-w-0 items-center gap-1 text-xs text-slate-500 transition-colors group-hover/link:text-cyan-400">
              <span className="truncate">{handle}</span>
              <ArrowUpRight className="size-3 shrink-0 -translate-x-2 opacity-0 transition-all group-hover/link:translate-x-0 group-hover/link:opacity-100" />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
