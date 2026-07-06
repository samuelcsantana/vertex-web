"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { loginSchema, type LoginSchema } from "@/features/auth/schemas/login-schema";

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
    return { success: false, error: "Invalid email or password." };
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
    return {
      success: false,
      error: "Unable to reach the authentication server.",
    };
  }

  if (!response.ok) {
    return { success: false, error: "Invalid credentials." };
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
    return {
      success: false,
      error: "Unexpected response from the authentication server.",
    };
  }

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return { success: true };
}

export async function checkSessionAction(): Promise<boolean> {
  const cookieStore = await cookies();

  // Matches BlogHeader's own check (cookie presence, not a validated
  // profile fetch) so this can't disagree with what the header is about
  // to render once revalidated.
  const hasSession = cookieStore.has(AUTH_COOKIE_NAME);

  if (!hasSession) {
    return false;
  }

  // The Google OAuth popup sets this cookie directly via vertex-api, outside
  // of any Server Action, so nothing has revalidated the layout's cached
  // auth state yet — mirror logoutAction's approach so the header picks up
  // the new session instead of only refreshing on the next hard navigation.
  revalidatePath("/", "layout");

  return true;
}

export async function logoutAction(redirectTo?: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);

  if (redirectTo) {
    redirect(redirectTo);
  }

  // No redirect means the visitor stays on whatever page they logged out
  // from; force it to re-render so the header drops out of admin state
  // instead of showing stale, still-authenticated markup.
  revalidatePath("/", "layout");
}
