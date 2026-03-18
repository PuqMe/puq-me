"use client";

import { useRouter } from "next/navigation";
import { RegisterCard } from "@/components/register-card";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { signInDemo } = useAuth();

  return (
    <main className="safe-px safe-pb mx-auto flex min-h-screen w-full max-w-md items-center py-6">
      <div className="w-full">
        <div className="mb-4 px-1">
          <div className="soft-pill inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">Schnelles Onboarding</div>
          <p className="mt-3 text-sm leading-6 text-white/72">Profil mit wenigen Angaben erstellen und direkt in Radar und Chat starten.</p>
        </div>
        <RegisterCard />
        <button
          className="glass-card mt-4 w-full rounded-[1.4rem] px-4 py-4 text-sm font-semibold text-white"
          onClick={() => {
            signInDemo();
            router.push("/onboarding");
          }}
          type="button"
        >
          Demo-Konto erstellen
        </button>
      </div>
    </main>
  );
}
