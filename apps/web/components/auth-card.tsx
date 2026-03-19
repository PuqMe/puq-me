"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthFormShell } from "@/components/auth-form-shell";
import { FormField } from "@/components/form-field";
import { useAuth } from "@/lib/auth";
import { navigateToPostAuthPath } from "@/lib/post-auth";

export function AuthCard() {
  const router = useRouter();
  const { signIn } = useAuth();
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
      setErrorMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFormShell
      eyebrow="Schneller Login"
      title="Willkommen zurück"
      description="In Sekunden wieder rein, Chats fortsetzen und direkt nahe Matches sehen."
      submitLabel="Weiter"
      pendingLabel="Login laeuft..."
      altLabel="Neues Konto erstellen"
      altHref="/register"
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <FormField autoComplete="email" label="Email" name="email" onChange={setEmail} placeholder="you@puq.me" required type="email" value={email} />
      <FormField
        autoComplete="current-password"
        label="Passwort"
        name="password"
        onChange={setPassword}
        placeholder="Passwort eingeben"
        required
        type="password"
        value={password}
      />
    </AuthFormShell>
  );
}
