// ============================================================================
// Service Worker — 离线缓存 + 自动更新
// 用户安装 PWA 后，打开时自动检查更新，有新版本静默刷新
//
// 缓存策略（修复「旧壳 + 新服务器」导致的游戏懒加载 404）：
//   /assets/*  —— Vite 内容哈希产物，永不复用文件名 → 缓存优先（离线可玩、零陈旧风险）；
//   其余同源   —— 网络优先（拿到最新壳），失败回退缓存；旧缓存在 activate 时整包清理。
// 版本号每次发版递增（CACHE_NAME），确保激活时清空上一代缓存。
// ============================================================================
const CACHE_NAME = 'playbox-v4';
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

// 请求拦截
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // 内容哈希资源：缓存优先，网络回退（哈希文件内容不可变，缓存永不过期）
  if (url.pathname.startsWith(self.location.pathname.replace(/\/$/, '') + '/assets/') || url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 其余资源：网络优先（确保最新壳），失败回退缓存
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => cached || caches.match('./'));
      })
  );
});
