"use client";

import { useRouter } from "next/navigation";
import { S75_NotifInbox } from "@/components/showcase/screens/system";
import { PuqAppRoot, AuthProvider, OnboardingGate } from "@/components/showcase/app-shell";

export default function NotificationsPage() {
  const router = useRouter();
  return (
    <PuqAppRoot>
      <AuthProvider>
        <OnboardingGate>
          <main className="min-h-[100dvh] bg-puq-deep text-puq-text">
            <div onClick={() => router.back()} className="cursor-pointer">
              {/* Back button is part of ScreenHeader inside the showcase component */}
            </div>
            <S75_NotifInbox />
          </main>
        </OnboardingGate>
      </AuthProvider>
    </PuqAppRoot>
  );
}
