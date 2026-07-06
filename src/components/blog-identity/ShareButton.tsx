"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
  url?: string;
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

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
      console.log("Não foi possível copiar o link", error);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm transition-colors hover:border-emerald-500/30 hover:bg-slate-700/60 hover:text-emerald-400"
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-emerald-400" />
          Link copiado!
        </>
      ) : (
        <>
          <Share2 className="size-3.5" />
          Compartilhar
        </>
      )}
    </button>
  );
}
