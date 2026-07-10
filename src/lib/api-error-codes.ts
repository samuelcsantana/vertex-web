// Machine-readable error codes vertex-api attaches to user-facing exception
// bodies (see its src/common/constants/error-codes.ts — the two lists must
// stay in sync). Each code has a matching key in the "ApiErrors" messages
// namespace, which is what lets an API failure surface to the visitor in
// their own locale instead of the API's English message.
//
// Deliberately dependency-free and isomorphic: server actions translate
// codes via src/lib/api-error-message.ts, while client components (the
// OAuth popup listeners in LoginModal/LinkGithubButton) translate them with
// useTranslations("ApiErrors") after receiving a code over the
// BroadcastChannel.
export const API_ERROR_CODES = [
  "INVALID_CREDENTIALS",
  "EMAIL_IN_USE",
  "USER_BANNED",
  "ADMIN_ONLY",
  "COMMENTS_DISABLED",
  "CANNOT_BAN_SELF",
  "SLUG_IN_USE",
  "GITHUB_ALREADY_LINKED",
  "GITHUB_EMAIL_CONFLICT",
  "GOOGLE_ALREADY_LINKED",
  "OTP_INVALID",
  "OTP_EXPIRED",
  "OTP_TOO_MANY_ATTEMPTS",
  "OTP_COOLDOWN",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return (
    typeof value === "string" &&
    (API_ERROR_CODES as readonly string[]).includes(value)
  );
}
