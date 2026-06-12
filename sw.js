const CACHE_NAME = 'rpglife-v2';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './icons.js',
  './sync.js',
  './firebase-config.js',
  './manifest.json',
  './vendor/react.production.min.js',
  './vendor/react-dom.production.min.js',
  './vendor/firebase-app.js',
  './vendor/firebase-auth.js',
  './vendor/firebase-firestore.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // cache same-origin responses for next time
        if (response && response.status === 200 && response.type === 'basic') {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
