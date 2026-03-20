"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogoMark } from "@puqme/ui";
import { Button } from "@puqme/ui";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { env } from "@/lib/env";

type VerifyState = "verifying" | "success" | "error" | "expired" | "awaiting";

export default function VerifyEmailPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<VerifyState>(token ? "verifying" : "awaiting");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!token) return;

    async function verify() {
      try {
        const res = await fetch(`${env.apiBaseUrl}/v1/auth/email-verification/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          setState("success");
        } else {
          const data = await res.json().catch(() => ({}));
          if (data.code === "TOKEN_EXPIRED") {
            setState("expired");
          } else {
            setState("error");
          }
        }
      } catch {
        setState("error");
      }
    }

    verify();
  }, [token]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function handleResend() {
    if (resendCooldown > 0) return;
    try {
      await fetch(`${env.apiBaseUrl}/v1/auth/email-verification/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email }),
      });
      setResendCooldown(60);
    } catch {
      // Silently fail — don't leak info
    }
  }

  const icons: Record<VerifyState, React.ReactNode> = {
    verifying: (
      <div className="animate-soft-pulse">
        <LogoMark className="h-10 w-10 text-[#a855f7]" size={40} />
      </div>
    ),
    success: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12l3 3 5-5" />
      </svg>
    ),
    error: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff4d6a" strokeWidth="1.4">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9l6 6M15 9l-6 6" />
      </svg>
    ),
    expired: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.4">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
    awaiting: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.4">
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="M4 8l8 5 8-5" />
      </svg>
    ),
  };

  const titles: Record<VerifyState, string> = {
    verifying: t.verifying,
    success: t.verifyEmailSuccess,
    error: t.verifyEmailFailed,
    expired: t.verifyEmailExpired,
    awaiting: t.verifyEmailTitle,
  };

  const descs: Record<VerifyState, string> = {
    verifying: "",
    success: t.verifyEmailSuccessDesc,
    error: t.verifyEmailFailedDesc,
    expired: t.verifyEmailExpiredDesc,
    awaiting: t.verifyEmailDesc,
  };

  return (
    <main className="auth-shell safe-px flex items-center justify-center">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="glass-card rounded-[2rem] p-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/8">
            {icons[state]}
          </div>

          <h1 className="mb-2 text-2xl font-bold text-white">{titles[state]}</h1>
          {descs[state] && (
            <p className="mb-6 text-sm leading-relaxed text-white/60">{descs[state]}</p>
          )}

          <div className="flex flex-col gap-3">
            {state === "success" && (
              <Link
                href="/nearby"
                className="glow-button flex items-center justify-center gap-2 rounded-[1.1rem] px-6 py-3 text-sm font-semibold text-white no-underline"
              >
                {t.continueBtn}
              </Link>
            )}

            {(state === "error" || state === "expired" || state === "awaiting") && (
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="glow-button flex items-center justify-center gap-2 rounded-[1.1rem] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {resendCooldown > 0
                  ? `${t.resendVerificationSent} (${resendCooldown}s)`
                  : t.resendVerification}
              </button>
            )}

            <Link
              href="/"
              className="rounded-[1.1rem] border border-white/12 bg-white/6 px-6 py-3 text-sm font-medium text-white/70 no-underline transition hover:bg-white/10 hover:text-white"
            >
              {t.goHome}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
