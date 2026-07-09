// Shared between LoginModal / LinkGithubButton (the openers, listening) and
// the /auth/callback page (loaded inside the OAuth popup, broadcasting) — a
// BroadcastChannel is origin-scoped rather than tied to a direct window
// reference, so it still works after Google/GitHub's own OAuth pages
// permanently sever window.opener via a strict Cross-Origin-Opener-Policy
// header.
export const OAUTH_BROADCAST_CHANNEL_NAME = "vertex-oauth";
export const OAUTH_SUCCESS_MESSAGE = "oauth-success";

// Failures broadcast a structured message instead of the success string:
// vertex-api's GithubPopupExceptionFilter redirects the popup to
// /auth/callback?oauth_error=<code> with a machine-readable error code
// (never a human-readable message — the popup page can't know the opener's
// locale), and the callback page relays it over the channel so the opener
// can render it translated via the "ApiErrors" messages namespace.
export const OAUTH_ERROR_MESSAGE_TYPE = "oauth-error";

export interface OAuthErrorBroadcast {
  type: typeof OAUTH_ERROR_MESSAGE_TYPE;
  code: string;
}

export function isOAuthErrorBroadcast(
  data: unknown
): data is OAuthErrorBroadcast {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    data.type === OAUTH_ERROR_MESSAGE_TYPE &&
    "code" in data &&
    typeof (data as { code: unknown }).code === "string"
  );
}
