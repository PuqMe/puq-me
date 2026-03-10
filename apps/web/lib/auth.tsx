"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

type SessionUser = {
  id: string;
  displayName: string;
};

type AuthContextValue = {
  status: "loading" | "authenticated" | "unauthenticated";
  user: SessionUser | null;
  signInDemo: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const storageKey = "puqme.demo.session";

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
          displayName: "Lina"
        };
        window.localStorage.setItem(storageKey, JSON.stringify(sessionUser));
        setUser(sessionUser);
        setStatus("authenticated");
      },
      signOut: () => {
        window.localStorage.removeItem(storageKey);
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
