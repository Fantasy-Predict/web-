import { API_BASE_URL, USER_TYPE_KEY } from "./config";

export function getStoredUserType(): "admin" | "user" | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(USER_TYPE_KEY);
  return value === "admin" || value === "user" ? value : null;
}

export function setStoredUserType(userType: "admin" | "user") {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_TYPE_KEY, userType);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_TYPE_KEY);
  // Fire-and-forget: ask the server to clear the httpOnly auth cookies
  fetch(`${API_BASE_URL}/v1/users/logout`, { method: "POST", credentials: "include" }).catch(() => {});
}
