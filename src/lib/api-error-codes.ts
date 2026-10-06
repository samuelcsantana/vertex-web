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
  "OAUTH_STATE_MISMATCH",
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
