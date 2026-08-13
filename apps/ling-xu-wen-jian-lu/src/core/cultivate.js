// ============================================================================
// 养成系统（设计稿 P2 + 增量 2.x）：升级 / 突破 / 升星（道果九重天）/ 化凡入圣进化
// / 技能升级 / 知音赠礼。纯逻辑。
//   - 升级：喂修为丹获得经验，满经验后升 1 级并消耗灵石；每 10 级遇突破瓶颈。
//   - 突破：消耗对应五行突破石 + 灵石，解锁更高等级上限（每次 +8% 全属性）。
//   - 升星：消耗天道本源·碎片 + 同名灵契碎片，提升道果星级（分档累计全属性加成）。
//   - 化凡入圣：9 重满星 + 等级达上限时，消耗天道本源 / 五行精华 / 天道卷轴进化稀有度。
//   - 技能：消耗功法残页提升技能等级（+5% 技能倍率 / 级）。
//   - 知音：消耗灵犀佩提升好感度（微量全属性加成）。
// ============================================================================
import {
  rarityDef, cardCap, breakGateLevel, expForLevel, lingshiForLevel,
  PILL_EXP, BREAK_STONE, ESSENCE_STONE,
  STAR_TIERS, starTiandaoFCost, starFragCost,
  EVOLUTION, AFFINITY_MAX, AFFINITY_GIFT_VALUE,
} from '../config.js';
import { cardDef } from '../data/cards.js';
import { isMaxLevel, expToNext, effectiveRarity } from './card.js';
import { canAfford, spendRes, countRes, countFrag } from './player.js';

// 当前可升到的等级上限 = min(进化稀有度星级上限, 突破瓶颈)
export function levelCeiling(instance) {
  const def = cardDef(instance.id);
  if (!def) return 1;
  const r = rarityDef(effectiveRarity(instance));
  return Math.min(cardCap(r, instance.star), breakGateLevel(instance.br));
}

// 是否可以继续升级（未达瓶颈 / 未达上限）
export function canLevelUp(instance) {
  return instance.level < levelCeiling(instance);
}

// 喂一颗修为丹：累加经验，自动升级（消耗灵石）。返回结算日志。
export function feedPill(player, instance, pillId, qty = 1) {
  const def = cardDef(instance.id);
  if (!def) return { ok: false, reason: '无此卡牌' };
  const expEach = PILL_EXP[pillId];
  if (!expEach) return { ok: false, reason: '非修为丹' };
  if (countRes(player, pillId) < qty) return { ok: false, reason: '数量不足' };
  if (isMaxLevel(instance)) return { ok: false, reason: '已达等级上限' };
  player.res[pillId] -= qty;
  return addExp(player, instance, expEach * qty);
}

// 增加经验并尝试连续升级（每级消耗灵石；灵石不足则暂停并保留经验）。
export function addExp(player, instance, exp) {
  const logs = [];
  instance.exp = (instance.exp || 0) + exp;
  let guard = 0;
  while (instance.exp >= expToNext(instance) && canLevelUp(instance) && guard++ < 200) {
    const need = expToNext(instance);
    const lingshi = lingshiForLevel(instance.level);
    if (!canAfford(player, { lingshi })) {
      logs.push({ kind: 'ling', text: `灵石不足，无法升至 ${instance.level + 1} 级（需 ${lingshi} 灵石）` });
      break;
    }
    instance.exp -= need;
    spendRes(player, { lingshi });
    instance.level += 1;
    logs.push({ kind: 'level', text: `${def_name(instance)} 升至 ${instance.level} 级` });
    // 到达突破瓶颈：停止升级，提示突破
    if (!canLevelUp(instance) && instance.level >= breakGateLevel(instance.br) && !reachedCap(instance)) {
      logs.push({ kind: 'break', text: `${instance.level} 级瓶颈已至，需突破方能继续修炼` });
      break;
    }
  }
  if (instance.exp < 0) instance.exp = 0;
  return { ok: true, logs };
}
function def_name(instance) { const d = cardDef(instance.id); return d ? d.name : instance.id; }
function reachedCap(instance) {
  const def = cardDef(instance.id);
  if (!def) return true;
  const r = rarityDef(effectiveRarity(instance));
  return instance.level >= cardCap(r, instance.star);
}

// ── 突破 ──────────────────────────────────────────────────────────────────────
export function breakCost(instance) {
  const def = cardDef(instance.id);
  const stone = BREAK_STONE[def.element] || 'break_metal';
  return { [stone]: 2 + instance.br, lingshi: 150 * (instance.br + 1) };
}
export function canBreakThrough(player, instance) {
  const def = cardDef(instance.id);
  if (!def) return false;
  const r = rarityDef(effectiveRarity(instance));
  if (instance.level < breakGateLevel(instance.br)) return false; // 未到瓶颈
  if (instance.level >= cardCap(r, instance.star)) return false;  // 已到星级上限
  return canAfford(player, breakCost(instance));
}
export function doBreakThrough(player, instance) {
  if (!canBreakThrough(player, instance)) return { ok: false, reason: '不可突破' };
  spendRes(player, breakCost(instance));
  instance.br += 1;
  return { ok: true, text: `突破第 ${instance.br} 重，属性大增！` };
}

