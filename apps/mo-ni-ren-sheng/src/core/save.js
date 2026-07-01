// ============================================================================
// 存档管理模块（Save Manager）：多槽位 localStorage 持久化 + 导入导出（base64）。
//
// 多槽位：提供 SAVE_SLOTS（≥5）个独立存档位，key = mnrs_save_<slot>。
// 旧版单存档（key = mnrs_save）在首次列举 / 读取时自动迁移到 0 号槽，无缝兼容。
// 通过 storage 访问器隔离 localStorage，便于 Node 单测注入。
// 每次「下一回合」、抉择结算、挂机推进后由 UI 自动调用 saveToSlot 落盘，防丢档。
// ============================================================================
import { ATTRS, ATTR_MIN, ATTR_MAX, MAX_AGE_MIN, MAX_AGE_MAX } from '../config.js';
import { normalizeAttrs } from './player.js';
import { normalizeAutoPlay } from './autoplay.js';

// 存档槽位数量（≥5，多给一格余量）。
export const SAVE_SLOTS = 6;
const SLOT_PREFIX = 'mnrs_save_';
const LEGACY_KEY = 'mnrs_save'; // 旧版单存档 key，迁移用

let storage = null;
try {
  if (typeof localStorage !== 'undefined') storage = localStorage;
} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }

// 测试 / 注入用
export function _setStorage(s) { storage = s; }

export function nowSec() {
  // 优先用真实时间戳；脚本环境禁止 argless new Date() 时回退为 0。
  try { return Math.floor(Date.now() / 1000); } catch (_) { return 0; }
}

const slotKey = (slot) => `${SLOT_PREFIX}${slot}`;

// 校验 slot 合法性（0 ~ SAVE_SLOTS-1）。
function validSlot(slot) {
  const n = Number(slot);
  return Number.isInteger(n) && n >= 0 && n < SAVE_SLOTS;
}

// —— 旧版单存档迁移：若 0 号槽为空且存在旧 key，则把旧档迁到 0 号槽（仅迁一次）——
function migrateLegacy() {
  try {
    if (!storage) return;
    const legacy = storage.getItem(LEGACY_KEY);
    if (legacy == null) return;
    if (storage.getItem(slotKey(0)) != null) return; // 0 号槽已有内容则不动
    storage.setItem(slotKey(0), legacy);
    storage.removeItem(LEGACY_KEY);
  } catch (_) { /* 迁移失败不影响主流程 */ }
}

// 读取某个槽位的原始玩家对象（已 migrate），不存在或损坏返回 null。
export function loadFromSlot(slot) {
  try {
    if (!storage || !validSlot(slot)) return null;
    migrateLegacy();
    const raw = storage.getItem(slotKey(slot));
    if (!raw) return null;
    const player = JSON.parse(raw);
    migrate(player);
    return player;
  } catch (_) { return null; }
}

// 列举所有槽位的概要信息，供存档管理 UI 展示。
// 返回数组：[{ slot, exists, name, weeks, turn, career, ageOk, lastSeen }]
export function listSaves() {
  const out = [];
  for (let i = 0; i < SAVE_SLOTS; i++) {
    const p = loadFromSlot(i);
    out.push({
      slot: i,
      exists: !!p,
      name: p ? p.name : null,
      weeks: p ? p.weeks : null,
      turn: p ? p.turn : null,
      career: p ? p.career : null,
      lastSeen: p ? p.lastSeen : 0,
    });
  }
  return out;
}

// 是否存在任意存档（启动器决定显示「继续」与否）。
export function hasAnySave() {
  try {
    migrateLegacy();
    if (!storage) return false;
    for (let i = 0; i < SAVE_SLOTS; i++) if (storage.getItem(slotKey(i)) != null) return true;
    return false;
  } catch (_) { return false; }
}

// 取最近游玩的槽位（lastSeen 最大者），无存档返回 null。
// lastSeen 同值时（如同秒内多次保存）以槽位号大者优先，使「最后写入」者胜出，结果确定。
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

// 删除指定槽位。
export function deleteSlot(slot) {
  try {
    if (!storage || !validSlot(slot)) return false;
    storage.removeItem(slotKey(slot));
    return true;
  } catch (_) { return false; }
}

// 导出为可分享的 base64 字符串（UTF-8 安全），与槽位无关，针对单个 player 对象。
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
  // 家庭出身：旧档无则按「寻常人家」补全（影响可触发事件）。
  if (typeof player.background !== 'string' || !player.background) player.background = 'ordinary';
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
  // 最近事件去重记录：补齐为数组。
  if (!Array.isArray(player.recent)) player.recent = [];
  // 挂机配置：补全并规范化（绝不擅自开启）。
  player.autoplay = normalizeAutoPlay(player.autoplay);
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

export { SLOT_PREFIX, LEGACY_KEY, ATTRS, ATTR_MIN, ATTR_MAX };
