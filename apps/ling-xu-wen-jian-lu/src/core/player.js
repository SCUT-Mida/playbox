// ============================================================================
// 玩家状态：资源 / 卡牌收藏 / 阵容 / 统计。纯函数（除 localStorage 由 save.js 处理）。
// ============================================================================
import { START_RESOURCES, RESOURCES, clamp } from '../config.js';
import { CARDS, CARD_MAP } from '../data/cards.js';
import { newInstance, instancePower } from './card.js';

// 起始赠送 4 张 R 卡，保证开局即可排出一支能打的队伍。
const STARTER_CARDS = ['R001', 'R003', 'R006', 'R007'];

export function newPlayer() {
  const cards = {};
  const frags = {};
  const codex = {};
  for (const id of STARTER_CARDS) {
    cards[id] = newInstance(id);
    frags[id] = 0;
    codex[id] = true;
  }
  return {
    res: { ...START_RESOURCES },
    cards,
    frags,
    codex,
    formation: ['R001', 'R003', 'R006', 'R007', null], // 1 主坦位、2 输出位…
    pity: { sinceSSR: 0, sinceSR: 0, total: 0 },
    dailyFreeDate: '',
    story: { clearedStages: {}, highestChapter: 1 },
    secret: { floor: 1, bestFloor: 1, saveFloor: 1 },
    cave: { lastSeen: 0 },
    stats: {
      draws: 0, ssr: 0, sr: 0, r: 0,
      battlesWon: 0, battlesLost: 0, stagesCleared: 0,
      secretFloors: 0, starsTotal: 0,
    },
    achievements: [],
    createdAt: 0,
    lastSeen: 0,
  };
}

// 幂等重算 / 迁移：补齐缺失字段、钳制数值，保证存档向后兼容。
export function recompute(player) {
  if (!player) return player;
  if (!player.res || typeof player.res !== 'object') player.res = {};
  for (const r of RESOURCES) {
    if (!Number.isFinite(player.res[r.id])) player.res[r.id] = START_RESOURCES[r.id] || 0;
    if (player.res[r.id] < 0) player.res[r.id] = 0;
  }
  if (!player.cards || typeof player.cards !== 'object') player.cards = {};
  if (!player.frags || typeof player.frags !== 'object') player.frags = {};
  if (!player.codex || typeof player.codex !== 'object') player.codex = {};
  // 卡牌实例字段兜底
  for (const id of Object.keys(player.cards)) {
    const inst = player.cards[id];
    if (!inst) continue;
    if (!Number.isFinite(inst.level) || inst.level < 1) inst.level = 1;
    if (!Number.isFinite(inst.br) || inst.br < 0) inst.br = 0;
    if (!Number.isFinite(inst.star) || inst.star < 0) inst.star = 0;
    if (!Number.isFinite(inst.skillLv) || inst.skillLv < 1) inst.skillLv = 1;
    if (!Number.isFinite(inst.exp) || inst.exp < 0) inst.exp = 0;
  }
  if (!Array.isArray(player.formation) || player.formation.length !== 5) {
    player.formation = ['R001', 'R003', 'R006', 'R007', null];
  }
  // 阵容中引用的卡牌必须已拥有，否则置空
  player.formation = player.formation.map((id) => (id && player.cards[id] ? id : null));
  if (!player.pity || typeof player.pity !== 'object') player.pity = { sinceSSR: 0, sinceSR: 0, total: 0 };
  if (!player.dailyFreeDate) player.dailyFreeDate = '';
  if (!player.story || typeof player.story !== 'object') player.story = { clearedStages: {}, highestChapter: 1 };
  if (!player.story.clearedStages) player.story.clearedStages = {};
  if (!Number.isFinite(player.story.highestChapter) || player.story.highestChapter < 1) player.story.highestChapter = 1;
  if (!player.secret || typeof player.secret !== 'object') player.secret = { floor: 1, bestFloor: 1, saveFloor: 1 };
  for (const k of ['floor', 'bestFloor', 'saveFloor']) {
    if (!Number.isFinite(player.secret[k]) || player.secret[k] < 1) player.secret[k] = 1;
  }
  if (!player.cave || typeof player.cave !== 'object') player.cave = { lastSeen: 0 };
  if (!player.stats || typeof player.stats !== 'object') player.stats = {};
  const dflt = { draws: 0, ssr: 0, sr: 0, r: 0, battlesWon: 0, battlesLost: 0, stagesCleared: 0, secretFloors: 0, starsTotal: 0 };
  for (const k of Object.keys(dflt)) if (!Number.isFinite(player.stats[k])) player.stats[k] = dflt[k];
  if (!Array.isArray(player.achievements)) player.achievements = [];
  if (!Number.isFinite(player.createdAt)) player.createdAt = 0;
  if (!Number.isFinite(player.lastSeen)) player.lastSeen = 0;
  // 重算星级总数统计
  player.stats.starsTotal = totalStars(player);
  return player;
}

