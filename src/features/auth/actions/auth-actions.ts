"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { z } from "zod";

import { redirect } from "@/i18n/routing";
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/login-schema";
import { getProfile } from "@/features/auth/api/profile-service";
import {
  apiErrorMessage,
  apiErrorsTranslator,
} from "@/lib/api-error-message";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

// Matches the `cookie` securityScheme name declared in the Vertex API's
// OpenAPI spec (components.securitySchemes.cookie.name).
const AUTH_COOKIE_NAME = "access_token";

interface LoginActionResult {
  success: boolean;
  error?: string;
}

function parseSetCookieHeader(setCookieValue: string) {
  const [cookiePair, ...attributePairs] = setCookieValue.split(";");
  const separatorIndex = cookiePair.indexOf("=");

  if (separatorIndex === -1) {
    return null;
  }

  const maxAgeAttribute = attributePairs
    .map((attribute) => attribute.trim())
    .find((attribute) => attribute.toLowerCase().startsWith("max-age="));

  return {
    name: cookiePair.slice(0, separatorIndex).trim(),
    value: decodeURIComponent(cookiePair.slice(separatorIndex + 1).trim()),
    maxAge: maxAgeAttribute
      ? Number(maxAgeAttribute.split("=")[1])
      : undefined,
  };
}

export async function loginAction(
  data: LoginSchema
): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("invalidEmailOrPassword") };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("network") };
  }

  if (!response.ok) {
    return {
      success: false,
      error: await apiErrorMessage(response, "loginFailed"),
    };
  }

  const cookieStore = await cookies();
  const setCookieHeaders = response.headers.getSetCookie();

  if (setCookieHeaders.length > 0) {
    // The API already issued its own Set-Cookie header(s); mirror them
    // as-is so attributes (maxAge, sameSite, etc.) stay under its control.
    for (const rawCookie of setCookieHeaders) {
      const parsedCookie = parseSetCookieHeader(rawCookie);

      if (parsedCookie) {
        cookieStore.set(parsedCookie.name, parsedCookie.value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: parsedCookie.maxAge,
        });
      }
    }

    return { success: true };
  }

  const body = await response.json().catch(() => null);
  const token = body?.access_token ?? body?.token;

  if (!token) {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("unexpectedResponse") };
  }

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return { success: true };
}

const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;

interface ExchangeActionResult {
  success: boolean;
}

// Called from the /auth/callback page after Google/GitHub OAuth. vertex-api
// redirects there with a short-lived, single-use exchange code — never the
// real access token, since a URL can end up in browser history, a Referer
// header, or a proxy's access log — rather than setting the session cookie
// itself, since it and vertex-web are on different domains and a cookie set
// by vertex-api's own response would be scoped to its domain, which this
// app's own cookies() calls could never see. This trades the code for the
// real token server-to-server (invalidating it in the same call, on the API
// side), then sets it as this app's own cookie.
export async function exchangeOAuthCodeAction(
  code: string
): Promise<ExchangeActionResult> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/auth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
      cache: "no-store",
    });
  } catch {
    return { success: false };
  }

  if (!response.ok) {
    return { success: false };
  }

  const body = await response.json().catch(() => null);
  const token = body?.access_token;

  if (!token) {
    return { success: false };
  }

  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS_IN_SECONDS,
  });

  revalidatePath("/", "layout");

  return { success: true };
}

interface OtpActionResult {
  success: boolean;
  error?: string;
}

// Passwordless login, step 1: vertex-api emails a 6-digit code to this
// address (creating nothing yet — the user record only materializes on a
// successful verify). The locale rides along so the email arrives in the
// language the visitor is browsing in.
export async function requestOtpCodeAction(
  email: string
): Promise<OtpActionResult> {
  const parsed = z.email().safeParse(email);

  if (!parsed.success) {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("invalidEmail") };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/auth/otp/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: parsed.data, locale: await getLocale() }),
      cache: "no-store",
    });
  } catch {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("network") };
  }

  if (!response.ok) {
    return {
      success: false,
      error: await apiErrorMessage(response, "otpRequestFailed"),
    };
  }

  return { success: true };
}

// Passwordless login, step 2: trades the emailed code for the real access
// token. Same cookie shape as exchangeOAuthCodeAction — the API returns the
// token in the body because a cookie set by its own response would be
// scoped to the wrong domain (see that action's comment).
export async function verifyOtpCodeAction(
  email: string,
  code: string
): Promise<OtpActionResult> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/auth/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
      cache: "no-store",
    });
  } catch {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("network") };
  }

  if (!response.ok) {
    return {
      success: false,
      error: await apiErrorMessage(response, "otpVerifyFailed"),
    };
  }

  const body = await response.json().catch(() => null);
  const token = body?.access_token;

  if (!token) {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("unexpectedResponse") };
  }

  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS_IN_SECONDS,
  });

  revalidatePath("/", "layout");

  return { success: true };
}

export async function checkGithubLinkedAction(): Promise<boolean> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    return false;
  }

  // Unlike exchangeOAuthCodeAction's login flow, linking doesn't reissue the
  // session cookie, so githubId can only be observed by asking the API for
  // the current DB state — a validated profile fetch, not just cookie
  // presence.
  const profile = await getProfile(accessToken);

  if (!profile?.githubId) {
    return false;
  }

  revalidatePath("/", "layout");

  return true;
}

export async function logoutAction(redirectTo?: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);

  if (redirectTo) {
    throw redirect({ href: redirectTo, locale: await getLocale() });
  }

  // No redirect means the visitor stays on whatever page they logged out
  // from; force it to re-render so the header drops out of admin state
  // instead of showing stale, still-authenticated markup.
  revalidatePath("/", "layout");
}
