// ============================================================================
// 灵墟·问剑录 · CSS 角色分层视差引擎（设计稿增量 第一节 / 第八节 portrait3D）
//
// 把卡面拆为「三叠层」做裸眼 2.5D 视差（设计稿增量 一）：
//   ┌ 前景层·特效（.portrait__fx） 水墨粒子 / 流光 / 飘落花瓣（最快）
//   │   ┌ 角色层·本体（.portrait__char） 程序化立绘：头 / 袍服 / 武器 / 飘动部件（中速）
//   │   │   ┌ 背景层·意境（.portrait__bg） 水墨山水 / 门派洞府场景（最慢）
//
// 角色本体按职业（剑/体/丹/阵/符）程序化绘制，剪影 + 武器轮廓即可识别职业；
// 稀有度决定动态层级（R 呼吸 / SR 局部飘动 / SSR 全动态粒子 + 破框）。
//
// 交互（设计稿增量 四）：
//   悬停预览：角色微转头 + 飘动加速 + 背景墨迹涟漪；
//   点击选中：金光描边闪烁 + 底部浮现专属诗词；
//   拖拽旋转：卡牌绕 Y 轴 ±30° 旋转，三层视差位移；
//   长按详情：角色「跃出」放大至 120%，进入全屏沉浸预览。
// 养成反馈（设计稿增量 四·升级/突破成功）：celebrate() 金色光柱 + 冲天水墨粒子 + 微震。
// ============================================================================
import { h } from './dom.js';
import {
  elEmoji, elName, rarityDef, classDef, silhouetteColor, poemOf,
  rarityPortrait, affinityLevel, AFFINITY_MAX,
} from '../config.js';
import { charFigure } from './charArt.js';
import { attachAnimations } from './animationSystem.js';
import { createInkStream, burstInk } from './inkParticles.js';

// 三层视差速率：背景慢、角色中、特效快（设计稿增量 一·技术实现）。
const LAYER_SPEED = { bg: 0.25, char: 0.55, fx: 0.95 };

export class Portrait3D {
  // opts: { card, instance, rarity, onPoem }
  constructor(opts = {}) {
    this.card = opts.card;
    this.instance = opts.instance || {};
    this.onPoem = opts.onPoem || (() => {});
    this.rarity = opts.rarity || (this.card && this.card.rarity) || 'R';
    this._dead = false;
    this._anim = null;
    this._stream = null;
    this._streamCanvas = null;
    this._streamColor = null;
    this._ro = null;
    this._suppressClick = false;
    this._bursts = [];
    this._timers = [];
    this._immersive = null;
    this._immersiveBackdrop = null;
    this._holdTimer = null;
  }

  mount() {
    const def = this.card;
    const r = rarityDef(this.rarity);
    const rp = rarityPortrait(this.rarity);
    const cls = classDef(def.cls);
    const sil = silhouetteColor(def);
    const aff = (this.instance.affinity || 0);
    const maxAff = aff >= AFFINITY_MAX;

    // —— 三叠层 ——
    this.bg = h('div', { class: `portrait__bg scene-${def.element}` });
    this.fx = h('div', { class: `portrait__fx${rp.particles ? ' is-stream' : ''}${maxAff ? ' is-affinity' : ''}` });
    this.char = h('div', { class: 'portrait__char' }, this._buildDoll(def, cls, sil, rp, maxAff));

    // —— 卡面本体 ——（保留 cult-3d__card 类以沿用既有阴影 / 渐变样式）
    this.cardEl = h('div', {
      class: [
        'cult-3d__card', 'portrait__card',
        `rarity-${this.rarity}`, `dyn-${rp.dynamic}`,
        rp.inkline ? 'inkline' : '',
        rp.breakFrame ? 'breakframe' : '',
        maxAff ? 'is-affinity' : '',
      ].filter(Boolean).join(' '),
      style: {
        background: `linear-gradient(160deg, ${r.color}, ${shade(r.color, -0.28)})`,
        '--sil': sil,
        '--sil-d': shade(sil, -0.35),
        '--sil-l': shade(sil, 0.32),
        '--cls': cls.color,
      },
    }, this.bg, this.char, this.fx, this._buildSeal(rp));

    // wrap 保留 cult-3d 类（冒烟测试据此定位卡牌展示区）。
    this.wrap = h('div', { class: 'cult-3d portrait' }, this.cardEl);

    // SSR 全动态水墨粒子背景（无 2D 上下文时降级空操作）。
    if (rp.particles) {
      const canvas = h('canvas', { class: 'portrait__stream' });
      this.fx.appendChild(canvas);
      this._streamCanvas = canvas;
      this._streamColor = sil;
      this._stream = createInkStream(canvas, { color: sil, density: 24 });
      // wrap 此时尚未插入 DOM，createInkStream 的首次 resize 拿不到真实尺寸；
      // 等 canvas 挂载后再补一次 resize（见 _deferStreamResize）。
      this._deferStreamResize(canvas);
    }
    // 飘动 / 呼吸 / 眨眼动画系统。
    this._anim = attachAnimations(this.cardEl, def, this.rarity, {
      blinkEyes: this.char.querySelector('.portrait__eyes'),
    });

    this._wire();
    this._applyTransform(0, 16); // 初始微侧视角，营造立体感
    return this.wrap;
  }

