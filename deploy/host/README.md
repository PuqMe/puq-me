# PuQ.me Host Deploy

This directory contains the low-cost main-host deployment path for `PuQ.me`.

It is intended for:

- `api.puq.me`
- `ws.puq.me`
- PostgreSQL
- Redis

The frontend stays on Cloudflare via Wrangler.

## Files

- compose file: [`docker-compose.yml`](/Users/abest/Library/CloudStorage/GoogleDrive-a17023373371@gmail.com/Meine%20Ablage/03.%20Akdeniz.Group/-%20con.ax/-%20puq.me/3.3.26%20PuQ.me/PuQ.me/deploy/host/docker-compose.yml)
- env template: [`deploy/host/.env.example`](/Users/abest/Library/CloudStorage/GoogleDrive-a17023373371@gmail.com/Meine%20Ablage/03.%20Akdeniz.Group/-%20con.ax/-%20puq.me/3.3.26%20PuQ.me/PuQ.me/deploy/host/.env.example)

## Setup

1. Copy `.env.example` to `.env`.
2. Replace all placeholder secrets.
3. Log in to GHCR on the host.
4. Run:

```bash
docker compose --env-file .env -f docker-compose.yml pull
docker compose --env-file .env -f docker-compose.yml up -d
```

## Notes

- `DEV_MOCK_MODE` is forced off in production.
- IDrive e2 remains the media store.
- Cloudflare should proxy only the public hostnames, not the raw IDrive hostname.
