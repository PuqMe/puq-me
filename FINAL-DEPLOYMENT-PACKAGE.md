# 🚀 PuQ.me - Final Deployment Package (Produktionsbereit)

**Status**: ✅ **100% FERTIG ZUM DEPLOYEN**
**Datum**: 2026-03-19
**Ziel**: Projekt auf VPS deployen und live gehen

---

## 📦 Was ist vorbereitet

### ✅ Fertig zum Deploy

| Komponente | Status | Datei |
|-----------|--------|-------|
| **Produktions-.env** | ✓ Vorbereitet | `.env.production.api` |
| **Docker Compose** | ✓ Vorbereitet | `deploy/host/docker-compose.yml` |
| **API Code** | ✓ Fertig | `apps/api/` |
| **Frontend Code** | ✓ Fertig | `apps/web/` |
| **Deployment Guide** | ✓ Fertig | `API-DEPLOYMENT-GUIDE.md` |
| **Quick Fix** | ✓ Fertig | `QUICK-FIX.md` |
| **Deployment Script** | ✓ Fertig | `deploy-complete.sh` |

---

## 🎯 Schnellstart für VPS (3 Schritte)

### SCHRITT 1: Auf deinem Lokalen Computer (5 Minuten)

```bash
# Gehe zum Projekt
cd PuQ.me

# Kopiere die Produktions-Config
cp .env.production.api deploy/host/.env

# Fülle die Secrets ein:
nano deploy/host/.env
# Bearbeite:
# POSTGRES_PASSWORD=dein-starkes-passwort
# S3_ACCESS_KEY=dein-idrive-key
# S3_SECRET_KEY=dein-idrive-secret
```

### SCHRITT 2: VPS Vorbereitung (5 Minuten)

```bash
# SSH in deinen VPS
ssh root@your-vps-ip

# Docker installieren (falls noch nicht)
apt-get update && apt-get install -y docker.io docker-compose

# Repository clonen
git clone <your-repo-url> /opt/puqme
cd /opt/puqme
```

### SCHRITT 3: Deployment (2 Minuten)

```bash
# Kopiere die vorbereitete Config vom lokalen Computer
# (von deinem lokalen Computer aus)
scp deploy/host/.env root@your-vps-ip:/opt/puqme/deploy/host/.env

# SSH zurück in VPS
ssh root@your-vps-ip
cd /opt/puqme/deploy/host

# Deploy!
docker-compose pull
docker-compose up -d

# Status überprüfen
docker-compose ps
```

---

## ✅ Verifikations-Checklist

Nach dem Deployment **diese Tests machen**:

```bash
# 1️⃣  Health Check
curl https://api.puq.me/health

# Sollte NICHT 404 sein!
# Sollte zurückgeben: {"status":"ok",...}


# 2️⃣  User Registration
curl -X POST https://api.puq.me/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testuser@example.com",
    "password":"Test12345!",
    "name":"Test User"
  }'

# Sollte 200 oder 400 sein, NICHT 404


# 3️⃣  Frontend Check
# Öffne https://puq.me im Browser
# - Login-Seite sollte laden
# - Registrierung sollte möglich sein
# - KEINE Demo-Daten! ECHTE Daten!


# 4️⃣  Logs überprüfen (falls Fehler)
docker-compose logs api
docker-compose logs postgres
docker-compose logs redis
```

---

## 🔑 Erforderliche Informationen für Deployment

### IDrive e2 Credentials (von deinem Account)

1. Gehe zu: https://www.idrive.com/e2/
2. Öffne: Account Settings → Access Keys
3. Kopiere:
   - **S3_ACCESS_KEY** = `Your Access Key`
   - **S3_SECRET_KEY** = `Your Secret Key`

### PostgreSQL Password (du wählst)

```bash
# Wähle ein starkes Passwort und trage es hier ein:
POSTGRES_PASSWORD=Dein_Starkes_Passwort_123!
```

### Cloudflare Routing (prüfen)

- `api.puq.me` → deine VPS IP
- `www.puq.me` → Cloudflare (Frontend)
- `cdn.puq.me` → IDrive e2

---

## 📋 Was wird deployed?

```
VPS / Dedicated Host
├── PostgreSQL (Datenbank)
│   ├── Users, Profiles, Matches
│   ├── Messages, Chat Data
│   └── Session Storage
│
├── Redis (Cache & Sessions)
│   ├── User Sessions
│   ├── Rate Limiting
│   └── Real-time Data
│
└── Fastify API Server
    ├── POST /v1/auth/register (User Registration)
    ├── POST /v1/auth/login (Login)
    ├── GET /v1/profiles/me (User Profile)
    ├── GET /v1/match (Matching)
    ├── POST /v1/match/swipe (Swipe)
    ├── GET /v1/chat (Messages)
    └── ... weitere 20+ Endpoints
```

---

## 🧪 Test-Befehle (nach Deploy)

### Lokaler Test (VPS Terminal)

```bash
# Terminal 1: Logs live sehen
docker-compose logs -f api

# Terminal 2: API testen
docker-compose exec postgres psql -U puqme -c "SELECT version();"
docker-compose exec redis redis-cli PING
curl http://localhost:3000/health
```

### Remote Test (von überall)

```bash
# Health Check
curl https://api.puq.me/health

# Profile Endpoint (needs auth token)
curl https://api.puq.me/v1/profiles/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Chat Endpoint
curl https://api.puq.me/v1/chat
```

---

## 🚨 Troubleshooting

### Problem: API gibt immer noch 404

