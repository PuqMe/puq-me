"use client";

/**
 * Round 4 — HTTP-only cookie auth for the web client.
 *
 * Tokens (access_token, refresh_token) are NEVER stored in localStorage or any
 * other JS-readable storage. They live in HttpOnly+Secure+SameSite=Lax cookies
 * scoped to .puq.me, set by api.puq.me on /v1/auth/login | /register | /google
 * | /refresh, and cleared on /logout.
 *
 * The browser sends them automatically with every same-site/credentialed
 * cross-origin request as long as we use `credentials: "include"`.
 *
 * What lives in localStorage now: only a tiny non-sensitive *user marker*
 * (id, email, status). It exists purely to drive optimistic UI on cold boot
 * while the /v1/auth/session probe is in flight. It is NOT a source of truth —
 * the server-side cookie is. If /session disagrees, we wipe the marker.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import { env } from "./env";
import {
  createFallbackSession,
  shouldUseLocalAppFallback,
  shouldUseLocalAppFallbackForError
} from "./local-app-fallback";

type SessionUser = {
  id: string;
  email: string;
  status: string;
};

type AuthContextValue = {
  status: "loading" | "authenticated" | "unauthenticated";
  user: SessionUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signInDemo: () => void;
  signInWithGoogle: (credential: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Marker key — NOT a token. Just so cold loads don't flicker to "logged out".
// Cleared the moment the server says we're not authenticated.
const userMarkerKey = "puqme.session.user";
const authUpdateEvent = "puqme-auth-updated";

function emitAuthUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(authUpdateEvent));
  }
}

function persistUserMarker(user: SessionUser) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(userMarkerKey, JSON.stringify(user));
  } catch {
    /* private mode / quota — non-fatal */
  }
  emitAuthUpdate();
}

function clearUserMarker() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(userMarkerKey);
  } catch {
    /* non-fatal */
  }
  emitAuthUpdate();
}

export function readStoredUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(userMarkerKey);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    clearUserMarker();
    return null;
  }
}

// --------------------------------------------------------------------------
// fetch helpers — every API call MUST include cookies.
// --------------------------------------------------------------------------

const API_TIMEOUT_MS = 10_000;

function fetchWithTimeout(input: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  return fetch(input, {
    ...init,
    credentials: "include",
    signal: controller.signal
  }).finally(() => clearTimeout(timer));
}

/**
 * Used by feature code that needs to call the API. Cookies travel automatically;
 * if the access token is expired we transparently call /v1/auth/refresh and retry.
 */
