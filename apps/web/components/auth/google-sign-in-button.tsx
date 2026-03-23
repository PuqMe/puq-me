"use client";

import { useCallback, useEffect, useRef } from "react";
import { env } from "@/lib/env";

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  width?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

/**
 * Google Sign-In button using OAuth popup.
 * Loads the GSI library in the background so that if FedCM/One-Tap
 * is available the credential callback fires automatically.
 * The visible button always opens a manual OAuth popup for reliability.
 */
export function GoogleSignInButton({ onSuccess, text = "signin_with", width }: GoogleSignInButtonProps) {
  const onSuccessRef = useRef(onSuccess);
  const initializedRef = useRef(false);
  onSuccessRef.current = onSuccess;

  // Manual OAuth popup — the primary sign-in path
  const openOAuthPopup = useCallback(() => {
    const clientId = env.googleClientId;
    if (!clientId) return;

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const nonce = crypto.randomUUID();

    // Store nonce for verification
    sessionStorage.setItem("google_oauth_nonce", nonce);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "id_token",
      scope: "openid email profile",
      nonce: nonce,
      prompt: "select_account",
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    // Open popup centered on screen
    const w = 500;
    const h = 600;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    const popup = window.open(
      authUrl,
      "google-oauth-popup",
      `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no`
    );

    // Listen for the callback message from the popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "google-oauth-callback" && event.data?.id_token) {
        window.removeEventListener("message", handleMessage);
        onSuccessRef.current(event.data.id_token);
      }
    };
    window.addEventListener("message", handleMessage);

    // Cleanup if popup is closed without completing
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
      }
    }, 500);
  }, []);

  useEffect(() => {
    // Still load GSI library in the background for One-Tap / FedCM auto-sign-in
    const loadScript = () => {
      if (document.getElementById("google-gsi-client")) return;
      const script = document.createElement("script");
      script.id = "google-gsi-client";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (!window.google || initializedRef.current) return;
      initializedRef.current = true;

      window.google.accounts.id.initialize({
        client_id: env.googleClientId,
        callback: (response: any) => {
          onSuccessRef.current(response.credential);
        },
        ux_mode: "popup",
        use_fedcm_for_prompt: false,
      });

      // No renderButton — we only use our own custom button
    };

    loadScript();

    const checkInterval = setInterval(() => {
      if (window.google) {
        clearInterval(checkInterval);
        initializeGoogleSignIn();
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={openOAuthPopup}
        className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white w-full max-w-[250px]"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Mit Google anmelden
      </button>
    </div>
  );
}
