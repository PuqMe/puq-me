"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";

const CONSENT_STORAGE_KEY = "puqme.consent";

interface ConsentPreference {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function ConsentBanner() {
  const { t } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent: ConsentPreference = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
    setShowBanner(false);
  };

  const handleNecessaryOnly = () => {
    const consent: ConsentPreference = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9998,
        background: "rgba(7,5,15,0.98)",
        borderTop: "1px solid rgba(168,85,247,0.2)",
        backdropFilter: "blur(12px)",
        paddingBottom: "env(safe-area-inset-bottom)",
        maxHeight: expanded ? "90vh" : "auto",
        overflowY: expanded ? "auto" : "visible",
      }}
    >
      <div style={{ padding: "20px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 12,
            gap: 12,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: 4,
              }}
            >
              {t.consentBanner}
            </h3>
            {!expanded && (
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {t.consentBanner}
              </p>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(168,85,247,0.8)",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              padding: 0,
              whiteSpace: "nowrap",
              marginTop: 2,
            }}
          >
            {expanded ? "−" : "+"}
          </button>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  defaultChecked
                  disabled
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: "#a855f7",
                    cursor: "not-allowed",
                  }}
                />
                <span>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#ffffff",
                    }}
                  >
                    {t.consentEssential}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      marginTop: 2,
                    }}
                  >
                    {t.consentEssentialDesc}
                  </div>
                </span>
              </label>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: "#a855f7",
                  }}
                />
                <span>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#ffffff",
                    }}
                  >
                    {t.consentAnalytics}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      marginTop: 2,
                    }}
                  >
                    {t.consentAnalyticsDesc}
                  </div>
                </span>
              </label>
            </div>

            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: "#a855f7",
                  }}
                />
                <span>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#ffffff",
                    }}
                  >
                    {t.consentMarketing}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      marginTop: 2,
                    }}
                  >
                    {t.consentMarketingDesc}
                  </div>
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          <button
            onClick={handleNecessaryOnly}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
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
            {t.consentNecessaryOnly}
          </button>
          <button
            onClick={handleAcceptAll}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
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
            {t.consentAccept}
          </button>
        </div>
      </div>
    </div>
  );
}
