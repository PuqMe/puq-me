"use client";

import { useEffect, useState } from "react";

export interface PlayerLevel {
  level: number;
  totalXp: number;
  xpForCurrentLevel: number;
  xpNeededForLevel: number;
}

const STORAGE_KEY = "puqme.level.data";

// XP thresholds for each level (exponential growth)
function getXpNeededForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

function getTotalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXpNeededForLevel(i);
  }
  return total;
}

export function LevelProgress() {
  const [level, setLevel] = useState<PlayerLevel>({
    level: 1,
    totalXp: 0,
    xpForCurrentLevel: 0,
    xpNeededForLevel: getXpNeededForLevel(1),
  });
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored) as PlayerLevel;
        setLevel(data);
      } catch {
        // Initialize with default
      }
    }
  }, []);

  const progressPercentage = (level.xpForCurrentLevel / level.xpNeededForLevel) * 100;

  const addXp = (amount: number): boolean => {
    let newTotalXp = level.totalXp + amount;
    let newLevel = level.level;
    let leveledUp = false;

    // Check for level up
    while (newTotalXp >= getTotalXpForLevel(newLevel + 1)) {
      newLevel += 1;
      leveledUp = true;
    }

    const leveledUpThisCall = newLevel > level.level;
    if (leveledUpThisCall) {
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 600);
    }

    const xpForLevel = getTotalXpForLevel(newLevel);
    const newData: PlayerLevel = {
      level: newLevel,
      totalXp: newTotalXp,
      xpForCurrentLevel: newTotalXp - xpForLevel,
      xpNeededForLevel: getXpNeededForLevel(newLevel),
    };

    setLevel(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    return leveledUpThisCall;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Level Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Stufe
        </div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#a855f7",
            transform: celebrating ? "scale(1.2)" : "scale(1)",
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {level.level}
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <div
          style={{
            height: "8px",
            borderRadius: "4px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPercentage}%`,
              background: "linear-gradient(90deg, #a855f7, #d946ef)",
              transition: "width 0.4s ease",
              borderRadius: "4px",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "10px",
            color: "rgba(255, 255, 255, 0.6)",
          }}
        >
          <span>{level.xpForCurrentLevel} XP</span>
          <span>{level.xpNeededForLevel} zum Aufstieg</span>
        </div>
      </div>

      {/* Celebrating Animation */}
      {celebrating && (
        <div
          style={{
            textAlign: "center",
            fontSize: "14px",
            fontWeight: "600",
            color: "#fbbf24",
            animation: "pulse 0.6s ease-out",
          }}
        >
          🎉 Aufgestiegen!
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 0;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export function useXpSystem() {
  const addXp = (activityType: "scan" | "wave" | "match" | "chat_message" | "encounter"): boolean => {
    const xpMap = {
      scan: 5,
      wave: 10,
      match: 50,
      chat_message: 2,
      encounter: 15,
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    let level: PlayerLevel = {
      level: 1,
      totalXp: 0,
      xpForCurrentLevel: 0,
      xpNeededForLevel: getXpNeededForLevel(1),
    };

    if (stored) {
      try {
        level = JSON.parse(stored);
      } catch {
        // Use default
      }
    }

    let newTotalXp = level.totalXp + xpMap[activityType];
    let newLevel = level.level;

    // Check for level up
    while (newTotalXp >= getTotalXpForLevel(newLevel + 1)) {
      newLevel += 1;
    }

    const xpForLevel = getTotalXpForLevel(newLevel);
    const newData: PlayerLevel = {
      level: newLevel,
      totalXp: newTotalXp,
      xpForCurrentLevel: newTotalXp - xpForLevel,
      xpNeededForLevel: getXpNeededForLevel(newLevel),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    return newLevel > level.level;
  };

  return { addXp };
}
