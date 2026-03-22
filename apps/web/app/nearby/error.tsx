"use client";

import Link from "next/link";

export default function NearbyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#07050f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        fontFamily: "system-ui, sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(168,85,247,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
        }}
      >
        📍
      </div>
      <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>
        Nearby konnte nicht geladen werden
      </h2>
      <p
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: 14,
          textAlign: "center",
          maxWidth: 300,
          lineHeight: 1.6,
        }}
      >
        Es gab ein Problem beim Laden der Nearby-Seite. Bitte versuche es
        erneut.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={reset}
          style={{
            padding: "12px 24px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #c084fc, #a855f7)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Erneut versuchen
        </button>
        <Link
          href="/"
          style={{
            padding: "12px 24px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.7)",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
