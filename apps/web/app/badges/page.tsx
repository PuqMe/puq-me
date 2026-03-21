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
      title={t.achievements}
      subtitle={t.achievementsSubtitle}
    >
      <section style={{ display: "grid", gap: "20px" }}>
        {/* Level Progress Card */}
        <Card style={{ borderRadius: "2rem", padding: "20px", backgroundColor: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.15)" }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "white" }}>{t.yourLevel}</div>
            <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginTop: "2px" }}>
              {t.earnXpThroughActivities}
            </div>
          </div>
          <LevelProgress />
        </Card>

        {/* Streak Card */}
        <Card style={{ borderRadius: "2rem", padding: "20px", backgroundColor: "transparent", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "white" }}>{t.activityStreak}</div>
            <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginTop: "2px" }}>
              {t.keepYourStreakAlive}
            </div>
          </div>
          <StreakTracker />
        </Card>

        {/* Badges Card */}
        <Card style={{ borderRadius: "2rem", padding: "20px", backgroundColor: "transparent", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "white" }}>{t.badges}</div>
            <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginTop: "2px" }}>
              {t.unlockBadgesByCompletingChallenges}
            </div>
          </div>
          <BadgeSystem showLocked={true} />
        </Card>

        {/* XP Guide Card */}
        <Card style={{ borderRadius: "2rem", padding: "20px", backgroundColor: "rgba(168, 85, 247, 0.05)", border: "1px solid rgba(168, 85, 247, 0.1)" }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "white", marginBottom: "12px" }}>{t.howToEarnXp}</div>
          <div style={{ display: "grid", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>{t.scanNearbyProfiles}</span>
              <span style={{ color: "#a855f7", fontWeight: "600" }}>+5 XP</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>{t.sendAWave}</span>
              <span style={{ color: "#a855f7", fontWeight: "600" }}>+10 XP</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>{t.getAMatch}</span>
              <span style={{ color: "#a855f7", fontWeight: "600" }}>+50 XP</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>{t.sendChatMessage}</span>
              <span style={{ color: "#a855f7", fontWeight: "600" }}>+2 XP</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>{t.circleEncounter}</span>
              <span style={{ color: "#a855f7", fontWeight: "600" }}>+15 XP</span>
            </div>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
