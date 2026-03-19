"use client";

import { useEffect, useState } from "react";

type DeferredInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    __puqInstallPrompt: DeferredInstallPrompt | undefined;
  }
}

const DISMISS_KEY = "puq-install-dismissed";

export function InstallNowFab() {
  const [available, setAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(true); // start hidden until we confirm

  useEffect(() => {
    // Already installed as PWA → never show
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // User previously dismissed → never show
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    function syncState() {
      setAvailable(Boolean(window.__puqInstallPrompt));
      setDismissed(false);
    }

    window.addEventListener("beforeinstallprompt", syncState);

    // If the event already fired (stored on window)
    if (window.__puqInstallPrompt) {
      syncState();
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", syncState);
    };
  }, []);

  async function handleInstall() {
    const promptEvent = window.__puqInstallPrompt;
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    window.__puqInstallPrompt = undefined;
    handleDismiss();
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  if (dismissed || !available) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-[60] flex justify-center px-4 lg:bottom-4">
      <div className="glass-card flex w-full max-w-sm items-center gap-3 rounded-[1.2rem] px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#a855f7]/20 text-lg">
          📱
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white">App installieren</div>
          <div className="text-[11px] text-white/60">Vollbild &amp; Schnellzugriff</div>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="glow-button shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
        >
          Install
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Schließen"
          className="shrink-0 rounded-full p-1 text-white/50 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
