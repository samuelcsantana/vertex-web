"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface CoverImagePreviewProps {
  url: string;
}

export function CoverImagePreview({ url }: CoverImagePreviewProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const t = useTranslations("PostForm");

  if (!/^https?:\/\//.test(url) || url === failedUrl) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={t("coverPreviewAlt")}
      onError={() => setFailedUrl(url)}
      className="mt-1 h-28 w-fit max-w-full rounded-lg border border-slate-700 object-cover"
    />
  );
}
