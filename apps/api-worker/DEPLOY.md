# PuQ.me API Worker – Deployment-Anleitung

## Voraussetzungen
- Cloudflare Account (Free Plan)
- `wrangler` CLI installiert (`npm i -g wrangler`)
- Angemeldet bei Cloudflare: `wrangler login`

## 1. D1-Datenbank erstellen

```bash
cd apps/api-worker
wrangler d1 create puqme-db
```

Die Ausgabe enthält eine `database_id`. Diese in `wrangler.toml` eintragen:
```toml
[[d1_databases]]
binding = "DB"
database_name = "puqme-db"
database_id = "HIER_DIE_ID_EINTRAGEN"
```

## 2. KV-Namespace erstellen

```bash
wrangler kv namespace create KV
```

Die `id` in `wrangler.toml` eintragen:
```toml
[[kv_namespaces]]
binding = "KV"
id = "HIER_DIE_ID_EINTRAGEN"
```

## 3. D1-Schema migrieren

```bash
# Lokal testen
pnpm run db:migrate:local

# Remote (Production)
pnpm run db:migrate:remote
```

## 4. Secrets setzen

```bash
wrangler secret put JWT_SECRET
wrangler secret put JWT_REFRESH_SECRET
wrangler secret put S3_ENDPOINT
wrangler secret put S3_REGION
wrangler secret put S3_BUCKET
wrangler secret put S3_ACCESS_KEY
wrangler secret put S3_SECRET_KEY
wrangler secret put GOOGLE_CLIENT_ID
```

Werte aus der bestehenden `.env.production.api` übernehmen:
- `JWT_SECRET` / `JWT_REFRESH_SECRET`: Mindestens 16 Zeichen
- `S3_ENDPOINT`: `https://storage.idrivee2-7.com`
- `S3_REGION`: `e2-7`
- `S3_BUCKET`: `puq-images`
- `S3_ACCESS_KEY` / `S3_SECRET_KEY`: IDrive E2 Zugangsdaten
- `GOOGLE_CLIENT_ID`: `535490837100-...`

## 5. Deployen

```bash
pnpm install
pnpm run deploy
```

## 6. Custom Domain konfigurieren

In Cloudflare Dashboard:
1. Workers & Pages → puqme-api → Settings → Triggers
2. "Add Custom Domain" → `api.puq.me`
3. Cloudflare erstellt automatisch den DNS-Eintrag

Für WebSocket:
- `ws.puq.me` → gleicher Worker (WebSocket-Upgrade wird intern geroutet)

## 7. Alte Infrastruktur (nach Verifizierung)

Sobald der Worker stabil läuft:
- Docker/Kubernetes-Deployment stoppen
- PostgreSQL + Redis herunterfahren
- Terraform DNS-Einträge für api/ws aktualisieren (CNAME → Worker)
- Kubernetes-Manifeste archivieren

## Architektur-Übersicht

```
Client → Cloudflare Edge (api.puq.me)
           ↓
    CF Worker (Hono)
      ├── D1 (SQLite) - Datenbank
      ├── KV - Sessions, Cache, Rate Limiting
      ├── Durable Objects - WebSocket (Chat)
      └── IDrive E2 (via S3 API) - Bilder/Medien
```

## Kosten

Cloudflare Free Plan beinhaltet:
- 100.000 Worker Requests/Tag
- 5 GB D1 Storage
- 1 GB KV Storage
- Durable Objects (WebSocket): 1M Requests/Monat
- Unbegrenzt DNS/CDN/SSL

→ **$0/Monat** für normale Nutzung
