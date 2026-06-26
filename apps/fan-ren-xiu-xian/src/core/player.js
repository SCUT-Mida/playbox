// ============================================================================
// 玩家状态：创建、衍生属性、背包、装备、灵石、修为等核心数据操作（纯逻辑）
// ============================================================================
import {
  REALMS, SPIRIT_ROOTS, globalLevel, xpNeeded,
  baseMaxHp, baseMaxMp, baseAtk, baseDef, baseSpirit,
} from '../config.js';
import { ITEMS } from '../data/items.js';
import { weighted } from './rng.js';

export const START_BAG_CAPACITY = 15; // 初始储物袋容量（物品种类数）

// 新建存档：随机灵根 + 少量初始资源（重玩性）
export function newPlayer(rng) {
  const root = weighted(rng, SPIRIT_ROOTS.map((r) => ({ item: r, weight: r.weight })));
  const player = {
    v: 1,
    tier: 0, sub: 0,
    rootId: root.id,
    xp: 0,
    hp: 0, mp: 0,
    stones: 50 + Math.floor((rng || Math.random)() * 51), // 50~100
    bag: { pill_huitian: 2, herb_qingmu: 3 }, // 新手礼包
    equipment: null,       // 装备的法宝 id
    techniques: [],
    titles: [],
    achievements: [],
    recipes: ['rcp_huitian'], // 初始会炼回血丹
    pity: { explore: 0 },
    chaos: null,
    bagCapacity: START_BAG_CAPACITY,
    stats: { battlesWon: 0, breakthroughs: 0, alchemyFails: 0, alchemyOk: 0, lowHpWins: 0, breakthroughStreak: 0, exploreCount: 0, deaths: 0 },
    createdAt: 0,
    lastSeen: 0,
    ascended: false,
  };
  recompute(player);
  player.hp = player.maxHp;
  player.mp = player.maxMp;
  return player;
}

// 重算所有衍生属性（境界/装备/功法/称号 → maxHp/maxMp/atk/def/spirit/lv/xpMax）
export function recompute(player) {
  const lv = globalLevel(player.tier, player.sub);
  player.lv = lv;
  player.xpMax = xpNeeded(lv);

  const root = rootDef(player.rootId);
  player.rootMult = root.mult;
  player.rootBonus = root.breakBonus;

  let maxHp = baseMaxHp(lv);
  let maxMp = baseMaxMp(lv);
  let atk = baseAtk(lv);
  let def = baseDef(lv);
  let spirit = baseSpirit(lv);

  // 功法加成
  for (const id of player.techniques) {
    const t = ITEMS[id];
    if (!t) continue;
    atk *= 1 + (t.atkPct || 0);
    maxHp *= 1 + (t.hpPct || 0);
  }
  // 装备加成
  player.element = null;
  if (player.equipment && ITEMS[player.equipment]) {
    const tr = ITEMS[player.equipment];
    atk += tr.stats.atk || 0;
    def += tr.stats.def || 0;
    player.element = tr.stats.el || null;
  }

  player.maxHp = Math.round(maxHp);
  player.maxMp = Math.round(maxMp);
  player.atk = Math.round(atk);
  player.def = Math.round(def);
  player.spirit = Math.round(spirit);

  // 上限随境界变化时，收口当前值
  player.hp = Math.min(player.hp || 0, player.maxHp);
  player.mp = Math.min(player.mp || 0, player.maxMp);
  if (player.hp <= 0) player.hp = 1; // 永不真正死亡，保留 1 点
  return player;
}

export function rootDef(id) {
  return SPIRIT_ROOTS.find((r) => r.id === id) || SPIRIT_ROOTS[0];
}

// 灵根提升一档（洗髓丹），返回是否提升
export function upgradeRoot(player) {
  const idx = SPIRIT_ROOTS.findIndex((r) => r.id === player.rootId);
  if (idx < 0 || idx >= SPIRIT_ROOTS.length - 1) return false;
  player.rootId = SPIRIT_ROOTS[idx + 1].id;
  recompute(player);
  return true;
}

// —— 修为 ——
export function addXp(player, amount) {
  if (amount <= 0) return 0;
  // 凡人也能积攒引气入体的修为；满后停在最末（需手动突破）
  const before = player.xp;
  player.xp = Math.min(player.xpMax, player.xp + amount);
  return player.xp - before;
}

