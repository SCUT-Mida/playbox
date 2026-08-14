// ============================================================================
// 灵墟·问剑录 · 战场剪影生成器（设计稿增量 第六节：编队/战斗中的角色微缩表现）
//
// 2.5D 战场上角色不以完整立绘出现，而用「皮影剪影 + 属性光晕」模式：
//   - 角色形象：charArt.js 预制全身像的单色皮影化（人物轮廓 + 武器一眼可辨）。
//   - 稀有度标识：剪影底部用对应稀有度的光环（青玉 / 紫金 / 彩凰光圈）旋转环绕。
//   - 受击 / 阵亡 / 选中态由 battle-scene.js 叠加 .hit-flash / .dying / .acting 控制。
//
// 返回一个 DOM 节点，嵌入 battle-scene 的 .bs-unit__art 即可。
// ============================================================================
import { h } from './dom.js';
import { classDef, elDef } from '../config.js';
import { charFigure } from './charArt.js';

// card：卡牌定义（含 cls / element）；rarity：用于光环配色。
export function renderSilhouette(card, rarity, opts = {}) {
  const cls = classDef(card && card.cls);
  const el = elDef(card && card.element);
  const size = opts.size || 'sm';
  const rar = rarity || (card && card.rarity) || 'R';
  return h('div', {
    class: `silu silu--${cls.key} silu--${size} rarity-${rar}`,
    title: cls.pose,
  },
    // 单色多层皮影剪影（is-sil：肤色 / 深衣 / 武器三阶墨色，轮廓仍可辨人形与武器）。
    charFigure(card, { sil: true }),
    // 底部稀有度光环（青玉 / 紫金 / 彩凰）
    h('span', { class: `silu__aura aura-${rar}` }),
    // 五行代表色微标（便于一眼分辨属性）
    el ? h('span', { class: 'silu__el' }, el.emoji) : null,
  );
}
