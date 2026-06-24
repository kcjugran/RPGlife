// Service worker — network-first for app code, cache-first for static assets.
// Bump CACHE_NAME any time you deploy code changes to evict the old cache.
const CACHE_NAME = 'rpglife-v36';

// Static assets we precache aggressively
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

// Files where we want fresh code first (fall back to cache only if offline).
// These get network-first treatment so users always see the latest after deploy.
const NETWORK_FIRST = [
  './app.js',
  './sync.js',
  './icons.js',
  './firebase-config.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isNetworkFirst(url) {
  return NETWORK_FIRST.some(path => url.pathname.endsWith(path.replace('./', '/')) || url.pathname.endsWith(path.replace('./', '')));
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Don't try to cache cross-origin (e.g. Firebase CDN) — let the browser handle it
  if (url.origin !== self.location.origin) return;

  if (isNetworkFirst(url)) {
    // Network-first: try fresh, update cache, fall back to cache on failure
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        }
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
