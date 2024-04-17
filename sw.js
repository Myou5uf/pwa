const STATIC_CACHE_NAME = 's-app-v1'
const DYNAMIC_CACHE_NAME = 'd-app-v1'

const ASSETS_URLS = [
  'index.html',
  '/js/app.js',
  '/css/styles.css',
  '/offline.html',
]

self.addEventListener('install', async (e) => {
  console.log('[SW]: install')
  const cache = await caches.open(STATIC_CACHE_NAME)
  await cache.addAll(ASSETS_URLS)
})

self.addEventListener('activate', async (e) => {
  console.log('[SW]: install')
  const cacheNames =  await caches.keys()
  await Promise.all(
    cacheNames
    .filter((name) => name !== STATIC_CACHE_NAME)
    .filter((name) => name !== DYNAMIC_CACHE_NAME)
    .map((name) => caches.delete(name))
  )
})

self.addEventListener('fetch', (e) => {
  console.log('fetch', e.request.url)
  const { request } = e
  const url = new URL(request.url)
  if (url.origin === location.origin) {
    e.respondWith(cacheFirst(e.request))
  } else {
    e.respondWith(networkFirst(request))
  }
})


async function cacheFirst(request) {
  const cached = await caches.match(request)
  return cached ?? await fetch(request)
}

async function networkFirst(request)  {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  try {
    const response = await fetch(request)
    await cache.put(request, response.clone())
    return response
  } catch (e) {
    const cached = cache.match(request)
    return cached ?? await caches.match('/offline.html')
  }
}
