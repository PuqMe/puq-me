# PuQ.me — Free-Tier Cloud Architecture

> Stand: 2026-04-27 · Zielsetzung: maximale Free-Tier Nutzung, minimale laufende Kosten,
> klare Trennung von Storage (IDrive E2) · Code (GitHub) · Edge/CDN/Compute (Cloudflare).

Dieses Dokument beantwortet die sechs Architektur-Fragen des Briefings und liefert
ein konkretes, umsetzbares Setup für die PuQ.me Web App (Begegnungs-/Dating-App,
DSGVO-konform, Berlin, 10 Sprachen, Profilfotos, Voice-Messages, Verifikations-Dokumente,
Chat, AI-Match-Vorschläge, Gamification).

---

## 0. Kurzfassung in 6 Zeilen

1. Frontend = Cloudflare Pages (statisch / Jamstack), gebaut aus GitHub.
2. Dynamische Logik = Cloudflare Workers an `api.puq.me` und `cdn.puq.me`.
3. Persistenz roher Dateien = IDrive E2 (S3-kompatibel), private Buckets.
4. Browser-Uploads laufen über Presigned PUT-URLs direkt zu IDrive E2 — nie über den Worker.
5. Browser-Downloads laufen über `cdn.puq.me` → Cloudflare Edge-Cache → IDrive E2 (Cache-Miss).
6. Sekundärspeicher / Hot-Cache nach Bedarf in Cloudflare KV oder R2 (beides Free-Tier-fähig).

---

## 1. Architekturübersicht

PuQ.me ist eine moderne Web App (Jamstack + Serverless Edge). Die UI ist eine
Single-Page-/PWA-App, die statisch gebuilt und an Cloudflares globalem CDN ausgeliefert
wird. Alles, was Logik braucht (Auth, Presigned URLs, Moderation, Match, Webhooks),
läuft in zustandslosen Cloudflare Workers. Persistente Binärdaten (Fotos, Voice-Messages,
ID-Dokumente, Backups) liegen in IDrive E2; persistente Metadaten (User, Matches, Chats,
Reports) liegen in einer schmalen Datenbank — im Free-Tier startet das mit Cloudflare D1
oder einer externen Postgres-Free-Instanz und kann später ohne Architektur-Bruch wachsen.

Cloudflare ist dabei nicht nur CDN, sondern die "Anwendungs-Frontline": TLS, WAF, Rate-Limit,
Edge-Cache, Bot-Schutz und der Worker-Layer sind alle in der Free-Stufe enthalten und
machen einen klassischen Origin-Server überflüssig.

```
                   ┌──────────────────────────────┐
                   │      Endgerät (Browser /     │
                   │      installierte PWA)       │
                   └──────────────┬───────────────┘
                                  │ TLS 1.3
                                  ▼
                   ┌──────────────────────────────┐
                   │  Cloudflare Edge (300+ POPs) │
                   │  WAF · Bot · Rate-Limit ·    │
                   │  Cache · Brotli · HTTPS      │
                   └──┬────────────┬──────────────┘
        statische     │            │  dynamisch / signed
        Assets        │            │
                      ▼            ▼
        ┌─────────────────────┐  ┌──────────────────────────────┐
        │  Cloudflare Pages   │  │  Cloudflare Workers          │
        │  puq.me, www.puq.me │  │  api.puq.me  → REST/JSON     │
        │  HTML/JS/CSS/i18n   │  │  cdn.puq.me  → Media-Proxy   │
        │  (aus GitHub)       │  │  realtime    → WebSocket-Hub │
        └──────────┬──────────┘  └──────────┬───────────────────┘
                   │                         │  AWS4-signed
                   │                         ▼
                   │              ┌──────────────────────────────┐
                   │              │  IDrive E2 (S3-kompatibel)   │
                   │              │  puq-avatars · puq-images ·  │
                   │              │  puq-chat-media · puq-id ·   │
                   │              │  puq-backups                 │
                   │              └──────────────────────────────┘
                   │
                   │
        ┌──────────┴──────────┐
        │  GitHub (Free)      │
        │  Source · CI · PRs  │
        │  Pages-Auto-Deploy  │
        └─────────────────────┘
```

