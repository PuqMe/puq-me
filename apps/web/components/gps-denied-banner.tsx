"use client";

import { useState } from "react";

export function GpsDeniedBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div style={{
      position: "fixed",
      top: "env(safe-area-inset-top, 0px)",
      left: 0,
      right: 0,
      zIndex: 999,
      background: "rgba(88, 28, 135, 0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(168, 85, 247, 0.3)",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      fontFamily: "system-ui, sans-serif",
      fontSize: 13,
      color: "rgba(255, 255, 255, 0.85)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
        <span style={{ fontSize: 16 }}>📍</span>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>Location access denied</div>
          <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.6)" }}>
            Some features limited. Check browser settings.
          </div>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: "transparent",
          border: "none",
          color: "rgba(255, 255, 255, 0.5)",
          cursor: "pointer",
          padding: "4px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
