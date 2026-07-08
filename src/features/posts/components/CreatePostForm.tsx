"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

import { AttachImageButton } from "@/features/posts/components/AttachImageButton";
import { TopicCheckboxGroup } from "@/features/posts/components/TopicCheckboxGroup";
import { CodeBlock } from "@/components/blog-identity/CodeBlock";
import { createPostAction } from "@/features/posts/actions/post-actions";
import {
  createPostFormSchema,
  type CreatePostFormValues,
} from "@/features/posts/schemas/post-schema";
import {
  getPostLanguageFields,
  type PostLanguage,
} from "@/features/posts/utils/post-language-fields";
import type { Topic } from "@/features/topics/types";

interface CreatePostFormProps {
  availableTopics: Topic[];
}

const inputClasses =
  "rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/70 focus:outline-none";

const LANGUAGES: PostLanguage[] = ["pt", "en", "es"];

const LANGUAGE_TAB_LABELS: Record<PostLanguage, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};

const TITLE_LABELS: Record<PostLanguage, string> = {
  pt: "Título",
  en: "Title",
  es: "Título",
};

const CONTENT_LABELS: Record<PostLanguage, string> = {
  pt: "Conteúdo (Markdown)",
  en: "Content (Markdown)",
  es: "Contenido (Markdown)",
};

