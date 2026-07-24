// ============================================================================
// 随机工具：默认 Math.random，可注入种子化 rng（便于单测）。
// ============================================================================
const DEFAULT = Math.random;

export function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  return function rng() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// [min, max) 浮点
export function range(rng, min, max) {
  return min + (rng || DEFAULT)() * (max - min);
}

// [min, max] 整数（闭区间）
export function rangeInt(rng, min, max) {
  return Math.floor(range(rng, min, max + 1));
}

export function chance(rng, p) {
  return (rng || DEFAULT)() < p;
}

export function pick(rng, arr) {
  return arr[Math.floor((rng || DEFAULT)() * arr.length)];
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
