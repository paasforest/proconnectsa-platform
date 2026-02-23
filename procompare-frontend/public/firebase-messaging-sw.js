// Firebase Cloud Messaging Service Worker
// This file must be at the root: /firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCYRMOM4QlFvF2Aiz0b_S9OlDC6kt0Ey00",
  authDomain: "proconnectsa-c521c.firebaseapp.com",
  projectId: "proconnectsa-c521c",
  storageBucket: "proconnectsa-c521c.firebasestorage.app",
  messagingSenderId: "547788454489",
  appId: "1:547788454489:web:82af90777fda0224d04f48"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'New notification';
  const body = payload.notification?.body || '';
  self.registration.showNotification(title, {
    body: body,
    icon: '/icon-192.png',
    data: payload.data || {}
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(clients.openWindow(url));
});
