/**
 * PuQ.me — API Worker
 * Edge: api.puq.me
 *
 * Aufgaben:
 *   - Auth (JWT)
 *   - Presigned-PUT-URL für IDrive E2 generieren  (POST /v1/media/upload-intent)
 *   - Upload-Complete-Hook                         (POST /v1/media/complete)
 *   - DSGVO-Art.-17-Löschung                       (DELETE /v1/me/data)
 *
 * Pflicht-Secrets (wrangler secret put …):
 *   IDRIVE_E2_ACCESS_KEY
 *   IDRIVE_E2_SECRET_KEY
 *   JWT_SECRET
 *
 * Pflicht-Vars (wrangler.toml):
 *   IDRIVE_E2_HOST              z.B. s3.us-west-1.idrivee2.com
 *   IDRIVE_E2_REGION            z.B. us-west-1
 *   IDRIVE_E2_BUCKET_AVATARS    z.B. puq-avatars
 *   IDRIVE_E2_BUCKET_IMAGES     z.B. puq-images
 *   IDRIVE_E2_BUCKET_CHAT       z.B. puq-chat-media
 *   IDRIVE_E2_BUCKET_IDDOCS     z.B. puq-id-docs
 *   PUBLIC_CDN_HOST             z.B. cdn.puq.me
 */

import { AwsClient } from 'aws4fetch';

export interface Env {
  // secrets
  IDRIVE_E2_ACCESS_KEY: string;
  IDRIVE_E2_SECRET_KEY: string;
  JWT_SECRET: string;

  // vars
  IDRIVE_E2_HOST: string;
  IDRIVE_E2_REGION: string;
  IDRIVE_E2_BUCKET_AVATARS: string;
  IDRIVE_E2_BUCKET_IMAGES: string;
  IDRIVE_E2_BUCKET_CHAT: string;
  IDRIVE_E2_BUCKET_IDDOCS: string;
  PUBLIC_CDN_HOST: string;

  // optional bindings
  PENDING_UPLOADS?: KVNamespace;
}

type Purpose = 'avatar' | 'image' | 'chat-media' | 'id-doc';

interface UploadIntentBody {
  purpose: Purpose;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

interface CompleteBody {
  uploadId: string;
  sha256?: string;
}

interface User {
  id: string;
  exp: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Konstanten / Policies

const ACCEPT: Record<Purpose, { mimes: string[]; maxBytes: number; ttl: number }> = {
  avatar:       { mimes: ['image/jpeg', 'image/png', 'image/webp'],            maxBytes: 5  * 1024 * 1024, ttl: 600 },
  image:        { mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'], maxBytes: 10 * 1024 * 1024, ttl: 600 },
  'chat-media': { mimes: ['image/jpeg', 'image/webp', 'audio/webm', 'audio/mp4', 'audio/mpeg'], maxBytes: 25 * 1024 * 1024, ttl: 600 },
  'id-doc':     { mimes: ['image/jpeg', 'image/png', 'application/pdf'],       maxBytes: 8  * 1024 * 1024, ttl: 60  },
};

function bucketFor(env: Env, p: Purpose): string {
  switch (p) {
    case 'avatar':     return env.IDRIVE_E2_BUCKET_AVATARS;
    case 'image':      return env.IDRIVE_E2_BUCKET_IMAGES;
    case 'chat-media': return env.IDRIVE_E2_BUCKET_CHAT;
    case 'id-doc':     return env.IDRIVE_E2_BUCKET_IDDOCS;
  }
}

function prefixFor(p: Purpose): string {
  switch (p) {
    case 'avatar':     return 'avatars';
    case 'image':      return 'images';
    case 'chat-media': return 'chat';
    case 'id-doc':     return 'id-docs';
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Hilfsfunktionen

function extFor(contentType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'audio/webm': 'webm',
    'audio/mp4': 'm4a',
    'audio/mpeg': 'mp3',
    'application/pdf': 'pdf',
  };
  return map[contentType] ?? 'bin';
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...(init.headers ?? {}),
    },
  });
}

function withCors(res: Response, origin: string): Response {
  const headers = new Headers(res.headers);
  headers.set('access-control-allow-origin', origin);
  headers.set('access-control-allow-credentials', 'true');
  headers.set('vary', 'Origin');
  return new Response(res.body, { status: res.status, headers });
}

const ALLOWED_ORIGINS = new Set([
  'https://puq.me',
  'https://www.puq.me',
  'http://localhost:3000',
]);

function pickOrigin(req: Request): string {
  const o = req.headers.get('origin') ?? '';
  return ALLOWED_ORIGINS.has(o) ? o : 'https://puq.me';
}

// ──────────────────────────────────────────────────────────────────────────────
// Minimaler JWT-Verifier (HS256). In Produktion durch jose/auth-Service ersetzen.

async function verifyJwt(req: Request, env: Env): Promise<User> {
  const auth = req.headers.get('authorization') ?? '';
  const cookie = req.headers.get('cookie') ?? '';
  const fromAuth = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const fromCookie = /(?:^|;\s*)puqme_session=([^;]+)/.exec(cookie)?.[1] ?? null;
  const token = fromAuth ?? fromCookie;
  if (!token) throw httpError(401, 'auth.missing');

  const [h, p, s] = token.split('.');
  if (!h || !p || !s) throw httpError(401, 'auth.malformed');

  const data = new TextEncoder().encode(`${h}.${p}`);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const sig = base64UrlToBytes(s);
  const ok = await crypto.subtle.verify('HMAC', key, sig, data);
  if (!ok) throw httpError(401, 'auth.bad-signature');

  const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(p)));
  if (typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) {
    throw httpError(401, 'auth.expired');
  }
  if (typeof payload.sub !== 'string') throw httpError(401, 'auth.no-subject');

  return { id: payload.sub, exp: payload.exp };
}

