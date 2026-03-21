"use client";

import Link from "next/link";

export default function AboutPage() {
  const styles = {
    container: {
      position: "fixed" as const,
      inset: 0,
      zIndex: 999,
      background: "#07050f",
      color: "#ffffff",
      padding: "20px",
      paddingBottom: "120px",
      overflowY: "auto" as const,
    },
    header: {
      maxWidth: "800px",
      margin: "0 auto",
      paddingTop: "20px",
      paddingBottom: "40px",
    },
    backButton: {
      display: "inline-flex" as const,
      alignItems: "center" as const,
      gap: "8px",
      color: "#a855f7",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: 600,
      marginBottom: "20px",
      cursor: "pointer",
    },
    title: {
      fontSize: "32px",
      fontWeight: 700,
      margin: "0 0 8px 0",
    },
    subtitle: {
      fontSize: "16px",
      color: "#999",
      margin: "0",
    },
    content: {
      maxWidth: "800px",
      margin: "0 auto",
    },
    section: {
      marginBottom: "40px",
    },
    sectionTitle: {
      fontSize: "20px",
      fontWeight: 600,
      color: "#a855f7",
      marginBottom: "12px",
      margin: "0 0 12px 0",
    },
    sectionContent: {
      fontSize: "15px",
      color: "#ccc",
      lineHeight: "1.6",
      margin: "0",
    },
    card: {
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "16px",
      padding: "20px",
      marginTop: "12px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link href="/" style={styles.backButton}>
          ← Zurück
        </Link>
        <h1 style={styles.title}>Über PuQ.me</h1>
        <p style={styles.subtitle}>
          Soziales Netzwerk für echte Begegnungen
        </p>
      </div>

      <div style={styles.content}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Mission</h2>
          <p style={styles.sectionContent}>
            Wir glauben an echte Begegnungen und authentische Verbindungen.
            PuQ.me ist eine Plattform, die Menschen zusammenbringt, die sich
            wirklich treffen möchten. Keine Algorithmen, die dein Verhalten
            kontrollieren – nur ehrliche, spontane Kontakte.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Datenschutz</h2>
          <p style={styles.sectionContent}>
            Deine Privatsphäre ist uns heilig. PuQ.me ist DSGVO-konform und
            verzichtet vollständig auf Werbung und Datenverkauf. Wir verdienen
            Geld durch Premium-Features, nicht durch deine Daten.
          </p>
          <div style={styles.card}>
            <p style={{ ...styles.sectionContent, margin: "0" }}>
              ✓ Vollständige Datenverschlüsselung<br />
              ✓ Keine Werbeanzeigen<br />
              ✓ Keine Datenverkäufe<br />
              ✓ DSGVO-konform
            </p>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Team</h2>
          <p style={styles.sectionContent}>
            PuQ.me wird von einem leidenschaftlichen Team in Berlin entwickelt.
            Wir lieben Technologie und glauben an die Kraft echter menschlicher
            Verbindungen. Unser Fokus liegt auf benutzerfreundlichen Features
            und schneller Entwicklung.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Technologie</h2>
          <p style={styles.sectionContent}>
            PuQ.me ist eine Progressive Web App mit Edge-Computing von
            Cloudflare. Das bedeutet blitzschnell, überall funktionierend und
            offline-ready.
          </p>
          <div style={styles.card}>
            <p style={{ ...styles.sectionContent, margin: "0" }}>
              • Progressive Web App (PWA)<br />
              • Cloudflare Edge Computing<br />
              • Optimiert für mobile Geräte<br />
              • Offline-Unterstützung
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
