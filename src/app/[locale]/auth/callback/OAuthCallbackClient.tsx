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

  useEffect(() => {
    if (!oauthError) {
      return;
    }

    window.history.replaceState(null, "", window.location.pathname);

    new BroadcastChannel(OAUTH_BROADCAST_CHANNEL_NAME).postMessage({
      type: OAUTH_ERROR_MESSAGE_TYPE,
      code: oauthError,
    } satisfies OAuthErrorBroadcast);

    window.close();
  }, [oauthError]);

  useEffect(() => {
    if (!code) {
      return;
    }

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

        try {
          window.opener?.location.reload();
        } catch {
        }

        window.close();
      })
      .catch(() => setActionFailed(true));
  }, [code]);

  const oauthErrorText = oauthError
    ? isApiErrorCode(oauthError)
      ? tApiErrors(oauthError)
      : t("loginFailed")
    : null;

  const failed = (!code && !oauthError) || actionFailed;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center text-sm text-muted-foreground">
      {oauthErrorText ?? (failed ? t("loginFailed") : t("completingLogin"))}
    </div>
  );
}
