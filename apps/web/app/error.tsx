"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LogoMark } from "@puqme/ui";
import { BRAND_NAME } from "@puqme/config";
import { useLanguage } from "@/lib/i18n";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error("[PuQ.me] Route error:", error);
  }, [error]);

  return (
    <main className="auth-shell safe-px flex items-center justify-center">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="glass-card rounded-[2rem] p-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#ff4d6a]/10">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff4d6a" strokeWidth="1.4">
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="13" />
              <circle cx="12" cy="16" r="0.5" fill="#ff4d6a" />
            </svg>
          </div>

          <p className="mb-4 inline-flex rounded-full bg-[#ff4d6a]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff4d6a]">
            500
          </p>

          <h1 className="mb-2 text-2xl font-bold text-white">{t.serverErrorTitle}</h1>
          <p className="mb-8 text-sm leading-relaxed text-white/60">{t.serverErrorDesc}</p>

          {error.digest && (
            <p className="mb-4 font-mono text-[11px] text-white/30">
              Ref: {error.digest}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="glow-button flex items-center justify-center gap-2 rounded-[1.1rem] px-6 py-3 text-sm font-semibold text-white"
            >
              {t.tryAgain}
            </button>
            <Link
              href="/"
              className="rounded-[1.1rem] border border-white/12 bg-white/6 px-6 py-3 text-sm font-medium text-white/70 no-underline transition hover:bg-white/10 hover:text-white"
            >
              <LogoMark className="mr-2 inline h-3.5 w-3.5" size={14} />
              {t.goHome}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
