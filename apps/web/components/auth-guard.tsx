"use client";

import Link from "next/link";
import type { PropsWithChildren } from "react";
import { useAuth } from "@/lib/auth";

export function AuthGuard({ children }: PropsWithChildren) {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="glass-card flex min-h-[60vh] items-center justify-center rounded-[2rem] p-6 text-sm text-white/72">
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="glass-card flex min-h-[60vh] flex-col items-center justify-center rounded-[2rem] p-6 text-center">
        <h2 className="text-2xl font-semibold text-white">Please sign in first</h2>
        <p className="mt-3 max-w-xs text-sm leading-6 text-white/70">
          Matches, chats and nearby will load after login.
        </p>
        <Link className="glow-button mt-5 rounded-2xl px-4 py-3 text-sm font-medium text-white" href="/login">
          Sign in
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
