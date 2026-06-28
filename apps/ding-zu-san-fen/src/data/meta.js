// 元进度系统：跨对局持久化的金币 / 已解锁武将 / 武将星级 / 通关记录 / 静音状态
// 与"对局内金币"（用于部署/升级）相互独立 —— 这里是"主公府"层面的战略货币，
// 通关获得、抽卡消耗。localStorage 不可用时回退到内存，保证纯逻辑测试可用。

import { GENERALS, GENERAL_BY_ID } from './generals.js';

const LEGACY_KEY = 'dzsf_meta_v2';        // 旧版单档，首启时迁移至槽 1
const SLOT_PREFIX = 'dzsf_meta_v2_slot_'; // 多存档槽：每槽一份独立进度（金币/武将/通关）
const ACTIVE_KEY = 'dzsf_activeslot';     // 当前活跃槽（1..NUM_SLOTS）
export const NUM_SLOTS = 5;

// 开局默认解锁的武将：仅作为"保底可玩"的最小阵容，覆盖近战/远程/策士三类且跨蜀/魏/吴三国，
// 不再清一色同国 —— 主力阵容交由玩家用开局金币去点将台抽取（多国、随机）。
export const STARTER_GENERALS = ['zhaoyun', 'caocao', 'zhouyu'];

// 开局赠送的金币：足够一次十连（DRAW_COST_TEN）并留少量余裕，让初始阵容"来自抽卡"。
export const START_GOLD = 1500;

// 抽卡价格
export const DRAW_COST = 150;
export const DRAW_COST_TEN = 1350; // 十连九折

// —— 星级（合并升级）系统 ——
// 抽到已解锁的相同武将视为"重复卡"，可合并升星；每升 1 星永久提升该武将的攻击/血量。
export const MAX_STAR = 5;
// 每星相对 1 星的属性加成（线性）：1 星为基准 1.0，每多 1 星 +STAR_BONUS。
export const STAR_BONUS = { atk: 0.12, hp: 0.12 };
// 满星后再抽到重复卡：溢出转化为金币（避免浪费）
export const DUPE_GOLD_REFUND = 80;
// 抽卡权重中，未解锁武将的优先倍数 —— 优先获取新将，但已解锁武将仍可被抽到（用于升星合并）
export const LOCK_FAVOR = 4;

export function starAtkMult(star) {
  return 1 + STAR_BONUS.atk * Math.max(0, (star || 0) - 1);
}

export function starHpMult(star) {
  return 1 + STAR_BONUS.hp * Math.max(0, (star || 0) - 1);
}

export function starOf(id) {
  const m = loadMeta();
  return m.stars[id] || 0;
}

// 通关金币奖励（每次通关）+ 首通额外奖励（仅首次）
// 难度越高奖励越丰厚，引导玩家循序渐进
export const LEVEL_REWARD = {
  huangjin: 220, guangzong: 230,
  sishui: 250, jieqiao: 265,
  hulao: 300, puyang: 310, xuzhou: 320, shouchun: 330,
  guandu: 360, cangting: 370, yecheng: 380, changban: 390, jiangling: 400,
  chibi: 430, nanjun: 440, tongguan: 455, hefei: 470, dingjunshan: 485, yiling: 500, nanman: 520,
};
export const FIRST_CLEAR_BONUS = 150;

function defaults() {
  return {
    gold: START_GOLD,
    unlocked: [...STARTER_GENERALS],
    stars: Object.fromEntries(STARTER_GENERALS.map((id) => [id, 1])),
    cleared: [],
    muted: false,
  };
}

let cache = null;
let cacheSlot = null;   // 当前 cache 所属槽位；切槽时失效重建
let activeSlot = null;  // 缓存的活跃槽（与 ACTIVE_KEY 持久化保持一致）

function storageAvailable() {
  try {
    return typeof localStorage !== 'undefined' && localStorage;
  } catch {
    return false;
  }
}

function _slotKey(n) { return `${SLOT_PREFIX}${n}`; }

// 当前活跃槽（1..NUM_SLOTS），无记录默认 1
export function getActiveSlot() {
  if (activeSlot != null) return activeSlot;
  if (storageAvailable()) {
    try {
      const raw = localStorage.getItem(ACTIVE_KEY);
      const n = parseInt(raw, 10);
      activeSlot = (n >= 1 && n <= NUM_SLOTS) ? n : 1;
    } catch {
      activeSlot = 1;
    }
  } else {
    activeSlot = 1;
  }
  return activeSlot;
}

