"use client";

import { AuthFormShell } from "@/components/auth-form-shell";
import { FormField } from "@/components/form-field";

export function RegisterCard() {
  return (
    <AuthFormShell
      eyebrow="Einfach starten"
      title="Profil schnell anlegen"
      description="Nur das Wichtigste ausfuellen und direkt in die naechsten Gespräche starten."
      submitLabel="Konto erstellen"
      altLabel="Ich habe schon ein Konto"
      altHref="/login"
    >
      <FormField label="Email" placeholder="you@puq.me" type="email" />
      <FormField label="Passwort" placeholder="Sicheres Passwort waehlen" type="password" />
      <FormField label="Anzeigename" placeholder="So sehen dich deine Matches" />
    </AuthFormShell>
  );
}
