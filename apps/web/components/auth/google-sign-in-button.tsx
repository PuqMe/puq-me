"use client";

import { useEffect, useRef } from "react";
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

export function GoogleSignInButton({ onSuccess, text = "signin_with", width }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const onSuccessRef = useRef(onSuccess);
  const initializedRef = useRef(false);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
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
      });

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: text,
          shape: "rectangular",
          logo_alignment: "left",
          width: width,
        });
      }
    };

    loadScript();

    const checkInterval = setInterval(() => {
      if (window.google) {
        clearInterval(checkInterval);
        initializeGoogleSignIn();
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, [text, width]);

  return <div ref={buttonRef} className="w-full h-[40px] flex justify-center" />;
}
