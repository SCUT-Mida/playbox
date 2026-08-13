// ============================================================================
// 洞府（挂机收益，设计稿 6.1）
//   - 离线产出：每小时灵石 = 挂入卡牌总等级 / 10；每小时修为丹·小 = SSR 拥有数。
//   - 离线最多累积 12 小时。
//   - 简化：所有已拥有卡牌均「挂入画卷」参与产出。
// ============================================================================
import { CAVE_CAP_HOURS, CAVE_STONE_PER_HOUR_DIV, CAVE_PILL_SSR_PER_HOUR, CAVE_TICKET_PER_HOUR_MIN, CAVE_TICKET_PER_HOUR_MAX, nowSec } from '../config.js';
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

// 拥有的 SR 数量（用于神行符产出浮动）
export function caveSRCount(player) {
  let n = 0;
  for (const id of Object.keys(player.cards || {})) {
    const def = CARD_MAP[id];
    if (def && def.rarity === 'SR') n++;
  }
  return n;
}

// 每小时神行符产出（设计稿增量 4.4：2~4 张/小时，随收藏丰富度上浮）
export function caveTicketPerHour(player) {
  let per = CAVE_TICKET_PER_HOUR_MIN;
  if (caveSRCount(player) > 0) per += 1;
  if (caveSSRCount(player) > 0) per += 1;
  return Math.min(CAVE_TICKET_PER_HOUR_MAX, per);
}

// 结算离线收益（自上次 lastSeen 至今，上限 12 小时）。返回 { seconds, lingshi, exp_s, ticket, capped }
export function collectCave(player, nowOverride) {
  const now = nowOverride != null ? nowOverride : nowSec();
  const last = player.cave.lastSeen || now;
  let seconds = Math.max(0, now - last);
  const cap = CAVE_CAP_HOURS * 3600;
  const capped = seconds > cap;
  seconds = Math.min(seconds, cap);
  if (seconds < 30) return { seconds: 0, lingshi: 0, exp_s: 0, ticket: 0, capped: false };
  const hours = seconds / 3600;
  const totalLv = caveTotalLevel(player);
  const ssr = caveSSRCount(player);
  const lingshi = Math.round((totalLv / CAVE_STONE_PER_HOUR_DIV) * hours);
  const exp_s = Math.round(CAVE_PILL_SSR_PER_HOUR * ssr * hours);
  const ticket = Math.round(caveTicketPerHour(player) * hours);
  if (lingshi > 0) addRes(player, 'lingshi', lingshi);
  if (exp_s > 0) addRes(player, 'exp_s', exp_s);
  if (ticket > 0) addRes(player, 'sweep_ticket', ticket);
  player.cave.lastSeen = now;
  return { seconds, lingshi, exp_s, ticket, capped };
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
    ticket: Math.round(caveTicketPerHour(player) * hours),
    capped: elapsed > CAVE_CAP_HOURS * 3600,
  };
}
