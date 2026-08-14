diff --git a/.ai-tasks/issue-95/ai-coder-prompt.md b/.ai-tasks/issue-95/ai-coder-prompt.md
new file mode 100644
index 0000000..e17db1a
--- /dev/null
+++ b/.ai-tasks/issue-95/ai-coder-prompt.md
@@ -0,0 +1,8 @@
+你是一个资深开发者。请解决以下 GitHub Issue：
+【任务标题】: 《灵墟·问剑录》人物继续优化
+【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-95/context.md 文件获取。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
+
+请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-95/context.md b/.ai-tasks/issue-95/context.md
new file mode 100644
index 0000000..fd55b16
--- /dev/null
+++ b/.ai-tasks/issue-95/context.md
@@ -0,0 +1,2 @@
+- 这些人物都不像人呀😂连轮廓都不算（如果页面不好渲染，能不能本次直接先预生产好素材？）
+- 人物只有在修炼页有变化，其他地方还是旧的emoji图标，要同步调整
diff --git a/apps/ling-xu-wen-jian-lu/src/ui/app.js b/apps/ling-xu-wen-jian-lu/src/ui/app.js
index 4ffd302..aa55856 100644
--- a/apps/ling-xu-wen-jian-lu/src/ui/app.js
+++ b/apps/ling-xu-wen-jian-lu/src/ui/app.js
@@ -45,6 +45,7 @@ import {
 import { makeRng } from '../core/rng.js';
 import { BattleScene } from './battle-scene.js';
 import { Portrait3D } from './portrait3D.js';
+import { charBust } from './charArt.js';
 
 const TABS = [
   { key: 'lineup', icon: '⚔️', label: '阵容' },
@@ -378,6 +379,7 @@ export class GameUI {
       const def = cardDef(r.cardId);
       const c = rarityDef(r.rarity).color;
       return h('div', { class: `gacha-card rarity-${r.rarity}`, style: { borderColor: c } },
+        def ? h('div', { class: 'gacha-card__art' }, charBust(def)) : null,
         h('div', { class: 'gacha-card__name', style: { color: c } }, def ? def.name : r.cardId),
         h('div', { class: 'gacha-card__sub' }, `${r.rarity} · ${def ? elName(def.element) : ''}${def ? def.cls : ''}`),
         r.isNew ? h('span', { class: 'tag tag-new' }, 'NEW') : (r.frag ? h('span', { class: 'tag tag-dup' }, `+${r.frag}碎片`) : null),
@@ -837,7 +839,7 @@ export class GameUI {
         const got = !!p.codex[c.id];
         return h('div', { class: `codex-card ${got ? '' : 'locked'}` },
           h('div', { class: 'codex-card__art', style: { borderColor: rarityDef(c.rarity).color } },
-            got ? elEmoji(c.element) : '？'),
+            got ? charBust(c) : '？'),
           h('div', { class: 'codex-card__name' }, got ? c.name : '???'),
           got ? h('div', { class: 'codex-card__sub', style: { color: rarityDef(c.rarity).color } }, `${c.rarity} · ${elName(c.element)}${c.cls}`) : null,
         );
@@ -944,6 +946,8 @@ export class GameUI {
         h('span', { class: 'mini-card__el' }, elEmoji(def.element)),
         h('span', { class: 'mini-card__star', style: { color: r.color } }, `${def.rarity}${'★'.repeat(instance.star)}`),
       ),
+      // 人物胸像（预制矢量素材，替代旧 emoji 头像，与修炼页立绘同源）
+      h('div', { class: 'mini-card__art' }, charBust(def)),
       h('div', { class: 'mini-card__name' }, def.name),
       h('div', { class: 'mini-card__sub' }, `Lv.${instance.level} · 战力${instancePower(instance)}`),
       h('div', { class: 'mini-card__stats' },
diff --git a/apps/ling-xu-wen-jian-lu/src/ui/charArt.js b/apps/ling-xu-wen-jian-lu/src/ui/charArt.js
new file mode 100644
index 0000000..d8656e3
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/ui/charArt.js
@@ -0,0 +1,225 @@
+// ============================================================================
+// 灵墟·问剑录 · 预制矢量人物素材库（issue #95）
+//
+// 早先的立绘 / 战场剪影由 CSS clip-path 程序化拼接，观感「连轮廓都不算人」。
+// 此处改为一次性预绘制好的矢量人物（内联 SVG），五大职业各一副全身像：
+//   剑修·执剑 / 体修·抱元持盾 / 丹修·托炉 / 阵修·结印 / 符修·持符点指
+// 头身比例按真实人形（约 1:7.5）绘制：头颅 / 颈 / 交领袍服 / 双臂 / 足履俱全。
+//
+// 着色契约：素材本身不定死颜色，服装取容器上的 CSS 变量
+//   --sil（正色）/ --sil-d（深）/ --sil-l（亮），即五行代表色（可被卡牌自定义色覆盖）。
+// is-sil 模式整体塌缩为单色多层皮影剪影，供战场微缩表现使用。
+//
+// 导出：
+//   charFigure(card, opts) → HTMLElement 全身像（span.char-art > svg）
+//   charBust(card, opts)   → HTMLElement 同素材的胸像裁切（迷你卡 / 图鉴 / 问道结果）
+// ============================================================================
+import { h } from './dom.js';
+import { classDef, silhouetteColor } from '../config.js';
+
+// —— 共用部件（五官 / 颈 / 足），坐标基于 viewBox 0 0 160 320 ——
+// 眼睛组沿用 .portrait__eyes 类名：动画系统在其上打 .blink（合眼）/ .smile（满好感微笑）。
+const FACE = `
+  <ellipse class="ca-skin" cx="80" cy="41" rx="14.5" ry="16.5"/>
+  <g class="portrait__eyes">
+    <ellipse class="ca-eye" cx="74.2" cy="41.5" rx="1.7" ry="2.7"/>
+    <ellipse class="ca-eye" cx="85.8" cy="41.5" rx="1.7" ry="2.7"/>
+  </g>
+  <path class="ca-line" d="M70.4 35.2q3.4-2.4 6.6-.6"/>
+  <path class="ca-line" d="M89.6 35.2q-3.4-2.4-6.6-.6"/>
+  <path class="ca-line" d="M77.2 49.6q2.8 1.9 5.6 0"/>`;
+
+const NECK = `<path class="ca-skin-sh" d="M75.5 52.5h9V62q-4.5 2.6-9 0z"/>`;
+
+// 足履画在袍摆之前，从下摆探出。
+const FEET = `
+  <path class="ca-shoe" d="M63 296h16v8q-8 3-16 0z"/>
+  <path class="ca-shoe" d="M81 296h16v8q8 3-16 0z"/>`;
+
+// —— 五大职业全身像 ——
+// 分层顺序：背发 / 披风 / 飘带（后） → 颈 / 足 → 袍服 / 交领 / 腰带 → 武器 → 双臂 → 头 / 前发。
+// pc__hair / part-ribbon / part-arm_L / part-arm_R 挂在对应飘动部件上，沿用既有 CSS 关键帧。
+const ART = {
+  // 剑修：窄袖劲装 + 披风，右手执长剑，束发高马尾。
+  sword: `
+  <g class="pc__part part-ribbon"><path class="ca-cape" d="M95 66C111 92 115 150 109 208C103 158 97 116 87 84Z"/></g>
+  ${NECK}
+  ${FEET}
+  <path class="ca-robe" d="M63 62C61 88 67 110 68 132C60 174 54 234 52 292Q80 302 108 292C106 234 100 174 92 132C93 110 99 88 97 62Q80 55 63 62Z"/>
+  <path class="ca-collar" d="M73 57L80 72L87 57L92 60L80 84L68 60Z"/>
+  <path class="ca-sash" d="M67.5 128Q80 135 92.5 128L93.5 139Q80 146 66.5 139Z"/>
+  <path class="ca-sash-tail" d="M77 139L73 172L79.5 174L83 139Z"/>
+  <path class="ca-sleeve" d="M95.5 70C103 76 106.5 86 105.5 95"/>
+  <g class="ca-weapon">
+    <path class="ca-blade" d="M102.6 94L100.6 34L103.6 25L106.6 34L104.6 94Z"/>
+    <path class="ca-guard" d="M97 93.5h13v4h-13z"/>
+    <rect class="ca-hilt" x="102" y="97.5" width="3.4" height="9" rx="1.5"/>
+  </g>
+  <circle class="ca-hand" cx="105.5" cy="100" r="4.4"/>
+  <g class="pc__part part-arm_L">
+    <path class="ca-sleeve" d="M65 70C58 84 55 98 56.5 112"/>
+    <path class="ca-fore" d="M56.5 106C57 110 57.4 114 58 118"/>
+    <circle class="ca-hand" cx="58.6" cy="121.5" r="4.2"/>
+  </g>
+  <g class="ca-head">${FACE}</g>
+  <g class="pc__hair">
+    <path class="ca-hair" d="M63.5 41C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 41C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 41Z"/>
+    <circle class="ca-hair" cx="80" cy="13.5" r="5"/>
+    <path class="ca-hair-l" d="M84.5 15C98 20 103.5 37 101 53C106 36 99.5 17.5 85 12.5Z"/>
+  </g>`,
+
+  // 体修：短打 + 护心镜，双臂外张抱元，左臂负盾，束发系额带。
+  body: `
+  ${NECK}
+  ${FEET}
+  <g class="ca-weapon">
+    <path class="ca-shield" d="M40 90Q29 95 30.5 108Q32 123 40 129Q48 123 49.5 108Q51 95 40 90Z"/>
+    <circle class="ca-shield-boss" cx="40" cy="109" r="4.4"/>
+  </g>
+  <path class="ca-robe" d="M58 64C56 92 64 112 66 130C58 168 52 228 50 292Q80 304 110 292C108 228 102 168 94 130C96 112 104 92 102 64Q80 55 58 64Z"/>
+  <path class="ca-collar" d="M72 58L80 73L88 58L94 61L80 86L66 61Z"/>
+  <path class="ca-sash" d="M66 126Q80 133 94 126L95 137Q80 144 65 137Z"/>
+  <circle class="ca-mirror-rim" cx="80" cy="100" r="11"/>
+  <circle class="ca-mirror" cx="80" cy="100" r="8"/>
+  <g class="pc__part part-arm_L">
+    <path class="ca-sleeve" d="M61 70C51 79 46 91 46.5 101"/>
+    <path class="ca-fore" d="M46.5 98C46 102 46 106 46.5 109"/>
+    <circle class="ca-hand" cx="47" cy="113" r="5.2"/>
+  </g>
+  <g class="pc__part part-arm_R">
+    <path class="ca-sleeve" d="M99 70C109 79 114 91 113.5 101"/>
+    <path class="ca-fore" d="M113.5 98C114 102 114 106 113.5 109"/>
+    <circle class="ca-hand" cx="113" cy="113" r="5.2"/>
+  </g>
+  <g class="ca-head">${FACE}</g>
+  <g class="pc__hair">
+    <path class="ca-hair" d="M64 39C63 24 70 18 80 18C90 18 97 24 96 39C94 30.5 90 26.5 80 26.5C70 26.5 66 30.5 64 39Z"/>
+    <path class="ca-band" d="M64.6 32.5C68 29.6 74 28.2 80 28.2C86 28.2 92 29.6 95.4 32.5L96 36.8C91 34 86 32.8 80 32.8C74 32.8 69 34 64 36.8Z"/>
+  </g>`,
+
+  // 丹修：宽袍大袖 + 双飘带，发髻玉簪，右手托丹炉，炉下灵火摇曳。
+  alchemy: `
+  <g class="pc__part part-ribbon"><path class="ca-ribbon" d="M93 72C112 82 122 106 117 132C124 105 113 76 94 66Z"/></g>
+  ${NECK}
+  ${FEET}
+  <path class="ca-robe" d="M60 64C57 92 66 112 67 132C55 176 46 236 44 294Q80 306 116 294C114 236 105 176 93 132C94 112 103 92 100 64Q80 55 60 64Z"/>
+  <path class="ca-collar" d="M72 58L80 73L88 58L95 61L80 86L65 61Z"/>
+  <path class="ca-sash" d="M66.5 128Q80 135 93.5 128L94.5 139Q80 146 65.5 139Z"/>
+  <path class="ca-sleeve" d="M97 70C106 78 108.5 90 104 101"/>
+  <g class="ca-weapon">
+    <path class="ca-tlg" d="M91 114Q103 109.5 115 114Q113 126.5 103 128.5Q93 126.5 91 114Z"/>
+    <path class="ca-tlg-l" d="M91 114Q103 118.5 115 114L114.2 117.8Q103 122 91.8 117.8Z"/>
+    <path class="ca-flame" d="M96 130Q103 125 110 130Q106.5 137 103 136Q99.5 137 96 130Z"/>
+  </g>
+  <circle class="ca-hand" cx="103" cy="105.5" r="4.2"/>
+  <g class="pc__part part-arm_L">
+    <path class="ca-sleeve-d" d="M62 66C50 78 44 96 50 112C56 114 61 111 63 107C57 97 58 80 64 72Z"/>
+    <path class="ca-sleeve" d="M63 70C53 80 47.5 94 51 107"/>
+    <circle class="ca-hand" cx="51" cy="111" r="4.2"/>
+  </g>
+  <g class="ca-head">${FACE}</g>
+  <g class="pc__hair">
+    <path class="ca-hair" d="M63.5 42C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 42C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 42Z"/>
+    <circle class="ca-hair" cx="80" cy="12.5" r="5.5"/>
+    <path class="ca-hairpin" d="M71.5 10.5L89 15.5"/>
+    <path class="ca-hair-b" d="M64.5 40C59.5 62 61 88 67 104L73.5 104C68.5 84 67.5 58 67.5 44Z"/>
+    <path class="ca-hair-b" d="M95.5 40C100.5 62 99 88 93 104L86.5 104C91.5 84 92.5 58 92.5 44Z"/>
+  </g>`,
+
+  // 阵修：道冠 + 法衣（下摆卦纹带），双手于胸前结印，身后阵法环旋转。
+  array: `
+  <path class="ca-hair-b" d="M65 34C58 62 60 92 67 110L75 110C69 88 68 58 69 40Z"/>
+  <path class="ca-hair-b" d="M95 34C102 62 100 92 93 110L85 110C91 88 92 58 91 40Z"/>
+  <g class="pc__part part-ribbon"><path class="ca-ribbon" d="M92 70C110 76 122 96 120 120C126 94 113 70 93 64Z"/></g>
+  ${NECK}
+  ${FEET}
+  <path class="ca-robe" d="M61 64C58 92 66 112 67 134C53 180 45 238 43 294Q80 306 117 294C115 238 107 180 93 134C94 112 102 92 99 64Q80 55 61 64Z"/>
+  <path class="ca-collar" d="M72 58L80 73L88 58L94 61L80 86L66 61Z"/>
+  <path class="ca-sash" d="M66.5 128Q80 135 93.5 128L94.5 139Q80 146 65.5 139Z"/>
+  <path class="ca-hem" d="M45 272Q80 284 115 272L116.5 284Q80 296 43.5 284Z"/>
+  <g class="ca-weapon">
+    <circle class="ca-rune" cx="80" cy="112" r="22"/>
+    <circle class="ca-rune ca-rune-d" cx="80" cy="112" r="14"/>
+  </g>
+  <path class="ca-sleeve" d="M64 70C58.5 84 64.5 98 73 105"/>
+  <path class="ca-sleeve" d="M96 70C101.5 84 95.5 98 87 105"/>
+  <circle class="ca-hand" cx="75.5" cy="108" r="4.2"/>
+  <circle class="ca-hand" cx="84.5" cy="108" r="4.2"/>
+  <g class="ca-head">${FACE}</g>
+  <g class="pc__hair">
+    <path class="ca-hair" d="M64.5 38C63.5 25 70.5 19.5 80 19.5C89.5 19.5 96.5 25 95.5 38C94 30.5 90 27.5 80 27.5C70 27.5 66 30.5 64.5 38Z"/>
+    <path class="ca-crown" d="M67.5 27.5L80 15.5L92.5 27.5L92.5 32L67.5 32Z"/>
+    <rect class="ca-crown-b" x="65.5" y="31.5" width="29" height="3.4" rx="1.7"/>
+  </g>`,
+
+  // 符修：鹤氅宽摆 + 长发垂绦，右手掐诀举符，符纸微悬。
+  talisman: `
+  <g class="pc__part part-ribbon"><path class="ca-ribbon" d="M92 68C112 74 124 94 122 118C128 92 114 66 93 62Z"/></g>
+  ${NECK}
+  ${FEET}
+  <path class="ca-robe" d="M56 64C50 96 58 120 60 134C48 178 40 236 38 292Q80 304 122 292C120 236 112 178 100 134C102 120 110 96 104 64Q80 54 56 64Z"/>
+  <path class="ca-collar" d="M71 57L80 74L89 57L97 61L80 88L63 61Z"/>
+  <path class="ca-sash" d="M65 128Q80 136 95 128L96 139Q80 147 64 139Z"/>
+  <g class="pc__part part-arm_L">
+    <path class="ca-sleeve" d="M64 70C56 82 53 96 55 108"/>
+    <circle class="ca-hand" cx="55.5" cy="112" r="4.2"/>
+  </g>
+  <g class="ca-weapon">
+    <g class="ca-talisman">
+      <rect x="106.5" y="70" width="10.5" height="21" rx="1.6"/>
+      <path class="ca-talisman-rune" d="M109 75h5.5M111.7 73.2v8.6M109 80.5q2.7 2.4 5.4 0"/>
+    </g>
+  </g>
+  <g class="pc__part part-arm_R">
+    <path class="ca-sleeve" d="M96 68C106 73 111 83 111 93"/>
+    <circle class="ca-hand" cx="111" cy="97.5" r="4.2"/>
+  </g>
+  <g class="ca-head">${FACE}</g>
+  <g class="pc__hair">
+    <path class="ca-hair" d="M63 43C61 24 69 17.5 80 17.5C91 17.5 99 24 97 43C95.5 31.5 90.5 26.5 80 26.5C69.5 26.5 64.5 31.5 63 43Z"/>
+    <path class="ca-hair-b" d="M63.5 42C58.5 68 59.5 94 63.5 110L70 110C66.5 88 66 62 67 45Z"/>
+    <path class="ca-hair-b" d="M96.5 42C101.5 68 100.5 94 96.5 110L90 110C93.5 88 94 62 93 45Z"/>
+  </g>`,
+};
+
+// 全身像：脚底对齐容器底边（xMidYMax），与 .portrait__doll 的布景衔接。
+// 胸像：裁切头部到胸口（y≈-4..114），配合 slice 填满小尺寸圆形 / 竖槽画框。
+const VB_FULL = '0 0 160 320';
+const VB_BUST = '34 -4 92 118';
+
+function figureEl(card, viewBox, preserve, opts) {
+  const cls = classDef(card && card.cls);
+  const el = h('span', {
+    class: `char-art${opts && opts.sil ? ' is-sil' : ''}`,
+    html: `<svg viewBox="${viewBox}" preserveAspectRatio="${preserve}" aria-hidden="true" focusable="false">${ART[cls.key] || ART.sword}</svg>`,
+  });
+  // 五行代表色（可被卡牌 silhouetteColor 覆盖）落到画布自身，向下级 SVG 形状传递。
+  for (const [k, v] of Object.entries(charArtVars(card))) el.style.setProperty(k, v);
+  return el;
+}
+
+// 全身立绘（修炼页 2.5D 卡面 / 战场剪影底稿）。
+export function charFigure(card, opts = {}) {
+  return figureEl(card, VB_FULL, 'xMidYMax meet', opts);
+}
+
+// 胸像（阵容迷你卡 / 图鉴 / 问道结果等小图标位，替代旧的五行 emoji 头像）。
+export function charBust(card, opts = {}) {
+  return figureEl(card, VB_BUST, 'xMidYMin slice', opts);
+}
+
+// 五行代表色三阶（正 / 深 / 亮），供容器内联着色。
+export function charArtVars(card) {
+  const sil = silhouetteColor(card);
+  return { '--sil': sil, '--sil-d': shade(sil, -0.35), '--sil-l': shade(sil, 0.3) };
+}
+
+// 颜色加深 / 变亮：amt 负数加深、正数变亮（与 app.js 的 shade 同实现，独立避免循环依赖）。
+function shade(hex, amt) {
+  if (!hex || hex[0] !== '#') return hex || '#333';
+  const n = hex.length === 4
+    ? hex.slice(1).split('').map((c) => parseInt(c + c, 16))
+    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
+  const f = (v) => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
+  return `rgb(${f(n[0])}, ${f(n[1])}, ${f(n[2])})`;
+}
diff --git a/apps/ling-xu-wen-jian-lu/src/ui/portrait3D.js b/apps/ling-xu-wen-jian-lu/src/ui/portrait3D.js
index e1da0ff..7a18489 100644
--- a/apps/ling-xu-wen-jian-lu/src/ui/portrait3D.js
+++ b/apps/ling-xu-wen-jian-lu/src/ui/portrait3D.js
@@ -21,6 +21,7 @@ import {
   elEmoji, elName, rarityDef, classDef, silhouetteColor, poemOf,
   rarityPortrait, affinityLevel, AFFINITY_MAX,
 } from '../config.js';
+import { charFigure } from './charArt.js';
 import { attachAnimations } from './animationSystem.js';
 import { createInkStream, burstInk } from './inkParticles.js';
 
@@ -122,26 +123,16 @@ export class Portrait3D {
     setTimeout(tick, 0);
   }
 
-  // —— 程序化立绘：头 / 袍服剪影 / 武器 / 飘动部件 ——
+  // —— 预制矢量立绘（charArt.js）：真实人形全身像，含头 / 交领袍服 / 双臂 / 武器 ——
+  // 飘动部件（hair / ribbon / 双袖）与眼睛直接内嵌在 SVG 分组里，
+  // 由 CSS 关键帧（.pc__hair / .part-*）与动画系统（.portrait__eyes 眨眼）驱动。
   _buildDoll(def, cls, sil, rp, maxAff) {
-    const parts = [];
-    // 武器（职业识别核心），位置由 CSS 的 cls-<key> 控制。
-    parts.push(h('span', { class: 'pc__weapon' }, cls.weapon));
-    // 袍服躯干：clip-path 剪影，按剪影色着色。
-    parts.push(h('span', { class: 'pc__robe' }));
-    // 头部 + 眼睛（满好感时微笑）。
-    parts.push(h('span', { class: 'pc__head' },
-      h('span', { class: `portrait__eyes${maxAff ? ' smile' : ''}` }, h('i'), h('i')),
-      h('span', { class: 'pc__hair' }),
-    ));
-    // 飘动部件（仅 SR/SSR）。hair 额外由头部承担，这里补 ribbon / 双袖等。
-    if (rp.dynamic >= 1) {
-      for (const p of cls.sway) {
-        if (p === 'hair') continue; // 头发已在头部，避免重复
-        parts.push(h('span', { class: `pc__part part-${p}` }));
-      }
+    const figure = charFigure(def);
+    if (maxAff) {
+      const eyes = figure.querySelector('.portrait__eyes');
+      if (eyes) eyes.classList.add('smile'); // 满好感·微笑
     }
-    return h('div', { class: `portrait__doll cls-${cls.key}` }, ...parts);
+    return h('div', { class: `portrait__doll cls-${cls.key}` }, figure);
   }
 
   // 朱砂印章：R/SR 左下角，SSR 右上角金字飘浮（设计稿增量 二）。
diff --git a/apps/ling-xu-wen-jian-lu/src/ui/silhouetteRenderer.js b/apps/ling-xu-wen-jian-lu/src/ui/silhouetteRenderer.js
index 120fd8b..5aafbda 100644
--- a/apps/ling-xu-wen-jian-lu/src/ui/silhouetteRenderer.js
+++ b/apps/ling-xu-wen-jian-lu/src/ui/silhouetteRenderer.js
@@ -2,42 +2,31 @@
 // 灵墟·问剑录 · 战场剪影生成器（设计稿增量 第六节：编队/战斗中的角色微缩表现）
 //
 // 2.5D 战场上角色不以完整立绘出现，而用「皮影剪影 + 属性光晕」模式：
-//   - 角色形象：立绘的简化剪影（人物轮廓 + 武器），填充为该角色的五行代表色。
+//   - 角色形象：charArt.js 预制全身像的单色皮影化（人物轮廓 + 武器一眼可辨）。
 //   - 稀有度标识：剪影底部用对应稀有度的光环（青玉 / 紫金 / 彩凰光圈）旋转环绕。
 //   - 受击 / 阵亡 / 选中态由 battle-scene.js 叠加 .hit-flash / .dying / .acting 控制。
 //
 // 返回一个 DOM 节点，嵌入 battle-scene 的 .bs-unit__art 即可。
 // ============================================================================
 import { h } from './dom.js';
-import { classDef, silhouetteColor, elDef } from '../config.js';
+import { classDef, elDef } from '../config.js';
+import { charFigure } from './charArt.js';
 
-// card：卡牌定义（含 cls / silhouetteColor / element）；rarity：用于光环配色。
+// card：卡牌定义（含 cls / element）；rarity：用于光环配色。
 export function renderSilhouette(card, rarity, opts = {}) {
   const cls = classDef(card && card.cls);
-  const sil = silhouetteColor(card);
   const el = elDef(card && card.element);
   const size = opts.size || 'sm';
+  const rar = rarity || (card && card.rarity) || 'R';
   return h('div', {
-    class: `silu silu--${cls.key} silu--${size} rarity-${rarity || (card && card.rarity) || 'R'}`,
-    style: { '--sil': sil, '--sil-d': shade(sil, -0.35), '--sil-l': shade(sil, 0.3) },
+    class: `silu silu--${cls.key} silu--${size} rarity-${rar}`,
     title: cls.pose,
   },
-    h('span', { class: 'silu__body' }),
-    h('span', { class: 'silu__head' }),
-    h('span', { class: 'silu__weapon' }, cls.weapon),
+    // 单色多层皮影剪影（is-sil：肤色 / 深衣 / 武器三阶墨色，轮廓仍可辨人形与武器）。
+    charFigure(card, { sil: true }),
     // 底部稀有度光环（青玉 / 紫金 / 彩凰）
-    h('span', { class: `silu__aura aura-${rarity || (card && card.rarity) || 'R'}` }),
+    h('span', { class: `silu__aura aura-${rar}` }),
     // 五行代表色微标（便于一眼分辨属性）
     el ? h('span', { class: 'silu__el' }, el.emoji) : null,
   );
 }
-
-// 颜色加深 / 变亮：amt 负数加深、正数变亮（与 app.js 的 shade 同实现，独立于此处避免循环依赖）。
-function shade(hex, amt) {
-  if (!hex || hex[0] !== '#') return hex || '#333';
-  const n = hex.length === 4
-    ? hex.slice(1).split('').map((c) => parseInt(c + c, 16))
-    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
-  const f = (v) => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
-  return `rgb(${f(n[0])}, ${f(n[1])}, ${f(n[2])})`;
-}
diff --git a/apps/ling-xu-wen-jian-lu/src/ui/style.css b/apps/ling-xu-wen-jian-lu/src/ui/style.css
index 70de5fc..be5d39c 100644
--- a/apps/ling-xu-wen-jian-lu/src/ui/style.css
+++ b/apps/ling-xu-wen-jian-lu/src/ui/style.css
@@ -199,6 +199,13 @@
 .mini-card.clickable { cursor: pointer; }
 .mini-card.clickable:hover { transform: translateY(-3px); }
 .mini-card__head { display: flex; justify-content: space-between; align-items: center; }
+/* 人物胸像画框（预制矢量素材，五行代表色渐染底）*/
+.mini-card__art {
+  height: 58px; margin: 5px 0 3px; border: 1px solid var(--line); border-radius: 8px;
+  overflow: hidden; display: flex; align-items: flex-end; justify-content: center;
+  background: linear-gradient(180deg, rgba(255,255,255,0.55), var(--paper-2));
+}
+.mini-card__art .char-art { width: 46px; }
 .mini-card__el { font-size: 14px; }
 .mini-card__star { font-size: 10px; font-weight: bold; }
 .mini-card__name { font-size: 13px; font-weight: bold; margin: 2px 0; }
@@ -218,6 +225,12 @@
 }
 .gacha-card.rarity-SSR { box-shadow: 0 0 14px var(--r-SSR); animation: glow 1.6s ease-in-out infinite alternate; }
 .gacha-card.rarity-SR { box-shadow: 0 0 8px var(--r-SR); }
+/* 人物胸像（与修炼页立绘同源，替代纯文字卡面）*/
+.gacha-card__art {
+  width: 64px; height: 76px; margin: 0 auto 6px; border: 1px solid var(--line); border-radius: 10px;
+  overflow: hidden; display: flex; align-items: flex-end; justify-content: center;
+  background: linear-gradient(180deg, rgba(255,255,255,0.6), var(--paper-2));
+}
 @keyframes glow { from { filter: brightness(1); } to { filter: brightness(1.12); } }
 .gacha-card__name { font-size: 15px; font-weight: bold; }
 .gacha-card__sub { font-size: 11px; color: var(--ink-2); margin-top: 2px; }
@@ -288,7 +301,8 @@
 .codex-scroll { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px; margin-top: 10px; }
 .codex-card { background: rgba(255,255,255,0.6); border: 1px solid var(--line); border-radius: 10px; padding: 10px 6px; text-align: center; }
 .codex-card.locked { filter: grayscale(1); opacity: 0.6; }
-.codex-card__art { width: 48px; height: 48px; margin: 0 auto 6px; border-radius: 50%; border: 2px solid var(--line); display: flex; align-items: center; justify-content: center; font-size: 22px; background: var(--paper-2); }
+.codex-card__art { width: 48px; height: 48px; margin: 0 auto 6px; border-radius: 50%; border: 2px solid var(--line); display: flex; align-items: center; justify-content: center; font-size: 22px; background: var(--paper-2); overflow: hidden; }
+.codex-card__art .char-art { width: 40px; }
 .codex-card__name { font-size: 12px; font-weight: bold; }
 .codex-card__sub { font-size: 10px; }
 
@@ -583,60 +597,66 @@
 .portrait__card.inkline .portrait__bg { background: var(--paper); }
 .portrait__card.inkline .portrait__bg::after { background: radial-gradient(circle at 50% 60%, transparent 55%, rgba(44,24,16,0.10)); }
 
-/* —— 角色本体·程序化立绘（头 / 袍服 / 武器 / 飘动部件）—— */
+/* —— 角色本体·预制矢量立绘（charArt.js，真实人形：头 / 交领袍服 / 双臂 / 武器）—— */
 .portrait__doll { position: absolute; left: 21%; bottom: 14%; width: 58%; }
 .portrait__card.dyn-0 .portrait__doll { height: 50%; }   /* R 占卡面 50% */
 .portrait__card.dyn-1 .portrait__doll { height: 64%; }   /* SR 65% */
 .portrait__card.dyn-2 .portrait__doll { height: 74%; }   /* SSR 75% */
 
-.pc__robe {
-  position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
-  width: 80%; height: 62%; z-index: 1;
-  background: linear-gradient(180deg, var(--sil-l), var(--sil) 55%, var(--sil-d));
-  clip-path: polygon(38% 0, 62% 0, 78% 100%, 22% 100%);
-  box-shadow: inset 0 -6px 10px rgba(0,0,0,0.25);
-}
-/* 五大职业袍服剪影（姿态识别，设计稿增量 三）*/
-.cls-sword .pc__robe    { clip-path: polygon(42% 0, 58% 0, 64% 100%, 36% 100%); }
-.cls-body .pc__robe     { clip-path: polygon(26% 0, 74% 0, 88% 100%, 12% 100%); }
-.cls-alchemy .pc__robe  { clip-path: polygon(34% 0, 66% 0, 96% 100%, 4% 100%); }
-.cls-array .pc__robe    { clip-path: polygon(30% 4%, 70% 4%, 82% 42%, 96% 100%, 4% 100%, 18% 42%); }
-.cls-talisman .pc__robe { clip-path: polygon(34% 0, 66% 0, 80% 100%, 20% 100%); }
-/* R 卡墨线白描：袍服改为淡墨晕染（设计稿增量 二·2.1）*/
-.portrait__card.inkline .pc__robe { background: rgba(44,24,16,0.22); box-shadow: inset 0 0 0 2px rgba(44,24,16,0.35); }
-
-.pc__head {
-  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
-  width: 42%; aspect-ratio: 1; border-radius: 50%; z-index: 2;
-  background: linear-gradient(160deg, #f3e7d6, #e3cdb4);
-  box-shadow: inset -2px -2px 4px rgba(0,0,0,0.15);
-}
-.portrait__card.inkline .pc__head { background: var(--paper); box-shadow: inset 0 0 0 2px rgba(44,24,16,0.4); }
-.pc__hair {
-  position: absolute; top: -10%; left: 15%; width: 70%; height: 76%;
-  border-radius: 50% 50% 40% 40%; z-index: 0; transform-origin: 50% 0;
-  background: linear-gradient(180deg, var(--sil-d), var(--sil));
-}
-.portrait__eyes { position: absolute; top: 46%; left: 50%; transform: translate(-50%,-50%); display: flex; gap: 5px; }
-.portrait__eyes i { width: 4px; height: 5px; background: var(--ink); border-radius: 50%; transition: height .08s ease; }
-.portrait__eyes.blink i { height: 1px; }
-.portrait__eyes.smile i { height: 3px; border-radius: 3px 3px 0 0; } /* 满好感·微笑（设计稿 四）*/
-
-.pc__weapon {
-  position: absolute; z-index: 3; font-size: 22px; line-height: 1;
-  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));
-}
-.cls-sword .pc__weapon    { right: -2%; top: 30%; transform: rotate(22deg); }
-.cls-body .pc__weapon     { left: 50%; bottom: -6%; transform: translateX(-50%); font-size: 20px; }
-.cls-alchemy .pc__weapon  { left: 50%; bottom: -10%; transform: translateX(-50%); font-size: 20px; }
-.cls-array .pc__weapon    { left: 50%; top: 40%; transform: translate(-50%,-50%); font-size: 26px; opacity: .82; z-index: 0; }
-.cls-talisman .pc__weapon { left: 50%; top: 56%; transform: translate(-50%,-50%) rotate(-8deg); font-size: 20px; }
-
-/* 飘动部件（衣袂 / 飘带 / 双袖，仅 SR/SSR 渲染）*/
-.pc__part { position: absolute; transform-origin: 50% 0; z-index: 2; }
-.part-ribbon { right: 6%; top: 20%; width: 11%; height: 52%; border-radius: 0 0 45% 45%; opacity: .85; background: linear-gradient(180deg, var(--sil-l), var(--sil)); }
-.part-arm_L { left: 3%; top: 36%; width: 17%; height: 32%; background: linear-gradient(180deg, var(--sil), var(--sil-d)); clip-path: polygon(40% 0, 100% 0, 78% 100%, 0 100%); }
-.part-arm_R { right: 3%; top: 36%; width: 17%; height: 32%; background: linear-gradient(180deg, var(--sil), var(--sil-d)); clip-path: polygon(0 0, 60% 0, 100% 100%, 22% 100%); }
+/* 画布与容器同尺寸；全身像以脚底对齐下缘（见 svg preserveAspectRatio）*/
+.char-art { display: block; width: 100%; height: 100%; }
+.char-art svg { display: block; width: 100%; height: 100%; }
+
+/* —— 素材着色：肤色 / 毛发固定，袍服取五行代表色三阶（--sil / -d / -l）—— */
+.char-art .ca-skin { fill: #f2dfc6; }
+.char-art .ca-skin-sh { fill: #e2c5a0; }
+.char-art .ca-eye { fill: #2c1810; }
+.char-art .ca-line { fill: none; stroke: #2c1810; stroke-width: 1.5; stroke-linecap: round; }
+.char-art .ca-hair, .char-art .ca-hair-b { fill: #3a2a20; }
+.char-art .ca-hair-l { fill: #52403a; }
+.char-art .ca-hairpin { stroke: var(--gold, #D4A04A); stroke-width: 2.4; stroke-linecap: round; }
+.char-art .ca-shoe { fill: #2c1810; }
+.char-art .ca-robe, .char-art .ca-sleeve-d { fill: var(--sil); }
+.char-art .ca-collar, .char-art .ca-cape, .char-art .ca-hem { fill: var(--sil-d); }
+.char-art .ca-sash, .char-art .ca-sash-tail, .char-art .ca-band,
+.char-art .ca-ribbon { fill: var(--sil-l); }
+.char-art .ca-sleeve { fill: none; stroke: var(--sil); stroke-width: 11; stroke-linecap: round; }
+.char-art .ca-fore { fill: none; stroke: var(--sil-d); stroke-width: 8.5; stroke-linecap: round; }
+.char-art .ca-hand { fill: #f2dfc6; stroke: rgba(44,24,16,0.22); stroke-width: 1; }
+/* 武器：金属 / 木石各归其色，一眼可辨职业 */
+.char-art .ca-blade { fill: #e6ebf1; stroke: #98a3ae; stroke-width: 1; }
+.char-art .ca-guard, .char-art .ca-pommel, .char-art .ca-shield-boss,
+.char-art .ca-crown-b, .char-art .ca-mirror-rim { fill: #c9a24a; }
+.char-art .ca-hilt { fill: #7a4a2a; }
+.char-art .ca-shield { fill: var(--sil-d); stroke: var(--sil-l); stroke-width: 2; }
+.char-art .ca-mirror { fill: #eef2f5; }
+.char-art .ca-tlg { fill: #57462f; }
+.char-art .ca-tlg-l { fill: #7a6448; }
+.char-art .ca-flame { fill: #d4564f; }
+.char-art .ca-crown { fill: #2f2438; }
+.char-art .ca-rune { fill: none; stroke: #c9a24a; stroke-width: 2; stroke-dasharray: 5 6; opacity: .8; }
+.char-art .ca-rune-d { stroke-dasharray: 3 5; opacity: .55; }
+.char-art .ca-talisman rect { fill: #f7f0dc; stroke: #c9a24a; stroke-width: 1.2; }
+.char-art .ca-talisman-rune { fill: none; stroke: #c23b22; stroke-width: 1.4; stroke-linecap: round; }
+/* 阵法环缓转 / 符纸微悬 / 炉火摇曳（仅 SR/SSR 卡面启用，见 .dyn-1/.dyn-2）*/
+.portrait__card.dyn-1 .ca-rune, .portrait__card.dyn-2 .ca-rune { animation: ca-rune-spin 9s linear infinite; transform-box: fill-box; transform-origin: 50% 50%; }
+.portrait__card.dyn-1 .ca-talisman, .portrait__card.dyn-2 .ca-talisman { animation: ca-float 2.8s ease-in-out infinite; }
+.portrait__card.dyn-1 .ca-flame, .portrait__card.dyn-2 .ca-flame { animation: ca-flicker 1.2s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
+@keyframes ca-rune-spin { to { transform: rotate(360deg); } }
+@keyframes ca-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2.5px); } }
+@keyframes ca-flicker { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(1.25); } }
+
+/* 眼睛（SVG 分组）：眨眼合目 / 满好感眯眼微笑，由动画系统与 charArt 打类驱动 */
+.char-art .portrait__eyes { transform-box: fill-box; transform-origin: 50% 50%; transition: transform .08s ease; }
+.char-art .portrait__eyes.blink { transform: scaleY(0.12); }
+.char-art .portrait__eyes.smile { transform: scaleY(0.55) translateY(1px); }
+
+/* R 卡墨线白描：整体褪为淡彩素色（设计稿增量 二·2.1）*/
+.portrait__card.inkline .char-art { filter: saturate(0.45) contrast(0.94); }
+
+/* 飘动部件（发 / 飘带 / 双袖）：SVG 分组，以部件顶端的肩位 / 发旋为轴摆动 */
+.char-art .pc__part { transform-box: fill-box; transform-origin: 50% 0; }
+.char-art .pc__hair { transform-box: fill-box; transform-origin: 50% 0; }
 
 /* —— 动态系统：R 呼吸 / SR 局部飘动 / SSR 全动态（设计稿增量 二）—— */
 @keyframes pc-breath { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
@@ -663,7 +683,8 @@
 .portrait__card.is-hover .part-ribbon,
 .portrait__card.is-hover .part-arm_L,
 .portrait__card.is-hover .part-arm_R { animation-duration: 1.1s !important; }
-.portrait__card.is-hover .pc__head { transform: translateX(-50%) rotateY(8deg); transition: transform .2s ease; }
+/* 悬停微转头：头部连同前发轻微侧转（设计稿 四·悬停预览）*/
+.portrait__card.is-hover .ca-head { transform: rotate(3deg); transform-box: fill-box; transform-origin: 50% 90%; transition: transform .2s ease; }
 
 /* —— 朱砂印章（R/SR 左下；SSR 右上金字，设计稿增量 二）—— */
 .portrait__seal {
@@ -750,24 +771,12 @@
 .portrait__immersive-stage { transform: scale(.6); opacity: 0; transition: transform .3s cubic-bezier(.2,.8,.3,1.2), opacity .26s ease; }
 .portrait__immersive.show .portrait__immersive-stage { transform: scale(1.15); opacity: 1; }
 .portrait__immersive-stage .cult-3d__card { width: 200px !important; height: 280px !important; transform: rotateX(6deg) rotateY(0deg) !important; }
-.portrait__immersive-stage .pc__weapon { font-size: 34px; }
 
 /* ============================================================================
    战场剪影·皮影模式（设计稿增量 第六节）
    ============================================================================ */
 .silu { position: relative; width: 100%; height: 100%; }
-.silu__body {
-  position: absolute; left: 50%; bottom: 10%; transform: translateX(-50%);
-  width: 60%; height: 62%;
-  background: linear-gradient(180deg, var(--sil-l), var(--sil) 60%, var(--sil-d));
-  clip-path: polygon(40% 0, 60% 0, 72% 100%, 28% 100%);
-}
-.silu__head {
-  position: absolute; left: 50%; top: 8%; transform: translateX(-50%);
-  width: 40%; aspect-ratio: 1; border-radius: 50%;
-  background: linear-gradient(160deg, var(--sil-l), var(--sil));
-}
-.silu__weapon { position: absolute; left: 50%; top: 42%; transform: translate(-50%,-50%); font-size: 13px; filter: drop-shadow(0 1px 1px rgba(0,0,0,.4)); }
+.silu .char-art { position: absolute; inset: 0; }
 .silu__el { position: absolute; right: -1px; top: -1px; font-size: 9px; opacity: .85; }
 .silu__aura {
   position: absolute; left: 50%; bottom: -2%; transform: translateX(-50%);
@@ -775,17 +784,30 @@
   opacity: .55; animation: silu-aura 4s linear infinite;
 }
 @keyframes silu-aura { from { transform: translateX(-50%) rotate(0); } to { transform: translateX(-50%) rotate(360deg); } }
-/* 各职业剪影差异 */
-.silu--sword .silu__body    { clip-path: polygon(44% 0, 56% 0, 62% 100%, 38% 100%); }
-.silu--body .silu__body     { clip-path: polygon(28% 0, 72% 0, 86% 100%, 14% 100%); }
-.silu--alchemy .silu__body  { clip-path: polygon(34% 0, 66% 0, 94% 100%, 6% 100%); }
-.silu--array .silu__body    { clip-path: polygon(30% 6%, 70% 6%, 82% 44%, 96% 100%, 4% 100%, 18% 44%); }
-.silu--talisman .silu__body { clip-path: polygon(34% 0, 66% 0, 80% 100%, 20% 100%); }
+/* 皮影化：全身像塌缩为五行代表色三阶单色剪影（人形轮廓 + 武器仍可辨识）*/
+.char-art.is-sil .ca-skin, .char-art.is-sil .ca-skin-sh, .char-art.is-sil .ca-hand,
+.char-art.is-sil .ca-hair, .char-art.is-sil .ca-hair-b, .char-art.is-sil .ca-hair-l,
+.char-art.is-sil .ca-shoe, .char-art.is-sil .ca-crown { fill: var(--sil); }
+.char-art.is-sil .ca-robe, .char-art.is-sil .ca-sleeve-d, .char-art.is-sil .ca-cape,
+.char-art.is-sil .ca-collar, .char-art.is-sil .ca-hem, .char-art.is-sil .ca-shield,
+.char-art.is-sil .ca-tlg { fill: var(--sil-d); }
+.char-art.is-sil .ca-sleeve { stroke: var(--sil); }
+.char-art.is-sil .ca-fore { stroke: var(--sil-d); }
+.char-art.is-sil .ca-sash, .char-art.is-sil .ca-sash-tail, .char-art.is-sil .ca-band,
+.char-art.is-sil .ca-ribbon, .char-art.is-sil .ca-blade, .char-art.is-sil .ca-guard,
+.char-art.is-sil .ca-shield-boss, .char-art.is-sil .ca-mirror, .char-art.is-sil .ca-mirror-rim,
+.char-art.is-sil .ca-tlg-l, .char-art.is-sil .ca-flame, .char-art.is-sil .ca-crown-b,
+.char-art.is-sil .ca-hilt, .char-art.is-sil .ca-talisman rect { fill: var(--sil-l); }
+.char-art.is-sil .ca-line, .char-art.is-sil .ca-hairpin,
+.char-art.is-sil .ca-talisman-rune { stroke: var(--sil-l); }
+.char-art.is-sil .ca-eye { fill: var(--sil-l); }
+.char-art.is-sil .ca-rune { stroke: var(--sil-l); }
+.char-art.is-sil .ca-blade, .char-art.is-sil .ca-shield, .char-art.is-sil .ca-mirror,
+.char-art.is-sil .ca-hand, .char-art.is-sil .ca-talisman rect { stroke: none; }
 /* 稀有度光环：青玉 / 紫金 / 彩凰 */
 .silu .aura-R   { border-color: var(--sil); }
 .silu .aura-SR  { border-color: var(--r-SR); box-shadow: 0 0 6px var(--r-SR); }
 .silu .aura-SSR { border-color: var(--gold); box-shadow: 0 0 8px var(--gold); opacity: .75; }
 /* 战场态：出手选中 → 剪影还原为淡彩实体（设计稿 六·选中高亮）*/
-.bs-unit.acting .silu__body, .bs-unit.acting .silu__head { filter: saturate(1.25) brightness(1.1); }
-.bs-unit.acting .silu__body { box-shadow: 0 0 8px rgba(212,160,74,.7); }
+.bs-unit.acting .silu .char-art { filter: saturate(1.3) brightness(1.12) drop-shadow(0 0 6px rgba(212,160,74,.7)); }
 
