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
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: 'https://media.base44.com/images/public/6a2370f9e6d0e6ce0d081a52/5bd4ffbb9_QjhED.jpg',
    vibrate: [200, 100, 200],
  });
});
