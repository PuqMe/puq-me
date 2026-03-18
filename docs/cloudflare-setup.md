# Cloudflare Setup For `puq.me`

Use Cloudflare Free for:

- DNS management
- proxied TLS termination
- CDN edge delivery
- Web deployment with Wrangler for the `PuQ.me` frontend

Main deployment split:

- `puq.me` -> Cloudflare deployed web app
- `api.puq.me` -> main compute host
- `ws.puq.me` -> main compute host
- `cdn.puq.me` -> Cloudflare-proxied IDrive e2 hostname

DNS records:

- `puq.me` managed by Cloudflare web deploy via Wrangler
- `A api.puq.me -> backend/main compute host origin`
- `A ws.puq.me -> websocket/main compute host origin`
- `CNAME cdn.puq.me -> IDrive E2 origin host`

Enable for all public records:

- proxied orange cloud
- SSL/TLS Full (strict)
- HTTP/3
- Always Use HTTPS
- Bot Fight Mode or Super Bot Fight Mode

WAF recommendations:

- Managed Ruleset enabled
- block obvious admin path probes
- JS challenge on suspicious countries if abuse spikes

Rate limiting:

- `/v1/auth/login` strict
- `/upload/*` strict by IP + JWT user
- `/ws` connection burst caps

Cache rules:

- cache everything for `/images/*`
- cache everything for `/media/*`
- cache everything for `/avatars/*`
- bypass cache for `/api/*`

Wrangler:

- frontend config lives in [`apps/web/wrangler.jsonc`](/Users/abest/Library/CloudStorage/GoogleDrive-a17023373371@gmail.com/Meine%20Ablage/03.%20Akdeniz.Group/-%20con.ax/-%20puq.me/3.3.26%20PuQ.me/PuQ.me/apps/web/wrangler.jsonc)
- GitHub deploy workflow lives in [`.github/workflows/deploy-web-cloudflare.yml`](/Users/abest/Library/CloudStorage/GoogleDrive-a17023373371@gmail.com/Meine%20Ablage/03.%20Akdeniz.Group/-%20con.ax/-%20puq.me/3.3.26%20PuQ.me/PuQ.me/.github/workflows/deploy-web-cloudflare.yml)
- required GitHub secrets:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`
  - `NEXT_PUBLIC_API_BASE_URL`
  - `NEXT_PUBLIC_WS_BASE_URL`

Headers to preserve:

- `CF-Connecting-IP`
- `X-Forwarded-For`
- `CF-Ray`
