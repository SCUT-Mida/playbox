// ============================================================================
// 可注入随机源：默认 Math.random，单测可传入确定性序列，保证逻辑可复现。
// ============================================================================
export function makeRng(source) {
  if (typeof source === 'function') return source;
  if (Array.isArray(source)) {
    // 确定性序列：依次取出，耗尽后回绕，便于穷举分支。
    let i = 0;
    return () => {
      if (!source.length) return 0;
      const v = source[i % source.length];
      i += 1;
      return v;
    };
  }
  return Math.random;
}

// [min, max] 闭区间随机整数。
export function randInt(rng, min, max) {
  const r = rng();
  return Math.floor(min + r * (max - min + 1));
}

// 按 {key: weight} 权重抽取一个 key。
export function weightedPick(rng, weights) {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  if (total <= 0) return null;
  let roll = rng() * total;
  for (const [k, w] of entries) {
    roll -= w;
    if (roll <= 0) return k;
  }
  return entries[entries.length - 1][0];
}
