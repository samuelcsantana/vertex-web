"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Share2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
  url?: string;
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("Post");

  async function handleShare() {
    const shareData = { title, url: url || window.location.href };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log("Compartilhamento cancelado ou falhou", error);
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Could not copy the link", error);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full border border-input bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-input/60 hover:text-primary"
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-primary" />
          {t("linkCopied")}
        </>
      ) : (
        <>
          <Share2 className="size-3.5" />
          {t("share")}
        </>
      )}
    </button>
  );
}
