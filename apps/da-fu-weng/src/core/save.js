// ============================================================================
// 存档管理：多槽位 localStorage 持久化 + 导入导出（base64）。
// 通过 storage 访问器隔离 localStorage，便于 Node 单测注入。
// ============================================================================

import { MAPS, mapDefOf, tileCountOf } from '../config.js';

export const SAVE_SLOTS = 4;
const SLOT_PREFIX = 'dfw_save_';

let storage = null;
try {
  if (typeof localStorage !== 'undefined') storage = localStorage;
} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }

// 测试 / 注入用
export function _setStorage(s) { storage = s; }

const slotKey = (slot) => `${SLOT_PREFIX}${slot}`;

function validSlot(slot) {
  const n = Number(slot);
  return Number.isInteger(n) && n >= 0 && n < SAVE_SLOTS;
}

// 基础校验：必备字段存在即认为可读（详细字段由游戏层兜底）。
// players[].items/perk 缺结构时补默认值；棋盘长度不符（旧版存档）拒收。
function reviveState(raw) {
  const st = JSON.parse(raw);
  if (!sanitizeState(st)) return null;
  return st;
}

// 存档净化：导入 / 读档共用。返回净化后的 state，不可救则 null。
export function sanitizeState(st) {
  if (!st || typeof st !== 'object') return null;
  if (!Array.isArray(st.players) || !st.players.length || !Array.isArray(st.tiles)) return null;
  const map = mapDefOf(st.mapKey);
  if (st.tiles.length !== tileCountOf(map)) return null;
  if (typeof st.rng !== 'number' || typeof st.turnIdx !== 'number') return null;
  // 玩家结构兜底：手工构造的存档码缺 items/perk 时，渲染层读 p.items.swift 会 TypeError
  for (const p of st.players) {
    if (!p || typeof p !== 'object') return null;
    if (!p.items || typeof p.items !== 'object') p.items = {};
    p.items.swift = Math.max(0, p.items.swift | 0);
    p.items.charms = Math.max(0, p.items.charms | 0);
    if (!p.perk || typeof p.perk !== 'object') p.perk = {};
  }
  st.turnIdx = Math.min(Math.max(0, st.turnIdx | 0), st.players.length - 1);
  // 中间阶段（shop/decision/resolve/end）导入后无人驱动 resolveLoop，会开局即软锁：
  // 非终局存档一律拉回掷骰阶段，当前玩家重掷即可继续（落格效果作废，好于死锁）。
  if (!st.finished && st.phase !== 'roll') st.phase = 'roll';
  return st;
}

export function saveToSlot(slot, state) {
  try {
    if (!storage || !validSlot(slot)) return false;
    storage.setItem(slotKey(slot), JSON.stringify(state));
    return true;
  } catch (_) { return false; }
}

export function loadFromSlot(slot) {
  try {
    if (!storage || !validSlot(slot)) return null;
    const raw = storage.getItem(slotKey(slot));
    if (!raw) return null;
    return reviveState(raw);
  } catch (_) { return null; }
}

export function deleteSlot(slot) {
  try {
    if (!storage || !validSlot(slot)) return false;
    storage.removeItem(slotKey(slot));
    return true;
  } catch (_) { return false; }
}

export function slotInfo(slot) {
  const st = loadFromSlot(slot);
  if (!st) return null;
  const hero = st.players && st.players[0];
  const map = MAPS.find((m) => m.key === st.mapKey) || MAPS[0];
  return {
    round: st.round || 1,
    mapName: map.name,
    heroName: (hero && hero.name) || '?',
    players: (st.players || []).length,
    finished: !!st.finished,
    savedAt: st.savedAt || 0,
  };
}

export function listSlots() {
  const out = [];
  for (let i = 0; i < SAVE_SLOTS; i++) out.push(slotInfo(i));
  return out;
}

// 导出 / 导入（base64 的 JSON），便于换设备迁移。
export function exportSave(state) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(state)))); }
  catch (_) { return ''; }
}

export function importSave(code) {
  try {
    const st = JSON.parse(decodeURIComponent(escape(atob(String(code).trim()))));
    return sanitizeState(st);
  } catch (_) { return null; }
}
