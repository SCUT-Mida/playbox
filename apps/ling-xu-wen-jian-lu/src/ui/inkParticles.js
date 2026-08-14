// ============================================================================
// 灵墟·问剑录 · SSR 全动态水墨粒子背景（设计稿增量 第二节 2.3 / 第八节 inkParticles）
//
// 两套能力：
//   createInkStream(canvas, opts) —— SSR 卡面背景的常驻水墨粒子流（缓慢上浮 / 飘散）。
//   burstInk(hostEl, color, opts) —— 一次性「冲天墨粒」爆裂（升级 / 突破成功时从底部冲起）。
//
// 纯 Canvas 2D 实现。在无 2D 上下文的环境（jsdom 冒烟、降级浏览器）下安全降级为空操作，
// 不抛异常、不启动 rAF 循环，避免在测试环境里失控。
// ============================================================================

const RAF = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (fn) => setTimeout(fn, 16);
const CAF = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : (id) => clearTimeout(id);

// 解析 #RRGGBB / #RGB 为 [r,g,b]；非法色回退墨色。
function parseColor(hex) {
  if (!hex || typeof hex !== 'string' || hex[0] !== '#') return [44, 24, 16];
  const n = hex.length === 4
    ? hex.slice(1).split('').map((c) => parseInt(c + c, 16))
    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  return n.some((x) => Number.isNaN(x)) ? [44, 24, 16] : n;
}

// 一个水墨粒子：位置 / 速度 / 半径 / 生命 / 颜色。
function spawn(w, h, color, opts = {}) {
  const [r, g, b] = color;
  const baseR = opts.radius || (2 + Math.random() * 4);
  return {
    x: Math.random() * w,
    y: opts.fromBottom ? h + baseR : Math.random() * h,
    vx: (Math.random() - 0.5) * (opts.drift || 0.3),
    vy: opts.fromBottom ? -(0.5 + Math.random() * 1.4) : -(0.1 + Math.random() * 0.4),
    r: baseR,
    life: 1,
    decay: opts.decay || (0.002 + Math.random() * 0.004),
    rgb: [r, g, b],
  };
}

// —— 常驻水墨粒子流（SSR 卡面背景）——————————————————————————————
// opts: { color, density }  density 控制同时存活粒子数（默认 26）。
export function createInkStream(canvas, opts = {}) {
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  if (!canvas || !ctx) return { burst() {}, resize() {}, destroy() {} };
  const color = parseColor(opts.color || '#D4A04A');
  const density = Math.max(6, opts.density || 26);
  let parts = [];
  let w = 0, h = 0;
  let raf = 0;
  let running = true;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    // 退化为 attribute 尺寸；仍无尺寸则跳过绘制。
    w = rect.width || parseFloat(canvas.getAttribute('width')) || canvas.clientWidth || 0;
    h = rect.height || parseFloat(canvas.getAttribute('height')) || canvas.clientHeight || 0;
    const nw = Math.max(1, Math.round(w));
    const nh = Math.max(1, Math.round(h));
    // 尺寸未变时不动 backing store，避免 ResizeObserver 自激循环。
    if (nw !== canvas.width || nh !== canvas.height) {
      canvas.width = nw;
      canvas.height = nh;
    }
    // 按密度补齐粒子
    while (parts.length < density) parts.push(spawn(w || 120, h || 160, color));
  }
  resize();

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      if (p.life <= 0 || p.y + p.r < -4) { parts[i] = spawn(w, h, color); continue; }
      const a = Math.max(0, Math.min(0.5, p.life * 0.5));
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2);
      grd.addColorStop(0, `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${a})`);
      grd.addColorStop(1, `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = RAF(frame);
  }
  raf = RAF(frame);

  return {
    // 从底部冲起一波短命粒子（升级 / 突破成功），与常驻流叠加。
    burst() {
      for (let i = 0; i < Math.min(40, density); i++) {
        parts.push(spawn(w || 120, h || 160, color, { fromBottom: true, decay: 0.012 + Math.random() * 0.01 }));
      }
      // 防止粒子无限堆积：超过 3 倍密度时回收最老的一批。
      if (parts.length > density * 3) parts = parts.slice(-density * 2);
    },
    resize,
    destroy() {
      running = false;
      if (raf) CAF(raf);
      raf = 0;
    },
  };
}

// —— 一次性「冲天墨粒」爆裂（非 SSR 卡也可用）————————————————————————
// 在 hostEl 上临时盖一层 canvas，粒子从底部冲天而起，约 dur ms 后自毁。
// opts: { color, count, dur }
export function burstInk(hostEl, color, opts = {}) {
  if (!hostEl || !hostEl.ownerDocument) return;
  const doc = hostEl.ownerDocument;
  const canvas = doc.createElement('canvas');
  canvas.className = 'portrait__burst';
  hostEl.appendChild(canvas);
  const ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) { // 无 2D 上下文：留一个光柱占位后清理，保证视觉有反馈。
    const fallback = { done: false, destroy() { if (canvas.parentNode) canvas.parentNode.removeChild(canvas); fallback.done = true; } };
    setTimeout(() => { if (canvas.parentNode) canvas.parentNode.removeChild(canvas); fallback.done = true; }, opts.dur || 900);
    return fallback;
  }
  const rect = hostEl.getBoundingClientRect();
  const w = rect.width || 130, h = rect.height || 180;
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  const rgb = parseColor(color || '#D4A04A');
  const count = opts.count || 36;
  const dur = opts.dur || 900;
  const parts = [];
  for (let i = 0; i < count; i++) {
    parts.push({
      x: w * (0.2 + Math.random() * 0.6),
      y: h + 4,
      vx: (Math.random() - 0.5) * 1.6,
      vy: -(1.5 + Math.random() * 3.0),
      r: 2 + Math.random() * 4,
      life: 1,
      decay: 0.010 + Math.random() * 0.012,
    });
  }
  const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  let raf = 0; let running = true;
  // done：自然播完自毁后置位，供调用方清理引用句柄（防止数组只增不减）。
  const handle = {
    done: false,
    destroy() {
      running = false;
      if (raf) CAF(raf);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      handle.done = true;
    },
  };
  function frame() {
    if (!running) return;
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const t = now - start;
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.02; p.life -= p.decay;
      if (p.life <= 0) continue;
      const a = Math.max(0, p.life * 0.6);
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2);
      grd.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`);
      grd.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (t < dur) raf = RAF(frame);
    else { running = false; if (canvas.parentNode) canvas.parentNode.removeChild(canvas); handle.done = true; }
  }
  raf = RAF(frame);
  return handle;
}
