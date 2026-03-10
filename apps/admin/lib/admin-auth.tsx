"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

type AdminRole = "support_agent" | "moderator" | "senior_moderator" | "trust_safety_manager" | "admin";

type AdminSession = {
  id: string;
  email: string;
  role: AdminRole;
  permissions: string[];
  accessToken: string;
};

type AdminAuthContextValue = {
  status: "loading" | "authenticated" | "unauthenticated";
  admin: AdminSession | null;
  signInDemo: (email: string) => void;
  signOut: () => void;
  hasPermission: (permission: string) => boolean;
};

const storageKey = "puqme.admin.demo.session";
const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function buildDemoSession(email: string): AdminSession {
  return {
    id: "admin-demo-1",
    email,
    role: "admin",
    permissions: [
      "reports.read",
      "reports.update",
      "users.read",
      "users.suspend",
      "users.ban",
      "messages.read",
      "messages.moderate",
      "profiles.moderate",
      "stats.read"
    ],
    accessToken: "demo-admin-token"
  };
}

export function AdminAuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AdminAuthContextValue["status"]>("loading");
  const [admin, setAdmin] = useState<AdminSession | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      setStatus("unauthenticated");
      return;
    }

    setAdmin(JSON.parse(raw) as AdminSession);
    setStatus("authenticated");
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      status,
      admin,
      signInDemo: (email: string) => {
        const next = buildDemoSession(email);
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        setAdmin(next);
        setStatus("authenticated");
      },
      signOut: () => {
        window.localStorage.removeItem(storageKey);
        setAdmin(null);
        setStatus("unauthenticated");
      },
      hasPermission: (permission: string) => admin?.permissions.includes(permission) ?? false
    }),
    [admin, status]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
}
