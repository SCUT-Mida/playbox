// ============================================================================
// 灵墟·问剑录 · 战场剪影生成器（设计稿增量 第六节：编队/战斗中的角色微缩表现）
//
// 2.5D 战场上角色不以完整立绘出现，而用「皮影剪影 + 属性光晕」模式：
//   - 角色形象：立绘的简化剪影（人物轮廓 + 武器），填充为该角色的五行代表色。
//   - 稀有度标识：剪影底部用对应稀有度的光环（青玉 / 紫金 / 彩凰光圈）旋转环绕。
//   - 受击 / 阵亡 / 选中态由 battle-scene.js 叠加 .hit-flash / .dying / .acting 控制。
//
// 返回一个 DOM 节点，嵌入 battle-scene 的 .bs-unit__art 即可。
// ============================================================================
import { h } from './dom.js';
import { classDef, silhouetteColor, elDef } from '../config.js';

// card：卡牌定义（含 cls / silhouetteColor / element）；rarity：用于光环配色。
export function renderSilhouette(card, rarity, opts = {}) {
  const cls = classDef(card && card.cls);
  const sil = silhouetteColor(card);
  const el = elDef(card && card.element);
  const size = opts.size || 'sm';
  return h('div', {
    class: `silu silu--${cls.key} silu--${size} rarity-${rarity || (card && card.rarity) || 'R'}`,
    style: { '--sil': sil, '--sil-d': shade(sil, -0.35), '--sil-l': shade(sil, 0.3) },
    title: cls.pose,
  },
    h('span', { class: 'silu__body' }),
    h('span', { class: 'silu__head' }),
    h('span', { class: 'silu__weapon' }, cls.weapon),
    // 底部稀有度光环（青玉 / 紫金 / 彩凰）
    h('span', { class: `silu__aura aura-${rarity || (card && card.rarity) || 'R'}` }),
    // 五行代表色微标（便于一眼分辨属性）
    el ? h('span', { class: 'silu__el' }, el.emoji) : null,
  );
}

// 颜色加深 / 变亮：amt 负数加深、正数变亮（与 app.js 的 shade 同实现，独立于此处避免循环依赖）。
function shade(hex, amt) {
  if (!hex || hex[0] !== '#') return hex || '#333';
  const n = hex.length === 4
    ? hex.slice(1).split('').map((c) => parseInt(c + c, 16))
    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
  return `rgb(${f(n[0])}, ${f(n[1])}, ${f(n[2])})`;
}
