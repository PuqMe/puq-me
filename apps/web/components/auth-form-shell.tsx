"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BRAND_NAME } from "@puqme/config";
import { Button, Card } from "@puqme/ui";
import { LogoMark } from "@puqme/ui";
import { GoogleSignInButton } from "./auth/google-sign-in-button";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { env } from "@/lib/env";
import { navigateToPostAuthPath } from "@/lib/post-auth";
import { useLanguage } from "@/lib/i18n";

type AuthFormShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  submitLabel: string;
  pendingLabel: string;
  altLabel: string;
  altHref: string;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  onSubmit?: () => Promise<void> | void;
  children: ReactNode;
};

export function AuthFormShell({
  eyebrow,
  title,
  description,
  submitLabel,
  pendingLabel = "Please wait...",
  altLabel,
  altHref,
  errorMessage,
  isSubmitting = false,
  onSubmit,
  children
}: AuthFormShellProps) {
  const { signInWithGoogle } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [googleErrorMessage, setGoogleErrorMessage] = useState<string | null>(null);
  const isHandlingGoogleRef = useRef(false);

  // Check for a Google OAuth token in sessionStorage (redirect fallback)
  useEffect(() => {
    const storedToken = sessionStorage.getItem("google_oauth_id_token");
    if (storedToken) {
      sessionStorage.removeItem("google_oauth_id_token");
      handleGoogleSuccess(storedToken);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleSuccess = async (credential: string) => {
    if (isHandlingGoogleRef.current) {
      return;
    }

    try {
      isHandlingGoogleRef.current = true;
      setGoogleErrorMessage(null);
      await signInWithGoogle(credential);
      await navigateToPostAuthPath(router);
    } catch (error) {
      setGoogleErrorMessage(error instanceof Error ? error.message : t.googleLoginFailed);
    } finally {
      window.setTimeout(() => {
        isHandlingGoogleRef.current = false;
      }, 300);
    }
  };

  return (
    <Card className="mesh-panel w-full rounded-[1.75rem] p-4 text-white">
      <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d7b8ff]">
        <LogoMark className="h-4 w-4 shrink-0" size={16} />
        {BRAND_NAME}
      </div>
      <h1 className="text-[1.6rem] font-semibold leading-none text-white">{title}</h1>

      <form
        className="mt-4 grid gap-2.5"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit?.();
        }}
      >
        {children}
        {errorMessage ? <p className="text-sm text-[#ffb4c7]">{errorMessage}</p> : null}
        <Button className="rounded-[1.1rem] bg-[#17201B] py-3 text-sm disabled:opacity-60" disabled={isSubmitting} type="submit">
          {isSubmitting ? pendingLabel : submitLabel}
        </Button>
      </form>

      {env.googleClientId ? (
        <>
          <GoogleSignInButton onSuccess={handleGoogleSuccess} text="continue_with" />
          {googleErrorMessage ? <p className="mt-2 text-sm text-[#ffb4c7]">{googleErrorMessage}</p> : null}
        </>
      ) : null}

      <Link className="mt-3 inline-flex text-sm font-medium text-white/60 hover:text-white" href={altHref}>
        {altLabel} →
      </Link>
    </Card>
  );
}
