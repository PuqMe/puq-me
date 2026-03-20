"use client";

import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/lib/i18n";
import { ConsentBanner } from "@/components/consent-banner";
import { analyzeBehavior, loadBehaviorProfile } from "@/lib/ai-features";
import { loadRadarMetrics, loadContentAffinity } from "@/lib/radar-ranking";
import { initWebVitals } from "@/lib/web-vitals";

export function Providers({ children }: PropsWithChildren) {
  useEffect(() => {
    // Analyze behavior profile on app start (non-blocking)
    try {
      const metrics = loadRadarMetrics();
      const affinity = loadContentAffinity();
      if (Object.keys(metrics).length > 0) {
        analyzeBehavior(metrics, affinity);
      }
    } catch (e) {
      // Silently ignore - behavior analysis is optional
      console.debug('[PuQ.me] Behavior analysis skipped:', e);
    }

    // Initialize Web Vitals monitoring
    initWebVitals();
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        {children}
        <ConsentBanner />
      </LanguageProvider>
    </AuthProvider>
  );
}
