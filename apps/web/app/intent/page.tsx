"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";

const INTENT_CATEGORIES = [
  { id: "coffee", emoji: "☕", label: "Kaffee" },
  { id: "activity", emoji: "🏃", label: "Aktivität" },
  { id: "meeting", emoji: "🤝", label: "Treffen" },
  { id: "business", emoji: "💼", label: "Business" },
  { id: "social", emoji: "💬", label: "Social" },
  { id: "gaming", emoji: "🎮", label: "Gaming" },
];

export default function IntentPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("coffee");
  const [intentActive, setIntentActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120);

  const selected = INTENT_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <AppShell title="Was machst du gerade?" active="/intent">
      <main
        style={{
          background: "#07050f",
          minHeight: "100vh",
          paddingBottom: "100px",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 16px" }}>
          {/* Header Section */}
          <div style={{ marginTop: "20px", marginBottom: "32px" }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#ffffff",
                margin: "0 0 8px 0",
                letterSpacing: "-0.01em",
              }}
            >
              Was machst du gerade?
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.6)",
                margin: "0",
                lineHeight: "1.4",
              }}
            >
              Wähle deinen aktuellen Zweck
            </p>
          </div>

          {/* Category Chips */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginBottom: "32px",
            }}
          >
            {INTENT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: "16px 12px",
                  borderRadius: "12px",
                  border: "1px solid transparent",
                  background:
                    selectedCategory === cat.id
                      ? "rgba(168,85,247,0.2)"
                      : "rgba(255,255,255,0.05)",
                  borderColor:
                    selectedCategory === cat.id
                      ? "#a855f7"
                      : "rgba(255,255,255,0.1)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "28px" }}>{cat.emoji}</span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "#ffffff",
                  }}
                >
                  {cat.label}
                </span>
              </button>
            ))}
          </div>

          {/* Details Section */}
          <div
            style={{
              borderRadius: "16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.6)",
                    margin: "0 0 4px 0",
                  }}
                >
                  Aktueller Intent
                </p>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#ffffff",
                    margin: "0",
                  }}
                >
                  {selected?.emoji} {selected?.label}
                </p>
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={intentActive}
                  onChange={(e) => setIntentActive(e.target.checked)}
                  style={{
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                    accentColor: "#a855f7",
                  }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {intentActive ? "Aktiv" : "Inaktiv"}
                </span>
              </label>
            </div>

            {/* Visibility Info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                fontSize: "13px",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <span>👁</span>
              <span>Dein Intent ist sichtbar für Nutzer im 500m Umkreis</span>
            </div>
          </div>

          {/* Timer Section */}
          <div
            style={{
              borderRadius: "16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.6)",
                margin: "0 0 12px 0",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: "500",
              }}
            >
              Ablauf
            </p>
            <div
              style={{
                marginBottom: "12px",
                fontSize: "16px",
                fontWeight: "600",
                color: "#ffffff",
              }}
            >
              Verschwindet automatisch in{" "}
              <span style={{ color: "#a855f7" }}>{timeRemaining} Min</span>
            </div>
            <div
              style={{
                height: "6px",
                borderRadius: "3px",
                background: "rgba(255,255,255,0.1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(timeRemaining / 120) * 100}%`,
                  background: "linear-gradient(90deg, #a855f7, #d946ef)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Matching Users */}
          <div
            style={{
              borderRadius: "16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.6)",
                margin: "0 0 14px 0",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: "500",
              }}
            >
              Passende Nutzer jetzt
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "-6px",
              }}
            >
              {["M", "N", "S"].map((initial, idx) => (
                <div
                  key={idx}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, hsl(${idx * 120}, 70%, 50%), hsl(${idx * 120}, 70%, 60%))`,
                    border: "2px solid #07050f",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#ffffff",
                    marginLeft: idx > 0 ? "-8px" : "0",
                    zIndex: 10 - idx,
                  }}
                >
                  {initial}
                </div>
              ))}
              <div
                style={{
                  marginLeft: "-4px",
                  paddingLeft: "8px",
                  fontSize: "13px",
                  color: "#a855f7",
                  fontWeight: "500",
                }}
              >
                +5 mehr
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setIntentActive(!intentActive)}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "none",
              background:
                intentActive
                  ? "linear-gradient(135deg, #a855f7, #d946ef)"
                  : "rgba(168,85,247,0.3)",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginBottom: "24px",
            }}
          >
            {intentActive ? "Intent deaktivieren" : "Intent aktivieren"}
          </button>
        </div>
      </main>
    </AppShell>
  );
}
