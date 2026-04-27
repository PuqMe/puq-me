"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type EncounterRow = {
  id: string;
  initials: string;
  color: string;
  name: string;
  age: number;
  area: string;
  lastSeen: string;
  totalEncounters: number;
  mutual?: boolean;
};

const DEMO_ENCOUNTERS: EncounterRow[] = [
  { id: "demo-1", initials: "MA", color: "#e879f9", name: "Maya",  age: 29, area: "Kreuzberg",     lastSeen: "vor 14 Min", totalEncounters: 5, mutual: true },
  { id: "demo-2", initials: "NO", color: "#38bdf8", name: "Noor",  age: 26, area: "Neukölln",       lastSeen: "vor 1 Std",  totalEncounters: 1 },
  { id: "u1",     initials: "EM", color: "#a855f7", name: "Emma",  age: 26, area: "München Mitte",  lastSeen: "vor 3 Std",  totalEncounters: 2, mutual: true },
  { id: "u2",     initials: "LK", color: "#22d3ee", name: "Lukas", age: 28, area: "Schwabing",      lastSeen: "vor 6 Std",  totalEncounters: 1 },
];

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function EncounterListPage() {
  const router = useRouter();
  const [items, setItems] = useState<EncounterRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: replace with real API call to GET /v1/circle/encounters
    const t = setTimeout(() => {
      setItems(DEMO_ENCOUNTERS);
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#07050f",
        color: "#fff",
        fontFamily: "'Inter',-apple-system,sans-serif",
        paddingBottom: 96,
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(7,5,15,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          onClick={() => router.back()}
          aria-label="Zurück"
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            padding: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BackIcon />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>Begegnungen</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
            Wer dir heute begegnet ist
          </div>
        </div>
      </header>

      {/* Stats strip */}
      <section
        style={{
          padding: "16px",
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0,1fr))",
          gap: 8,
        }}
      >
        {[
          { label: "Heute", value: items.length.toString() },
          { label: "Mit Match", value: items.filter((i) => i.mutual).length.toString() },
          { label: "Schutz", value: "Unscharf" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: "12px 10px",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {/* List */}
      <section style={{ padding: "0 16px" }}>
        {loading ? (
          <div style={{ padding: "32px 0", textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
            Lade Begegnungen…
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
              padding: "32px 16px",
              textAlign: "center",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>👋</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Noch keine Begegnungen heute</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 6 }}>
              Sobald du dich in der Stadt bewegst, erscheinen hier Personen, deren Wege sich mit
              deinem gekreuzt haben.
            </div>
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((it) => (
              <li key={it.id}>
                <Link
                  href={`/encounter/${it.id}`}
                  prefetch={false}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    textDecoration: "none",
                    color: "#fff",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: it.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#0b0612",
                      flexShrink: 0,
                    }}
                  >
                    {it.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{it.name}, {it.age}</span>
                      {it.mutual && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: "2px 6px",
                            borderRadius: 999,
                            background: "rgba(168,85,247,0.18)",
                            color: "#c4a8ff",
                            fontWeight: 600,
                          }}
                        >
                          gegenseitig
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: "rgba(255,255,255,0.55)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <MapPinIcon />
                      <span>{it.area}</span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>{it.lastSeen}</span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>{it.totalEncounters}× getroffen</span>
                    </div>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>
                    <ChevronRightIcon />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Privacy footnote */}
      <section style={{ padding: "20px 16px 0", color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 1.5 }}>
        Standorte werden absichtlich nur ungenau (50–200 m) gespeichert. Begegnungen verschwinden
        nach 7 Tagen automatisch.
      </section>
    </main>
  );
}