Drei Sub-Domains, drei Verantwortlichkeiten:

- `puq.me` und `www.puq.me` → Pages (rein statisch, gecacht, kein Egress-Kostenrisiko)
- `api.puq.me` → Worker `puq-me-api`, validiert JWTs, generiert presigned URLs,
  ruft IDrive E2 nur server-seitig auf, schreibt Metadaten
- `cdn.puq.me` → Worker `puq-me-assets`, der lesend und Cache-vorgelagert auf
  IDrive E2 zugreift; nur dieser Pfad serviert öffentliche Bilder

Diese Aufteilung ist wichtig fürs Free-Tier: 99 % der HTTP-Requests landen auf Pages
oder werden vom Edge-Cache beantwortet und kosten nichts. Nur Cache-Misses und
Schreibvorgänge gehen tatsächlich gegen IDrive E2.

---

## 2. Datenfluss

### 2.1 Lesen (Profil-Bild ansehen, Voice-Message abspielen)

```
1. Browser fordert https://cdn.puq.me/avatars/u/abc.jpg
2. Cloudflare-Edge prüft Cache
   ├─ Hit  → liefert Datei direkt aus dem nächsten POP, 0 Origin-Hits
   └─ Miss → Worker "puq-me-assets" wird ausgeführt:
            a) prüft Pfad-Whitelist  (avatars/, images/, chat/, public/)
            b) lehnt verbotene Buckets ab (id-docs, backups)
            c) signiert GET an IDrive E2 mit AWS4 (Server-Credentials)
            d) streamt Response zurück und setzt Cache-Control:
               public, max-age=31536000, immutable, stale-while-revalidate=86400
3. Cloudflare cached die Response für alle weiteren Requests weltweit
```

Unmittelbarer Effekt: ein Avatar, das einmal pro Region geladen wird, kostet IDrive E2
genau einmal Egress; alle weiteren Aufrufe weltweit kommen vom Edge.

### 2.2 Schreiben (User lädt Profilfoto / Voice / Verifikations-Doc hoch)

```
1. Browser:  POST https://api.puq.me/v1/media/profile-photos/upload-intent
             { fileName, contentType, sizeBytes }
2. Worker "puq-me-api":
   a) validiert JWT (Cookie + Header)
   b) prüft Größe / Mime / Quota (D1 oder KV)
   c) baut S3-Key:  avatars/<userId>/<yyyy-mm-dd>/<uuid>.jpg
   d) signiert AWS4 Presigned-PUT, Expiry = 600 s
   e) speichert Pending-Eintrag in D1 (status=pending)
   f) antwortet { uploadUrl, objectKey, publicUrl, expiresInSeconds }
3. Browser: PUT direkt auf IDrive E2 mit Content-Type-Header.
            (Worker sieht die Bytes nie → kein CPU-Limit, keine Egress-Kosten.)
4. Browser: POST https://api.puq.me/v1/media/profile-photos/complete
            { uploadId, sha256 }
5. Worker:  HEAD-Check gegen IDrive E2, Moderation-Hook (optional, später),
            setzt status=ready, gibt finale `cdn.puq.me`-URL zurück.
```

Durch den direkten PUT zwischen Browser und IDrive E2 trägt der Worker keinen Datenstrom
und bleibt weit unter dem 10-ms-CPU-Limit pro Request.

### 2.3 Voice-Message-Send im Chat

```
Browser  ──record──▶  PUT presigned   ──▶  IDrive E2 (puq-chat-media)
Browser  ──notify──▶  api.puq.me / chat:append
                        │
                        ├─ schreibt Chat-Eintrag (D1)
                        └─ pusht "new message" über WebSocket-Worker
Empfänger ──GET──▶ cdn.puq.me/chat/...  (Edge-Cache)
```

### 2.4 Identitäts-Dokumente (sensibel, kurzlebig)

```
Browser  ──PUT presigned (server-side encryption: SSE-C oder bucket-level)──▶
         IDrive E2 Bucket "puq-id-docs"  (NIEMALS über cdn.puq.me)
Worker   schreibt Verification-Job
Worker / Admin liest mit AWS4 GET, signiert mit Kurz-TTL (30 s)
Lifecycle-Regel im Bucket: löscht alle Objekte nach 24 h hart.
```

