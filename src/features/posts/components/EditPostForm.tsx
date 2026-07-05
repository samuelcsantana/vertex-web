"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AttachImageButton } from "@/features/posts/components/AttachImageButton";
import { updatePostAction } from "@/features/posts/actions/post-actions";
import {
  createPostFormSchema,
  type CreatePostFormValues,
} from "@/features/posts/schemas/post-schema";
import type { Post } from "@/features/posts/types";

interface EditPostFormProps {
  initialData: Post;
}

const inputClasses =
  "rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none";

export function EditPostForm({ initialData }: EditPostFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostFormSchema),
    defaultValues: {
      title: initialData.title,
      slug: initialData.slug,
      content: initialData.content,
      isPublished: initialData.isPublished,
    },
  });

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
            <AttachImageButton onUploaded={insertImageMarkdown} />
          </div>
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
          {errors.content && (
            <p className="text-sm text-red-400">{errors.content.message}</p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            className="size-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/50"
            {...register("isPublished")}
          />
          Publicado
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