export function CreatePostForm({ availableTopics }: CreatePostFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"write" | "preview">("write");
  const [activeLanguage, setActiveLanguage] = useState<PostLanguage>("pt");
  const contentTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const t = useTranslations("PostForm");
  const tCommon = useTranslations("Common");

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostFormSchema),
    defaultValues: {
      isPublished: false,
      allowComments: true,
      coverUrl: "",
      coverAlt: "",
      topicIds: [],
    },
  });

  const { titleField, contentField, slugField } =
    getPostLanguageFields(activeLanguage);

  const content = watch(contentField);

  function insertImageMarkdown(markdown: string) {
    const textarea = contentTextareaRef.current;
    const currentValue = getValues(contentField) ?? "";

    if (!textarea) {
      setValue(contentField, `${currentValue}${markdown}`, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    const start = textarea.selectionStart ?? currentValue.length;
    const end = textarea.selectionEnd ?? currentValue.length;
    const nextValue =
      currentValue.slice(0, start) + markdown + currentValue.slice(end);

    setValue(contentField, nextValue, {
      shouldDirty: true,
      shouldValidate: true,
    });

    requestAnimationFrame(() => {
      const cursorPosition = start + markdown.length;
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  }

  async function onSubmit(values: CreatePostFormValues) {
    setServerError(null);

    // Redirects to /dashboard/posts on success (see createPostAction) —
    // this form now lives on its own /dashboard/posts/new page, so there's
    // no listing on the same screen to reset back into.
    const result = await createPostAction(values);

    if (result && !result.success) {
      setServerError(result.error ?? tCommon("genericFormError"));
    }
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
      <h2 className="text-lg font-bold text-white">{t("newArticleHeading")}</h2>
      <p className="mt-1 text-sm text-slate-400">{t("newArticleDescription")}</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 flex flex-col gap-4"
      >
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

        <div className="flex flex-col gap-1.5">
          <label htmlFor={titleField} className="text-sm font-medium text-slate-300">
            {TITLE_LABELS[activeLanguage]}
          </label>
          {/* One persistent <input> per language rather than reusing a
              single element and swapping which field register() binds it
              to — react-hook-form doesn't resync an uncontrolled input's
              DOM value when the field name behind it changes, so swapping
              silently carried over (or wiped) whatever the input last
              displayed. Each field now keeps its own element, own
              registration, and its value never depends on which tab was
              open last; visibility is the only thing that toggles. */}
          {LANGUAGES.map((language) => {
            const field = getPostLanguageFields(language).titleField;
            return (
              <input
                key={field}
                id={field}
                hidden={activeLanguage !== language}
                aria-invalid={!!errors[field]}
                aria-describedby={errors[field] ? `${field}-error` : undefined}
                className={inputClasses}
                {...register(field)}
              />
            );
          })}
          {errors[titleField] && (
            <p id={`${titleField}-error`} role="alert" className="text-sm text-red-400">
              {errors[titleField]?.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={slugField} className="text-sm font-medium text-slate-300">
            {t("slugLabel")}
          </label>
          {LANGUAGES.map((language) => {
            const field = getPostLanguageFields(language).slugField;
            return (
              <input
                key={field}
                id={field}
                placeholder="meu-artigo"
                hidden={activeLanguage !== language}
                aria-invalid={!!errors[field]}
                aria-describedby={errors[field] ? `${field}-error` : undefined}
                className={inputClasses}
                {...register(field)}
              />
            );
          })}
          {/* pt's slug is required; en/es fall back to it when left blank
              (see getLocalizedSlug/findPublishedBySlug) — only show that
              hint on the tabs where it actually applies. */}
          {activeLanguage !== "pt" && (
            <p className="text-xs text-slate-400">{t("slugFallbackHint")}</p>
          )}
          {errors[slugField] && (
            <p id={`${slugField}-error`} role="alert" className="text-sm text-red-400">
              {errors[slugField]?.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor={contentField}
              className="text-sm font-medium text-slate-300"
            >
              {CONTENT_LABELS[activeLanguage]}
            </label>
            {viewMode === "write" && (
              <AttachImageButton onUploaded={insertImageMarkdown} />
            )}
          </div>

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

          {viewMode === "write" ? (
            LANGUAGES.map((language) => {
              const field = getPostLanguageFields(language).contentField;
              const { ref: fieldRef, ...fieldRest } = register(field);
              return (
                <textarea
                  key={field}
                  id={field}
                  rows={12}
                  hidden={activeLanguage !== language}
                  aria-invalid={!!errors[field]}
                  aria-describedby={errors[field] ? `${field}-error` : undefined}
                  className={`${inputClasses} resize-y`}
                  {...fieldRest}
                  ref={(element) => {
                    fieldRef(element);
                    if (activeLanguage === language) {
                      contentTextareaRef.current = element;
                    }
                  }}
                />
              );
            })
          ) : (
            <div
              id={contentField}
              className="prose prose-invert min-h-[19rem] max-w-none rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              {content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{ pre: CodeBlock }}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="text-slate-400">{t("nothingToPreview")}</p>
              )}
            </div>
          )}
          {errors[contentField] && (
            <p
              id={`${contentField}-error`}
              role="alert"
              className="text-sm text-red-400"
            >
              {errors[contentField]?.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="coverUrl" className="text-sm font-medium text-slate-300">
            {t("coverUrlLabel")}
          </label>
          <input
            id="coverUrl"
            placeholder="https://exemplo.com/imagem.jpg"
            aria-invalid={!!errors.coverUrl}
            aria-describedby={errors.coverUrl ? "coverUrl-error" : undefined}
            className={inputClasses}
            {...register("coverUrl")}
          />
          {errors.coverUrl && (
            <p id="coverUrl-error" role="alert" className="text-sm text-red-400">
              {errors.coverUrl.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="coverAlt" className="text-sm font-medium text-slate-300">
            {t("coverAltLabel")}
          </label>
          <input
            id="coverAlt"
            placeholder={t("coverAltPlaceholder")}
            className={inputClasses}
            {...register("coverAlt")}
          />
          <p className="text-xs text-slate-400">{t("coverAltHint")}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="metaDescription"
            className="text-sm font-medium text-slate-300"
          >
            {t("metaDescriptionLabel")}
          </label>
          <textarea
            id="metaDescription"
            rows={2}
            placeholder={t("metaDescriptionPlaceholder")}
            aria-invalid={!!errors.metaDescription}
            aria-describedby={
              errors.metaDescription ? "metaDescription-error" : undefined
            }
            className={`${inputClasses} resize-y`}
            {...register("metaDescription")}
          />
          <p className="text-xs text-slate-400">{t("metaDescriptionHint")}</p>
          {errors.metaDescription && (
            <p
              id="metaDescription-error"
              role="alert"
              className="text-sm text-red-400"
            >
              {errors.metaDescription.message}
            </p>
          )}
        </div>

        <TopicCheckboxGroup control={control} availableTopics={availableTopics} />

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            className="size-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/70"
            {...register("isPublished")}
          />
          {t("publishNow")}
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            className="size-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/70"
            {...register("allowComments")}
          />
          {t("enableComments")}
        </label>

        {serverError && (
          <p role="alert" className="text-sm text-red-400">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.03] disabled:opacity-50 sm:w-fit"
        >
          {isSubmitting ? t("creating") : t("createArticle")}
        </button>
      </form>
    </div>
  );
}
