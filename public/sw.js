importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAUvXmpsENY8C8F6tdL4Sl87EdFiFCETQI',
  authDomain: 'futamart-1.firebaseapp.com',
  projectId: 'futamart-1',
  storageBucket: 'futamart-1.firebasestorage.app',
  messagingSenderId: '507410495541',
  appId: '1:507410495541:web:bea85b78bfdfb03a74597c'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.getNotifications().then((notifications) => {
    notifications.forEach((n) => n.close());
  });
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: 'https://media.base44.com/images/public/6a2370f9e6d0e6ce0d081a52/5bd4ffbb9_QjhED.jpg',
    tag: 'futamart-msg',
    renotify: true,
  });
});

const CACHE_NAME = 'futamart-v37';
const urlsToCache = ['/', '/offline.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first for HTML navigation requests (always get latest app shell)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) return cached;
          return fetch(request)
            .then((response) => {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
              return response;
            })
            .catch(() => caches.match('/offline.html'));
        })
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Cache-first for JS/CSS/image assets (they have hashed filenames so safe to cache)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Network-only for everything else (API calls, Supabase, etc.)
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('futamart') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/chats');
    })
  );
});



































