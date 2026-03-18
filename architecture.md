# puq.me — DevOps Architecture

> Setup date: 2026-03-17
> Status: Active (NS propagation in progress — expect full activation within 24 h)

---

## Stack Overview

```
User
 │
 ▼
Cloudflare (Edge / CDN / WAF)
 │
 ├─ puq.me  ──────────────► Cloudflare Pages  ◄── GitHub (PuqMe/puq-me)
 ├─ www.puq.me ───────────► Cloudflare Pages
 │
 └─ assets.puq.me ────────► Cloudflare Worker (puq-me-assets)
                                   │
                                   ▼ (AWS4 signed)
                             IDrive e2 (S3-compatible)
                             Bucket: assets
                             Region: us-west-1 (Oregon)
                             Endpoint: s3.us-west-1.idrivee2.com
```

---

## Components

### 1. Domain Registrar — do.de
- Domain: `puq.me`
- Nameservers delegated to Cloudflare:
  - `coraline.ns.cloudflare.com`
  - `damiete.ns.cloudflare.com`

### 2. DNS & Edge — Cloudflare (Free Plan)
Zone ID: `ed60380c047998ae24136c507b592be5`

#### DNS Records

| Name | Type | Content | Proxied |
|------|------|---------|---------|
| `puq.me` | CNAME | `puq-me.pages.dev` | ✅ Yes (flattened) |
| `www.puq.me` | CNAME | `puq-me.pages.dev` | ✅ Yes |
| `assets.puq.me` | CNAME | `puq-me.pages.dev` | ✅ Yes (intercepted by Worker) |

> Note: Pre-existing MX, TXT (SPF, DKIM, DMARC), and Google verification records were preserved.

#### Security & Performance Settings
| Setting | Value |
|---------|-------|
| SSL/TLS mode | Full |
| Always HTTPS | On |
| Automatic HTTPS Rewrites | On |
| Min TLS Version | TLS 1.2 |
| HSTS | Enabled (max-age 1y, includeSubDomains, preload) |
| Brotli compression | On |
| Cache level | Aggressive |
| Browser cache TTL | 4 hours |
| Minify (HTML/CSS/JS) | On |
| Rocket Loader | On |

### 3. Code Repository — GitHub
- Org: `PuqMe`
- Repo: `https://github.com/PuqMe/puq-me`
- Branch: `main`
- Connected to Cloudflare Pages via API

### 4. Static Site Hosting — Cloudflare Pages
- Project: `puq-me`
- Production URL: `https://puq-me.pages.dev`
- Custom domains: `puq.me`, `www.puq.me`
- Auto-deploys on every push to `main`
- Latest deployment: `391e3aa4` ✅ Success

### 5. Asset Storage — IDrive e2
- Plan: Free (10 GB)
- Bucket: `assets`
- Region: `us-west-1` (Oregon)
- S3 Endpoint: `s3.us-west-1.idrivee2.com`
- Access: Private (authenticated via Worker)
- Access Key Name: `cloudflare-worker`

### 6. Asset Proxy — Cloudflare Worker
- Worker name: `puq-me-assets`
- Route: `assets.puq.me/*`
- Secrets: `S3_ACCESS_KEY`, `S3_SECRET_KEY` (stored as encrypted secrets)
- Signing: AWS Signature Version 4 (HMAC-SHA256)
- Adds headers: `Cache-Control: public, max-age=86400`, `Access-Control-Allow-Origin: *`

**Request flow for `https://assets.puq.me/images/logo.png`:**
```
Browser → Cloudflare Edge (assets.puq.me)
       → Worker intercepts → signs request with AWS4
       → Fetches https://s3.us-west-1.idrivee2.com/assets/images/logo.png
       → Returns response with caching headers → Browser caches for 24h
```

---

## Deployment Guide

### Upload an asset
Using the IDrive e2 console at https://console.idrivee2.com/region/OR/buckets/assets/object-storage
or via AWS CLI:
```bash
aws s3 cp ./my-image.jpg s3://assets/images/my-image.jpg \
  --endpoint-url https://s3.us-west-1.idrivee2.com \
  --region us-west-1
```
Then access it at: `https://assets.puq.me/images/my-image.jpg`

### Deploy a site update
```bash
git push origin main
# Cloudflare Pages auto-builds and deploys within ~1 minute
```

---

## NS Propagation Status
- do.de submitted NS update on 2026-03-17
- Cloudflare zone status: `pending` → will become `active` once DENIC propagates (up to 24h)
- Once active: `puq.me` and `www.puq.me` will resolve correctly globally
- `assets.puq.me` Worker route is configured and will activate simultaneously

---

## Estimated Monthly Cost
| Service | Cost |
|---------|------|
| do.de domain renewal | ~€5/year |
| Cloudflare (DNS, CDN, WAF, Pages, Workers) | Free |
| IDrive e2 (10 GB storage) | Free |
| **Total** | **~€0.42/month** |
