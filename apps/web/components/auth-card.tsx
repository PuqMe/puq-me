"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthFormShell } from "@/components/auth-form-shell";
import { FormField } from "@/components/form-field";
import { useAuth } from "@/lib/auth";
import { navigateToPostAuthPath } from "@/lib/post-auth";
import { useLanguage } from "@/lib/i18n";

export function AuthCard() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signIn(email.trim(), password);
      await navigateToPostAuthPath(router);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t.loginFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFormShell
      eyebrow={t.login}
      title={t.loginTitle}
      description=""
      submitLabel={t.continueBtn}
      pendingLabel={t.loggingIn}
      altLabel={t.createAccountLink}
      altHref="/register"
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <FormField autoComplete="email" label={t.emailLabel} name="email" onChange={setEmail} placeholder="you@puq.me" required type="email" value={email} />
      <FormField
        autoComplete="current-password"
        label={t.passwordLabel}
        name="password"
        onChange={setPassword}
        placeholder="••••••••"
        required
        type="password"
        value={password}
      />
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-[12px] font-medium text-[#a855f7]/80 hover:text-[#a855f7]">
          {t.forgotPassword}
        </Link>
      </div>
    </AuthFormShell>
  );
}
