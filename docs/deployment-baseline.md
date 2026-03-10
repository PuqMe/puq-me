# PuQ.me Deployment Baseline

## Application Images

- `ghcr.io/puqme/web`
- `ghcr.io/puqme/api`
- `ghcr.io/puqme/websocket`
- `ghcr.io/puqme/admin`

Branch policy:

- `staging` branch publishes `:staging` tags
- `main` branch publishes `:production` and `:latest` tags
- every push also publishes `:<git-sha>`

## Environment Layout

### Staging

- isolated Cloudflare subdomains:
  - `staging.puq.me`
  - `api-staging.puq.me`
  - `ws-staging.puq.me`
  - `admin-staging.puq.me`
- separate PostgreSQL database
- separate Redis instance
- separate object storage bucket or prefix
- lower rate limits and smaller autoscaling bounds

### Production

- public domains:
  - `puq.me`
  - `api.puq.me`
  - `ws.puq.me`
  - `admin.puq.me`
- production PostgreSQL and Redis are fully isolated from staging
- separate Cloudflare rulesets and analytics

## Environment Variables

### Shared

- `NODE_ENV`
- `LOG_LEVEL`
- `APP_ORIGIN`
- `NEXT_PUBLIC_APP_ENV`

### API

- `PORT`
- `HOST`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES_IN`
- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `S3_PUBLIC_BASE_URL`
- `RATE_LIMIT_MAX`
- `RATE_LIMIT_WINDOW`
- `AUTH_LOGIN_RATE_LIMIT_MAX`
- `AUTH_LOGIN_RATE_LIMIT_WINDOW`

### Web

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_WS_BASE_URL`
- `NEXT_PUBLIC_APP_ENV`

### WebSocket

- `PORT`
- `HOST`
- `API_BASE_URL`
- `REDIS_URL`

### Admin

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_ADMIN_APP_URL`
- `NEXT_PUBLIC_APP_ENV`

## Backup Concept With IDrive

### PostgreSQL

- daily full backup via `pg_dump` into compressed artifacts
- WAL or point-in-time recovery enabled on the managed PostgreSQL service
- retain:
  - `7` daily backups
  - `4` weekly backups
  - `6` monthly backups
- upload encrypted backup artifacts to IDrive using an S3-compatible endpoint or mounted backup target

Operational flow:

1. run `pg_dump --format=custom`
2. compress and checksum artifact
3. encrypt before transfer if DB provider does not do this for you
4. upload to IDrive
5. emit success or failure metric and alert
6. run periodic restore tests into a staging database

### Media Backups

- primary media remains in object storage
- enable bucket versioning
- replicate media daily to IDrive
- preserve originals and transformed variants separately
- keep deleted media under retention before hard delete

Recommended object layout:

- `backups/postgres/{environment}/{date}/...`
- `backups/media/{environment}/{date}/...`

## Cloudflare Setup Recommendations

### DNS

- proxied orange-cloud records for:
  - `puq.me`
  - `api.puq.me`
  - `ws.puq.me`
  - `admin.puq.me`

### TLS

- use `Full (strict)`
- origin certificates on ingress or load balancer
- HSTS enabled for production

### WAF

- enable managed ruleset
- add custom rules for:
  - login abuse
  - registration abuse
  - upload abuse
  - admin path restrictions

### Rate Limiting

- aggressive limits on:
  - `/v1/auth/login`
  - `/v1/auth/register`
  - `/v1/media/*`
  - `/v1/swipe`
  - `/v1/chat/messages`

### CDN

- cache static Next.js assets
- cache profile image variants
- bypass cache for authenticated API responses
- respect websocket upgrades on `ws.puq.me`

### Security

- Bot Management or Super Bot Fight Mode
- Turnstile on registration and suspicious login flows
- IP allowlisting or Access in front of `admin.puq.me`

## Recommended Start Commands

```bash
cp .env.example .env
docker compose up --build
```

Individual app images:

```bash
docker build -f apps/api/Dockerfile .
docker build -f apps/web/Dockerfile .
docker build -f apps/websocket/Dockerfile .
docker build -f apps/admin/Dockerfile .
```
