"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { updateAboutContentAction } from "@/features/about/actions/about-actions";

interface EditAboutFormProps {
  initialContent: string;
}

export function EditAboutForm({ initialContent }: EditAboutFormProps) {
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState<"write" | "preview">("write");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await updateAboutContentAction(content);

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">
          Conteúdo (Markdown)
        </span>
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
      </div>

      {viewMode === "write" ? (
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={20}
          className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
        />
      ) : (
        <div className="prose prose-invert min-h-[19rem] max-w-none rounded-xl border border-slate-800 bg-slate-950 p-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && (
        <p className="text-sm text-emerald-400">Conteúdo salvo com sucesso.</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="w-fit rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.03] disabled:opacity-50"
      >
        {isSubmitting ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