export function setActiveSlot(n) {
  activeSlot = Math.max(1, Math.min(NUM_SLOTS, Math.floor(n) || 1));
  try {
    if (storageAvailable()) localStorage.setItem(ACTIVE_KEY, String(activeSlot));
  } catch {
    /* noop */
  }
  return activeSlot;
}

// 旧版单档（dzsf_meta_v2）迁移到槽 1（仅首启一次），保证老玩家进度不丢失
export function migrateLegacy() {
  if (!storageAvailable()) return;
  try {
    const old = localStorage.getItem(LEGACY_KEY);
    if (old && !localStorage.getItem(_slotKey(1))) {
      localStorage.setItem(_slotKey(1), old);
    }
    if (old) localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* noop */
  }
}

// 由解锁列表推导星级表（旧档无 stars 字段时迁移：已解锁一律视为 1 星）
function migrateStars(unlocked, rawStars) {
  const stars = {};
  for (const id of unlocked) {
    if (!GENERAL_BY_ID[id]) continue;
    const s = rawStars && Number.isFinite(rawStars[id]) ? Math.floor(rawStars[id]) : 1;
    stars[id] = Math.min(MAX_STAR, Math.max(1, s));
  }
  return stars;
}

export function loadMeta() {
  const slot = getActiveSlot();
  if (cache && cacheSlot === slot) return cache;
  migrateLegacy();
  const base = defaults();
  if (storageAvailable()) {
    try {
      const raw = localStorage.getItem(_slotKey(slot));
      if (raw) {
        const p = JSON.parse(raw);
        // 解锁列表若损坏则回退默认阵容，避免开局无将可用
        const unlocked = Array.isArray(p.unlocked) && p.unlocked.length
          ? p.unlocked.filter((id) => GENERAL_BY_ID[id]) : base.unlocked;
        cache = {
          gold: typeof p.gold === 'number' ? p.gold : base.gold,
          unlocked,
          stars: migrateStars(unlocked, p.stars),
          cleared: Array.isArray(p.cleared) ? p.cleared : base.cleared,
          muted: !!p.muted,
        };
        cacheSlot = slot;
        return cache;
      }
    } catch {
      // 解析失败回退默认
    }
  }
  cache = base;
  cacheSlot = slot;
  return cache;
}

export function saveMeta() {
  if (!cache) return;
  if (storageAvailable()) {
    try {
      localStorage.setItem(_slotKey(getActiveSlot()), JSON.stringify(cache));
    } catch {
      // 配额/隐私模式写入失败 —— 仍保留内存缓存，本局正常游玩
    }
  }
}

export function getMeta() {
  return loadMeta();
}

// 重置当前活跃槽为新档（保留解锁/金币进度系统的默认开局）
export function resetMeta() {
  cache = defaults();
  cacheSlot = getActiveSlot();
  saveMeta();
  return cache;
}

// —— 多槽 API ——
// 列出所有槽位的展示用元信息（空槽返回 { slot, empty:true }）
export function listMetaSlots() {
  migrateLegacy();
  const out = [];
  for (let n = 1; n <= NUM_SLOTS; n++) {
    let raw = null;
    try {
      raw = storageAvailable() ? localStorage.getItem(_slotKey(n)) : null;
    } catch {
      raw = null;
    }
    if (!raw) { out.push({ slot: n, empty: true }); continue; }
    try {
      const p = JSON.parse(raw);
      const unlocked = Array.isArray(p.unlocked) ? p.unlocked.filter((id) => GENERAL_BY_ID[id]) : [];
      out.push({
        slot: n,
        empty: false,
        gold: typeof p.gold === 'number' ? p.gold : 0,
        unlockedCount: unlocked.length,
        clearedCount: Array.isArray(p.cleared) ? p.cleared.length : 0,
        totalStars: Object.values(p.stars || {}).reduce((a, s) => a + (s || 0), 0),
      });
    } catch {
      out.push({ slot: n, empty: false, corrupt: true });
    }
  }
  return out;
}

// 选择（切换）活跃槽：失效缓存并载入该槽进度；空槽返回全新默认进度
export function selectSlot(n) {
  setActiveSlot(n);
  cache = null;
  cacheSlot = null;
  return loadMeta();
}

