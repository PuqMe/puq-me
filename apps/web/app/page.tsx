"use client";

import { AuthCard } from "@/components/auth-card";
import { HomeFeed } from "@/components/home-feed";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  const { status } = useAuth();

  // Loading spinner
  if (status === "loading") {
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

  // Authenticated → show new home feed (Startseite)
  if (status === "authenticated") {
    return <HomeFeed />;
  }

  // Not authenticated → login
  return (
    <main className="auth-shell safe-px">
      <div className="mx-auto w-full max-w-sm">
        <AuthCard />
      </div>
    </main>
  );
}