function base64UrlToBytes(s: string): Uint8Array {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

class HttpError extends Error {
  constructor(public status: number, public code: string) {
    super(code);
  }
}
function httpError(status: number, code: string): HttpError {
  return new HttpError(status, code);
}

// ──────────────────────────────────────────────────────────────────────────────
// Routen

async function handleUploadIntent(req: Request, env: Env): Promise<Response> {
  const user = await verifyJwt(req, env);
  const body = (await req.json()) as UploadIntentBody;

  const policy = ACCEPT[body.purpose];
  if (!policy) throw httpError(400, 'upload.bad-purpose');
  if (!policy.mimes.includes(body.contentType)) throw httpError(415, 'upload.bad-mime');
  if (!Number.isFinite(body.sizeBytes) || body.sizeBytes <= 0 || body.sizeBytes > policy.maxBytes) {
    throw httpError(413, 'upload.size');
  }

  const uploadId = crypto.randomUUID();
  const key = `${prefixFor(body.purpose)}/${user.id}/${todayUtc()}/${uploadId}.${extFor(body.contentType)}`;
  const bucket = bucketFor(env, body.purpose);
  const target = `https://${bucket}.${env.IDRIVE_E2_HOST}/${key}`;

  const aws = new AwsClient({
    accessKeyId: env.IDRIVE_E2_ACCESS_KEY,
    secretAccessKey: env.IDRIVE_E2_SECRET_KEY,
    service: 's3',
    region: env.IDRIVE_E2_REGION,
  });

  // Header werden Teil der Signatur — Client MUSS sie identisch senden.
  const headers: Record<string, string> = {
    'content-type': body.contentType,
    'x-amz-meta-upload-id': uploadId,
    'x-amz-meta-user-id': user.id,
    'x-amz-meta-purpose': body.purpose,
  };
  if (body.purpose === 'id-doc') {
    headers['x-amz-server-side-encryption'] = 'AES256';
  }

  const signed = await aws.sign(
    new Request(target, { method: 'PUT', headers }),
    { aws: { signQuery: true, allHeaders: true } },
  );

  // Pending-Marker (best-effort, KV optional)
  if (env.PENDING_UPLOADS) {
    await env.PENDING_UPLOADS.put(
      `pending:${uploadId}`,
      JSON.stringify({ userId: user.id, key, bucket, purpose: body.purpose, ts: Date.now() }),
      { expirationTtl: 24 * 3600 },
    );
  }

  return jsonResponse({
    uploadId,
    purpose: body.purpose,
    bucket,
    objectKey: key,
    uploadUrl: signed.url,
    publicUrl: body.purpose === 'id-doc' ? null : `https://${env.PUBLIC_CDN_HOST}/${key}`,
    expiresInSeconds: policy.ttl,
    maxUploadSizeBytes: policy.maxBytes,
    requiredHeaders: headers,
    security: {
      signedUrl: true,
      moderationRequired: body.purpose !== 'id-doc',
      publicDeliveryRequiresApproval: body.purpose !== 'id-doc',
    },
  });
}

async function handleComplete(req: Request, env: Env): Promise<Response> {
  const user = await verifyJwt(req, env);
  const { uploadId } = (await req.json()) as CompleteBody;
  if (!uploadId) throw httpError(400, 'complete.missing-id');

  const pendingRaw = env.PENDING_UPLOADS ? await env.PENDING_UPLOADS.get(`pending:${uploadId}`) : null;
  if (!pendingRaw) throw httpError(404, 'complete.unknown-upload');
  const pending = JSON.parse(pendingRaw);
  if (pending.userId !== user.id) throw httpError(403, 'complete.not-owner');

  const aws = new AwsClient({
    accessKeyId: env.IDRIVE_E2_ACCESS_KEY,
    secretAccessKey: env.IDRIVE_E2_SECRET_KEY,
    service: 's3',
    region: env.IDRIVE_E2_REGION,
  });

  const head = await aws.fetch(
    `https://${pending.bucket}.${env.IDRIVE_E2_HOST}/${pending.key}`,
    { method: 'HEAD' },
  );
  if (!head.ok) throw httpError(404, 'complete.not-uploaded');

  if (env.PENDING_UPLOADS) await env.PENDING_UPLOADS.delete(`pending:${uploadId}`);

  return jsonResponse({
    status: 'ready',
    objectKey: pending.key,
    publicUrl: pending.purpose === 'id-doc' ? null : `https://${env.PUBLIC_CDN_HOST}/${pending.key}`,
    sizeBytes: Number(head.headers.get('content-length') ?? 0),
    contentType: head.headers.get('content-type'),
  });
}

async function handleErase(req: Request, env: Env): Promise<Response> {
  // DSGVO Art. 17 — listet alle Objekte des Users in jedem relevanten Bucket
  // und löscht sie hart. Vereinfachte Variante; prod: Pagination.
  const user = await verifyJwt(req, env);
  const buckets = [
    env.IDRIVE_E2_BUCKET_AVATARS,
    env.IDRIVE_E2_BUCKET_IMAGES,
    env.IDRIVE_E2_BUCKET_CHAT,
    env.IDRIVE_E2_BUCKET_IDDOCS,
  ];
  const aws = new AwsClient({
    accessKeyId: env.IDRIVE_E2_ACCESS_KEY,
    secretAccessKey: env.IDRIVE_E2_SECRET_KEY,
    service: 's3',
    region: env.IDRIVE_E2_REGION,
  });

  let deleted = 0;
  for (const bucket of buckets) {
    // ListObjectsV2 mit Prefix (UserId)
    const list = await aws.fetch(
      `https://${bucket}.${env.IDRIVE_E2_HOST}/?list-type=2&prefix=${encodeURIComponent('')}`,
    );
    if (!list.ok) continue;
    const xml = await list.text();
    const keys = [...xml.matchAll(/<Key>([^<]+)<\/Key>/g)]
      .map((m) => m[1])
      .filter((k) => k.includes(`/${user.id}/`));

    for (const key of keys) {
      const del = await aws.fetch(`https://${bucket}.${env.IDRIVE_E2_HOST}/${key}`, { method: 'DELETE' });
      if (del.ok) deleted++;
    }
  }

  return jsonResponse({ status: 'erased', objectsRemoved: deleted });
}

// ──────────────────────────────────────────────────────────────────────────────
// Worker-Entry

export default {
  async fetch(req: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const origin = pickOrigin(req);

    if (req.method === 'OPTIONS') {
      return withCors(
        new Response(null, {
          status: 204,
          headers: {
            'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
            'access-control-allow-headers': 'authorization,content-type',
            'access-control-max-age': '86400',
          },
        }),
        origin,
      );
    }

    const url = new URL(req.url);
    try {
      let res: Response;
      if (url.pathname === '/v1/media/upload-intent' && req.method === 'POST') {
        res = await handleUploadIntent(req, env);
      } else if (url.pathname === '/v1/media/complete' && req.method === 'POST') {
        res = await handleComplete(req, env);
      } else if (url.pathname === '/v1/me/data' && req.method === 'DELETE') {
        res = await handleErase(req, env);
      } else if (url.pathname === '/healthz') {
        res = jsonResponse({ ok: true, ts: Date.now() });
      } else {
        res = jsonResponse({ error: 'not-found' }, { status: 404 });
      }
      return withCors(res, origin);
    } catch (err) {
      if (err instanceof HttpError) {
        return withCors(jsonResponse({ error: err.code }, { status: err.status }), origin);
      }
      console.error(err);
      return withCors(jsonResponse({ error: 'internal' }, { status: 500 }), origin);
    }
  },
};