// 删除某槽存档；若删的是当前活跃槽则重置为默认新档
export function deleteSlot(n) {
  try {
    if (storageAvailable()) localStorage.removeItem(_slotKey(n));
  } catch {
    /* noop */
  }
  if (getActiveSlot() === n) {
    cache = defaults();
    cacheSlot = n;
    saveMeta();
  } else if (cacheSlot === n) {
    cache = null;
    cacheSlot = null;
  }
}

// —— 供测试在隔离环境下重置内存缓存 ——
export function _resetCache() {
  cache = null;
  cacheSlot = null;
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
  if (!m.stars[id]) m.stars[id] = 1;
  saveMeta();
  return true;
}

// 武将当前星级（未解锁为 0）
export function generalStar(id) {
  const m = loadMeta();
  return m.stars[id] || 0;
}

// 升星（合并重复卡）；返回是否实际提升
export function upgradeStar(id) {
  const m = loadMeta();
  if (!m.unlocked.includes(id)) return false;
  const cur = m.stars[id] || 1;
  if (cur >= MAX_STAR) return false;
  m.stars[id] = cur + 1;
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
// 抽卡池为全部武将：未解锁的优先出（LOCK_FAVOR 倍权重），
// 已解锁的也会被抽到 —— 此时视为"重复卡"，合并升星；满星则溢出返金。

// 尚未解锁的武将池（仅用于"已收录 X/Y"展示）
export function lockedPool(meta = loadMeta()) {
  const have = new Set(meta.unlocked);
  return GENERALS.filter((g) => !have.has(g.id));
}

// 抽卡池：全部武将（含已解锁，用于抽到重复卡合并升星）
export function drawPool() {
  return GENERALS.slice();
}

// 权重：便宜的武将更易出（260/费用，最低 1）；未解锁再 ×LOCK_FAVOR 优先获取
export function drawWeights(pool = drawPool(), meta = loadMeta()) {
  const have = new Set(meta.unlocked);
  return pool.map((g) => Math.max(1, Math.round(260 / g.cost)) * (have.has(g.id) ? 1 : LOCK_FAVOR));
}

// 从池中按权重抽取一个武将定义（不修改状态）。rng 注入便于确定性测试
export function rollDraw(meta = loadMeta(), rng = Math.random) {
  const pool = drawPool();
  const weights = drawWeights(pool, meta);
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = rng() * sum;
  let pick = pool[pool.length - 1];
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) { pick = pool[i]; break; }
  }
  return pick;
}

// 把抽到的武将 id 结算到 meta：
//   新解锁 → kind:'new'，star 1
//   已解锁且未满星 → 合并升星 kind:'dup'，star+1
//   已满星 → 溢出返金 kind:'max'，refunded=DUPE_GOLD_REFUND
// 不写盘（由调用方统一 saveMeta）。
function applyDrawResult(m, id) {
  if (!GENERAL_BY_ID[id]) return { id, kind: 'invalid' };
  if (!m.unlocked.includes(id)) {
    m.unlocked.push(id);
    m.stars[id] = 1;
    return { id, kind: 'new', star: 1 };
  }
  const cur = m.stars[id] || 1;
  if (cur >= MAX_STAR) {
    m.gold += DUPE_GOLD_REFUND;
    return { id, kind: 'max', star: MAX_STAR, refunded: DUPE_GOLD_REFUND };
  }
  m.stars[id] = cur + 1;
  return { id, kind: 'dup', star: cur + 1 };
}

// 执行单抽：扣费 + 结算（金币不足返回 null，状态不变）
export function performDraw(rng = Math.random) {
  const m = loadMeta();
  if (m.gold < DRAW_COST) return null;
  m.gold -= DRAW_COST;
  const def = rollDraw(m, rng);
  const res = applyDrawResult(m, def.id);
  saveMeta();
  return { ...res, remaining: m.gold };
}

// 执行十连：扣费 + 依次结算（每张可能 新解锁/升星/满星返金）
export function performDrawTen(rng = Math.random) {
  const m = loadMeta();
  if (m.gold < DRAW_COST_TEN) return null;
  m.gold -= DRAW_COST_TEN;
  const got = [];
  let refunded = 0;
  for (let i = 0; i < 10; i++) {
    const def = rollDraw(m, rng);
    const res = applyDrawResult(m, def.id);
    if (res.refunded) refunded += res.refunded;
    got.push(res);
  }
  saveMeta();
  return { got, remaining: m.gold, refunded };
}
