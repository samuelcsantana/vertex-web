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

  revalidatePath("/admin/dashboard/users");

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

  revalidatePath("/admin/dashboard/users");

  return { success: true };
}

export interface UpdateProfileInput {
  name: string;
  displayName: string;
  avatarUrl: string;
}

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