Die Mockup-Anforderung "Daten 24h dann weg" wird über die Bucket-Lifecycle-Policy
durchgesetzt, nicht über App-Code — DSGVO-Art. 17 wird so technisch erzwingbar.

---

## 3. Free-Tier-Optimierung

Free-Tier wird hier sportlich genommen: das Ziel ist nicht, im Free-Tier zu bleiben, koste
es was es wolle, sondern Free-Tier-Limits zu antizipieren und sie nicht zur Bremse werden
zu lassen.

### 3.1 Relevante Limits (April 2026)

| Service | Limit (Free) | Engpass für PuQ.me |
|---|---|---|
| Cloudflare Pages | unbegrenzte Requests, 500 builds/Monat, 20.000 Files/Deploy | Builds — Branch-Preview-Spam vermeiden |
| Cloudflare Workers | 100.000 Requests/Tag, 10 ms CPU/Request | Daily-Cap — durch Edge-Cache umgehen |
| Cloudflare KV | 100k Reads/Tag, 1k Writes/Tag, 1 GB | Writes — KV nicht für Hot-Counter nutzen |
| Cloudflare R2 | 10 GB, 1M Class-A Ops, 10M Class-B Ops/Monat, 0 Egress | Storage |
| Cloudflare D1 | 5 GB, 5M Reads/Tag, 100k Writes/Tag | Writes — Voice-Logs nicht 1:1 in D1 |
| IDrive E2 | abh. vom Plan, kein dauerhaftes 0 € Tier | Egress — durch CF-Cache abfedern |
| GitHub | unbegrenzte Public-Repos, 2.000 Actions-Min./Mo | CI-Minuten — Cache aggressiv nutzen |

### 3.2 Request-Reduktion

- **Bundle-Splitting & immutable assets**: alle JS/CSS-Bundles bekommen Content-Hash im
  Dateinamen und `Cache-Control: public, max-age=31536000, immutable`. Browser- und
  Edge-Cache machen wiederkehrende Besuche faktisch kostenlos.
- **HTML kurz cachen, Assets ewig**: HTML-Shell mit `s-maxage=300, stale-while-revalidate=86400`.
  Edge serviert während Re-Validation aus dem Cache.
- **API-Reads cachen**: GET-Endpoints mit `Cache-Control: private, max-age=30` plus
  ETag, sodass der Browser meistens 304s bekommt; nicht-personalisierte Listings
  (Sprachenliste, Boilerplate-Texte) zusätzlich edge-cachen.
- **Batch endpoints**: ein Aufruf `/v1/me/bootstrap` liefert User + Sichtbarkeit + Streak
  in einem Roundtrip statt drei.
- **Lazy load der Schwergewichte**: Voice-Player, Map-Komponenten, AI-Suggestion-View
  als async chunks.

### 3.3 Caching-Strategie (3 Schichten)

```
Schicht 1 — Browser (HTTP-Cache + Service Worker)
  immutable assets · IndexedDB für letzte Chats und Profilbilder

Schicht 2 — Cloudflare Edge
  öffentliche Medien (cdn.puq.me) cached sofort
  HTML cached mit Stale-While-Revalidate
  Worker setzt explizite cf.cacheTtl + cacheTtlByStatus

Schicht 3 — Worker-internes Memoizing
  Hot KV-Reads per Worker-Cache-API für 60 s gecacht,
  spart KV-Read-Quota und Latenz
```

Konkret im Worker-Code:

```ts
const cache = caches.default;
const cached = await cache.match(request);
if (cached) return cached;
const fresh = await signAndFetchFromIDrive(request);
ctx.waitUntil(cache.put(request, fresh.clone()));
return fresh;
```

### 3.4 Kostenminimierung — die "rote Liste"

- Kein Browser ruft je IDrive E2 direkt zum *Lesen*. Immer über `cdn.puq.me`.
- Avatare werden vor Upload client-seitig auf max. 1024 px und WebP/AVIF reduziert.
- ID-Dokumente werden nach 24 h per Bucket-Lifecycle hart gelöscht (Storage-Diät).
- Backups (Postgres-Dumps etc.) gehen in einen separaten `puq-backups`-Bucket mit
  IA/Glacier-äquivalenter Storage-Klasse, falls IDrive sie anbietet.
