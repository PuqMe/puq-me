"use client";

import type { PropsWithChildren } from "react";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/lib/i18n";

export function Providers({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </AuthProvider>
  );
}