// ── 升星·道果九重天（设计稿增量 2.1）──────────────────────────────────────────
export function starUpCost(instance) {
  const target = (instance.star || 0) + 1;
  return {
    frag: starFragCost(target),
    tiandao_f: starTiandaoFCost(target),
  };
}
export function canStarUp(player, instance) {
  const def = cardDef(instance.id);
  if (!def) return false;
  const r = rarityDef(effectiveRarity(instance));
  if (instance.star >= (r.maxStar || STAR_TIERS)) return false;
  const c = starUpCost(instance);
  if (countFrag(player, def.id) < c.frag) return false;
  if (countRes(player, 'tiandao_f') < c.tiandao_f) return false;
  return true;
}
export function doStarUp(player, instance) {
  if (!canStarUp(player, instance)) return { ok: false, reason: '不可升星' };
  const def = cardDef(instance.id);
  const c = starUpCost(instance);
  player.frags[def.id] -= c.frag;
  spendRes(player, { tiandao_f: c.tiandao_f });
  instance.star += 1;
  return { ok: true, text: `${def.name} 道果升至 ${instance.star} 重！` };
}

// ── 化凡入圣·品质进化（设计稿增量 2.2）────────────────────────────────────────
// R→SR / SR→SSR：需 9 重满星 + 等级达（进化稀有度）上限。材料：天道本源 + 五行精华 / 天道卷轴。
export function evoCost(instance) {
  const def = cardDef(instance.id);
  if (!def) return null;
  const cur = effectiveRarity(instance); // 进化前的有效稀有度
  const cfg = EVOLUTION[cur];
  if (!cfg) return null;
  const cost = { tiandao: cfg.tiandao };
  if (cfg.essence > 0) {
    const essId = ESSENCE_STONE[def.element] || 'essence_metal';
    cost[essId] = cfg.essence;
  }
  if (cfg.scroll > 0) cost.dao_scroll = cfg.scroll;
  return { cost, target: cfg.to, label: cfg.label };
}
export function canEvolve(player, instance) {
  const def = cardDef(instance.id);
  if (!def) return false;
  const cur = effectiveRarity(instance);
  if (!EVOLUTION[cur]) return false;          // SSR 已至顶
  const r = rarityDef(cur);
  if ((instance.star || 0) < (r.maxStar || STAR_TIERS)) return false; // 未满星
  if (!isMaxLevel(instance)) return false;    // 未达等级上限
  const e = evoCost(instance);
  if (!e) return false;
  return canAfford(player, e.cost);
}
export function doEvolve(player, instance) {
  if (!canEvolve(player, instance)) return { ok: false, reason: '尚不可化凡入圣' };
  const def = cardDef(instance.id);
  const e = evoCost(instance);
  spendRes(player, e.cost);
  instance.evo = (instance.evo || 0) + 1;
  // 进化后等级上限提升，保留当前等级 / 经验 / 星级。
  return { ok: true, text: `${def.name} 化凡入圣，晋升为 ${e.target}！` };
}

// ── 知音·好感度（设计稿增量 1.2）──────────────────────────────────────────────
export function canGift(player, instance) {
  return (instance.affinity || 0) < AFFINITY_MAX && countRes(player, 'gift') > 0;
}
export function doGift(player, instance) {
  if (!canGift(player, instance)) return { ok: false, reason: '无法赠礼' };
  spendRes(player, { gift: 1 });
  instance.affinity = Math.min(AFFINITY_MAX, (instance.affinity || 0) + AFFINITY_GIFT_VALUE);
  const def = cardDef(instance.id);
  return { ok: true, text: `${def.name} 好感度 +${AFFINITY_GIFT_VALUE}（${instance.affinity}/${AFFINITY_MAX}）` };
}

// ── 技能升级 ──────────────────────────────────────────────────────────────────
export const MAX_SKILL_LEVEL = 11;
export function skillUpCost(instance) {
  return { gongfa: 1 + (instance.skillLv - 1) * 2 };
}
export function canSkillUp(player, instance) {
  return instance.skillLv < MAX_SKILL_LEVEL && canAfford(player, skillUpCost(instance));
}
export function doSkillUp(player, instance) {
  if (!canSkillUp(player, instance)) return { ok: false, reason: '不可升级技能' };
  spendRes(player, skillUpCost(instance));
  instance.skillLv += 1;
  const def = cardDef(instance.id);
  return { ok: true, text: `${def.name} 技能升至 ${instance.skillLv} 级` };
}
