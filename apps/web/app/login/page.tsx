"use client";

import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { signInDemo } = useAuth();

  return (
    <main className="safe-px safe-pb mx-auto flex min-h-screen w-full max-w-md items-center py-6">
      <div className="w-full" onClick={() => undefined}>
        <div className="mb-4 px-1">
          <div className="soft-pill inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">Einfach starten</div>
          <p className="mt-3 text-sm leading-6 text-white/72">Einloggen, chatten und Menschen in der Nähe finden, ohne komplizierte Schritte.</p>
        </div>
        <AuthCard />
        <button
          className="glass-card mt-4 w-full rounded-[1.4rem] px-4 py-4 text-sm font-semibold text-white"
          onClick={() => {
            signInDemo();
            router.push("/discover");
          }}
          type="button"
        >
          Mit Demo fortfahren
        </button>
      </div>
    </main>
  );
}
