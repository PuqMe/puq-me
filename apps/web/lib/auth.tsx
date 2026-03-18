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

type AuthContextValue = {
  status: "loading" | "authenticated" | "unauthenticated";
  user: SessionUser | null;
  signInDemo: () => void;
  signInWithGoogle: (credential: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const storageKey = "puqme.session.user";
const tokenKey = "puqme.session.tokens";

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      setStatus("unauthenticated");
      return;
    }

    setUser(JSON.parse(raw) as SessionUser);
    setStatus("authenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
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
        try {
          const response = await fetch(`${env.apiBaseUrl}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential })
          });

          if (!response.ok) {
            throw new Error("Google login failed");
          }

          const { user, tokens } = await response.json();
          
          window.localStorage.setItem(storageKey, JSON.stringify(user));
          window.localStorage.setItem(tokenKey, JSON.stringify(tokens));
          
          setUser(user);
          setStatus("authenticated");
        } catch (error) {
          console.error("Google sign in error:", error);
          throw error;
        }
      },
      signOut: () => {
        window.localStorage.removeItem(storageKey);
        window.localStorage.removeItem(tokenKey);
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