// ── 资源 ────────────────────────────────────────────────────────────────────
export function addRes(player, id, qty) {
  if (!id || !Number.isFinite(qty)) return;
  player.res[id] = (player.res[id] || 0) + qty;
  if (player.res[id] < 0) player.res[id] = 0;
}
export function countRes(player, id) { return Math.max(0, Math.floor(player.res[id] || 0)); }
export function canAfford(player, costs) {
  if (!costs) return true;
  for (const [id, qty] of Object.entries(costs)) {
    if (countRes(player, id) < qty) return false;
  }
  return true;
}
export function spendRes(player, costs) {
  if (!canAfford(player, costs)) return false;
  if (!costs) return true;
  for (const [id, qty] of Object.entries(costs)) player.res[id] -= qty;
  return true;
}

// ── 卡牌 / 碎片 ──────────────────────────────────────────────────────────────
// 拥有一张卡（若未拥有则创建实例并登记图鉴）。返回是否为新获得。
export function ownCard(player, cardId) {
  if (!CARD_MAP[cardId]) return false;
  let isNew = false;
  if (!player.cards[cardId]) {
    player.cards[cardId] = newInstance(cardId);
    isNew = true;
  }
  if (!player.codex[cardId]) { player.codex[cardId] = true; isNew = true; }
  if (player.frags[cardId] == null) player.frags[cardId] = 0;
  return isNew;
}
export function addFrag(player, cardId, qty) {
  if (!qty) return;
  player.frags[cardId] = (player.frags[cardId] || 0) + qty;
}
export function countFrag(player, cardId) { return Math.max(0, Math.floor(player.frags[cardId] || 0)); }
export function hasCard(player, cardId) { return !!player.cards[cardId]; }

// ── 阵容 ────────────────────────────────────────────────────────────────────
export function setFormation(player, slots) {
  if (!Array.isArray(slots) || slots.length !== 5) return false;
  // 校验：引用的卡必须已拥有；同一卡不可重复上阵
  const seen = new Set();
  const next = slots.map((id) => {
    if (!id) return null;
    if (!player.cards[id] || seen.has(id)) return null;
    seen.add(id);
    return id;
  });
  player.formation = next;
  return true;
}
// 当前阵容的有效实例列表（带 position，1..5），跳过空位
export function activeFormation(player) {
  const out = [];
  for (let i = 0; i < 5; i++) {
    const id = player.formation[i];
    if (id && player.cards[id]) out.push({ id, instance: player.cards[id], pos: i + 1 });
  }
  return out;
}
export function formationPower(player) {
  return activeFormation(player).reduce((s, c) => s + instancePower(c.instance), 0);
}

// ── 收集 / 图鉴 ──────────────────────────────────────────────────────────────
export function collectionCount(player) { return Object.keys(player.codex).length; }
export function collectionTotal() { return CARDS.length; }
export function collectionProgress(player) {
  return collectionTotal() > 0 ? collectionCount(player) / collectionTotal() : 0;
}
export function totalStars(player) {
  let s = 0;
  for (const inst of Object.values(player.cards)) s += (inst.star || 0);
  return s;
}

// 图鉴收集奖励档位（设计稿 6.3）
export const CODEX_TIERS = [
  { pct: 0.50, reward: { wendao: 10 }, label: '问道令×10' },
  { pct: 0.80, reward: { tiandao_f: 3 }, label: '天道本源·碎片×3' },
  { pct: 1.00, reward: { tiandao: 1 }, label: '天道本源×1（限定彩礼）' },
];
