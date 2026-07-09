"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { updateAboutContentAction } from "@/features/about/actions/about-actions";
import type { PostLanguage } from "@/features/posts/utils/post-language-fields";

interface EditAboutFormProps {
  initialContent: string;
  initialContentEn: string;
  initialContentEs: string;
}

// Same tab set/labels as CreatePostForm/EditPostForm — each label is
// written in its own language on purpose, so it never needs translating.
const LANGUAGES: PostLanguage[] = ["pt", "en", "es"];

const LANGUAGE_TAB_LABELS: Record<PostLanguage, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};

export function EditAboutForm({
  initialContent,
  initialContentEn,
  initialContentEs,
}: EditAboutFormProps) {
  const contentId = useId();
  const [contents, setContents] = useState<Record<PostLanguage, string>>({
    pt: initialContent,
    en: initialContentEn,
    es: initialContentEs,
  });
  const [activeLanguage, setActiveLanguage] = useState<PostLanguage>("pt");
  const [viewMode, setViewMode] = useState<"write" | "preview">("write");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const t = useTranslations("PostForm");
  const tAbout = useTranslations("About");
  const tCommon = useTranslations("Common");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await updateAboutContentAction({
      content: contents.pt,
      contentEn: contents.en,
      contentEs: contents.es,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? tCommon("genericFormError"));
      return;
    }

    setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <div className="flex w-fit items-center gap-1 rounded-full border border-slate-800 bg-slate-950 p-1">
          {LANGUAGES.map((language) => (
            <button
              key={language}
              type="button"
              onClick={() => setActiveLanguage(language)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeLanguage === language
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {LANGUAGE_TAB_LABELS[language]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={contentId} className="text-sm font-medium text-slate-300">
          {tAbout("contentLabel")}
        </label>
        <div className="overflow-x-auto">
          <div className="flex w-fit items-center gap-1 rounded-full border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setViewMode("write")}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === "write"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t("write")}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === "preview"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t("preview")}
            </button>
          </div>
        </div>
      </div>

      {viewMode === "write" ? (
        // A single controlled textarea whose value swaps with the active
        // tab (unlike EditPostForm's one-element-per-language workaround,
        // which exists because react-hook-form's register() leaves the
        // element uncontrolled — plain controlled state has no such
        // resync problem).
        <textarea
          id={contentId}
          value={contents[activeLanguage]}
          onChange={(event) =>
            setContents((prev) => ({
              ...prev,
              [activeLanguage]: event.target.value,
            }))
          }
          rows={20}
          className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/70 focus:outline-none"
        />
      ) : (
        <div className="prose prose-invert min-h-[19rem] max-w-none rounded-xl border border-slate-800 bg-slate-950 p-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {contents[activeLanguage]}
          </ReactMarkdown>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-emerald-400">
          {tAbout("contentSaved")}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !contents.pt.trim()}
        className="w-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.03] disabled:opacity-50 sm:w-fit"
      >
        {isSubmitting ? t("saving") : t("saveChanges")}
      </button>
    </form>
  );
}
