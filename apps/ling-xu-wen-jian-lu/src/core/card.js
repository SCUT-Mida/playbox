// ============================================================================
// 卡牌实例：由「卡牌定义 + 养成进度」派生战斗属性。纯函数，无 DOM 依赖。
//
// 实例（instance）结构：{ id, level, br, star, skillLv, exp, equipped? }
//   level  当前等级（1..cap）
//   br     已完成突破次数（每 10 级一次）
//   star   星级（0..maxStar）
//   skillLv 技能等级（影响主动技倍率）
//   exp    当前经验
// ============================================================================
import {
  rarityDef, effectiveStat, cardCap, expForLevel, cardPower,
} from '../config.js';
import { cardDef } from '../data/cards.js';

// 创建一个全新卡牌实例（1 级、0 突破、0 星）
export function newInstance(cardId) {
  return { id: cardId, level: 1, br: 0, star: 0, skillLv: 1, exp: 0 };
}

// 由实例派生「当前战斗属性」（攻击 / 防御 / 气血 / 速度）
export function instanceStats(instance) {
  const def = cardDef(instance.id);
  if (!def) return { atk: 0, def: 0, hp: 0, spd: 0 };
  const b = def.stats;
  return {
    atk: Math.round(effectiveStat(b.atk, instance.level, instance.br, instance.star)),
    def: Math.round(effectiveStat(b.def, instance.level, instance.br, instance.star)),
    hp: Math.round(effectiveStat(b.hp, instance.level, instance.br, instance.star)),
    spd: Math.round(effectiveStat(b.spd, instance.level, instance.br, instance.star)),
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
// 是否达到等级上限
export function isMaxLevel(instance) {
  const def = cardDef(instance.id);
  if (!def) return true;
  const r = rarityDef(def.rarity);
  return instance.level >= cardCap(r, instance.star);
}
