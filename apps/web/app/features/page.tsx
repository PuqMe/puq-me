"use client";

import Link from "next/link";

export default function FeaturesPage() {
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
    featureGrid: {
      display: "grid" as const,
      gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
      gap: "20px",
      marginTop: "30px",
    },
    featureCard: {
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "16px",
      padding: "24px",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    featureCardHover: {
      background: "rgba(168,85,247,0.1)",
      borderColor: "rgba(168,85,247,0.3)",
    },
    featureIcon: {
      fontSize: "32px",
      marginBottom: "12px",
    },
    featureTitle: {
      fontSize: "18px",
      fontWeight: 600,
      marginBottom: "8px",
      color: "#a855f7",
    },
    featureDescription: {
      fontSize: "14px",
      color: "#999",
      margin: "0",
    },
  };

  const features = [
    {
      icon: "📡",
      title: "Radar",
      description: "Entdecke Menschen in Echtzeit um dich herum",
    },
    {
      icon: "🧠",
      title: "Smart Match",
      description: "KI-basiertes Matching für bessere Verbindungen",
    },
    {
      icon: "👥",
      title: "Circle",
      description: "Dein sozialer Kreis mit gemeinsamen Interessen",
    },
    {
      icon: "📊",
      title: "Buzz-Radar",
      description: "Entdecke Trends und Hot Spots in deiner Nähe",
    },
    {
      icon: "✨",
      title: "Auto-Vanish",
      description: "Dein Profil verschwindet automatisch nach Belieben",
    },
    {
      icon: "😌",
      title: "Ruhemodus",
      description: "Calm Mode zum Entspannen und Durchatmen",
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link href="/" style={styles.backButton}>
          ← Zurück
        </Link>
        <h1 style={styles.title}>Funktionen</h1>
        <p style={styles.subtitle}>Alles was PuQ.me besonders macht</p>
      </div>

      <div style={styles.content}>
        <div style={styles.featureGrid}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={styles.featureCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "rgba(168,85,247,0.1)";
                e.currentTarget.style.borderColor =
                  "rgba(168,85,247,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "rgba(255,255,255,0.06)";
                e.currentTarget.style.borderColor =
                  "rgba(255,255,255,0.1)";
              }}
            >
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDescription}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
