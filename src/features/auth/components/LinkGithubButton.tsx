"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";

import { checkGithubLinkedAction } from "@/features/auth/actions/auth-actions";
import {
  isOAuthErrorBroadcast,
  OAUTH_BROADCAST_CHANNEL_NAME,
} from "@/features/auth/constants";
import { isApiErrorCode } from "@/lib/api-error-codes";

const API_URL = process.env.NEXT_PUBLIC_VERTEX_API_URL ?? "http://localhost:3333";

interface LinkGithubButtonProps {
  githubLinked: boolean;
}

export function LinkGithubButton({ githubLinked }: LinkGithubButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const t = useTranslations("Profile");
  const tCommon = useTranslations("Common");
  const tApiErrors = useTranslations("ApiErrors");

  function stopPolling() {
    if (pollTimerRef.current !== null) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }

  // A failed link flow ends with the popup broadcasting a machine-readable
  // error code (relayed from vertex-api's GithubPopupExceptionFilter via
  // /auth/callback?oauth_error=...) — the popup itself can't translate it,
  // this component can. Mount-scoped like LoginModal's listener, and also
  // what stops the success-polling below early instead of letting it run
  // out its 15-minute backstop against a popup that already failed.
  useEffect(() => {
    const channel = new BroadcastChannel(OAUTH_BROADCAST_CHANNEL_NAME);

    channel.onmessage = (event) => {
      if (isOAuthErrorBroadcast(event.data)) {
        stopPolling();
        setIsConnecting(false);
        setError(
          isApiErrorCode(event.data.code)
            ? tApiErrors(event.data.code)
            : tCommon("genericFormError")
        );
      }
    };

    return () => {
      channel.close();
      stopPolling();
    };
  }, [tApiErrors, tCommon]);

  function handleLinkGithub() {
    if (isConnecting) {
      return;
    }

    const popup = window.open(
      `${API_URL}/auth/github/link`,
      "Link GitHub",
      "width=500,height=600,left=200,top=200"
    );

    if (!popup) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    let attempts = 0;
    // Same rationale as LoginModal's OAuth polling: once the popup hits
    // GitHub's own pages, COOP severs it from us and makes popup.closed
    // misreport `true` immediately even though it's genuinely still open
    // (verified with Playwright). So popup.closed is never used as a
    // give-up signal — only the elapsed-time backstop below can trigger it.
    const maxAttempts = 900; // give up after ~15 minutes of polling
    let checking = false;

    pollTimerRef.current = window.setInterval(async () => {
      attempts += 1;

      if (checking) {
        return;
      }
      checking = true;
      const linked = await checkGithubLinkedAction();
      checking = false;

      if (linked) {
        stopPolling();
        try {
          // Best-effort: this reliably no-ops once COOP has severed the
          // popup, so it can't be relied on to ever actually close it.
          popup.close();
        } catch {
          // Ignored: same COOP severance as above.
        }
        setIsConnecting(false);
        window.location.reload();
        return;
      }

      if (attempts >= maxAttempts) {
        stopPolling();
        setIsConnecting(false);
        console.warn(
          "GitHub link polling gave up without detecting a linked account; reload the page if linking actually succeeded."
        );
      }
    }, 1000);
  }

  if (githubLinked) {
    return (
      <div className="flex w-fit items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400">
        <CheckCircle2 className="size-4" />
        {t("githubConnected")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleLinkGithub}
        disabled={isConnecting}
        className="flex w-fit items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-50"
      >
        {isConnecting ? t("connecting") : t("connectGithub")}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
