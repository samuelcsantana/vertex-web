"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

import { AttachImageButton } from "@/features/posts/components/AttachImageButton";
import { TopicCheckboxGroup } from "@/features/posts/components/TopicCheckboxGroup";
import { updatePostAction } from "@/features/posts/actions/post-actions";
import {
  createPostFormSchema,
  type CreatePostFormValues,
} from "@/features/posts/schemas/post-schema";
import type { Post } from "@/features/posts/types";
import type { Topic } from "@/features/topics/types";

interface EditPostFormProps {
  initialData: Post;
  availableTopics: Topic[];
}

const inputClasses =
  "rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none";

export function EditPostForm({ initialData, availableTopics }: EditPostFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"write" | "preview">("write");
  const contentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

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
      title: initialData.title,
      slug: initialData.slug,
      content: initialData.content,
      isPublished: initialData.isPublished,
      allowComments: initialData.allowComments,
      coverUrl: initialData.coverUrl ?? "",
      topicIds: initialData.topics.map((topic) => topic.id),
    },
  });

  const content = watch("content");

  const { ref: contentRegisterRef, ...contentRegisterRest } =
    register("content");

  function insertImageMarkdown(markdown: string) {
    const textarea = contentTextareaRef.current;
    const currentValue = getValues("content") ?? "";

    if (!textarea) {
      setValue("content", `${currentValue}${markdown}`, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    const start = textarea.selectionStart ?? currentValue.length;
    const end = textarea.selectionEnd ?? currentValue.length;
    const nextValue =
      currentValue.slice(0, start) + markdown + currentValue.slice(end);

    setValue("content", nextValue, {
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

    const result = await updatePostAction(initialData.id, values);

    if (result && !result.success) {
      setServerError(
        result.error ?? "Something went wrong. Please try again."
      );
    }
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
      <h2 className="text-lg font-bold text-white">Editar artigo</h2>
      <p className="mt-1 text-sm text-slate-400">
        Atualize o conteúdo e o status de publicação.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-medium text-slate-300">
            Título
          </label>
          <input id="title" className={inputClasses} {...register("title")} />
          {errors.title && (
            <p className="text-sm text-red-400">{errors.title.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="slug" className="text-sm font-medium text-slate-300">
            Slug
          </label>
          <input id="slug" className={inputClasses} {...register("slug")} />
          {errors.slug && (
            <p className="text-sm text-red-400">{errors.slug.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="content"
              className="text-sm font-medium text-slate-300"
            >
              Conteúdo (Markdown)
            </label>
            {viewMode === "write" && (
              <AttachImageButton onUploaded={insertImageMarkdown} />
            )}
          </div>

          <div className="flex w-fit items-center gap-1 rounded-full border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setViewMode("write")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === "write"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Escrever
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === "preview"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Visualizar
            </button>
          </div>

          {viewMode === "write" ? (
            <textarea
              id="content"
              rows={12}
              className={`${inputClasses} resize-y`}
              {...contentRegisterRest}
              ref={(element) => {
                contentRegisterRef(element);
                contentTextareaRef.current = element;
              }}
            />
          ) : (
            <div
              id="content"
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
                <p className="text-slate-500">Nada para visualizar ainda.</p>
              )}
            </div>
          )}
          {errors.content && (
            <p className="text-sm text-red-400">{errors.content.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="coverUrl" className="text-sm font-medium text-slate-300">
            Imagem de Capa (URL)
          </label>
          <input
            id="coverUrl"
            placeholder="https://exemplo.com/imagem.jpg"
            className={inputClasses}
            {...register("coverUrl")}
          />
          {errors.coverUrl && (
            <p className="text-sm text-red-400">{errors.coverUrl.message}</p>
          )}
        </div>

        <TopicCheckboxGroup control={control} availableTopics={availableTopics} />

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            className="size-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/50"
            {...register("isPublished")}
          />
          Publicado
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            className="size-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/50"
            {...register("allowComments")}
          />
          Habilitar Comentários
        </label>

        {serverError && <p className="text-sm text-red-400">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-fit rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.03] disabled:opacity-50"
        >
          {isSubmitting ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}
