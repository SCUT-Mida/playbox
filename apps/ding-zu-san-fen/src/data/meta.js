// 元进度系统：跨对局持久化的金币 / 已解锁武将 / 通关记录 / 静音状态
// 与"对局内金币"（用于部署/升级）相互独立 —— 这里是"主公府"层面的战略货币，
// 通关获得、抽卡消耗。localStorage 不可用时回退到内存，保证纯逻辑测试可用。

import { GENERALS, GENERAL_BY_ID } from './generals.js';

const STORAGE_KEY = 'dzsf_meta_v1';

// 开局默认解锁的武将：覆盖近战/远程/策士三类，并具备五虎+桃园雏形，足以通关教学关
export const STARTER_GENERALS = ['guanyu', 'zhangfei', 'zhaoyun', 'huangzhong', 'zhuge'];

// 抽卡价格
export const DRAW_COST = 150;
export const DRAW_COST_TEN = 1350; // 十连九折

// 通关金币奖励（每次通关）+ 首通额外奖励（仅首次）
export const LEVEL_REWARD = { huangjin: 220, hulao: 320 };
export const FIRST_CLEAR_BONUS = 150;

function defaults() {
  return {
    gold: 0,
    unlocked: [...STARTER_GENERALS],
    cleared: [],
    muted: false,
  };
}

let cache = null;

function storageAvailable() {
  try {
    return typeof localStorage !== 'undefined' && localStorage;
  } catch {
    return false;
  }
}

export function loadMeta() {
  if (cache) return cache;
  const base = defaults();
  if (storageAvailable()) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        cache = {
          gold: typeof p.gold === 'number' ? p.gold : base.gold,
          // 解锁列表若损坏则回退默认阵容，避免开局无将可用
          unlocked: Array.isArray(p.unlocked) && p.unlocked.length
            ? p.unlocked : base.unlocked,
          cleared: Array.isArray(p.cleared) ? p.cleared : base.cleared,
          muted: !!p.muted,
        };
        return cache;
      }
    } catch {
      // 解析失败回退默认
    }
  }
  cache = base;
  return cache;
}

export function saveMeta() {
  if (!cache) return;
  if (storageAvailable()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch {
      // 配额/隐私模式写入失败 —— 仍保留内存缓存，本局正常游玩
    }
  }
}

export function getMeta() {
  return loadMeta();
}

export function resetMeta() {
  cache = defaults();
  saveMeta();
  return cache;
}

// —— 供测试在隔离环境下重置内存缓存 ——
export function _resetCache() {
  cache = null;
}

export function isUnlocked(id) {
  return loadMeta().unlocked.includes(id);
}

export function unlockedGenerals() {
  const set = new Set(loadMeta().unlocked);
  return GENERALS.filter((g) => set.has(g.id));
}

export function lockedCount() {
  return GENERALS.length - loadMeta().unlocked.length;
}

export function addGold(n) {
  const m = loadMeta();
  m.gold = Math.max(0, Math.round(m.gold + n));
  saveMeta();
  return m.gold;
}

// 仅在足够时扣费并返回 true；不足返回 false 且不修改状态
export function spendGold(n) {
  const m = loadMeta();
  if (m.gold < n) return false;
  m.gold -= n;
  saveMeta();
  return true;
}

export function unlockGeneral(id) {
  if (!GENERAL_BY_ID[id]) return false;
  const m = loadMeta();
  if (m.unlocked.includes(id)) return false;
  m.unlocked.push(id);
  saveMeta();
  return true;
}

export function isMuted() {
  return !!loadMeta().muted;
}

export function setMuted(v) {
  const m = loadMeta();
  m.muted = !!v;
  saveMeta();
  return m.muted;
}

// 通关结算：基础奖励(每次) + 首通奖励(仅首次)；返回明细供结算界面展示
export function grantLevelClear(key) {
  const m = loadMeta();
  const base = LEVEL_REWARD[key] || 0;
  const first = !m.cleared.includes(key);
  if (first) m.cleared.push(key);
  const bonus = first ? FIRST_CLEAR_BONUS : 0;
  m.gold += base + bonus;
  saveMeta();
  return { base, bonus, total: base + bonus, first };
}

// —— 抽卡核心（纯函数，便于测试）——

// 尚未解锁的武将池
export function lockedPool(meta = loadMeta()) {
  const have = new Set(meta.unlocked);
  return GENERALS.filter((g) => !have.has(g.id));
}

// 权重：便宜的武将更易出（260/费用，最低 1）
export function drawWeights(pool) {
  return pool.map((g) => Math.max(1, Math.round(260 / g.cost)));
}

// 从池中按权重抽取一个 id（不修改状态）。rng 注入便于确定性测试
export function rollDraw(meta = loadMeta(), rng = Math.random) {
  const pool = lockedPool(meta);
  if (pool.length === 0) return { id: null, allCollected: true };
  const weights = drawWeights(pool);
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = rng() * sum;
  let pick = pool[pool.length - 1];
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) { pick = pool[i]; break; }
  }
  return { id: pick.id, allCollected: false };
}

// 执行单抽：扣费 + 解锁（池空返回 allCollected，金币不足返回 null）
export function performDraw(rng = Math.random) {
  const m = loadMeta();
  if (lockedPool(m).length === 0) return { allCollected: true };
  if (m.gold < DRAW_COST) return null;
  m.gold -= DRAW_COST;
  const { id } = rollDraw(m, rng);
  if (id) m.unlocked.push(id);
  saveMeta();
  return { id, allCollected: false, remaining: m.gold };
}

// 执行十连：扣费 + 依次解锁（中途集齐则提前结束，已扣费用作"溢出捐赠"）
export function performDrawTen(rng = Math.random) {
  const m = loadMeta();
  if (m.gold < DRAW_COST_TEN) return null;
  m.gold -= DRAW_COST_TEN;
  const got = [];
  for (let i = 0; i < 10; i++) {
    if (lockedPool(m).length === 0) break;
    const { id } = rollDraw(m, rng);
    if (id) {
      m.unlocked.push(id);
      got.push(id);
    }
  }
  saveMeta();
  return { got, remaining: m.gold };
}
