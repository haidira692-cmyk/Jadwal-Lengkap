const CACHE_NAME = 'imsakiyah-pro-v5.3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './jadwal.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/fuse.js@6.6.2',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Fetching Assets dari Cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