export async function fetchWithSession(input: string, init: RequestInit = {}) {
  let response = await fetchWithTimeout(input, init);

  if (response.status !== 401) {
    return response;
  }

  // Try refresh once. The refresh endpoint reads the cookie itself and rotates
  // it on success. If that succeeds we replay the original request.
  const refreshed = await fetchWithTimeout(`${env.apiBaseUrl}/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  if (!refreshed.ok) {
    return response; // bubble the original 401
  }

  return fetchWithTimeout(input, init);
}

async function readAuthError(response: Response) {
  try {
    const payload = (await response.json()) as {
      error?: string | { code?: string; message?: string };
      message?: string;
      details?: {
        formErrors?: string[];
        fieldErrors?: Record<string, string[] | undefined>;
      };
    };

    if (payload.details?.formErrors?.[0]) return payload.details.formErrors[0];

    const firstFieldError = Object.values(payload.details?.fieldErrors ?? {}).flat().find(Boolean);
    if (firstFieldError) return firstFieldError;

    if (payload.message) return payload.message;

    if (typeof payload.error === "object" && payload.error?.message) {
      return payload.error.message.replaceAll("_", " ");
    }
    if (typeof payload.error === "string") {
      return payload.error.replaceAll("_", " ");
    }
  } catch {
    return "Request failed.";
  }

  return "Request failed.";
}

// --------------------------------------------------------------------------
// AuthProvider
// --------------------------------------------------------------------------

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let cancelled = false;

    // Optimistic hydrate from non-sensitive marker
    const cached = readStoredUser();
    if (cached) {
      setUser(cached);
      // status stays "loading" until server confirms — UI can use `user` already
    }

    // Authoritative check: ask the server. The HTTP-only cookie flies along.
    void (async () => {
      try {
        const response = await fetchWithTimeout(`${env.apiBaseUrl}/v1/auth/session`);

        if (!response.ok) {
          if (cancelled) return;
          if (shouldUseLocalAppFallback(response) && cached) {
            setStatus("authenticated");
            return;
          }
          clearUserMarker();
          setUser(null);
          setStatus("unauthenticated");
          return;
        }

        const data = (await response.json()) as { user: SessionUser | null };
        if (cancelled) return;

        if (data.user) {
          persistUserMarker(data.user);
          setUser(data.user);
          setStatus("authenticated");
        } else {
          clearUserMarker();
          setUser(null);
          setStatus("unauthenticated");
        }
      } catch (error) {
        if (cancelled) return;
        if (shouldUseLocalAppFallbackForError(error) && cached) {
          setStatus("authenticated");
          return;
        }
        clearUserMarker();
        setUser(null);
        setStatus("unauthenticated");
      }
    })();

    const syncFromStorage = () => {
      const nextUser = readStoredUser();
      setUser(nextUser);
      // Don't downgrade status away from authenticated based on storage alone
      // — the cookie is the source of truth.
    };
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(authUpdateEvent, syncFromStorage);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(authUpdateEvent, syncFromStorage);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      signIn: async (email: string, password: string) => {
        try {
          const response = await fetchWithTimeout(`${env.apiBaseUrl}/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });

          if (!response.ok) {
            if (shouldUseLocalAppFallback(response)) {
              const fallbackSession = createFallbackSession(email);
              persistUserMarker(fallbackSession.user);
              setUser(fallbackSession.user);
              setStatus("authenticated");
              return;
            }

            throw new Error(await readAuthError(response));
          }

          const session = (await response.json()) as { user: SessionUser };
          persistUserMarker(session.user);
          setUser(session.user);
          setStatus("authenticated");
        } catch (error) {
          if (shouldUseLocalAppFallbackForError(error)) {
            const fallbackSession = createFallbackSession(email);
            persistUserMarker(fallbackSession.user);
            setUser(fallbackSession.user);
            setStatus("authenticated");
            return;
          }
          throw error;
        }
      },
      register: async (email: string, password: string) => {
        try {
          const response = await fetchWithTimeout(`${env.apiBaseUrl}/v1/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });

          if (!response.ok) {
            if (shouldUseLocalAppFallback(response)) {
              const fallbackSession = createFallbackSession(email);
              persistUserMarker(fallbackSession.user);
              setUser(fallbackSession.user);
              setStatus("authenticated");
              return;
            }

            throw new Error(await readAuthError(response));
          }

          const session = (await response.json()) as { user: SessionUser };
          persistUserMarker(session.user);
          setUser(session.user);
          setStatus("authenticated");
        } catch (error) {
          if (shouldUseLocalAppFallbackForError(error)) {
            const fallbackSession = createFallbackSession(email);
            persistUserMarker(fallbackSession.user);
            setUser(fallbackSession.user);
            setStatus("authenticated");
            return;
          }
          throw error;
        }
      },
      signInDemo: () => {
        // Local-only demo session — never hits the API. No real cookies are set,
        // so any feature call relying on cookies will of course not work.
        const fallbackSession = createFallbackSession("lina@puq.me");
        persistUserMarker(fallbackSession.user);
        setUser(fallbackSession.user);
        setStatus("authenticated");
      },
      signInWithGoogle: async (credential: string) => {
        try {
          const response = await fetchWithTimeout(`${env.apiBaseUrl}/v1/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential })
          });

          if (!response.ok) {
            if (shouldUseLocalAppFallback(response)) {
              const fallbackSession = createFallbackSession("google-user@puq.me");
              persistUserMarker(fallbackSession.user);
              setUser(fallbackSession.user);
              setStatus("authenticated");
              return;
            }
            throw new Error(await readAuthError(response));
          }

          const session = (await response.json()) as { user: SessionUser };
          persistUserMarker(session.user);
          setUser(session.user);
          setStatus("authenticated");
        } catch (error) {
          if (shouldUseLocalAppFallbackForError(error)) {
            const fallbackSession = createFallbackSession("google-user@puq.me");
            persistUserMarker(fallbackSession.user);
            setUser(fallbackSession.user);
            setStatus("authenticated");
            return;
          }
          throw error;
        }
      },
      signOut: () => {
        // Fire-and-forget logout — the server clears cookies, then we clear
        // the local marker and update state. Even if the network call fails
        // (offline), the marker is gone and the UI flips to unauthenticated.
        void (async () => {
          try {
            await fetchWithTimeout(`${env.apiBaseUrl}/v1/auth/logout`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({})
            });
          } catch {
            /* non-fatal */
          }
        })();

        clearUserMarker();
        setUser(null);
        setStatus("unauthenticated");
      }
    }),
    [status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
