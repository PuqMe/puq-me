"use client";

import { AuthCard } from "@/components/auth-card";

export default function LoginPage() {
  return (
    <main className="safe-px safe-pb mx-auto flex min-h-screen w-full max-w-md items-center py-6">
      <div className="w-full">
        <div className="mb-4 px-1">
          <div className="soft-pill inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">Einfach starten</div>
          <p className="mt-3 text-sm leading-6 text-white/72">Einloggen, chatten und Menschen in der Nähe finden, ohne komplizierte Schritte.</p>
        </div>
        <AuthCard />
      </div>
    </main>
  );
}
