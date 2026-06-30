// ============================================================================
// 存档管理模块（Save Manager）：localStorage 持久化 + 导入导出（base64）。
// 单角色单存档，key = mnrs_save。通过 storage 访问器隔离 localStorage，便于 Node 单测注入。
// 每次「下一回合」与抉择结算后由 UI 自动调用 saveGame 落盘，防意外关浏览器丢档。
// ============================================================================
import { ATTRS, ATTR_MIN, ATTR_MAX, MAX_AGE_MIN, MAX_AGE_MAX } from '../config.js';
import { normalizeAttrs } from './player.js';

const SAVE_KEY = 'mnrs_save';

let storage = null;
try {
  if (typeof localStorage !== 'undefined') storage = localStorage;
} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }

// 测试 / 注入用
export function _setStorage(s) { storage = s; }

export function nowSec() {
  // 优先用真实时间戳；脚本环境禁止 argless new Date() 时回退为单调计数。
  try { return Math.floor(Date.now() / 1000); } catch (_) { return 0; }
}

export function hasSave() {
  try { return !!(storage && storage.getItem(SAVE_KEY)); } catch (_) { return false; }
}

export function saveGame(player) {
  try {
    if (!storage || !player) return false;
    player.lastSeen = nowSec();
    if (!player.born) player.born = player.lastSeen;
    storage.setItem(SAVE_KEY, JSON.stringify(player));
    return true;
  } catch (_) { return false; }
}

export function loadGame() {
  try {
    const raw = storage ? storage.getItem(SAVE_KEY) : null;
    if (!raw) return null;
    const player = JSON.parse(raw);
    migrate(player);
    return player;
  } catch (_) { return null; }
}

export function clearSave() {
  try { if (storage) storage.removeItem(SAVE_KEY); return true; } catch (_) { return false; }
}

// 导出为可分享的 base64 字符串（UTF-8 安全）
export function exportSave(player) {
  return btoaSafe(JSON.stringify(player));
}
export function importSave(str) {
  try {
    const player = JSON.parse(atobSafe(str));
    migrate(player);
    return player;
  } catch (_) { return null; }
}

// 存档结构向后兼容：补齐 / 钳制字段，防止旧档或损坏档导致整页闪退。
function migrate(player) {
  if (!player) return player;
  if (typeof player.name !== 'string') player.name = '无名氏';
  // 与 newPlayer 保持一致：姓名截断到 8 字，避免旧档/导入档携带超长姓名撑破 UI。
  player.name = player.name.slice(0, 8) || '无名氏';
  player.gender = player.gender === 'female' ? 'female' : 'male';
  if (!Number.isFinite(player.weeks) || player.weeks < 0) player.weeks = 0;
  if (!Number.isFinite(player.turn) || player.turn < 0) player.turn = 0;
  // 大限钳制到合法区间，避免越界
  if (!Number.isFinite(player.maxAge) || player.maxAge < MAX_AGE_MIN) player.maxAge = MAX_AGE_MIN;
  if (player.maxAge > MAX_AGE_MAX) player.maxAge = MAX_AGE_MAX;
  if (!player.attrs || typeof player.attrs !== 'object') player.attrs = {};
  player.attrs = normalizeAttrs(player.attrs);
  // 保证五大属性齐全
  for (const k of ATTRS) if (!Number.isFinite(player.attrs[k])) player.attrs[k] = 50;
  if (typeof player.career !== 'string' && player.career != null) player.career = null;
  // 职级：有职业时至少为 1，无职业时归零；非法值兜底。
  if (player.career) {
    if (!Number.isFinite(player.careerLevel) || player.careerLevel < 1) player.careerLevel = 1;
  } else {
    player.careerLevel = 0;
  }
  if (!player.flags || typeof player.flags !== 'object') player.flags = {};
  // 子女数（如有）规范化为非负整数。
  if (Number.isFinite(player.flags.children) && player.flags.children < 0) player.flags.children = 0;
  if (!Array.isArray(player.log)) player.log = [];
  if (!Number.isFinite(player.born)) player.born = 0;
  if (!Number.isFinite(player.lastSeen)) player.lastSeen = 0;
  return player;
}

// —— UTF-8 安全的 base64（兼容浏览器与 Node）——
function btoaSafe(str) {
  if (typeof btoa === 'function') return btoa(unescape(encodeURIComponent(str)));
  return Buffer.from(str, 'utf8').toString('base64'); // Node 回退
}
function atobSafe(str) {
  if (typeof atob === 'function') return decodeURIComponent(escape(atob(str)));
  return Buffer.from(str, 'base64').toString('utf8');
}

export { SAVE_KEY, ATTRS, ATTR_MIN, ATTR_MAX };
