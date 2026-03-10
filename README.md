# PuQ.me

Production-oriented monorepo and infrastructure baseline for the dating platform `PuQ.me`.

## Repository Structure

```text
puq-me/
├─ apps/
│  ├─ web/          Next.js + Tailwind + PWA frontend
│  ├─ api/          Fastify backend
│  ├─ websocket/    realtime service
│  └─ admin/        Next.js admin dashboard
├─ packages/
│  ├─ ui/
│  ├─ types/
│  ├─ validation/
│  └─ config/
├─ frontend/
│  ├─ nextjs/
│  ├─ tailwind/
│  └─ pwa/
├─ backend/
│  ├─ fastify/
│  ├─ websocket/
│  └─ microservices/
├─ infrastructure/
│  ├─ docker/
│  ├─ kubernetes/
│  └─ terraform/
├─ storage/
│  └─ idrive-e2-config/
├─ docs/
└─ README.md
```

`apps/*` contains the runnable code. The `frontend/`, `backend/`, `infrastructure/`, and `storage/` folders document and organize the target platform layout required for operations and onboarding.

## Core Stack

- Frontend: Next.js, TypeScript, Tailwind, PWA
- Backend: Fastify, WebSocket, PostgreSQL, Redis
- Storage: IDrive E2 (S3-compatible)
- Edge: Cloudflare DNS, CDN, WAF, Rate Limiting
- Delivery: GitHub Actions, Docker, Kubernetes

## Key Paths

- Web app: [`/Users/abest/Projekte/PuQ.me/apps/web`](/Users/abest/Projekte/PuQ.me/apps/web)
- API: [`/Users/abest/Projekte/PuQ.me/apps/api`](/Users/abest/Projekte/PuQ.me/apps/api)
- WebSocket: [`/Users/abest/Projekte/PuQ.me/apps/websocket`](/Users/abest/Projekte/PuQ.me/apps/websocket)
- Admin: [`/Users/abest/Projekte/PuQ.me/apps/admin`](/Users/abest/Projekte/PuQ.me/apps/admin)
- Docker dev stack: [`/Users/abest/Projekte/PuQ.me/docker-compose.yml`](/Users/abest/Projekte/PuQ.me/docker-compose.yml)
- Kubernetes: [`/Users/abest/Projekte/PuQ.me/infrastructure/kubernetes`](/Users/abest/Projekte/PuQ.me/infrastructure/kubernetes)
- Terraform / Cloudflare: [`/Users/abest/Projekte/PuQ.me/infrastructure/terraform/cloudflare`](/Users/abest/Projekte/PuQ.me/infrastructure/terraform/cloudflare)
- Cloudflare guide: [`/Users/abest/Projekte/PuQ.me/docs/cloudflare-setup.md`](/Users/abest/Projekte/PuQ.me/docs/cloudflare-setup.md)
- IDrive guide: [`/Users/abest/Projekte/PuQ.me/docs/idrive-e2-storage.md`](/Users/abest/Projekte/PuQ.me/docs/idrive-e2-storage.md)
- Backup strategy: [`/Users/abest/Projekte/PuQ.me/docs/backup-strategy.md`](/Users/abest/Projekte/PuQ.me/docs/backup-strategy.md)
- Storage API: [`/Users/abest/Projekte/PuQ.me/docs/storage-api.md`](/Users/abest/Projekte/PuQ.me/docs/storage-api.md)

## Local Development

Copy environment files:

- [`/Users/abest/Projekte/PuQ.me/apps/api/.env.example`](/Users/abest/Projekte/PuQ.me/apps/api/.env.example) -> `apps/api/.env`
- [`/Users/abest/Projekte/PuQ.me/apps/web/.env.example`](/Users/abest/Projekte/PuQ.me/apps/web/.env.example) -> `apps/web/.env.local`
- [`/Users/abest/Projekte/PuQ.me/apps/websocket/.env.example`](/Users/abest/Projekte/PuQ.me/apps/websocket/.env.example) -> `apps/websocket/.env`
- [`/Users/abest/Projekte/PuQ.me/apps/admin/.env.example`](/Users/abest/Projekte/PuQ.me/apps/admin/.env.example) -> `apps/admin/.env.local`

Install:

```bash
pnpm install
```

Run everything with Turbo:

```bash
pnpm dev
```

Run the Docker stack:

```bash
docker compose up --build
```

## CI/CD

GitHub Actions pipeline:

- quality gates: lint, typecheck, test, build
- image publish to GHCR
- staging deploy on `staging`
- production deploy on `main`

Workflow file:

- [`/Users/abest/Projekte/PuQ.me/.github/workflows/ci-cd.yml`](/Users/abest/Projekte/PuQ.me/.github/workflows/ci-cd.yml)
