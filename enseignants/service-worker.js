/* Application « Espace enseignants LEA » : garde la page en mémoire pour une consultation hors connexion.
   Réseau d'abord, pour que l'équipe voie toujours la dernière version quand elle est connectée ;
   mémoire ensuite, quand il n'y a pas de réseau. Changer VERSION à chaque mise à jour importante. */
const VERSION = 'ens-lea-2026-11-25-1';
const FICHIERS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icone-180.png',
  './icone-192.png',
  './icone-512.png'
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(VERSION).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  ev.respondWith(
    fetch(req)
      .then((rep) => {
        if (rep && rep.ok) {
          const copie = rep.clone();
          caches.open(VERSION).then((c) => c.put(req, copie));
        }
        return rep;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true })
          .then((r) => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined))
      )
  );
});
