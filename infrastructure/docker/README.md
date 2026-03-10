# Docker Runtime

Canonical local development entrypoint:

- [`/Users/abest/Projekte/PuQ.me/docker-compose.yml`](/Users/abest/Projekte/PuQ.me/docker-compose.yml)

Services:

- `frontend` -> `apps/web`
- `backend` -> `apps/api`
- `websocket` -> `apps/websocket`
- `admin` -> `apps/admin`
- `postgres`
- `redis`

Use:

```bash
docker compose up --build
```
