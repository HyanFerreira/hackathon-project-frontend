const AUTH_TOKEN_KEY = "auth_token";

function getStorage(remember = true) {
  if (typeof window === "undefined") {
    return undefined;
  }

  return remember ? window.localStorage : window.sessionStorage;
}

export function getAuthToken() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return (
    window.localStorage.getItem(AUTH_TOKEN_KEY) ??
    window.sessionStorage.getItem(AUTH_TOKEN_KEY) ??
    undefined
  );
}

export function setAuthToken(token: string, remember: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
  getStorage(remember)?.setItem(AUTH_TOKEN_KEY, token);
}

export function removeAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
}
