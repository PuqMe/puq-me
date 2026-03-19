# PuQ.me API Deployment Guide

## Overview

The PuQ.me platform consists of two separate deployments:

| Component | Type | Deployment Method | Status |
|-----------|------|------------------|--------|
| **Frontend** | Next.js (React) | Cloudflare Workers | ✅ Live at puq.me |
| **API Backend** | Fastify (Node.js) | Docker Compose on VPS | ⚠️ Currently Broken (See Issues) |

---

## Critical Issue: API Backend is Broken

### Symptoms
- **All `/v1/*` routes return 404** (POST /auth/login, GET /profiles/me, etc.)
- Only `GET /health` responds (with frozen timestamp)
- Frontend operates in **offline fallback mode** with fake demo data

### Root Cause
The API is in **DEV_MOCK_MODE=true** in production, which:
- Disables all real database operations
- Only loads mock routes and circle module
- Responds with fake hardcoded data

### Solution
Deploy the API with proper production configuration:
1. Set `DEV_MOCK_MODE=false`
2. Configure all required environment variables
3. Deploy via Docker Compose on a VPS

---

## Prerequisites

### Infrastructure Requirements

You need a VPS/dedicated host with:
- **CPU**: 2+ cores (t3.small or equivalent)
- **RAM**: 2+ GB
- **Storage**: 20+ GB SSD
- **Operating System**: Ubuntu 22.04 LTS (recommended) or Docker-compatible Linux
- **Network**: Public IP with domain delegation to Cloudflare
- **Docker**: Docker Engine 20.10+ and Docker Compose 2.0+

### Services to Deploy

| Service | Purpose | Port | Status |
|---------|---------|------|--------|
| PostgreSQL 15 | User data, profiles, matches | 5432 (internal) | Included in docker-compose |
| Redis 7 | Session cache, rate limiting | 6379 (internal) | Included in docker-compose |
| Fastify API | Main application | 3000 (internal → 443 via Cloudflare proxy) | Included in docker-compose |

### External Services Required

1. **IDrive e2 Storage** (S3-compatible)
   - Buckets: `puq-images`, `puq-avatars`, `puq-chat-media`, `puq-backups`
   - Already exists for this account

2. **Cloudflare**
   - Already configured for DNS and proxying
   - Routes: api.puq.me, ws.puq.me, cdn.puq.me

3. **Google OAuth**
   - Client ID: `535490837100-tcscbqgjsgvnbnnrc68hrk15hd6he8m6.apps.googleusercontent.com`
   - Already configured

---

## Step 1: Prepare Environment Variables

### Get the Production Config
```bash
# Copy the provided production config
cp .env.production.api deploy/host/.env
```

### Fill in Required Secrets
Edit `deploy/host/.env` and replace these placeholders:

```bash
# PostgreSQL password (generate a strong password)
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD_HERE

# IDrive e2 Credentials (from IDrive account settings)
S3_ACCESS_KEY=YOUR_IDRIVE_E2_ACCESS_KEY
S3_SECRET_KEY=YOUR_IDRIVE_E2_SECRET_KEY
```

### Verify All Required Variables

```bash
grep -E "replace-|PLACEHOLDER|\[" deploy/host/.env
```

Should return nothing if all values are filled in.

---

## Step 2: Verify Docker Compose Configuration

The `deploy/host/docker-compose.yml` file includes:

```yaml
services:
  postgres:        # PostgreSQL 15 database
  redis:          # Redis cache
  api:            # Fastify Node.js API server
```

**Key points:**
- Services use internal networking (not exposed to public internet)
- Only the API should be exposed via Cloudflare reverse proxy
- PostgreSQL and Redis communicate internally via service hostnames

---

## Step 3: Deploy to VPS

### Login to VPS
```bash
ssh root@your-vps-ip-address
```

### Clone/Update Repository
```bash
# Clone the repository (if not already there)
git clone <repo-url> /opt/puqme
cd /opt/puqme

# Or update existing installation
cd /opt/puqme
git pull origin main
```

### Copy Configuration
```bash
# Copy from local machine to VPS
scp .env.production.api root@your-vps-ip:/opt/puqme/deploy/host/.env
```

Or copy the contents directly if you prepared it on the VPS.

### Authenticate with Container Registry
If deploying from GitHub Container Registry (GHCR):

```bash
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### Start Services
```bash
cd /opt/puqme/deploy/host

# Pull latest images
docker compose pull

# Start all services in background
docker compose up -d

# Verify they're running
docker compose ps
```

Expected output:
```
NAME                    STATUS
puqme-postgres-1        Up (healthy)
puqme-redis-1          Up (healthy)
puqme-api-1            Up (healthy)
```

---

## Step 4: Verify the Deployment

### Check Service Health

```bash
# Health endpoint (should return JSON with status: "ok")
curl -s https://api.puq.me/health | jq .

