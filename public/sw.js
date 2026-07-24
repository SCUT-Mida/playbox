// ============================================================================
// Service Worker — 离线缓存 + 自动更新
// 用户安装 PWA 后，打开时自动检查更新，有新版本静默刷新
// ============================================================================
const CACHE_NAME = 'playbox-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
];

// 安装：预缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting(); // 立即激活新版本
});

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim(); // 立即接管所有页面
});

// 请求拦截：缓存优先，网络回退
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  // 网络优先（确保拿到最新版本），失败时回退到缓存
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功获取，更新缓存
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // 网络失败，从缓存返回
        return caches.match(event.request).then((cached) => cached || caches.match('./'));
      })
  );
});
