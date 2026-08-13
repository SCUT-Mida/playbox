// ============================================================================
// 灵气（体力，设计稿增量 4.2）：上限 120，每 5 分钟恢复 1 点；每次扫荡消耗 10 点。
// 与洞府挂机同构：基于 lastSeen 时间戳离线累积，落地即结算。
// ============================================================================
import { STAMINA_MAX, STAMINA_REGEN_SEC, nowSec } from '../config.js';

// 预览当前灵气（含离线恢复），不修改状态。返回 { value, gained, secsToNext, full, now }
export function staminaPreview(player, nowOverride) {
  const now = nowOverride != null ? nowOverride : nowSec();
  const st = player.stamina || {};
  const last = Number.isFinite(st.lastSeen) ? st.lastSeen : now;
  const base = Number.isFinite(st.value) ? st.value : STAMINA_MAX;
  const elapsed = Math.max(0, now - last);
  const gained = Math.floor(elapsed / STAMINA_REGEN_SEC);
  const value = Math.min(STAMINA_MAX, base + gained);
  const remainder = elapsed % STAMINA_REGEN_SEC;
  const secsToNext = value >= STAMINA_MAX ? 0 : (STAMINA_REGEN_SEC - remainder);
  return { value, gained, secsToNext, full: value >= STAMINA_MAX, now };
}

// 结算离线恢复（写入 value / lastSeen）。返回预览。
export function regenStamina(player, nowOverride) {
  const pv = staminaPreview(player, nowOverride);
  if (!player.stamina || typeof player.stamina !== 'object') player.stamina = { value: STAMINA_MAX, lastSeen: 0 };
  player.stamina.value = pv.value;
  player.stamina.lastSeen = pv.now;
  return pv;
}

// 当前灵气（先结算再读取，保证显示与消耗一致）
export function staminaValue(player, nowOverride) {
  return regenStamina(player, nowOverride).value;
}

// 是否足够消耗 n 点
export function hasStamina(player, n, nowOverride) {
  return staminaValue(player, nowOverride) >= n;
}

// 扣除 n 点灵气（调用方应先 regenStamina / staminaValue 确保足够）
export function spendStamina(player, n) {
  if (!player.stamina) player.stamina = { value: STAMINA_MAX, lastSeen: 0 };
  player.stamina.value = Math.max(0, player.stamina.value - n);
  return true;
}
