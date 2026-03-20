"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";

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

  const handleCardAction = (cardId: number, action: "join" | "message") => {
    if (action === "join") {
      // Remove card on join
      setCards((prev) => prev.filter((c) => c.id !== cardId));
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
                fontSize: "28px",
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
                fontSize: "14px",
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
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#ffffff",
                          margin: "0",
                        }}
                      >
                        {card.name}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
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
                      fontSize: "12px",
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
                    fontSize: "14px",
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
                    onClick={() => handleCardAction(card.id, "join")}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      border: "none",
                      background: "linear-gradient(135deg, #a855f7, #d946ef)",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Bin dabei!
                  </button>
                  <button
                    onClick={() => handleCardAction(card.id, "message")}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.05)",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
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
              <p style={{ fontSize: "14px", margin: "0" }}>
                Keine aktiven Aktionen in deiner Nähe
              </p>
            </div>
          )}

          {/* Footer Info */}
          <div
            style={{
              textAlign: "center",
              paddingTop: "20px",
              fontSize: "12px",
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
            bottom: "90px",
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
                fontSize: "13px",
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
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Neue Aktion erstellen
            </button>
          </div>
        )}
      </main>
    </AppShell>
  );
}
