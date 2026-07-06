import Link from "next/link";
import { useTranslations } from "next-intl";
import { Compass } from "lucide-react";

import { BlogBackground } from "@/components/blog-identity/BlogBackground";
import { BlogHeader } from "@/components/blog-identity/BlogHeader";
import { BlogFooter } from "@/components/blog-identity/BlogFooter";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className="relative flex min-h-screen flex-col text-slate-300">
      <BlogBackground />
      <BlogHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <p className="text-sm font-semibold tracking-widest text-emerald-400 uppercase">
          {t("errorLabel")}
        </p>
        <h1 className="mt-4 text-5xl font-bold text-white sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-md text-sm text-slate-400 sm:text-base">
          {t("description")}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_20px_-2px_rgba(16,185,129,0.7)] transition-transform hover:scale-[1.03]"
        >
          <Compass className="size-4" />
          {t("goToBlog")}
        </Link>
      </main>
      <BlogFooter />
    </div>
  );
}
