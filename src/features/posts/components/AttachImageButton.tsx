"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Paperclip } from "lucide-react";

import { uploadImage } from "@/features/posts/api/upload-image";

interface AttachImageButtonProps {
  onUploaded: (publicUrl: string) => void;
  /** Overrides the default "attach image" label (e.g. for the cover-image use). */
  label?: string;
}

export function AttachImageButton({ onUploaded, label }: AttachImageButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("PostForm");

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
      onUploaded(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("uploadError"));
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
        {isUploading ? t("uploading") : (label ?? t("attachImage"))}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
