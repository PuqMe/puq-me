"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

// ── Mock data (matches home-feed.tsx) ────────────────────────────────────────
const ALL_PROFILES: Record<string, {
  initials: string; color: string; name: string; age: number;
  dist: string; bio: string; interests: string[];
  city: string; online: boolean; lastSeen?: string;
}> = {
  u1: { initials: "EM", color: "#e879f9", name: "Emma",   age: 26, dist: "120 m",  bio: "Studentin der Architektur. Liebe Kaffee, Hunde und lange Spaziergänge an der Isar.", interests: ["Architektur", "Fotografie", "Kaffee", "Yoga"], city: "München", online: true },
  u2: { initials: "LK", color: "#38bdf8", name: "Lukas",  age: 28, dist: "200 m",  bio: "Softwareentwickler. Immer auf der Suche nach dem besten Burger in der Stadt.", interests: ["Coding", "Gaming", "Burger", "Reisen"], city: "München", online: true },
  u3: { initials: "SV", color: "#4ade80", name: "Svenja", age: 24, dist: "350 m",  bio: "Musikerin und Barista. Spiele Gitarre und mache die besten Latte-Art Designs.", interests: ["Musik", "Gitarre", "Kaffee", "Kunst"], city: "München", online: false, lastSeen: "Vor 5 Min" },
  u4: { initials: "MG", color: "#fb923c", name: "Morgan", age: 27, dist: "500 m",  bio: "Personal Trainer und Outdoor-Fan. Wenn ich nicht im Gym bin, findest du mich am Berg.", interests: ["Fitness", "Wandern", "Ernährung", "Klettern"], city: "München", online: false, lastSeen: "Vor 12 Min" },
  e1: { initials: "AN", color: "#e879f9", name: "Anna",   age: 25, dist: "20 m",   bio: "Grafikdesignerin mit Faible für Vintage-Mode und Street Food.", interests: ["Design", "Mode", "Street Food", "Flohmärkte"], city: "Berlin", online: false, lastSeen: "Vor 20 Min" },
  e2: { initials: "MX", color: "#38bdf8", name: "Max",    age: 30, dist: "2 m",    bio: "Journalist und Hobby-Koch. Schreibe über Berlins Food-Szene.", interests: ["Kochen", "Journalismus", "Wein", "Reisen"], city: "Berlin", online: false, lastSeen: "Vor 2 Std" },
  e3: { initials: "MR", color: "#4ade80", name: "Marie",  age: 27, dist: "5 m",    bio: "Ärztin in Ausbildung. Liebe Bücher, Tee und ruhige Abende.", interests: ["Medizin", "Bücher", "Tee", "Yoga"], city: "Berlin", online: false, lastSeen: "Vor 4 Std" },
};

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M5 6.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 20s-6.5-4.2-8.5-8A5 5 0 0 1 12 6a5 5 0 0 1 8.5 6C18.5 15.8 12 20 12 20Z" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M7 11l1-6a1.5 1.5 0 013 0l1 6" />
      <path d="M12 11l1-4a1.5 1.5 0 013 0l0 4" />
      <path d="M16 11l0-2a1.5 1.5 0 013 0v5a7 7 0 01-7 7h-2a7 7 0 01-6.08-3.54L2.5 15" />
      <path d="M7 11a1.5 1.5 0 00-3 0v1a1.5 1.5 0 003 0" />
    </svg>
  );
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const profile = ALL_PROFILES[id];
  const [waved, setWaved] = useState(false);

  if (!profile) {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "#08070f",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter',-apple-system,sans-serif", color: "#fff", gap: 16,
      }}>
        <div style={{ fontSize: 48, opacity: 0.3 }}>👤</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Profil nicht gefunden</div>
        <button
          onClick={() => router.back()}
          style={{
            marginTop: 8, padding: "10px 24px", borderRadius: 12,
            background: "linear-gradient(145deg,#b855f7,#7c3aed)",
            color: "#fff", fontSize: 14, fontWeight: 600,
            border: "none", cursor: "pointer",
          }}
        >
          Zurück
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#08070f",
      display: "flex", flexDirection: "column", overflow: "hidden",
      fontFamily: "'Inter',-apple-system,sans-serif",
    }}>
      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        paddingTop: "max(14px, env(safe-area-inset-top, 14px))",
        paddingLeft: 14, paddingRight: 14, paddingBottom: 10,
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4, display: "flex" }}
        >
          <BackIcon />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", flex: 1 }}>Profil</span>
        <Link href="/settings" style={{ color: "rgba(255,255,255,.4)", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>
          ···
        </Link>
      </div>

      {/* ── Scrollable Content ── */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 100 }}>

        {/* Avatar + name section */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 20px 20px" }}>
          {/* Large avatar circle */}
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: `linear-gradient(135deg,${profile.color}55,${profile.color}22)`,
            border: `3px solid ${profile.color}66`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, fontWeight: 800, color: "#fff",
            boxShadow: `0 0 40px ${profile.color}33`,
            position: "relative",
          }}>
            {profile.initials}
            {/* Online dot */}
            {profile.online && (
              <div style={{
                position: "absolute", bottom: 4, right: 4,
                width: 16, height: 16, borderRadius: "50%",
                background: "#22c55e", border: "3px solid #08070f",
              }} />
            )}
          </div>

          <div style={{ marginTop: 14, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
              {profile.name}, {profile.age}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.45)", marginTop: 4 }}>
              {profile.city} · {profile.dist} entfernt
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              marginTop: 6, padding: "3px 10px", borderRadius: 20,
              background: profile.online ? "rgba(34,197,94,.12)" : "rgba(255,255,255,.06)",
              fontSize: 11, fontWeight: 600,
              color: profile.online ? "#4ade80" : "rgba(255,255,255,.4)",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: profile.online ? "#22c55e" : "rgba(255,255,255,.25)",
              }} />
              {profile.online ? "Online" : profile.lastSeen}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 12,
          padding: "0 20px 20px",
        }}>
          <button
            onClick={() => setWaved(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 14,
              background: waved ? "rgba(34,197,94,.15)" : "linear-gradient(145deg,#b855f7,#7c3aed)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              border: "none", cursor: "pointer",
              boxShadow: waved ? "none" : "0 4px 18px rgba(168,85,247,.4)",
              transition: "all .2s",
            }}
          >
            <WaveIcon />
            {waved ? "Gewinkt! 👋" : "Winken"}
          </button>

          <Link href={`/chat`} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: 14,
            background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.08)",
            color: "#fff", fontSize: 13, fontWeight: 600,
            textDecoration: "none",
            transition: "all .2s",
          }}>
            <MessageIcon />
            Nachricht
          </Link>

          <button style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 42, height: 42, borderRadius: 14,
            background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.08)",
            color: "rgba(255,255,255,.5)", cursor: "pointer",
          }}>
            <HeartIcon />
          </button>
        </div>

        {/* Bio section */}
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{
            padding: "16px 18px", borderRadius: 18,
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.06)",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Über mich</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,.6)" }}>
              {profile.bio}
            </div>
          </div>
        </div>

        {/* Interests */}
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{
            padding: "16px 18px", borderRadius: 18,
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.06)",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Interessen</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {profile.interests.map(interest => (
                <span key={interest} style={{
                  padding: "5px 12px", borderRadius: 20,
                  background: `${profile.color}18`,
                  border: `1px solid ${profile.color}28`,
                  fontSize: 12, fontWeight: 600,
                  color: profile.color,
                }}>
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Distance info */}
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{
            padding: "14px 18px", borderRadius: 18,
            background: "linear-gradient(135deg, rgba(168,85,247,.08), rgba(99,102,241,.04))",
            border: "1px solid rgba(168,85,247,.12)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(168,85,247,.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#c084fc", flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{profile.dist} entfernt</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 1 }}>
                Ungefähre Entfernung (50-200m Unschärfe)
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom nav ── */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-around",
        background: "rgba(6,5,12,.93)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderTop: "1px solid rgba(255,255,255,.06)",
        paddingTop: 10,
        paddingBottom: "max(14px, env(safe-area-inset-bottom, 14px))",
        paddingLeft: 14, paddingRight: 14,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 30, color: "rgba(255,255,255,.3)", textDecoration: "none" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
          </svg>
        </Link>
        <Link href="/nearby" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 30, color: "rgba(255,255,255,.3)", textDecoration: "none" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65">
            <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
            <line x1="12" y1="12" x2="20" y2="5.5" strokeWidth="1.4"/>
          </svg>
        </Link>
        <Link href="/matches" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 30, color: "rgba(255,255,255,.3)", textDecoration: "none" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65">
            <path d="M12 20s-6.5-4.2-8.5-8A5 5 0 0 1 12 6a5 5 0 0 1 8.5 6C18.5 15.8 12 20 12 20Z"/>
          </svg>
        </Link>
        <Link href="/chat" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 30, color: "rgba(255,255,255,.3)", textDecoration: "none" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65">
            <path d="M5 6.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"/>
          </svg>
        </Link>
        <Link href="/profile" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 30, color: "#a855f7", textDecoration: "none" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65">
            <circle cx="12" cy="8" r="4"/>
            <path d="M5 20a7 7 0 0 1 14 0"/>
          </svg>
        </Link>
      </nav>
    </div>
  );
}
