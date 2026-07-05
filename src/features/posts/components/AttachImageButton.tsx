"use client";

import { useRef, useState } from "react";
import { Paperclip } from "lucide-react";

import { uploadImage } from "@/features/posts/api/upload-image";

interface AttachImageButtonProps {
  onUploaded: (markdown: string) => void;
}

export function AttachImageButton({ onUploaded }: AttachImageButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset the input so selecting the same file again still fires onChange.
    event.target.value = "";

    if (!file) {
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const publicUrl = await uploadImage(file);
      onUploaded(`\n![Imagem](${publicUrl})\n`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Falha ao enviar a imagem."
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:text-emerald-400 disabled:opacity-50"
      >
        <Paperclip className="size-3.5" />
        {isUploading ? "Enviando..." : "Anexar Imagem"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
