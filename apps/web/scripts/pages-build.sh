#!/bin/bash
set -e

echo "=== Building with OpenNext ==="
npx @opennextjs/cloudflare build

echo "=== Copying static assets to build output root ==="
# OpenNext puts static assets in .open-next/assets/
# Cloudflare Pages serves static files from the build output root
# We need to copy them so Pages can serve /_next/static/* directly
if [ -d ".open-next/assets" ]; then
  cp -r .open-next/assets/* .open-next/
  echo "Static assets copied successfully"
else
  echo "WARNING: .open-next/assets directory not found!"
fi

echo "=== Creating _routes.json for Pages routing ==="
# Tell Cloudflare Pages to serve static assets directly
# and only route dynamic requests through the Worker
cat > .open-next/_routes.json << 'ROUTES'
{
  "version": 1,
  "include": ["/*"],
  "exclude": [
    "/_next/static/*",
    "/favicon.ico",
    "/manifest.json",
    "/sw.js",
    "/icons/*",
    "/_headers",
    "/robots.txt",
    "/sitemap.xml"
  ]
}
ROUTES
echo "_routes.json created"

echo "=== Creating _worker.js wrapper ==="
# Cloudflare Pages requires _worker.js for advanced mode
# OpenNext produces worker.js, so we create a wrapper
cat > .open-next/_worker.js << 'WORKER'
export { default } from "./worker.js";
export * from "./worker.js";
WORKER
echo "_worker.js wrapper created"

echo "=== Build complete ==="
ls -la .open-next/_worker.js .open-next/_routes.json
echo "=== Asset structure ==="
ls .open-next/ | head -20
