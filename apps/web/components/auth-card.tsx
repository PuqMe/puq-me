import { AuthFormShell } from "@/components/auth-form-shell";
import { FormField } from "@/components/form-field";

export function AuthCard() {
  return (
    <AuthFormShell
      eyebrow="Schneller Login"
      title="Willkommen zurück"
      description="In Sekunden wieder rein, Chats fortsetzen und direkt nahe Matches sehen."
      submitLabel="Weiter"
      altLabel="Neues Konto erstellen"
      altHref="/register"
    >
      <FormField label="Email" placeholder="you@puq.me" type="email" />
      <FormField label="Passwort" placeholder="Passwort eingeben" type="password" />
    </AuthFormShell>
  );
}
