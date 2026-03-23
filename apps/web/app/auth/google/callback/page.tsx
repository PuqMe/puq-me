"use client";

import { useEffect, useState } from "react";

/**
 * Google OAuth callback page.
 * Google redirects here with the id_token in the URL fragment (#id_token=...).
 * We extract it and send it back to the opener window via postMessage.
 */
export default function GoogleCallbackPage() {
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    try {
      // Google returns the id_token in the URL fragment (hash)
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const idToken = params.get("id_token");

      if (!idToken) {
        // Check for error in query params
        const queryParams = new URLSearchParams(window.location.search);
        const error = queryParams.get("error");
        if (error) {
          setStatus("error");
          setErrorMessage(`Google Login fehlgeschlagen: ${error}`);
          return;
        }
        setStatus("error");
        setErrorMessage("Kein Token von Google erhalten.");
        return;
      }

      // Send the token back to the opener (parent) window
      if (window.opener) {
        window.opener.postMessage(
          { type: "google-oauth-callback", id_token: idToken },
          window.location.origin
        );
        setStatus("success");
        // Close popup after a brief delay
        setTimeout(() => window.close(), 1000);
      } else {
        // Opened directly (not as popup) — try to handle via session storage
        sessionStorage.setItem("google_oauth_id_token", idToken);
        setStatus("success");
        // Redirect to login page which can pick up the token
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("Ein Fehler ist aufgetreten.");
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0e0b]">
      <div className="text-center text-white">
        {status === "processing" && (
          <div>
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p>Anmeldung wird verarbeitet...</p>
          </div>
        )}
        {status === "success" && (
          <div>
            <p className="text-lg font-medium text-green-400">Erfolgreich angemeldet!</p>
            <p className="mt-1 text-sm text-white/60">Fenster wird geschlossen...</p>
          </div>
        )}
        {status === "error" && (
          <div>
            <p className="text-lg font-medium text-red-400">Fehler</p>
            <p className="mt-1 text-sm text-white/60">{errorMessage}</p>
            <button
              onClick={() => window.close()}
              className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
            >
              Fenster schließen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
