/**
 * CDN Worker for cdn.puq.me
 *
 * Routes requests to IDrive e2 (S3-compatible) storage and applies
 * caching headers, access control, and basic security filtering.
 *
 * Deployed via: npx wrangler deploy -c wrangler-cdn.jsonc --env production
 */

const ALLOWED_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const CACHE_TTL_BY_PREFIX = [
  { prefix: '/avatars/', ttl: 86400 },       // 1 day
  { prefix: '/images/', ttl: 2592000 },       // 30 days
  { prefix: '/chat/', ttl: 604800 },          // 7 days
  { prefix: '/media/', ttl: 2592000 },        // 30 days
];

const DEFAULT_CACHE_TTL = 86400; // 1 day fallback

function getCacheTtl(pathname) {
  for (const rule of CACHE_TTL_BY_PREFIX) {
    if (pathname.startsWith(rule.prefix)) {
      return rule.ttl;
    }
  }
  return DEFAULT_CACHE_TTL;
}

function handleCors(request) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigins = ['https://puq.me', 'https://staging.puq.me', 'https://admin.puq.me'];

  if (!allowedOrigins.includes(origin)) {
    return null;
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Range, If-None-Match, If-Modified-Since',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Type, ETag',
    'Access-Control-Max-Age': '3600',
  };
}

export default {
  async fetch(request, env, ctx) {
    const method = request.method;

    // Block non-allowed methods
    if (!ALLOWED_METHODS.has(method)) {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      const corsHeaders = handleCors(request);
      if (!corsHeaders) {
        return new Response('Forbidden', { status: 403 });
      }
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // Block traversal attempts
    if (pathname.includes('..') || pathname.includes('//')) {
      return new Response('Bad Request', { status: 400 });
    }

    // Block requests for hidden files
    if (pathname.includes('/.')) {
      return new Response('Not Found', { status: 404 });
    }

    // Build the origin URL to IDrive e2
    // The bucket name is resolved via the CNAME record (cdn.puq.me → bucket.storage.idrivee2-7.com)
    // so we forward to the e2 endpoint directly.
    const e2Url = new URL(pathname, env.E2_ORIGIN);
    e2Url.search = url.search;

    // Check Cloudflare cache first
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) {
      // Cache HIT — return with CORS headers
      const corsHeaders = handleCors(request);
      if (corsHeaders) {
        response = new Response(response.body, response);
        for (const [key, value] of Object.entries(corsHeaders)) {
          response.headers.set(key, value);
        }
      }
      return response;
    }

    // Cache MISS — fetch from e2 origin
    const originRequest = new Request(e2Url.toString(), {
      method: request.method,
      headers: {
        'Accept': request.headers.get('Accept') || '*/*',
        'Accept-Encoding': request.headers.get('Accept-Encoding') || '',
        'If-None-Match': request.headers.get('If-None-Match') || '',
        'If-Modified-Since': request.headers.get('If-Modified-Since') || '',
        'Range': request.headers.get('Range') || '',
      },
    });

    let originResponse;
    try {
      originResponse = await fetch(originRequest);
    } catch (err) {
      return new Response('Origin Unavailable', { status: 502 });
    }

    // If the origin returns 404 or error, pass through without caching
    if (!originResponse.ok && originResponse.status !== 304) {
      return new Response(originResponse.body, {
        status: originResponse.status,
        statusText: originResponse.statusText,
      });
    }

    const cacheTtl = getCacheTtl(pathname);

    // Build the response with caching and security headers
    const responseHeaders = new Headers(originResponse.headers);
    responseHeaders.set('Cache-Control', `public, max-age=${cacheTtl}, s-maxage=${cacheTtl}`);
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('X-Frame-Options', 'DENY');
    responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    responseHeaders.delete('x-amz-request-id');
    responseHeaders.delete('x-amz-id-2');
    responseHeaders.delete('Server');

    const corsHeaders = handleCors(request);
    if (corsHeaders) {
      for (const [key, value] of Object.entries(corsHeaders)) {
        responseHeaders.set(key, value);
      }
    }

    response = new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: responseHeaders,
    });

    // Store in CF cache (non-blocking)
    ctx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  },
};
