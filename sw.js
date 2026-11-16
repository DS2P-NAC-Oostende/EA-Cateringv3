const PREFIX = "eac-v3-";  // eigen voorvoegsel: alle GitHub-apps delen één opslag
const CACHE = PREFIX + "19";
const BESTANDEN = ["./", "./index.html", "./styles.css", "./nac-logo.png", "./favorieten.js", "./data.js", "./app.js?v=6", "./recepten.js?v=3", "./recepten.css?v=1", "./recepten-data.js?v=1", "./styles.css?v=7", "./data.js?v=5", "./favorieten.js?v=1", "./videos.js", "./qr.html", "./qrcode.js"];

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
    // Eigen bestanden altijd bij de server nakijken (geen verouderde kopie uit de browsercache),
    // zodat een nieuwe versie meteen zichtbaar is. Zonder verbinding: de opgeslagen kopie.
    const eigen = new URL(event.request.url).origin === self.location.origin;
    const verzoek = eigen ? new Request(event.request, { cache: "no-cache" }) : event.request;
    event.respondWith(
        fetch(verzoek).catch(() => caches.match(event.request, { ignoreSearch: false }))
    );
});
