"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { exchangeOAuthCodeAction } from "@/features/auth/actions/auth-actions";
import {
  OAUTH_BROADCAST_CHANNEL_NAME,
  OAUTH_SUCCESS_MESSAGE,
} from "@/features/auth/constants";

export function OAuthCallbackClient() {
  const searchParams = useSearchParams();
  const t = useTranslations("Auth");
  const code = searchParams.get("code");
  const [actionFailed, setActionFailed] = useState(false);

  useEffect(() => {
    if (!code) {
      return;
    }

    // Strip the code from the URL/history immediately, before the exchange
    // request even goes out: it's single-use and expires within a minute,
    // but there's no reason to leave it sitting in the address bar or a
    // back-button history entry a moment longer than necessary.
    window.history.replaceState(null, "", window.location.pathname);

    exchangeOAuthCodeAction(code)
      .then((result) => {
        if (!result.success) {
          setActionFailed(true);
          return;
        }

        new BroadcastChannel(OAUTH_BROADCAST_CHANNEL_NAME).postMessage(
          OAUTH_SUCCESS_MESSAGE
        );

        // Best-effort: window.opener is normally already null by this point
        // (Google/GitHub's own pages send a strict Cross-Origin-Opener-Policy
        // header that permanently severs it before this popup ever gets
        // here), but this costs nothing to attempt in case it did survive.
        try {
          window.opener?.location.reload();
        } catch {
          // Ignored: a severed/cross-origin opener throws on property access,
          // it doesn't just return null.
        }

        window.close();
      })
      .catch(() => setActionFailed(true));
  }, [code]);

  const failed = !code || actionFailed;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-center text-sm text-slate-400">
      {failed ? t("loginFailed") : t("completingLogin")}
    </div>
  );
}
