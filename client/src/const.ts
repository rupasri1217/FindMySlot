export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || "https://auth.local";
  const appId = import.meta.env.VITE_APP_ID || "findmyslot";
  const redirectUri = typeof window !== "undefined" ? `${window.location.origin}/api/oauth/callback` : "http://localhost:3000/api/oauth/callback";
  const state = typeof window !== "undefined" ? btoa(redirectUri) : "";

  try {
    const url = new URL(`${oauthPortalUrl.startsWith("http") ? oauthPortalUrl : "https://" + oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");
    return url.toString();
  } catch (e) {
    return "/";
  }
};

