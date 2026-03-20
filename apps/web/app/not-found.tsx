"use client";

import Link from "next/link";
import { LogoMark } from "@puqme/ui";
import { BRAND_NAME } from "@puqme/config";
import { useLanguage } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <main className="auth-shell safe-px flex items-center justify-center">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="glass-card rounded-[2rem] p-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/8">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-[#a855f7]">
              <circle cx="12" cy="12" r="9" />
              <path d="M9 9l6 6M15 9l-6 6" />
            </svg>
          </div>

          <p className="soft-pill mb-4 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
            404
          </p>

          <h1 className="mb-2 text-2xl font-bold text-white">{t.notFoundTitle}</h1>
          <p className="mb-8 text-sm leading-relaxed text-white/60">{t.notFoundDesc}</p>

          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="glow-button flex items-center justify-center gap-2 rounded-[1.1rem] px-6 py-3 text-sm font-semibold text-white no-underline"
            >
              <LogoMark className="h-4 w-4" size={16} />
              {t.goHome}
            </Link>
            <button
              onClick={() => history.back()}
              className="rounded-[1.1rem] border border-white/12 bg-white/6 px-6 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              ← {t.goBack}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
