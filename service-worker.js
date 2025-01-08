const CACHE_VERSION = 'v1';
const CACHE_NAME = `hungry-app-${CACHE_VERSION}`;
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.png',
  '/api/recipes',
  '/api/users',
  '/api/ingredients',
  '/manifest.json',
  '/register-sw.js',
  // Static assets
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  // Add your CSS files
  '/styles/style.css',
  '/styles/responsive.css',
  // Add your JS files
  '/scripts/app.js',
  '/scripts/recipe.js',
  '/scripts/user.js',
  // Add your API endpoints
  '/api-docs.json',
  // Add your fonts if any
  '/fonts/your-font.woff2',
  // Add any other important assets
];

// Install service worker and cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate service worker and clean up old caches
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
    })
  );
});

// Fetch assets from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if found
        if (response) {
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Check if response is valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response to cache and return
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});

// Cache hero image immediately
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                '/foodpic/519.jpg',
                '/foodpic/519-mobile.jpg',
                '/css/nuur.css',
                '/iconpic/logo.gif'
            ]);
        })
    );
}); 