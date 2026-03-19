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

export function InstallNowFab() {
  const [available, setAvailable] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function syncInstallState() {
      setAvailable(Boolean(window.__puqInstallPrompt));
      setInstalled(window.matchMedia("(display-mode: standalone)").matches);
    }

    function handleBeforeInstallPrompt() {
      syncInstallState();
    }

    syncInstallState();
    window.addEventListener("appinstalled", syncInstallState);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("appinstalled", syncInstallState);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstall() {
    const promptEvent = window.__puqInstallPrompt;

    if (!promptEvent) {
      return;
    }

    await promptEvent.prompt();
    await promptEvent.userChoice;
    window.__puqInstallPrompt = undefined;
    setAvailable(false);
  }

  if (installed) {
    return null;
  }

  return (
    <div className="safe-px safe-pb pointer-events-none fixed bottom-0 right-0 z-[60] w-full max-w-md">
      <div className="pointer-events-auto ml-auto flex w-[13rem] flex-col items-end gap-2 pb-3">
          <div className="glass-card rounded-[1.4rem] px-4 py-3 text-right text-xs text-white/78">
            <div className="font-semibold text-white">Browser installieren</div>
            <div className="mt-1 text-[11px]">{available ? "Fuer Schnellzugriff und Vollbildmodus." : "Installation im Browser verfuegbar, sobald unterstuetzt."}</div>
          </div>
        <button
          className="glow-button rounded-full px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
          disabled={!available}
          onClick={handleInstall}
          type="button"
        >
          Jetzt installieren
        </button>
      </div>
    </div>
  );
}
