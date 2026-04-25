"use client";

import { useEffect } from "react";

const SESSION_KEY = "puqme.session.user";

/**
 * /swipe is the PWA start_url.
 * - If a session exists in localStorage → forward to /radar
 * - If not → forward to /login?next=/swipe
 *
 * We use client-side detection because the session is stored in localStorage
 * (not in a server-readable cookie), so middleware can't decide on the Edge.
 * Client-side replace() is fine here because:
 *   1. Bots/crawlers don't authenticate, so they'll get the login redirect → consistent.
 *   2. Real users see, at most, a 100 ms blank screen before redirect.
 */
export default function SwipeRedirectPage() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const has = !!window.localStorage.getItem(SESSION_KEY);
      const target = has ? "/radar" : "/login?next=/swipe";
      window.location.replace(target);
    } catch {
      window.location.replace("/login?next=/swipe");
    }
  }, []);

  return (
    <main
      style={{
        display: "flex",
        minHeight: "60vh",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-live="polite"
      aria-label="Loading"
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "2px solid #a855f7",
          borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
