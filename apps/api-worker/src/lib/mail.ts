/**
 * Transactional mail via MailChannels (Cloudflare Workers).
 *
 * MailChannels API: https://api.mailchannels.net/tx/v1/send
 *
 * DNS prerequisites on puq.me:
 *   1. SPF:    TXT @                       "v=spf1 include:relay.mailchannels.net ~all"
 *   2. Domain Lockdown:
 *              TXT _mailchannels            "v=mc1 cfid=<your-workers-zone>"
 *   3. DKIM (recommended, MailChannels-managed):
 *              TXT mailchannels._domainkey  "<value from MailChannels dashboard>"
 *
 * Env:
 *   - MAIL_FROM       e.g. "noreply@puq.me"
 *   - MAIL_FROM_NAME  e.g. "PuQ.me"
 *   - MAIL_REPLY_TO   e.g. "support@puq.me" (optional)
 *   - MAILCHANNELS_API_KEY (optional)
 *
 * Failures are swallowed and logged; auth flows return success either way
 * to prevent email-enumeration. Sentry captures the failure for ops visibility.
 */

import { captureException } from "./sentry";

export type MailEnv = {
  MAIL_FROM?: string;
  MAIL_FROM_NAME?: string;
  MAIL_REPLY_TO?: string;
  MAILCHANNELS_API_KEY?: string;
  APP_ORIGIN?: string;
  SENTRY_DSN?: string;
  SENTRY_ENVIRONMENT?: string;
  SENTRY_RELEASE?: string;
};

export type SendMailInput = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  tags?: Record<string, string>;
};

export type MailResult =
  | { ok: true; messageId?: string }
  | { ok: false; status: number; error: string };

const MC_ENDPOINT = "https://api.mailchannels.net/tx/v1/send";

export async function sendMail(env: MailEnv, input: SendMailInput, ctx?: ExecutionContext): Promise<MailResult> {
  const fromEmail = env.MAIL_FROM ?? "noreply@puq.me";
  const fromName = env.MAIL_FROM_NAME ?? "PuQ.me";

  const body: Record<string, unknown> = {
    personalizations: [
      { to: [{ email: input.to, name: input.toName ?? input.to }] },
    ],
    from: { email: fromEmail, name: fromName },
    subject: input.subject,
    content: [
      { type: "text/plain", value: input.text },
      { type: "text/html", value: input.html },
    ],
  };

  if (input.replyTo ?? env.MAIL_REPLY_TO) {
    body.reply_to = { email: input.replyTo ?? env.MAIL_REPLY_TO };
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json",
  };
  if (env.MAILCHANNELS_API_KEY) {
    headers["X-Api-Key"] = env.MAILCHANNELS_API_KEY;
  }

  try {
    const res = await fetch(MC_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const messageId = res.headers.get("x-message-id") ?? undefined;
      return { ok: true, messageId };
    }

    const errText = await res.text().catch(() => "");
    const result: MailResult = { ok: false, status: res.status, error: errText.slice(0, 500) };

    const err = new Error(`MailChannels send failed: ${res.status} — ${errText.slice(0, 200)}`);
    if (env.SENTRY_DSN) {
      captureException(err, env.SENTRY_DSN, {
        environment: env.SENTRY_ENVIRONMENT,
        release: env.SENTRY_RELEASE,
        method: "POST",
        path: "/mail/send",
      }, ctx ? (p) => ctx.waitUntil(p) : undefined);
    }

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    if (env.SENTRY_DSN) {
      captureException(err instanceof Error ? err : new Error(message), env.SENTRY_DSN, {
        environment: env.SENTRY_ENVIRONMENT,
        release: env.SENTRY_RELEASE,
        method: "POST",
        path: "/mail/send",
      }, ctx ? (p) => ctx.waitUntil(p) : undefined);
    }
    return { ok: false, status: 0, error: message };
  }
}

/* Templates ---------------------------------------------------------- */

function detectLang(emailHint?: string): "de" | "en" {
  if (!emailHint) return "de";
  const tld = emailHint.split("@")[1]?.split(".").pop()?.toLowerCase();
  if (tld && ["com", "co", "uk", "us", "io", "net", "org"].includes(tld)) return "en";
  return "de";
}

const COLORS = {
  bg: "#0e0a1a",
  card: "#1a1330",
  accent: "#a855f7",
  text: "#ffffff",
  muted: "#a8a3c0",
  button: "#a855f7",
  buttonText: "#ffffff",
};

function shellHtml(opts: { lang: "de" | "en"; preheader: string; heading: string; body: string; ctaText: string; ctaUrl: string; footer: string }): string {
  return `<!doctype html>
<html lang="${opts.lang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${opts.heading}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${COLORS.text};">
<div style="display:none;max-height:0;overflow:hidden;color:${COLORS.bg}">${opts.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLORS.card};border-radius:24px;padding:40px 32px;">
      <tr><td align="center" style="padding-bottom:24px;">
        <div style="display:inline-block;font-size:24px;font-weight:700;letter-spacing:-0.02em;background:linear-gradient(135deg,#a855f7,#ec4899);-webkit-background-clip:text;background-clip:text;color:transparent;">PuQ.me</div>
      </td></tr>
      <tr><td>
        <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;line-height:1.25;color:${COLORS.text};">${opts.heading}</h1>
        <div style="font-size:15px;line-height:1.55;color:${COLORS.muted};">${opts.body}</div>
        <div style="margin:28px 0 8px;text-align:center;">
          <a href="${opts.ctaUrl}" style="display:inline-block;background:${COLORS.button};color:${COLORS.buttonText};text-decoration:none;font-weight:600;font-size:15px;padding:14px 28px;border-radius:14px;">${opts.ctaText}</a>
        </div>
        <p style="font-size:12px;line-height:1.5;color:${COLORS.muted};margin:24px 0 0;word-break:break-all;">${opts.lang === "de" ? "Funktioniert der Button nicht? Kopiere diesen Link in deinen Browser:" : "Button not working? Copy this link into your browser:"}<br><span style="color:${COLORS.accent}">${opts.ctaUrl}</span></p>
      </td></tr>
      <tr><td style="padding-top:32px;border-top:1px solid rgba(255,255,255,0.06);margin-top:32px;">
        <p style="font-size:12px;line-height:1.5;color:${COLORS.muted};margin:16px 0 0;">${opts.footer}</p>
      </td></tr>
    </table>
    <p style="font-size:11px;color:${COLORS.muted};margin:16px 0 0;">PuQ.me · ${opts.lang === "de" ? "Begegnungen, die zählen" : "Encounters that matter"}</p>
  </td></tr>
</table>
</body></html>`;
}

