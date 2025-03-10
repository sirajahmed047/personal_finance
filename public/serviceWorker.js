importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.1.5/workbox-sw.js');

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new workbox.strategies.StaleWhileRevalidate()
);
workbox.routing.registerRoute(
  ({ url }) => url.pathname === '/',
  new workbox.strategies.NetworkFirst()
);