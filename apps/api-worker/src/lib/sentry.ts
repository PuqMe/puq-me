/**
 * Minimal Sentry envelope client for Cloudflare Workers.
 *
 * Uses Sentry's public envelope endpoint over HTTPS (no SDK dep, ~70 LoC).
 * Captures errors with full stack, user context, request metadata, and tags.
 * Skips sending entirely when SENTRY_DSN is unset (dev / preview deploys).
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

function buildEnvelope(
  parsed: SentryDsn,
  event: Record<string, unknown>
): { url: string; body: string; auth: string } {
  const eventId = crypto.randomUUID().replace(/-/g, "");
  event.event_id = eventId;
  event.timestamp = Date.now() / 1000;

  const url = `${parsed.protocol}://${parsed.host}/api/${parsed.projectId}/envelope/`;
  const auth = [
    "Sentry sentry_version=7",
    `sentry_key=${parsed.publicKey}`,
    "sentry_client=puqme-cf-worker/1.0"
  ].join(", ");

  const header = JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString() });
  const itemHeader = JSON.stringify({ type: "event" });
  const body = `${header}\n${itemHeader}\n${JSON.stringify(event)}`;

  return { url, body, auth };
}

export type SentryContext = {
  userId?: string;
  userEmail?: string;
  requestId?: string;
  method?: string;
  path?: string;
  release?: string;
  environment?: string;
};

export function captureException(
  err: unknown,
  dsn: string | undefined,
  ctx: SentryContext = {},
  waitUntil?: (p: Promise<unknown>) => void
): string | null {
  if (!dsn) return null;
  const parsed = parseDsn(dsn);
  if (!parsed) return null;

  const error = err instanceof Error ? err : new Error(String(err));
  const event: Record<string, unknown> = {
    platform: "javascript",
    level: "error",
    environment: ctx.environment ?? "production",
    release: ctx.release,
    server_name: "puqme-api-worker",
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
    request: ctx.method
      ? {
          method: ctx.method,
          url: ctx.path
        }
      : undefined,
    tags: {
      worker: "puqme-api"
    },
    user: ctx.userId ? { id: ctx.userId, email: ctx.userEmail } : undefined,
    extra: ctx.requestId ? { request_id: ctx.requestId } : undefined
  };

  const { url, body, auth } = buildEnvelope(parsed, event);
  const promise = fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-sentry-envelope",
      "X-Sentry-Auth": auth
    },
    body
  }).catch(() => undefined);

  if (waitUntil) waitUntil(promise);

  return event.event_id as string;
}
