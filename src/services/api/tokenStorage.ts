const AUTH_TOKEN_KEY = "auth_token";
const AUTH_ACTOR_KEY = "auth_actor";
const ORIGINAL_AUTH_TOKEN_KEY = "original_auth_token";
const ORIGINAL_AUTH_ACTOR_KEY = "original_auth_actor";

export type AuthActor = "user" | "aluno";

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

export function getAuthActor(): AuthActor {
  if (typeof window === "undefined") {
    return "user";
  }

  const actor =
    window.localStorage.getItem(AUTH_ACTOR_KEY) ??
    window.sessionStorage.getItem(AUTH_ACTOR_KEY);

  return actor === "aluno" ? "aluno" : "user";
}

export function setAuthActor(actor: AuthActor, remember: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_ACTOR_KEY);
  window.sessionStorage.removeItem(AUTH_ACTOR_KEY);
  getStorage(remember)?.setItem(AUTH_ACTOR_KEY, actor);
}

export function isImpersonating() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(
    window.localStorage.getItem(ORIGINAL_AUTH_TOKEN_KEY) ??
      window.sessionStorage.getItem(ORIGINAL_AUTH_TOKEN_KEY),
  );
}

export function preserveOriginalAuth() {
  if (typeof window === "undefined" || isImpersonating()) {
    return;
  }

  const token = getAuthToken();
  const actor = getAuthActor();

  if (!token) return;

  window.sessionStorage.setItem(ORIGINAL_AUTH_TOKEN_KEY, token);
  window.sessionStorage.setItem(ORIGINAL_AUTH_ACTOR_KEY, actor);
}

export function restoreOriginalAuth() {
  if (typeof window === "undefined") {
    return false;
  }

  const token =
    window.sessionStorage.getItem(ORIGINAL_AUTH_TOKEN_KEY) ??
    window.localStorage.getItem(ORIGINAL_AUTH_TOKEN_KEY);
  const actor =
    window.sessionStorage.getItem(ORIGINAL_AUTH_ACTOR_KEY) ??
    window.localStorage.getItem(ORIGINAL_AUTH_ACTOR_KEY);

  if (!token) return false;

  setAuthToken(token, false);
  setAuthActor(actor === "aluno" ? "aluno" : "user", false);
  clearOriginalAuth();

  return true;
}

export function clearOriginalAuth() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ORIGINAL_AUTH_TOKEN_KEY);
  window.sessionStorage.removeItem(ORIGINAL_AUTH_TOKEN_KEY);
  window.localStorage.removeItem(ORIGINAL_AUTH_ACTOR_KEY);
  window.sessionStorage.removeItem(ORIGINAL_AUTH_ACTOR_KEY);
}

export function removeAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_ACTOR_KEY);
  window.sessionStorage.removeItem(AUTH_ACTOR_KEY);
  clearOriginalAuth();
}
