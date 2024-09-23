self.addEventListener('install', event => {
    console.log('Service Worker installing.');

    event.waitUntil(
        caches.open('v1').then(cache => {
            return cache.addAll([
                '/index.html',
                '/items.html',
                '/app.js',
                '/js/items.js',
                '/js/itemsDB.js',
                '/js/askAi.js',
                '/js/catalogue.js',
                '/src/assets/css/bootstrap.min.css',
                '/src/assets/js/bootstrap.bundle.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js'
            ]);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker activating.');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== 'v1') {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    console.log('Service Worker handling fetch event for:', event.request.url);
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});