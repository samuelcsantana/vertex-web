"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";
import type { Components } from "react-markdown";

// react-markdown only wraps fenced code blocks in <pre><code>; inline code
// (`foo`) renders as a bare <code> with no <pre>, so mapping "pre" (not
// "code") keeps the copy button off single-word inline snippets. Reading
// textContent off the rendered <pre> — rather than walking the "children"
// prop — sidesteps rehype-highlight's <span> wrapping around every token.
export const CodeBlock: Components["pre"] = (props) => {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const t = useTranslations("Common");

  async function handleCopy() {
    // highlight.js/rehype-highlight always leave a trailing newline before
    // </code> (from the fenced block's closing ``` line) — trim it so a
    // paste doesn't end in a stray blank line.
    const code = (preRef.current?.textContent ?? "").trimEnd();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.log("Unable to copy code", error);
    }
  }

  return (
    <div className="group relative">
      <pre ref={preRef} {...props} />
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? t("codeCopied") : t("copyCode")}
        className="absolute top-2 right-2 inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 backdrop-blur-sm transition-colors hover:border-emerald-500/30 hover:text-emerald-400 focus:ring-2 focus:ring-emerald-500/70 focus:outline-none"
      >
        {copied ? (
          <Check className="size-3.5 text-emerald-400" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </button>
    </div>
  );
};
