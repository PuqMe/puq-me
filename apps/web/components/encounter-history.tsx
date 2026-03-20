"use client";

import { useLanguage } from "@/lib/i18n";
import type { CircleEncounter } from "@/lib/social";

interface EncounterHistoryProps {
  encounters: CircleEncounter[];
  isLoading?: boolean;
  onEncounterClick?: (userId: string) => void;
}

const COLORS = ["#f15bb5", "#38bdf8", "#fbbf24", "#4ade80", "#ec4899", "#06b6d4", "#eab308", "#10b981"];

export function EncounterHistory({
  encounters,
  isLoading = false,
  onEncounterClick,
}: EncounterHistoryProps) {
  const { t } = useLanguage();

  // Sort encounters: newest first
  const sortedEncounters = [...encounters].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "2px solid #a855f7",
            borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto",
          }} />
          <p style={{
            marginTop: 8,
            fontSize: 12,
            color: "rgba(255,255,255,.4)",
          }}>
            {t.loading}
          </p>
        </div>
      </div>
    );
  }

  if (encounters.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "40px 20px",
        color: "rgba(255,255,255,.5)",
      }}>
        <p style={{ fontSize: 14, marginBottom: 8 }}>{t.noEncounters}</p>
        <p style={{ fontSize: 12 }}>{t.noEncountersPeriodDesc}</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: "0 16px",
      display: "flex",
      flexDirection: "column",
      gap: 0,
    }}>
      {sortedEncounters.map((enc, idx) => {
        const colorIndex = sortedEncounters.indexOf(enc) % COLORS.length;
        const color = COLORS[colorIndex];

        return (
          <div
            key={`${enc.userId}-${enc.timestamp}`}
            onClick={() => onEncounterClick?.(enc.userId)}
            style={{
              display: "flex",
              gap: 12,
              padding: "16px 0",
              marginBottom: 0,
              position: "relative",
              cursor: onEncounterClick ? "pointer" : "default",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (onEncounterClick) {
                (e.currentTarget as HTMLDivElement).style.background = "rgba(168,85,247,.08)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "transparent";
            }}
          >
            {/* Timeline line */}
            {idx < sortedEncounters.length - 1 && (
              <div style={{
                position: "absolute",
                left: 19,
                top: "calc(100% - 8px)",
                width: 2,
                height: "calc(100% + 16px)",
                borderLeft: "1px dashed rgba(255,255,255,.2)",
              }} />
            )}

            {/* Avatar */}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
              position: "relative",
              zIndex: 2,
              boxShadow: `0 0 12px ${color}40`,
            }}>
              {enc.displayName[0]}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 4,
                gap: 8,
              }}>
                <div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#fff",
                  }}>
                    {enc.displayName}, {enc.age}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,.6)",
                    marginTop: 2,
                  }}>
                    {enc.area} • {enc.distanceKm?.toFixed(1) || "?"} km
                  </div>
                </div>
                <div style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,.5)",
                  textAlign: "right",
                  flexShrink: 0,
                }}>
                  {enc.timestamp}
                </div>
              </div>

              {/* Description */}
              <div style={{
                fontSize: 12,
                color: "rgba(255,255,255,.65)",
                marginBottom: 8,
                lineHeight: 1.4,
              }}>
                {enc.encounterCount > 1 ? (
                  <>You crossed paths {enc.encounterCount} times</>
                ) : (
                  <>First encounter in the area</>
                )}
              </div>

              {/* Mutual badge + Chevron */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                {enc.mutual && (
                  <div style={{
                    display: "inline-block",
                    background: "rgba(168,85,247,.3)",
                    color: "#c084fc",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                  }}>
                    ⚡ Mutual
                  </div>
                )}
                {onEncounterClick && (
                  <div style={{
                    color: "rgba(255,255,255,.4)",
                    fontSize: 16,
                  }}>
                    &gt;
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
