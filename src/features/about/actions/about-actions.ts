"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  apiErrorMessage,
  apiErrorsTranslator,
} from "@/lib/api-error-message";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

interface AboutActionResult {
  success: boolean;
  error?: string;
}

export interface UpdateAboutInput {
  content: string;
  contentEn: string;
  contentEs: string;
}

export async function updateAboutContentAction(
  input: UpdateAboutInput
): Promise<AboutActionResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("notSignedIn") };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/about`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify(input),
      cache: "no-store",
    });
  } catch {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("network") };
  }

  if (!response.ok) {
    return {
      success: false,
      error: await apiErrorMessage(response, "updateAboutFailed"),
    };
  }

  // Both /about and /dashboard/about live under the [locale] dynamic
  // segment, so literal paths here only ever busted the unprefixed pt
  // routes — /en/about and /es/about kept serving stale content until
  // getAboutContent()'s own 60s revalidate window passed. Same reasoning
  // (and the same verified-working fix) as post-actions.ts's
  // revalidatePostListings: revalidatePath("/[locale]", "page") does not
  // actually bust the cache in this Next 16 + Turbopack setup, the
  // layout-wide invalidation does.
  revalidatePath("/", "layout");

  return { success: true };
}
