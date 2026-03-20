"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { updateMyVisibility } from "@/lib/profile";

// ── Types ────────────────────────────────────────────────────────────────────
export type VisibilityMode = "visible" | "friends" | "invisible";
export type VisibilityTimer = "1h" | "3h" | "today" | "unlimited";

export type VisibilityState = {
  mode: VisibilityMode;
  timer: VisibilityTimer;
  activeUntil: number | null; // epoch ms, null = unlimited
  browserLocationGranted: boolean;
  locationDenied: boolean; // true if user explicitly denied geolocation
};

const STORAGE_KEY = "puqme.visibility.v1";

const DEFAULT_STATE: VisibilityState = {
  mode: "invisible",
  timer: "unlimited",
  activeUntil: null,
  browserLocationGranted: false,
  locationDenied: false,
};

// ── Persistence ──────────────────────────────────────────────────────────────
function loadVisibility(): VisibilityState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as VisibilityState;
    // Check if timer has expired
    if (parsed.activeUntil && Date.now() > parsed.activeUntil) {
      return { ...DEFAULT_STATE, browserLocationGranted: parsed.browserLocationGranted };
    }
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

function saveVisibility(state: VisibilityState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function computeActiveUntil(timer: VisibilityTimer): number | null {
  const now = Date.now();
  switch (timer) {
    case "1h": return now + 60 * 60 * 1000;
    case "3h": return now + 3 * 60 * 60 * 1000;
    case "today": {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return end.getTime();
    }
    case "unlimited": return null;
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useVisibility() {
  const [state, setState] = useState<VisibilityState>(DEFAULT_STATE);

  useEffect(() => {
    setState(loadVisibility());
  }, []);

  // Check timer expiry every 30s
  useEffect(() => {
    const id = setInterval(() => {
      const current = loadVisibility();
      if (current.activeUntil && Date.now() > current.activeUntil) {
        const reset = { ...DEFAULT_STATE, browserLocationGranted: current.browserLocationGranted };
        saveVisibility(reset);
        setState(reset);
      }
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  // Track whether we're syncing to avoid double calls
  const syncRef = useRef(false);

  const setMode = useCallback((mode: VisibilityMode, timer: VisibilityTimer = state.timer) => {
    const next: VisibilityState = {
      ...state,
      mode,
      timer,
      activeUntil: mode === "invisible" ? null : computeActiveUntil(timer),
    };
    saveVisibility(next);
    setState(next);

    // Sync to backend: visible/friends → isVisible=true, invisible → isVisible=false
    if (!syncRef.current) {
      syncRef.current = true;
      updateMyVisibility(mode !== "invisible").catch(() => {}).finally(() => { syncRef.current = false; });
    }
  }, [state]);

  const setTimer = useCallback((timer: VisibilityTimer) => {
    const next: VisibilityState = {
      ...state,
      timer,
      activeUntil: state.mode === "invisible" ? null : computeActiveUntil(timer),
    };
    saveVisibility(next);
    setState(next);
  }, [state]);

  const setBrowserLocation = useCallback((granted: boolean) => {
    const next = { ...state, browserLocationGranted: granted, locationDenied: false };
    saveVisibility(next);
    setState(next);
  }, [state]);

  const setLocationDenied = useCallback(() => {
    const next = { ...state, locationDenied: true };
    saveVisibility(next);
    setState(next);
  }, [state]);

  const remainingLabel = useCallback((): string | null => {
    if (!state.activeUntil) return null;
    const diff = state.activeUntil - Date.now();
    if (diff <= 0) return null;
    const hrs = Math.floor(diff / 3_600_000);
    const mins = Math.floor((diff % 3_600_000) / 60_000);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  }, [state.activeUntil]);

  return { ...state, setMode, setTimer, setBrowserLocation, setLocationDenied, remainingLabel };
}

// ── SVG Icons ────────────────────────────────────────────────────────────────
function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function GhostIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2 2 3-3 3 3 2-2 3 3V10a8 8 0 0 0-8-8Z" />
      <circle cx="9" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// ── Mode descriptions ────────────────────────────────────────────────────────
const MODE_CONFIG: Record<VisibilityMode, {
  icon: () => React.ReactElement;
  en: { label: string; desc: string };
  de: { label: string; desc: string };
  color: string;
  activeColor: string;
  activeBg: string;
}> = {
  visible: {
    icon: EyeIcon,
    en: { label: "Visible", desc: "Everyone nearby sees your approximate position" },
    de: { label: "Sichtbar", desc: "Jeder in der Nähe sieht deine ungefähre Position" },
    color: "#22c55e",
    activeColor: "#4ade80",
    activeBg: "rgba(34,197,94,.12)",
  },
  friends: {
    icon: UsersIcon,
    en: { label: "Friends only", desc: "Only your matches & contacts see you" },
    de: { label: "Nur Freunde", desc: "Nur deine Matches & Kontakte sehen dich" },
    color: "#38bdf8",
    activeColor: "#7dd3fc",
    activeBg: "rgba(56,189,248,.12)",
  },
  invisible: {
    icon: GhostIcon,
    en: { label: "Invisible", desc: "Nobody sees you — you still see others" },
    de: { label: "Unsichtbar", desc: "Niemand sieht dich — du siehst aber andere" },
    color: "#a855f7",
    activeColor: "#c084fc",
    activeBg: "rgba(168,85,247,.12)",
  },
};

const TIMER_OPTIONS: { value: VisibilityTimer; en: string; de: string }[] = [
  { value: "1h",        en: "1 hour",   de: "1 Stunde" },
  { value: "3h",        en: "3 hours",  de: "3 Stunden" },
  { value: "today",     en: "Today",    de: "Heute" },
  { value: "unlimited", en: "Always",   de: "Immer" },
];

// ── Settings Card Component ──────────────────────────────────────────────────
export function VisibilitySettingsCard({ locale = "de" }: { locale?: "en" | "de" }) {
  const vis = useVisibility();
  const [showTimer, setShowTimer] = useState(false);
  const remaining = vis.remainingLabel();
  const lang = locale;

  return (
    <article className="glass-card rounded-[2rem] px-4 py-4">
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <LocationIcon />
        <div>
          <div className="text-sm font-medium text-white">
            {lang === "de" ? "Standort-Sichtbarkeit" : "Location Visibility"}
          </div>
          <div className="mt-0.5 text-[11px] text-white/45">
            {lang === "de"
              ? "Deine Position wird nie exakt gezeigt (50-200m Unschärfe)"
              : "Your position is never shown exactly (50-200m blur)"}
          </div>
        </div>
      </div>

      {/* Mode buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
        {(Object.keys(MODE_CONFIG) as VisibilityMode[]).map((mode) => {
          const cfg = MODE_CONFIG[mode];
          const isActive = vis.mode === mode;
          const Icon = cfg.icon;
          const text = cfg[lang];

          return (
            <button
              key={mode}
              onClick={() => vis.setMode(mode)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px",
                borderRadius: 14,
                border: isActive ? `1.5px solid ${cfg.color}55` : "1.5px solid rgba(255,255,255,.06)",
                background: isActive ? cfg.activeBg : "rgba(255,255,255,.03)",
                cursor: "pointer",
                transition: "all .2s",
                textAlign: "left",
                width: "100%",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: isActive ? `${cfg.color}22` : "rgba(255,255,255,.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: isActive ? cfg.activeColor : "rgba(255,255,255,.4)",
                flexShrink: 0,
                transition: "all .2s",
              }}>
                <Icon />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  color: isActive ? cfg.activeColor : "rgba(255,255,255,.7)",
                }}>
                  {text.label}
                </div>
                <div style={{
                  fontSize: 11, marginTop: 1,
                  color: isActive ? `${cfg.activeColor}99` : "rgba(255,255,255,.3)",
                }}>
                  {text.desc}
                </div>
              </div>
              {/* Active indicator */}
              {isActive && (
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: cfg.color,
                  boxShadow: `0 0 8px ${cfg.color}`,
                  flexShrink: 0,
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Timer section — only for visible and friends modes */}
      {vis.mode !== "invisible" && (
        <div style={{ marginTop: 14 }}>
          <button
            onClick={() => setShowTimer(!showTimer)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.06)",
              background: "rgba(255,255,255,.03)",
              width: "100%",
              cursor: "pointer",
              color: "rgba(255,255,255,.6)",
              fontSize: 12, fontWeight: 500,
            }}
          >
            <ClockIcon />
            <span style={{ flex: 1, textAlign: "left" }}>
              {lang === "de" ? "Dauer" : "Duration"}:{" "}
              <strong style={{ color: "#c084fc" }}>
                {TIMER_OPTIONS.find(t => t.value === vis.timer)?.[lang] ?? vis.timer}
              </strong>
            </span>
            {remaining && (
              <span style={{ fontSize: 11, color: "#a855f7", fontWeight: 600 }}>
                {remaining} {lang === "de" ? "übrig" : "left"}
              </span>
            )}
            <span style={{ fontSize: 14, color: "rgba(255,255,255,.25)" }}>
              {showTimer ? "▴" : "▾"}
            </span>
          </button>

          {showTimer && (
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 6, marginTop: 8,
            }}>
              {TIMER_OPTIONS.map(opt => {
                const isActive = vis.timer === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => { vis.setTimer(opt.value); setShowTimer(false); }}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: isActive ? "1.5px solid rgba(168,85,247,.4)" : "1.5px solid rgba(255,255,255,.06)",
                      background: isActive ? "rgba(168,85,247,.12)" : "rgba(255,255,255,.03)",
                      color: isActive ? "#c084fc" : "rgba(255,255,255,.5)",
                      fontSize: 12, fontWeight: 600,
                      cursor: "pointer",
                      transition: "all .2s",
                    }}
                  >
                    {opt[lang]}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// ── Home Feed Prompt (compact) ───────────────────────────────────────────────
export function VisibilityPrompt({
  locale = "de",
  onRequestLocation,
}: {
  locale?: "en" | "de";
  onRequestLocation?: () => void;
}) {
  const vis = useVisibility();
  const lang = locale;
  const cfg = MODE_CONFIG[vis.mode];
  const remaining = vis.remainingLabel();

  // If location denied by user, show helpful hint
  if (vis.locationDenied && !vis.browserLocationGranted) {
    return (
      <div style={{
        margin: "0 14px 10px", padding: "14px 16px", borderRadius: 16,
        background: "linear-gradient(135deg, rgba(251,146,60,.08), rgba(251,146,60,.03))",
        border: "1px solid rgba(251,146,60,.18)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "rgba(251,146,60,.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fb923c", flexShrink: 0,
        }}>
          <LocationIcon />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
            {lang === "de" ? "Standort blockiert" : "Location blocked"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginTop: 2, lineHeight: 1.4 }}>
            {lang === "de"
              ? "Du hast den Zugriff verweigert. Gehe in deine Browser-Einstellungen, um den Standort für diese Seite freizugeben."
              : "You denied access. Go to your browser settings to allow location for this site."}
          </div>
        </div>
        <button
          onClick={onRequestLocation}
          style={{
            padding: "7px 14px", borderRadius: 10,
            background: "rgba(251,146,60,.15)",
            color: "#fb923c", fontSize: 12, fontWeight: 700,
            border: "1px solid rgba(251,146,60,.25)",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          {lang === "de" ? "Erneut" : "Retry"}
        </button>
      </div>
    );
  }

  // If location not granted by browser yet, show location prompt first
  if (!vis.browserLocationGranted) {
    return (
      <div style={{
        margin: "0 14px 10px", padding: "14px 16px", borderRadius: 16,
        background: "linear-gradient(135deg, rgba(168,85,247,.12), rgba(99,102,241,.07))",
        border: "1px solid rgba(168,85,247,.18)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "rgba(168,85,247,.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#c084fc", flexShrink: 0,
        }}>
          <LocationIcon />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
            {lang === "de" ? "Standort freigeben" : "Enable location"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginTop: 2 }}>
            {lang === "de"
              ? "Teile deinen Standort, um Leute in der Nähe zu entdecken"
              : "Share your location to discover people nearby"}
          </div>
        </div>
        <button
          onClick={onRequestLocation}
          style={{
            padding: "7px 14px", borderRadius: 10,
            background: "linear-gradient(145deg,#b855f7,#7c3aed)",
            color: "#fff", fontSize: 12, fontWeight: 700,
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 14px rgba(168,85,247,.35)",
            flexShrink: 0,
          }}
        >
          {lang === "de" ? "Aktivieren" : "Enable"}
        </button>
      </div>
    );
  }

  // Show current visibility status as compact bar
  return (
    <div style={{
      margin: "0 14px 10px", padding: "10px 14px", borderRadius: 14,
      background: cfg.activeBg,
      border: `1px solid ${cfg.color}22`,
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: `${cfg.color}22`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: cfg.activeColor, flexShrink: 0,
      }}>
        {(() => { const Icon = cfg.icon; return <Icon />; })()}
      </div>
      <div style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,.6)" }}>
        <strong style={{ color: cfg.activeColor }}>
          {cfg[lang].label}
        </strong>
        {remaining && (
          <span style={{ marginLeft: 6, color: "rgba(255,255,255,.35)" }}>
            · {remaining} {lang === "de" ? "übrig" : "left"}
          </span>
        )}
      </div>
      {/* Quick toggle buttons */}
      <div style={{ display: "flex", gap: 4 }}>
        {(Object.keys(MODE_CONFIG) as VisibilityMode[]).map(mode => {
          const m = MODE_CONFIG[mode];
          const isActive = vis.mode === mode;
          const Icon = m.icon;
          return (
            <button
              key={mode}
              onClick={() => vis.setMode(mode)}
              title={m[lang].label}
              style={{
                width: 30, height: 30, borderRadius: "50%",
                border: isActive ? `1.5px solid ${m.color}66` : "1.5px solid rgba(255,255,255,.08)",
                background: isActive ? `${m.color}22` : "transparent",
                color: isActive ? m.activeColor : "rgba(255,255,255,.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", padding: 0,
                transition: "all .2s",
              }}
            >
              <Icon />
            </button>
          );
        })}
      </div>
    </div>
  );
}
