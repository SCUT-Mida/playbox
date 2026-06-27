// ============================================================================
// 存档：localStorage 持久化 + 导入导出（base64）+ 离线修炼收益结算 + 多存档槽。
// 通过 storage 访问器隔离 localStorage，便于在 Node 单测中注入内存版。
// 槽位 key：frxx_slot_<n>（1..NUM_SLOTS）；当前活跃槽记录于 frxx_activeslot。
// 旧的 frxx_save_v1 单存档会在首启时迁移到槽 1。
// ============================================================================
import { recompute } from './player.js';
import {
  OFFLINE_CAP_HOURS, OFFLINE_EFFICIENCY, passiveXpPerSec, cultivateSpeedMult, nowSec,
  vitalityMax,
} from '../config.js';

const NUM_SLOTS = 5;
const SLOT_PREFIX = 'frxx_slot_';
const ACTIVE_KEY = 'frxx_activeslot';
const LEGACY_KEY = 'frxx_save_v1';

let storage = null;
try {
  if (typeof localStorage !== 'undefined') storage = localStorage;
} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }

// 测试 / 注入用
export function _setStorage(s) { storage = s; }
export function _NUM_SLOTS() { return NUM_SLOTS; }

function slotKey(n) { return `${SLOT_PREFIX}${n}`; }

// 当前活跃槽（1..NUM_SLOTS），无记录默认 1
export function getActiveSlot() {
  const raw = storage ? storage.getItem(ACTIVE_KEY) : null;
  const n = parseInt(raw, 10);
  return (n >= 1 && n <= NUM_SLOTS) ? n : 1;
}
export function setActiveSlot(n) {
  try { if (storage) storage.setItem(ACTIVE_KEY, String(n)); } catch (_) {}
}

// 旧版单存档迁移到槽 1（仅首启一次）
export function migrateLegacy() {
  if (!storage) return;
  try {
    const old = storage.getItem(LEGACY_KEY);
    if (old && !storage.getItem(slotKey(1))) {
      storage.setItem(slotKey(1), old);
    }
    if (old) storage.removeItem(LEGACY_KEY);
  } catch (_) {}
}

// —— 兼容旧 API（操作「活跃槽」，默认槽 1），供单测与历史调用方使用 ——
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
    migrate(player);
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

// —— 多槽 API ——
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
export function loadSlot(n) {
  setActiveSlot(n);
  return loadGame(n);
}
export function saveSlot(n, player) {
  if (player) player.slot = n;
  setActiveSlot(n);
  return saveGame(player);
}
export function deleteSlot(n) {
  try { if (storage) storage.removeItem(slotKey(n)); return true; } catch (_) { return false; }
}

// 由存档玩家派生展示用元信息（避免整份解析进 UI）
function slotMeta(p, n) {
  const tier = p.tier || 0;
  const sub = p.sub || 0;
  const realmName = realmMajor(tier);
  return {
    slot: n,
    empty: false,
    name: p.name || '无名修士',
    gender: p.gender || 'male',
    portraitId: p.portraitId,
    realm: `${realmName}${realmSub(tier, sub)}`,
    tier,
    lv: p.lv || 0,
    stones: Math.floor(p.stones || 0),
    ascended: !!p.ascended,
    lastSeen: p.lastSeen || 0,
    createdAt: p.createdAt || 0,
  };
}
function realmMajor(tier) {
  // 避免与 player.realmName 产生循环依赖：内联一份极简查表
  const names = ['凡人', '炼气期', '筑基期', '结丹期', '元婴期', '化神期', '炼虚期', '合体期', '大乘期', '飞升'];
  return names[tier] || '凡人';
}
function realmSub(tier, sub) {
  const subsByTier = [
    ['凡人'],
    ['一层','二层','三层','四层','五层','六层','七层','八层','九层','十层','十一层','十二层','十三层'],
    ['初期','中期','后期','圆满','巅峰'],
    ['初期','中期','后期','圆满','巅峰'],
    ['初期','中期','后期','圆满','巅峰'],
    ['初期','中期','后期','圆满','巅峰'],
    ['初期','中期','后期','圆满','巅峰'],
    ['初期','中期','后期','巅峰'],
    ['初期','中期','后期','巅峰'],
    ['飞升成仙'],
  ];
  const arr = subsByTier[tier];
  return arr && arr[sub] != null ? arr[sub] : '';
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
  if (!player) return player;
  // 境界兜底：tier/sub 缺失或非法时归零，避免下游 REALMS[tier] 越界致整页闪退
  if (!Number.isFinite(player.tier) || player.tier < 0) player.tier = 0;
  if (!Number.isFinite(player.sub) || player.sub < 0) player.sub = 0;
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
  // v2：人物设定 + 每日活力
  if (!player.gender) player.gender = 'male';
  if (!player.name) player.name = '';
  if (!player.talentIds) player.talentIds = [];
  if (player.qiyun == null) player.qiyun = 50;
  if (!player.bgId) player.bgId = 'bg_liumin';
  if (!player.portraitId) player.portraitId = 'pt_m_default';
  if (player.vitality == null) player.vitality = 0;
  if (player.maxVitality == null) player.maxVitality = vitalityMax(player);
  if (!player.lastVitalityDate) player.lastVitalityDate = '';
  if (!player.restUsedDate) player.restUsedDate = '';
  if (player.slot == null) player.slot = 1;
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
