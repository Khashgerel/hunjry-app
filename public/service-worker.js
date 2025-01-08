const CACHE_VERSION = 'v1';
const CACHE_NAME = `hungry-app-${CACHE_VERSION}`;
const ASSETS_TO_CACHE = [
  '/',
  '/htmls/login.html',
  '/htmls/nuur.html',
  '/htmls/food.html',
  '/htmls/fridge.html',
  '/htmls/plan.html',
  '/htmls/hereglegch.html',
  '/htmls/hool_detail.html',
  '/css/nuur.css',
  '/css/food.css',
  '/css/fridge.css',
  '/css/plan.css',
  '/css/hereglegch.css',
  '/css/hool_detail.css',
  '/Javascript/search.js',
  '/Javascript/food-detail.js',
  '/Javascript/hereglegch.js',
  '/Javascript/plan.js',
  '/Javascript/fridge.js',
  '/iconpic/logo.gif',
  '/iconpic/log-out.png',
  '/iconpic/fridge.png',
  '/iconpic/plan.png',
  '/iconpic/food.png',
  '/iconpic/profile.png',
  '/iconpic/heart.png',
  '/iconpic/comment.png',
  '/iconpic/pizza.png',
  '/manifest.json'
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
            
            // Add cache headers
            const headers = new Headers(response.headers);
            headers.append('Cache-Control', 'public, max-age=31536000');

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, new Response(
                  responseToCache.body,
                  {
                    status: responseToCache.status,
                    statusText: responseToCache.statusText,
                    headers: headers
                  }
                ));
              });

            return response;
          });
      })
  );
}); 