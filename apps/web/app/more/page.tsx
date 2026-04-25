"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

type Tile = {
  href: string;
  label_de: string;
  label_en: string;
  desc_de: string;
  desc_en: string;
  emoji: string;
};

const TILES: Tile[] = [
  { href: "/settings", label_de: "Einstellungen", label_en: "Settings", desc_de: "Sprache, Push, Sichtbarkeit, Konto", desc_en: "Language, push, visibility, account", emoji: "⚙️" },
  { href: "/profile", label_de: "Mein Profil", label_en: "My profile", desc_de: "Bio, Foto, Interessen", desc_en: "Bio, photo, interests", emoji: "👤" },
  { href: "/interests", label_de: "Interessen", label_en: "Interests", desc_de: "Was dich bewegt", desc_en: "What moves you", emoji: "✨" },
  { href: "/intent", label_de: "Vorhaben", label_en: "Intent", desc_de: "Wonach suchst du heute?", desc_en: "What are you up to today?", emoji: "🎯" },
  { href: "/visibility", label_de: "Sichtbarkeit", label_en: "Visibility", desc_de: "Wer dich sehen kann", desc_en: "Who can see you", emoji: "👁️" },
  { href: "/auto-vanish", label_de: "Auto-Verschwinden", label_en: "Auto-vanish", desc_de: "Profil-Fade nach Inaktivität", desc_en: "Profile fade on idle", emoji: "🌫️" },
  { href: "/calm", label_de: "Ruhemodus", label_en: "Calm mode", desc_de: "Pausen für ein gesundes Tempo", desc_en: "Breaks for a healthy pace", emoji: "🌙" },
  { href: "/buzz", label_de: "Buzz-Radar", label_en: "Buzz radar", desc_de: "Vibration bei Match in der Nähe", desc_en: "Vibrate on nearby match", emoji: "📳" },
  { href: "/groups", label_de: "Gruppen", label_en: "Groups", desc_de: "Aktivitäten & Treffen", desc_en: "Activities & meetups", emoji: "👥" },
  { href: "/badges", label_de: "Abzeichen", label_en: "Badges", desc_de: "Level, Serien, XP", desc_en: "Levels, streaks, XP", emoji: "🏅" },
  { href: "/cards", label_de: "Aktivitäts-Karten", label_en: "Activity cards", desc_de: "Aktionen mit Ablaufzeit", desc_en: "Actions with expiry", emoji: "🃏" },
  { href: "/smart-match", label_de: "Smart Match", label_en: "Smart Match", desc_de: "KI-gestützte Treffer", desc_en: "AI-assisted matches", emoji: "🧠" },
  { href: "/followers", label_de: "Follower", label_en: "Followers", desc_de: "Wer dir folgt, wem du folgst", desc_en: "Followers & following", emoji: "🔔" },
  { href: "/about", label_de: "Über PuQ.me", label_en: "About PuQ.me", desc_de: "Mission & Team", desc_en: "Mission & team", emoji: "💜" },
  { href: "/faq", label_de: "Häufige Fragen", label_en: "FAQ", desc_de: "Antworten auf alles", desc_en: "Answers to everything", emoji: "❓" },
  { href: "/contact", label_de: "Kontakt", label_en: "Contact", desc_de: "Schreib uns", desc_en: "Reach out", emoji: "✉️" },
  { href: "/impressum", label_de: "Impressum", label_en: "Imprint", desc_de: "§ 5 TMG", desc_en: "Legal notice", emoji: "📜" },
  { href: "/agb", label_de: "AGB", label_en: "Terms", desc_de: "Nutzungsbedingungen", desc_en: "Terms of service", emoji: "📑" },
  { href: "/privacy", label_de: "Datenschutz", label_en: "Privacy", desc_de: "DSGVO-konform", desc_en: "GDPR compliant", emoji: "🔒" },
  { href: "/delete-account", label_de: "Konto löschen", label_en: "Delete account", desc_de: "DSGVO Art. 17", desc_en: "GDPR Art. 17", emoji: "🗑️" },
];

export default function MorePage() {
  const { locale } = useLanguage();
  const isDe = locale === "de";

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6">
      <header style={{ marginBottom: 18 }}>
        <h1 className="text-xl font-semibold text-white">
          {isDe ? "Mehr" : "More"}
        </h1>
        <p style={{ marginTop: 4, fontSize: 13, color: "rgba(255,255,255,.55)" }}>
          {isDe
            ? "Alle Bereiche der App auf einen Blick."
            : "All app sections at a glance."}
        </p>
      </header>

      <ul
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 8,
          listStyle: "none",
          padding: 0,
          margin: 0,
        }}
      >
        {TILES.map((tile) => (
          <li key={tile.href} style={{ minHeight: 84 }}>
            <Link
              href={tile.href}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: "12px 14px",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,.08)",
                background: "rgba(255,255,255,.03)",
                textDecoration: "none",
                color: "inherit",
                height: "100%",
                transition: "all .15s ease",
              }}
            >
              <span style={{ fontSize: 18 }} aria-hidden="true">
                {tile.emoji}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(255,255,255,.92)",
                }}
              >
                {isDe ? tile.label_de : tile.label_en}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,.45)",
                  lineHeight: 1.3,
                }}
              >
                {isDe ? tile.desc_de : tile.desc_en}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
