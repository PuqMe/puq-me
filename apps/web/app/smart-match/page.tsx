"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const FILTER_OPTIONS = [
  { id: "all", label: "Alle" },
  { id: "coffee", emoji: "☕", label: "Kaffee" },
  { id: "sport", emoji: "🏃", label: "Sport" },
  { id: "business", emoji: "💼", label: "Business" },
];

const DEMO_MATCHES = [
  {
    id: 1,
    avatar: "M",
    color: "#e879f7",
    name: "Maya",
    percentage: 94,
    intent: "☕ Kaffee",
    distance: "120m entfernt",
    activity: "jetzt aktiv",
    tags: ["Gleicher Intent", "5× begegnet", "Ähnliche Hobbys"],
    isLive: true,
  },
  {
    id: 2,
    avatar: "J",
    color: "#38bdf8",
    name: "Jonas",
    percentage: 87,
    intent: "🏃 Joggen",
    distance: "280m entfernt",
    activity: "vor 10 Min aktiv",
    tags: ["Gleiches Viertel", "3× begegnet", "Fitness Enthusiast"],
    isLive: true,
  },
  {
    id: 3,
    avatar: "S",
    color: "#4ade80",
    name: "Sarah",
    percentage: 78,
    intent: "💼 Coworking",
    distance: "450m entfernt",
    activity: "vor 2 Std aktiv",
    tags: ["Startup Gründer", "Tech Interesse", "Netzwerken"],
    isLive: false,
  },
];

export default function SmartMatchPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");

  return (
    <AppShell title="Deine Matches" active="/smart-match">
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
              Deine Matches
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.6)",
                margin: "0",
                lineHeight: "1.4",
              }}
            >
              Basiert auf Ort + Zeit + Intent + Interessen
            </p>
          </div>

          {/* Filter Chips */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              overflowX: "auto",
              marginBottom: "28px",
              paddingBottom: "4px",
              scrollBehavior: "smooth",
            }}
          >
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedFilter(opt.id)}
                style={{
                  padding: opt.emoji ? "8px 12px" : "8px 16px",
                  borderRadius: "20px",
                  border: "1px solid transparent",
                  background:
                    selectedFilter === opt.id
                      ? "rgba(168,85,247,0.25)"
                      : "rgba(255,255,255,0.06)",
                  borderColor:
                    selectedFilter === opt.id
                      ? "#a855f7"
                      : "rgba(255,255,255,0.12)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: opt.emoji ? "6px" : "0",
                }}
              >
                {opt.emoji && <span>{opt.emoji}</span>}
                {opt.label}
              </button>
            ))}
          </div>

          {/* Section Header: Beste Matches */}
          <div style={{ marginBottom: "20px" }}>
            <h2
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#ffffff",
                margin: "0",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Beste Matches jetzt
            </h2>
          </div>

          {/* Match Rows */}
          <div
            style={{
              display: "grid",
              gap: "12px",
              marginBottom: "32px",
            }}
          >
            {DEMO_MATCHES.map((match, idx) => (
              <Link
                key={match.id}
                href={`/profile/${match.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    borderRadius: "14px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "16px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      position: "relative",
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${match.color}66, ${match.color}33)`,
                      border: "2px solid #a855f7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#ffffff",
                      flexShrink: 0,
                    }}
                  >
                    {match.avatar}
                    {match.isLive && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-2px",
                          right: "-2px",
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: "#22c55e",
                          border: "2.5px solid #07050f",
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Name + Percentage */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "8px",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#ffffff",
                        }}
                      >
                        {match.name}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#a855f7",
                        }}
                      >
                        · {match.percentage}%
                      </span>
                    </div>

                    {/* Description */}
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.6)",
                        marginBottom: "10px",
                        lineHeight: "1.4",
                      }}
                    >
                      {match.intent} · {match.distance} · {match.activity}
                    </div>

                    {/* Tag Chips */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                      }}
                    >
                      {match.tags.map((tag, tagIdx) => (
                        <span
                          key={tagIdx}
                          style={{
                            fontSize: "11px",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            background: "rgba(168,85,247,0.15)",
                            color: "rgba(168,85,247,0.9)",
                            border: "0.5px solid rgba(168,85,247,0.3)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Chevron */}
                  <div
                    style={{
                      fontSize: "20px",
                      color: "rgba(255,255,255,0.3)",
                      flexShrink: 0,
                    }}
                  >
                    ›
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.1), rgba(255,255,255,0))",
              margin: "32px 0",
            }}
          />

          {/* Matching Factors */}
          <div>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#ffffff",
                margin: "0 0 20px 0",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Matching-Faktoren
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {[
                { emoji: "📍", label: "Ort" },
                { emoji: "⏱", label: "Zeit" },
                { emoji: "🎯", label: "Intent" },
                { emoji: "💡", label: "Interessen" },
              ].map((factor, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>{factor.emoji}</span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {factor.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
