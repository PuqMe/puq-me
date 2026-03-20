"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export default function DeleteAccountPage() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [exportRequested, setExportRequested] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
      maxWidth: "600px",
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
      maxWidth: "600px",
      margin: "0 auto",
    },
    card: {
      background: "rgba(13,9,24,0.6)",
      border: "1px solid rgba(168,85,247,0.2)",
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: 700,
      marginBottom: "12px",
      color: "#c084fc",
    },
    paragraph: {
      fontSize: "14px",
      lineHeight: 1.6,
      color: "rgba(255,255,255,0.8)",
      margin: "0 0 12px 0",
    },
    warning: {
      background: "rgba(239,68,68,0.1)",
      border: "1px solid rgba(239,68,68,0.3)",
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    warningText: {
      fontSize: "14px",
      color: "rgba(255,255,255,0.8)",
      margin: 0,
      lineHeight: 1.6,
    },
    list: {
      fontSize: "14px",
      color: "rgba(255,255,255,0.8)",
      margin: "0 0 12px 0",
      paddingLeft: 20,
    },
    listItem: {
      marginBottom: 6,
    },
    buttonGroup: {
      display: "flex" as const,
      gap: "12px",
      marginTop: "24px",
    },
    button: {
      padding: "12px 24px",
      borderRadius: 10,
      border: "none",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    primaryButton: {
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      color: "#ffffff",
      flex: 1,
    },
    secondaryButton: {
      background: "rgba(168,85,247,0.1)",
      color: "#c084fc",
      border: "1px solid rgba(168,85,247,0.3)",
      flex: 1,
    },
    confirmDialog: {
      position: "fixed" as const,
      inset: 0,
      zIndex: 9999,
      display: "flex" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(4px)",
      padding: "20px",
    },
    confirmBox: {
      background: "rgba(13,9,24,0.98)",
      border: "1px solid rgba(168,85,247,0.3)",
      borderRadius: 20,
      padding: 32,
      maxWidth: 380,
      backdropFilter: "blur(12px)",
    },
    confirmTitle: {
      fontSize: "22px",
      fontWeight: 700,
      marginBottom: 12,
      color: "#ffffff",
    },
    confirmText: {
      fontSize: "14px",
      color: "rgba(255,255,255,0.7)",
      marginBottom: 24,
      lineHeight: 1.6,
    },
    successMessage: {
      background: "rgba(34,197,94,0.1)",
      border: "1px solid rgba(34,197,94,0.3)",
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    successText: {
      fontSize: "14px",
      color: "#86efac",
      margin: 0,
    },
    errorMessage: {
      background: "rgba(239,68,68,0.1)",
      border: "1px solid rgba(239,68,68,0.3)",
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    errorText: {
      fontSize: "14px",
      color: "#ff8a8a",
      margin: 0,
    },
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
    setError(null);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch("/v1/users/me", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Please sign in first"
            : "Failed to delete account"
        );
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during deletion"
      );
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (success) {
    return (
      <main style={styles.container as React.CSSProperties}>
        <div style={styles.header as React.CSSProperties}>
          <h1 style={styles.title as React.CSSProperties}>
            {t.deleteAccountTitle}
          </h1>
        </div>
        <div style={styles.content as React.CSSProperties}>
          <div style={styles.successMessage as React.CSSProperties}>
            <p style={styles.successText as React.CSSProperties}>
              {t.deleteAccountSuccess}
            </p>
          </div>
          <p style={styles.paragraph as React.CSSProperties}>
            {locale === "de"
              ? "Dein Konto wurde erfolgreich gelöscht. Du wirst gleich zur Startseite weitergeleitet."
              : "Your account has been successfully deleted. You will be redirected shortly."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.container as React.CSSProperties}>
      <div style={styles.header as React.CSSProperties}>
        <Link href="/" style={styles.backButton as React.CSSProperties}>
          ← {locale === "de" ? "Zurück" : "Back"}
        </Link>
        <h1 style={styles.title as React.CSSProperties}>
          {t.deleteAccountTitle}
        </h1>
        <p style={styles.subtitle as React.CSSProperties}>
          {t.deleteAccountDesc}
        </p>
      </div>

      <div style={styles.content as React.CSSProperties}>
        {error && (
          <div style={styles.errorMessage as React.CSSProperties}>
            <p style={styles.errorText as React.CSSProperties}>{error}</p>
          </div>
        )}

        {/* GDPR Data Export */}
        <div style={{ ...styles.card, borderColor: "rgba(168,85,247,0.3)" } as React.CSSProperties}>
          <div style={styles.section as React.CSSProperties}>
            <h2 style={styles.sectionTitle as React.CSSProperties}>
              {t.exportData}
            </h2>
            <p style={styles.paragraph as React.CSSProperties}>
              {t.exportDataDesc}
            </p>
            {exportRequested ? (
              <div style={styles.successMessage as React.CSSProperties}>
                <p style={styles.successText as React.CSSProperties}>
                  {t.exportDataRequestedDesc}
                </p>
              </div>
            ) : (
              <button
                onClick={async () => {
                  setIsExporting(true);
                  try {
                    const { env } = await import("@/lib/env");
                    await fetch(`${env.apiBaseUrl}/v1/gdpr/export`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                    });
                    setExportRequested(true);
                  } catch {
                    // silent
                  } finally {
                    setIsExporting(false);
                  }
                }}
                disabled={isExporting}
                style={{
                  ...styles.button,
                  ...styles.secondaryButton,
                  opacity: isExporting ? 0.6 : 1,
                } as React.CSSProperties}
              >
                {isExporting ? t.dataExportPreparing : t.exportData}
              </button>
            )}
          </div>
        </div>

        {/* Warning */}
        <div style={styles.card as React.CSSProperties}>
          <div style={styles.warning as React.CSSProperties}>
            <p style={styles.warningText as React.CSSProperties}>
              ⚠️ {t.deleteAccountWarning}
            </p>
          </div>

          <div style={styles.section as React.CSSProperties}>
            <h2 style={styles.sectionTitle as React.CSSProperties}>
              {locale === "de"
                ? "Was wird gelöscht?"
                : "What will be deleted?"}
            </h2>
            <p style={styles.paragraph as React.CSSProperties}>
              {locale === "de"
                ? "Die folgenden Daten werden dauerhaft von unseren Servern entfernt:"
                : "The following data will be permanently removed from our servers:"}
            </p>
            <ul style={styles.list as React.CSSProperties}>
              <li style={styles.listItem as React.CSSProperties}>
                {locale === "de"
                  ? "Dein Profilbild und alle hochgeladenen Fotos"
                  : "Your profile picture and all uploaded photos"}
              </li>
              <li style={styles.listItem as React.CSSProperties}>
                {locale === "de"
                  ? "Deine persönlichen Informationen (Name, Email, Bio, Geburtsdatum)"
                  : "Your personal information (name, email, bio, date of birth)"}
              </li>
              <li style={styles.listItem as React.CSSProperties}>
                {locale === "de"
                  ? "Alle Nachrichten und Chat-Verlauf"
                  : "All messages and chat history"}
              </li>
              <li style={styles.listItem as React.CSSProperties}>
                {locale === "de"
                  ? "Alle Swipes, Likes und Matches"
                  : "All swipes, likes and matches"}
              </li>
              <li style={styles.listItem as React.CSSProperties}>
                {locale === "de"
                  ? "Alle Aktivitätsdaten und Standorthistorie"
                  : "All activity data and location history"}
              </li>
              <li style={styles.listItem as React.CSSProperties}>
                {locale === "de"
                  ? "Dein Kreise-Profil und Einladungen"
                  : "Your circle profile and invitations"}
              </li>
            </ul>
          </div>

          <div style={styles.section as React.CSSProperties}>
            <h2 style={styles.sectionTitle as React.CSSProperties}>
              {locale === "de" ? "Was bleibt erhalten?" : "What is retained?"}
            </h2>
            <p style={styles.paragraph as React.CSSProperties}>
              {locale === "de"
                ? "Um gesetzliche Verpflichtungen zu erfüllen, behalten wir:"
                : "To meet legal obligations, we retain:"}
            </p>
            <ul style={styles.list as React.CSSProperties}>
              <li style={styles.listItem as React.CSSProperties}>
                {locale === "de"
                  ? "Anonymisierte Nutzungsdaten (zu statistischen Zwecken)"
                  : "Anonymized usage data (for statistical purposes)"}
              </li>
              <li style={styles.listItem as React.CSSProperties}>
                {locale === "de"
                  ? "Transaktionslogs (für Zahlungsprotokolle, max. 5 Jahre)"
                  : "Transaction logs (for payment records, max 5 years)"}
              </li>
              <li style={styles.listItem as React.CSSProperties}>
                {locale === "de"
                  ? "Sicherheitsprotokolle (für Audit-Zwecke)"
                  : "Security logs (for audit purposes)"}
              </li>
            </ul>
          </div>

          <div style={styles.section as React.CSSProperties}>
            <h2 style={styles.sectionTitle as React.CSSProperties}>
              {locale === "de"
                ? "Dein Recht auf Löschung"
                : "Your Right to Deletion"}
            </h2>
            <p style={styles.paragraph as React.CSSProperties}>
              {locale === "de"
                ? "Gemäß DSGVO Artikel 17 hast du das Recht, die Löschung deiner personenbezogenen Daten zu verlangen. Wir werden dein Konto und alle damit verbundenen Daten innerhalb von 30 Tagen löschen."
                : "Under GDPR Article 17, you have the right to request deletion of your personal data. We will delete your account and all associated data within 30 days."}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={styles.buttonGroup as React.CSSProperties}>
          <Link href="/" style={{ textDecoration: "none", flex: 1 }}>
            <button
              style={{
                ...styles.button,
                ...styles.secondaryButton,
                width: "100%",
              } as React.CSSProperties}
              onMouseOver={(e) => {
                (e.target as HTMLButtonElement).style.opacity = "0.8";
              }}
              onMouseOut={(e) => {
                (e.target as HTMLButtonElement).style.opacity = "1";
              }}
            >
              {t.deleteAccountCancel}
            </button>
          </Link>
          <button
            onClick={handleDeleteClick}
            style={{
              ...styles.button,
              ...styles.primaryButton,
            } as React.CSSProperties}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.opacity = "0.9";
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.opacity = "1";
            }}
          >
            {t.deleteAccountConfirm}
          </button>
        </div>

        {/* Legal info */}
        <p
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.4)",
            marginTop: "40px",
            textAlign: "center",
          }}
        >
          {locale === "de"
            ? "Du kannst diese Seite jederzeit verlassen. Bestätige die Löschung im nächsten Schritt."
            : "You can leave at any time. Confirm deletion in the next step."}
        </p>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div style={styles.confirmDialog as React.CSSProperties}>
          <div style={styles.confirmBox as React.CSSProperties}>
            <h2 style={styles.confirmTitle as React.CSSProperties}>
              {locale === "de"
                ? "Konto wirklich löschen?"
                : "Really delete your account?"}
            </h2>
            <p style={styles.confirmText as React.CSSProperties}>
              {locale === "de"
                ? "Dies kann nicht rückgängig gemacht werden. Alle deine Daten werden dauerhaft gelöscht."
                : "This cannot be undone. All your data will be permanently deleted."}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                style={{
                  ...styles.button,
                  ...styles.secondaryButton,
                } as React.CSSProperties}
                onMouseOver={(e) => {
                  if (!isDeleting)
                    (e.target as HTMLButtonElement).style.opacity = "0.8";
                }}
                onMouseOut={(e) => {
                  if (!isDeleting)
                    (e.target as HTMLButtonElement).style.opacity = "1";
                }}
              >
                {locale === "de" ? "Abbrechen" : "Cancel"}
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  opacity: isDeleting ? 0.6 : 1,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                } as React.CSSProperties}
              >
                {isDeleting ? t.deleteAccountProcessing : t.deleteAccountConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