- Branch-Previews auf Pages werden per Wrangler-Setting auf "nur PRs" begrenzt.
- Wer "exotic" werden will: zweite Storage-Schicht in Cloudflare R2 als Read-Through-Cache
  für die heißesten 10 GB → IDrive E2 Egress sinkt zusätzlich.

---

## 4. Sicherheit

### 4.1 S3-Credentials

- IDrive-E2-Access-Keys leben **ausschließlich** in Cloudflare-Worker-Secrets
  (`wrangler secret put IDRIVE_E2_ACCESS_KEY` / `IDRIVE_E2_SECRET_KEY`).
- Niemals im Repo, niemals in Pages-Env, niemals im Frontend-Bundle.
- Pro Worker eigener Sub-Account / eigener Bucket-scope:
  - `puq-me-api` darf PUT/HEAD/DELETE auf alle Content-Buckets
  - `puq-me-assets` ist auf GET / HEAD beschränkt und darf den `puq-id-docs`-Bucket
    gar nicht sehen
- Rotation alle 90 Tage über GitHub-Actions-Secret-Sync (manueller Trigger).

### 4.2 Presigned Upload-URLs

- TTL 600 s für normale Uploads, 60 s für ID-Dokumente.
- Worker bindet im Signature folgende Constraints:
  - exakter `Content-Type`
  - exakter `Content-Length` (oder Bereich)
  - `x-amz-meta-upload-id`, `x-amz-meta-user-id` (zum Cross-Check beim Complete)
  - optional `x-amz-server-side-encryption: AES256` für ID-Dokumente
- Client darf nur `PUT` auf die signierte URL — kein `POST` mit Policy, kein `LIST`.
- Nach erfolgreichem Upload erfolgt ein `complete`-Aufruf, der per HEAD validiert
  und den DB-Status auf `ready` setzt; ohne `complete` bleibt das Objekt "pending"
  und wird nach 24 h durch Lifecycle gelöscht.

### 4.3 Schutz vor unbefugtem Zugriff

- Authentifizierung: Cookie-basiertes JWT (HttpOnly, Secure, SameSite=Lax),
  zusätzlich `Sec-Fetch-Site=same-origin`-Check im Worker.
- Autorisierung: jeder presigned URL ist an `userId` gebunden; ein User kann nicht
  auf den Pfad eines anderen schreiben, der Worker baut den Key serverseitig.
- WAF & Rate-Limit (Cloudflare Free): Regeln für `/upload-intent` (z. B. 30/min/IP),
  Bot-Score < 30 → Challenge.
- 2FA wie im Mockup (SMS / Authenticator / Hardware-Key) via WebAuthn-Endpunkt im API-Worker.
- DSGVO-Art.-17-Endpunkt: API-Worker iteriert die User-bezogenen S3-Keys via
  `ListObjectsV2` mit Prefix `*/<userId>/*` und löscht hart; danach Tombstone in D1.
- Reporting/Moderation: jeder neue Upload schreibt einen Job in eine Queue
  (KV oder D1), den ein zweiter Worker / Cron asynchron abarbeitet, bevor
  ein Asset über `cdn.puq.me` öffentlich freigeschaltet wird.
- Standortdaten werden, wie im Mockup versprochen, nur als grobes H3-Index gespeichert;
  niemals exakte Lat/Lon.

---

## 5. Beispiele

### 5.1 Cloudflare Worker — Upload (Presigned PUT)

Vollständige, lauffähige Implementation siehe
[`workers/api/src/index.ts`](../workers/api/src/index.ts).
Kerngedanke in Kürze:

