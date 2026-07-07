"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/routing";

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
    return { success: false, error: "You must be signed in to do that." };
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
    return {
      success: false,
      error: "Unable to reach the server. Please try again.",
    };
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return {
      success: false,
      error: body?.message ?? "Failed to update the user.",
    };
  }

  revalidatePath("/dashboard/users");

  return { success: true };
}

export async function deleteUserAction(id: string): Promise<UserActionResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, error: "You must be signed in to do that." };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: { Cookie: `access_token=${accessToken}` },
      cache: "no-store",
    });
  } catch {
    return {
      success: false,
      error: "Unable to reach the server. Please try again.",
    };
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return {
      success: false,
      error: body?.message ?? "Failed to delete the user.",
    };
  }

  revalidatePath("/dashboard/users");

  return { success: true };
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
    return { success: false, error: "You must be signed in to do that." };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/users/me`, {
      method: "DELETE",
      headers: { Cookie: `access_token=${accessToken}` },
      cache: "no-store",
    });
  } catch {
    return {
      success: false,
      error: "Unable to reach the server. Please try again.",
    };
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return {
      success: false,
      error: body?.message ?? "Failed to delete your account.",
    };
  }

  cookieStore.delete("access_token");

  throw redirect({ href: "/", locale: await getLocale() });
}
