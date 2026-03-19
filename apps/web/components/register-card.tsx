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
      setErrorMessage("Passwords do not match.");
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
      eyebrow="Register"
      title="Create account"
      description=""
      submitLabel="Create account"
      pendingLabel="Creating account..."
      altLabel="Already have an account"
      altHref="/login"
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <FormField autoComplete="email" label="Email" name="email" onChange={setEmail} placeholder="you@puq.me" required type="email" value={email} />
      <FormField
        autoComplete="new-password"
        label="Password"
        name="password"
        onChange={setPassword}
        placeholder="Min 10 chars, upper/lower, number, symbol"
        required
        type="password"
        value={password}
      />
      <FormField
        autoComplete="new-password"
        label="Confirm password"
        name="confirmPassword"
        onChange={setConfirmPassword}
        placeholder="Repeat password"
        required
        type="password"
        value={confirmPassword}
      />
    </AuthFormShell>
  );
}