```ts
import { AwsClient } from 'aws4fetch';

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/v1/media/upload-intent' && req.method === 'POST') {
      const user = await verifyJwt(req, env);
      const { fileName, contentType, sizeBytes } = await req.json();
      assertAllowed(contentType, sizeBytes);

      const key = `avatars/${user.id}/${todayUtc()}/${crypto.randomUUID()}.${ext(contentType)}`;
      const aws = new AwsClient({
        accessKeyId: env.IDRIVE_E2_ACCESS_KEY,
        secretAccessKey: env.IDRIVE_E2_SECRET_KEY,
        service: 's3',
        region: env.IDRIVE_E2_REGION,        // z. B. 'us-west-1'
      });
      const target = `https://${env.IDRIVE_E2_BUCKET_AVATARS}.${env.IDRIVE_E2_HOST}/${key}`;
      const signed = await aws.sign(
        new Request(target, { method: 'PUT', headers: { 'content-type': contentType } }),
        { aws: { signQuery: true, expires: 600 } }
      );

      return Response.json({
        uploadUrl: signed.url,
        objectKey: key,
        publicUrl: `https://cdn.puq.me/${key}`,
        expiresInSeconds: 600,
      });
    }
    return new Response('Not found', { status: 404 });
  },
};
```

### 5.2 Cloudflare Worker — Download (Edge-cached)

Vollständig in [`workers/api/src/assets.ts`](../workers/api/src/assets.ts).
Skizze:

```ts
const cache = caches.default;
const cached = await cache.match(req);
if (cached) return cached;

const key = new URL(req.url).pathname.replace(/^\/+/, '');
if (!isPublicPrefix(key)) return new Response('forbidden', { status: 403 });

const aws = new AwsClient({ /* ...wie oben */ });
const upstream = await aws.fetch(`https://${env.IDRIVE_E2_HOST}/${key}`);
if (!upstream.ok) return new Response('not found', { status: upstream.status });

const headers = new Headers(upstream.headers);
headers.set('cache-control', 'public, max-age=31536000, immutable, stale-while-revalidate=86400');
const res = new Response(upstream.body, { status: 200, headers });
ctx.waitUntil(cache.put(req, res.clone()));
return res;
```

### 5.3 Empfohlene GitHub-Repo-Struktur

```text
puq-me/
├─ apps/
│  ├─ web/                  # Next.js (statisch exportiert) oder Astro/SvelteKit-Static
│  │  ├─ public/
│  │  ├─ src/
│  │  ├─ next.config.mjs    # output: 'export'
│  │  └─ package.json
│  └─ admin/                # interne Moderations-UI (gleiche Build-Pipeline)
│
├─ workers/
│  ├─ api/                  # api.puq.me     — Auth, presigned URLs, Metadaten
│  │  ├─ src/
│  │  │  ├─ index.ts
│  │  │  ├─ assets.ts
│  │  │  ├─ auth.ts
│  │  │  └─ s3.ts
│  │  ├─ wrangler.toml
│  │  └─ package.json
│  ├─ assets/               # cdn.puq.me     — Read-Through-Cache vor IDrive E2
│  │  └─ ...
│  └─ realtime/             # WebSocket-Hub für Chat / "Begegnung"
│     └─ ...
│
├─ packages/
│  ├─ ui/                   # geteilte React-Komponenten
│  ├─ types/                # geteilte TS-Typen (API-Schemas)
│  └─ validation/           # zod / valibot Schemas
│
├─ infrastructure/
│  ├─ cloudflare/           # Wrangler-Configs, Account-IDs (ohne Secrets)
│  └─ idrive-e2/
│     ├─ buckets.md         # offizielle Bucket-Liste
│     ├─ cors.json          # CORS-Policies pro Bucket
│     ├─ lifecycle.json     # Lifecycle (24 h für ID-Docs, 90 d für Pending)
│     └─ iam-policies.json  # least-privilege Sub-Keys
│
├─ docs/
│  ├─ ARCHITECTURE-FREE-TIER.md   # dieses Dokument
│  ├─ idrive-e2-storage.md
│  ├─ storage-api.md
│  └─ runbooks/
│
├─ .github/
│  └─ workflows/
│     ├─ web-deploy.yml     # Pages-Build (Preview + Prod)
│     ├─ workers-deploy.yml # Wrangler-Deploy bei Push auf main
│     └─ secrets-sync.yml   # manueller IDrive-Key-Rotation
│
├─ turbo.json
├─ pnpm-workspace.yaml
└─ README.md
```

Pro Worker eine eigene `wrangler.toml`. Geheimnisse via
`wrangler secret put` (nicht via `vars` in der toml). Pages-Builds über GitHub-Auto-Deploy,
Worker-Builds über GitHub Actions mit `cloudflare/wrangler-action`.

---

## 6. Text-Architekturdiagramm

```
                                 ┌────────────────────────────┐
                                 │           USER             │
                                 │   Browser  /  PWA  /  iOS  │
                                 └──────┬─────────────┬───────┘
                                        │             │
                              statisch  │             │  signed dynamic
                                        │             │
                                        ▼             ▼
                           ┌──────────────────────────────────────────┐
                           │           CLOUDFLARE FREE                │
                           │   TLS · WAF · Bot · Rate-Limit · Cache   │
                           └──┬─────────┬─────────┬─────────┬─────────┘
                              │         │         │         │
              puq.me ─────────┘         │         │         └──────── cdn.puq.me
              www.puq.me                │         │                  ┌────────────┐
                  │                     │         │                  │ Worker     │
                  ▼                     ▼         ▼                  │ assets     │
        ┌─────────────────┐    ┌────────────┐  ┌────────────┐        │ (GET only) │
        │ Cloudflare      │    │ Worker     │  │ Worker     │        └─────┬──────┘
        │ Pages           │    │ api        │  │ realtime   │              │
        │ (Static Build)  │    │ JWT, sign, │  │ WebSocket  │              │
        │ aus GitHub      │    │ DB writes  │  │ (Durable   │              │
        │ via CI          │    │            │  │  Object)   │              │
        └────────┬────────┘    └─────┬──────┘  └────────────┘              │
                 │                   │                                     │
                 │                   │  AWS4-signed S3 calls               │ AWS4
                 │                   │                                     │ GET
                 │                   ▼                                     ▼
                 │       ┌───────────────────────────────────────────────────────┐
                 │       │                   IDRIVE E2  (S3)                     │
                 │       │  puq-images   puq-avatars   puq-chat-media            │
                 │       │  puq-id-docs (24h-Lifecycle)   puq-backups            │
                 │       │              private · least-privilege keys           │
                 │       └───────────────────────────────────────────────────────┘
                 │
                 │ Source of Truth
                 ▼
         ┌────────────────┐
         │  GITHUB FREE   │
         │  Code · CI     │
         │  Actions       │
         │  Secrets-Sync  │
         └────────────────┘
