// Shared between LoginModal (the opener, listening) and the /auth/callback
// page (loaded inside the OAuth popup, broadcasting) — a BroadcastChannel is
// origin-scoped rather than tied to a direct window reference, so it still
// works after Google/GitHub's own OAuth pages permanently sever
// window.opener via a strict Cross-Origin-Opener-Policy header.
export const OAUTH_BROADCAST_CHANNEL_NAME = "vertex-oauth";
export const OAUTH_SUCCESS_MESSAGE = "oauth-success";
