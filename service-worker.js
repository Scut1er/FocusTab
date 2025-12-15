// Service Worker для PWA
const CACHE_NAME = 'focustab-v4';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './timer.js',
    './tasks.js',
    './storage.js',
    './quotes.js',
    './sounds.js',
    './manifest.json',
    './notification.mp3'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Кэш открыт');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Ошибка кэширования:', error);
            })
    );
    self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Удаление старого кэша:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Для HTML файлов используем network-first для всегда свежей версии
    if (event.request.destination === 'document' || url.pathname.endsWith('.html')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Обновляем кэш свежим файлом
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Если сеть недоступна, используем кэш
                    return caches.match(event.request);
                })
        );
        return;
    }
    
    // Для CSS и JS файлов используем стратегию network-first для обновлений
    if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Обновляем кэш свежим файлом
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Если сеть недоступна, используем кэш
                    return caches.match(event.request);
                })
        );
    } else {
        // Для остальных файлов (изображения, аудио) используем cache-first
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    return response || fetch(event.request).then((fetchResponse) => {
                        // Кэшируем для будущего использования
                        const responseClone = fetchResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                        return fetchResponse;
                    });
                })
                .catch(() => {
                    if (event.request.destination === 'document') {
                        return caches.match('./index.html');
                    }
                })
        );
    }
});

