# Cloudflare Setup For `puq.me`

DNS records:

- `A puq.me -> frontend/load balancer origin`
- `A api.puq.me -> backend/load balancer origin`
- `A ws.puq.me -> websocket/load balancer origin`
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

Headers to preserve:

- `CF-Connecting-IP`
- `X-Forwarded-For`
- `CF-Ray`
