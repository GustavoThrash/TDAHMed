const CACHE_NAME = 'tdahmed-academic-v1'
const scopeUrl = self.registration.scope

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME)
    try { await cache.add(scopeUrl) } catch { /* publicação ainda pode não ter todos os recursos disponíveis */ }
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(key => key.startsWith('tdahmed-academic-') && key !== CACHE_NAME).map(key => caches.delete(key)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME)
    try {
      const response = await fetch(request)
      if (response.ok && (request.destination === 'script' || request.destination === 'style' || request.destination === 'document' || request.destination === 'image' || url.pathname.endsWith('.webmanifest'))) {
        cache.put(request, response.clone())
      }
      return response
    } catch {
      const cached = await cache.match(request)
      if (cached) return cached
      if (request.mode === 'navigate') {
        const shell = await cache.match(scopeUrl)
        if (shell) return shell
      }
      return new Response('Você está offline e este recurso ainda não foi armazenado.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    }
  })())
})