  // 等 canvas 真正插入 DOM 且有尺寸后，对常驻粒子流补一次 resize。
  // 优先 ResizeObserver（顺带覆盖后续布局变化）；不可用时轮询 isConnected。
  _deferStreamResize(canvas) {
    const doResize = () => { if (!this._dead && this._stream) this._stream.resize(); };
    if (typeof ResizeObserver === 'function') {
      this._ro = new ResizeObserver(doResize);
      this._ro.observe(canvas);
      return;
    }
    let tries = 0;
    const tick = () => {
      if (this._dead || !this._stream) return;
      if (canvas.isConnected) doResize();
      else if (tries++ < 90) setTimeout(tick, 32); // 约 3s 内等待插入
    };
    setTimeout(tick, 0);
  }

  // —— 预制矢量立绘（charArt.js）：真实人形全身像，含头 / 交领袍服 / 双臂 / 武器 ——
  // 飘动部件（hair / ribbon / 双袖）与眼睛直接内嵌在 SVG 分组里，
  // 由 CSS 关键帧（.pc__hair / .part-*）与动画系统（.portrait__eyes 眨眼）驱动。
  _buildDoll(def, cls, sil, rp, maxAff) {
    const figure = charFigure(def);
    if (maxAff) {
      const eyes = figure.querySelector('.portrait__eyes');
      if (eyes) eyes.classList.add('smile'); // 满好感·微笑
    }
    return h('div', { class: `portrait__doll cls-${cls.key}` }, figure);
  }

  // 朱砂印章：R/SR 左下角，SSR 右上角金字飘浮（设计稿增量 二）。
  _buildSeal(rp) {
    return h('span', { class: `portrait__seal pos-${rp.breakFrame ? 'tr' : 'bl'}` }, rp.seal);
  }

  // —— 交互布线 ——
  _wire() {
    const wrap = this.wrap;
    let dragging = false;
    let moved = 0;
    let startX = 0, startY = 0;
    let baseRot = 16;
    let hoverPx = 0; // 悬停视差量 [-1..1]

    const cx = (e) => (e.touches ? e.touches[0].clientX : e.clientX);
    const cy = (e) => (e.touches ? e.touches[0].clientY : e.clientY);

    wrap.addEventListener('pointerenter', () => this._setHover(true));
    wrap.addEventListener('pointerleave', () => { this._setHover(false); if (!dragging) this._applyTransform(0, baseRot); });

    wrap.addEventListener('pointerdown', (e) => {
      if (this._dead) return;
      dragging = false; moved = 0;
      this._suppressClick = false;
      startX = cx(e); startY = cy(e);
      try { if (wrap.setPointerCapture && e.pointerId != null) wrap.setPointerCapture(e.pointerId); } catch (_) {}
      // 长按详情（1.5s）。
      this._holdTimer = setTimeout(() => {
        if (!dragging && moved < 6) this._openImmersive();
      }, 1500);
    });

    wrap.addEventListener('pointermove', (e) => {
      if (this._dead) return;
      const dx = cx(e) - startX;
      const dy = cy(e) - startY;
      if (e.buttons > 0 || dragging) {
        // 拖拽旋转：累计位移 → 绕 Y 轴 ±30°（设计稿 四·拖拽旋转）。
        moved += Math.abs(dx) + Math.abs(dy);
        if (moved > 6) {
          dragging = true;
          clearTimeout(this._holdTimer);
          const rot = Math.max(-30, Math.min(30, baseRot + dx * 0.35));
          this._applyTransform(dy * 0.08, rot);
        }
      } else {
        // 悬停视差：指针偏移驱动三层位移（裸眼 2.5D）。
        const rect = wrap.getBoundingClientRect();
        const w = rect.width || 130;
        hoverPx = Math.max(-1, Math.min(1, (cx(e) - (rect.left + w / 2)) / (w / 2)));
        this._applyParallax(hoverPx);
      }
    });

    const end = (e) => {
      clearTimeout(this._holdTimer);
      const wasDrag = dragging;
      dragging = false;
      if (wasDrag) { this._applyTransform(0, baseRot); this._applyParallax(0); }
      else if (e && e.type === 'pointercancel') {
        // pointercancel（如触屏长按被系统手势打断）后不会派发 click，
        // 主动清掉长按预览留下的抑制标志，避免吞掉用户下一次正常点击。
        this._suppressClick = false;
      } else { /* 视作点击，由 click 处理 */ }
    };
    wrap.addEventListener('pointerup', end);
    wrap.addEventListener('pointercancel', end);

    // 点击选中：金光描边闪烁 + 底部浮现诗词（设计稿 四·点击选中）。
    wrap.addEventListener('click', () => {
      // 长按打开沉浸预览后的 pointerup 仍会派发 click，这里消费掉，避免额外选中。
      if (this._suppressClick) { this._suppressClick = false; return; }
      if (this._dead || moved > 6) return;
      this._strike();
      this._showPoem();
    });
  }

