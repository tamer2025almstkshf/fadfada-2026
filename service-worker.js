// This service worker handles push notifications.

// Listener for when a push message is received from the server.
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  // Default data if payload is empty.
  let data = {
    title: 'Fadfada | فضفضة',
    body: 'لديك رسالة جديدة!',
    url: '/',
  };

  try {
    if (event.data) {
        const incomingData = event.data.json();
        // Merge incoming data with defaults
        data = { ...data, ...incomingData };
    }
  } catch (e) {
    console.error('[Service Worker] Error parsing push data:', e);
  }

  const notificationOptions = {
    body: data.body,
    icon: '/vite.svg', // A default icon for the app
    badge: '/vite.svg', // Icon for the notification bar on mobile
    data: {
        url: data.url // URL to open on click
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions)
  );
});

// Listener for when a user clicks on the notification.
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click Received.');
  
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        // You might want to be more specific with the URL check
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
