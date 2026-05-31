// MT Empresarial PWA service worker.
// Precaches the app shell + screen fragments; serves them offline.
const VERSION = "mt-v2";
const CORE = `core-${VERSION}`;
const RUNTIME = `runtime-${VERSION}`;

const SCREENS = [
  "splash_screen", "role_selection", "user_home", "request_transportation",
  "my_services", "service_detail", "notifications_center", "active_service",
  "driver_dashboard", "driver_management", "assignment_center",
  "dispatcher_dashboard", "fleet_management", "operations_map",
].map((s) => `screens/${s}.html`);

const CORE_ASSETS = [
  "./", "index.html", "app.js", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png",
  "icons/icon-maskable-512.png", "icons/apple-touch-icon.png", "icons/logo.png",
  ...SCREENS,
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CORE).then((c) => c.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CORE && k !== RUNTIME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // SPA navigations -> always serve the cached shell.
  if (req.mode === "navigate") {
    e.respondWith(
      caches.match("index.html").then((r) => r || fetch(req).catch(() => caches.match("./")))
    );
    return;
  }

  // Same-origin assets: stale-while-revalidate.
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then((cached) => {
        const net = fetch(req).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CORE).then((c) => c.put(req, copy));
          }
          return res;
        }).catch(() => cached);
        return cached || net;
      })
    );
    return;
  }

  // Cross-origin (Tailwind CDN, Google Fonts, remote images): cache opportunistically.
  e.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req).then((res) => {
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
