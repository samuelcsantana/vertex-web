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
import { createPostAction } from "@/features/posts/actions/post-actions";
import {
  createPostFormSchema,
  type CreatePostFormValues,
} from "@/features/posts/schemas/post-schema";
import type { Topic } from "@/features/topics/types";

interface CreatePostFormProps {
  availableTopics: Topic[];
}

const inputClasses =
  "rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/70 focus:outline-none";

export function CreatePostForm({ availableTopics }: CreatePostFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"write" | "preview">("write");
  const [activeLanguage, setActiveLanguage] = useState<"pt" | "en">("pt");
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
    reset,
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

  const titleField = activeLanguage === "en" ? "titleEn" : "title";
  const contentField = activeLanguage === "en" ? "contentEn" : "content";

  const content = watch(contentField);

  const { ref: contentRegisterRef, ...contentRegisterRest } =
    register(contentField);

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

    const result = await createPostAction(values);

    if (!result.success) {
      setServerError(result.error ?? tCommon("genericFormError"));
      return;
    }

    reset();
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
            <button
              type="button"
              onClick={() => setActiveLanguage("pt")}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeLanguage === "pt"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Português
            </button>
            <button
              type="button"
              onClick={() => setActiveLanguage("en")}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeLanguage === "en"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              English
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={titleField} className="text-sm font-medium text-slate-300">
            {activeLanguage === "en" ? "Title" : "Título"}
          </label>
          <input
            id={titleField}
            aria-invalid={!!errors[titleField]}
            aria-describedby={errors[titleField] ? `${titleField}-error` : undefined}
            className={inputClasses}
            {...register(titleField)}
          />
          {errors[titleField] && (
            <p id={`${titleField}-error`} role="alert" className="text-sm text-red-400">
              {errors[titleField]?.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="slug" className="text-sm font-medium text-slate-300">
            {t("slugLabel")}
          </label>
          <input
            id="slug"
            placeholder="meu-artigo"
            aria-invalid={!!errors.slug}
            aria-describedby={errors.slug ? "slug-error" : undefined}
            className={inputClasses}
            {...register("slug")}
          />
          {errors.slug && (
            <p id="slug-error" role="alert" className="text-sm text-red-400">
              {errors.slug.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor={contentField}
              className="text-sm font-medium text-slate-300"
            >
              {activeLanguage === "en" ? "Content (Markdown)" : "Conteúdo (Markdown)"}
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
            <textarea
              id={contentField}
              rows={12}
              aria-invalid={!!errors[contentField]}
              aria-describedby={
                errors[contentField] ? `${contentField}-error` : undefined
              }
              className={`${inputClasses} resize-y`}
              {...contentRegisterRest}
              ref={(element) => {
                contentRegisterRef(element);
                contentTextareaRef.current = element;
              }}
            />
          ) : (
            <div
              id={contentField}
              className="prose prose-invert min-h-[19rem] max-w-none rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              {content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
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
