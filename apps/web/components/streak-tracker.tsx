"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  streakDates: string[];
}

const STORAGE_KEY = "puqme.streak.data";

export function StreakTracker() {
  const { t } = useLanguage();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    streakDates: [],
  });
  const [breakWarning, setBreakWarning] = useState(false);
  const [last7Days, setLast7Days] = useState<(boolean | null)[]>(Array(7).fill(null));

  useEffect(() => {
    // Load streak data from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored) as StreakData;
        setStreakData(data);
        calculateLast7Days(data);
        checkStreakBreak(data);
      } catch {
        // Initialize with default data
        initializeStreakData();
      }
    } else {
      initializeStreakData();
    }
  }, []);

  const initializeStreakData = () => {
    const today = new Date().toISOString().split("T")[0] ?? "";
    const newData: StreakData = {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: today,
      streakDates: [today],
    };
    setStreakData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    calculateLast7Days(newData);
  };

  const calculateLast7Days = (data: StreakData) => {
    const days: (boolean | null)[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0] ?? "";
      days.push(data.streakDates.includes(dateStr));
    }

    setLast7Days(days);
  };

  const checkStreakBreak = (data: StreakData) => {
    if (!data.lastActiveDate) return;

    const today = new Date();
    const lastActive = new Date(data.lastActiveDate ?? "");
    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    // If more than 1 day has passed and streak is active
    if (daysDiff > 1 && data.currentStreak > 0) {
      setBreakWarning(true);
    } else {
      setBreakWarning(false);
    }
  };

  const recordActivity = () => {
    const today = new Date().toISOString().split("T")[0] ?? "";
    const updated = { ...streakData };

    // Check if already recorded today
    if (updated.streakDates.includes(today)) {
      return;
    }

    updated.streakDates.push(today);

    // Calculate new streak
    if (updated.lastActiveDate) {
      const lastDate = new Date(updated.lastActiveDate ?? "");
      const currentDate = new Date(today);
      const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day
        updated.currentStreak += 1;
      } else if (daysDiff > 1) {
        // Streak broken, start new one
        updated.longestStreak = Math.max(updated.longestStreak, updated.currentStreak);
        updated.currentStreak = 1;
      }
    } else {
      updated.currentStreak = 1;
    }

    updated.lastActiveDate = today ?? null;
    updated.longestStreak = Math.max(updated.longestStreak, updated.currentStreak);

    setStreakData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    calculateLast7Days(updated);
    checkStreakBreak(updated);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "16px",
        borderRadius: "12px",
        backgroundColor: "rgba(168, 85, 247, 0.08)",
        border: "1px solid rgba(168, 85, 247, 0.2)",
      }}
    >
      {/* Main Streak Count */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "32px" }}>🔥</div>
        <div>
          <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)" }}>Current Streak</div>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "white" }}>
            {streakData.currentStreak} day{streakData.currentStreak !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Last 7 Days Calendar */}
      <div>
        <div style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255, 255, 255, 0.6)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Last 7 Days
        </div>
        <div style={{ display: "flex", gap: "6px", justifyContent: "space-between" }}>
          {last7Days.map((active, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                height: "28px",
                borderRadius: "6px",
                backgroundColor: active ? "#a855f7" : active === false ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: "600",
                color: active ? "white" : "rgba(255, 255, 255, 0.4)",
                border: active ? "1px solid rgba(168, 85, 247, 0.5)" : "1px solid transparent",
              }}
            >
              {active ? "✓" : ""}
            </div>
          ))}
        </div>
      </div>

      {/* Longest Streak */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          borderRadius: "8px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
        }}
      >
        <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)" }}>Longest Streak</span>
        <span style={{ fontSize: "14px", fontWeight: "700", color: "#a855f7" }}>
          {streakData.longestStreak} day{streakData.longestStreak !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Break Warning */}
      {breakWarning && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: "8px",
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.9)",
            display: "flex",
            gap: "8px",
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: "14px" }}>⚠️</span>
          <span>Your streak is at risk! Keep up your activity today.</span>
        </div>
      )}
    </div>
  );
}

export function useStreakRecorder() {
  const recordActivity = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let data: StreakData = {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      streakDates: [],
    };

    if (stored) {
      try {
        data = JSON.parse(stored);
      } catch {
        // Use default
      }
    }

    const today = new Date().toISOString().split("T")[0] ?? "";

    if (data.streakDates.includes(today)) {
      return; // Already recorded today
    }

    data.streakDates.push(today);

    if (data.lastActiveDate) {
      const lastDate = new Date(data.lastActiveDate ?? "");
      const currentDate = new Date(today);
      const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        data.currentStreak += 1;
      } else if (daysDiff > 1) {
        data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
        data.currentStreak = 1;
      }
    } else {
      data.currentStreak = 1;
    }

    data.lastActiveDate = today ?? null;
    data.longestStreak = Math.max(data.longestStreak, data.currentStreak);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  return { recordActivity };
}
