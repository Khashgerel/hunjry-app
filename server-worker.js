// Update the service worker to include cache headers
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

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