"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Code2, X } from "lucide-react";

import { useRouter } from "@/i18n/routing";
import { loginAction } from "@/features/auth/actions/auth-actions";
import { useDialogBehavior } from "@/hooks/useDialogBehavior";
import {
  OAUTH_BROADCAST_CHANNEL_NAME,
  OAUTH_SUCCESS_MESSAGE,
} from "@/features/auth/constants";

const API_URL = process.env.NEXT_PUBLIC_VERTEX_API_URL ?? "http://localhost:3333";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

// Best-effort only: Google/GitHub's own OAuth pages send a strict
// Cross-Origin-Opener-Policy header that permanently severs our reference
// to the popup, so popup.closed can misreport `true` immediately even
// though it's genuinely still open (verified with Playwright). This is
// fine here — it only resets the button back to clickable if the visitor
// abandons the popup, it's not what detects a successful login (the
// BroadcastChannel listener below is), so an early false positive is
// harmless.
function watchForAbandonedPopup(
  popup: Window,
  setConnecting: (value: boolean) => void
) {
  const interval = window.setInterval(() => {
    if (popup.closed) {
      window.clearInterval(interval);
      setConnecting(false);
    }
  }, 1000);
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const router = useRouter();
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isConnectingGithub, setIsConnectingGithub] = useState(false);
  const titleId = useId();
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();
  const dialogRef = useDialogBehavior(open, onClose);

  // The /auth/callback page — loaded inside the popup once vertex-api
  // redirects it there with the token after Google/GitHub OAuth — sets the
  // session cookie itself and broadcasts this. Kept mount-scoped (not tied
  // to `open`) so a popup that finishes after the visitor has closed the
  // modal is still picked up.
  useEffect(() => {
    const channel = new BroadcastChannel(OAUTH_BROADCAST_CHANNEL_NAME);

    channel.onmessage = (event) => {
      if (event.data === OAUTH_SUCCESS_MESSAGE) {
        onClose();
        window.location.reload();
      }
    };

    return () => channel.close();
  }, [onClose]);

  if (!open) {
    return null;
  }

  function handleGoogleLogin() {
    if (isConnectingGoogle) {
      return;
    }

    const popup = window.open(
      `${API_URL}/auth/google`,
      "Google OAuth",
      "width=500,height=600,left=200,top=200"
    );

    if (!popup) {
      return;
    }

    setIsConnectingGoogle(true);
    watchForAbandonedPopup(popup, setIsConnectingGoogle);
  }

  function handleGithubLogin() {
    if (isConnectingGithub) {
      return;
    }

    const popup = window.open(
      `${API_URL}/auth/github`,
      "GitHub OAuth",
      "width=500,height=600,left=200,top=200"
    );

    if (!popup) {
      return;
    }

    setIsConnectingGithub(true);
    watchForAbandonedPopup(popup, setIsConnectingGithub);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = await loginAction({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? t("genericLoginError"));
      return;
    }

    onClose();
    router.refresh();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={tCommon("close")}
          className="absolute top-6 right-6 text-slate-400 transition-colors hover:text-slate-200"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <Code2 className="size-6" />
          </div>
          <h2 id={titleId} className="text-xl font-bold text-white">
            {t("loginTitle")}
          </h2>
          <p className="text-sm text-slate-400">{t("loginSubtitle")}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isConnectingGoogle}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-50"
          >
            <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                opacity=".9"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                opacity=".7"
              />
              <path
                fill="currentColor"
                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94z"
                opacity=".5"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {isConnectingGoogle ? t("waitingGoogle") : t("continueWithGoogle")}
          </button>
          <button
            type="button"
            onClick={handleGithubLogin}
            disabled={isConnectingGithub}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-50"
          >
            <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.4-5.25 5.68.42.36.78 1.08.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .3.2.66.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
              />
            </svg>
            {isConnectingGithub ? t("waitingGithub") : t("continueWithGithub")}
          </button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs text-slate-400">{t("orWithEmail")}</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          <label htmlFor={emailId} className="sr-only">
            {t("emailPlaceholder")}
          </label>
          <input
            type="email"
            name="email"
            id={emailId}
            required
            placeholder={t("emailPlaceholder")}
            aria-describedby={error ? errorId : undefined}
            className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
          />
          <label htmlFor={passwordId} className="sr-only">
            {t("passwordPlaceholder")}
          </label>
          <input
            type="password"
            name="password"
            id={passwordId}
            required
            placeholder={t("passwordPlaceholder")}
            aria-describedby={error ? errorId : undefined}
            className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
          />

          {error && (
            <p id={errorId} role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
          >
            {isSubmitting ? t("signingIn") : t("signIn")}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
