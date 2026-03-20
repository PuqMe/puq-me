"use client";

import Link from "next/link";
import type { PropsWithChildren } from "react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";

export function AuthGuard({ children }: PropsWithChildren) {
  const { status } = useAuth();
  const { t } = useLanguage();

  if (status === "loading") {
    return (
      <div className="glass-card flex min-h-[60vh] items-center justify-center rounded-[2rem] p-6 text-sm text-white/72">
        {t.loading}
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="glass-card flex min-h-[60vh] flex-col items-center justify-center rounded-[2rem] p-6 text-center">
        <h2 className="text-2xl font-semibold text-white">{t.signInFirst}</h2>
        <p className="mt-3 max-w-xs text-sm leading-6 text-white/70">
          {t.signInFirstDesc}
        </p>
        <Link className="glow-button mt-5 rounded-2xl px-4 py-3 text-sm font-medium text-white" href="/login">
          {t.signIn}
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
