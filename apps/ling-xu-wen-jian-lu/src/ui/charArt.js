// ============================================================================
// 灵墟·问剑录 · 预制矢量人物素材库（issue #95）
//
// 早先的立绘 / 战场剪影由 CSS clip-path 程序化拼接，观感「连轮廓都不算人」。
// 此处改为一次性预绘制好的矢量人物（内联 SVG），五大职业各一副全身像：
//   剑修·执剑 / 体修·抱元持盾 / 丹修·托炉 / 阵修·结印 / 符修·持符点指
// 头身比例按真实人形（约 1:7.5）绘制：头颅 / 颈 / 交领袍服 / 双臂 / 足履俱全。
//
// 着色契约：素材本身不定死颜色，服装取容器上的 CSS 变量
//   --sil（正色）/ --sil-d（深）/ --sil-l（亮），即五行代表色（可被卡牌自定义色覆盖）。
// is-sil 模式整体塌缩为单色多层皮影剪影，供战场微缩表现使用。
//
// 导出：
//   charFigure(card, opts) → HTMLElement 全身像（span.char-art > svg）
//   charBust(card, opts)   → HTMLElement 同素材的胸像裁切（迷你卡 / 图鉴 / 问道结果）
// ============================================================================
import { h } from './dom.js';
import { classDef, silhouetteColor, shade } from '../config.js';

// —— 共用部件（五官 / 颈 / 足），坐标基于 viewBox 0 0 160 320 ——
// 眼睛组沿用 .portrait__eyes 类名：动画系统在其上打 .blink（合眼）/ .smile（满好感微笑）。
const FACE = `
  <ellipse class="ca-skin" cx="80" cy="41" rx="14.5" ry="16.5"/>
  <g class="portrait__eyes">
    <ellipse class="ca-eye" cx="74.2" cy="41.5" rx="1.7" ry="2.7"/>
    <ellipse class="ca-eye" cx="85.8" cy="41.5" rx="1.7" ry="2.7"/>
  </g>
  <path class="ca-line" d="M70.4 35.2q3.4-2.4 6.6-.6"/>
  <path class="ca-line" d="M89.6 35.2q-3.4-2.4-6.6-.6"/>
  <path class="ca-line" d="M77.2 49.6q2.8 1.9 5.6 0"/>`;

const NECK = `<path class="ca-skin-sh" d="M75.5 52.5h9V62q-4.5 2.6-9 0z"/>`;

// 足履画在袍摆之前，从下摆探出。
const FEET = `
  <path class="ca-shoe" d="M63 296h16v8q-8 3-16 0z"/>
  <path class="ca-shoe" d="M81 296h16v8q8 3-16 0z"/>`;

