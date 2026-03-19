"use client";

import { AuthCard } from "@/components/auth-card";

export default function LoginPage() {
  return (
    <main className="auth-shell safe-px">
      <div className="mx-auto w-full max-w-sm">
        <AuthCard />
      </div>
    </main>
  );
}
