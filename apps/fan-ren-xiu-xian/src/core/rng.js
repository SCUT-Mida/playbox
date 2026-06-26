// ============================================================================
// 随机工具：所有随机逻辑默认 Math.random，但接受外部注入的 rng（便于单测/种子化）
// ============================================================================

const DEFAULT = Math.random;

// 线性同余生成器，返回一个确定性的 rng 函数（种子化）
export function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  return function rng() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// [min, max) 浮点
export function range(rng, min, max) {
  const r = (rng || DEFAULT)();
  return min + r * (max - min);
}

// [min, max] 整数（闭区间）
export function rangeInt(rng, min, max) {
  return Math.floor(range(rng, min, max + 1));
}

// 概率判定
export function chance(rng, p) {
  return (rng || DEFAULT)() < p;
}

// 等概率取一项
export function pick(rng, arr) {
  return arr[Math.floor((rng || DEFAULT)() * arr.length)];
}

// 加权抽取：entries=[{item, weight}]，返回 item（总权重不必归一）
export function weighted(rng, entries) {
  let total = 0;
  for (const e of entries) total += e.weight;
  if (total <= 0) return entries.length ? entries[0].item : undefined;
  let r = (rng || DEFAULT)() * total;
  for (const e of entries) {
    r -= e.weight;
    if (r <= 0) return e.item;
  }
  return entries[entries.length - 1].item;
}

// Fisher–Yates 洗牌（返回新数组）
export function shuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor((rng || DEFAULT)() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
