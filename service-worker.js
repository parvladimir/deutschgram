const CONTEXT_CACHE = 'deutschgram-push-context-v1';
const CONTEXT_URL = '/__deutschgram_push_context__';

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
    if (!event.data || event.data.type !== 'DEUTSCHGRAM_PUSH_CONTEXT') {
        return;
    }

    event.waitUntil(storePushContext(event.data.context || {}));
});

async function storePushContext(context) {
    const cache = await caches.open(CONTEXT_CACHE);
    await cache.put(CONTEXT_URL, new Response(JSON.stringify(context), {
        headers: {
            'Content-Type': 'application/json'
        }
    }));
}

async function readPushContext() {
    const cache = await caches.open(CONTEXT_CACHE);
    const response = await cache.match(CONTEXT_URL);
    if (!response) {
        return null;
    }

    try {
        return await response.json();
    } catch {
        return null;
    }
}

async function hasVisibleClient() {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    return clients.some((client) => client.visibilityState === 'visible' || client.focused === true);
}

async function pullNotifications(context) {
    if (!context || !context.pullUrl) {
        return [];
    }

    const response = await fetch(context.pullUrl, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'same-origin'
    });

    if (!response.ok) {
        return [];
    }

    const result = await response.json();
    return Array.isArray(result.notifications) ? result.notifications : [];
}

self.addEventListener('push', (event) => {
    event.waitUntil(handlePushEvent());
});

async function handlePushEvent() {
    const context = await readPushContext();
    const notifications = await pullNotifications(context);

    if (notifications.length === 0) {
        if (await hasVisibleClient()) {
            return;
        }

        await self.registration.showNotification('Deutschgram Call', {
            body: 'Появилось новое событие. Откройте приложение.',
            tag: 'deutschgram-fallback',
            renotify: true,
            data: {
                url: (context && context.fallbackUrl) || './'
            }
        });
        return;
    }

    if (await hasVisibleClient()) {
        return;
    }

    await Promise.all(
        notifications.slice(0, 4).map((item) =>
            self.registration.showNotification(item.title || 'Deutschgram Call', {
                body: item.body || 'Откройте приложение, чтобы посмотреть событие.',
                tag: item.tag || `deutschgram-${item.id}`,
                renotify: true,
                data: {
                    url: item.url || (context && context.fallbackUrl) || './'
                }
            })
        )
    );
}

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = (event.notification.data && event.notification.data.url) || './';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            for (const client of clients) {
                if ('focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }

            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }

            return undefined;
        })
    );
});