"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function AGBPage() {
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
    list: {
      fontSize: "14px",
      lineHeight: 1.6,
      color: "rgba(255,255,255,0.8)",
      marginBottom: "12px",
      paddingLeft: "20px",
    },
    listItem: {
      marginBottom: "8px",
    },
    highlight: {
      background: "rgba(168,85,247,0.1)",
      border: "1px solid rgba(168,85,247,0.2)",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "16px",
    },
  };

  return (
    <main style={styles.container as React.CSSProperties}>
      <div style={styles.header as React.CSSProperties}>
        <Link href="/" style={styles.backButton as React.CSSProperties}>
          {"\u2190"} {locale === "de" ? "Zur\u00fcck" : "Back"}
        </Link>
        <h1 style={styles.title as React.CSSProperties}>
          {locale === "de"
            ? "Allgemeine Gesch\u00e4ftsbedingungen"
            : "Terms of Service"}
        </h1>
        <p style={styles.subtitle as React.CSSProperties}>
          {locale === "de"
            ? "Nutzungsbedingungen f\u00fcr PuQ.me"
            : "Terms of use for PuQ.me"}
        </p>
      </div>

      <div style={styles.content as React.CSSProperties}>
        {/* 1. Scope */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {locale === "de" ? "1. Geltungsbereich" : "1. Scope"}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Diese Allgemeinen Gesch\u00e4ftsbedingungen (AGB) gelten f\u00fcr die Nutzung der Plattform PuQ.me und aller damit verbundenen Dienste. Mit der Registrierung oder Nutzung der Plattform akzeptierst du diese Bedingungen."
              : "These Terms of Service apply to the use of the PuQ.me platform and all related services. By registering or using the platform, you accept these terms."}
          </p>
        </div>

        {/* 2. Services */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {locale === "de" ? "2. Leistungsbeschreibung" : "2. Services"}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "PuQ.me ist eine standortbasierte Plattform, die Nutzern erm\u00f6glicht, andere Personen in ihrer N\u00e4he zu entdecken, zu kommunizieren und sich zu vernetzen. Die Plattform bietet unter anderem:"
              : "PuQ.me is a location-based platform that allows users to discover, communicate with, and connect with people nearby. The platform offers:"}
          </p>
          <ul style={styles.list as React.CSSProperties}>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Profildarstellung und -verwaltung"
                : "Profile display and management"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Standortbasierte Begegnungserkennung"
                : "Location-based encounter detection"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Matching und Nachrichtenaustausch"
                : "Matching and messaging"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Gruppen- und Kreisfunktionen"
                : "Group and circle features"}
            </li>
          </ul>
        </div>

        {/* 3. Registration */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {locale === "de" ? "3. Registrierung & Konto" : "3. Registration & Account"}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "F\u00fcr die Nutzung ist eine Registrierung erforderlich. Du musst mindestens 18 Jahre alt sein. Du bist f\u00fcr die Richtigkeit deiner Angaben und die Sicherheit deines Kontos verantwortlich."
              : "Registration is required to use the platform. You must be at least 18 years old. You are responsible for the accuracy of your information and the security of your account."}
          </p>
        </div>

        {/* 4. User Obligations */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {locale === "de" ? "4. Nutzerpflichten" : "4. User Obligations"}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Als Nutzer verpflichtest du dich:"
              : "As a user, you agree to:"}
          </p>
          <ul style={styles.list as React.CSSProperties}>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Nur wahrheitsgem\u00e4\u00dfe Informationen anzugeben"
                : "Only provide truthful information"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Keine beleidigenden, diskriminierenden oder rechtswidrigen Inhalte zu ver\u00f6ffentlichen"
                : "Not publish offensive, discriminatory, or illegal content"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Die Privatsph\u00e4re anderer Nutzer zu respektieren"
                : "Respect the privacy of other users"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Die Plattform nicht f\u00fcr kommerzielle Zwecke oder Spam zu missbrauchen"
                : "Not misuse the platform for commercial purposes or spam"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Kein automatisiertes Zugreifen auf die Plattform (Bots, Scraping)"
                : "No automated access to the platform (bots, scraping)"}
            </li>
          </ul>
        </div>

        {/* 5. Data Protection */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {locale === "de" ? "5. Datenschutz" : "5. Data Protection"}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Der Schutz deiner Daten ist uns wichtig. Details zur Datenverarbeitung findest du in unserer Datenschutzerkl\u00e4rung."
              : "The protection of your data is important to us. Details on data processing can be found in our Privacy Policy."}
          </p>
          <Link href="/privacy" style={{ color: "#a855f7", fontSize: "14px" }}>
            {locale === "de"
              ? "\u2192 Datenschutzerkl\u00e4rung"
              : "\u2192 Privacy Policy"}
          </Link>
        </div>

        {/* 6. Liability */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {locale === "de" ? "6. Haftung" : "6. Liability"}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "PuQ.me \u00fcbernimmt keine Haftung f\u00fcr die Richtigkeit, Vollst\u00e4ndigkeit oder Aktualit\u00e4t der von Nutzern bereitgestellten Inhalte. Die Nutzung der Plattform erfolgt auf eigenes Risiko."
              : "PuQ.me assumes no liability for the accuracy, completeness, or timeliness of content provided by users. Use of the platform is at your own risk."}
          </p>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "F\u00fcr Sch\u00e4den, die durch die Nutzung der Plattform entstehen, haften wir nur bei Vorsatz und grober Fahrl\u00e4ssigkeit."
              : "We are only liable for damages arising from the use of the platform in cases of intent and gross negligence."}
          </p>
        </div>

        {/* 7. Termination */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {locale === "de"
              ? "7. K\u00fcndigung & Kontol\u00f6schung"
              : "7. Termination & Account Deletion"}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Du kannst dein Konto jederzeit l\u00f6schen. PuQ.me beh\u00e4lt sich das Recht vor, Konten bei Verst\u00f6\u00dfen gegen diese AGB zu sperren oder zu l\u00f6schen."
              : "You can delete your account at any time. PuQ.me reserves the right to suspend or delete accounts that violate these terms."}
          </p>
          <Link href="/delete-account" style={{ color: "#a855f7", fontSize: "14px" }}>
            {locale === "de" ? "\u2192 Konto l\u00f6schen" : "\u2192 Delete Account"}
          </Link>
        </div>

        {/* 8. Changes */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {locale === "de" ? "8. \u00c4nderungen der AGB" : "8. Changes to Terms"}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "PuQ.me beh\u00e4lt sich das Recht vor, diese AGB jederzeit zu \u00e4ndern. \u00c4nderungen werden dir per E-Mail oder In-App-Benachrichtigung mitgeteilt. Die fortgesetzte Nutzung nach \u00c4nderung gilt als Zustimmung."
              : "PuQ.me reserves the right to change these terms at any time. Changes will be communicated to you via email or in-app notification. Continued use after changes constitutes acceptance."}
          </p>
        </div>

        {/* 9. Applicable Law */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {locale === "de"
              ? "9. Anwendbares Recht"
              : "9. Applicable Law"}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist, soweit gesetzlich zul\u00e4ssig, der Sitz des Betreibers."
              : "The law of the Federal Republic of Germany applies. The place of jurisdiction is, to the extent permitted by law, the registered office of the operator."}
          </p>
        </div>

        <div style={styles.highlight as React.CSSProperties}>
          <p style={{ ...styles.paragraph, margin: 0 } as React.CSSProperties}>
            {locale === "de"
              ? "Bei Fragen zu diesen AGB kontaktiere uns unter: contact@puq.me"
              : "For questions about these terms, contact us at: contact@puq.me"}
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
