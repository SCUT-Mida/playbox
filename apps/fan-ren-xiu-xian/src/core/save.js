// ============================================================================
// 存档：localStorage 持久化 + 导入导出（base64）+ 离线修炼收益结算
// 通过 storage 访问器隔离 localStorage，便于在 Node 单测中注入内存版。
// ============================================================================
import { recompute } from './player.js';
import {
  OFFLINE_CAP_HOURS, OFFLINE_EFFICIENCY, passiveXpPerSec, cultivateSpeedMult, nowSec,
} from '../config.js';

const KEY = 'frxx_save_v1';
let storage = null;
try {
  if (typeof localStorage !== 'undefined') storage = localStorage;
} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }

// 测试 / 注入用
export function _setStorage(s) { storage = s; }

export function hasSave() {
  try { return !!(storage && storage.getItem(KEY)); } catch (_) { return false; }
}

export function saveGame(player) {
  try {
    player.lastSeen = nowSec();
    if (storage) storage.setItem(KEY, JSON.stringify(player));
    return true;
  } catch (_) { return false; }
}

export function loadGame() {
  try {
    const raw = storage ? storage.getItem(KEY) : null;
    if (!raw) return null;
    const player = JSON.parse(raw);
    migrate(player);
    recompute(player);
    return player;
  } catch (_) { return null; }
}

export function clearSave() {
  try { if (storage) storage.removeItem(KEY); return true; } catch (_) { return false; }
}

// 导出为可分享的 base64 字符串（UTF-8 安全）
export function exportSave(player) {
  const json = JSON.stringify(player);
  return btoaSafe(json);
}
export function importSave(str) {
  try {
    const json = atobSafe(str);
    const player = JSON.parse(json);
    migrate(player);
    recompute(player);
    return player;
  } catch (_) { return null; }
}

// 存档结构向后兼容：补齐新字段
function migrate(player) {
  if (!player.stats) player.stats = {};
  const dflt = { battlesWon: 0, breakthroughs: 0, alchemyFails: 0, alchemyOk: 0, lowHpWins: 0, breakthroughStreak: 0, exploreCount: 0, deaths: 0 };
  for (const k of Object.keys(dflt)) if (player.stats[k] == null) player.stats[k] = dflt[k];
  if (!player.pity) player.pity = { explore: 0 };
  if (!player.recipes) player.recipes = ['rcp_huitian'];
  if (!player.titles) player.titles = [];
  if (!player.techniques) player.techniques = [];
  if (!player.achievements) player.achievements = [];
  if (player.bagCapacity == null) player.bagCapacity = 15;
  if (!player.bag) player.bag = {};
  return player;
}

// 计算离线修炼收益（自上次 lastSeen 至今，上限 OFFLINE_CAP_HOURS 小时）
export function computeOffline(player, nowOverride) {
  const now = nowOverride != null ? nowOverride : nowSec();
  if (!player.lastSeen) return { seconds: 0, xp: 0 };
  let seconds = Math.max(0, now - player.lastSeen);
  const cap = OFFLINE_CAP_HOURS * 3600;
  const capped = seconds > cap;
  seconds = Math.min(seconds, cap);
  if (seconds < 5) return { seconds: 0, xp: 0 }; // 太短不计
  const mult = cultivateSpeedMult(player);
  const xp = Math.round(passiveXpPerSec(player.tier, mult) * seconds * OFFLINE_EFFICIENCY);
  return { seconds, xp, capped };
}

// —— UTF-8 安全的 base64（兼容浏览器与 Node）——
function btoaSafe(str) {
  if (typeof btoa === 'function') return btoa(unescape(encodeURIComponent(str)));
  // Node 回退
  return Buffer.from(str, 'utf8').toString('base64');
}
function atobSafe(str) {
  if (typeof atob === 'function') return decodeURIComponent(escape(atob(str)));
  return Buffer.from(str, 'base64').toString('utf8');
}
