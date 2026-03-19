import { type ReactNode, useRef, useState } from "react";
import Link from "next/link";
import { BRAND_NAME } from "@puqme/config";
import { Button, Card } from "@puqme/ui";
import { LogoMark } from "@puqme/ui";
import { GoogleSignInButton } from "./auth/google-sign-in-button";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { env } from "@/lib/env";
import { navigateToPostAuthPath } from "@/lib/post-auth";

type AuthFormShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  submitLabel: string;
  pendingLabel?: string;
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
  pendingLabel = "Bitte warten...",
  altLabel,
  altHref,
  errorMessage,
  isSubmitting = false,
  onSubmit,
  children
}: AuthFormShellProps) {
  const { signInWithGoogle } = useAuth();
  const router = useRouter();
  const [googleErrorMessage, setGoogleErrorMessage] = useState<string | null>(null);
  const isHandlingGoogleRef = useRef(false);

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
      setGoogleErrorMessage(error instanceof Error ? error.message : "Google Login konnte nicht abgeschlossen werden.");
    } finally {
      window.setTimeout(() => {
        isHandlingGoogleRef.current = false;
      }, 300);
    }
  };

  return (
    <Card className="mesh-panel w-full rounded-[2rem] p-5 text-white md:p-6">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d7b8ff]">
        <LogoMark className="h-5 w-5 shrink-0" size={20} />
        {BRAND_NAME}
      </div>
      <div className="soft-pill inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">{eyebrow}</div>
      <h1 className="mt-4 text-[2rem] font-semibold leading-none text-white">{title}</h1>
      <p className="mt-3 max-w-sm text-sm leading-6 text-white/72">{description}</p>

      <form
        className="mt-6 grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit?.();
        }}
      >
        {children}
        {errorMessage ? <p className="text-sm text-[#ffb4c7]">{errorMessage}</p> : null}
        <Button className="mt-1 rounded-[1.2rem] bg-[#17201B] py-3.5 text-sm disabled:opacity-60" disabled={isSubmitting} type="submit">
          {isSubmitting ? pendingLabel : submitLabel}
        </Button>
      </form>

      {env.googleClientId ? (
        <>
          <GoogleSignInButton onSuccess={handleGoogleSuccess} text="continue_with" />
          {googleErrorMessage ? <p className="mt-3 text-sm text-[#ffb4c7]">{googleErrorMessage}</p> : null}
        </>
      ) : (
        <p className="text-sm text-white/55">Google Login wird sichtbar, sobald eine `NEXT_PUBLIC_GOOGLE_CLIENT_ID` gesetzt ist.</p>
      )}

      <Link className="mt-4 inline-flex text-sm font-medium text-white/72" href={altHref}>
        {altLabel}
      </Link>
    </Card>
  );
}
