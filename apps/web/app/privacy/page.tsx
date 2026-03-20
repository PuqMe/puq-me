"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function PrivacyPage() {
  const { t, locale } = useLanguage();

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
    contactBox: {
      background: "rgba(168,85,247,0.08)",
      border: "1px solid rgba(168,85,247,0.2)",
      borderRadius: "12px",
      padding: "20px",
      marginTop: "40px",
    },
  };

  return (
    <main style={styles.container as React.CSSProperties}>
      <div style={styles.header as React.CSSProperties}>
        <Link href="/" style={styles.backButton as React.CSSProperties}>
          ← {locale === "de" ? "Zurück" : "Back"}
        </Link>
        <h1 style={styles.title as React.CSSProperties}>
          {t.privacyTitle}
        </h1>
        <p style={styles.subtitle as React.CSSProperties}>
          {t.privacyDesc}
        </p>
      </div>

      <div style={styles.content as React.CSSProperties}>
        {/* Introduction */}
        <div style={styles.section as React.CSSProperties}>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "PuQ.me respektiert deine Privatsphäre und ist zu einer transparenten Datenverarbeitung verpflichtet. Diese Datenschutzerklärung erklärt, welche Daten wir erfassen, wie wir sie nutzen, und welche Rechte dir unter der Datenschutz-Grundverordnung (DSGVO) zustehen."
              : "PuQ.me respects your privacy and is committed to transparent data processing. This privacy policy explains what data we collect, how we use it, and what rights you have under the General Data Protection Regulation (GDPR)."}
          </p>
        </div>

        {/* Data Collection */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {t.dataCollectionSection}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Wir erfassen folgende Daten:"
              : "We collect the following data:"}
          </p>
          <ul style={styles.list as React.CSSProperties}>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Profilinformationen: Name, Alter, Bio, Foto, Interessen"
                : "Profile Information: Name, age, bio, photo, interests"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Authentifizierungsdaten: Email, Passwort-Hash"
                : "Authentication Data: Email, password hash"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Standortdaten: GPS-Koordinaten (optional, mit Zustimmung)"
                : "Location Data: GPS coordinates (optional, with consent)"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Aktivitätsdaten: Swipes, Matches, Nachrichten, letzte Aktivität"
                : "Activity Data: Swipes, matches, messages, last active"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Geräteinformationen: Geräte-ID, Betriebssystem, Spracheinstellung"
                : "Device Information: Device ID, OS, language preference"}
            </li>
          </ul>
        </div>

        {/* Location & Geolocation */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {t.geolocationSection}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "PuQ.me benötigt Standortinformationen, um dir nahegelegene Personen anzuzeigen. Hier ist, wie wir Datenschutz priorisieren:"
              : "PuQ.me requires location information to show you nearby people. Here's how we prioritize privacy:"}
          </p>
          <ul style={styles.list as React.CSSProperties}>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Standort ist optional: Du kannst die Freigabe jederzeit deaktivieren"
                : "Location is optional: You can disable sharing at any time"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Verschwommene Begegnungen: Andere Nutzer sehen dich nur als verschwommene Zone, nicht als exakten Standort"
                : "Blurred Encounters: Other users only see you as a blurred zone, not exact location"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Keine kontinuierliche Verfolgung: Dein Standort wird nur bei Bedarf aktualisiert"
                : "No continuous tracking: Your location is only updated as needed"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Lokale Verarbeitung: Standort-Hashing erfolgt auf deinem Gerät, bevor Daten übertragen werden"
                : "Local Processing: Location hashing occurs on your device before data transmission"}
            </li>
          </ul>
          <div style={styles.highlight as React.CSSProperties}>
            {locale === "de"
              ? "Dein Standort wird niemals mit dritten Parteien geteilt und dient nur dazu, dir Matches und Circle-Mitglieder in deiner Nähe zu zeigen."
              : "Your location is never shared with third parties and is only used to show you matches and circle members near you."}
          </div>
        </div>

        {/* Data Storage */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {t.dataStorageSection}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Wir speichern deine Daten sicher mit branchenüblichen Verschlüsselungs- und Sicherheitsmaßnahmen:"
              : "We store your data securely using industry-standard encryption and security measures:"}
          </p>
          <ul style={styles.list as React.CSSProperties}>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "TLS-Verschlüsselung bei der Übertragung"
                : "TLS encryption in transit"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Verschlüsselte Datenbankspeicherung"
                : "Encrypted database storage"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Passwörter werden mit bcrypt gehasht"
                : "Passwords hashed with bcrypt"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Regelmäßige Sicherheitsaudits"
                : "Regular security audits"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Daten werden nur so lange gespeichert, wie nötig (max. 5 Jahre nach Löschung)"
                : "Data retained only as long as necessary (max 5 years after deletion)"}
            </li>
          </ul>
        </div>

        {/* Data Sharing */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {t.dataSharingSection}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Wir teilen deine Daten nicht mit dritten Parteien zu Werbezwecken. Deine Daten werden geteilt mit:"
              : "We do not share your data with third parties for advertising. Your data is shared with:"}
          </p>
          <ul style={styles.list as React.CSSProperties}>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "anderen Nutzern: nur dein öffentliches Profil (Foto, Name, Interessen)"
                : "Other users: only your public profile (photo, name, interests)"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Dienstverwaltung: CDN für Bildpeicherung (mit Datenschutzvertrag)"
                : "Service providers: CDN for image storage (with data processing agreement)"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              {locale === "de"
                ? "Behörden: nur wenn gesetzlich erforderlich"
                : "Authorities: only if legally required"}
            </li>
          </ul>
        </div>

        {/* Your Rights */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {t.userRightsSection}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Nach der DSGVO hast du folgende Rechte:"
              : "Under GDPR, you have the following rights:"}
          </p>
          <ul style={styles.list as React.CSSProperties}>
            <li style={styles.listItem as React.CSSProperties}>
              <strong>
                {locale === "de"
                  ? "Recht auf Zugang (Art. 15)"
                  : "Right of Access (Art. 15)"}
              </strong>
              {locale === "de"
                ? ": Du kannst anfragen, welche Daten wir über dich haben"
                : ": You can request what data we hold about you"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              <strong>
                {locale === "de"
                  ? "Recht auf Berichtigung (Art. 16)"
                  : "Right of Rectification (Art. 16)"}
              </strong>
              {locale === "de"
                ? ": Du kannst unrichtige Daten korrigieren"
                : ": You can correct inaccurate data"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              <strong>
                {locale === "de"
                  ? "Recht auf Löschung (Art. 17)"
                  : "Right of Erasure (Art. 17)"}
              </strong>
              {locale === "de"
                ? ": Du kannst dein Konto und alle Daten löschen"
                : ": You can delete your account and all data"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              <strong>
                {locale === "de"
                  ? "Recht auf Datenbeschränkung (Art. 18)"
                  : "Right to Restrict Processing (Art. 18)"}
              </strong>
              {locale === "de"
                ? ": Du kannst die Verarbeitung einschränken"
                : ": You can restrict processing"}
            </li>
            <li style={styles.listItem as React.CSSProperties}>
              <strong>
                {locale === "de"
                  ? "Recht auf Datenportabilität (Art. 20)"
                  : "Right to Data Portability (Art. 20)"}
              </strong>
              {locale === "de"
                ? ": Du kannst deine Daten herunterladen"
                : ": You can download your data"}
            </li>
          </ul>
        </div>

        {/* Deletion Rights */}
        <div style={styles.section as React.CSSProperties}>
          <h2 style={styles.sectionTitle as React.CSSProperties}>
            {t.deletionRightsSection}
          </h2>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Du hast das Recht, dein Konto und alle damit verbundenen Daten zu löschen. Dies ist ein strafrechtlich garantiertes Recht unter der DSGVO."
              : "You have the right to delete your account and all associated data. This is a legally guaranteed right under GDPR."}
          </p>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Um dein Konto zu löschen, besuche:"
              : "To delete your account, visit:"}
          </p>
          <Link href="/delete-account" style={{ color: "#a855f7" }}>
            {locale === "de" ? "Konto löschen" : "Delete Account"}
          </Link>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Die Löschung ist sofort und nicht rückgängig zu machen."
              : "Deletion is immediate and irreversible."}
          </p>
        </div>

        {/* Contact */}
        <div style={styles.contactBox as React.CSSProperties}>
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "16px",
              fontWeight: 700,
              color: "#c084fc",
            }}
          >
            {t.contactSection}
          </h3>
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {locale === "de"
              ? "Haben Sie Fragen zum Datenschutz? Kontaktieren Sie uns:"
              : "Questions about privacy? Contact us:"}
          </p>
          <p
            style={{
              margin: "8px 0",
              fontSize: "14px",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <strong>{locale === "de" ? "E-Mail:" : "Email:"}</strong>{" "}
            privacy@puq.me
          </p>
          <p
            style={{
              margin: "0",
              fontSize: "14px",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <strong>{locale === "de" ? "Datenschutzbeauftragte:" : "DPO:"}</strong>{" "}
            dpo@puq.me
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
            ? "Zuletzt aktualisiert: März 2026"
            : "Last updated: March 2026"}
        </p>
      </div>
    </main>
  );
}
