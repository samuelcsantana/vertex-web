export const OAUTH_BROADCAST_CHANNEL_NAME = "vertex-oauth";
export const OAUTH_SUCCESS_MESSAGE = "oauth-success";

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
