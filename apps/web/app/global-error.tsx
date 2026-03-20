"use client";

/**
 * Global error boundary — catches errors in root layout itself.
 * Cannot use LanguageProvider here since it's above the provider tree.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#090812",
          color: "#f7f1ff",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420, padding: 32 }}>
          <div
            style={{
              width: 80,
              height: 80,
              margin: "0 auto 24px",
              borderRadius: "50%",
              background: "rgba(255,77,106,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff4d6a" strokeWidth="1.4">
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="13" />
              <circle cx="12" cy="16" r="0.5" fill="#ff4d6a" />
            </svg>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: "rgba(247,241,255,0.6)", marginBottom: 32, lineHeight: 1.6 }}>
            An unexpected error occurred. Please try again.
          </p>

          {error.digest && (
            <p style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
              Ref: {error.digest}
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={reset}
              style={{
                padding: "12px 24px",
                borderRadius: 18,
                border: "none",
                background: "linear-gradient(135deg, rgba(191,132,255,0.96), rgba(168,85,247,0.95))",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 18px 36px rgba(112,33,193,0.4)",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: "12px 24px",
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                display: "block",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