// —— 五大职业全身像 ——
// 分层顺序：背发 / 披风 / 飘带（后） → 颈 / 足 → 袍服 / 交领 / 腰带 → 武器 → 双臂 → 头 / 前发。
// pc__hair / part-ribbon / part-arm_L / part-arm_R 挂在对应飘动部件上，沿用既有 CSS 关键帧。
const ART = {
  // 剑修：窄袖劲装 + 披风，右手执长剑，束发高马尾。
  sword: `
  <g class="pc__part part-ribbon"><path class="ca-cape" d="M95 66C111 92 115 150 109 208C103 158 97 116 87 84Z"/></g>
  ${NECK}
  ${FEET}
  <path class="ca-robe" d="M63 62C61 88 67 110 68 132C60 174 54 234 52 292Q80 302 108 292C106 234 100 174 92 132C93 110 99 88 97 62Q80 55 63 62Z"/>
  <path class="ca-collar" d="M73 57L80 72L87 57L92 60L80 84L68 60Z"/>
  <path class="ca-sash" d="M67.5 128Q80 135 92.5 128L93.5 139Q80 146 66.5 139Z"/>
  <path class="ca-sash-tail" d="M77 139L73 172L79.5 174L83 139Z"/>
  <path class="ca-sleeve" d="M95.5 70C103 76 106.5 86 105.5 95"/>
  <g class="ca-weapon">
    <path class="ca-blade" d="M102.6 94L100.6 34L103.6 25L106.6 34L104.6 94Z"/>
    <path class="ca-guard" d="M97 93.5h13v4h-13z"/>
    <rect class="ca-hilt" x="102" y="97.5" width="3.4" height="9" rx="1.5"/>
  </g>
  <circle class="ca-hand" cx="105.5" cy="100" r="4.4"/>
  <g class="pc__part part-arm_L">
    <path class="ca-sleeve" d="M65 70C58 84 55 98 56.5 112"/>
    <path class="ca-fore" d="M56.5 106C57 110 57.4 114 58 118"/>
    <circle class="ca-hand" cx="58.6" cy="121.5" r="4.2"/>
  </g>
  <g class="ca-head">${FACE}</g>
  <g class="pc__hair">
    <path class="ca-hair" d="M63.5 41C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 41C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 41Z"/>
    <circle class="ca-hair" cx="80" cy="13.5" r="5"/>
    <path class="ca-hair-l" d="M84.5 15C98 20 103.5 37 101 53C106 36 99.5 17.5 85 12.5Z"/>
  </g>`,

  // 体修：短打 + 护心镜，双臂外张抱元，左臂负盾，束发系额带。
  body: `
  ${NECK}
  ${FEET}
  <g class="ca-weapon">
    <path class="ca-shield" d="M40 90Q29 95 30.5 108Q32 123 40 129Q48 123 49.5 108Q51 95 40 90Z"/>
    <circle class="ca-shield-boss" cx="40" cy="109" r="4.4"/>
  </g>
  <path class="ca-robe" d="M58 64C56 92 64 112 66 130C58 168 52 228 50 292Q80 304 110 292C108 228 102 168 94 130C96 112 104 92 102 64Q80 55 58 64Z"/>
  <path class="ca-collar" d="M72 58L80 73L88 58L94 61L80 86L66 61Z"/>
  <path class="ca-sash" d="M66 126Q80 133 94 126L95 137Q80 144 65 137Z"/>
  <circle class="ca-mirror-rim" cx="80" cy="100" r="11"/>
  <circle class="ca-mirror" cx="80" cy="100" r="8"/>
  <g class="pc__part part-arm_L">
    <path class="ca-sleeve" d="M61 70C51 79 46 91 46.5 101"/>
    <path class="ca-fore" d="M46.5 98C46 102 46 106 46.5 109"/>
    <circle class="ca-hand" cx="47" cy="113" r="5.2"/>
  </g>
  <g class="pc__part part-arm_R">
    <path class="ca-sleeve" d="M99 70C109 79 114 91 113.5 101"/>
    <path class="ca-fore" d="M113.5 98C114 102 114 106 113.5 109"/>
    <circle class="ca-hand" cx="113" cy="113" r="5.2"/>
  </g>
  <g class="ca-head">${FACE}</g>
  <g class="pc__hair">
    <path class="ca-hair" d="M64 39C63 24 70 18 80 18C90 18 97 24 96 39C94 30.5 90 26.5 80 26.5C70 26.5 66 30.5 64 39Z"/>
    <path class="ca-band" d="M64.6 32.5C68 29.6 74 28.2 80 28.2C86 28.2 92 29.6 95.4 32.5L96 36.8C91 34 86 32.8 80 32.8C74 32.8 69 34 64 36.8Z"/>
  </g>`,

  // 丹修：宽袍大袖 + 双飘带，发髻玉簪，右手托丹炉，炉下灵火摇曳。
  alchemy: `
  <g class="pc__part part-ribbon"><path class="ca-ribbon" d="M93 72C112 82 122 106 117 132C124 105 113 76 94 66Z"/></g>
  ${NECK}
  ${FEET}
  <path class="ca-robe" d="M60 64C57 92 66 112 67 132C55 176 46 236 44 294Q80 306 116 294C114 236 105 176 93 132C94 112 103 92 100 64Q80 55 60 64Z"/>
  <path class="ca-collar" d="M72 58L80 73L88 58L95 61L80 86L65 61Z"/>
  <path class="ca-sash" d="M66.5 128Q80 135 93.5 128L94.5 139Q80 146 65.5 139Z"/>
  <path class="ca-sleeve" d="M97 70C106 78 108.5 90 104 101"/>
  <g class="ca-weapon">
    <path class="ca-tlg" d="M91 114Q103 109.5 115 114Q113 126.5 103 128.5Q93 126.5 91 114Z"/>
    <path class="ca-tlg-l" d="M91 114Q103 118.5 115 114L114.2 117.8Q103 122 91.8 117.8Z"/>
    <path class="ca-flame" d="M96 130Q103 125 110 130Q106.5 137 103 136Q99.5 137 96 130Z"/>
  </g>
  <circle class="ca-hand" cx="103" cy="105.5" r="4.2"/>
  <g class="pc__part part-arm_L">
    <path class="ca-sleeve-d" d="M62 66C50 78 44 96 50 112C56 114 61 111 63 107C57 97 58 80 64 72Z"/>
    <path class="ca-sleeve" d="M63 70C53 80 47.5 94 51 107"/>
    <circle class="ca-hand" cx="51" cy="111" r="4.2"/>
  </g>
  <g class="ca-head">${FACE}</g>
  <g class="pc__hair">
    <path class="ca-hair" d="M63.5 42C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 42C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 42Z"/>
    <circle class="ca-hair" cx="80" cy="12.5" r="5.5"/>
    <path class="ca-hairpin" d="M71.5 10.5L89 15.5"/>
    <path class="ca-hair-b" d="M64.5 40C59.5 62 61 88 67 104L73.5 104C68.5 84 67.5 58 67.5 44Z"/>
    <path class="ca-hair-b" d="M95.5 40C100.5 62 99 88 93 104L86.5 104C91.5 84 92.5 58 92.5 44Z"/>
  </g>`,

  // 阵修：道冠 + 法衣（下摆卦纹带），双手于胸前结印，身后阵法环旋转。
  array: `
  <path class="ca-hair-b" d="M65 34C58 62 60 92 67 110L75 110C69 88 68 58 69 40Z"/>
  <path class="ca-hair-b" d="M95 34C102 62 100 92 93 110L85 110C91 88 92 58 91 40Z"/>
  <g class="pc__part part-ribbon"><path class="ca-ribbon" d="M92 70C110 76 122 96 120 120C126 94 113 70 93 64Z"/></g>
  ${NECK}
  ${FEET}
  <path class="ca-robe" d="M61 64C58 92 66 112 67 134C53 180 45 238 43 294Q80 306 117 294C115 238 107 180 93 134C94 112 102 92 99 64Q80 55 61 64Z"/>
  <path class="ca-collar" d="M72 58L80 73L88 58L94 61L80 86L66 61Z"/>
  <path class="ca-sash" d="M66.5 128Q80 135 93.5 128L94.5 139Q80 146 65.5 139Z"/>
  <path class="ca-hem" d="M45 272Q80 284 115 272L116.5 284Q80 296 43.5 284Z"/>
  <g class="ca-weapon">
    <circle class="ca-rune" cx="80" cy="112" r="22"/>
    <circle class="ca-rune ca-rune-d" cx="80" cy="112" r="14"/>
  </g>
  <path class="ca-sleeve" d="M64 70C58.5 84 64.5 98 73 105"/>
  <path class="ca-sleeve" d="M96 70C101.5 84 95.5 98 87 105"/>
  <circle class="ca-hand" cx="75.5" cy="108" r="4.2"/>
  <circle class="ca-hand" cx="84.5" cy="108" r="4.2"/>
  <g class="ca-head">${FACE}</g>
  <g class="pc__hair">
    <path class="ca-hair" d="M64.5 38C63.5 25 70.5 19.5 80 19.5C89.5 19.5 96.5 25 95.5 38C94 30.5 90 27.5 80 27.5C70 27.5 66 30.5 64.5 38Z"/>
    <path class="ca-crown" d="M67.5 27.5L80 15.5L92.5 27.5L92.5 32L67.5 32Z"/>
    <rect class="ca-crown-b" x="65.5" y="31.5" width="29" height="3.4" rx="1.7"/>
  </g>`,

  // 符修：鹤氅宽摆 + 长发垂绦，右手掐诀举符，符纸微悬。
  talisman: `
  <g class="pc__part part-ribbon"><path class="ca-ribbon" d="M92 68C112 74 124 94 122 118C128 92 114 66 93 62Z"/></g>
  ${NECK}
  ${FEET}
  <path class="ca-robe" d="M56 64C50 96 58 120 60 134C48 178 40 236 38 292Q80 304 122 292C120 236 112 178 100 134C102 120 110 96 104 64Q80 54 56 64Z"/>
  <path class="ca-collar" d="M71 57L80 74L89 57L97 61L80 88L63 61Z"/>
  <path class="ca-sash" d="M65 128Q80 136 95 128L96 139Q80 147 64 139Z"/>
  <g class="pc__part part-arm_L">
    <path class="ca-sleeve" d="M64 70C56 82 53 96 55 108"/>
    <circle class="ca-hand" cx="55.5" cy="112" r="4.2"/>
  </g>
  <g class="ca-weapon">
    <g class="ca-talisman">
      <rect x="106.5" y="70" width="10.5" height="21" rx="1.6"/>
      <path class="ca-talisman-rune" d="M109 75h5.5M111.7 73.2v8.6M109 80.5q2.7 2.4 5.4 0"/>
    </g>
  </g>
  <g class="pc__part part-arm_R">
    <path class="ca-sleeve" d="M96 68C106 73 111 83 111 93"/>
    <circle class="ca-hand" cx="111" cy="97.5" r="4.2"/>
  </g>
  <g class="ca-head">${FACE}</g>
  <g class="pc__hair">
    <path class="ca-hair" d="M63 43C61 24 69 17.5 80 17.5C91 17.5 99 24 97 43C95.5 31.5 90.5 26.5 80 26.5C69.5 26.5 64.5 31.5 63 43Z"/>
    <path class="ca-hair-b" d="M63.5 42C58.5 68 59.5 94 63.5 110L70 110C66.5 88 66 62 67 45Z"/>
    <path class="ca-hair-b" d="M96.5 42C101.5 68 100.5 94 96.5 110L90 110C93.5 88 94 62 93 45Z"/>
  </g>`,
};

