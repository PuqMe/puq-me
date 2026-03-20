"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useLanguage } from "@/lib/i18n";

const DynamicMap = dynamic(() => import("@/components/encounter-map"), { ssr: false });

interface EncounterHistoryItem {
  date: string;
  time: string;
  area: string;
  latitude?: number;
  longitude?: number;
  mutual?: boolean;
}

interface EncounterDetail {
  userId: string;
  displayName: string;
  age: number;
  primaryPhotoUrl?: string;
  area?: string;
  totalEncounters: number;
  firstEncounterDate: string;
  lastEncounterDate: string;
  commonArea: string;
  encounters: EncounterHistoryItem[];
}

function getInitial(name: string | undefined): string {
  const result = (name ?? "").charAt(0).toUpperCase();
  return result as string;
}

function AvatarCircle({ initial, color }: { initial: string | undefined; color: string }) {
  return (
    <div style={{
      width: 80,
      height: 80,
      borderRadius: "50%",
      background: color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 36,
      fontWeight: 700,
      color: "#fff",
      boxShadow: `0 8px 32px ${color}40`,
    }}>
      {initial ?? ""}
    </div>
  );
}

function BackButton() {
  return (
    <Link href="/circle" style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 16px",
      background: "rgba(168,85,247,.1)",
      border: "1px solid rgba(168,85,247,.3)",
      borderRadius: 6,
      color: "#c084fc",
      fontSize: 14,
      fontWeight: 600,
      textDecoration: "none",
      cursor: "pointer",
      transition: "all 0.2s ease",
    }}>
      ← Back
    </Link>
  );
}

