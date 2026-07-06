import { useTranslations } from "next-intl";

export function BlogFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-slate-500 sm:px-6">
        {t("copyright", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
