"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";

import { checkGoogleLinkedAction } from "@/features/auth/actions/auth-actions";
import {
  isOAuthErrorBroadcast,
  OAUTH_BROADCAST_CHANNEL_NAME,
} from "@/features/auth/constants";
import { isApiErrorCode } from "@/lib/api-error-codes";

const API_URL = process.env.NEXT_PUBLIC_VERTEX_API_URL ?? "http://localhost:3333";

interface LinkGoogleButtonProps {
  googleLinked: boolean;
}

// Mirror of LinkGithubButton — see that component for the COOP/polling
// rationale comments; the mechanics are identical, only the provider
// endpoints and linked-state check differ.
export function LinkGoogleButton({ googleLinked }: LinkGoogleButtonProps) {
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

  function handleLinkGoogle() {
    if (isConnecting) {
      return;
    }

    const popup = window.open(
      `${API_URL}/auth/google/link`,
      "Link Google",
      "width=500,height=600,left=200,top=200"
    );

    if (!popup) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    let attempts = 0;
    const maxAttempts = 900; // give up after ~15 minutes of polling
    let checking = false;

    pollTimerRef.current = window.setInterval(async () => {
      attempts += 1;

      if (checking) {
        return;
      }
      checking = true;
      const linked = await checkGoogleLinkedAction();
      checking = false;

      if (linked) {
        stopPolling();
        try {
          popup.close();
        } catch {
          // Ignored: COOP severance (see LinkGithubButton).
        }
        setIsConnecting(false);
        window.location.reload();
        return;
      }

      if (attempts >= maxAttempts) {
        stopPolling();
        setIsConnecting(false);
        console.warn(
          "Google link polling gave up without detecting a linked account; reload the page if linking actually succeeded."
        );
      }
    }, 1000);
  }

  if (googleLinked) {
    return (
      <div className="flex w-fit items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400">
        <CheckCircle2 className="size-4" />
        {t("googleConnected")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleLinkGoogle}
        disabled={isConnecting}
        className="flex w-fit items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-50"
      >
        {isConnecting ? t("connecting") : t("connectGoogle")}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
