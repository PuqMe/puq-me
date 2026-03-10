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
        <RegisterCard />
        <button
          className="mt-4 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-4 text-sm font-medium text-ink"
          onClick={() => {
            signInDemo();
            router.push("/onboarding");
          }}
          type="button"
        >
          Create demo account
        </button>
      </div>
    </main>
  );
}
