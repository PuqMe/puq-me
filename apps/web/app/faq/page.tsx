"use client";

import Link from "next/link";
import { useState } from "react";

export default function FAQPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
    faqList: {
      display: "flex" as const,
      flexDirection: "column" as const,
      gap: "12px",
      marginTop: "30px",
    },
    faqItem: {
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px",
      overflow: "hidden",
    },
    faqQuestion: {
      padding: "16px 20px",
      cursor: "pointer",
      display: "flex" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      fontSize: "15px",
      fontWeight: 600,
      color: "#a855f7",
      transition: "all 0.2s ease",
    },
    faqQuestionHover: {
      background: "rgba(168,85,247,0.1)",
    },
    faqToggleIcon: {
      fontSize: "18px",
      transition: "transform 0.3s ease",
    },
    faqAnswer: {
      padding: "0 20px 16px 20px",
      fontSize: "14px",
      color: "#ccc",
      lineHeight: "1.6",
      borderTop: "1px solid rgba(168,85,247,0.2)",
    },
  };

  const faqItems = [
    {
      question: "Was ist PuQ.me?",
      answer:
        "PuQ.me ist ein soziales Netzwerk für echte Begegnungen. Wir verbinden Menschen in deiner Nähe, die sich authentisch treffen möchten – ohne Algorithmen, die dein Verhalten kontrollieren.",
    },
    {
      question: "Ist PuQ.me kostenlos?",
      answer:
        "Ja, die Grundversion von PuQ.me ist vollständig kostenlos. Es gibt optionale Premium-Features für erweiterte Funktionen, aber alle Kernfunktionen sind ohne Kosten verfügbar.",
    },
    {
      question: "Wie funktioniert das Radar?",
      answer:
        "Das Radar zeigt dir Personen in Echtzeit um dich herum an. Die Plattform nutzt Geolocation, um Menschen mit ähnlichen Interessen in deiner Nähe zu finden. Du hast volle Kontrolle über deine Sichtbarkeit.",
    },
    {
      question: "Was ist Smart Match?",
      answer:
        "Smart Match ist unser KI-basiertes Matching-System, das dich mit Personen verbindet, die wirklich zu dir passen. Es analysiert deine Interessen, Hobbys und Vorlieben, um bessere Verbindungen zu finden.",
    },
    {
      question: "Ist mein Profil sicher?",
      answer:
        "Absolut. PuQ.me verfügt über vollständige Datenverschlüsselung und ist DSGVO-konform. Deine Daten werden nie an Dritte verkauft, und du hast jederzeit volle Kontrolle über deine Privatsphäre-Einstellungen.",
    },
    {
      question: "Was ist Auto-Vanish?",
      answer:
        "Auto-Vanish ist eine Funktion, bei der dein Profil automatisch nach einer bestimmten Zeit (z.B. 24 Stunden) verschwindet. Das gibt dir volle Kontrolle über deine Präsenz auf der Plattform.",
    },
    {
      question: "In welchen Städten ist PuQ.me verfügbar?",
      answer:
        "PuQ.me ist in allen größeren deutschen Städten verfügbar und expandiert kontinuierlich in europäische Städte. Du kannst die App überall nutzen – solange du eine Internetverbindung hast.",
    },
    {
      question: "Wie lösche ich mein Konto?",
      answer:
        "Du kannst dein Konto jederzeit in den Kontoeinstellungen löschen. Alle deine Daten werden sofort gelöscht und können nicht wiederhergestellt werden. Der Löschvorgang ist endgültig.",
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link href="/" style={styles.backButton}>
          ← Zurück
        </Link>
        <h1 style={styles.title}>Häufige Fragen</h1>
        <p style={styles.subtitle}>
          Antworten auf die wichtigsten Fragen
        </p>
      </div>

      <div style={styles.content}>
        <div style={styles.faqList}>
          {faqItems.map((item, index) => (
            <div key={index} style={styles.faqItem}>
              <div
                style={styles.faqQuestion}
                onClick={() =>
                  setExpandedIndex(
                    expandedIndex === index ? null : index
                  )
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(168,85,247,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span>{item.question}</span>
                <span
                  style={{
                    ...styles.faqToggleIcon,
                    transform:
                      expandedIndex === index
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                  }}
                >
                  ▼
                </span>
              </div>
              {expandedIndex === index && (
                <div style={styles.faqAnswer}>{item.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
