"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { S02_Splash } from "@/components/showcase/screens/onboarding";
import { PuqAppRoot, AuthProvider, useAuth } from "@/components/showcase/app-shell";

function Inner() {
  const router = useRouter();
  const { user, loading } = useAuth();
  useEffect(() => {
    const t = setTimeout(() => {
      if (loading) return;
      if (user?.hasVisibility) router.replace("/encounter");
      else if (user?.hasProfile) router.replace("/visibility");
      else if (user) router.replace("/profile/create");
      else router.replace("/language");
    }, 1500);
    return () => clearTimeout(t);
  }, [router, user, loading]);
  return (
    <main className="min-h-[100dvh] bg-puq-deep text-puq-text">
      <S02_Splash />
    </main>
  );
}

export default function SplashPage() {
  return (
    <PuqAppRoot>
      <AuthProvider>
        <Inner />
      </AuthProvider>
    </PuqAppRoot>
  );
}
