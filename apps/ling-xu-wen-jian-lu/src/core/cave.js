// ============================================================================
// 洞府（挂机收益，设计稿 6.1）
//   - 离线产出：每小时灵石 = 挂入卡牌总等级 / 10；每小时修为丹·小 = SSR 拥有数。
//   - 离线最多累积 12 小时。
//   - 简化：所有已拥有卡牌均「挂入画卷」参与产出。
// ============================================================================
import { CAVE_CAP_HOURS, CAVE_STONE_PER_HOUR_DIV, CAVE_PILL_SSR_PER_HOUR, nowSec } from '../config.js';
import { CARD_MAP } from '../data/cards.js';
import { addRes } from './player.js';

// 已拥有卡牌总等级（即「挂入画卷」的卡牌等级之和）
export function caveTotalLevel(player) {
  let sum = 0;
  for (const inst of Object.values(player.cards || {})) sum += (inst.level || 1);
  return sum;
}

// 拥有的 SSR 数量
export function caveSSRCount(player) {
  let n = 0;
  for (const id of Object.keys(player.cards || {})) {
    const def = CARD_MAP[id];
    if (def && def.rarity === 'SSR') n++;
  }
  return n;
}

// 结算离线收益（自上次 lastSeen 至今，上限 12 小时）。返回 { seconds, lingshi, exp_s, capped }
export function collectCave(player, nowOverride) {
  const now = nowOverride != null ? nowOverride : nowSec();
  const last = player.cave.lastSeen || now;
  let seconds = Math.max(0, now - last);
  const cap = CAVE_CAP_HOURS * 3600;
  const capped = seconds > cap;
  seconds = Math.min(seconds, cap);
  if (seconds < 30) return { seconds: 0, lingshi: 0, exp_s: 0, capped: false };
  const hours = seconds / 3600;
  const totalLv = caveTotalLevel(player);
  const ssr = caveSSRCount(player);
  const lingshi = Math.round((totalLv / CAVE_STONE_PER_HOUR_DIV) * hours);
  const exp_s = Math.round(CAVE_PILL_SSR_PER_HOUR * ssr * hours);
  if (lingshi > 0) addRes(player, 'lingshi', lingshi);
  if (exp_s > 0) addRes(player, 'exp_s', exp_s);
  player.cave.lastSeen = now;
  return { seconds, lingshi, exp_s, capped };
}

// 预览当前可领取的挂机收益（不实际发放、不改 lastSeen）
export function previewCave(player, nowOverride) {
  const now = nowOverride != null ? nowOverride : nowSec();
  const last = player.cave.lastSeen || now;
  const elapsed = Math.max(0, now - last);
  const seconds = Math.min(elapsed, CAVE_CAP_HOURS * 3600);
  const hours = seconds / 3600;
  const totalLv = caveTotalLevel(player);
  const ssr = caveSSRCount(player);
  return {
    seconds,
    lingshi: Math.round((totalLv / CAVE_STONE_PER_HOUR_DIV) * hours),
    exp_s: Math.round(CAVE_PILL_SSR_PER_HOUR * ssr * hours),
    capped: elapsed > CAVE_CAP_HOURS * 3600,
  };
}
