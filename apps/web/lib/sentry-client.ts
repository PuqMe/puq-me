/**
 * Browser-side Sentry envelope client.
 *
 * Zero-dependency (no @sentry/* SDK) — keeps OpenNext + Cloudflare Pages
 * build clean. Posts to Sentry's HTTPS envelope endpoint directly.
 *
 * Activated only when NEXT_PUBLIC_SENTRY_DSN is set at build time.
 */

type SentryDsn = {
  protocol: string;
  publicKey: string;
  host: string;
  projectId: string;
};

function parseDsn(dsn: string): SentryDsn | null {
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/^\//, "");
    if (!url.username || !projectId) return null;
    return {
      protocol: url.protocol.replace(":", ""),
      publicKey: url.username,
      host: url.host,
      projectId
    };
  } catch {
    return null;
  }
}

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "production";
const RELEASE = process.env.NEXT_PUBLIC_SENTRY_RELEASE;

let parsed: SentryDsn | null = null;
let initialized = false;

function send(event: Record<string, unknown>): void {
  if (!parsed) return;
  const eventId = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).replace(/-/g, "");
  event.event_id = eventId;
  event.timestamp = Date.now() / 1000;

  const url = `${parsed.protocol}://${parsed.host}/api/${parsed.projectId}/envelope/`;
  const auth = [
    "Sentry sentry_version=7",
    `sentry_key=${parsed.publicKey}`,
    "sentry_client=puqme-web/1.0"
  ].join(", ");

  const header = JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString() });
  const itemHeader = JSON.stringify({ type: "event" });
  const body = `${header}\n${itemHeader}\n${JSON.stringify(event)}`;

  // sendBeacon survives page unload; fall back to fetch if not available.
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    try {
      const blob = new Blob([body], { type: "application/x-sentry-envelope" });
      navigator.sendBeacon(`${url}?sentry_key=${parsed.publicKey}&sentry_version=7`, blob);
      return;
    } catch {
      // fall through to fetch
    }
  }

  fetch(url, {
    method: "POST",
    keepalive: true,
    headers: {
      "Content-Type": "application/x-sentry-envelope",
      "X-Sentry-Auth": auth
    },
    body
  }).catch(() => undefined);
}

function buildEvent(
  level: "error" | "warning",
  err: unknown,
  extra?: Record<string, unknown>
): Record<string, unknown> {
  const error = err instanceof Error ? err : new Error(String(err));
  return {
    platform: "javascript",
    level,
    environment: ENVIRONMENT,
    release: RELEASE,
    exception: {
      values: [
        {
          type: error.name || "Error",
          value: error.message,
          stacktrace: error.stack
            ? {
                frames: error.stack
                  .split("\n")
                  .slice(1)
                  .map((line) => ({ filename: line.trim() }))
                  .reverse()
              }
            : undefined
        }
      ]
    },
    request: typeof window !== "undefined"
      ? {
          url: window.location.href,
          headers: { "User-Agent": navigator.userAgent }
        }
      : undefined,
    tags: { app: "puqme-web" },
    extra
  };
}

export function captureException(err: unknown, extra?: Record<string, unknown>): void {
  if (!parsed) return;
  send(buildEvent("error", err, extra));
}

export function initSentry(): void {
  if (initialized || typeof window === "undefined" || !DSN) return;
  parsed = parseDsn(DSN);
  if (!parsed) return;
  initialized = true;

  window.addEventListener("error", (event) => {
    if (event.error) captureException(event.error);
    else captureException(new Error(event.message), { filename: event.filename, lineno: event.lineno });
  });

  window.addEventListener("unhandledrejection", (event) => {
    captureException(event.reason ?? new Error("Unhandled promise rejection"));
  });
}
