"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAdminAuth } from "@/lib/admin-auth";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useAdminAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-5 text-sm text-slate-300 backdrop-blur">
          Preparing admin workspace...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