```

Vertikal lesbar von oben nach unten:
**User → Cloudflare Edge → (Pages | Workers) → IDrive E2 / GitHub.**

---

## Anhang A — Persönliche Empfehlung des Architekten

Drei Dinge, die ich konkret für PuQ.me früh festschrauben würde:

1. **Storage-Hybrid statt Storage-Monokultur.** IDrive E2 als günstige, S3-kompatible
   Source-of-Truth ist solide; Cloudflare R2 als 10-GB-Read-Through-Cache vor IDrive
   ist im Free-Tier praktisch geschenkt und zerschneidet Egress-Spitzen sauber. Wenn
   PuQ.me viral geht, ist das der billigste vorbeugende Schutz, den man einbauen kann.

2. **DSGVO ist Code, nicht Doku.** "Wir löschen nach 24 h" gehört in die Bucket-Lifecycle,
   nicht in die FAQ. "Nur grobe Standorte" gehört in einen H3-Encoder vor dem DB-Insert,
   nicht in die Privacy-Erklärung. Genau diese Punkte versprechen die Mockups
   ("Standorte werden niemals exakt gespeichert", "Lösche jederzeit alle Daten — DSGVO Art. 17",
   "Verified-Badge · Daten 24h dann weg") — und genau das wird unten im Stack erzwungen.

3. **Workers an die kurze Leine.** 10 ms CPU pro Request klingt nach viel, ist es aber
   nicht, sobald man AWS4 plus JSON plus Logging macht. Faustregel: der Worker
   *signiert und verweist*, er *transportiert* keine Bytes. Jeder Upload als presigned
   PUT direkt ans Backend, jeder Download via Cache-First-Pattern. Wer das einhält,
   kommt mit dem Free-Tier weit.

---
