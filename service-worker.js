/* Application « Licence LEA » : garde les pages en mémoire pour une consultation hors connexion.
   Réseau d'abord, pour que les étudiants voient toujours la dernière version quand ils sont connectés ;
   mémoire ensuite, quand il n'y a pas de réseau. Changer VERSION à chaque mise à jour importante. */
const VERSION = 'faq-lea-2026-11-20-1004';
const FICHIERS = [
  './index.html',
  './candidater-en-alternance.html',
  './fiche-entreprise-stage-L1-LEA.docx',
  './fiche-entreprise-stage-L1-LEA.pdf',
  './fiche-entreprise-stage-L2-LEA.docx',
  './fiche-entreprise-stage-L2-LEA.pdf',
  './fiche-etudiant-LEA-marche-du-travail.pdf',
  './fiche-metier-LEA-CAPES-espagnol.docx',
  './fiche-metier-LEA-CAPES-espagnol.pdf',
  './fiche-metier-LEA-marketing-international.docx',
  './fiche-metier-LEA-marketing-international.pdf',
  './fiche-tuteur-alternance-LEA.docx',
  './fiche-tuteur-alternance-LEA.pdf',
  './fiche-tuteur-stage-CAPES-LEA.docx',
  './fiche-tuteur-stage-CAPES-LEA.pdf',
  './grille-correspondance-poste-competences-LEA.docx',
  './guide-pedagogique-LEA-2027-etudiants.pdf',
  './guide-rapport-soutenance-LEA-2026.pdf',
  './maquette-LEA-2027-CFVU-2026.pdf',
  './modele-offre-alternance-LEA.docx',
  './modele-offre-alternance-LEA.pdf',
  './reglement-etudes-LEA-2027.pdf',
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
