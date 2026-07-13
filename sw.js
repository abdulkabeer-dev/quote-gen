const CACHE_NAME = 'devi-ads-v3';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/variables.css',
  './css/main.css',
  './css/invoice.css',
  './css/print.css',
  './js/utils.js',
  './js/notes.js',
  './js/signature.js',
  './js/table.js',
  './js/tax.js',
  './js/form.js',
  './js/preview.js',
  './js/pdf.js',
  './js/whatsapp.js',
  './js/reference.js',
  './js/app.js',
  './images/logo.jpg',
  './images/signature.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// Install: precache the core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Serve from cache, fallback to network. For fonts/CDNs, dynamically cache them.
self.addEventListener('fetch', (event) => {
  // Avoid caching non-HTTP(S) schemes (like chrome-extension://, file://, upi://)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // If response is valid, cache it dynamically for dynamic assets (e.g. google fonts, QR code API)
        if (response && response.status === 200) {
          const url = event.request.url;
          const isGoogleFont = url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com');
          const isQrApi = url.includes('api.qrserver.com');
          
          if (isGoogleFont || isQrApi) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
        }
        return response;
      }).catch((err) => {
        console.error('Fetch failed offline:', err);
      });
    })
  );
});
