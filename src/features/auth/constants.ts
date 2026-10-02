// Shared between LoginModal / LinkGithubButton (the openers, listening) and
// the /auth/callback page (loaded inside the OAuth popup, broadcasting) — a
// BroadcastChannel is origin-scoped rather than tied to a direct window
// reference, so it still works once window.opener is gone.
//
// What severs the opener is vertex-api's own Cross-Origin-Opener-Policy, not
// Google's or GitHub's. The popup opens cross-origin at vertex-api's /auth/*,
// and that first response (a redirect toward the provider) already carries
// `same-origin-allow-popups`, which Helmet sets on every API response. This
// site sends no COOP, and a cross-origin response with any COOP other than
// unsafe-none — redirects included — forces the popup into a new browsing
// context group: window.opener goes null in the popup and the opener's
// handle reads popup.closed === true, before the provider is ever reached,
// and nothing later in the flow restores it. `same-origin-allow-popups` keeps
// a page's references to the popups *it* opens; it does nothing for the
// opener of a document that *is* the popup. It holds locally too:
// localhost:3000 and localhost:3333 are different origins, and Helmet runs
// in dev. Measured in Chromium with Playwright: a popup opened straight at
// Google's or GitHub's OAuth page keeps its opener (Google sends only
// Cross-Origin-Opener-Policy-Report-Only, GitHub sends no COOP at all); the
// same popup opened through vertex-api's /auth/google or /auth/github loses
// it.
export const OAUTH_BROADCAST_CHANNEL_NAME = "vertex-oauth";
export const OAUTH_SUCCESS_MESSAGE = "oauth-success";

// Failures broadcast a structured message instead of the success string:
// vertex-api's OAuthPopupExceptionFilter redirects the popup to
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
