"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/routing";
import {
  apiErrorMessage,
  apiErrorsTranslator,
} from "@/lib/api-error-message";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

interface UserActionResult {
  success: boolean;
  error?: string;
}

export async function setUserBannedAction(
  id: string,
  isBanned: boolean
): Promise<UserActionResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("notSignedIn") };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/users/${id}/ban`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify({ isBanned }),
      cache: "no-store",
    });
  } catch {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("network") };
  }

  if (!response.ok) {
    return {
      success: false,
      error: await apiErrorMessage(response, "updateUserFailed"),
    };
  }

  revalidatePath("/dashboard/users");

  return { success: true };
}

export async function deleteUserAction(id: string): Promise<UserActionResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("notSignedIn") };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: { Cookie: `access_token=${accessToken}` },
      cache: "no-store",
    });
  } catch {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("network") };
  }

  if (!response.ok) {
    return {
      success: false,
      error: await apiErrorMessage(response, "deleteUserFailed"),
    };
  }

  revalidatePath("/dashboard/users");

  return { success: true };
}

export interface UpdateProfileInput {
  name: string;
  displayName: string;
  // "" clears the avatar (the API treats empty string as "remove").
  avatarUrl: string;
}

// Self-service profile edit — PATCH /users/me resolves identity from the
// session token, so no id ever travels from the client.
export async function updateProfileAction(
  data: UpdateProfileInput
): Promise<UserActionResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("notSignedIn") };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });
  } catch {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("network") };
  }

  if (!response.ok) {
    return {
      success: false,
      error: await apiErrorMessage(response, "updateProfileFailed"),
    };
  }

  // The header chip renders the profile on every page — bust everything.
  revalidatePath("/", "layout");

  return { success: true };
}

interface AvatarUploadUrlResult {
  success: boolean;
  presignedUrl?: string;
  error?: string;
}

export async function requestAvatarUploadUrlAction(
  fileName: string,
  contentType: string
): Promise<AvatarUploadUrlResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("notSignedIn") };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/uploads/avatar-presigned-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify({ fileName, contentType }),
      cache: "no-store",
    });
  } catch {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("network") };
  }

  if (!response.ok) {
    return {
      success: false,
      error: await apiErrorMessage(response, "avatarUploadFailed"),
    };
  }

  const data = await response.json();

  return { success: true, presignedUrl: data.presignedUrl };
}

// Self-service account deletion (LGPD, Art. 18 — the right to request
// deletion of personal data processed under consent). Unlike
// deleteUserAction above, this never fails on "you can't delete your own
// account" — deleting your own account is the entire point. It still
// clears the session cookie and leaves the site afterwards, since
// continuing to browse as a user whose account no longer exists doesn't
// make sense.
export async function deleteOwnAccountAction(): Promise<UserActionResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("notSignedIn") };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/users/me`, {
      method: "DELETE",
      headers: { Cookie: `access_token=${accessToken}` },
      cache: "no-store",
    });
  } catch {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("network") };
  }

  if (!response.ok) {
    return {
      success: false,
      error: await apiErrorMessage(response, "deleteOwnAccountFailed"),
    };
  }

  cookieStore.delete("access_token");

  throw redirect({ href: "/", locale: await getLocale() });
}
