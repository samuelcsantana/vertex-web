"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { exchangeOAuthCodeAction } from "@/features/auth/actions/auth-actions";
import {
  OAUTH_BROADCAST_CHANNEL_NAME,
  OAUTH_ERROR_MESSAGE_TYPE,
  OAUTH_SUCCESS_MESSAGE,
  type OAuthErrorBroadcast,
} from "@/features/auth/constants";
import { isApiErrorCode } from "@/lib/api-error-codes";

export function OAuthCallbackClient() {
  const searchParams = useSearchParams();
  const t = useTranslations("Auth");
  const tApiErrors = useTranslations("ApiErrors");
  const code = searchParams.get("code");
  const oauthError = searchParams.get("oauth_error");
  const [actionFailed, setActionFailed] = useState(false);

  // vertex-api's GithubPopupExceptionFilter lands here with a
  // machine-readable ?oauth_error=<code> when the OAuth flow fails in a
  // way the visitor needs to hear about (GitHub profile already linked,
  // email owned by a Google account). Relay the code to the opener over
  // the BroadcastChannel — the opener renders it translated into its own
  // locale, which this popup can't know (its URL has no locale prefix) —
  // then close.
  useEffect(() => {
    if (!oauthError) {
      return;
    }

    window.history.replaceState(null, "", window.location.pathname);

    new BroadcastChannel(OAUTH_BROADCAST_CHANNEL_NAME).postMessage({
      type: OAUTH_ERROR_MESSAGE_TYPE,
      code: oauthError,
    } satisfies OAuthErrorBroadcast);

    // Allowed despite COOP severance: a script may close the window it is
    // running in when that window was itself script-opened, which this
    // popup always was.
    window.close();
  }, [oauthError]);

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

  // Fallback text in case window.close() is blocked and the visitor
  // actually reads the popup — the authoritative, locale-correct rendering
  // of the error happens in the opener via the broadcast above.
  const oauthErrorText = oauthError
    ? isApiErrorCode(oauthError)
      ? tApiErrors(oauthError)
      : t("loginFailed")
    : null;

  const failed = (!code && !oauthError) || actionFailed;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-center text-sm text-slate-400">
      {oauthErrorText ?? (failed ? t("loginFailed") : t("completingLogin"))}
    </div>
  );
}
