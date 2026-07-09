import { describe, expect, it } from "vitest";

import { isApiErrorCode } from "@/lib/api-error-codes";
import { isOAuthErrorBroadcast } from "@/features/auth/constants";

describe("isApiErrorCode", () => {
  it("accepts every code vertex-api emits", () => {
    expect(isApiErrorCode("INVALID_CREDENTIALS")).toBe(true);
    expect(isApiErrorCode("GITHUB_EMAIL_CONFLICT")).toBe(true);
  });

  it("rejects unknown strings and non-strings", () => {
    expect(isApiErrorCode("SOMETHING_ELSE")).toBe(false);
    expect(isApiErrorCode(undefined)).toBe(false);
    expect(isApiErrorCode(null)).toBe(false);
    expect(isApiErrorCode(42)).toBe(false);
  });
});

describe("isOAuthErrorBroadcast", () => {
  it("accepts the shape the /auth/callback popup broadcasts", () => {
    expect(
      isOAuthErrorBroadcast({ type: "oauth-error", code: "GITHUB_ALREADY_LINKED" })
    ).toBe(true);
  });

  it("rejects the success string and malformed objects", () => {
    expect(isOAuthErrorBroadcast("oauth-success")).toBe(false);
    expect(isOAuthErrorBroadcast({ type: "oauth-error" })).toBe(false);
    expect(isOAuthErrorBroadcast({ type: "other", code: "X" })).toBe(false);
    expect(isOAuthErrorBroadcast(null)).toBe(false);
  });
});
