const CACHE_NAME = "feira-v61.9";
const ASSETS = [
  "./",
  "./index.html",
  "./app.html",
  "./assets/app.css",
  "./styles.css",
  "./app.js",
  "./supabase-config.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./src/router.js",
  "./src/auth.js",
  "./src/constants.js",
  "./src/utils.js",
  "./src/theme.js",
  "./src/profile.js",
  "./src/db.js",
  "./src/dates.js",
  "./src/normalizers.js",
  "./src/state.js",
  "./src/sync.js",
  "./src/spaces.js",
  "./src/settings.js",
  "./src/shopping.js",
  "./src/meals.js",
  "./src/purchases.js",
  "./components/items.js",
  "./components/meals.js",
  "./components/purchases.js",
  "./components/categories.js",
  "./changelog.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        ASSETS.map(async (asset) => {
          try {
            await cache.add(asset);
          } catch (error) {
            console.warn("Falha ao pré-cachear asset", asset, error);
          }
        }),
      );
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (!event.request.url.startsWith("http")) return;
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./app.html", copy));
          return response;
        })
        .catch(() => caches.match("./app.html")),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match("./index.html"));
    }),
  );
});
