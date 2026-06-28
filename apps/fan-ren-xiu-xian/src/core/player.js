// ============================================================================
// 玩家状态：创建、衍生属性、背包、装备、灵石、修为等核心数据操作（纯逻辑）
// ============================================================================
import {
  REALMS, SPIRIT_ROOTS, ASCEND_INDEX, globalLevel, xpNeeded,
  baseMaxHp, baseMaxMp, baseAtk, baseDef, baseSpirit,
  MAX_VITALITY, VITALITY_COSTS, vitalityMax, dayKey, nowSec, clamp,
  sanitizeRealm,
} from '../config.js';
import { ITEMS } from '../data/items.js';
import { TALENTS, TALENT_LIST, BACKGROUNDS, BACKGROUND_LIST, pickPortrait } from '../data/characters.js';
import { weighted, pick } from './rng.js';

export const START_BAG_CAPACITY = 15; // 初始储物袋容量（物品种类数）

// 创角随机：天赋数量（多数 1，运气好 2，罕有 3）
export function rollTalents(rng) {
  const r = rng || Math.random;
  const roll = r();
  const count = roll > 0.95 ? 3 : roll > 0.7 ? 2 : 1;
  const pool = TALENT_LIST.slice();
  const out = [];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(r() * pool.length);
    out.push(pool.splice(idx, 1)[0].id);
  }
  return out;
}

// 创角模板：性别 + 灵根 + 天赋 + 气运 + 出身 + 形象（不含名字，名字由 UI 单独设定）
export function rollCharacter(rng) {
  const r = rng || Math.random;
  const gender = r() < 0.5 ? 'male' : 'female';
  const root = weighted(r, SPIRIT_ROOTS.map((x) => ({ item: x, weight: x.weight })));
  const talentIds = rollTalents(r);
  const qiyun = 30 + Math.floor(r() * 71); // 30~100
  const bg = pick(r, BACKGROUND_LIST);
  const portrait = pickPortrait(gender, talentIds);
  return { gender, rootId: root.id, talentIds, qiyun, bgId: bg.id, portraitId: portrait.id };
}

// 读取某项天赋加成的累加值（加算字段）
export function talentField(player, field, dflt = 0) {
  let s = dflt;
  for (const id of (player && player.talentIds) || []) {
    const t = TALENTS[id];
    if (t && typeof t[field] === 'number') s += t[field];
  }
  return s;
}
// 炼丹/炼器成率加成
export function talentAlchemyBonus(player) { return talentField(player, 'alchemyBonus'); }
// 生效气运（基础 + 天赋），钳制 0~100
export function effectiveQiyun(player) {
  return clamp((player.qiyun || 50) + talentField(player, 'qiyunBonus'), 0, 100);
}

// 新建存档：可选 template（来自创角 UI）；缺省则全随机（保持 newPlayer(rng) 旧行为）
export function newPlayer(rng, template) {
  const r = rng || Math.random;
  const t = template || rollCharacter(r);
  const root = rootDef(t.rootId);
  const bg = BACKGROUNDS[t.bgId] || BACKGROUND_LIST[0];
  const player = {
    v: 5,
    slot: t.slot || 1,
    gender: t.gender || 'male',
    name: t.name || '',
    rootId: root.id,
    talentIds: (t.talentIds || []).slice(),
    qiyun: t.qiyun != null ? t.qiyun : 50,
    bgId: bg.id,
    portraitId: t.portraitId || pickPortrait(t.gender || 'male', t.talentIds || []).id,
    tier: 0, sub: 0,
    xp: 0,
    hp: 0, mp: 0,
    stones: 50 + Math.floor(r() * 51), // 50~100
    bag: { pill_huitian: 2, herb_qingmu: 3 }, // 新手礼包
    equipment: { weapon: null, armor: null }, // 装备的法宝：按槽位（攻伐/镇御），同类仅一件
    techniques: [],
    titles: [],
    achievements: [],
    recipes: ['rcp_huitian'], // 初始会炼回血丹
    pity: { explore: 0 },
    chaos: null,
    bagCapacity: START_BAG_CAPACITY,
    vitality: 0,            // 每日活力（recompute 后置满）
    maxVitality: MAX_VITALITY,
    lastVitalityDate: '',
    restUsedDate: '',       // 「闭关静修」兜底上次使用的日期键（每日仅一次）
    // 宗门系统（v3）：未入宗门时 sectId=null，相关字段保持空值
    sectId: null,
    sectRep: 0,
    sectTasks: [],
    sectTaskDate: '',
    sectRewardDate: '',
    challengeTasks: [],     // 悬赏挑战（v4）：自主领取，难度随境界缩放
    npcs: {},               // 道友系统（v4）：npcId → { met, aff, teamedDate }
    stats: { battlesWon: 0, breakthroughs: 0, alchemyFails: 0, alchemyOk: 0, lowHpWins: 0, breakthroughStreak: 0, exploreCount: 0, deaths: 0 },
    createdAt: nowSec(),
    lastSeen: 0,
    ascended: false,
  };
  applyBackgroundBonus(player, bg);
  recompute(player);
  player.maxVitality = vitalityMax(player);
  player.vitality = player.maxVitality;
  player.lastVitalityDate = dayKey();
  player.hp = player.maxHp;
  player.mp = player.maxMp;
  return player;
}

