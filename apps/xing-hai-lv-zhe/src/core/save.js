// ============================================================================
// 存档管理模块（Save Manager）：多槽位 localStorage 持久化 + 导入导出（base64）。
//
// 多槽位：提供 SAVE_SLOTS（≥5）个独立存档位，key = xhlz_save_<slot>。
// 通过 storage 访问器隔离 localStorage，便于 Node 单测注入。
// 每次移动 / 战斗结算 / 强化 / 拾取后由 UI 自动调用 saveToSlot 落盘，防丢档。
// ============================================================================
import { migrate } from './player.js';

export const SAVE_SLOTS = 6;
const SLOT_PREFIX = 'xhlz_save_';

let storage = null;
try {
  if (typeof localStorage !== 'undefined') storage = localStorage;
} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }

// 测试 / 注入用
export function _setStorage(s) { storage = s; }

export function nowSec() {
  try { return Math.floor(Date.now() / 1000); } catch (_) { return 0; }
}

const slotKey = (slot) => `${SLOT_PREFIX}${slot}`;

function validSlot(slot) {
  const n = Number(slot);
  return Number.isInteger(n) && n >= 0 && n < SAVE_SLOTS;
}

// 读取某槽位的原始玩家对象，不存在或损坏返回 null。
export function loadFromSlot(slot) {
  try {
    if (!storage || !validSlot(slot)) return null;
    const raw = storage.getItem(slotKey(slot));
    if (!raw) return null;
    const player = JSON.parse(raw);
    return migrate(player);
  } catch (_) { return null; }
}

// 列举所有槽位的概要信息，供存档管理 UI 展示。
// 返回 [{ slot, exists, name, floor, maxFloor, level, stardust, memoryCount, ending, lastSeen }]
export function listSaves() {
  const out = [];
  for (let i = 0; i < SAVE_SLOTS; i++) {
    const p = loadFromSlot(i);
    out.push({
      slot: i,
      exists: !!p,
      name: p ? p.name : null,
      floor: p ? p.floor : null,
      maxFloor: p ? p.maxFloor : null,
      level: p ? p.level : null,
      stardust: p ? p.stardust : null,
      memoryCount: p ? (p.memory || []).filter(Boolean).length : 0,
      ending: p ? p.ending : null,
      lastSeen: p ? p.lastSeen : 0,
    });
  }
  return out;
}

export function hasAnySave() {
  try {
    if (!storage) return false;
    for (let i = 0; i < SAVE_SLOTS; i++) if (storage.getItem(slotKey(i)) != null) return true;
    return false;
  } catch (_) { return false; }
}

// 取最近游玩的槽位（lastSeen 最大者）；同值时槽位号大者优先（最后写入者胜出，结果确定）。
export function latestSlot() {
  const list = listSaves().filter((s) => s.exists);
  if (!list.length) return null;
  let pick = list[0];
  for (const s of list) {
    if ((s.lastSeen || 0) >= (pick.lastSeen || 0)) pick = s;
  }
  return pick.slot;
}

// 写入指定槽位。slot 非法时回退到 0 号槽。返回是否成功。
export function saveToSlot(slot, player) {
  try {
    if (!storage || !player) return false;
    const s = validSlot(slot) ? slot : 0;
    player.lastSeen = nowSec();
    if (!player.born) player.born = player.lastSeen;
    storage.setItem(slotKey(s), JSON.stringify(player));
    return true;
  } catch (_) { return false; }
}

export function deleteSlot(slot) {
  try {
    if (!storage || !validSlot(slot)) return false;
    storage.removeItem(slotKey(slot));
    return true;
  } catch (_) { return false; }
}

// 导出 / 导入（base64，UTF-8 安全）。
export function exportSave(player) {
  return btoaSafe(JSON.stringify(migrate(JSON.parse(JSON.stringify(player)))));
}
export function importSave(str) {
  try {
    const player = JSON.parse(atobSafe(str));
    return migrate(player);
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

export { SLOT_PREFIX };
