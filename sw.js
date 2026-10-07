/**
 * FRATERNITÃ€ SANTA MARIA DEGLI ANGELI - WWW.CONFRANCESCO.IT
 * Progressive Web App Service Worker
 * Offline Caching & Stale-While-Revalidate Update Engine
 */

const CACHE_VERSION = 'v1.1.0';
const CACHE_NAME = 'confrancesco-cache-' + CACHE_VERSION;

const CORE_ASSETS = [
  './',
  './index.html',
  './chi-siamo.html',
  './chi-siamo-il-carisma.html',
  './chi-siamo-la-nostra-storia.html',
  './chi-siamo-fratelli-in-cielo.html',
  './dove-siamo.html',
  './calendario-attivita.html',
  './media.html',
  './contatti.html',
  './manifest.webmanifest',
  './manifest.json',
  './favicon.ico',
  './assets/css/style.css',
  './assets/js/app.js',
  './assets/fonts/ComicNeue-Regular.ttf',
  './assets/fonts/ComicNeue-Bold.ttf',
  './assets/fonts/ComicNeue-Italic.ttf',
  './assets/fonts/ComicNeue-BoldItalic.ttf',
  './icons/apple-touch-icon.png',
  './icons/favicon-16x16.png',
  './icons/favicon-32x32.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-180x180.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-maskable-512x512.png',
  './assets/images/calendario-attivita_img_01.jpg',
  './assets/images/calendario-attivita_img_02.jpg',
  './assets/images/chi-siamo_fratelli-in-cielo_img_01.jpg',
  './assets/images/chi-siamo_fratelli-in-cielo_img_02.jpg',
  './assets/images/chi-siamo_fratelli-in-cielo_img_03.jpg',
  './assets/images/chi-siamo_fratelli-in-cielo_img_04.jpg',
  './assets/images/chi-siamo_il-carisma_img_01.jpg',
  './assets/images/chi-siamo_il-carisma_img_02.jpg',
  './assets/images/chi-siamo_il-carisma_img_03.jpg',
  './assets/images/chi-siamo_il-carisma_img_04.jpg',
  './assets/images/chi-siamo_il-carisma_img_05.jpg',
  './assets/images/chi-siamo_il-carisma_img_06.jpg',
  './assets/images/chi-siamo_il-carisma_img_07.jpg',
  './assets/images/chi-siamo_il-carisma_img_08.jpg',
  './assets/images/chi-siamo_il-carisma_img_09.jpg',
  './assets/images/chi-siamo_il-carisma_img_10.jpg',
  './assets/images/chi-siamo_il-carisma_img_11.jpg',
  './assets/images/chi-siamo_img_01.jpg',
  './assets/images/chi-siamo_img_02.jpg',
  './assets/images/chi-siamo_la-nostra-storia_img_01.jpg',
  './assets/images/chi-siamo_la-nostra-storia_img_02.jpg',
  './assets/images/chi-siamo_la-nostra-storia_img_03.jpg',
  './assets/images/chi-siamo_la-nostra-storia_img_04.jpg',
  './assets/images/chi-siamo_la-nostra-storia_img_05.jpg',
  './assets/images/chi-siamo_la-nostra-storia_img_06.jpg',
  './assets/images/chi-siamo_la-nostra-storia_img_07.jpg',
  './assets/images/chi-siamo_la-nostra-storia_img_08.jpg',
  './assets/images/chi-siamo_la-nostra-storia_img_09.jpg',
  './assets/images/chi-siamo_la-nostra-storia_img_10.jpg',
  './assets/images/chi-siamo_la-nostra-storia_img_11.jpg',
  './assets/images/chi-siamo_la-nostra-storia_img_12.jpg',
  './assets/images/chi-siamo_la-nostra-storia_img_13.jpg',
  './assets/images/chi-siamo_la-nostra-storia_img_14.jpg',
  './assets/images/chi-siamo_la-nostra-storia_img_15.jpg',
  './assets/images/chi-siamo_la-nostra-storia_img_16.jpg',
  './assets/images/chi-siamo_la-nostra-storia_img_17.png',
  './assets/images/chi-siamo_la-nostra-storia_img_18.jpg',
  './assets/images/contatti_img_01.jpg',
  './assets/images/contatti_img_02.jpg',
  './assets/images/contatti_img_03.jpg',
  './assets/images/contatti_img_04.jpg',
  './assets/images/contatti_img_05.jpg',
  './assets/images/contatti_img_06.jpg',
  './assets/images/dove-siamo_img_01.jpg',
  './assets/images/dove-siamo_img_02.jpg',
  './assets/images/dove-siamo_img_03.jpg',
  './assets/images/dove-siamo_img_04.jpg',
  './assets/images/home-page_img_01.jpg',
  './assets/images/home-page_img_02.jpg',
  './assets/images/home-page_img_03.jpg',
  './assets/images/home-page_img_04.jpg',
  './assets/images/home-page_img_05.jpg',
  './assets/images/home-page_img_06.jpg',
  './assets/images/home-page_img_07.jpg',
  './assets/images/home-page_img_08.jpg',
  './assets/images/home-page_img_09.jpg',
  './assets/images/home-page_img_10.jpg',
  './assets/images/home-page_img_11.jpg',
  './assets/images/home-page_img_12.jpg',
  './assets/images/home-page_img_13.jpg',
  './assets/images/home-page_img_14.jpg',
  './assets/images/home-page_img_15.jpg',
  './assets/images/home-page_img_16.jpg',
  './assets/images/home-page_img_17.jpg',
  './assets/images/home-page_img_18.jpg',
  './assets/images/home-page_img_19.jpg',
  './assets/images/home-page_img_20.jpg'
];

// Install Event: Precaches all essential pages, styles, scripts, icons, and photos
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching all assets for offline use...');
      // Precache assets with resilience (cache whatever succeeds)
      return Promise.allSettled(
        CORE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[Service Worker] Failed to precache:', url, err);
          })
        )
      );
    })
  );
});

// Activate Event: Clean up outdated caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate strategy for freshest data + immediate offline fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Ignore non-GET requests or browser-extension schemes
  if (req.method !== 'GET' || !req.url.startsWith('http')) {
    return;
  }

  // HTML Navigation Requests: Network-first with cache fallback
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cachedRes = await caches.match(req);
          if (cachedRes) return cachedRes;
          // Fallback to home if page not in cache
          return caches.match('./index.html');
        })
    );
    return;
  }

  // Static Assets (Images, CSS, JS, Fonts): Cache-First with Network Revalidation
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(() => {
          // Network failed, silently ignore if we already have cache
        });

      return cachedRes || fetchPromise;
    })
  );
});

// Listen for messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});