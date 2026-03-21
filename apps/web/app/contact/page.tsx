"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

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
    contactCardsContainer: {
      display: "grid" as const,
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
      marginBottom: "40px",
      marginTop: "30px",
    },
    contactCard: {
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "16px",
      padding: "24px",
      textAlign: "center" as const,
    },
    contactCardIcon: {
      fontSize: "32px",
      marginBottom: "12px",
    },
    contactCardTitle: {
      fontSize: "16px",
      fontWeight: 600,
      color: "#a855f7",
      marginBottom: "8px",
      margin: "0 0 8px 0",
    },
    contactCardValue: {
      fontSize: "14px",
      color: "#ccc",
      margin: "0",
      wordBreak: "break-all" as const,
    },
    formSection: {
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "16px",
      padding: "30px",
      marginBottom: "20px",
    },
    formGroup: {
      marginBottom: "20px",
    },
    formLabel: {
      display: "block" as const,
      fontSize: "14px",
      fontWeight: 600,
      color: "#a855f7",
      marginBottom: "8px",
    },
    formInput: {
      width: "100%" as const,
      padding: "12px 16px",
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "8px",
      color: "#ffffff",
      fontSize: "14px",
      fontFamily: "inherit",
      boxSizing: "border-box" as const,
      transition: "all 0.2s ease",
    },
    formTextarea: {
      width: "100%" as const,
      padding: "12px 16px",
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "8px",
      color: "#ffffff",
      fontSize: "14px",
      fontFamily: "inherit",
      boxSizing: "border-box" as const,
      minHeight: "120px",
      resize: "vertical" as const,
      transition: "all 0.2s ease",
    },
    submitButton: {
      width: "100%" as const,
      padding: "12px 24px",
      background: "#a855f7",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      fontSize: "15px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    note: {
      fontSize: "13px",
      color: "#999",
      textAlign: "center" as const,
      margin: "20px 0 0 0",
    },
    successMessage: {
      background: "rgba(34,197,94,0.1)",
      border: "1px solid rgba(34,197,94,0.3)",
      borderRadius: "8px",
      padding: "16px",
      color: "#86efac",
      textAlign: "center" as const,
      marginBottom: "20px",
      fontSize: "14px",
    },
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link href="/" style={styles.backButton}>
          ← Zurück
        </Link>
        <h1 style={styles.title}>Kontakt</h1>
        <p style={styles.subtitle}>Wir freuen uns von dir zu hören</p>
      </div>

      <div style={styles.content}>
        <div style={styles.contactCardsContainer}>
          <div style={styles.contactCard}>
            <div style={styles.contactCardIcon}>✉️</div>
            <h3 style={styles.contactCardTitle}>E-Mail</h3>
            <p style={styles.contactCardValue}>info@puq.me</p>
          </div>
          <div style={styles.contactCard}>
            <div style={styles.contactCardIcon}>📍</div>
            <h3 style={styles.contactCardTitle}>Standort</h3>
            <p style={styles.contactCardValue}>
              Berlin, Deutschland
            </p>
          </div>
        </div>

        {submitted && (
          <div style={styles.successMessage}>
            ✓ Danke für deine Nachricht! Wir antworten in der Regel
            innerhalb von 24 Stunden.
          </div>
        )}

        <div style={styles.formSection}>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Dein Name"
                required
                style={styles.formInput}
                onFocus={(e) => {
                  e.target.style.borderColor =
                    "rgba(168,85,247,0.5)";
                  e.target.style.background =
                    "rgba(255,255,255,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor =
                    "rgba(255,255,255,0.1)";
                  e.target.style.background =
                    "rgba(255,255,255,0.08)";
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>E-Mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="deine@email.de"
                required
                style={styles.formInput}
                onFocus={(e) => {
                  e.target.style.borderColor =
                    "rgba(168,85,247,0.5)";
                  e.target.style.background =
                    "rgba(255,255,255,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor =
                    "rgba(255,255,255,0.1)";
                  e.target.style.background =
                    "rgba(255,255,255,0.08)";
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Nachricht</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Schreib uns deine Nachricht..."
                required
                style={styles.formTextarea}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(168,85,247,0.5)";
                  e.currentTarget.style.background =
                    "rgba(255,255,255,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.1)";
                  e.currentTarget.style.background =
                    "rgba(255,255,255,0.08)";
                }}
              />
            </div>

            <button
              type="submit"
              style={styles.submitButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "rgba(168,85,247,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "#a855f7";
              }}
            >
              Senden
            </button>
          </form>

          <p style={styles.note}>
            Wir antworten in der Regel innerhalb von 24 Stunden.
          </p>
        </div>
      </div>
    </div>
  );
}
