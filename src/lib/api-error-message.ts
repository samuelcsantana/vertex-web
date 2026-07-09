import { getTranslations } from "next-intl/server";

import { isApiErrorCode } from "@/lib/api-error-codes";

// Turns a failed vertex-api response into a message in the visitor's
// locale. Resolution order:
//   1. A known machine-readable `code` in the body → its translated
//      "ApiErrors" message (SLUG_IN_USE additionally interpolates the
//      offending field name the API sends alongside the code).
//   2. An uncoded but real `message` string (e.g. a validation pipe's
//      output) → shown as-is; informative English beats a generic
//      translated fallback that throws the detail away.
//   3. Otherwise → the caller's translated fallback key.
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

// For the failure paths that never reach the API (missing session cookie,
// network error) — same namespace, so every error string a Server Action
// returns comes from one place.
export async function apiErrorsTranslator() {
  return getTranslations("ApiErrors");
}
