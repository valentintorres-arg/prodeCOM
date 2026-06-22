const CACHE = "prode-com-v2";

const PRECACHE = [
  "/icon.svg",
  "/icon-maskable.svg",
];

// Install: pre-cache only static assets (not pages — they have live data)
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.allSettled(PRECACHE.map((url) => c.add(url).catch(() => null)))
    )
  );
  self.skipWaiting();
});

// Activate: clear old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // API routes: always network, no cache
  if (url.pathname.startsWith("/api/")) return;

  // Static chunks & assets: cache-first
  if (url.pathname.startsWith("/_next/static/") || url.pathname.match(/\.(svg|png|ico|woff2?)$/)) {
    e.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(CACHE).then((c) => c.put(request, clone));
            }
            return res;
          })
      )
    );
    return;
  }

  // Pages: network-first (always fetch fresh — data changes after every match)
  e.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          caches.open(CACHE).then((c) => c.put(request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});
