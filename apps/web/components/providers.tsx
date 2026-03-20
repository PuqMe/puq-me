"use client";

import type { PropsWithChildren } from "react";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/lib/i18n";
import { ConsentBanner } from "@/components/consent-banner";

export function Providers({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <LanguageProvider>
        {children}
        <ConsentBanner />
      </LanguageProvider>
    </AuthProvider>
  );
}
