"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { fetchNearbyUsers, sendWave } from "@/lib/social";

const DEMO_CARDS = [
  {
    id: 1,
    avatar: "M",
    color: "#e879f9",
    name: "Maya",
    distance: "120m",
    time: "vor 2 Min",
    expireIn: "1h",
    emoji: "☕",
    action: "Kaffee trinken",
    isLive: true,
  },
  {
    id: 2,
    avatar: "T",
    color: "#38bdf8",
    name: "Tom",
    distance: "280m",
    time: "vor 5 Min",
    expireIn: "1.5h",
    emoji: "🏃",
    action: "Joggen gehen",
    isLive: true,
  },
  {
    id: 3,
    avatar: "A",
    color: "#4ade80",
    name: "Anna",
    distance: "450m",
    time: "vor 8 Min",
    expireIn: "2h",
    emoji: "💼",
    action: "Coworking Space",
    isLive: false,
  },
];

export default function CardsPage() {
  const [cards, setCards] = useState(DEMO_CARDS);
  const [showNewCardPrompt, setShowNewCardPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Load nearby users on mount
  useEffect(() => {
    const loadNearbyUsers = async () => {
      try {
        // Get geolocation
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                // Fetch nearby users with current location
                const nearbyUsers = await fetchNearbyUsers({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });

                // Map NearbyUser items to card format
                const mappedCards = nearbyUsers.map(
                  (user: any, idx: number) => ({
                    id: idx + 1,
                    avatar: user.displayName?.charAt(0).toUpperCase() || "U",
                    color: `hsl(${idx * 60}, 70%, 55%)`,
                    name: user.displayName,
                    distance: `${Math.round(user.distanceKm * 1000)}m`,
                    time: "gerade aktiv",
                    expireIn: "1h",
                    emoji: "🎯",
                    action: user.bio || "Aktiv jetzt",
                    isLive: user.isOnline,
                  })
                );

                // Combine real nearby users with demo fallback
                setCards(mappedCards.length > 0 ? mappedCards : DEMO_CARDS);
              } catch (error) {
                console.error("Failed to fetch nearby users:", error);
                setCards(DEMO_CARDS); // Fallback to demo
              }
            },
            (error) => {
              console.error("Geolocation error:", error);
              setCards(DEMO_CARDS); // Fallback if geolocation fails
            }
          );
        } else {
          setCards(DEMO_CARDS); // Fallback if geolocation not available
        }
      } finally {
        setLoading(false);
      }
    };

    loadNearbyUsers();
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCardAction = async (
    cardId: number,
    action: "join" | "message",
    userId?: string
  ) => {
    if (action === "join" && userId) {
      setSending(cardId);
      try {
        // Call sendWave API
        await sendWave(userId);
        // Remove card on successful join
        setCards((prev) => prev.filter((c) => c.id !== cardId));
        showToast("Wave gesendet! 👋");
        // Store in localStorage
        const myCards = JSON.parse(localStorage.getItem("puqme.cards.mine") || "[]");
        myCards.push({ cardId, userId, timestamp: new Date().toISOString() });
        localStorage.setItem("puqme.cards.mine", JSON.stringify(myCards));
      } catch (error) {
        console.error("Failed to send wave:", error);
        showToast("Fehler beim Senden");
      } finally {
        setSending(null);
      }
    }
  };

  return (
    <AppShell title="In deiner Nähe" active="/cards">
      <main
        style={{
          background: "#07050f",
          minHeight: "100vh",
          paddingBottom: "100px",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 16px" }}>
          {/* Header */}
          <div style={{ marginTop: "20px", marginBottom: "28px" }}>
            <h1
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: "700",
                color: "#ffffff",
                margin: "0 0 8px 0",
                letterSpacing: "-0.01em",
              }}
            >
              In deiner Nähe
            </h1>
            <p
              style={{
                fontSize: "clamp(0.8rem, 2.5vw, 1rem)",
                color: "rgba(255,255,255,0.6)",
                margin: "0",
                lineHeight: "1.4",
              }}
            >
              Aktionen und Einladungen — kein Feed
            </p>
          </div>

          {/* Cards Grid */}
          <div
            style={{
              display: "grid",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            {cards.map((card) => (
              <div
                key={card.id}
                style={{
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "16px",
                  display: "grid",
                  gap: "12px",
                }}
              >
                {/* Card Header: Avatar, Name, Time */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        position: "relative",
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${card.color}66, ${card.color}33)`,
                        border: "2px solid #a855f7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#ffffff",
                      }}
                    >
                      {card.avatar}
                      {card.isLive && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "0px",
                            right: "0px",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "#22c55e",
                            border: "2px solid #07050f",
                          }}
                        />
                      )}
                    </div>
                    <div style={{ lineHeight: "1.3" }}>
                      <p
                        style={{
                          fontSize: "clamp(0.8rem, 2.5vw, 1rem)",
                          fontWeight: "600",
                          color: "#ffffff",
                          margin: "0",
                        }}
                      >
                        {card.name}
                      </p>
                      <p
                        style={{
                          fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
                          color: "rgba(255,255,255,0.5)",
                          margin: "0",
                        }}
                      >
                        {card.distance} · {card.time}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
                      color: "rgba(255,255,255,0.5)",
                      textAlign: "right",
                      lineHeight: "1.3",
                    }}
                  >
                    <p style={{ margin: "0" }}>Verschwindet in</p>
                    <p
                      style={{
                        margin: "0",
                        color: "#a855f7",
                        fontWeight: "600",
                      }}
                    >
                      {card.expireIn}
                    </p>
                  </div>
                </div>

                {/* Action Text */}
                <div
                  style={{
                    fontSize: "clamp(0.8rem, 2.5vw, 1rem)",
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: "1.4",
                  }}
                >
                  <span style={{ marginRight: "6px" }}>{card.emoji}</span>
                  {card.action}
                </div>

                {/* Timer Progress Bar */}
                <div
                  style={{
                    height: "4px",
                    borderRadius: "2px",
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: card.id === 1 ? "50%" : card.id === 2 ? "65%" : "85%",
                      background: "linear-gradient(90deg, #a855f7, #d946ef)",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    marginTop: "4px",
                  }}
                >
                  <button
                    onClick={() => handleCardAction(card.id, "join", `user_${card.id}`)}
                    disabled={sending === card.id}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      border: "none",
                      background: "linear-gradient(135deg, #a855f7, #d946ef)",
                      color: "#ffffff",
                      fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
                      fontWeight: "600",
                      cursor: sending === card.id ? "not-allowed" : "pointer",
                      transition: "all 0.2s ease",
                      opacity: sending === card.id ? 0.6 : 1,
                      minHeight: "44px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {sending === card.id ? "Wird gesendet..." : "Bin dabei!"}
                  </button>
                  <button
                    onClick={() => handleCardAction(card.id, "message")}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.05)",
                      color: "#ffffff",
                      fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      minHeight: "44px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    💬 Nachricht
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {cards.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <p style={{ fontSize: "clamp(0.8rem, 2.5vw, 1rem)", margin: "0" }}>
                Keine aktiven Aktionen in deiner Nähe
              </p>
            </div>
          )}

          {/* Footer Info */}
          <div
            style={{
              textAlign: "center",
              paddingTop: "20px",
              fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
              color: "rgba(255,255,255,0.4)",
              lineHeight: "1.6",
            }}
          >
            <p style={{ margin: "0" }}>Kein Feed · Nur aktuelle Aktionen</p>
            <p style={{ margin: "8px 0 0 0" }}>Alles verschwindet automatisch</p>
          </div>
        </div>

        {/* FAB Button */}
        <button
          onClick={() => setShowNewCardPrompt(!showNewCardPrompt)}
          style={{
            position: "fixed",
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 90px)",
            right: "16px",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg, #a855f7, #d946ef)",
            color: "#ffffff",
            fontSize: "28px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(168,85,247,0.4)",
            transition: "all 0.2s ease",
          }}
        >
          +
        </button>

        {/* New Card Toast */}
        {showNewCardPrompt && (
          <div
            style={{
              position: "fixed",
              bottom: "170px",
              right: "16px",
              background: "rgba(10,8,25,0.95)",
              border: "1px solid rgba(168,85,247,0.3)",
              borderRadius: "12px",
              padding: "16px",
              maxWidth: "280px",
              backdropFilter: "blur(10px)",
              zIndex: 40,
            }}
          >
            <p
              style={{
                fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
                color: "rgba(255,255,255,0.8)",
                margin: "0 0 12px 0",
                lineHeight: "1.4",
              }}
            >
              Erstelle eine neue Aktion, um andere in deiner Nähe einzuladen
            </p>
            <button
              onClick={() => setShowNewCardPrompt(false)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                background: "#a855f7",
                color: "#ffffff",
                fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
                fontWeight: "600",
                cursor: "pointer",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Neue Aktion erstellen
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
            }}
          >
            <div
              style={{
                fontSize: "clamp(0.8rem, 2.5vw, 1rem)",
                color: "#ffffff",
              }}
            >
              Lädt Aktionen...
            </div>
          </div>
        )}

        {/* Action Toast */}
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
      </main>
    </AppShell>
  );
}
