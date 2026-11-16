const PREFIX = "eac-v3-";  // eigen voorvoegsel: alle GitHub-apps delen één opslag
const CACHE = PREFIX + "16";
const BESTANDEN = ["./", "./index.html", "./styles.css", "./nac-logo.png", "./favorieten.js", "./data.js", "./app.js?v=6", "./recepten.js?v=1", "./recepten.css?v=1", "./recepten-data.js?v=1", "./styles.css?v=7", "./data.js?v=5", "./favorieten.js?v=1", "./videos.js", "./qr.html", "./qrcode.js"];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE).then((c) => c.addAll(BESTANDEN)));
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((namen) =>
            Promise.all(namen.filter((n) => (n.startsWith(PREFIX)) && n !== CACHE).map((n) => caches.delete(n)))
        )
    );
    self.clients.claim();
});

// Eerst het netwerk, bij geen verbinding de cache
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
