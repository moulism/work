// sw.js – service worker jen pro web push notifikace (žádné offline cachování,
// ať appka vždycky ukazuje čerstvá data ze Supabase).

self.addEventListener('install', function (event) {
  self.skipWaiting();
});
self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  var data = { title: 'Kosatka', body: 'Máš novou zprávu.' };
  try { if (event.data) data = event.data.json(); } catch (e) {
    try { data.body = event.data.text(); } catch (e2) {}
  }
  var options = {
    body: data.body || '',
    icon: 'rozpis.png',
    badge: 'rozpis.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || './app.html' }
  };
  event.waitUntil(self.registration.showNotification(data.title || 'Kosatka', options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || './app.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf(url) !== -1 && 'focus' in list[i]) return list[i].focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