// 全身像：脚底对齐容器底边（xMidYMax），与 .portrait__doll 的布景衔接。
// 胸像：裁切头部到胸口（y≈-4..114），配合 slice 填满小尺寸圆形 / 竖槽画框。
const VB_FULL = '0 0 160 320';
const VB_BUST = '34 -4 92 118';

function figureEl(card, viewBox, preserve, opts) {
  const cls = classDef(card && card.cls);
  const el = h('span', {
    class: `char-art${opts && opts.sil ? ' is-sil' : ''}`,
    html: `<svg viewBox="${viewBox}" preserveAspectRatio="${preserve}" aria-hidden="true" focusable="false">${ART[cls.key] || ART.sword}</svg>`,
  });
  // 五行代表色（可被卡牌 silhouetteColor 覆盖）落到画布自身，向下级 SVG 形状传递。
  for (const [k, v] of Object.entries(charArtVars(card))) el.style.setProperty(k, v);
  return el;
}

// 全身立绘（修炼页 2.5D 卡面 / 战场剪影底稿）。
export function charFigure(card, opts = {}) {
  return figureEl(card, VB_FULL, 'xMidYMax meet', opts);
}

// 胸像（阵容迷你卡 / 图鉴 / 问道结果等小图标位，替代旧的五行 emoji 头像）。
export function charBust(card, opts = {}) {
  return figureEl(card, VB_BUST, 'xMidYMin slice', opts);
}

// 五行代表色三阶（正 / 深 / 亮），供容器内联着色。
// 卡面（portrait3D）与战场剪影（silhouetteRenderer）都从这里取值，保证同屏只有一档色。
export function charArtVars(card) {
  const sil = silhouetteColor(card);
  return { '--sil': sil, '--sil-d': shade(sil, -0.35), '--sil-l': shade(sil, 0.3) };
}
