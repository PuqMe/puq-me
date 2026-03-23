/**
 * Google ID Token verification for Cloudflare Workers.
 * Uses Google's JWKS public keys to verify RS256 JWTs directly.
 * Caches keys in KV to avoid repeated fetches.
 */

const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const KV_CACHE_KEY = "google_jwks";
const KV_CACHE_TTL_SECONDS = 3600; // 1 hour

interface GoogleJwk {
  kty: string;
  alg: string;
  use: string;
  kid: string;
  n: string;
  e: string;
}

interface GoogleJwks {
  keys: GoogleJwk[];
}

export interface GoogleTokenPayload {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean | string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  iat: number;
  exp: number;
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

/**
 * Fetch Google's JWKS public keys, with KV caching.
 */
async function getGooglePublicKeys(kv?: KVNamespace): Promise<GoogleJwks> {
  // Try KV cache first
  if (kv) {
    try {
      const cached = await kv.get(KV_CACHE_KEY, "json");
      if (cached) return cached as GoogleJwks;
    } catch {
      // Cache miss, continue
    }
  }

  // Fetch from Google
  const response = await fetch(GOOGLE_JWKS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Google JWKS: ${response.status}`);
  }

  const jwks = (await response.json()) as GoogleJwks;

  // Cache in KV
  if (kv) {
    try {
      await kv.put(KV_CACHE_KEY, JSON.stringify(jwks), {
        expirationTtl: KV_CACHE_TTL_SECONDS,
      });
    } catch {
      // Non-critical, continue without caching
    }
  }

  return jwks;
}

/**
 * Import a Google JWK as a CryptoKey for RS256 verification.
 */
async function importGoogleKey(jwk: GoogleJwk): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    {
      kty: jwk.kty,
      n: jwk.n,
      e: jwk.e,
      alg: "RS256",
      use: "sig",
    },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
}

/**
 * Verify a Google ID token and return its payload.
 *
 * @param idToken - The raw ID token string from Google Sign-In
 * @param clientId - Your Google OAuth client ID
 * @param kv - Optional KV namespace for caching JWKS keys
 * @returns Verified token payload
 * @throws Error if token is invalid, expired, or doesn't match client ID
 */
export async function verifyGoogleIdToken(
  idToken: string,
  clientId: string | string[],
  kv?: KVNamespace
): Promise<GoogleTokenPayload> {
  // Split JWT
  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new Error("invalid_token_format");
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  // Parse header to get kid
  const header = JSON.parse(
    new TextDecoder().decode(base64UrlDecode(headerB64))
  ) as { alg: string; kid: string; typ?: string };

  if (header.alg !== "RS256") {
    throw new Error("unsupported_algorithm: " + header.alg);
  }

  // Get Google's public keys
  const jwks = await getGooglePublicKeys(kv);
  const matchingKey = jwks.keys.find((k) => k.kid === header.kid);

  if (!matchingKey) {
    // Key rotation might have happened — refetch without cache
    if (kv) {
      try {
        await kv.delete(KV_CACHE_KEY);
      } catch {
        // ignore
      }
    }
    const freshJwks = await getGooglePublicKeys(); // no KV = force fresh fetch
    const freshKey = freshJwks.keys.find((k) => k.kid === header.kid);
    if (!freshKey) {
      throw new Error("unknown_signing_key");
    }
    // Cache the fresh keys
    if (kv) {
      try {
        await kv.put(KV_CACHE_KEY, JSON.stringify(freshJwks), {
          expirationTtl: KV_CACHE_TTL_SECONDS,
        });
      } catch {
        // ignore
      }
    }
    const clientIds = Array.isArray(clientId) ? clientId : [clientId];
    return verifyWithKey(freshKey, headerB64, payloadB64, signatureB64, clientIds);
  }

  const clientIds = Array.isArray(clientId) ? clientId : [clientId];
  return verifyWithKey(matchingKey, headerB64, payloadB64, signatureB64, clientIds);
}

async function verifyWithKey(
  jwk: GoogleJwk,
  headerB64: string,
  payloadB64: string,
  signatureB64: string,
  clientIds: string[]
): Promise<GoogleTokenPayload> {
  // Import the public key
  const cryptoKey = await importGoogleKey(jwk);

  // Verify signature
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64UrlDecode(signatureB64);

  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    signature,
    data
  );

  if (!valid) {
    throw new Error("invalid_signature");
  }

  // Parse payload
  const payload = JSON.parse(
    new TextDecoder().decode(base64UrlDecode(payloadB64))
  ) as GoogleTokenPayload;

  // Verify issuer
  if (!GOOGLE_ISSUERS.includes(payload.iss)) {
    throw new Error("invalid_issuer: " + payload.iss);
  }

  // Verify audience (must match one of our client IDs)
  if (!clientIds.includes(payload.aud)) {
    throw new Error("invalid_audience");
  }

  // Verify expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    throw new Error("token_expired");
  }

  // Verify issued-at (not in the future, with 5 min clock skew tolerance)
  if (payload.iat > now + 300) {
    throw new Error("token_issued_in_future");
  }

  return payload;
}
