// ============================================================================
// 卡牌实例：由「卡牌定义 + 养成进度」派生战斗属性。纯函数，无 DOM 依赖。
//
// 实例（instance）结构：{ id, level, br, star, skillLv, exp, evo, affinity }
//   level    当前等级（1..cap）
//   br       已完成突破次数（每 10 级一次）
//   star     星级（0..9，道果九重天）
//   skillLv  技能等级（影响主动技倍率）
//   exp      当前经验
//   evo      化凡入圣进化阶段（0=原稀有度；R 可到 2，SR 可到 1，SSR 恒 0）
//   affinity 知音好感度（0..100，提供微量全属性加成）
// ============================================================================
import {
  rarityDef, effectiveStat, cardCap, expForLevel, cardPower,
  EVO_STAT_MULT, affinityBonusPct,
} from '../config.js';
import { cardDef } from '../data/cards.js';

// 稀有度序号（用于进化阶进）
const RARITY_ORDER = ['R', 'SR', 'SSR'];

// 创建一个全新卡牌实例（1 级、0 突破、0 星、0 进化、0 好感）
export function newInstance(cardId) {
  return { id: cardId, level: 1, br: 0, star: 0, skillLv: 1, exp: 0, evo: 0, affinity: 0 };
}

// 进化后的「有效稀有度」（化凡入圣：R→SR→SSR，逐阶 +1）
export function effectiveRarity(instance) {
  const def = cardDef(instance.id);
  if (!def) return 'R';
  const idx = RARITY_ORDER.indexOf(def.rarity);
  const evo = Math.max(0, instance.evo || 0);
  return RARITY_ORDER[Math.min(RARITY_ORDER.length - 1, idx + evo)];
}

// 进化阶段对应的基础属性放大倍率（贴近目标稀有度面板）
export function evoStatMult(instance) {
  return EVO_STAT_MULT[Math.max(0, instance.evo || 0)] || 1;
}

// 由实例派生「当前战斗属性」（攻击 / 防御 / 气血 / 速度）
// 含：等级 / 突破 / 道果星级 / 化凡入圣进化面板 / 知音好感加成。
export function instanceStats(instance) {
  const def = cardDef(instance.id);
  if (!def) return { atk: 0, def: 0, hp: 0, spd: 0 };
  const b = def.stats;
  const evo = evoStatMult(instance);
  const aff = 1 + affinityBonusPct(instance.affinity || 0);
  const mul = (base) => effectiveStat(base, instance.level, instance.br, instance.star) * evo * aff;
  return {
    atk: Math.round(mul(b.atk)),
    def: Math.round(mul(b.def)),
    hp: Math.round(mul(b.hp)),
    spd: Math.round(mul(b.spd)),
  };
}

// 卡牌战力
export function instancePower(instance) {
  return cardPower(instanceStats(instance));
}

// 技能倍率：技能等级每 +1，伤害/治疗倍率 +5%（封顶 +50%）
export function skillMult(instance) {
  const bonus = Math.max(0, (instance.skillLv || 1) - 1) * 0.05;
  return 1 + Math.min(0.50, bonus);
}

// 升级到下一级所需经验
export function expToNext(instance) {
  return expForLevel(instance.level);
}
// 是否达到等级上限（化凡入圣后按进化稀有度的上限判定）
export function isMaxLevel(instance) {
  const r = rarityDef(effectiveRarity(instance));
  return instance.level >= cardCap(r, instance.star);
}
