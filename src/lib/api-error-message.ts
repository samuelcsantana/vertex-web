import { getTranslations } from "next-intl/server";

import { isApiErrorCode } from "@/lib/api-error-codes";

export async function apiErrorMessage(
  response: Response,
  fallbackKey: string
): Promise<string> {
  const t = await getTranslations("ApiErrors");
  const body: unknown = await response.json().catch(() => null);

  if (body && typeof body === "object") {
    const code = "code" in body ? body.code : undefined;

    if (isApiErrorCode(code)) {
      if (code === "SLUG_IN_USE") {
        const field =
          "field" in body && typeof body.field === "string"
            ? body.field
            : "slug";
        return t(code, { field });
      }

      return t(code);
    }

    if ("message" in body && typeof body.message === "string") {
      return body.message;
    }
  }

  return t(fallbackKey);
}

export async function apiErrorsTranslator() {
  return getTranslations("ApiErrors");
}
