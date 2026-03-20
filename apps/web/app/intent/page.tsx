"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { updateFreeNowStatus } from "@/lib/social";
import { fetchMyProfile } from "@/lib/profile";

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
  const [nearbyCount, setNearbyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const selected = INTENT_CATEGORIES.find((c) => c.id === selectedCategory);

  // Load profile and restore intent on mount
  useEffect(() => {
    const initializeIntent = async () => {
      try {
        // Load profile to check freeNow/visibility status
        const profile = await fetchMyProfile();
        if (profile.freeNow) {
          setIntentActive(true);
          // Restore intent details from localStorage if available
          const savedIntent = localStorage.getItem("puqme.intent.current");
          if (savedIntent) {
            const intent = JSON.parse(savedIntent);
            setSelectedCategory(intent.category);
            // Check if intent is still valid (not expired)
            if (new Date(intent.expiresAt) > new Date()) {
              const remaining = Math.ceil(
                (new Date(intent.expiresAt).getTime() - Date.now()) / 60000
              );
              setTimeRemaining(Math.max(0, remaining));
            } else {
              localStorage.removeItem("puqme.intent.current");
              setIntentActive(false);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeIntent();
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (!intentActive || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIntentActive(false);
          localStorage.removeItem("puqme.intent.current");
          showToast("Intent abgelaufen");
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [intentActive]);

  // Fetch nearby users count
  useEffect(() => {
    const fetchNearby = async () => {
      try {
        const response = await fetch("/api/social/nearby");
        if (response.ok) {
          const data = await response.json();
          setNearbyCount(data.users?.length || 0);
        }
      } catch (error) {
        console.error("Failed to fetch nearby users:", error);
      }
    };

    if (intentActive) {
      fetchNearby();
      const interval = setInterval(fetchNearby, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [intentActive]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleIntentToggle = async (newState: boolean) => {
    setSaving(true);
    try {
      // Call API to update freeNow status
      await updateFreeNowStatus(newState);
      setIntentActive(newState);

      if (newState) {
        // Activate intent: store in localStorage
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 120 * 60000); // 120 minutes
        const intentData = {
          category: selectedCategory,
          emoji: selected?.emoji,
          text: selected?.label,
          activatedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
        };
        localStorage.setItem("puqme.intent.current", JSON.stringify(intentData));
        setTimeRemaining(120);
        showToast("Intent aktiviert!");
      } else {
        // Deactivate intent: clear localStorage
        localStorage.removeItem("puqme.intent.current");
        showToast("Intent deaktiviert");
      }
    } catch (error) {
      console.error("Failed to update intent:", error);
      showToast("Fehler beim Aktualisieren");
    } finally {
      setSaving(false);
    }
  };

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
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
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
                fontSize: "clamp(0.8rem, 2.5vw, 1rem)",
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
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
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
                    fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
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
                    fontSize: "clamp(0.8rem, 2.5vw, 1rem)",
                    color: "rgba(255,255,255,0.6)",
                    margin: "0 0 4px 0",
                  }}
                >
                  Aktueller Intent
                </p>
                <p
                  style={{
                    fontSize: "clamp(1rem, 2.8vw, 1.125rem)",
                    fontWeight: "600",
                    color: "#ffffff",
                    margin: "0",
                  }}
                >
                  {selected?.emoji} {selected?.label}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  minWidth: "44px",
                  minHeight: "44px",
                }}
              >
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
                      width: "24px",
                      height: "24px",
                      cursor: "pointer",
                      accentColor: "#a855f7",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {intentActive ? "Aktiv" : "Inaktiv"}
                  </span>
                </label>
              </div>
            </div>

            {/* Visibility Info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
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
                fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
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
                fontSize: "clamp(1rem, 2.8vw, 1.125rem)",
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
                fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
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
              {Array.from({ length: Math.min(3, nearbyCount) }).map((_, idx) => (
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
                  {String.fromCharCode(65 + idx)}
                </div>
              ))}
              {nearbyCount > 3 && (
                <div
                  style={{
                    marginLeft: "-4px",
                    paddingLeft: "8px",
                    fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
                    color: "#a855f7",
                    fontWeight: "500",
                  }}
                >
                  +{nearbyCount - 3} mehr
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => handleIntentToggle(!intentActive)}
            disabled={saving}
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
              fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
              fontWeight: "600",
              cursor: saving ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              marginBottom: "24px",
              opacity: saving ? 0.6 : 1,
              minHeight: "44px",
            }}
          >
            {saving
              ? "Wird gespeichert..."
              : intentActive
                ? "Intent deaktivieren"
                : "Intent aktivieren"}
          </button>

          {/* Toast Notification */}
          {toast && (
            <div
              style={{
                position: "fixed",
                bottom: "calc(env(safe-area-inset-bottom, 0px) + 100px)",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(168,85,247,0.9)",
                color: "#ffffff",
                padding: "12px 20px",
                borderRadius: "8px",
                fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
                zIndex: 50,
              }}
            >
              {toast}
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
// build trigger 1774020619
