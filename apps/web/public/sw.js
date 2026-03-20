const CACHE_NAME = "puqme-shell-v4";
const PAGES_CACHE_NAME = "puqme-pages-v2";
const STATIC_URLS = ["/manifest.webmanifest", "/icon.svg", "/icon-192.png", "/apple-icon.png"];
const SEO_PAGES = ["/", "/login", "/register", "/nearby", "/smart-match", "/groups"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_URLS)),
      caches.open(PAGES_CACHE_NAME).then((cache) => cache.addAll(SEO_PAGES))
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME && key !== PAGES_CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isNavigationRequest(request) {
  return request.mode === "navigate";
}

function isApiRequest(request) {
  return request.url.includes("/api/");
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  return /\.(js|css|png|svg|woff2)$/.test(pathname);
}

// Network-first for navigation (prevents stale cache from blocking updates)
async function networkFirstNavigation(request) {
  const cache = await caches.open(PAGES_CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response("Offline", { status: 503, statusText: "Service Unavailable" });
  }
}

// Cache-first for static assets
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response("Offline - Resource not available", {
      status: 503,
      statusText: "Service Unavailable"
    });
  }
}

// Network-first with 5s timeout for API
async function networkFirstWithTimeout(request, timeoutMs = 5000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/* ── Push notifications ── */
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "PuQ.me", body: event.data.text() };
  }

  const title = payload.title || "PuQ.me";
  const options = {
    body: payload.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: payload.tag || "puqme-notification",
    data: payload.data || {},
    actions: payload.actions || [],
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes("puq.me"));
      if (existing) {
        existing.focus();
        existing.navigate(url);
      } else {
        self.clients.openWindow(url);
      }
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Navigation requests: network-first (always show latest version)
  if (isNavigationRequest(event.request)) {
    event.respondWith(networkFirstNavigation(event.request));
    return;
  }

  // API requests: network-first with 5s timeout
  if (isApiRequest(event.request)) {
    event.respondWith(networkFirstWithTimeout(event.request, 5000));
    return;
  }

  // Static assets: cache-first
  if (isStaticAsset(event.request)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Everything else: network-first
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.ok) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
      }
      return response;
    }).catch(() =>
      caches.match(event.request).then((cached) => cached || new Response("Offline", { status: 503 }))
    )
  );
});
