# PuQ.me — Workers (api · cdn)

Zwei Cloudflare Workers, die zusammen die Anwendungslogik tragen:

| Worker | Route | Aufgabe |
|---|---|---|
| `puq-me-api` | `api.puq.me/*` | Auth, Presigned-PUT-URLs, Upload-Complete, DSGVO-Erase |
| `puq-me-assets` | `cdn.puq.me/*` | Read-Through-Cache vor IDrive E2, edge-cached |

## Setup

```bash
pnpm install
# einmalig:
wrangler login
wrangler secret put IDRIVE_E2_ACCESS_KEY      --config wrangler.toml
wrangler secret put IDRIVE_E2_SECRET_KEY      --config wrangler.toml
wrangler secret put JWT_SECRET                --config wrangler.toml
wrangler secret put IDRIVE_E2_ACCESS_KEY      --config wrangler.assets.toml
wrangler secret put IDRIVE_E2_SECRET_KEY      --config wrangler.assets.toml

# (Optional) KV für Pending-Uploads
wrangler kv namespace create PENDING_UPLOADS
# id in wrangler.toml eintragen

# Deploy
pnpm run deploy
pnpm run deploy:assets
```

## Wichtige Sicherheits-Regeln

- Der `puq-me-assets`-Worker bekommt einen **read-only** Sub-Account-Key.
- Der `puq-me-api`-Worker darf PUT/HEAD/DELETE — aber nicht aus dem Browser
  aufrufbar; CORS ist auf `puq.me` und `www.puq.me` beschränkt.
- ID-Dokumente sind nur über `api.puq.me` mit Kurz-TTL abrufbar — niemals via `cdn.puq.me`.
- Bucket-Lifecycle-Regeln (z. B. 24 h für `puq-id-docs`) werden direkt in der
  IDrive-E2-Konsole bzw. via `s3:PutBucketLifecycleConfiguration` gesetzt;
  die JSONs liegen in `infrastructure/idrive-e2/lifecycle.json`.

## Lokale Entwicklung

```bash
pnpm run dev          # api worker auf http://127.0.0.1:8787
pnpm run dev:assets   # assets worker auf http://127.0.0.1:8788
```

Vorgeschalteter Frontend-Aufruf:

```ts
const intent = await fetch('https://api.puq.me/v1/media/upload-intent', {
  method: 'POST',
  credentials: 'include',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    purpose: 'avatar',
    fileName: 'me.jpg',
    contentType: 'image/jpeg',
    sizeBytes: file.size,
  }),
}).then(r => r.json());

await fetch(intent.uploadUrl, {
  method: 'PUT',
  headers: intent.requiredHeaders,
  body: file,
});

await fetch('https://api.puq.me/v1/media/complete', {
  method: 'POST',
  credentials: 'include',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ uploadId: intent.uploadId }),
});
```
