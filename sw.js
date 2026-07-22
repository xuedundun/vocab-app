// 学囤囤 · Service Worker (safe mode)
// 只在 HTTPS 环境下激活，HTTP/localhost 不缓存
const CACHE_NAME = 'xuedundun-vocab-v3';

self.addEventListener('install', (e) => {
  // 不预缓存，按需缓存，避免卡住旧版本
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // 清除所有旧缓存
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // 只对同源请求做缓存，且优先使用网络
  if (e.request.url.startsWith(self.location.origin)) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          // 成功获取后缓存
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          return response;
        })
        .catch(() => {
          // 网络失败时从缓存读取
          return caches.match(e.request);
        })
    );
  }
});