export default function EncounterDetailPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const [encounter, setEncounter] = useState<EncounterDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulated fallback/demo data
    const demoEncounter: EncounterDetail = {
      userId: params.id,
      displayName: params.id === "demo-1" ? "Maya" : "Noor",
      age: params.id === "demo-1" ? 29 : 26,
      area: params.id === "demo-1" ? "Kreuzberg" : "Neuköln",
      totalEncounters: params.id === "demo-1" ? 5 : 1,
      firstEncounterDate: params.id === "demo-1" ? "2024-01-15" : "2024-03-18",
      lastEncounterDate: params.id === "demo-1" ? "2024-03-20" : "2024-03-18",
      commonArea: params.id === "demo-1" ? "Kreuzberg & Tempelhof" : "Neuköln",
      encounters: params.id === "demo-1" ? [
        { date: "2024-03-20", time: "14:30", area: "Kreuzberg", mutual: true },
        { date: "2024-03-18", time: "11:15", area: "Kreuzberg", mutual: false },
        { date: "2024-03-10", time: "09:45", area: "Tempelhof", mutual: true },
        { date: "2024-02-28", time: "16:20", area: "Kreuzberg", mutual: false },
        { date: "2024-01-15", time: "13:00", area: "Kreuzberg", mutual: true },
      ] : [
        { date: "2024-03-18", time: "11:15", area: "Neuköln", mutual: false },
      ],
    };

    setTimeout(() => {
      setEncounter(demoEncounter);
      setIsLoading(false);
    }, 300);
  }, [params.id]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#07050f",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "2px solid #a855f7",
            borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }} />
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!encounter) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#07050f",
        color: "#fff",
        padding: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, marginBottom: 16 }}>{t.error}</p>
          <BackButton />
        </div>
      </div>
    );
  }

  const enc = encounter as EncounterDetail;
  const COLORS = ["#f15bb5", "#38bdf8", "#fbbf24", "#4ade80", "#ec4899", "#06b6d4", "#eab308", "#10b981"];
  const colorIndex = parseInt(enc.userId.split("-")[1] || "0", 10) % COLORS.length;
  const color = COLORS[colorIndex] ?? "#a855f7";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07050f",
      color: "#fff",
      paddingBottom: 40,
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: "20px 20px",
        borderBottom: "1px solid rgba(168,85,247,.15)",
        background: "linear-gradient(135deg, rgba(168,85,247,.05) 0%, rgba(7,5,15,0) 100%)",
      }}>
        <BackButton />
      </div>

      {/* ── Main Content ── */}
      <div style={{ padding: "32px 20px", maxWidth: 600, margin: "0 auto" }}>
        {/* Avatar & Name Section */}
        <div style={{
          textAlign: "center",
          marginBottom: 40,
        }}>
          <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
            <AvatarCircle initial={getInitial(enc.displayName)} color={color} />
          </div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 4,
            color: "#fff",
          }}>
            {enc.displayName}, {enc.age}
          </h1>
          <p style={{
            fontSize: 14,
            color: "rgba(255,255,255,.6)",
            marginBottom: 16,
          }}>
            {enc.area}
          </p>
        </div>

        {/* ── Map Section ── */}
        <div style={{
          marginBottom: 32,
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(168,85,247,.2)",
          background: "#0a0815",
          height: 300,
        }}>
          <DynamicMap lat={52.52} lng={13.405} />
        </div>

        {/* ── Stats Section ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 32,
        }}>
          <div style={{
            padding: 16,
            background: "rgba(168,85,247,.08)",
            borderRadius: 10,
            border: "1px solid rgba(168,85,247,.15)",
          }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 8 }}>
              {t.totalEncounters}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#c084fc" }}>
              {enc.totalEncounters}
            </div>
          </div>

          <div style={{
            padding: 16,
            background: "rgba(168,85,247,.08)",
            borderRadius: 10,
            border: "1px solid rgba(168,85,247,.15)",
          }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 8 }}>
              {t.commonArea}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#c084fc" }}>
              {enc.commonArea}
            </div>
          </div>

          <div style={{
            padding: 16,
            background: "rgba(168,85,247,.08)",
            borderRadius: 10,
            border: "1px solid rgba(168,85,247,.15)",
          }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 8 }}>
              {t.firstEncounter}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#c084fc" }}>
              {new Date(enc.firstEncounterDate).toLocaleDateString()}
            </div>
          </div>

          <div style={{
            padding: 16,
            background: "rgba(168,85,247,.08)",
            borderRadius: 10,
            border: "1px solid rgba(168,85,247,.15)",
          }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 8 }}>
              {t.lastEncounter}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#c084fc" }}>
              {new Date(enc.lastEncounterDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* ── Timeline Section ── */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 16,
            color: "#fff",
          }}>
            {t.encounterTimeline}
          </h2>

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}>
            {enc.encounters.map((encItem, idx) => (
              <div key={`${encItem.date}-${encItem.time}`} style={{
                display: "flex",
                gap: 16,
                paddingBottom: 16,
                borderBottom: idx < enc.encounters.length - 1 ? "1px solid rgba(168,85,247,.1)" : "none",
              }}>
                {/* Timeline dot */}
                <div style={{
                  position: "relative",
                  width: 12,
                  height: 12,
                  flexShrink: 0,
                  marginTop: 6,
                }}>
                  <div style={{
                    position: "absolute",
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: color,
                    border: "3px solid #07050f",
                    boxShadow: `0 0 10px ${color}60`,
                    left: 0,
                    top: 0,
                  }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingTop: 2 }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                      {new Date(encItem.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>
                      {encItem.time}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,.6)",
                    marginBottom: 6,
                  }}>
                    📍 {encItem.area}
                  </div>
                  {encItem.mutual && (
                    <div style={{
                      display: "inline-block",
                      background: "rgba(168,85,247,.3)",
                      color: "#c084fc",
                      padding: "3px 8px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      ⚡ Mutual
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}>
          <button style={{
            padding: "12px 16px",
            background: "transparent",
            border: "1px solid rgba(168,85,247,.3)",
            borderRadius: 8,
            color: "#c084fc",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(168,85,247,.15)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(168,85,247,.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(168,85,247,.3)";
          }}>
            👋 {t.wave}
          </button>

          <button style={{
            padding: "12px 16px",
            background: "transparent",
            border: "1px solid rgba(168,85,247,.3)",
            borderRadius: 8,
            color: "#c084fc",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(168,85,247,.15)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(168,85,247,.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(168,85,247,.3)";
          }}>
            💬 Chat
          </button>

          <button style={{
            padding: "12px 16px",
            background: "transparent",
            border: "1px solid rgba(168,85,247,.3)",
            borderRadius: 8,
            color: "#c084fc",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(168,85,247,.15)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(168,85,247,.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(168,85,247,.3)";
          }}>
            ❤️ Like
          </button>

          <button style={{
            padding: "12px 16px",
            background: "transparent",
            border: "1px solid rgba(220,38,38,.3)",
            borderRadius: 8,
            color: "#f87171",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,38,38,.15)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(220,38,38,.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(220,38,38,.3)";
          }}>
            🚫 Block
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
