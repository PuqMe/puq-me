"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function ImpressumPage() {
  const { locale } = useLanguage();

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
      color: "#ffffff",
    },
    subtitle: {
      fontSize: "16px",
      color: "rgba(255,255,255,0.6)",
      margin: 0,
    },
    content: {
      maxWidth: "800px",
      margin: "0 auto",
    },
    section: {
      marginBottom: "40px",
    },
    sectionTitle: {
      fontSize: "22px",
      fontWeight: 700,
      marginBottom: "12px",
      color: "#c084fc",
      paddingBottom: "8px",
      borderBottom: "1px solid rgba(168,85,247,0.2)",
    },
    paragraph: {
      fontSize: "14px",
      lineHeight: 1.6,
      color: "rgba(255,255,255,0.8)",
      marginBottom: "12px",
    },
    contactBox: {
      background: "rgba(168,85,247,0.08)",
      border: "1px solid rgba(168,85,247,0.2)",
      borderRadius: "12px",
      padding: "20px",
      marginTop: "20px",
    },
  };

  return (
    <main style={styles.container as React.CSSProperties}>
      <div style={styles.header as React.CSSProperties}>
        <Link href="/" style={styles.backButton as React.CSSProperties}>
          {"\u2190"} {locale === "de" ? "Zur\u00fcck" : "Back"}
        </Link>
        <h1 style={styles.title as React.CSSProperties}>
          {locale === "de" ? "Impressum" : "Legal Notice"}
        </h1>
        <p style={styles.subtitle as React.CSSProperties}>
          {locale === "de"
            ? "Angaben gem\u00e4\u00df \u00a7 5 TMG"
            : "Information pursuant to \u00a7 5 TMG"}
        </p>
      </div>

      <div style={styles.content as React.CSSProperties}>
        {/* Responsible */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {locale === "de" ? "Verantwortlich" : "Responsible"}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            Alan Best<br />
            PuQ.me<br />
            {locale === "de" ? "E-Mail" : "Email"}: contact@puq.me
          </p>
        </div>

        {/* Content Responsibility */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {locale === "de"
              ? "Inhaltlich Verantwortlicher"
              : "Content Responsibility"}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Verantwortlich f\u00fcr den Inhalt nach \u00a7 55 Abs. 2 RStV:"
              : "Responsible for content according to \u00a7 55 para. 2 RStV:"}
          </p>
          <p style={styles.paragraph as React.CSSProperties}>
            Alan Best<br />
            contact@puq.me
          </p>
        </div>

        {/* Dispute Resolution */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {locale === "de" ? "Streitbeilegung" : "Dispute Resolution"}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Die Europ\u00e4ische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/. Unsere E-Mail-Adresse finden Sie oben im Impressum."
              : "The European Commission provides a platform for online dispute resolution (OS): https://ec.europa.eu/consumers/odr/. You can find our email address above."}
          </p>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
              : "We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board."}
          </p>
        </div>

        {/* Liability for Content */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {locale === "de" ? "Haftung f\u00fcr Inhalte" : "Liability for Content"}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Als Diensteanbieter sind wir gem\u00e4\u00df \u00a7 7 Abs.1 TMG f\u00fcr eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach \u00a7\u00a7 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, \u00fcbermittelte oder gespeicherte fremde Informationen zu \u00fcberwachen."
              : "As a service provider, we are responsible for our own content on these pages in accordance with general laws pursuant to \u00a7 7 (1) TMG. According to \u00a7\u00a7 8 to 10 TMG, however, we are not obligated to monitor transmitted or stored third-party information."}
          </p>
        </div>

        {/* Liability for Links */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {locale === "de" ? "Haftung f\u00fcr Links" : "Liability for Links"}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Unser Angebot enth\u00e4lt Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb k\u00f6nnen wir f\u00fcr diese fremden Inhalte auch keine Gew\u00e4hr \u00fcbernehmen."
              : "Our website contains links to external third-party websites, over whose content we have no influence. Therefore, we cannot assume any liability for this third-party content."}
          </p>
        </div>

        {/* Copyright */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {locale === "de" ? "Urheberrecht" : "Copyright"}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielf\u00e4ltigung, Bearbeitung, Verbreitung und jede Art der Verwertung au\u00dferhalb der Grenzen des Urheberrechtes bed\u00fcrfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers."
              : "The content and works created by the site operators on these pages are subject to German copyright law. Duplication, processing, distribution, and any kind of exploitation beyond the limits of copyright law require the written consent of the respective author or creator."}
          </p>
        </div>

        {/* Contact Box */}
        <div style={styles.contactBox as React.CSSProperties}>
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "16px",
              fontWeight: 700,
              color: "#c084fc",
            }}
          >
            {locale === "de" ? "Kontakt" : "Contact"}
          </h3>
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {locale === "de"
              ? "Bei Fragen zum Impressum oder zur Website:"
              : "For questions about this legal notice or the website:"}
          </p>
          <p
            style={{
              margin: "8px 0 0 0",
              fontSize: "14px",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <strong>{locale === "de" ? "E-Mail:" : "Email:"}</strong> contact@puq.me
          </p>
        </div>

        {/* Last updated */}
        <p
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.4)",
            marginTop: "60px",
            textAlign: "center",
          }}
        >
          {locale === "de"
            ? "Zuletzt aktualisiert: M\u00e4rz 2026"
            : "Last updated: March 2026"}
        </p>
      </div>
    </main>
  );
}
