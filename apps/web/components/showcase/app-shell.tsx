"use client";

/**
 * PuQ.me — App-Shell, AuthProvider, ApiClient, OnboardingGate.
 *
 * Hält die Brücke zwischen Mockup-Komponenten (rein visuell) und einer echten
 * mobilen App: Session, Routing-Guard, API-Calls gegen api.puq.me.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

const STORAGE_KEY = "puqme.session.v1";
const API_BASE =
  typeof window !== "undefined" && (window as any).PUQME_API_BASE
    ? (window as any).PUQME_API_BASE
    : "https://api.puq.me";

/* ─────────────── Types ─────────────── */

export interface User {
  id: string;
  email: string;
  name?: string;
  isVerified?: boolean;
  hasProfile?: boolean;
  hasVisibility?: boolean;
}
interface Session {
  token: string;
  user: User;
}
interface AuthCtx {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  patchUser: (p: Partial<User>) => void;
}
const AuthContext = createContext<AuthCtx | null>(null);

/* ─────────────── ApiClient ─────────────── */

class ApiError extends Error {
  constructor(public status: number, public code: string, message?: string) {
    super(message ?? code);
  }
}

class ApiClient {
  base: string;
  token: string | null = null;
  constructor(base: string) {
    this.base = base;
  }
  setToken(t: string | null) {
    this.token = t;
  }
  async request<T = any>(
    path: string,
    init: RequestInit & { json?: unknown } = {},
    retries = 1,
  ): Promise<T> {
    const headers = new Headers(init.headers);
    if (this.token) headers.set("authorization", `Bearer ${this.token}`);
    if (init.json !== undefined) {
      headers.set("content-type", "application/json");
      init.body = JSON.stringify(init.json);
    }
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(this.base + path, {
          ...init,
          headers,
          credentials: "include",
        });
        if (!res.ok) {
          let code = `http.${res.status}`;
          try {
            const body = await res.json();
            if (body?.error) code = body.error;
          } catch {}
          throw new ApiError(res.status, code);
        }
        if (res.status === 204) return undefined as unknown as T;
        const ct = res.headers.get("content-type") ?? "";
        return ct.includes("json") ? ((await res.json()) as T) : ((await res.text()) as T);
      } catch (err) {
        lastError = err;
        if (attempt < retries && !(err instanceof ApiError && err.status >= 400 && err.status < 500)) {
          await new Promise((r) => setTimeout(r, 250 + attempt * 400));
          continue;
        }
        throw err;
      }
    }
    throw lastError ?? new Error("api.unknown");
  }
}

export const api = new ApiClient(API_BASE);
export { ApiError };

/* ─────────────── AuthProvider ─────────────── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // initial restore from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const session = JSON.parse(raw) as Session;
        if (session?.token && session?.user) {
          api.setToken(session.token);
          setUser(session.user);
        }
      }
    } catch {}
    setLoading(false);
  }, []);

  const persist = useCallback((session: Session | null) => {
    if (session) {
      api.setToken(session.token);
      setUser(session.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      api.setToken(null);
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Mock-Login fällt zurück, falls die Worker-API noch nicht erreichbar ist
  // (CORS/Domain noch nicht aktiv). So bleibt der Onboarding-Flow lokal testbar.
  const signIn = useCallback(async (email: string, _password: string) => {
    try {
      const res = await api.request<Session>("/v1/auth/signin", {
        method: "POST",
        json: { email, password: _password },
      });
      persist(res);
    } catch (e) {
      // Local-only Fallback (offline / API nicht deployed)
      const fake: Session = {
        token: "local-mock-token-" + Math.random().toString(36).slice(2, 10),
        user: {
          id: "local-" + email.replace(/\W/g, "").slice(0, 8),
          email,
          name: email.split("@")[0] ?? email,
          isVerified: false,
          hasProfile: false,
          hasVisibility: false,
        },
      };
      persist(fake);
    }
  }, [persist]);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.request<Session>("/v1/auth/signup", {
        method: "POST",
        json: { email, password },
      });
      persist(res);
    } catch {
      await signIn(email, password);
    }
  }, [persist, signIn]);

  const signOut = useCallback(() => persist(null), [persist]);

  const patchUser = useCallback(
    (p: Partial<User>) => {
      setUser((u) => {
        if (!u) return u;
        const next = { ...u, ...p };
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const s = JSON.parse(raw) as Session;
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, user: next }));
          }
        } catch {}
        return next;
      });
    },
    [],
  );

  const value: AuthCtx = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, patchUser }),
    [user, loading, signIn, signUp, signOut, patchUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const v = useContext(AuthContext);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}

/* ─────────────── OnboardingGate ─────────────── */

const PUBLIC_ROUTES = new Set([
  "/", "/splash", "/language", "/onboarding/values",
  "/login", "/register", "/forgot-password", "/reset-password",
  "/about", "/privacy", "/terms", "/agb", "/impressum", "/imprint", "/datenschutz",
  "/contact", "/faq", "/features",
  "/showcase",
]);

function isPublic(path: string): boolean {
  if (PUBLIC_ROUTES.has(path)) return true;
  if (path.startsWith("/showcase/")) return true;
  if (path.startsWith("/auth/")) return true;
  return false;
}

export function OnboardingGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    if (loading) return;
    if (isPublic(pathname)) return;

    if (!user) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!user.hasProfile && !pathname.startsWith("/profile/create")) {
      router.replace("/profile/create");
      return;
    }
    if (!user.hasVisibility && !pathname.startsWith("/visibility")) {
      router.replace("/visibility");
      return;
    }
  }, [user, loading, pathname, router]);

  return <>{children}</>;
}

/* ─────────────── Mobile body class ─────────────── */

export function PuqAppRoot({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("puq-app");
    return () => document.documentElement.classList.remove("puq-app");
  }, []);
  return <>{children}</>;
}

/* ─────────────── BackButton + helper hooks ─────────────── */

export function useBack(fallback = "/encounter") {
  const router = useRouter();
  return useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.replace(fallback);
  }, [router, fallback]);
}
