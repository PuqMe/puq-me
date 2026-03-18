# PuQ.me Hosting Stack

`PuQ.me` is now aligned around a low-cost production baseline:

- Cloudflare Free for DNS, SSL, proxy and web deployment via Wrangler
- GitHub Free for source control and CI/CD
- IDrive e2 for S3-compatible media and backup storage
- main compute host for Fastify API, WebSocket and background jobs

## Final Architecture

```text
users
  -> Cloudflare
      -> puq.me        -> Cloudflare Worker / Web app
      -> api.puq.me    -> main compute host (Fastify API)
      -> ws.puq.me     -> main compute host (WebSocket)
      -> cdn.puq.me    -> Cloudflare proxied IDrive e2 delivery

GitHub
  -> Actions
      -> deploy web with Wrangler
      -> build/publish backend images
      -> deploy backend host via SSH

IDrive e2
  -> avatars
  -> images
  -> chat media
  -> backups
```

## Why This Split

- Cloudflare is excellent for DNS, SSL, caching and low-cost frontend delivery.
- GitHub Free is enough for repository management and basic CI/CD.
- IDrive e2 is storage, not compute. It should hold files, not API or WebSocket logic.
- Fastify and WebSocket stay on the main compute host until or unless the backend is intentionally migrated to Workers-compatible services.

## Required GitHub Secrets

For web deployment:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_WS_BASE_URL`

For image publishing and backend deploys:

- `KUBE_CONFIG_STAGING_B64` or your replacement host secret
- `KUBE_CONFIG_PRODUCTION_B64` or your replacement host secret

For host deployment:

- `HOST_SSH_HOST`
- `HOST_SSH_USER`
- `HOST_SSH_PRIVATE_KEY`
- `HOST_SSH_PORT`
- `HOST_APP_PATH`

Recommended additional secrets:

- `IDRIVE_E2_ACCESS_KEY`
- `IDRIVE_E2_SECRET_KEY`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `DATABASE_URL`
- `REDIS_URL`

## Cloudflare Responsibilities

- manage DNS for `puq.me`, `api.puq.me`, `ws.puq.me`, `cdn.puq.me`
- proxy all public traffic
- terminate TLS
- cache media delivery on `cdn.puq.me`
- deploy the frontend from GitHub through Wrangler

## Main Compute Host Responsibilities

- run `apps/api`
- run `apps/websocket`
- run `deploy/host/docker-compose.yml`
- run background moderation and upload hooks
- keep PostgreSQL and Redis private

## IDrive e2 Responsibilities

- store avatars, images and chat uploads
- store backup archives
- accept only signed uploads
- expose public files through `cdn.puq.me`, not the raw bucket hostname

## Operational Order

1. Connect `puq.me` to Cloudflare Free.
2. Create the IDrive e2 buckets and credentials.
3. Point `cdn.puq.me` at the IDrive e2 endpoint through Cloudflare.
4. Add the GitHub secrets listed above.
5. Deploy the web app with [`.github/workflows/deploy-web-cloudflare.yml`](/Users/abest/Library/CloudStorage/GoogleDrive-a17023373371@gmail.com/Meine%20Ablage/03.%20Akdeniz.Group/-%20con.ax/-%20puq.me/3.3.26%20PuQ.me/PuQ.me/.github/workflows/deploy-web-cloudflare.yml).
6. Prepare the host with [`deploy/host/.env.example`](/Users/abest/Library/CloudStorage/GoogleDrive-a17023373371@gmail.com/Meine%20Ablage/03.%20Akdeniz.Group/-%20con.ax/-%20puq.me/3.3.26%20PuQ.me/PuQ.me/deploy/host/.env.example) and [`deploy/host/docker-compose.yml`](/Users/abest/Library/CloudStorage/GoogleDrive-a17023373371@gmail.com/Meine%20Ablage/03.%20Akdeniz.Group/-%20con.ax/-%20puq.me/3.3.26%20PuQ.me/PuQ.me/deploy/host/docker-compose.yml).
7. Deploy API and WebSocket with [`.github/workflows/deploy-backend-host.yml`](/Users/abest/Library/CloudStorage/GoogleDrive-a17023373371@gmail.com/Meine%20Ablage/03.%20Akdeniz.Group/-%20con.ax/-%20puq.me/3.3.26%20PuQ.me/PuQ.me/.github/workflows/deploy-backend-host.yml).
8. Point `api.puq.me` and `ws.puq.me` through Cloudflare to that host.

## Current Recommendation

Use this stack now:

- web frontend on Cloudflare with Wrangler
- API and WebSocket on the main compute host
- media on IDrive e2

Do not move the current Fastify and WebSocket services to Cloudflare just because Cloudflare is available. That should be a later deliberate migration, not a default assumption.
