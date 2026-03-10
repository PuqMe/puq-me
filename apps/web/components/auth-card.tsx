import { AuthFormShell } from "@/components/auth-form-shell";
import { FormField } from "@/components/form-field";

export function AuthCard() {
  return (
    <AuthFormShell
      eyebrow="Login"
      title="Welcome back"
      description="Sign in to continue swiping, reconnect with matches and resume chat."
      submitLabel="Login"
      altLabel="Create an account"
      altHref="/register"
    >
      <FormField label="Email" placeholder="you@puq.me" type="email" />
      <FormField label="Password" placeholder="Your secure password" type="password" />
    </AuthFormShell>
  );
}
