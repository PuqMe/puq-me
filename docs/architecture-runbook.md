# PuQ.me — Full Architecture Runbook

## Architecture Diagram

```text
                          ┌──────────────────────────────────────────────┐
                          │              CLOUDFLARE  (free)              │
                          │  authoritative DNS · proxy · TLS · cache    │
                          │                                              │
                          │  puq.me ─────────┐                          │
                          │  www.puq.me ──────┤  Cloudflare Worker      │
                          │                   │  (Wrangler / OpenNext)  │
                          │  staging.puq.me ──┘                          │
                          │                                              │
                          │  api.puq.me ──────┐                          │
                          │  ws.puq.me ───────┤  Main Compute Host     │
                          │  admin.puq.me ────┘  (Docker Compose)       │
                          │                                              │
                          │  cdn.puq.me ──────── IDrive e2 (S3)         │
                          └──────────────────────────────────────────────┘

           ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
           │   GitHub         │         │  Compute Host    │         │  IDrive e2       │
           │                  │         │                  │         │                  │
           │  PuqMe/puq-me   │         │  Fastify API     │         │  puq-images      │
           │                  │         │  WebSocket       │         │  puq-avatars     │
           │  CI/CD:          │         │  PostgreSQL      │         │  puq-chat-media  │
           │   deploy-web ────┼──push──>│  Redis           │         │  puq-backups     │
           │   deploy-backend─┼──SSH──> │                  │         │                  │
           └──────────────────┘         └──────────────────┘         └──────────────────┘
```

### Data Flow

```text
Browser request
  │
  ├── puq.me / www.puq.me ──> Cloudflare proxy ──> Worker (OpenNext SSR)
  │
  ├── api.puq.me ────────────> Cloudflare proxy ──> Compute Host :3001 (Fastify)
  │
  ├── ws.puq.me ─────────────> Cloudflare proxy ──> Compute Host :3002 (WebSocket)
  │
  ├── admin.puq.me ──────────> Cloudflare proxy ──> Compute Host :3003 (Admin)
  │
  └── cdn.puq.me/avatars/… ──> Cloudflare proxy ──> cdn-worker ──> IDrive e2
                                     │
                                     └── CF cache (HIT → serve from edge)
```

### Upload Flow

```text
Client ──POST──> api.puq.me/v1/media/…/upload-intent
                    │
                    └── API returns signed S3 URL
                         │
Client ──PUT──> signed IDrive e2 URL (direct upload)
                    │
                    └── API confirms + moderates
                         │
Public delivery ──> cdn.puq.me/<path>  (only after approval)
```

---

## 1. Domain → Cloudflare

### Step-by-step

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com), click **Add a Site**, enter `puq.me`, select the **Free** plan.
2. Cloudflare scans existing DNS and assigns two nameservers, for example:
   - `anna.ns.cloudflare.com`
   - `tim.ns.cloudflare.com`
