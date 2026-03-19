"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { useAuth } from "@/lib/auth";
import { navigateToPostAuthPath } from "@/lib/post-auth";

export default function HomePage() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authenticated") {
      void navigateToPostAuthPath(router);
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <main className="auth-shell safe-px">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "2px solid #a855f7",
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
              }}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-shell safe-px">
      <div className="mx-auto w-full max-w-sm">
        <AuthCard />
      </div>
    </main>
  );
}
