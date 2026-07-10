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
    // Admin-form preview of an arbitrary external URL — next/image would
    // reject hosts outside the configured remotePatterns, so a plain img
    // is the right tool here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={t("coverPreviewAlt")}
      onError={() => setFailedUrl(url)}
      className="mt-1 h-28 w-fit max-w-full rounded-lg border border-slate-700 object-cover"
    />
  );
}
