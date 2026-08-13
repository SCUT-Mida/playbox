// ============================================================================
// 存档：localStorage 持久化 + 导入导出（base64）+ 多槽位。
// 通过 storage 访问器隔离 localStorage，便于在 Node 单测中注入内存版。
// 槽位 key：lxx_slot_<n>（1..NUM_SLOTS）；当前活跃槽记录于 lxx_activeslot。
// ============================================================================
import { recompute } from './player.js';
import { nowSec } from '../config.js';

const NUM_SLOTS = 3;
const SLOT_PREFIX = 'lxx_slot_';
const ACTIVE_KEY = 'lxx_activeslot';

let storage = null;
try {
  if (typeof localStorage !== 'undefined') storage = localStorage;
} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }

// 测试 / 注入用
export function _setStorage(s) { storage = s; }
export function _NUM_SLOTS() { return NUM_SLOTS; }

function slotKey(n) { return `${SLOT_PREFIX}${n}`; }

export function getActiveSlot() {
  const raw = storage ? storage.getItem(ACTIVE_KEY) : null;
  const n = parseInt(raw, 10);
  return (n >= 1 && n <= NUM_SLOTS) ? n : 1;
}
export function setActiveSlot(n) {
  try { if (storage) storage.setItem(ACTIVE_KEY, String(n)); } catch (_) {}
}

export function hasSave(slot) {
  const n = slot || getActiveSlot();
  try { return !!(storage && storage.getItem(slotKey(n))); } catch (_) { return false; }
}

export function saveGame(player) {
  try {
    const slot = (player && player.slot) || getActiveSlot();
    if (player) player.slot = slot;
    setActiveSlot(slot);
    player.lastSeen = nowSec();
    // 洞府挂机基线时间随存档落盘
    if (player.cave) player.cave.lastSeen = player.cave.lastSeen || player.lastSeen;
    if (storage) storage.setItem(slotKey(slot), JSON.stringify(player));
    return true;
  } catch (_) { return false; }
}

export function loadGame(slot) {
  try {
    const n = slot || getActiveSlot();
    const raw = storage ? storage.getItem(slotKey(n)) : null;
    if (!raw) return null;
    const player = JSON.parse(raw);
    recompute(player);
    player.slot = n;
    return player;
  } catch (_) { return null; }
}

export function clearSave(slot) {
  try {
    const n = slot || getActiveSlot();
    if (storage) storage.removeItem(slotKey(n));
    return true;
  } catch (_) { return false; }
}

// 列出所有槽位的元信息（空槽返回 { slot, empty:true }）
export function listSlots() {
  const out = [];
  for (let n = 1; n <= NUM_SLOTS; n++) {
    let raw = null;
    try { raw = storage ? storage.getItem(slotKey(n)) : null; } catch (_) {}
    if (!raw) { out.push({ slot: n, empty: true }); continue; }
    try {
      const p = JSON.parse(raw);
      out.push(slotMeta(p, n));
    } catch (_) {
      out.push({ slot: n, empty: false, corrupt: true });
    }
  }
  return out;
}
function slotMeta(p, n) {
  const owned = p.cards ? Object.keys(p.cards).length : 0;
  return {
    slot: n,
    empty: false,
    lingshi: Math.floor(p.res && p.res.lingshi || 0),
    wendao: Math.floor(p.res && p.res.wendao || 0),
    cards: owned,
    codex: p.codex ? Object.keys(p.codex).length : 0,
    highestChapter: (p.story && p.story.highestChapter) || 1,
    secretFloor: (p.secret && p.secret.bestFloor) || 1,
    createdAt: p.createdAt || 0,
    lastSeen: p.lastSeen || 0,
  };
}

export function loadSlot(n) { setActiveSlot(n); return loadGame(n); }
export function saveSlot(n, player) { if (player) player.slot = n; setActiveSlot(n); return saveGame(player); }
export function deleteSlot(n) {
  try { if (storage) storage.removeItem(slotKey(n)); return true; } catch (_) { return false; }
}

// 导出为可分享的 base64 字符串（UTF-8 安全）
export function exportSave(player) { return btoaSafe(JSON.stringify(player)); }
export function importSave(str) {
  try {
    const player = JSON.parse(atobSafe(str));
    recompute(player);
    return player;
  } catch (_) { return null; }
}

// —— UTF-8 安全的 base64（兼容浏览器与 Node）——
function btoaSafe(str) {
  if (typeof btoa === 'function') return btoa(unescape(encodeURIComponent(str)));
  return Buffer.from(str, 'utf8').toString('base64');
}
function atobSafe(str) {
  if (typeof atob === 'function') return decodeURIComponent(escape(atob(str)));
  return Buffer.from(str, 'base64').toString('utf8');
}