export function buildVerificationEmail(opts: { token: string; appOrigin: string; toEmail: string }) {
  const lang = detectLang(opts.toEmail);
  const url = `${opts.appOrigin.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(opts.token)}`;
  if (lang === "de") {
    return {
      subject: "Bestätige deine E-Mail-Adresse für PuQ.me",
      html: shellHtml({ lang, preheader: "Klicke den Link, um deine PuQ.me-Anmeldung abzuschließen.", heading: "Willkommen bei PuQ.me", body: "<p>Schön, dass du dabei bist. Bestätige deine E-Mail-Adresse mit einem Klick auf den Button. Der Link ist 24 Stunden gültig.</p>", ctaText: "E-Mail bestätigen", ctaUrl: url, footer: "Wenn du dich nicht bei PuQ.me angemeldet hast, kannst du diese E-Mail einfach ignorieren — es wird nichts unternommen." }),
      text: `Willkommen bei PuQ.me\n\nBestätige deine E-Mail-Adresse mit diesem Link (gültig für 24 Stunden):\n\n${url}\n\nWenn du dich nicht angemeldet hast, ignoriere diese E-Mail.\n\n— PuQ.me`,
    };
  }
  return {
    subject: "Confirm your email for PuQ.me",
    html: shellHtml({ lang, preheader: "Click the link to finish your PuQ.me sign-up.", heading: "Welcome to PuQ.me", body: "<p>Glad to have you. Confirm your email address with one click. The link is valid for 24 hours.</p>", ctaText: "Confirm email", ctaUrl: url, footer: "If you didn't sign up for PuQ.me, you can safely ignore this email — nothing will happen." }),
    text: `Welcome to PuQ.me\n\nConfirm your email with this link (valid for 24 hours):\n\n${url}\n\nIf you didn't sign up, you can ignore this email.\n\n— PuQ.me`,
  };
}

export function buildPasswordResetEmail(opts: { token: string; appOrigin: string; toEmail: string }) {
  const lang = detectLang(opts.toEmail);
  const url = `${opts.appOrigin.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(opts.token)}`;
  if (lang === "de") {
    return {
      subject: "Passwort zurücksetzen — PuQ.me",
      html: shellHtml({ lang, preheader: "Setze dein Passwort über diesen sicheren Link zurück.", heading: "Passwort zurücksetzen", body: "<p>Du hast eine Passwort-Zurücksetzung angefordert. Klicke den Button, um ein neues Passwort zu wählen. Der Link ist 1 Stunde gültig und kann nur einmal verwendet werden.</p>", ctaText: "Neues Passwort setzen", ctaUrl: url, footer: "Wenn du keine Zurücksetzung angefordert hast, ignoriere diese E-Mail. Dein Konto bleibt unverändert. Aus Sicherheitsgründen werden bei jeder Zurücksetzung alle aktiven Sitzungen abgemeldet." }),
      text: `Passwort zurücksetzen — PuQ.me\n\nNeues Passwort setzen (Link 1 Stunde gültig, einmalig nutzbar):\n\n${url}\n\nWenn du keine Zurücksetzung angefordert hast, ignoriere diese E-Mail.\n\n— PuQ.me`,
    };
  }
  return {
    subject: "Reset your PuQ.me password",
    html: shellHtml({ lang, preheader: "Use this secure link to reset your password.", heading: "Reset your password", body: "<p>You requested a password reset. Click the button to choose a new password. The link is valid for 1 hour and can be used only once.</p>", ctaText: "Set new password", ctaUrl: url, footer: "If you didn't request a reset, ignore this email — your account stays unchanged. For security, every reset signs out all active sessions." }),
    text: `Reset your PuQ.me password\n\nSet new password (link valid 1 hour, single use):\n\n${url}\n\nIf you didn't request a reset, ignore this email.\n\n— PuQ.me`,
  };
}

export async function sendVerificationEmail(env: MailEnv, opts: { to: string; token: string }, ctx?: ExecutionContext): Promise<MailResult> {
  const tpl = buildVerificationEmail({ token: opts.token, appOrigin: env.APP_ORIGIN ?? "https://puq.me", toEmail: opts.to });
  return sendMail(env, { to: opts.to, ...tpl, tags: { kind: "verify-email" } }, ctx);
}

export async function sendPasswordResetEmail(env: MailEnv, opts: { to: string; token: string }, ctx?: ExecutionContext): Promise<MailResult> {
  const tpl = buildPasswordResetEmail({ token: opts.token, appOrigin: env.APP_ORIGIN ?? "https://puq.me", toEmail: opts.to });
  return sendMail(env, { to: opts.to, ...tpl, tags: { kind: "password-reset" } }, ctx);
}