export function isXpFull(player) { return player.xp >= player.xpMax; }

// —— 灵石 ——
export function addStones(player, n) { player.stones += n; }
export function spendStones(player, n) {
  if (player.stones < n) return false;
  player.stones -= n;
  return true;
}

// —— 背包 ——
export function distinctItems(player) {
  return Object.keys(player.bag).filter((id) => player.bag[id] > 0);
}
export function bagFull(player) {
  return distinctItems(player).length >= player.bagCapacity;
}
export function countItem(player, id) { return player.bag[id] || 0; }
export function hasItem(player, id, qty = 1) { return countItem(player, id) >= qty; }

// 增加物品（自动堆叠；新种类且背包满则拒绝）
export function addItem(player, id, qty = 1) {
  if (qty <= 0) return qty;
  if (!player.bag[id] && bagFull(player)) {
    // 背包满，新种类无法放入；已有种类仍可堆叠
    return 0;
  }
  player.bag[id] = (player.bag[id] || 0) + qty;
  return qty;
}
export function removeItem(player, id, qty = 1) {
  if ((player.bag[id] || 0) < qty) return false;
  player.bag[id] -= qty;
  if (player.bag[id] <= 0) delete player.bag[id];
  return true;
}

// —— 装备 ——
export function equip(player, treasureId) {
  if (!ITEMS[treasureId] || ITEMS[treasureId].type !== 'treasure') return false;
  if (!hasItem(player, treasureId, 1)) return false;
  const prev = player.equipment;
  // 换装时旧装备需回背包：若旧装备为新种类，且取下当前这件后仍腾不出空位（堆叠中），
  // 则拒绝操作——否则 addItem 返回 0 会销毁旧装备。
  if (prev && !player.bag[prev]) {
    const freesSlot = (player.bag[treasureId] || 0) <= 1; // 当前件仅剩 1 个时，移除会腾出一个种类位
    if (!freesSlot && bagFull(player)) return false;
  }
  removeItem(player, treasureId, 1);
  player.equipment = treasureId;
  if (prev) addItem(player, prev, 1); // 旧装备回背包
  recompute(player);
  return true;
}
export function unequip(player) {
  if (!player.equipment) return false;
  const prev = player.equipment;
  // 卸下前确认背包能装下（旧装备是新种类且背包已满时拒绝，避免装备被销毁）
  if (!player.bag[prev] && bagFull(player)) return false;
  player.equipment = null;
  addItem(player, prev, 1);
  recompute(player);
  return true;
}

// 法宝耐久相关（简化：装备中的法宝参与战斗时消耗耐久；耐久归零自动卸下并消失）
export function treasureDurabilityKey(treasureId) { return `dur_${treasureId}`; }

// —— 功法 / 配方 / 称号 ——
export function learnTechnique(player, id) {
  if (!ITEMS[id] || ITEMS[id].type !== 'technique' || player.techniques.includes(id)) return false;
  player.techniques.push(id);
  recompute(player);
  return true;
}
export function learnRecipe(player, id) {
  if (player.recipes.includes(id)) return false;
  player.recipes.push(id);
  return true;
}
export function grantTitle(player, id) {
  if (player.titles.includes(id)) return false;
  player.titles.push(id);
  recompute(player);
  return true;
}
export function grantAchievement(player, id) {
  if (player.achievements.includes(id)) return false;
  player.achievements.push(id);
  return true;
}

// —— 恢复 ——
export function fullHeal(player) { player.hp = player.maxHp; player.mp = player.maxMp; }
export function healHp(player, pct) { player.hp = Math.min(player.maxHp, player.hp + Math.round(player.maxHp * pct)); }
export function healMp(player, pct) { player.mp = Math.min(player.maxMp, player.mp + Math.round(player.maxMp * pct)); }

// 扩容储物袋
export function expandBag(player) {
  const cost = bagExpandCost(player);
  if (!spendStones(player, cost)) return false;
  player.bagCapacity += 5;
  return true;
}
export function bagExpandCost(player) {
  const times = (player.bagCapacity - START_BAG_CAPACITY) / 5;
  return 200 * (times + 1);
}

// 当前境界信息
export function realmInfo(player) {
  const realm = REALMS[player.tier];
  return { realm, subName: realm.subs[player.sub], majorName: realm.name };
}
