"use client";

import { useLanguage } from "@/lib/i18n";

interface GeolocationConsentProps {
  onAllow: () => void;
  onDeny: () => void;
  isOpen: boolean;
}

export function GeolocationConsent({
  onAllow,
  onDeny,
  isOpen,
}: GeolocationConsentProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "rgba(13,9,24,0.98)",
          border: "1px solid rgba(168,85,247,0.3)",
          borderRadius: 20,
          padding: 24,
          maxWidth: 320,
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(168,85,247,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            margin: "0 auto 16px",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a855f7"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" r="1.5" fill="#a855f7" stroke="none" />
          </svg>
        </div>

        {/* Title */}
        <h2
          style={{
            margin: "0 0 8px 0",
            fontSize: 18,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
          }}
        >
          {t.geolocationTitle}
        </h2>

        {/* Description */}
        <p
          style={{
            margin: "0 0 20px 0",
            fontSize: 13,
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          {t.geolocationDesc}
        </p>

        {/* Privacy highlights */}
        <div
          style={{
            background: "rgba(168,85,247,0.08)",
            border: "1px solid rgba(168,85,247,0.2)",
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <div style={{ marginBottom: 6 }}>
            <strong style={{ color: "rgba(255,255,255,0.9)" }}>
              Location Blurring:
            </strong>{" "}
            Encounters are shown as blurred zones, not exact locations.
          </div>
          <div>
            <strong style={{ color: "rgba(255,255,255,0.9)" }}>
              User Control:
            </strong>{" "}
            You can disable location sharing anytime in settings.
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          <button
            onClick={onDeny}
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(168,85,247,0.3)",
              background: "rgba(168,85,247,0.1)",
              color: "#c084fc",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.background =
                "rgba(168,85,247,0.15)";
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.background =
                "rgba(168,85,247,0.1)";
            }}
          >
            {t.geolocationNotNow}
          </button>
          <button
            onClick={onAllow}
            style={{
              padding: 12,
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #c084fc, #a855f7)",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.opacity = "0.9";
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.opacity = "1";
            }}
          >
            {t.geolocationAllow}
          </button>
        </div>
      </div>
    </div>
  );
}
