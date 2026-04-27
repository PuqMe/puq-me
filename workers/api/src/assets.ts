/**
 * PuQ.me — Assets / CDN Worker
 * Edge: cdn.puq.me
 *
 * Liest öffentliche Medien aus IDrive E2 und cached sie aggressiv am Cloudflare-Edge.
 * Strikte Pfad-Whitelist; ID-Dokumente sind hier NICHT erreichbar (eigener Bucket
 * + eigene IAM-Policy + eigener Worker-Pfad falls überhaupt benötigt).
 */

import { AwsClient } from 'aws4fetch';

export interface Env {
  IDRIVE_E2_ACCESS_KEY: string;       // read-only sub-key
  IDRIVE_E2_SECRET_KEY: string;
  IDRIVE_E2_HOST: string;             // s3.us-west-1.idrivee2.com
  IDRIVE_E2_REGION: string;           // us-west-1
  IDRIVE_E2_BUCKET_AVATARS: string;
  IDRIVE_E2_BUCKET_IMAGES: string;
  IDRIVE_E2_BUCKET_CHAT: string;
}

const ROUTE: Record<string, keyof Env> = {
  avatars: 'IDRIVE_E2_BUCKET_AVATARS',
  images:  'IDRIVE_E2_BUCKET_IMAGES',
  chat:    'IDRIVE_E2_BUCKET_CHAT',
};

const PUBLIC_PREFIXES = Object.keys(ROUTE);

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return new Response('method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
    }

    const url = new URL(req.url);
    const pathname = url.pathname.replace(/^\/+/, '');
    const [prefix, ...rest] = pathname.split('/');
    if (!prefix || !PUBLIC_PREFIXES.includes(prefix) || rest.length === 0) {
      return new Response('forbidden', { status: 403 });
    }

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), req);
    const hit = await cache.match(cacheKey);
    if (hit) {
      const headers = new Headers(hit.headers);
      headers.set('x-cache', 'HIT');
      return new Response(hit.body, { status: hit.status, headers });
    }

    const bucket = env[ROUTE[prefix]] as string;
    const objectKey = pathname; // wir spiegeln den Pfad 1:1 ins Bucket
    const upstreamUrl = `https://${bucket}.${env.IDRIVE_E2_HOST}/${objectKey}`;

    const aws = new AwsClient({
      accessKeyId: env.IDRIVE_E2_ACCESS_KEY,
      secretAccessKey: env.IDRIVE_E2_SECRET_KEY,
      service: 's3',
      region: env.IDRIVE_E2_REGION,
    });

    const upstream = await aws.fetch(upstreamUrl, { method: req.method });
    if (!upstream.ok) {
      return new Response('not found', { status: upstream.status });
    }

    const headers = new Headers();
    // nur das Nötige durchreichen, sonst leakt man S3-Header
    const passthrough = ['content-type', 'content-length', 'last-modified', 'etag'];
    for (const h of passthrough) {
      const v = upstream.headers.get(h);
      if (v) headers.set(h, v);
    }
    headers.set('cache-control', 'public, max-age=31536000, immutable, stale-while-revalidate=86400');
    headers.set('x-content-type-options', 'nosniff');
    headers.set('cross-origin-resource-policy', 'same-site');
    headers.set('x-cache', 'MISS');

    const res = new Response(upstream.body, { status: 200, headers });
    // nur cachen, wenn Original cachebar
    if (req.method === 'GET') ctx.waitUntil(cache.put(cacheKey, res.clone()));
    return res;
  },
};
