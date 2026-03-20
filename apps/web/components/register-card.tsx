"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthFormShell } from "@/components/auth-form-shell";
import { FormField } from "@/components/form-field";
import { useAuth } from "@/lib/auth";
import { navigateToPostAuthPath } from "@/lib/post-auth";
import { useLanguage } from "@/lib/i18n";

export function RegisterCard() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (password !== confirmPassword) {
      setErrorMessage(t.passwordsMismatch);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await register(email.trim(), password);
      await navigateToPostAuthPath(router);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t.registrationFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFormShell
      eyebrow={t.register}
      title={t.registerTitle}
      description=""
      submitLabel={t.register}
      pendingLabel={t.registering}
      altLabel={t.backToLogin}
      altHref="/login"
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <FormField autoComplete="email" label={t.emailLabel} name="email" onChange={setEmail} placeholder="you@puq.me" required type="email" value={email} />
      <FormField
        autoComplete="new-password"
        label={t.passwordLabel}
        name="password"
        onChange={setPassword}
        placeholder={t.passwordHint}
        required
        type="password"
        value={password}
      />
      <FormField
        autoComplete="new-password"
        label={t.confirmPasswordLabel}
        name="confirmPassword"
        onChange={setConfirmPassword}
        placeholder={t.confirmPasswordPlaceholder}
        required
        type="password"
        value={confirmPassword}
      />
    </AuthFormShell>
  );
}