# Expected response:
# {
#   "status": "ok",
#   "version": "0.1.0",
#   "timestamp": "2026-03-19T10:30:45.123Z"
# }
```

### Test API Routes

```bash
# Register endpoint (currently returns 404 if DEV_MOCK_MODE is still true)
curl -X POST https://api.puq.me/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Should return 400 (validation error) or 200 (success), NOT 404
```

### View Logs

```bash
cd /opt/puqme/deploy/host

# View API logs
docker compose logs api

# Stream logs in real-time
docker compose logs -f api

# View specific error
docker compose logs api | grep -i error
```

---

## Step 5: Configure Cloudflare Proxy

### DNS & Routing
Cloudflare should route:
- `api.puq.me` → Your VPS public IP → Port 443 (HTTPS)
- `ws.puq.me` → Your VPS public IP → Port 443 (for WebSocket)
- `cdn.puq.me` → IDrive e2 bucket (S3)

### SSL/TLS
- Enable "Full (strict)" SSL/TLS mode in Cloudflare
- Your VPS needs a valid SSL certificate (use Let's Encrypt)

**Generate SSL Certificate on VPS:**
```bash
sudo apt-get update
sudo apt-get install -y certbot

# Generate certificate for your domain
sudo certbot certonly --standalone -d api.puq.me -d ws.puq.me

# Certificates saved to:
# /etc/letsencrypt/live/api.puq.me/fullchain.pem
# /etc/letsencrypt/live/api.puq.me/privkey.pem
```

Then configure your reverse proxy (nginx/Caddy) to use these certificates.

---

## Troubleshooting

### Issue: API Still Returns 404 on /v1/* Routes

**Check 1: Verify DEV_MOCK_MODE is false**
```bash
docker compose exec api sh -c 'echo $DEV_MOCK_MODE'
# Should output: false
```

**Check 2: Verify environment variables were loaded**
```bash
docker compose logs api | head -30
# Look for: "config loaded successfully" or any validation errors
```

**Check 3: Restart the container**
```bash
docker compose restart api
docker compose logs api
```

### Issue: Database Connection Error

**Check if PostgreSQL is healthy:**
```bash
docker compose exec postgres psql -U puqme -c "SELECT 1"
# Should return: 1
```

**Check the database URL in .env:**
```bash
grep DATABASE_URL deploy/host/.env
# Should be: postgresql://puqme:PASSWORD@postgres:5432/puqme
```

### Issue: Redis Connection Error

**Check if Redis is running:**
```bash
docker compose exec redis redis-cli ping
# Should return: PONG
```

### Issue: S3/IDrive e2 Authentication Failed

**Verify credentials:**
```bash
docker compose logs api | grep -i "s3\|storage\|idrive"
```

**Check S3 configuration:**
- Endpoint: `https://storage.idrivee2-7.com` ✓
- Region: `auto` ✓
- Access Key and Secret Key from IDrive account

---

## Monitoring & Maintenance

### Regular Checks

```bash
# Check all services are running
docker compose ps

# View recent errors
docker compose logs --tail=100 api

# Check database size
docker compose exec postgres du -sh /var/lib/postgresql/data
```

### Backup Database

```bash
docker compose exec postgres pg_dump -U puqme puqme > backup-$(date +%Y%m%d).sql
```

### Update Application

```bash
git pull origin main
docker compose pull
docker compose up -d
docker compose logs -f api
```

---

## Environment Variables Reference

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `NODE_ENV` | App environment | `production` | ✓ |
| `DEV_MOCK_MODE` | Use mock data | `false` | ✓ |
| `APP_ORIGIN` | Frontend origin | `https://puq.me` | ✓ |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` | ✓ |
| `REDIS_URL` | Redis connection | `redis://redis:6379` | ✓ |
| `JWT_SECRET` | Auth token secret | (random 32+ chars) | ✓ |
| `JWT_REFRESH_SECRET` | Refresh token secret | (random 32+ chars) | ✓ |
| `S3_ACCESS_KEY` | IDrive e2 access key | `...` | ✓ |
| `S3_SECRET_KEY` | IDrive e2 secret key | `...` | ✓ |
| `GOOGLE_CLIENT_ID` | OAuth client ID | `535490837100-...` | ✓ |

---

## Success Indicators

Once deployed, you should see:

1. ✅ All `/v1/*` routes respond (no more 404s)
2. ✅ User registration/login flows work
3. ✅ Profile queries return real data
4. ✅ Frontend shows live data instead of demo data
5. ✅ Real-time features (chat, matches) function

---

## Support

For issues or questions:
1. Check logs: `docker compose logs -f`
2. Review this guide's troubleshooting section
3. Verify all environment variables are set correctly
4. Ensure all services are healthy: `docker compose ps`

