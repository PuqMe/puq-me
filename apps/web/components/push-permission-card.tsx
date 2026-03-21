"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { registerPushDevice } from "@/lib/social";

// VAPID public key - lazy access to avoid issues in edge runtime
function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushPermissionCard() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<string>(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );
  const [isRegistering, setIsRegistering] = useState(false);

  async function requestPermission() {
    if (typeof Notification === "undefined") {
      setStatus("unsupported");
      return;
    }

    setIsRegistering(true);

    try {
      const permission = await Notification.requestPermission();
      setStatus(permission);

      if (permission === "granted") {
        // Register push subscription with backend
        const registration = await navigator.serviceWorker.ready;

        let subscription = await registration.pushManager.getSubscription();

        if (!subscription && getVapidPublicKey()) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(getVapidPublicKey()),
          });
        }

        if (subscription) {
          await registerPushDevice(subscription);
        }
      }
    } catch (error) {
      console.warn("Push registration failed:", error);
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <article className="glass-card rounded-[2rem] p-4 text-white">
      <div className="text-sm font-semibold text-white">{t.pushTitle}</div>
      <p className="mt-2 text-sm leading-6 text-white/70">
        {t.pushDesc}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.18em] text-white/48">{t.pushStatus.replace("{status}", status)}</div>
        {status !== "granted" && (
          <button
            className="glow-button rounded-2xl px-4 py-3 text-xs font-medium text-white"
            onClick={requestPermission}
            disabled={isRegistering}
          >
            {isRegistering ? t.loading : t.pushEnable}
          </button>
        )}
        {status === "granted" && (
          <span className="text-xs text-emerald-400 font-medium">✓ Aktiv</span>
        )}
      </div>
    </article>
  );
}
