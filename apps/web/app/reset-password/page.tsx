"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogoMark } from "@puqme/ui";
import { Button, Card } from "@puqme/ui";
import { FormField } from "@/components/form-field";
import { useLanguage } from "@/lib/i18n";
import { env } from "@/lib/env";
import { BRAND_NAME } from "@puqme/config";

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invalidToken, setInvalidToken] = useState(!token);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage(t.passwordsMismatch);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${env.apiBaseUrl}/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.code === "TOKEN_EXPIRED" || data.code === "INVALID_TOKEN") {
          setInvalidToken(true);
        } else {
          setErrorMessage(data.message || t.genericError);
        }
      }
    } catch {
      setErrorMessage(t.genericError);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (invalidToken) {
    return (
      <main className="auth-shell safe-px flex items-center justify-center">
        <div className="mx-auto w-full max-w-md text-center">
          <div className="glass-card rounded-[2rem] p-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f59e0b]/10">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.4">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            </div>

            <h1 className="mb-2 text-2xl font-bold text-white">{t.invalidResetToken}</h1>
            <p className="mb-8 text-sm leading-relaxed text-white/60">{t.invalidResetTokenDesc}</p>

            <div className="flex flex-col gap-3">
              <Link
                href="/forgot-password"
                className="glow-button flex items-center justify-center rounded-[1.1rem] px-6 py-3 text-sm font-semibold text-white no-underline"
              >
                {t.sendResetLink}
              </Link>
              <Link
                href="/login"
                className="rounded-[1.1rem] border border-white/12 bg-white/6 px-6 py-3 text-sm font-medium text-white/70 no-underline transition hover:bg-white/10 hover:text-white"
              >
                ← {t.backToLogin}
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="auth-shell safe-px flex items-center justify-center">
        <div className="mx-auto w-full max-w-md text-center">
          <div className="glass-card rounded-[2rem] p-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#34d399]/10">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.6">
                <circle cx="12" cy="12" r="9" />
                <path d="M8 12l3 3 5-5" />
              </svg>
            </div>

            <h1 className="mb-2 text-2xl font-bold text-white">{t.passwordResetSuccess}</h1>
            <p className="mb-8 text-sm leading-relaxed text-white/60">{t.passwordResetSuccessDesc}</p>

            <Link
              href="/login"
              className="glow-button flex items-center justify-center gap-2 rounded-[1.1rem] px-6 py-3 text-sm font-semibold text-white no-underline"
            >
              {t.signIn}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-shell safe-px flex items-center">
      <div className="mx-auto w-full max-w-sm">
        <Card className="mesh-panel w-full rounded-[1.75rem] p-4 text-white">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d7b8ff]">
            <LogoMark className="h-4 w-4 shrink-0" size={16} />
            {BRAND_NAME}
          </div>

          <h1 className="text-[1.6rem] font-semibold leading-none text-white">
            {t.resetPassword}
          </h1>

          <form className="mt-4 grid gap-2.5" onSubmit={handleSubmit}>
            <FormField
              autoComplete="new-password"
              label={t.newPassword}
              name="password"
              onChange={setPassword}
              placeholder="••••••••"
              required
              type="password"
              value={password}
            />
            <p className="text-[11px] text-white/40">{t.passwordHint}</p>

            <FormField
              autoComplete="new-password"
              label={t.confirmNewPassword}
              name="confirmPassword"
              onChange={setConfirmPassword}
              placeholder="••••••••"
              required
              type="password"
              value={confirmPassword}
            />

            {errorMessage && (
              <p className="text-sm text-[#ffb4c7]">{errorMessage}</p>
            )}

            <Button
              className="rounded-[1.1rem] bg-[#17201B] py-3 text-sm disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? t.resettingPassword : t.resetPassword}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
