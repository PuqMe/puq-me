"use client";

import { AuthFormShell } from "@/components/auth-form-shell";
import { FormField } from "@/components/form-field";

export function RegisterCard() {
  return (
    <AuthFormShell
      eyebrow="Registration"
      title="Build your dating profile"
      description="Start with the essentials and get into the swipe feed fast."
      submitLabel="Create account"
      altLabel="Already have an account?"
      altHref="/login"
    >
      <FormField label="Email" placeholder="you@puq.me" type="email" />
      <FormField label="Password" placeholder="Choose a strong password" type="password" />
      <FormField label="Display name" placeholder="How matches will see you" />
    </AuthFormShell>
  );
}
