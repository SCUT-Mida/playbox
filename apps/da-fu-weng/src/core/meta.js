// ============================================================================
// 地图解锁进度（meta）：localStorage 持久化，独立于对局存档。
// 规则：MAPS 顺序解锁，首张默认开放；在地图上夺冠（主角排名第一）解锁下一张。
// ============================================================================
import { MAPS, mapDefOf } from '../config.js';

const META_KEY = 'dfw_meta';

let storage = null;
try {
  if (typeof localStorage !== 'undefined') storage = localStorage;
} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }

export function _setStorage(s) { storage = s; }

function normalize(raw) {
  const m = (raw && typeof raw === 'object') ? raw : {};
  const unlockedSet = new Set(Array.isArray(m.unlocked) ? m.unlocked : [MAPS[0].key]);
  unlockedSet.add(MAPS[0].key); // 首图恒解锁
  return { unlocked: [...unlockedSet], wins: Math.max(0, m.wins | 0) };
}

export function loadMeta() {
  try {
    if (!storage) return normalize(null);
    return normalize(JSON.parse(storage.getItem(META_KEY) || 'null'));
  } catch (_) { return normalize(null); }
}

export function saveMeta(meta) {
  try {
    if (!storage) return false;
    storage.setItem(META_KEY, JSON.stringify(normalize(meta)));
    return true;
  } catch (_) { return false; }
}

// 某图是否已解锁
export function isUnlocked(mapKey) {
  return loadMeta().unlocked.includes(mapKey);
}

// 夺冠后调用：解锁下一张地图，返回新解锁的 mapKey（无则 null）
export function unlockNext(mapKey) {
  const meta = loadMeta();
  meta.wins += 1;
  const idx = MAPS.findIndex((m) => m.key === mapKey);
  const next = idx >= 0 && idx + 1 < MAPS.length ? MAPS[idx + 1] : null;
  let fresh = null;
  if (next && !meta.unlocked.includes(next.key)) {
    meta.unlocked.push(next.key);
    fresh = next.key;
  }
  saveMeta(meta);
  return fresh;
}

// 下一个待解锁地图（用于锁定卡片上的提示文案）
export function nextUnlockOf(mapKey) {
  const def = mapDefOf(mapKey);
  return def.unlock || null;
}
