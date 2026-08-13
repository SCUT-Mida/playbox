// ============================================================================
// 一键扫荡·云游挂机（设计稿增量 第四节）
//   - 解锁条件：累计关卡星数达标（unlocks.sweep）+ 该关卡 3 星通关。
//   - 消耗：每次 1 张神行符（sweep_ticket）+ 10 点灵气（stamina）。
//   - 收益：该关卡 100% 掉落（复用 stage.rollDrops），跳过战斗。
//   - 批量：可连扫 1 / 5 / 10 次；灵气或神行符不足时自动停止并结算已完成次数。
// ============================================================================
import { STAMINA_PER_SWEEP, SWEEP_BATCH, SWEEP_UNLOCK_STARS } from '../config.js';
import { stageDef, rollDrops, isStageCleared } from './stage.js';
import { stageStarOf, stageStars, addRes, addFrag, countRes } from './player.js';
import { staminaValue, spendStamina } from './stamina.js';

// 扫荡功能是否已解锁（替代设计稿「玩家等级 20」软门槛：累计 3 颗关卡星数）。
// 实时按星数判定，不依赖 recompute 缓存的 unlocks.sweep 标记。
export function sweepUnlocked(player) {
  if (player.unlocks && player.unlocks.sweep) return true;
  return stageStars(player) >= SWEEP_UNLOCK_STARS;
}

// 单次扫荡的前置校验（不含数量），返回不可扫原因或 null。
export function sweepReason(player, stageId, nowOverride) {
  if (!sweepUnlocked(player)) return '扫荡尚未解锁（累计获得 3 颗关卡星数即可）';
  const st = stageDef(stageId);
  if (!st) return '无此关卡';
  if (!isStageCleared(player, stageId)) return '尚未通关该关卡';
  if (stageStarOf(player, stageId) < 3) return '需 3 星通关方可扫荡';
  if (countRes(player, 'sweep_ticket') < 1) return '神行符不足';
  if (staminaValue(player, nowOverride) < STAMINA_PER_SWEEP) return '灵气不足';
  return null;
}
export function canSweep(player, stageId, nowOverride) {
  return sweepReason(player, stageId, nowOverride) === null;
}

// 执行一次扫荡：扣除神行符 + 灵气，发放 100% 掉落。返回 { ok, rewards, reason? }
export function sweepOnce(player, stageId, rng, nowOverride) {
  const reason = sweepReason(player, stageId, nowOverride);
  if (reason) return { ok: false, reason };
  const st = stageDef(stageId);
  player.res.sweep_ticket -= 1;
  spendStamina(player, STAMINA_PER_SWEEP);
  player.stats.sweeps = (player.stats.sweeps || 0) + 1;
  const drops = rollDrops(st, rng);
  for (const [id, q] of Object.entries(drops.res)) addRes(player, id, q);
  for (const [cid, q] of Object.entries(drops.frags)) addFrag(player, cid, q);
  return { ok: true, rewards: drops };
}

// 批量扫荡：尝试连扫 times 次（建议取自 SWEEP_BATCH），不足自动停止。
// 返回 { done, rewards:{res,frags}, stopped }。stopped 为停止原因或 null。
export function sweepBatch(player, stageId, times, rng, nowOverride) {
  const agg = { res: {}, frags: {} };
  const merge = (drops) => {
    for (const [id, q] of Object.entries(drops.res)) agg.res[id] = (agg.res[id] || 0) + q;
    for (const [cid, q] of Object.entries(drops.frags)) agg.frags[cid] = (agg.frags[cid] || 0) + q;
  };
  let done = 0;
  let stopped = null;
  const n = Math.max(0, Math.min(times, 99));
  for (let i = 0; i < n; i++) {
    // 每次重新结算灵气（时间恢复），并实时校验余量
    const r = sweepOnce(player, stageId, rng, nowOverride);
    if (!r.ok) { stopped = r.reason; break; }
    merge(r.rewards);
    done++;
  }
  if (done === 0 && !stopped) stopped = '未能完成任何扫荡';
  return { done, rewards: agg, stopped };
}

export { SWEEP_BATCH };
