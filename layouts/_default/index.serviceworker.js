const CACHE_VERSION = "{{ now.Unix }}";
const CACHE_NAME = "{{ .Site.Title | urlize }}-cache-v" + CACHE_VERSION;

const PRECACHE_URLS = [
  "{{ "/" | absURL }}",
  "{{ "manifest.json" | absURL }}",
  {{ range (resources.Match "css/*.css") }}
  "{{ .RelPermalink | absURL }}",
  {{ end }}
  {{ range (resources.Match "js/*.js") }}
  "{{ .RelPermalink | absURL }}",
  {{ end }}
  "{{ "logo-icons/android-chrome-192x192.png" | absURL }}",
  "{{ "logo-icons/android-chrome-512x512.png" | absURL }}",
  "{{ "offline/" | absURL }}"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match("{{ "offline/" | absURL }}"));

      return cached || network;
    })
  );
});