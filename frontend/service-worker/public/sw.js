const CACHE_NAME = "my-cache-v1";
self.addEventListener("install", (e) => {
  console.log("Installing service worker");
  // Skip precaching - Vite generates hashed filenames that change on each build
  // All resources will be cached on first fetch instead
  e.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (e) => {
  console.log("Activating service worker");
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (e) {
  console.log(`Fetching ${e.request.url}`);
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        if (!response || response.status > 400) {
          return response;
        }
        // Cache both 'basic' (same-origin) and 'cors' (cross-origin API) responses
        if (response.type === "basic" || response.type === "cors") {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(e.request);
      })
  );
});
