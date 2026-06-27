// ============================================================================
// 修炼系统：被动修炼（实时计时）+ 主动修炼（消耗灵力，有顿悟）
// ============================================================================
import {
  passiveXpPerSec, activeCultivateGain, ACTIVE_CULTIVATE_MP_COST,
  EPIPHANY_CHANCE, EPIPHANY_MULT, hpRegenPerSec, mpRegenPerSec, cultivateSpeedMult,
} from '../config.js';
import { addXp, healHp, healMp } from './player.js';
import { chance } from './rng.js';

// 被动修炼一帧（seconds 秒）：累积修为 + 气血/灵力回复
// opts.hp = false 时跳过气血回复（用于战斗/渡劫期间保留压力）
export function passiveTick(player, seconds, opts = {}) {
  const allowHp = opts.hp !== false;
  const mult = cultivateSpeedMult(player);
  const xp = passiveXpPerSec(player.tier, mult) * seconds;
  const gained = addXp(player, xp);
  if (allowHp) player.hp = Math.min(player.maxHp, player.hp + hpRegenPerSec(player.maxHp) * seconds);
  player.mp = Math.min(player.maxMp, player.mp + mpRegenPerSec(player.maxMp) * seconds);
  if (allowHp) player.hp = Math.round(player.hp * 100) / 100;
  player.mp = Math.round(player.mp * 100) / 100;
  return gained;
}

// 主动修炼：消耗灵力，瞬时获得修为；小概率顿悟（倍数暴击）
export function activeCultivate(player, rng) {
  if (player.mp < ACTIVE_CULTIVATE_MP_COST) {
    return { ok: false, reason: '灵力不足' };
  }
  player.mp -= ACTIVE_CULTIVATE_MP_COST;
  const mult = cultivateSpeedMult(player);
  let gain = activeCultivateGain(player.tier, mult);
  const epiphany = chance(rng, EPIPHANY_CHANCE);
  if (epiphany) gain = Math.round(gain * EPIPHANY_MULT);
  const real = addXp(player, gain);
  return { ok: true, xp: real, epiphany };
}
