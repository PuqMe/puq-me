"use client";

import Link from "next/link";
import type { PropsWithChildren } from "react";
import { useAuth } from "@/lib/auth";

export function AuthGuard({ children }: PropsWithChildren) {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="glass-card flex min-h-[60vh] items-center justify-center rounded-[2rem] p-6 text-sm text-black/60">
        Preparing your feed...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="glass-card flex min-h-[60vh] flex-col items-center justify-center rounded-[2rem] p-6 text-center">
        <h2 className="text-2xl font-semibold text-ink">Sign in to continue</h2>
        <p className="mt-3 max-w-xs text-sm leading-6 text-black/60">
          Your matches, chats and daily picks are available after authentication.
        </p>
        <Link className="mt-5 rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white" href="/login">
          Go to login
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