3. Log in to [do.de](https://www.do.de) domain panel for `puq.me`.
4. Replace the current nameservers with the two Cloudflare nameservers.
5. Wait for propagation (usually 5–60 minutes, can take up to 24 hours).
6. In Cloudflare, click **Check nameservers now**. Status will change from "Pending" to **Active**.

### Verification

```bash
dig NS puq.me +short
# should return the two Cloudflare nameservers

dig SOA puq.me +short
# SOA should reference cloudflare.com
```

---

## 2. DNS Records (Cloudflare)

All records below should have the **orange cloud (Proxied)** enabled.

| Type  | Name          | Content / Target                              | Proxy | TTL  | Notes                              |
|-------|---------------|-----------------------------------------------|-------|------|------------------------------------|
| CNAME | `@` (puq.me)  | Managed by Wrangler (auto-created)            | On    | Auto | Worker custom domain               |
| CNAME | `www`         | `puq.me`                                      | On    | Auto | Redirect or mirror to apex         |
| A     | `api`         | `<COMPUTE_HOST_IP>`                           | On    | Auto | Fastify API                        |
| A     | `ws`          | `<COMPUTE_HOST_IP>`                           | On    | Auto | WebSocket server                   |
| A     | `admin`       | `<COMPUTE_HOST_IP>`                           | On    | Auto | Admin panel                        |
| CNAME | `cdn`         | `<IDRIVE_E2_BUCKET>.storage.idrivee2-7.com`   | On    | Auto | Asset delivery via e2              |
| CNAME | `staging`     | Managed by Wrangler (staging env)             | On    | Auto | Staging web frontend               |
| A     | `api-staging` | `<COMPUTE_HOST_IP>`                           | On    | Auto | Staging API                        |
| A     | `ws-staging`  | `<COMPUTE_HOST_IP>`                           | On    | Auto | Staging WebSocket                  |
| A     | `admin-staging`| `<COMPUTE_HOST_IP>`                          | On    | Auto | Staging Admin                      |

### Important DNS Notes

- The `@` and `staging` records are managed automatically when you run `wrangler deploy` with custom domains configured. You can also add them manually as CNAME records pointing to `puqme-web.workers.dev` / `puqme-web-staging.workers.dev`.
- The `cdn` CNAME target should be your IDrive e2 bucket public hostname. IDrive e2 endpoints follow the pattern `<bucket>.storage.idrivee2-<N>.com`. Replace `<N>` with your assigned IDrive region number.
- **Do not use a wildcard (`*`) CNAME.** Wildcard records would route unknown subdomains to e2, creating security and routing issues. Use explicit `cdn` subdomain instead.

---

## 3. Cloudflare SSL / TLS Settings

| Setting                  | Value              |
|--------------------------|--------------------|
| SSL/TLS encryption mode  | **Full (strict)**  |
| Always Use HTTPS         | On                 |
| HTTP Strict Transport Security (HSTS) | Enabled, max-age 6 months |
| Minimum TLS Version      | 1.2                |
| TLS 1.3                  | On                 |
| Automatic HTTPS Rewrites | On                 |
| Opportunistic Encryption | On                 |

For **Full (strict)** to work, the compute host must serve a valid certificate. Options:
- Use a **Cloudflare Origin Certificate** (free, 15-year validity, trusted only by Cloudflare proxy).
- Use a Let's Encrypt certificate on the host.

---

## 4. GitHub → Cloudflare (Web Frontend)

### How It Works Now

Your project already uses **Cloudflare Workers** (not Pages) via Wrangler and OpenNext. The workflow file `.github/workflows/deploy-web-cloudflare.yml` handles everything:

1. Push to `main` → builds Next.js with `@opennextjs/cloudflare` → deploys as `puqme-web` (production).
2. Push to `staging` → deploys as `puqme-web-staging`.

### Required GitHub Secrets

| Secret                      | Value                                          |
|-----------------------------|------------------------------------------------|
| `CLOUDFLARE_API_TOKEN`      | API token with Workers/Pages edit permission   |
| `CLOUDFLARE_ACCOUNT_ID`     | Your Cloudflare account ID                     |
| `NEXT_PUBLIC_API_BASE_URL`  | `https://api.puq.me` (prod) / `https://api-staging.puq.me` (staging) |
| `NEXT_PUBLIC_WS_BASE_URL`   | `wss://ws.puq.me` (prod) / `wss://ws-staging.puq.me` (staging) |

### Custom Domain Binding

Add to `wrangler.jsonc` under the production env to bind `puq.me` and `www.puq.me`:

```jsonc
{
  "env": {
    "production": {
      "name": "puqme-web",
      "routes": [
        { "pattern": "puq.me", "custom_domain": true },
        { "pattern": "www.puq.me", "custom_domain": true }
      ],
      "vars": {
        "NEXT_PUBLIC_APP_ENV": "production"
      }
    },
    "staging": {
      "name": "puqme-web-staging",
      "routes": [
        { "pattern": "staging.puq.me", "custom_domain": true }
      ],
      "vars": {
        "NEXT_PUBLIC_APP_ENV": "staging"
      }
    }
  }
}
```

After deploying with `wrangler deploy --env production`, Cloudflare will automatically create the DNS records for `puq.me` and `www.puq.me`.

### Backend Deployment

The backend deploys separately via `.github/workflows/deploy-backend-host.yml`:
- Push to `main` or `staging` triggers SSH deployment to the compute host.
- Pulls latest Docker images and restarts via `docker compose`.

---

## 5. IDrive e2 (S3 Storage) Setup

### Buckets

| Bucket            | Purpose                              |
|-------------------|--------------------------------------|
| `puq-images`      | Profile photos, uploaded images      |
| `puq-avatars`     | User avatars                         |
| `puq-chat-media`  | Chat attachments, photos, videos     |
| `puq-backups`     | PostgreSQL dumps, media backups      |

### Bucket Configuration

**CORS** — apply to `puq-images`, `puq-avatars`, `puq-chat-media`:

```json
[
  {
    "AllowedOrigins": [
      "https://puq.me",
      "https://staging.puq.me",
      "http://localhost:3001"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
    "MaxAgeSeconds": 3600
  }
]
```

**Lifecycle** — apply to all buckets:

```json
{
  "Rules": [
    {
      "ID": "abort-incomplete-multipart-uploads",
      "Status": "Enabled",
      "AbortIncompleteMultipartUpload": { "DaysAfterInitiation": 3 },
      "Filter": { "Prefix": "" }
    },
    {
      "ID": "expire-temporary-chat-uploads",
      "Status": "Enabled",
      "Expiration": { "Days": 30 },
      "Filter": { "Prefix": "chat/tmp/" }
    }
  ]
}
```

Apply with the AWS CLI (configured for IDrive e2):

```bash
# Configure AWS CLI for IDrive e2
aws configure set aws_access_key_id     "$IDRIVE_E2_ACCESS_KEY"
aws configure set aws_secret_access_key "$IDRIVE_E2_SECRET_KEY"
aws configure set default.region        "e2-7"

E2="https://storage.idrivee2-7.com"

# Apply CORS
for bucket in puq-images puq-avatars puq-chat-media; do
  aws s3api put-bucket-cors \
    --endpoint-url "$E2" \
    --bucket "$bucket" \
    --cors-configuration file://storage/idrive-e2-config/cors.json
done

# Apply lifecycle
for bucket in puq-images puq-avatars puq-chat-media puq-backups; do
  aws s3api put-bucket-lifecycle-configuration \
    --endpoint-url "$E2" \
    --bucket "$bucket" \
    --lifecycle-configuration file://storage/idrive-e2-config/lifecycle.json
done
```

### Security Rules

- All buckets remain **private** (no public ACLs).
- Uploads happen only via **pre-signed URLs** generated by the API.
- Public reads go through `cdn.puq.me` (Cloudflare proxied), never the raw e2 endpoint.
- Pending / rejected uploads must not be publicly linked.

---

## 6. CDN Worker (cdn.puq.me → IDrive e2)

A lightweight Cloudflare Worker handles `cdn.puq.me` requests, adding caching headers and access control. This is **recommended over a plain CNAME** because it gives you:
- Custom cache TTLs per path
- Ability to block non-GET methods
- Rewrite/strip headers before they reach the origin
- Future flexibility (image resizing, signed URL validation, etc.)

### Worker Script: `cdn-worker.js`

See the separate file at `infrastructure/cloudflare/cdn-worker.js`.

### Wrangler Configuration: `infrastructure/cloudflare/wrangler-cdn.jsonc`

See the separate file at `infrastructure/cloudflare/wrangler-cdn.jsonc`.

### Deployment

```bash
cd infrastructure/cloudflare
npx wrangler deploy -c wrangler-cdn.jsonc --env production
```

Once deployed with the custom domain route, Cloudflare automatically creates the DNS record for `cdn.puq.me`.

---

## 7. Performance + Security (Cloudflare Free Plan)

### Caching Rules

Create these **Cache Rules** in Cloudflare Dashboard → Caching → Cache Rules:

| Rule Name          | Match                                         | Action             | Edge TTL |
|--------------------|-----------------------------------------------|--------------------|----------|
| CDN Assets         | Hostname = `cdn.puq.me`                       | Cache Everything   | 30 days  |
| Static Web Assets  | Hostname = `puq.me` AND path matches `/_next/static/*` | Cache Everything | 30 days |
| API Bypass         | Hostname = `api.puq.me`                       | Bypass Cache       | —        |
| WebSocket Bypass   | Hostname = `ws.puq.me`                        | Bypass Cache       | —        |

### Performance Settings

| Setting                    | Value   |
|----------------------------|---------|
| Brotli compression         | On      |
| HTTP/2                     | On      |
| HTTP/3 (QUIC)              | On      |
| Early Hints                | On      |
| 0-RTT Connection Resumption| On      |
| Rocket Loader              | Off (conflicts with Next.js) |

### WAF / Security Settings

| Setting                    | Value                     |
|----------------------------|---------------------------|
| Security Level             | Medium                    |
| Bot Fight Mode             | On                        |
| Challenge Passage          | 30 minutes                |
| Browser Integrity Check    | On                        |
| Hotlink Protection         | On (for cdn.puq.me)       |

### Recommended WAF Custom Rules (Free Tier)

1. **Block admin probes**: If URI path contains `/wp-admin` OR `/phpmyadmin` OR `/.env` → Block
2. **Challenge suspicious API traffic**: If URI path starts with `/v1/auth/` AND not from known ASNs → JS Challenge
3. **Rate limit logins**: Use the built-in rate limiting (1 rule on free plan) on `api.puq.me/v1/auth/login` — 10 requests per minute per IP

### WebSocket Configuration

For `ws.puq.me` to work through Cloudflare proxy:
- Cloudflare Free plan supports WebSocket passthrough on proxied records.
- No special configuration needed — just keep the orange cloud on.
- The `Upgrade: websocket` header is handled automatically.

---

## 8. Final Verification Checklist

### DNS Resolution

```bash
# Cloudflare is authoritative
dig NS puq.me +short
# → anna.ns.cloudflare.com. / tim.ns.cloudflare.com.

# All subdomains resolve through Cloudflare
for sub in "" www. api. ws. admin. cdn.; do
  echo -n "${sub}puq.me → "
  dig +short "${sub}puq.me" | head -1
done

# Verify Cloudflare proxy headers
curl -sI https://puq.me | grep -E "^(server|cf-ray)"
# → server: cloudflare
# → cf-ray: ...
```

### HTTPS on All Subdomains

```bash
for host in puq.me www.puq.me api.puq.me ws.puq.me admin.puq.me cdn.puq.me; do
  echo -n "$host: "
  curl -sI "https://$host" | head -1
done
# All should return HTTP/2 200 or 3xx
```

### GitHub → Cloudflare Deployment

```bash
# Trigger a web deploy
git commit --allow-empty -m "test: trigger web deploy"
git push origin main

# Check GitHub Actions
gh run list --workflow=deploy-web-cloudflare.yml --limit=1

# Verify the Worker is live
curl -sI https://puq.me | grep cf-ray
```

### Asset Delivery from IDrive e2

```bash
# Upload a test file
aws s3 cp test.jpg s3://puq-images/test/test.jpg \
  --endpoint-url https://storage.idrivee2-7.com

# Fetch through CDN
curl -sI https://cdn.puq.me/test/test.jpg | grep -E "(HTTP|cache-control|cf-cache)"
# Should show cache-control header and eventually cf-cache-status: HIT
```

### WebSocket Connectivity

```bash
# Quick WebSocket test (requires wscat or websocat)
wscat -c wss://ws.puq.me
# Should connect without TLS errors
```

---

## Complete DNS Record Summary

```text
TYPE   NAME            CONTENT                                    PROXY   TTL
────   ──────────────  ─────────────────────────────────────────  ──────  ────
CNAME  puq.me          (auto via Wrangler custom_domain)          On      Auto
CNAME  www             puq.me                                     On      Auto
A      api             <COMPUTE_HOST_IPv4>                        On      Auto
A      ws              <COMPUTE_HOST_IPv4>                        On      Auto
A      admin           <COMPUTE_HOST_IPv4>                        On      Auto
CNAME  cdn             <bucket>.storage.idrivee2-7.com            On      Auto
CNAME  staging         (auto via Wrangler custom_domain)          On      Auto
A      api-staging     <COMPUTE_HOST_IPv4>                        On      Auto
A      ws-staging      <COMPUTE_HOST_IPv4>                        On      Auto
A      admin-staging   <COMPUTE_HOST_IPv4>                        On      Auto
```

Replace `<COMPUTE_HOST_IPv4>` with your server's public IP address.
Replace `<bucket>.storage.idrivee2-7.com` with your IDrive e2 bucket endpoint.