// 出身奖励：灵石 / 物品
function applyBackgroundBonus(player, bg) {
  const b = bg && bg.bonus;
  if (!b) return;
  if (b.stones) player.stones += b.stones;
  if (b.items) for (const it of b.items) addItem(player, it.id, it.qty);
}

// 重算所有衍生属性（境界/装备/功法/称号 → maxHp/maxMp/atk/def/spirit/lv/xpMax）
export function recompute(player) {
  // 先把境界钳制到合法区间：损坏/导入/旧版存档可能带非法 tier/sub，
  // 不兜底则下方 globalLevel / 后续 realmInfo 会越界抛错致整页闪退。
  sanitizeRealm(player);
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

  // 天赋：固定值加成（攻/防/神识）
  atk += talentField(player, 'atkFlat');
  def += talentField(player, 'defFlat');
  spirit += talentField(player, 'spiritFlat');

  // 功法加成
  for (const id of player.techniques) {
    const t = ITEMS[id];
    if (!t) continue;
    atk *= 1 + (t.atkPct || 0);
    maxHp *= 1 + (t.hpPct || 0);
  }
  // 装备加成：攻伐 + 镇御两槽同时生效（同类仅一件，互不冲突）
  player.equipment = normalizeEquip(player.equipment);
  player.element = null;
  for (const tr of equippedList(player)) {
    atk += (tr.stats && tr.stats.atk) || 0;
    def += (tr.stats && tr.stats.def) || 0;
  }
  // 五行取自所装备法宝：优先攻伐槽，其次镇御槽
  for (const id of [player.equipment.weapon, player.equipment.armor]) {
    if (id && ITEMS[id] && ITEMS[id].stats && ITEMS[id].stats.el) { player.element = ITEMS[id].stats.el; break; }
  }

  // 天赋：百分比加成（气血/灵力上限，叠加在基底之上）
  maxHp *= 1 + talentField(player, 'hpPct');
  maxMp *= 1 + talentField(player, 'mpPct');

  player.maxHp = Math.round(maxHp);
  player.maxMp = Math.round(maxMp);
  player.atk = Math.round(atk);
  player.def = Math.round(def);
  player.spirit = Math.round(spirit);

  // 每日活力上限随天赋变化
  player.maxVitality = vitalityMax(player);
  if ((player.vitality || 0) > player.maxVitality) player.vitality = player.maxVitality;

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
// 溢出可累积：修为超出当前境界所需(满额)后并不作废，而是继续累积，
// 突破成功时由 advanceRealm 把"满额之外"的修为结转至下一境界，避免闭关成果被清零浪费。
export function addXp(player, amount) {
  if (amount <= 0) return 0;
  const before = player.xp;
  player.xp = before + amount;
  return player.xp - before;
}

// 当前溢出的修为（满额之外、可结转的部分）
export function xpOverflow(player) {
  return Math.max(0, (player.xp || 0) - (player.xpMax || 0));
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

// 入袋并生成日志条目：成功为「+N × 名」(good)；背包满致新种类无法放入则为「背包已满，名 遗失」(bad)。
// 统一收敛所有「奖励/产出入袋」路径，杜绝 addItem 返回 0 被忽略而静默丢物（炼丹/炼器/战斗/坊市等同源缺陷）。
export function addItemOrLog(player, id, qty = 1) {
  const added = addItem(player, id, qty);
  const name = ITEMS[id] ? ITEMS[id].name : id;
  return {
    added,
    log: added > 0
      ? { text: `+${added} × ${name}`, type: 'good' }
      : { text: `背包已满，${name} 遗失`, type: 'bad' },
  };
}
export function removeItem(player, id, qty = 1) {
  if ((player.bag[id] || 0) < qty) return false;
  player.bag[id] -= qty;
  if (player.bag[id] <= 0) delete player.bag[id];
  return true;
}

// —— 装备（多槽位：攻伐 / 镇御，同类仅一件）——
// 把任意形态的 equipment 归一化为 { weapon, armor }：
//  - 新版对象：校验每个槽位确为对应类型的法宝（防损坏档串槽）；
//  - 旧版单装备字符串：按法宝自身 slot 归入对应槽（向后兼容旧存档）；
//  - null / 非法值：两槽皆空。
export function normalizeEquip(e) {
  if (e && typeof e === 'object' && !Array.isArray(e)) {
    const valid = (id, slot) => (typeof id === 'string' && ITEMS[id] && ITEMS[id].slot === slot) ? id : null;
    return { weapon: valid(e.weapon, 'weapon'), armor: valid(e.armor, 'armor') };
  }
  if (typeof e === 'string' && ITEMS[e] && ITEMS[e].slot) {
    return { weapon: ITEMS[e].slot === 'weapon' ? e : null, armor: ITEMS[e].slot === 'armor' ? e : null };
  }
  return { weapon: null, armor: null };
}
export function equippedList(player) {
  const e = normalizeEquip(player && player.equipment);
  const out = [];
  if (e.weapon && ITEMS[e.weapon]) out.push(ITEMS[e.weapon]);
  if (e.armor && ITEMS[e.armor]) out.push(ITEMS[e.armor]);
  return out;
}
export function equippedIds(player) {
  const e = normalizeEquip(player && player.equipment);
  return [e.weapon, e.armor].filter(Boolean);
}
export function equippedId(player, slot) {
  const e = normalizeEquip(player && player.equipment);
  return e[slot] || null;
}
export function isEquipped(player, treasureId) {
  const e = normalizeEquip(player && player.equipment);
  return e.weapon === treasureId || e.armor === treasureId;
}
export function hasAnyEquipped(player) {
  return equippedIds(player).length > 0;
}

// 装备一件法宝：归入其所属槽位，同槽位原装备回背包（同类仅一件）。
export function equip(player, treasureId) {
  const def = ITEMS[treasureId];
  if (!def || def.type !== 'treasure' || !def.slot) return false;
  if (!hasItem(player, treasureId, 1)) return false;
  player.equipment = normalizeEquip(player.equipment);
  const slot = def.slot;
  const prev = player.equipment[slot] || null;
  // 换装时旧装备需回背包：若旧装备为新种类，且取下当前这件后仍腾不出空位（堆叠中），
  // 则拒绝操作——否则 addItem 返回 0 会销毁旧装备。
  if (prev && !player.bag[prev]) {
    const freesSlot = (player.bag[treasureId] || 0) <= 1; // 当前件仅剩 1 个时，移除会腾出一个种类位
    if (!freesSlot && bagFull(player)) return false;
  }
  removeItem(player, treasureId, 1);
  player.equipment[slot] = treasureId;
  if (prev) addItem(player, prev, 1); // 旧装备回背包
  recompute(player);
  return true;
}
// 卸下指定槽位的法宝（同类仅一件，故按槽位卸下）。
export function unequip(player, slot) {
  if (!slot) return false;
  player.equipment = normalizeEquip(player.equipment);
  const prev = player.equipment[slot];
  if (!prev) return false;
  // 卸下前确认背包能装下（旧装备是新种类且背包已满时拒绝，避免装备被销毁）
  if (!player.bag[prev] && bagFull(player)) return false;
  player.equipment[slot] = null;
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

// 当前境界信息（只读、不 mutate）。tier/sub 非法时安全降级到边界境界，
// 杜绝 REALMS[tier] 越界致「点修炼偶发闪退」。
export function realmInfo(player) {
  const tier = clamp(Math.floor(Number.isFinite(player && player.tier) ? player.tier : 0), 0, ASCEND_INDEX);
  const realm = REALMS[tier];
  const sub = clamp(Math.floor(Number.isFinite(player && player.sub) ? player.sub : 0), 0, realm.subs.length - 1);
  return { realm, subName: realm.subs[sub], majorName: realm.name };
}

// —— 每日活力（活力周期：跨自然日时回满）——
// 返回是否发生了「新一天」刷新（供 UI 弹提示）
export function rolloverVitality(player) {
  const today = dayKey();
  if (player.lastVitalityDate !== today) {
    player.lastVitalityDate = today;
    player.maxVitality = vitalityMax(player);
    player.vitality = player.maxVitality;
    return true;
  }
  return false;
}
export function canAffordVitality(player, cost) { return (player.vitality || 0) >= cost; }
export function spendVitality(player, cost) {
  if ((player.vitality || 0) < cost) return false;
  player.vitality -= cost;
  return true;
}

// 活力是否已低到「连最省力的修行都付不起」（修炼/探索/炼制均无法进行）。
// 仅用于决定是否显示「闭关静修」兜底入口；坊市买卖、装备穿脱、扩容等不耗活力的操作不受影响。
export function vitalityDepleted(player) {
  const cheapest = Math.min(VITALITY_COSTS.cultivate, VITALITY_COSTS.explore, VITALITY_COSTS.craft);
  return (player.vitality || 0) < cheapest;
}

// 主动「闭关静修」：活力耗尽时的兜底入口，避免玩家无任何行动可做而被卡死。
// 【平衡守卫】每个自然日仅可触发一次（与 rolloverVitality「每日仅回满一次」对齐），
// 杜绝「花光活力→回满→再花光→再回满」的无限刷取，守住每日活力上限这道进度门。
// 须真正处于活力耗尽态才会消耗当日额度。注意：不改动 lastSeen，故不影响离线修炼结算。
export function restToNextDay(player) {
  const today = dayKey();
  if (player.restUsedDate === today) return false; // 当日已用过：拒绝，杜绝无限刷活力
  if (!vitalityDepleted(player)) return false;     // 未耗尽时不消耗当日额度
  player.maxVitality = vitalityMax(player);
  player.vitality = player.maxVitality;
  player.restUsedDate = today;
  return true;
}
