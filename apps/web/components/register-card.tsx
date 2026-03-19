"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthFormShell } from "@/components/auth-form-shell";
import { FormField } from "@/components/form-field";
import { useAuth } from "@/lib/auth";
import { navigateToPostAuthPath } from "@/lib/post-auth";

export function RegisterCard() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (password !== confirmPassword) {
      setErrorMessage("Die Passwoerter stimmen noch nicht ueberein.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await register(email.trim(), password);
      await navigateToPostAuthPath(router);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFormShell
      eyebrow="Einfach starten"
      title="Profil schnell anlegen"
      description="Nur Email und ein starkes Passwort. Deinen Anzeigenamen legst du direkt im Onboarding fest."
      submitLabel="Konto erstellen"
      pendingLabel="Konto wird erstellt..."
      altLabel="Ich habe schon ein Konto"
      altHref="/login"
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <FormField autoComplete="email" label="Email" name="email" onChange={setEmail} placeholder="you@puq.me" required type="email" value={email} />
      <FormField
        autoComplete="new-password"
        label="Passwort"
        name="password"
        onChange={setPassword}
        placeholder="Mindestens 10 Zeichen, Gross/Klein, Zahl, Symbol"
        required
        type="password"
        value={password}
      />
      <FormField
        autoComplete="new-password"
        label="Passwort bestaetigen"
        name="confirmPassword"
        onChange={setConfirmPassword}
        placeholder="Passwort wiederholen"
        required
        type="password"
        value={confirmPassword}
      />
    </AuthFormShell>
  );
}
