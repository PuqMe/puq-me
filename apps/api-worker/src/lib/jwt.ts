/**
 * JWT implementation for Cloudflare Workers using Web Crypto API.
 * No external dependencies needed.
 */

type JwtPayload = Record<string, unknown> & {
  sub?: string;
  email?: string;
  role?: string;
  session?: string;
  iat?: number;
  exp?: number;
};

const encoder = new TextEncoder();

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function base64UrlEncode(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(input: string): Uint8Array {
  const padded = input + "=".repeat((4 - (input.length % 4)) % 4);
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function parseExpiry(expiresIn: string): number {
  const amount = parseInt(expiresIn, 10);
  if (expiresIn.endsWith("d")) return amount * 24 * 60 * 60;
  if (expiresIn.endsWith("h")) return amount * 60 * 60;
  if (expiresIn.endsWith("m")) return amount * 60;
  if (expiresIn.endsWith("s")) return amount;
  return 30 * 24 * 60 * 60; // default 30 days
}

export async function signJwt(
  payload: JwtPayload,
  secret: string,
  options?: { expiresIn?: string }
): Promise<string> {
  const key = await importKey(secret);
  const now = Math.floor(Date.now() / 1000);

  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + (options?.expiresIn ? parseExpiry(options.expiresIn) : 900)
  };

  const header = base64UrlEncode(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = base64UrlEncode(encoder.encode(JSON.stringify(fullPayload)));
  const data = `${header}.${body}`;

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return `${data}.${base64UrlEncode(signature)}`;
}

export async function verifyJwt<T extends JwtPayload = JwtPayload>(
  token: string,
  secret: string
): Promise<T> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("invalid_token_format");
  }

  const [header, body, sig] = parts;
  const key = await importKey(secret);
  const data = `${header}.${body}`;
  const signature = base64UrlDecode(sig);

  const valid = await crypto.subtle.verify("HMAC", key, signature, encoder.encode(data));
  if (!valid) {
    throw new Error("invalid_token_signature");
  }

  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(body))) as T;

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("token_expired");
  }

  return payload;
}
