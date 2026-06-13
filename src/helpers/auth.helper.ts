import { LocalStorageKeys } from "../enums/local-storage.enum";

export const getAccessTokenFromHeader = (authorizationHeader?: string) => {
    const authHeader = authorizationHeader?.trim() || ''
    if (!authHeader) {
      return ''
    }
  
    const accessToken = authHeader.split(' ')?.[1]?.trim() || ''
    if (['undefined', 'null'].includes(accessToken)) {
      return ''
    }
  
    return accessToken
  }

  export const getAccessToken = () => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN)?.trim() || ''
      if (['undefined', 'null'].includes(accessToken)) {
        return ''
      }
  
      return accessToken
    }
  
    return ''
  }

export function clearAuthSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(LocalStorageKeys.ACCESS_TOKEN);
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");
  document.cookie = "auth_token=; path=/; max-age=0; SameSite=Strict";
}

let isHandlingSessionExpiry = false;

export function handleSessionExpired() {
  if (typeof window === "undefined" || isHandlingSessionExpiry) return;

  isHandlingSessionExpiry = true;
  clearAuthSession();
  window.dispatchEvent(new CustomEvent("auth:session-expired"));

  const redirect = encodeURIComponent(window.location.pathname);
  window.location.assign(`/login?redirect=${redirect}`);
}