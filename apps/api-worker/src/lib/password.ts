/**
 * Password hashing using Web Crypto API (PBKDF2).
 * Argon2 is not available in Workers runtime, so we use PBKDF2 with
 * high iterations as the best available alternative.
 *
 * Format: $pbkdf2-sha256$iterations$salt$hash
 */

const ITERATIONS = 100_000; // Reduced for Cloudflare Workers free-tier CPU limits (600k exceeds NotSupportedError threshold)
const SALT_LENGTH = 32;
const HASH_LENGTH = 32;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: ITERATIONS
    },
    key,
    HASH_LENGTH * 8
  );

  const saltB64 = bufferToBase64(salt);
  const hashB64 = bufferToBase64(new Uint8Array(hash));

  return `$pbkdf2-sha256$${ITERATIONS}$${saltB64}$${hashB64}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // Support argon2 hashes from the old backend (they start with $argon2)
  if (stored.startsWith("$argon2")) {
    // Cannot verify argon2 in Workers runtime.
    // Users with argon2 hashes will need to reset their password.
    return false;
  }

  const parts = stored.split("$").filter(Boolean);
  if (parts.length !== 4 || parts[0] !== "pbkdf2-sha256") {
    return false;
  }

  const iterations = parseInt(parts[1], 10);
  const salt = base64ToBuffer(parts[2]);
  const expectedHash = base64ToBuffer(parts[3]);

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const actualHash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations
    },
    key,
    expectedHash.length * 8
  );

  return timingSafeEqual(new Uint8Array(actualHash), expectedHash);
}

function bufferToBase64(buffer: Uint8Array): string {
  let binary = "";
  for (const byte of buffer) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBuffer(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}
