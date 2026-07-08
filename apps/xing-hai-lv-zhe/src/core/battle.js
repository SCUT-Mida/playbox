// ============================================================================
// 战斗模块（抉择型「猜拳」简化版）：敌人架势 vs 玩家应对，克制关系 + 专注力。
//   架势：突刺(thrust) / 横斩(slash) / 重击(smash)
//   应对：格挡(block) / 闪避(dodge) / 反击(counter)
//   克制：反击克突刺、格挡克横斩、闪避克重击。成功克制 → 下一击专注力 ×1.5。
// 精力过低会失手；词缀（吸血 / 反伤 / 锐利 / 坚固）在结算中生效。
// ============================================================================
import { effectiveAtk, effectiveDef, maxHp, damagePlayer, healPlayer } from './player.js';
import { weightedPick } from './rng.js';
import { STAMINA_TIRED, STAMINA_FUMBLE_CHANCE, clamp } from '../config.js';

export const STANCES = {
  thrust: { id: 'thrust', name: '突刺', emoji: '🗡️' },
  slash:  { id: 'slash',  name: '横斩', emoji: '🌀' },
  smash:  { id: 'smash',  name: '重击', emoji: '💥' },
};
export const ACTIONS = {
  block:  { id: 'block',  name: '格挡', emoji: '🛡️' },
  dodge:  { id: 'dodge',  name: '闪避', emoji: '💨' },
  counter:{ id: 'counter',name: '反击', emoji: '⚔️' },
};
// 应对 -> 其所克制的架势。
export const COUNTERS = { counter: 'thrust', block: 'slash', dodge: 'smash' };

// 敌人架势被「识破」（明牌）的概率；未识破时玩家需盲猜，增加风险。
export const TELEGRAPH_CHANCE = 0.7;

// 敌人按架势权重抽取本回合架势。
export function pickEnemyStance(enemy, rng) {
  const r = rng || Math.random;
  return weightedPick(r, enemy.stances || { thrust: 1, slash: 1, smash: 1 }) || 'thrust';
}

// 本回合是否明牌（识破架势）。
export function isTelegraphed(rng, chance) {
  const r = rng || Math.random;
  return r() < (chance == null ? TELEGRAPH_CHANCE : chance);
}

// 自动战斗：给出克制敌人当前架势的应对（明牌时必中）。
export function autoPickAction(enemyStance) {
  for (const [act, st] of Object.entries(COUNTERS)) if (st === enemyStance) return act;
  return 'counter';
}

// 专注力倍率：战斗天赋进一步提升克制成功的伤害倍率。
export function focusMultiplier(focus, combatRank) {
  if (!focus) return 1;
  return 1.5 + 0.04 * (combatRank || 0);
}

// 结算一回合：mutate enemy.hp / player.hp，返回回合描述（不改 stamina，由调用方扣除）。
//   player, enemy, action, focus(本回合是否带专注), stance(敌人本回合架势), rng
export function resolveRound(player, enemy, action, focus, stance, rng) {
  const r = rng || Math.random;
  const stanceId = stance || pickEnemyStance(enemy, r);
  // 合法应对原样使用；非法值（如「犹豫」hesitate）保留为失败态，不计入克制。
  const actId = action in COUNTERS ? action : 'hesitate';

  // 精力过低 → 失手概率（失手时本回合视为应对失败）。
  let fumble = false;
  if ((player.stamina || 0) < STAMINA_TIRED) {
    fumble = r() < STAMINA_FUMBLE_CHANCE;
  }
  const countered = !fumble && actId in COUNTERS && COUNTERS[actId] === stanceId;

  let enemyDmg = 0;
  let playerDmg = 0;
  let healed = 0;
  let nextFocus = false;

  if (countered) {
    // 克制成功：玩家命中敌人，伤害受专注力与战斗天赋加成。
    const mult = focusMultiplier(focus, player.talents?.combat || 0);
    enemyDmg = Math.max(1, Math.round(effectiveAtk(player) * mult));
    enemy.hp = clamp(enemy.hp - enemyDmg, 0, enemy.maxHp || enemy.hp);
    // 武器吸血词缀
    if (player.equipment?.weapon?.affix?.id === 'lifesteal') {
      healed = healPlayer(player, Math.round(enemyDmg * 0.3));
    }
    nextFocus = true; // 为下一击充能
  } else {
    // 应对失败：敌人命中玩家（防御减免，至少 1）。
    const raw = (enemy.atk || 0) - effectiveDef(player);
    playerDmg = Math.max(1, Math.round(raw * (fumble ? 1.2 : 1))); // 失手时受伤更重
    damagePlayer(player, playerDmg);
    // 护甲反伤词缀
    if (player.equipment?.armor?.affix?.id === 'thorns') {
      const refl = Math.max(1, Math.round(playerDmg * 0.25));
      enemy.hp = clamp(enemy.hp - refl, 0, enemy.maxHp || enemy.hp);
      enemyDmg = refl;
    }
    nextFocus = false;
  }

  return {
    stance: stanceId, action: actId, countered, fumble, focus: !!focus, nextFocus,
    enemyDmg, playerDmg, healed,
    enemyDead: enemy.hp <= 0,
    playerDead: player.hp <= 0,
  };
}

// 计算击败该敌人的奖励（星骸 / 零件 / 经验基准，不含幸运加成——加成在 player.gainReward 中统一施加）。
export function enemyReward(enemy) {
  return { stardust: enemy.stardust || 0, parts: enemy.parts || 0, exp: enemy.exp || 0, boss: !!enemy.boss };
}

export { STAMINA_TIRED, STAMINA_FUMBLE_CHANCE, maxHp };
