"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";

export interface Badge {
  id: string;
  nameEn: string;
  nameDe: string;
  descriptionEn: string;
  descriptionDe: string;
  icon: string;
  earned: boolean;
  earnedAt?: string | undefined;
  progress?: number | undefined;
  progressMax?: number | undefined;
}

export const BADGE_DEFINITIONS: Omit<Badge, "earned" | "earnedAt" | "progress" | "progressMax">[] = [
  {
    id: "explorer",
    nameEn: "Explorer",
    nameDe: "Entdecker",
    descriptionEn: "Complete 5 scans",
    descriptionDe: "Führe 5 Scans durch",
    icon: "🗺️"
  },
  {
    id: "social_butterfly",
    nameEn: "Social Butterfly",
    nameDe: "Sozialschmetterling",
    descriptionEn: "Send 10 waves",
    descriptionDe: "Sende 10 Wellen",
    icon: "🦋"
  },
  {
    id: "regular",
    nameEn: "Regular",
    nameDe: "Stammgast",
    descriptionEn: "Interact 3 times with same person",
    descriptionDe: "Interagiere 3x mit derselben Person",
    icon: "👋"
  },
  {
    id: "night_owl",
    nameEn: "Night Owl",
    nameDe: "Nachteule",
    descriptionEn: "Scan after 22:00",
    descriptionDe: "Scanne nach 22:00",
    icon: "🌙"
  },
  {
    id: "early_bird",
    nameEn: "Early Bird",
    nameDe: "Frühaufsteher",
    descriptionEn: "Scan before 7:00",
    descriptionDe: "Scanne vor 7:00",
    icon: "🌅"
  },
  {
    id: "circle_master",
    nameEn: "Circle Master",
    nameDe: "Kreis-Meister",
    descriptionEn: "Create 3 circles",
    descriptionDe: "Erstelle 3 Kreise",
    icon: "🎯"
  },
  {
    id: "streak_7",
    nameEn: "On a Roll",
    nameDe: "Im Trend",
    descriptionEn: "7 day streak",
    descriptionDe: "7-Tage-Serie",
    icon: "🔥"
  },
  {
    id: "streak_30",
    nameEn: "Unstoppable",
    nameDe: "Unaufhaltsam",
    descriptionEn: "30 day streak",
    descriptionDe: "30-Tage-Serie",
    icon: "⚡"
  },
  {
    id: "first_match",
    nameEn: "First Match",
    nameDe: "Erstes Match",
    descriptionEn: "Get your first match",
    descriptionDe: "Dein erstes Match",
    icon: "💕"
  },
  {
    id: "first_chat",
    nameEn: "Conversationalist",
    nameDe: "Unterhaltungskünstler",
    descriptionEn: "Send your first message",
    descriptionDe: "Sende deine erste Nachricht",
    icon: "💬"
  }
];

interface BadgeSystemProps {
  badges?: Badge[];
  showLocked?: boolean;
  compact?: boolean;
}

export function BadgeSystem({ badges = [], showLocked = true, compact = false }: BadgeSystemProps) {
  const { locale } = useLanguage();
  const [displayBadges, setDisplayBadges] = useState<Badge[]>([]);
  const [animatingBadgeId, setAnimatingBadgeId] = useState<string | null>(null);

  useEffect(() => {
    // Merge definitions with earned badges
    const merged = BADGE_DEFINITIONS.map(def => {
      const earned = badges.find(b => b.id === def.id);
      return {
        ...def,
        earned: earned?.earned ?? false,
        earnedAt: earned?.earnedAt,
        progress: earned?.progress,
        progressMax: earned?.progressMax,
      };
    });
    setDisplayBadges(merged);
  }, [badges]);

  const handleBadgeUnlock = (badgeId: string) => {
    setAnimatingBadgeId(badgeId);
    setTimeout(() => setAnimatingBadgeId(null), 600);
  };

  const visibleBadges = showLocked ? displayBadges : displayBadges.filter(b => b.earned);

  const badgeSize = compact ? 60 : 80;
  const badgeTextSize = compact ? "text-xs" : "text-sm";

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${badgeSize}px, 1fr))`, gap: "12px" }}>
      {visibleBadges.map((badge) => {
        const name = locale === "de" ? badge.nameDe : badge.nameEn;
        const description = locale === "de" ? badge.descriptionDe : badge.descriptionEn;
        const isAnimating = animatingBadgeId === badge.id;

        return (
          <div
            key={badge.id}
            onClick={() => badge.earned && handleBadgeUnlock(badge.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              padding: "12px",
              borderRadius: "12px",
              backgroundColor: badge.earned ? "rgba(168, 85, 247, 0.1)" : "rgba(255, 255, 255, 0.05)",
              border: badge.earned ? "1px solid rgba(168, 85, 247, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
              cursor: badge.earned ? "pointer" : "default",
              transition: "all 0.2s ease",
              transform: isAnimating ? "scale(1.1)" : "scale(1)",
              boxShadow: isAnimating ? "0 0 20px rgba(168, 85, 247, 0.6)" : "none",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                filter: badge.earned ? "drop-shadow(0 0 4px rgba(168, 85, 247, 0.5))" : "opacity(0.4) grayscale(1)",
                opacity: badge.earned ? 1 : 0.5,
                transition: "all 0.2s ease",
              }}
            >
              {badge.icon}
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: compact ? "11px" : "12px",
                  fontWeight: "600",
                  color: badge.earned ? "white" : "rgba(255, 255, 255, 0.6)",
                  transition: "color 0.2s ease",
                }}
              >
                {name}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: badge.earned ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.4)",
                  marginTop: "2px",
                  lineHeight: "1.2",
                }}
              >
                {description}
              </div>
            </div>

            {badge.progress !== undefined && badge.progressMax !== undefined && !badge.earned && (
              <div
                style={{
                  width: "100%",
                  height: "3px",
                  borderRadius: "2px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  overflow: "hidden",
                  marginTop: "4px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    backgroundColor: "#a855f7",
                    width: `${(badge.progress / badge.progressMax) * 100}%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            )}

            {badge.earned && badge.earnedAt && (
              <div
                style={{
                  fontSize: "9px",
                  color: "rgba(168, 85, 247, 0.8)",
                  marginTop: "2px",
                }}
              >
                {new Date(badge.earnedAt).toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
                  month: "short",
                  day: "numeric"
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function BadgeUnlockedNotification({ badge, onDismiss }: { badge: Badge; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const { locale } = useLanguage();
  const name = locale === "de" ? badge.nameDe : badge.nameEn;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "rgba(168, 85, 247, 0.95)",
        color: "white",
        padding: "16px 20px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        zIndex: 1000,
        animation: "slideUp 0.3s ease-out",
        boxShadow: "0 10px 30px rgba(168, 85, 247, 0.3)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ fontSize: "24px" }}>{badge.icon}</div>
      <div>
        <div style={{ fontWeight: "600", fontSize: "14px" }}>Badge Unlocked!</div>
        <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.9)" }}>{name}</div>
      </div>
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
