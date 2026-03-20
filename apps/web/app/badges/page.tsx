"use client";

import { useLanguage } from "@/lib/i18n";
import { AppShell } from "@/components/app-shell";
import { Card } from "@puqme/ui";
import { BadgeSystem } from "@/components/badge-system";
import { StreakTracker } from "@/components/streak-tracker";
import { LevelProgress } from "@/components/level-progress";

export default function BadgesPage() {
  const { t } = useLanguage();

  return (
    <AppShell
      active="/badges"
      title="Achievements"
      subtitle="Badges, streaks, and levels"
    >
      <section style={{ display: "grid", gap: "20px" }}>
        {/* Level Progress Card */}
        <Card style={{ borderRadius: "2rem", padding: "20px", backgroundColor: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.15)" }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "white" }}>Your Level</div>
            <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginTop: "2px" }}>
              Earn XP through activities to level up
            </div>
          </div>
          <LevelProgress />
        </Card>

        {/* Streak Card */}
        <Card style={{ borderRadius: "2rem", padding: "20px", backgroundColor: "transparent", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "white" }}>Activity Streak</div>
            <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginTop: "2px" }}>
              Keep your daily streak alive
            </div>
          </div>
          <StreakTracker />
        </Card>

        {/* Badges Card */}
        <Card style={{ borderRadius: "2rem", padding: "20px", backgroundColor: "transparent", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "white" }}>Badges</div>
            <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginTop: "2px" }}>
              Unlock badges by completing challenges
            </div>
          </div>
          <BadgeSystem showLocked={true} />
        </Card>

        {/* XP Guide Card */}
        <Card style={{ borderRadius: "2rem", padding: "20px", backgroundColor: "rgba(168, 85, 247, 0.05)", border: "1px solid rgba(168, 85, 247, 0.1)" }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "white", marginBottom: "12px" }}>How to Earn XP</div>
          <div style={{ display: "grid", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>Scan nearby profiles</span>
              <span style={{ color: "#a855f7", fontWeight: "600" }}>+5 XP</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>Send a wave</span>
              <span style={{ color: "#a855f7", fontWeight: "600" }}>+10 XP</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>Get a match</span>
              <span style={{ color: "#a855f7", fontWeight: "600" }}>+50 XP</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>Send chat message</span>
              <span style={{ color: "#a855f7", fontWeight: "600" }}>+2 XP</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>Circle encounter</span>
              <span style={{ color: "#a855f7", fontWeight: "600" }}>+15 XP</span>
            </div>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