  _setHover(on) {
    if (this._anim && this._anim.setHover) this._anim.setHover(on);
    this.cardEl.classList.toggle('is-hover', on);
    if (on) this._ripple(); // 背景墨迹涟漪
  }

  // 三层 transform：cardEl 绕 Y/X 轴旋转；bg/char/fx 各自 translateX 视差。
  _applyTransform(tiltX, rotY) {
    if (this._dead) return;
    this._rotY = rotY;
    this.cardEl.style.transform = `rotateX(${(12 + tiltX).toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
    // 记录当前角度供 portrait-shake 关键帧引用，避免震屏时跳回固定 16deg。
    this.cardEl.style.setProperty('--rot-y', `${rotY.toFixed(2)}deg`);
    // 旋转时三层也产生轻微视差位移，强化「实物把玩」感。
    const px = (rotY - 16) / 30; // [-1..1]
    this._applyParallax(px);
  }
  _applyParallax(px) {
    const amt = (px || 0) * 12; // 最大 ±12px 位移
    if (this.bg) this.bg.style.transform = `translateX(${(-amt * LAYER_SPEED.bg).toFixed(2)}px)`;
    if (this.char) this.char.style.transform = `translateX(${(-amt * LAYER_SPEED.char).toFixed(2)}px)`;
    if (this.fx) this.fx.style.transform = `translateX(${(-amt * LAYER_SPEED.fx).toFixed(2)}px)`;
  }

  // 背景墨迹涟漪（悬停时扩散一圈）。
  _ripple() {
    const rip = h('span', { class: 'portrait__ripple' });
    this.bg.appendChild(rip);
    setTimeout(() => { if (rip.parentNode) rip.parentNode.removeChild(rip); }, 900);
  }

  // 金光描边闪烁（点击选中）。
  _strike() {
    this.cardEl.classList.remove('is-strike');
    void this.cardEl.offsetWidth; // 强制重绘以重启动画
    this.cardEl.classList.add('is-strike');
    setTimeout(() => this.cardEl.classList.remove('is-strike'), 600);
  }

  // 底部浮现专属诗词。
  _showPoem() {
    const text = poemOf(this.card);
    if (!text) return;
    this.onPoem(text);
    const node = h('span', { class: 'portrait__poem' }, `「${text}」`);
    this.cardEl.appendChild(node);
    setTimeout(() => { if (node.parentNode) node.parentNode.removeChild(node); }, 2600);
  }

  // —— 全屏沉浸预览（长按 1.5s）——
  _openImmersive() {
    if (this._immersive || this._dead) return;
    const doc = this.wrap.ownerDocument;
    const clone = this.cardEl.cloneNode(true);
    clone.classList.add('is-clone');
    const backdrop = h('div', { class: 'portrait__immersive' },
      h('div', { class: 'portrait__immersive-tip' }, '沉浸预览 · 点击关闭'),
      h('div', { class: 'portrait__immersive-stage' }, clone),
    );
    (doc.body || this.wrap.parentNode).appendChild(backdrop);
    // cloneNode 不会复制画布内容：为克隆的粒子画布重建一条水墨流，
    // 保证沉浸预览下 SSR「全动态」效果不退化为静态分层。
    let cloneStream = null;
    const cloneCanvas = clone.querySelector('canvas.portrait__stream');
    if (cloneCanvas) {
      cloneStream = createInkStream(cloneCanvas, { color: this._streamColor || silhouetteColor(this.card), density: 24 });
      // 克隆画布没接 ResizeObserver，而首次 resize 时 stage 还在 scale(.6) 过渡初值，
      // 拿到的是缩放后尺寸；等 show 过渡结束后补一次 resize，避免粒子发糊。
      const t0 = setTimeout(() => { if (cloneStream) cloneStream.resize(); }, 320);
      this._timers.push(t0);
    }
    // 克隆体不会带走原卡已挂的动画句柄：重新挂上飘动 / 眨眼，沉浸预览保持同等等动态。
    const cloneAnim = attachAnimations(clone, this.card, this.rarity, {
      blinkEyes: clone.querySelector('.portrait__eyes'),
    });
    void backdrop.offsetWidth;
    backdrop.classList.add('show');
    // 长按后的 pointerup 仍会派发 click，标记由 click 处理器消费。
    this._suppressClick = true;
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      if (cloneAnim && cloneAnim.destroy) cloneAnim.destroy();
      if (cloneStream && cloneStream.destroy) cloneStream.destroy();
      cloneStream = null;
      backdrop.classList.remove('show');
      const t = setTimeout(() => {
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        this._immersive = null;
        this._immersiveBackdrop = null;
      }, 260);
      this._timers.push(t);
      backdrop.removeEventListener('click', close);
      doc.removeEventListener('keydown', onKey);
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    backdrop.addEventListener('click', close);
    doc.addEventListener('keydown', onKey);
    this._immersive = { close };
    // 供 destroy() 在清空 _timers 前同步摘除 backdrop（见 destroy 注释）。
    this._immersiveBackdrop = backdrop;
  }

  // —— 养成成功特效（升级 / 突破 / 升星 / 进化）——
  // 金色光柱笼罩 + 底部冲天水墨粒子 + 屏幕微震（设计稿 四·升级/突破成功）。
  celebrate() {
    if (this._dead) return;
    const sil = silhouetteColor(this.card);
    this.cardEl.classList.add('is-celebrate');
    const beam = h('span', { class: 'portrait__beam' });
    this.cardEl.appendChild(beam);
    // 底部冲天墨粒（SSR 复用常驻流，其它卡临时爆裂）。
    if (this._stream && this._stream.burst) this._stream.burst();
    else {
      // 先回收已自毁（done）的句柄，避免长时间会话下数组只增不减。
      this._bursts = this._bursts.filter((b) => b && !b.done);
      this._bursts.push(burstInk(this.cardEl, sil, { count: 30, dur: 900 }));
    }
    this._shake();
    const t = setTimeout(() => {
      this.cardEl.classList.remove('is-celebrate');
      if (beam.parentNode) beam.parentNode.removeChild(beam);
    }, 900);
    this._timers.push(t);
  }

  _shake() {
    this.cardEl.classList.remove('is-shake');
    void this.cardEl.offsetWidth;
    this.cardEl.classList.add('is-shake');
    const t = setTimeout(() => this.cardEl.classList.remove('is-shake'), 340);
    this._timers.push(t);
  }

  destroy() {
    this._dead = true;
    clearTimeout(this._holdTimer);
    // 先关闭沉浸预览（close 可能再 push 一个收尾 timer），随后统一清理。
    if (this._immersive && this._immersive.close) this._immersive.close();
    this._immersive = null;
    // close() 依赖「260ms 后移除 backdrop」的 timer，而该 timer 会在下方被
    // clearTimeout 一并清掉（destroy 与沉浸预览关闭 / 重渲染竞态时）；
    // 这里同步摘除 backdrop，避免透明遮罩残留 body 中锁死整页输入。
    if (this._immersiveBackdrop) {
      if (this._immersiveBackdrop.parentNode) this._immersiveBackdrop.parentNode.removeChild(this._immersiveBackdrop);
      this._immersiveBackdrop = null;
    }
    if (this._anim && this._anim.destroy) this._anim.destroy();
    if (this._stream && this._stream.destroy) this._stream.destroy();
    for (const b of this._bursts) if (b && b.destroy) b.destroy();
    this._bursts = [];
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
    for (const t of this._timers) clearTimeout(t);
    this._timers = [];
    this._anim = this._stream = null;
  }
}

// 颜色加深 / 变亮（与 app.js 同实现，独立于此避免循环依赖）。
function shade(hex, amt) {
  if (!hex || hex[0] !== '#') return hex || '#333';
  const n = hex.length === 4
    ? hex.slice(1).split('').map((c) => parseInt(c + c, 16))
    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
  return `rgb(${f(n[0])}, ${f(n[1])}, ${f(n[2])})`;
}
