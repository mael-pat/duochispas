var CACHE = 'duochispas-6d78e92034';
var ARCHIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icono-180.png', 'icono-192.png', 'icono-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // La página: primero la de internet (así cada versión nueva se ve al abrir), y si no hay conexión
  // o tarda más de 4 s, la guardada. Las comprobaciones de GitHub responden «sin cambios» si no hay versión nueva.
  if (e.request.mode === 'navigate') {
    e.respondWith(caches.open(CACHE).then(function (c) {
      return c.match(e.request, { ignoreSearch: true }).then(function (guardada) {
        var red = fetch(e.request, { cache: 'no-cache' }).then(function (r) { if (r.ok) c.put(e.request, r.clone()); return r; });
        if (!guardada) return red;
        return Promise.race([red, new Promise(function (ok) { setTimeout(function () { ok(guardada); }, 4000); })]).catch(function () { return guardada; });
      });
    }));
    return;
  }
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(e.request, { ignoreSearch: true }).then(function (guardada) {
      var red = fetch(e.request).then(function (r) { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(function () { return guardada; });
      return guardada || red;
    });
  }));
});
