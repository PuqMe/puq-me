"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

export function PushPermissionCard() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<string>(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );

  async function requestPermission() {
    if (typeof Notification === "undefined") {
      setStatus("unsupported");
      return;
    }

    const permission = await Notification.requestPermission();
    setStatus(permission);
  }

  return (
    <article className="glass-card rounded-[2rem] p-4 text-white">
      <div className="text-sm font-semibold text-white">{t.pushTitle}</div>
      <p className="mt-2 text-sm leading-6 text-white/70">
        {t.pushDesc}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.18em] text-white/48">{t.pushStatus.replace("{status}", status)}</div>
        <button className="glow-button rounded-2xl px-4 py-3 text-xs font-medium text-white" onClick={requestPermission}>
          {t.pushEnable}
        </button>
      </div>
    </article>
  );
}