**Lösung:**
```bash
# Überprüfe ob DEV_MOCK_MODE=false ist
docker-compose exec api sh -c 'echo $DEV_MOCK_MODE'
# Sollte: false zurückgeben

# Logs ansehen
docker-compose logs api | head -50

# Neustarten
docker-compose restart api
docker-compose logs -f api
```

### Problem: PostgreSQL Connection Error

```bash
# Überprüfe Database
docker-compose exec postgres psql -U puqme -c "SELECT 1;"

# Überprüfe .env
grep DATABASE_URL deploy/host/.env
# Sollte: postgresql://puqme:PASSWORD@postgres:5432/puqme
```

### Problem: S3 Authentication Failed

```bash
# Überprüfe Credentials in .env
grep S3_ deploy/host/.env

# Teste S3 Connection (optional)
# (braucht aws-cli installiert)
aws s3 ls --endpoint-url https://storage.idrivee2-7.com
```

---

## 📝 Environment Variables Reference

| Variable | Wert | Quelle |
|----------|------|--------|
| `NODE_ENV` | `production` | ✓ Vorgegeben |
| `DEV_MOCK_MODE` | `false` | ✓ Vorgegeben |
| `PORT` | `3000` | ✓ Vorgegeben |
| `APP_ORIGIN` | `https://puq.me` | ✓ Vorgegeben |
| `DATABASE_URL` | `postgresql://puqme:PASSWORD@postgres:5432/puqme` | ✓ Vorgegeben |
| `REDIS_URL` | `redis://redis:6379` | ✓ Vorgegeben |
| `JWT_SECRET` | (32 Zeichen, generiert) | ✓ Vorgegeben |
| `JWT_REFRESH_SECRET` | (32 Zeichen, generiert) | ✓ Vorgegeben |
| `S3_ENDPOINT` | `https://storage.idrivee2-7.com` | ✓ Vorgegeben |
| `S3_REGION` | `auto` | ✓ Vorgegeben |
| `S3_BUCKET` | `puq-images` | ✓ Vorgegeben |
| `S3_ACCESS_KEY` | ⚠️ **DU MUSST AUSFÜLLEN** | IDrive e2 |
| `S3_SECRET_KEY` | ⚠️ **DU MUSST AUSFÜLLEN** | IDrive e2 |
| `S3_PUBLIC_BASE_URL` | `https://cdn.puq.me` | ✓ Vorgegeben |
| `POSTGRES_PASSWORD` | ⚠️ **DU MUSST AUSFÜLLEN** | Du wählst |
| `GOOGLE_CLIENT_ID` | (bereits konfiguriert) | ✓ Vorgegeben |

---

## ⏱️ Zeitlinie

| Schritt | Zeit | Status |
|---------|------|--------|
| 1. Local Setup (.env ausfüllen) | 5 Min | 🟡 Du musst machen |
| 2. VPS Vorbereitung | 5 Min | 🟡 Du musst machen |
| 3. Docker Deployment | 2 Min | 🟡 Du musst machen |
| 4. Services Health Checks | 5 Min | 🟡 Du musst machen |
| 5. Verifikation & Testing | 10 Min | 🟡 Du musst machen |
| **GESAMT** | **~30 Min** | **🟡** |

---

## ✨ Nach erfolgreichem Deploy

### Alles funktioniert ✅

```bash
# Health endpoint gibt ok zurück
curl https://api.puq.me/health
→ {"status":"ok","version":"0.1.0",...}

# User Registration funktioniert
curl -X POST https://api.puq.me/v1/auth/register
→ Nicht 404!

# Frontend zeigt echte Daten
https://puq.me öffnen
→ Real user data, keine Demo-Daten
```

---

## 📞 Support & Nächste Schritte

### Wenn etwas nicht funktioniert

1. Logs ansehen: `docker-compose logs -f`
2. Lies `API-DEPLOYMENT-GUIDE.md`
3. Überprüfe `deploy/host/.env` (alle Werte korrekt?)
4. Starte neu: `docker-compose restart api`

### Monitoring & Maintenance

```bash
# Regelmäßig prüfen
docker-compose ps

# Logs archivieren
docker-compose logs api > api-$(date +%Y%m%d).log

# Backup der Datenbank
docker-compose exec postgres pg_dump -U puqme puqme > backup.sql

# Updates einspielen
git pull
docker-compose pull
docker-compose up -d
```

---

## ✅ Deployment Readiness Checklist

Vor dem Deployment **alle abhaken**:

- [ ] VPS mit 2GB+ RAM bereit
- [ ] Docker & Docker Compose installiert
- [ ] `.env.production.api` → `deploy/host/.env` kopiert
- [ ] S3_ACCESS_KEY ausgefüllt
- [ ] S3_SECRET_KEY ausgefüllt
- [ ] POSTGRES_PASSWORD ausgefüllt
- [ ] Cloudflare DNS configured (api.puq.me → VPS IP)
- [ ] SSL/TLS Zertifikat bereit oder auto-generated

**DANN:**

```bash
cd deploy/host
docker-compose up -d
```

---

## 🎉 Erfolg!

Wenn du das durchmachst, laufen folgende Services:

1. ✅ **PostgreSQL** - Alle user/profile/match Daten
2. ✅ **Redis** - Session Cache & Rate Limiting
3. ✅ **Fastify API** - Alle 20+ REST Endpoints
4. ✅ **Frontend** - puq.me zeigt ECHTE (nicht Fake) Daten
5. ✅ **Real-time Features** - Chat, Swipes, Matches funktionieren

**Das Projekt ist 100% produktionsreif!** 🚀

---

**Letzte Aktualisierung**: 2026-03-19
**Bereit zum Deployment**: JA ✅
