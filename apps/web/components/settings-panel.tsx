"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PushPermissionCard } from "@/components/push-permission-card";
import { fetchMyProfile, updateMyPreferences, updateMyVisibility, type ProfileResponse } from "@/lib/profile";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";
import { VisibilitySettingsCard } from "@/components/visibility-control";

export function SettingsPanel() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const profile = await fetchMyProfile();
        if (!cancelled) {
          setData(profile);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : t.couldNotLoadSettings);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function saveProfileVisibility(isVisible: boolean) {
    if (!data) return;
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const next = await updateMyVisibility(isVisible);
      setData(next);
      setSuccessMessage(t.visibilityUpdated);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t.couldNotSaveVisibility);
    } finally {
      setIsSaving(false);
    }
  }

  async function savePreferencePatch(input: Partial<ProfileResponse["preferences"]>) {
    if (!data) return;
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const next = await updateMyPreferences({
        interestedIn: (input.interestedIn as Array<"men" | "women" | "non_binary" | "everyone">) ?? (data.preferences.interestedIn as Array<"men" | "women" | "non_binary" | "everyone">),
        minAge: input.minAge ?? data.preferences.minAge,
        maxAge: input.maxAge ?? data.preferences.maxAge,
        maxDistanceKm: input.maxDistanceKm ?? data.preferences.maxDistanceKm,
        showMeGlobally: input.showMeGlobally ?? data.preferences.showMeGlobally,
        onlyVerifiedProfiles: input.onlyVerifiedProfiles ?? data.preferences.onlyVerifiedProfiles
      });
      setData(next);
      setSuccessMessage(t.radarSettingsSaved);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t.couldNotSaveSettings);
    } finally {
      setIsSaving(false);
    }
  }

  function handleSignOut() {
    signOut();
    router.replace("/");
  }

  const linkRowStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 12, padding: "13px 14px",
    borderRadius: 14, background: "rgba(255,255,255,0.03)", cursor: "pointer",
    textDecoration: "none", transition: "background 0.15s",
  };
  const linkIconStyle = (bg: string, fg: string): React.CSSProperties => ({
    width: 34, height: 34, borderRadius: 10, background: bg,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: fg, fontSize: 16, flexShrink: 0,
  });
  const sectionHeader: React.CSSProperties = {
    fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.25)",
    textTransform: "uppercase", letterSpacing: 1.5, padding: "12px 0 4px",
  };

  return (
    <AppShell active="/settings" title={t.settingsTitle} subtitle={t.radarPrivacySubtitle}>
      <section className="grid gap-3">
        <PushPermissionCard />

        {errorMessage ? <article className="glass-card rounded-[2rem] px-4 py-4 text-sm text-[#ffb4c7]">{errorMessage}</article> : null}
        {successMessage ? <article className="glass-card rounded-[2rem] px-4 py-4 text-sm text-[#b8ffd9]">{successMessage}</article> : null}

        {/* ── ALLGEMEIN ── */}
        <div style={sectionHeader}>Allgemein</div>

        {/* Language switcher */}
        <article className="glass-card rounded-[2rem] px-4 py-4">
          <div className="text-sm font-medium text-white">{t.language}</div>
          <div className="mt-1 text-xs text-white/58">{t.languageDesc}</div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setLocale("en")}
              className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition ${
                locale === "en"
                  ? "border-[#a855f7] bg-[#a855f7]/20 text-[#c084fc]"
                  : "border-white/12 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              🇬🇧 {t.english}
            </button>
            <button
              onClick={() => setLocale("de")}
              className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition ${
                locale === "de"
                  ? "border-[#a855f7] bg-[#a855f7]/20 text-[#c084fc]"
                  : "border-white/12 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              🇩🇪 {t.german}
            </button>
          </div>
        </article>

        {/* Link: Sichtbarkeit */}
        <a href="/visibility" style={linkRowStyle}>
          <div style={linkIconStyle("rgba(16,185,129,0.12)", "#34d399")}>👁</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>Sichtbarkeit</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Global · 8 Modi · Bis 10.000 km</div>
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.15)" }}>›</div>
        </a>

        {/* Link: Interessen */}
        <a href="/interests" style={linkRowStyle}>
          <div style={linkIconStyle("rgba(168,85,247,0.12)", "#a855f7")}>⭐</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>Interessen & Filter</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Alter, Hobbys, Entfernung</div>
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.15)" }}>›</div>
        </a>

        <article className="glass-card rounded-[2rem] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">{t.onlyVerified}</div>
              <div className="mt-1 text-xs text-white/58">{t.onlyVerifiedDesc}</div>
            </div>
            <input
              checked={data?.preferences.onlyVerifiedProfiles ?? false}
              disabled={!data || isSaving}
              onChange={(event) => void savePreferencePatch({ onlyVerifiedProfiles: event.target.checked })}
              type="checkbox"
            />
          </div>
        </article>

        <article className="glass-card rounded-[2rem] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">{t.showGlobally}</div>
              <div className="mt-1 text-xs text-white/58">{t.showGloballyDesc}</div>
            </div>
            <input
              checked={data?.preferences.showMeGlobally ?? false}
              disabled={!data || isSaving}
              onChange={(event) => void savePreferencePatch({ showMeGlobally: event.target.checked })}
              type="checkbox"
            />
          </div>
        </article>

        <article className="glass-card rounded-[2rem] px-4 py-4">
          <div className="text-sm font-medium text-white">{t.distance}</div>
          <div className="mt-1 text-xs text-white/58">{data?.preferences.maxDistanceKm ?? 25} km</div>
          <input
            className="mt-4 w-full"
            disabled={!data || isSaving}
            max={10000}
            min={1}
            onChange={(event) => void savePreferencePatch({ maxDistanceKm: Number(event.target.value) })}
            type="range"
            value={data?.preferences.maxDistanceKm ?? 25}
          />
        </article>

        <article className="glass-card rounded-[2rem] px-4 py-4">
          <div className="text-sm font-medium text-white">{t.agePrefs}</div>
          <div className="mt-1 text-xs text-white/58">
            {data?.preferences.minAge ?? 24} - {data?.preferences.maxAge ?? 36}
          </div>
          <div className="mt-4 grid gap-3">
            <input
              className="w-full"
              disabled={!data || isSaving}
              max={data?.preferences.maxAge ?? 36}
              min={18}
              onChange={(event) => void savePreferencePatch({ minAge: Number(event.target.value) })}
              type="range"
              value={data?.preferences.minAge ?? 24}
            />
            <input
              className="w-full"
              disabled={!data || isSaving}
              max={60}
              min={data?.preferences.minAge ?? 24}
              onChange={(event) => void savePreferencePatch({ maxAge: Number(event.target.value) })}
              type="range"
              value={data?.preferences.maxAge ?? 36}
            />
          </div>
        </article>

        {/* ── Location Visibility (3-mode + timer) ── */}
        <VisibilitySettingsCard locale={locale} />

        {/* ── NEUE FEATURES ── */}
        <div style={sectionHeader}>Neue Features</div>

        <a href="/intent" style={linkRowStyle}>
          <div style={linkIconStyle("rgba(251,146,60,0.12)", "#fb923c")}>🎯</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>Intent</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Was machst du gerade?</div>
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.15)" }}>›</div>
        </a>

        <a href="/cards" style={linkRowStyle}>
          <div style={linkIconStyle("rgba(56,189,248,0.12)", "#38bdf8")}>📝</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>Micro Cards</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Kurze Aktionen & Einladungen</div>
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.15)" }}>›</div>
        </a>

        <a href="/smart-match" style={linkRowStyle}>
          <div style={linkIconStyle("rgba(168,85,247,0.12)", "#c084fc")}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>Smart Match</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Ort + Zeit + Intent + Interessen</div>
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.15)" }}>›</div>
        </a>

        <a href="/buzz" style={linkRowStyle}>
          <div style={linkIconStyle("rgba(52,211,153,0.12)", "#34d399")}>📳</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>Haptic Buzz</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Vibration bei Begegnung</div>
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.15)" }}>›</div>
        </a>

        <a href="/groups" style={linkRowStyle}>
          <div style={linkIconStyle("rgba(236,72,153,0.12)", "#ec4899")}>👥</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>Gruppen-Intent</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Zusammen aktiv</div>
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.15)" }}>›</div>
        </a>

        <a href="/auto-vanish" style={linkRowStyle}>
          <div style={linkIconStyle("rgba(250,204,21,0.12)", "#facc15")}>⏱</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>Auto-Verschwinden</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Alles hat ein Ablaufdatum</div>
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.15)" }}>›</div>
        </a>

        <a href="/calm" style={linkRowStyle}>
          <div style={linkIconStyle("rgba(52,211,153,0.12)", "#34d399")}>🌿</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>Calm Mode</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Digital Wellbeing</div>
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.15)" }}>›</div>
        </a>

        {/* ── DATENSCHUTZ ── */}
        <div style={sectionHeader}>Datenschutz</div>

        <a href="/privacy" style={linkRowStyle}>
          <div style={linkIconStyle("rgba(168,85,247,0.12)", "#a855f7")}>🛡</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>Datenschutz & DSGVO</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Datenexport, Cookies</div>
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.15)" }}>›</div>
        </a>

        {/* ── ERWEITERT ── */}
        <div style={sectionHeader}>Erweitert</div>

        <div style={{ ...linkRowStyle, cursor: "default" }}>
          <div style={linkIconStyle("rgba(251,146,60,0.12)", "#fb923c")}>📦</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>Cache leeren</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Gespeicherte Daten löschen</div>
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.15)" }}>›</div>
        </div>

        {/* Sign out */}
        <article className="glass-card rounded-[2rem] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">{t.logout}</div>
              <div className="mt-1 text-xs text-white/58">{t.logoutDesc}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex h-9 items-center gap-2 rounded-xl border border-[#ff6b8a]/30 bg-[#ff1a4b]/10 px-4 text-sm font-semibold text-[#ff6b8a] transition hover:bg-[#ff1a4b]/20 active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {t.logout}
            </button>
          </div>
        </article>

        {/* Konto löschen — ganz unten mit Warnung */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "8px 0" }}></div>
        <a href="/delete-account" style={{ ...linkRowStyle, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.08)" }}>
          <div style={linkIconStyle("rgba(239,68,68,0.12)", "#ef4444")}>🗑</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#ef4444" }}>Konto löschen</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Alle Daten dauerhaft löschen</div>
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.15)" }}>›</div>
        </a>

        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.12)", textAlign: "center", padding: "12px 0" }}>
          PuQ.me v1.0 · Made in Berlin
        </div>
      </section>
    </AppShell>
  );
}
