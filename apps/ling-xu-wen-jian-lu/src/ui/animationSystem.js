// ============================================================================
// 灵墟·问剑录 · SR/SSR 局部飘动动画系统（设计稿增量 第二节 2.2/2.3 / 第八节 animationSystem）
//
// 按稀有度挂载不同动态层级（由 portrait3D.js 调用）：
//   R  （dynamic 0）：仅 CSS「呼吸」缩放，无逐帧动画。
//   SR （dynamic 1）：衣袂 / 飘带 / 长发等部件 CSS 关键帧缓慢飘动 + 每 6s 眨眼一次。
//   SSR（dynamic 2）：部件飘动更剧烈 + 每 5s 眨眼 + 悬停时整体加速（由 portrait3D 切 class）。
//
// 飘动完全由 CSS 关键帧驱动（.portrait__card.is-anim 与 .part-* 类），
// 这里只负责：① 给卡面打上动态等级标记；② 驱动眨眼定时器（需 JS，因为要短暂合眼）。
// 返回 { destroy }：清理眨眼定时器。jsdom 等无 eyes 的环境安全降级。
// ============================================================================
import { portraitConfig } from '../config.js';

// opts: { blinkEyes: <HTMLElement|null> }
export function attachAnimations(cardEl, card, rarity, opts = {}) {
  if (!cardEl) return { destroy() {}, setHover() {} };
  const cfg = portraitConfig(card, rarity);
  const dynamic = cfg.animations.dynamic;
  // 动态等级标记：CSS 据 .dyn-1 / .dyn-2 启用不同强度的关键帧。
  cardEl.classList.remove('dyn-0', 'dyn-1', 'dyn-2', 'is-anim');
  cardEl.classList.add(`dyn-${dynamic}`, 'is-anim');

  const eyes = opts && opts.blinkEyes ? opts.blinkEyes : null;
  const interval = cfg.animations.blink_interval || 0;
  const timers = [];

  // 眨眼：仅 SR/SSR 启用（interval > 0）；周期性给眼睛加 .blink（合眼 ~150ms）。
  // 合眼收尾句柄复用单个变量而非 push 进数组，避免长会话下数组无界增长。
  let blinkOff = null;
  if (eyes && interval > 0) {
    const id = setInterval(() => {
      if (!eyes.parentNode) return;
      eyes.classList.add('blink');
      if (blinkOff) clearTimeout(blinkOff);
      blinkOff = setTimeout(() => eyes.classList.remove('blink'), 150);
    }, interval);
    timers.push(id);
  }

  return {
    // 悬停 / 失焦时由 portrait3D 调用，整体加快飘动（CSS 据 .is-hover 缩短动画时长）。
    setHover(on) { cardEl.classList.toggle('is-hover', !!on); },
    destroy() {
      if (blinkOff) clearTimeout(blinkOff);
      for (const t of timers) { clearTimeout(t); clearInterval(t); }
    },
  };
}
