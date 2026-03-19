# PuQ.me API Fix - Quick Reference

## The Problem
🔴 API backend at `api.puq.me` is returning 404 on all `/v1/*` routes because it's in development mock mode in production.

## The Solution
Deploy the API with proper production configuration using Docker Compose.

## 5-Step Quick Start

### Step 1: Get Configuration Ready
```bash
cp .env.production.api deploy/host/.env
```

Then edit `deploy/host/.env` and replace:
```
POSTGRES_PASSWORD=choose-a-strong-password-here
S3_ACCESS_KEY=your-idrive-e2-access-key
S3_SECRET_KEY=your-idrive-e2-secret-key
```

### Step 2: Prepare Your VPS
```bash
# SSH into your VPS
ssh root@your-vps-ip

# Install Docker (if not already installed)
apt-get update && apt-get install -y docker.io docker-compose

# Clone the repo to /opt/puqme
git clone <repo-url> /opt/puqme
cd /opt/puqme
```

### Step 3: Copy Configuration to VPS
```bash
# From your local machine
scp deploy/host/.env root@your-vps-ip:/opt/puqme/deploy/host/.env
```

### Step 4: Start Services
```bash
# On the VPS
cd /opt/puqme/deploy/host
docker compose up -d
docker compose ps  # Should show all services as "Up"
```

### Step 5: Verify It Works
```bash
# Test the health endpoint
curl https://api.puq.me/health

# Should return (NOT a 404):
# {"status":"ok","version":"0.1.0","timestamp":"2026-03-19T..."}
```

## Before You Deploy

✓ You need a VPS with:
- 2+ GB RAM
- 2+ CPU cores
- Ubuntu 22.04 LTS (or Docker-compatible Linux)
- Docker and Docker Compose installed

✓ You need credentials for:
- PostgreSQL database
- IDrive e2 S3 storage (access key + secret)
- Cloudflare account (to route api.puq.me)

## Testing After Deployment

```bash
# 1. Health check
curl https://api.puq.me/health

# 2. Register a new user
curl -X POST https://api.puq.me/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test123!",
    "name":"Test User"
  }'

# Should return 200 or 400 (validation), NOT 404

# 3. Check logs if something fails
docker compose logs api
```

## If Something Goes Wrong

```bash
# View all logs
docker compose logs -f

# View only API logs
docker compose logs -f api

# Restart the API
docker compose restart api

# Stop all services
docker compose down

# Start again
docker compose up -d
```

## Key Files

- **Configuration**: `.env.production.api` (already prepared with all values)
- **Deployment Config**: `deploy/host/docker-compose.yml`
- **Full Guide**: `API-DEPLOYMENT-GUIDE.md` (detailed instructions)
- **Status**: `DEPLOYMENT-STATUS.md` (checklist)

## What Each Service Does

- **PostgreSQL**: Stores user data, profiles, matches
- **Redis**: Caches sessions and rate limiting
- **Fastify API**: Serves the /v1/* endpoints
- **IDrive e2**: Stores user photos and media

## Environment Variables (Pre-Filled)

✓ `NODE_ENV=production` - Correct
✓ `DEV_MOCK_MODE=false` - Critical fix!
✓ `JWT_SECRET` - Generated securely
✓ `JWT_REFRESH_SECRET` - Generated securely
✓ `GOOGLE_CLIENT_ID` - Pre-configured
✓ `APP_ORIGIN=https://puq.me` - Correct

⚠️ **You need to fill in:**
- `POSTGRES_PASSWORD` - Your choice
- `S3_ACCESS_KEY` - From IDrive e2
- `S3_SECRET_KEY` - From IDrive e2

## Success = This Works

```bash
curl https://api.puq.me/v1/profiles/me \
  -H "Authorization: Bearer token"

# ✅ Returns: {"id":"user-id","name":"...","photos":[...]}
# ❌ Wrong: {"error":"Not Found"}
```

---

**Need help?** See `API-DEPLOYMENT-GUIDE.md` for detailed instructions.
