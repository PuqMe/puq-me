/**
 * HTTP-only cookie helpers for auth tokens.
 *
 * Strategy:
 * - access_token: HttpOnly, Secure, SameSite=Lax, Domain=.puq.me, Path=/, Max-Age=15min
 *   Set on the parent domain so both puq.me (Pages frontend) and api.puq.me (this Worker)
 *   receive the cookie. The browser sends it along with `credentials: "include"` requests.
 * - refresh_token: HttpOnly, Secure, SameSite=Lax, Domain=.puq.me, Path=/, Max-Age=30d
 *   Same scope as access_token so /v1/auth/refresh and /v1/auth/logout can read it.
 *
 * Naming: prefix with `__Host-` would be ideal for security, but `__Host-` requires
 * Domain to be unset and Path=/, which conflicts with cross-subdomain sharing between
 * puq.me and api.puq.me. We use plain names plus strict attributes instead.
 *
 * Backward compatibility: tokens are still returned in the JSON response body so that
 * existing native/Bearer clients keep working. The web client should ignore the body
 * tokens and rely on the cookies set here.
 */

import type { Context } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import type { AppContext } from "../env.js";

const ACCESS_COOKIE = "puqme_at";
const REFRESH_COOKIE = "puqme_rt";

const ACCESS_MAX_AGE_S = 15 * 60; // 15 minutes — matches JWT_EXPIRES_IN
const REFRESH_MAX_AGE_S = 30 * 24 * 60 * 60; // 30 days — matches JWT_REFRESH_EXPIRES_IN

function cookieDomain(c: Context<AppContext>): string | undefined {
  // Derive cookie domain from the request host so the worker also works on
  // puqme-api.workers.dev or any other Cloudflare preview domain (where we
  // simply don't set Domain — cookie is then host-only).
  const host = c.req.header("Host") ?? "";
  if (host === "puq.me" || host === "api.puq.me" || host.endsWith(".puq.me")) {
    return ".puq.me";
  }
  return undefined; // host-only cookie for previews/localhost
}

function isSecure(c: Context<AppContext>): boolean {
  // Always Secure on real puq.me; on http://localhost we allow non-Secure so
  // the browser actually stores the cookie during local dev.
  const host = c.req.header("Host") ?? "";
  return !host.startsWith("localhost") && !host.startsWith("127.0.0.1");
}

export type AuthTokenPair = {
  accessToken: string;
  refreshToken: string;
};

export function setAuthCookies(c: Context<AppContext>, tokens: AuthTokenPair): void {
  const domain = cookieDomain(c);
  const secure = isSecure(c);

  setCookie(c, ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "Lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE_S,
    ...(domain ? { domain } : {})
  });

  setCookie(c, REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "Lax",
    path: "/",
    maxAge: REFRESH_MAX_AGE_S,
    ...(domain ? { domain } : {})
  });
}

export function clearAuthCookies(c: Context<AppContext>): void {
  const domain = cookieDomain(c);

  // deleteCookie sets Max-Age=0 with the same attributes used at set-time
  deleteCookie(c, ACCESS_COOKIE, { path: "/", ...(domain ? { domain } : {}) });
  deleteCookie(c, REFRESH_COOKIE, { path: "/", ...(domain ? { domain } : {}) });
}

export function readAccessCookie(c: Context<AppContext>): string | undefined {
  return getCookie(c, ACCESS_COOKIE);
}

export function readRefreshCookie(c: Context<AppContext>): string | undefined {
  return getCookie(c, REFRESH_COOKIE);
}

export const COOKIE_NAMES = {
  access: ACCESS_COOKIE,
  refresh: REFRESH_COOKIE
} as const;
