"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { env } from "./env";

type SessionUser = {
  id: string;
  email: string;
  status: string;
};

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  refreshExpiresIn: string;
};

type AuthResponse = {
  user: SessionUser;
  tokens: SessionTokens;
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

const storageKey = "puqme.session.user";
const tokenKey = "puqme.session.tokens";

function persistSession(session: AuthResponse) {
  window.localStorage.setItem(storageKey, JSON.stringify(session.user));
  window.localStorage.setItem(tokenKey, JSON.stringify(session.tokens));
}

function clearSession() {
  window.localStorage.removeItem(storageKey);
  window.localStorage.removeItem(tokenKey);
}

async function readAuthError(response: Response) {
  try {
    const payload = (await response.json()) as {
      error?: string;
      message?: string;
      details?: {
        formErrors?: string[];
        fieldErrors?: Record<string, string[] | undefined>;
      };
    };

    if (payload.details?.formErrors?.[0]) {
      return payload.details.formErrors[0];
    }

    const firstFieldError = Object.values(payload.details?.fieldErrors ?? {}).flat().find(Boolean);
    if (firstFieldError) {
      return firstFieldError;
    }

    if (payload.message) {
      return payload.message;
    }

    if (payload.error) {
      return payload.error.replaceAll("_", " ");
    }
  } catch {
    return "Request failed.";
  }

  return "Request failed.";
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      setStatus("unauthenticated");
      return;
    }

    try {
      setUser(JSON.parse(raw) as SessionUser);
      setStatus("authenticated");
    } catch {
      clearSession();
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      signIn: async (email: string, password: string) => {
        const response = await fetch(`${env.apiBaseUrl}/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
          throw new Error(await readAuthError(response));
        }

        const session = (await response.json()) as AuthResponse;
        persistSession(session);
        setUser(session.user);
        setStatus("authenticated");
      },
      register: async (email: string, password: string) => {
        const response = await fetch(`${env.apiBaseUrl}/v1/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
          throw new Error(await readAuthError(response));
        }

        const session = (await response.json()) as AuthResponse;
        persistSession(session);
        setUser(session.user);
        setStatus("authenticated");
      },
      signInDemo: () => {
        const sessionUser = {
          id: "demo-user",
          email: "lina@puq.me",
          status: "active"
        };
        window.localStorage.setItem(storageKey, JSON.stringify(sessionUser));
        setUser(sessionUser);
        setStatus("authenticated");
      },
      signInWithGoogle: async (credential: string) => {
        const response = await fetch(`${env.apiBaseUrl}/v1/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential })
        });

        if (!response.ok) {
          throw new Error(await readAuthError(response));
        }

        const session = (await response.json()) as AuthResponse;
        persistSession(session);
        setUser(session.user);
        setStatus("authenticated");
      },
      signOut: () => {
        const rawTokens = window.localStorage.getItem(tokenKey);
        if (rawTokens) {
          void (async () => {
            try {
              const tokens = JSON.parse(rawTokens) as SessionTokens;
              await fetch(`${env.apiBaseUrl}/v1/auth/logout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken: tokens.refreshToken })
              });
            } catch {
              return;
            }
          })();
        }

        clearSession();
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
