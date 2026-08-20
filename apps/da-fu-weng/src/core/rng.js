// ============================================================================
// 确定性随机（mulberry32）：随机数种子保存在游戏状态里（state.rng），
// 存档/读档后骰序与抽卡序完全可复现，也便于单测注入固定种子。
// ============================================================================

// 推进一个随机数：返回 [0,1) 浮点，同时更新 state.rng。
export function rngNext(state) {
  let t = (state.rng = (state.rng + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// [lo, hi] 闭区间整数（含两端）。
export function randInt(state, lo, hi) {
  return lo + Math.floor(rngNext(state) * (hi - lo + 1));
}

// 掷骰子：1~6（单骰，保留作通用工具）。
export function rollDice(state) {
  return randInt(state, 1, 6);
}

// 掷双骰：luck > 0 时，点数 1~2 的骰子有 luck 概率重掷一次（角色天赋「骰运」）。
export function rollTwoDice(state, luck = 0) {
  let d1 = randInt(state, 1, 6);
  let d2 = randInt(state, 1, 6);
  if (luck > 0) {
    if (d1 <= 2 && rngNext(state) < luck) d1 = randInt(state, 1, 6);
    if (d2 <= 2 && rngNext(state) < luck) d2 = randInt(state, 1, 6);
  }
  return { d1, d2 };
}

// 非零整数随机种子（UI 开新档用；测试直接传固定值）。
export function makeSeed() {
  try { return (Date.now() ^ (Math.random() * 0xffffffff)) | 0; }
  catch (_) { return 123456789; }
}
