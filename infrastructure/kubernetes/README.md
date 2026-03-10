# Kubernetes Layout

Primary manifests live under:

- [`/Users/abest/Projekte/PuQ.me/infrastructure/kubernetes/base`](/Users/abest/Projekte/PuQ.me/infrastructure/kubernetes/base)
- [`/Users/abest/Projekte/PuQ.me/infrastructure/kubernetes/overlays/staging`](/Users/abest/Projekte/PuQ.me/infrastructure/kubernetes/overlays/staging)
- [`/Users/abest/Projekte/PuQ.me/infrastructure/kubernetes/overlays/production`](/Users/abest/Projekte/PuQ.me/infrastructure/kubernetes/overlays/production)

External managed services expected:

- PostgreSQL
- Redis
- IDrive E2
- Cloudflare in front of ingress
