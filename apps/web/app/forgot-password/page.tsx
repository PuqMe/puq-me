"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoMark } from "@puqme/ui";
import { Button, Card } from "@puqme/ui";
import { FormField } from "@/components/form-field";
import { useLanguage } from "@/lib/i18n";
import { env } from "@/lib/env";
import { BRAND_NAME } from "@puqme/config";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${env.apiBaseUrl}/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      // Always show success to prevent email enumeration
      setSent(true);
    } catch {
      setSent(true); // Don't leak whether email exists
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sent) {
    return (
      <main className="auth-shell safe-px flex items-center justify-center">
        <div className="mx-auto w-full max-w-md text-center">
          <div className="glass-card rounded-[2rem] p-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#34d399]/10">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.4">
                <rect x="4" y="6" width="16" height="12" rx="2" />
                <path d="M4 8l8 5 8-5" />
              </svg>
            </div>

            <h1 className="mb-2 text-2xl font-bold text-white">{t.resetLinkSent}</h1>
            <p className="mb-8 text-sm leading-relaxed text-white/60">{t.resetLinkSentDesc}</p>

            <Link
              href="/login"
              className="rounded-[1.1rem] border border-white/12 bg-white/6 px-6 py-3 text-sm font-medium text-white/70 no-underline transition hover:bg-white/10 hover:text-white"
            >
              ← {t.backToLogin}
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
            {t.forgotPasswordTitle}
          </h1>
          <p className="mt-2 text-sm text-white/60">{t.forgotPasswordDesc}</p>

          <form className="mt-4 grid gap-2.5" onSubmit={handleSubmit}>
            <FormField
              autoComplete="email"
              label={t.emailLabel}
              name="email"
              onChange={setEmail}
              placeholder="you@puq.me"
              required
              type="email"
              value={email}
            />

            {errorMessage && (
              <p className="text-sm text-[#ffb4c7]">{errorMessage}</p>
            )}

            <Button
              className="rounded-[1.1rem] bg-[#17201B] py-3 text-sm disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? t.sendingResetLink : t.sendResetLink}
            </Button>
          </form>

          <Link
            className="mt-3 inline-flex text-sm font-medium text-white/60 hover:text-white"
            href="/login"
          >
            ← {t.backToLogin}
          </Link>
        </Card>
      </div>
    </main>
  );
}
