diff --git a/.ai-tasks/issue-97/ai-reviewer-prompt_r1.md b/.ai-tasks/issue-97/ai-reviewer-prompt_r1.md
new file mode 100644
index 0000000..a0e6d25
--- /dev/null
+++ b/.ai-tasks/issue-97/ai-reviewer-prompt_r1.md
@@ -0,0 +1,14 @@
+你是一个极其严格、甚至有些刁钻的资深代码审查员。
+这是代码提交后的【第 1 轮】审查。
+请阅读当前目录下的 .ai-tasks/issue-97/pr_diff_r1.md 文件，这是本次 PR 的代码变更。
+
+请检查是否有 Bug、逻辑错误、安全问题或性能瓶颈。
+
+【⚠️ 重要输出格式要求】：
+请严格按照以下纯文本格式输出，每项各占一行，不要使用 Markdown 代码块包裹，不要输出其他任何内容：
+DECISION: APPROVE
+或
+DECISION: REQUEST_CHANGES
+COMMENT: 你的详细审查意见 (如果你的意见中涉及需要修改 CI/CD 或 workflows，请告知人类手动处理)
+
+注意：DECISION 和 COMMENT 必须各占一行，以 DECISION: 和 COMMENT: 开头。COMMENT 的内容可以跨多行。
diff --git a/.ai-tasks/issue-97/context.md b/.ai-tasks/issue-97/context.md
index 88cbb1d..f525d56 100644
--- a/.ai-tasks/issue-97/context.md
+++ b/.ai-tasks/issue-97/context.md
@@ -1,14 +1,4 @@
-收到！以下是 《灵墟·问剑录》全15位角色 的完整AI绘图提示词清单，按 R / SR / SSR 分组，每张卡包含 英文版（可直接粘贴Midjourney/Stable Diffusion） + 中文释义（方便你理解调整）。所有提示词严格对齐前文设计的画风、视角、构图与职业特征。
-
-通用参数说明（所有提示词统一后缀）
-
-参数 值 说明
-画幅比例 --ar 4:3 适配卡牌竖版构图（4:3）
-版本 --v 6.0 Midjourney V6 模型
-风格 --style raw --s 150 保留更多原始画风，不做过份美化
-输出画质 --quality 2 最高画质
-
-Stable Diffusion用户：将提示词中的 --ar 4:3 --v 6.0 替换为 , masterpiece, best quality, 8k, (highres:1.2)，并在Negative Prompt中添加 (worst quality, low quality:1.4), deformed, blurry, bad anatomy。
+我是要求根据这些要求重新预置人物素材，当前几乎所有人物角色都一样！！！！
 
 一、R卡 · 逸品青玉（9张）
 
@@ -70,7 +60,3 @@ SR卡（4张） 工笔重彩 Midjourney V6（用--style raw降低美化） MJ直
 SSR卡（2张） 泼墨泼彩 Midjourney V6（需高频迭代） / DALL-E 3（色彩控制好） 两者并用，择优选取
 
 提示词技巧：每张卡跑 4~6次（Variations），挑选气质最贴切的一张。如果眼神或姿态不对，在提示词中加 (looking down slightly:1.2) 或 (heroic pose:1.3) 加重权重。
-
----
-
-现在你手里有了 15套可直接扔进AI的完整指令，加上“一键抠图+分层”的落地流程，美术资产可以同步开动了。需要我帮你整理 Midjourney参数速查卡 或 SD的Negative Prompt模板 吗？随时追加！
diff --git a/.ai-tasks/issue-97/fixer-feedback_r1.md b/.ai-tasks/issue-97/fixer-feedback_r1.md
new file mode 100644
index 0000000..ed3d9e3
--- /dev/null
+++ b/.ai-tasks/issue-97/fixer-feedback_r1.md
@@ -0,0 +1,13 @@
+逐行核对了 charArt.js 的 BODIES/CHAR_SPECS 组装逻辑、style.css 的着色与 is-sil 塌缩规则、app.js 的接入点，发现以下问题：
+
+1.【逻辑缺陷·必改】BODIES.array 的躯体开头硬编码了两条侧长发 ca-hair-b（charArt.js 中 `array: (s) => ...` 的前两行 path），没有走 slot() 覆写机制。后果：R009 飞羽散修的设定是「短黑发 + 羽簪」，其 hair 槽覆写只替换了头顶层，但这两条垂至 y=110 的长发仍然渲染在背后，与设计稿「短黑发」直接矛盾，也破坏了注释宣称的「角色设定可逐槽覆写」契约。这两条 path 应当挪入 array 的默认 hair 槽（或包一层 slot(s,'hairBack',...)），使 R009/SR004 能显式控制。请修复。
+
+2.【层级隐患·建议修复】BODIES.body 把 weapon 槽放在袍服（ca-robe）之前绘制（沿袭原盾牌负于身后的画法）。这对默认盾没问题，但 R003 的铁锤、SSR001 的巨斧也走该槽：SSR001 左侧斧刃（x≈88-111，y≈58-80）与 R003 锤头左缘会被躯干/右臂遮挡一部分，SSR「持巨斧」的画面表现打折。建议 body 躯体将 weapon 拆为 back-weapon / front-weapon 两个槽，或把斧/锤类武器移到袍服之后绘制。
+
+3.【小问题】BODIES.sword 无条件绘制右手握剑位的手（cx=105.5 cy=100），R007 流火散修 weapon 覆写为空串（剑扛肩）后，这只手悬空握在原剑柄位置，仅恰好贴近背上的剑尾，属于侥幸对位。建议该手也纳入 weapon 槽或单独成槽。
+
+4.【核对通过的点】slot('') 显式去层的语义一致；CHAR_SPECS 15 个 id（R001-R009/SR001-SR004/SSR001-002）与 issue 设定一一对应无遗漏；charArtVars 对 card 为空的防御（`card && card.id`）正确；is-sil 剪影模式对新部件（ca-ear/ca-horn/ca-tail/ca-eye-red/ca-halo 等）的 fill/stroke 塌缩覆盖完整，未发现漏网部件；ca-fore-bare 的 stroke-width 9 裸臂在 is-sil 下正确转为 stroke 着色；CSS 变量 --hair/--hair-l 缺省回退墨黑，不影响无设定卡。
+
+5. context.md 的改动仅是删减 AI 提示词正文，无代码影响；style.css 的 .art-panel 布局含 560px 移动端断点，无问题。不涉及 CI/CD 或 workflows。
+
+综上：第 1 点是与本次 issue 目标（15 人 15 面、按设定逐人预置）直接冲突的功能性缺陷，必须修复后再合入；第 2、3 点建议一并处理。
diff --git a/.ai-tasks/issue-97/fixer-prompt_r1.md b/.ai-tasks/issue-97/fixer-prompt_r1.md
new file mode 100644
index 0000000..73b084f
--- /dev/null
+++ b/.ai-tasks/issue-97/fixer-prompt_r1.md
@@ -0,0 +1,7 @@
+你是一个资深开发工程师。这是针对上一轮代码的【第 1 轮】修复任务。
+以下是代码审查员给你的修改建议，请阅读当前目录下的 .ai-tasks/issue-97/fixer-feedback_r1.md 文件获取详细内容。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 .github/ 目录下的任何文件（特别是 workflows 等 CI/CD 配置），这会破坏项目的自动化流程！如果审查员要求你修改这些文件，请在回复中说明无法自动修改，需要人类介入。
+
+请直接分析并修改当前项目中的代码文件来满足审查员的要求，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-97/pr_diff_r1.md b/.ai-tasks/issue-97/pr_diff_r1.md
new file mode 100644
index 0000000..438edea
--- /dev/null
+++ b/.ai-tasks/issue-97/pr_diff_r1.md
@@ -0,0 +1,871 @@
+diff --git a/.ai-tasks/issue-97/context.md b/.ai-tasks/issue-97/context.md
+index 88cbb1d..f525d56 100644
+--- a/.ai-tasks/issue-97/context.md
++++ b/.ai-tasks/issue-97/context.md
+@@ -1,14 +1,4 @@
+-收到！以下是 《灵墟·问剑录》全15位角色 的完整AI绘图提示词清单，按 R / SR / SSR 分组，每张卡包含 英文版（可直接粘贴Midjourney/Stable Diffusion） + 中文释义（方便你理解调整）。所有提示词严格对齐前文设计的画风、视角、构图与职业特征。
+-
+-通用参数说明（所有提示词统一后缀）
+-
+-参数 值 说明
+-画幅比例 --ar 4:3 适配卡牌竖版构图（4:3）
+-版本 --v 6.0 Midjourney V6 模型
+-风格 --style raw --s 150 保留更多原始画风，不做过份美化
+-输出画质 --quality 2 最高画质
+-
+-Stable Diffusion用户：将提示词中的 --ar 4:3 --v 6.0 替换为 , masterpiece, best quality, 8k, (highres:1.2)，并在Negative Prompt中添加 (worst quality, low quality:1.4), deformed, blurry, bad anatomy。
++我是要求根据这些要求重新预置人物素材，当前几乎所有人物角色都一样！！！！
+ 
+ 一、R卡 · 逸品青玉（9张）
+ 
+@@ -70,7 +60,3 @@ SR卡（4张） 工笔重彩 Midjourney V6（用--style raw降低美化） MJ直
+ SSR卡（2张） 泼墨泼彩 Midjourney V6（需高频迭代） / DALL-E 3（色彩控制好） 两者并用，择优选取
+ 
+ 提示词技巧：每张卡跑 4~6次（Variations），挑选气质最贴切的一张。如果眼神或姿态不对，在提示词中加 (looking down slightly:1.2) 或 (heroic pose:1.3) 加重权重。
+-
+----
+-
+-现在你手里有了 15套可直接扔进AI的完整指令，加上“一键抠图+分层”的落地流程，美术资产可以同步开动了。需要我帮你整理 Midjourney参数速查卡 或 SD的Negative Prompt模板 吗？随时追加！
+diff --git a/apps/ling-xu-wen-jian-lu/src/ui/app.js b/apps/ling-xu-wen-jian-lu/src/ui/app.js
+index 10a488f..94b2b4c 100644
+--- a/apps/ling-xu-wen-jian-lu/src/ui/app.js
++++ b/apps/ling-xu-wen-jian-lu/src/ui/app.js
+@@ -46,7 +46,7 @@ import {
+ import { makeRng } from '../core/rng.js';
+ import { BattleScene } from './battle-scene.js';
+ import { Portrait3D } from './portrait3D.js';
+-import { charBust } from './charArt.js';
++import { charBust, charFigure } from './charArt.js';
+ 
+ const TABS = [
+   { key: 'lineup', icon: '⚔️', label: '阵容' },
+@@ -650,7 +650,9 @@ export class GameUI {
+     return h('div', { class: 'cult-detail' },
+       h('div', { class: 'panel' },
+         h('div', { class: 'panel__head' }, `绘卷 · ${style.name}`),
+-        h('div', { class: 'panel__body' },
++        h('div', { class: 'panel__body art-panel' },
++          // 角色专属立绘预览（charArt.js 的 15 人 15 面预制素材，与提示词设定一一对应）
++          h('div', { class: 'art-figure' }, charFigure(def)),
+           h('div', { class: 'art-spec' },
+             h('div', { class: 'art-spec__row' }, h('span', { class: 'muted' }, '形象'), h('span', null, preset.appearance)),
+             h('div', { class: 'art-spec__row' }, h('span', { class: 'muted' }, '色调'), h('span', null, preset.palette)),
+diff --git a/apps/ling-xu-wen-jian-lu/src/ui/charArt.js b/apps/ling-xu-wen-jian-lu/src/ui/charArt.js
+index 4da9cab..edcaec2 100644
+--- a/apps/ling-xu-wen-jian-lu/src/ui/charArt.js
++++ b/apps/ling-xu-wen-jian-lu/src/ui/charArt.js
+@@ -1,13 +1,16 @@
+ // ============================================================================
+-// 灵墟·问剑录 · 预制矢量人物素材库（issue #95）
++// 灵墟·问剑录 · 预制矢量人物素材库（issue #95 / issue #97）
+ //
+-// 早先的立绘 / 战场剪影由 CSS clip-path 程序化拼接，观感「连轮廓都不算人」。
+-// 此处改为一次性预绘制好的矢量人物（内联 SVG），五大职业各一副全身像：
+-//   剑修·执剑 / 体修·抱元持盾 / 丹修·托炉 / 阵修·结印 / 符修·持符点指
+-// 头身比例按真实人形（约 1:7.5）绘制：头颅 / 颈 / 交领袍服 / 双臂 / 足履俱全。
++// 早先立绘 / 战场剪影按五大职业共用 5 副躯体，同职业角色（如三张剑修 R 卡）
++// 画面完全一致。issue #97 要求按设计稿为 15 位角色逐一预设形象素材：
++//   - 职业躯体（BODIES）提供头身骨架：头 / 颈 / 交领袍服 / 双臂 / 足履；
++//   - 角色设定（CHAR_SPECS，对齐 data/artPresets.js 的形象释义）按卡 id 覆写
++//     发式 / 发色 / 脸型（男女 / 竖瞳 / 红瞳）/ 武器 / 配饰（狐耳狐尾、牛角、
++//     光环、凤冠、莲台、龟甲纹、石拳套……），15 人 15 面，互不撞形。
+ //
+-// 着色契约：素材本身不定死颜色，服装取容器上的 CSS 变量
+-//   --sil（正色）/ --sil-d（深）/ --sil-l（亮），即五行代表色（可被卡牌自定义色覆盖）。
++// 着色契约：素材不定死衣色，服装取容器 CSS 变量
++//   --sil（正色）/ --sil-d（深）/ --sil-l（亮），即五行代表色（可被卡牌自定义色覆盖）；
++//   发色取 --hair / --hair-l（由角色设定的 hairColor 落到画布，缺省墨黑）。
+ // is-sil 模式整体塌缩为单色多层皮影剪影，供战场微缩表现使用。
+ //
+ // 导出：
+@@ -17,18 +20,53 @@
+ import { h } from './dom.js';
+ import { classDef, silhouetteColor, shade } from '../config.js';
+ 
+-// —— 共用部件（五官 / 颈 / 足），坐标基于 viewBox 0 0 160 320 ——
++// —— 共用部件，坐标基于 viewBox 0 0 160 320 ——
+ // 眼睛组沿用 .portrait__eyes 类名：动画系统在其上打 .blink（合眼）/ .smile（满好感微笑）。
++const eyes = (cls) => `
++  <g class="portrait__eyes">
++    <ellipse class="${cls}" cx="74.2" cy="41.5" rx="1.7" ry="2.7"/>
++    <ellipse class="${cls}" cx="85.8" cy="41.5" rx="1.7" ry="2.7"/>
++  </g>`;
++
++// 男相（默认）：剑眉朗目。
+ const FACE = `
+   <ellipse class="ca-skin" cx="80" cy="41" rx="14.5" ry="16.5"/>
+-  <g class="portrait__eyes">
+-    <ellipse class="ca-eye" cx="74.2" cy="41.5" rx="1.7" ry="2.7"/>
+-    <ellipse class="ca-eye" cx="85.8" cy="41.5" rx="1.7" ry="2.7"/>
+-  </g>
++  ${eyes('ca-eye')}
+   <path class="ca-line" d="M70.4 35.2q3.4-2.4 6.6-.6"/>
+   <path class="ca-line" d="M89.6 35.2q-3.4-2.4-6.6-.6"/>
+   <path class="ca-line" d="M77.2 49.6q2.8 1.9 5.6 0"/>`;
+ 
++// 女相：脸庞稍窄、眉目柔和。
++const FACE_F = `
++  <ellipse class="ca-skin" cx="80" cy="41" rx="13.6" ry="16"/>
++  ${eyes('ca-eye')}
++  <path class="ca-line" d="M70.8 35.6q3.1-2.1 6.1-.5"/>
++  <path class="ca-line" d="M89.2 35.6q-3.1-2.1-6.1-.5"/>
++  <path class="ca-line" d="M77.5 49.8q2.5 1.6 5 0"/>`;
++
++// 竖瞳（玄冥蛇姬）：窄长竖目。
++const FACE_SLIT = `
++  <ellipse class="ca-skin" cx="80" cy="41" rx="13.6" ry="16"/>
++  <g class="portrait__eyes">
++    <ellipse class="ca-eye" cx="74.4" cy="41.5" rx="1.1" ry="3"/>
++    <ellipse class="ca-eye" cx="85.6" cy="41.5" rx="1.1" ry="3"/>
++  </g>
++  <path class="ca-line" d="M70.6 34.8q3.4-1.8 6.4-.2"/>
++  <path class="ca-line" d="M89.4 34.8q-3.4-1.8-6.4-.2"/>
++  <path class="ca-line" d="M77.6 49.9q2.4-1.2 4.8 0"/>`;
++
++// 战神相（蚩尤残魂）：赤瞳怒目 + 面部图腾纹。
++const FACE_FIERCE = `
++  <ellipse class="ca-skin" cx="80" cy="41" rx="14.5" ry="16.5"/>
++  <g class="portrait__eyes">
++    <ellipse class="ca-eye-red" cx="74.2" cy="41.5" rx="1.9" ry="2.9"/>
++    <ellipse class="ca-eye-red" cx="85.8" cy="41.5" rx="1.9" ry="2.9"/>
++  </g>
++  <path class="ca-line" d="M70 33.6l8 3.2"/>
++  <path class="ca-line" d="M90 33.6l-8 3.2"/>
++  <path class="ca-line" d="M77 50.4q3-2.2 6 0"/>
++  <path class="ca-totem" d="M67.4 41q2 4 .4 7M92.6 41q-2 4-.4 7M80 54v3.5"/>`;
++
+ const NECK = `<path class="ca-skin-sh" d="M75.5 52.5h9V62q-4.5 2.6-9 0z"/>`;
+ 
+ // 足履画在袍摆之前，从下摆探出。
+@@ -36,150 +74,493 @@ const FEET = `
+   <path class="ca-shoe" d="M63 296h16v8q-8 3-16 0z"/>
+   <path class="ca-shoe" d="M81 296h16v8q8 3-16 0z"/>`;
+ 
+-// —— 五大职业全身像 ——
++// ── 职业躯体（骨架 + 默认部件；角色设定可逐槽覆写）──────────────────────────────
+ // 分层顺序：背发 / 披风 / 飘带（后） → 颈 / 足 → 袍服 / 交领 / 腰带 → 武器 → 双臂 → 头 / 前发。
+ // pc__hair / part-ribbon / part-arm_L / part-arm_R 挂在对应飘动部件上，沿用既有 CSS 关键帧。
+-const ART = {
+-  // 剑修：窄袖劲装 + 披风，右手执长剑，束发高马尾。
+-  sword: `
+-  <g class="pc__part part-ribbon"><path class="ca-cape" d="M95 66C111 92 115 150 109 208C103 158 97 116 87 84Z"/></g>
+-  ${NECK}
+-  ${FEET}
++// slot(spec, key, 默认)：传入 ''（空串）可显式去掉该层（如换武器、去披风）。
++const slot = (s, k, d) => (s && s[k] !== undefined ? s[k] : d);
++
++const CAPE_SWORD = `<g class="pc__part part-ribbon"><path class="ca-cape" d="M95 66C111 92 115 150 109 208C103 158 97 116 87 84Z"/></g>`;
++const ROBE_SWORD = `
+   <path class="ca-robe" d="M63 62C61 88 67 110 68 132C60 174 54 234 52 292Q80 302 108 292C106 234 100 174 92 132C93 110 99 88 97 62Q80 55 63 62Z"/>
+   <path class="ca-collar" d="M73 57L80 72L87 57L92 60L80 84L68 60Z"/>
+   <path class="ca-sash" d="M67.5 128Q80 135 92.5 128L93.5 139Q80 146 66.5 139Z"/>
+   <path class="ca-sash-tail" d="M77 139L73 172L79.5 174L83 139Z"/>
+-  <path class="ca-sleeve" d="M95.5 70C103 76 106.5 86 105.5 95"/>
++  <path class="ca-sleeve" d="M95.5 70C103 76 106.5 86 105.5 95"/>`;
++const WEAPON_SWORD = `
+   <g class="ca-weapon">
+     <path class="ca-blade" d="M102.6 94L100.6 34L103.6 25L106.6 34L104.6 94Z"/>
+     <path class="ca-guard" d="M97 93.5h13v4h-13z"/>
+     <rect class="ca-hilt" x="102" y="97.5" width="3.4" height="9" rx="1.5"/>
+-  </g>
+-  <circle class="ca-hand" cx="105.5" cy="100" r="4.4"/>
++  </g>`;
++const ARM_SWORD_L = `
+   <g class="pc__part part-arm_L">
+     <path class="ca-sleeve" d="M65 70C58 84 55 98 56.5 112"/>
+     <path class="ca-fore" d="M56.5 106C57 110 57.4 114 58 118"/>
+     <circle class="ca-hand" cx="58.6" cy="121.5" r="4.2"/>
+-  </g>
+-  <g class="ca-head">${FACE}</g>
++  </g>`;
++const HAIR_PONY = `
+   <g class="pc__hair">
+     <path class="ca-hair" d="M63.5 41C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 41C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 41Z"/>
+     <circle class="ca-hair" cx="80" cy="13.5" r="5"/>
+     <path class="ca-hair-l" d="M84.5 15C98 20 103.5 37 101 53C106 36 99.5 17.5 85 12.5Z"/>
+-  </g>`,
++  </g>`;
+ 
+-  // 体修：短打 + 护心镜，双臂外张抱元，左臂负盾，束发系额带。
+-  body: `
+-  ${NECK}
+-  ${FEET}
++const WEAPON_SHIELD = `
+   <g class="ca-weapon">
+     <path class="ca-shield" d="M40 90Q29 95 30.5 108Q32 123 40 129Q48 123 49.5 108Q51 95 40 90Z"/>
+     <circle class="ca-shield-boss" cx="40" cy="109" r="4.4"/>
+-  </g>
+-  <path class="ca-robe" d="M58 64C56 92 64 112 66 130C58 168 52 228 50 292Q80 304 110 292C108 228 102 168 94 130C96 112 104 92 102 64Q80 55 58 64Z"/>
+-  <path class="ca-collar" d="M72 58L80 73L88 58L94 61L80 86L66 61Z"/>
+-  <path class="ca-sash" d="M66 126Q80 133 94 126L95 137Q80 144 65 137Z"/>
++  </g>`;
++const CHEST_MIRROR = `
+   <circle class="ca-mirror-rim" cx="80" cy="100" r="11"/>
+-  <circle class="ca-mirror" cx="80" cy="100" r="8"/>
++  <circle class="ca-mirror" cx="80" cy="100" r="8"/>`;
++const ARM_BODY_L = `
+   <g class="pc__part part-arm_L">
+     <path class="ca-sleeve" d="M61 70C51 79 46 91 46.5 101"/>
+     <path class="ca-fore" d="M46.5 98C46 102 46 106 46.5 109"/>
+     <circle class="ca-hand" cx="47" cy="113" r="5.2"/>
+-  </g>
++  </g>`;
++const ARM_BODY_R = `
+   <g class="pc__part part-arm_R">
+     <path class="ca-sleeve" d="M99 70C109 79 114 91 113.5 101"/>
+     <path class="ca-fore" d="M113.5 98C114 102 114 106 113.5 109"/>
+     <circle class="ca-hand" cx="113" cy="113" r="5.2"/>
+-  </g>
+-  <g class="ca-head">${FACE}</g>
++  </g>`;
++const HAIR_BAND = `
+   <g class="pc__hair">
+     <path class="ca-hair" d="M64 39C63 24 70 18 80 18C90 18 97 24 96 39C94 30.5 90 26.5 80 26.5C70 26.5 66 30.5 64 39Z"/>
+     <path class="ca-band" d="M64.6 32.5C68 29.6 74 28.2 80 28.2C86 28.2 92 29.6 95.4 32.5L96 36.8C91 34 86 32.8 80 32.8C74 32.8 69 34 64 36.8Z"/>
+-  </g>`,
++  </g>`;
+ 
+-  // 丹修：宽袍大袖 + 双飘带，发髻玉簪，右手托丹炉，炉下灵火摇曳。
+-  alchemy: `
+-  <g class="pc__part part-ribbon"><path class="ca-ribbon" d="M93 72C112 82 122 106 117 132C124 105 113 76 94 66Z"/></g>
+-  ${NECK}
+-  ${FEET}
+-  <path class="ca-robe" d="M60 64C57 92 66 112 67 132C55 176 46 236 44 294Q80 306 116 294C114 236 105 176 93 132C94 112 103 92 100 64Q80 55 60 64Z"/>
+-  <path class="ca-collar" d="M72 58L80 73L88 58L95 61L80 86L65 61Z"/>
+-  <path class="ca-sash" d="M66.5 128Q80 135 93.5 128L94.5 139Q80 146 65.5 139Z"/>
+-  <path class="ca-sleeve" d="M97 70C106 78 108.5 90 104 101"/>
++const RIBBON_ALCH = `<g class="pc__part part-ribbon"><path class="ca-ribbon" d="M93 72C112 82 122 106 117 132C124 105 113 76 94 66Z"/></g>`;
++const WEAPON_FURNACE = `
+   <g class="ca-weapon">
+     <path class="ca-tlg" d="M91 114Q103 109.5 115 114Q113 126.5 103 128.5Q93 126.5 91 114Z"/>
+     <path class="ca-tlg-l" d="M91 114Q103 118.5 115 114L114.2 117.8Q103 122 91.8 117.8Z"/>
+     <path class="ca-flame" d="M96 130Q103 125 110 130Q106.5 137 103 136Q99.5 137 96 130Z"/>
+-  </g>
+-  <circle class="ca-hand" cx="103" cy="105.5" r="4.2"/>
++  </g>`;
++const ARM_ALCH_L = `
+   <g class="pc__part part-arm_L">
+     <path class="ca-sleeve-d" d="M62 66C50 78 44 96 50 112C56 114 61 111 63 107C57 97 58 80 64 72Z"/>
+     <path class="ca-sleeve" d="M63 70C53 80 47.5 94 51 107"/>
+     <circle class="ca-hand" cx="51" cy="111" r="4.2"/>
+-  </g>
+-  <g class="ca-head">${FACE}</g>
++  </g>`;
++
++const WEAPON_RUNE = `
++  <g class="ca-weapon">
++    <circle class="ca-rune" cx="80" cy="112" r="22"/>
++    <circle class="ca-rune ca-rune-d" cx="80" cy="112" r="14"/>
++  </g>`;
++const HAIR_CROWN = `
+   <g class="pc__hair">
+-    <path class="ca-hair" d="M63.5 42C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 42C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 42Z"/>
+-    <circle class="ca-hair" cx="80" cy="12.5" r="5.5"/>
+-    <path class="ca-hairpin" d="M71.5 10.5L89 15.5"/>
+-    <path class="ca-hair-b" d="M64.5 40C59.5 62 61 88 67 104L73.5 104C68.5 84 67.5 58 67.5 44Z"/>
+-    <path class="ca-hair-b" d="M95.5 40C100.5 62 99 88 93 104L86.5 104C91.5 84 92.5 58 92.5 44Z"/>
+-  </g>`,
++    <path class="ca-hair" d="M64.5 38C63.5 25 70.5 19.5 80 19.5C89.5 19.5 96.5 25 95.5 38C94 30.5 90 27.5 80 27.5C70 27.5 66 30.5 64.5 38Z"/>
++    <path class="ca-crown" d="M67.5 27.5L80 15.5L92.5 27.5L92.5 32L67.5 32Z"/>
++    <rect class="ca-crown-b" x="65.5" y="31.5" width="29" height="3.4" rx="1.7"/>
++  </g>`;
++
++const WEAPON_TALISMAN = `
++  <g class="ca-weapon">
++    <g class="ca-talisman">
++      <rect x="106.5" y="70" width="10.5" height="21" rx="1.6"/>
++      <path class="ca-talisman-rune" d="M109 75h5.5M111.7 73.2v8.6M109 80.5q2.7 2.4 5.4 0"/>
++    </g>
++  </g>`;
++const ARM_TAL_L = `
++  <g class="pc__part part-arm_L">
++    <path class="ca-sleeve" d="M64 70C56 82 53 96 55 108"/>
++    <circle class="ca-hand" cx="55.5" cy="112" r="4.2"/>
++  </g>`;
++const ARM_TAL_R = `
++  <g class="pc__part part-arm_R">
++    <path class="ca-sleeve" d="M96 68C106 73 111 83 111 93"/>
++    <circle class="ca-hand" cx="111" cy="97.5" r="4.2"/>
++  </g>`;
++
++const BODIES = {
++  // 剑修：窄袖劲装 + 披风，右手执剑。
++  sword: (s) => `
++  ${slot(s, 'back', CAPE_SWORD)}
++  ${NECK}
++  ${FEET}
++  ${slot(s, 'robe', ROBE_SWORD)}
++  ${slot(s, 'weapon', WEAPON_SWORD)}
++  <circle class="ca-hand" cx="105.5" cy="100" r="4.4"/>
++  ${slot(s, 'armL', ARM_SWORD_L)}
++  ${slot(s, 'front', '')}
++  <g class="ca-head">${slot(s, 'face', FACE)}</g>
++  ${slot(s, 'hair', HAIR_PONY)}`,
++
++  // 体修：短打 + 护心镜（可换龟甲纹 / 破碎魔甲 / 皮甲），双臂外张抱元。
++  body: (s) => `
++  ${slot(s, 'back', '')}
++  ${NECK}
++  ${FEET}
++  ${slot(s, 'weapon', WEAPON_SHIELD)}
++  <path class="ca-robe" d="M58 64C56 92 64 112 66 130C58 168 52 228 50 292Q80 304 110 292C108 228 102 168 94 130C96 112 104 92 102 64Q80 55 58 64Z"/>
++  <path class="ca-collar" d="M72 58L80 73L88 58L94 61L80 86L66 61Z"/>
++  <path class="ca-sash" d="M66 126Q80 133 94 126L95 137Q80 144 65 137Z"/>
++  ${slot(s, 'chest', CHEST_MIRROR)}
++  ${slot(s, 'armL', ARM_BODY_L)}
++  ${slot(s, 'armR', ARM_BODY_R)}
++  ${slot(s, 'front', '')}
++  <g class="ca-head">${slot(s, 'face', FACE)}</g>
++  ${slot(s, 'hair', HAIR_BAND)}`,
++
++  // 丹修：宽袍大袖 + 双飘带，右手托炉 / 瓶 / 杯。
++  alchemy: (s) => `
++  ${slot(s, 'back', RIBBON_ALCH)}
++  ${NECK}
++  ${FEET}
++  <path class="ca-robe" d="M60 64C57 92 66 112 67 132C55 176 46 236 44 294Q80 306 116 294C114 236 105 176 93 132C94 112 103 92 100 64Q80 55 60 64Z"/>
++  <path class="ca-collar" d="M72 58L80 73L88 58L95 61L80 86L65 61Z"/>
++  <path class="ca-sash" d="M66.5 128Q80 135 93.5 128L94.5 139Q80 146 65.5 139Z"/>
++  <path class="ca-sleeve" d="M97 70C106 78 108.5 90 104 101"/>
++  ${slot(s, 'weapon', WEAPON_FURNACE)}
++  <circle class="ca-hand" cx="103" cy="105.5" r="4.2"/>
++  ${slot(s, 'armL', ARM_ALCH_L)}
++  ${slot(s, 'front', '')}
++  <g class="ca-head">${slot(s, 'face', FACE)}</g>
++  ${slot(s, 'hair', HAIR_CROWN)}`,
+ 
+   // 阵修：道冠 + 法衣（下摆卦纹带），双手于胸前结印，身后阵法环旋转。
+-  array: `
++  array: (s) => `
+   <path class="ca-hair-b" d="M65 34C58 62 60 92 67 110L75 110C69 88 68 58 69 40Z"/>
+   <path class="ca-hair-b" d="M95 34C102 62 100 92 93 110L85 110C91 88 92 58 91 40Z"/>
+-  <g class="pc__part part-ribbon"><path class="ca-ribbon" d="M92 70C110 76 122 96 120 120C126 94 113 70 93 64Z"/></g>
++  ${slot(s, 'back', `<g class="pc__part part-ribbon"><path class="ca-ribbon" d="M92 70C110 76 122 96 120 120C126 94 113 70 93 64Z"/></g>`)}
+   ${NECK}
+   ${FEET}
+   <path class="ca-robe" d="M61 64C58 92 66 112 67 134C53 180 45 238 43 294Q80 306 117 294C115 238 107 180 93 134C94 112 102 92 99 64Q80 55 61 64Z"/>
+   <path class="ca-collar" d="M72 58L80 73L88 58L94 61L80 86L66 61Z"/>
+   <path class="ca-sash" d="M66.5 128Q80 135 93.5 128L94.5 139Q80 146 65.5 139Z"/>
+   <path class="ca-hem" d="M45 272Q80 284 115 272L116.5 284Q80 296 43.5 284Z"/>
+-  <g class="ca-weapon">
+-    <circle class="ca-rune" cx="80" cy="112" r="22"/>
+-    <circle class="ca-rune ca-rune-d" cx="80" cy="112" r="14"/>
+-  </g>
++  ${slot(s, 'weapon', WEAPON_RUNE)}
+   <path class="ca-sleeve" d="M64 70C58.5 84 64.5 98 73 105"/>
+   <path class="ca-sleeve" d="M96 70C101.5 84 95.5 98 87 105"/>
+   <circle class="ca-hand" cx="75.5" cy="108" r="4.2"/>
+   <circle class="ca-hand" cx="84.5" cy="108" r="4.2"/>
+-  <g class="ca-head">${FACE}</g>
+-  <g class="pc__hair">
+-    <path class="ca-hair" d="M64.5 38C63.5 25 70.5 19.5 80 19.5C89.5 19.5 96.5 25 95.5 38C94 30.5 90 27.5 80 27.5C70 27.5 66 30.5 64.5 38Z"/>
+-    <path class="ca-crown" d="M67.5 27.5L80 15.5L92.5 27.5L92.5 32L67.5 32Z"/>
+-    <rect class="ca-crown-b" x="65.5" y="31.5" width="29" height="3.4" rx="1.7"/>
+-  </g>`,
++  ${slot(s, 'front', '')}
++  <g class="ca-head">${slot(s, 'face', FACE)}</g>
++  ${slot(s, 'hair', HAIR_CROWN)}`,
+ 
+-  // 符修：鹤氅宽摆 + 长发垂绦，右手掐诀举符，符纸微悬。
+-  talisman: `
+-  <g class="pc__part part-ribbon"><path class="ca-ribbon" d="M92 68C112 74 124 94 122 118C128 92 114 66 93 62Z"/></g>
++  // 符修：鹤氅宽摆 + 长发垂绦，右手掐诀举符。
++  talisman: (s) => `
++  ${slot(s, 'back', `<g class="pc__part part-ribbon"><path class="ca-ribbon" d="M92 68C112 74 124 94 122 118C128 92 114 66 93 62Z"/></g>`)}
+   ${NECK}
+   ${FEET}
+   <path class="ca-robe" d="M56 64C50 96 58 120 60 134C48 178 40 236 38 292Q80 304 122 292C120 236 112 178 100 134C102 120 110 96 104 64Q80 54 56 64Z"/>
+   <path class="ca-collar" d="M71 57L80 74L89 57L97 61L80 88L63 61Z"/>
+   <path class="ca-sash" d="M65 128Q80 136 95 128L96 139Q80 147 64 139Z"/>
+-  <g class="pc__part part-arm_L">
+-    <path class="ca-sleeve" d="M64 70C56 82 53 96 55 108"/>
+-    <circle class="ca-hand" cx="55.5" cy="112" r="4.2"/>
+-  </g>
+-  <g class="ca-weapon">
+-    <g class="ca-talisman">
+-      <rect x="106.5" y="70" width="10.5" height="21" rx="1.6"/>
+-      <path class="ca-talisman-rune" d="M109 75h5.5M111.7 73.2v8.6M109 80.5q2.7 2.4 5.4 0"/>
+-    </g>
+-  </g>
+-  <g class="pc__part part-arm_R">
+-    <path class="ca-sleeve" d="M96 68C106 73 111 83 111 93"/>
+-    <circle class="ca-hand" cx="111" cy="97.5" r="4.2"/>
+-  </g>
+-  <g class="ca-head">${FACE}</g>
++  ${slot(s, 'armL', ARM_TAL_L)}
++  ${slot(s, 'weapon', WEAPON_TALISMAN)}
++  ${slot(s, 'armR', ARM_TAL_R)}
++  ${slot(s, 'front', '')}
++  <g class="ca-head">${slot(s, 'face', FACE)}</g>
++  ${slot(s, 'hair', `
+   <g class="pc__hair">
+     <path class="ca-hair" d="M63 43C61 24 69 17.5 80 17.5C91 17.5 99 24 97 43C95.5 31.5 90.5 26.5 80 26.5C69.5 26.5 64.5 31.5 63 43Z"/>
+     <path class="ca-hair-b" d="M63.5 42C58.5 68 59.5 94 63.5 110L70 110C66.5 88 66 62 67 45Z"/>
+     <path class="ca-hair-b" d="M96.5 42C101.5 68 100.5 94 96.5 110L90 110C93.5 88 94 62 93 45Z"/>
+-  </g>`,
++  </g>`)}`,
++};
++
++// ── 15 位角色形象设定（对齐 data/artPresets.js 的中文形象释义）──────────────────
++// base 沿用职业骨架；hair / face / weapon / chest / arm / back / front 逐槽覆写。
++const CHAR_SPECS = {
++  // —— R 卡 · 逸品青玉 ——
++  // 青竹剑侍：绿白汉服竹叶刺绣，马尾高束，执青竹剑（竹节青刃 + 竹叶）。
++  R001: {
++    base: 'sword',
++    weapon: `
++    <g class="ca-weapon">
++      <path class="ca-blade-bamboo" d="M102.6 94L100.6 34L103.6 25L106.6 34L104.6 94Z"/>
++      <path class="ca-guard" d="M97 93.5h13v4h-13z"/>
++      <rect class="ca-hilt" x="102" y="97.5" width="3.4" height="9" rx="1.5"/>
++      <path class="ca-leaf" d="M106.5 62q7-4.5 11.5.5q-7.5 3.5-11.5-.5z"/>
++    </g>`,
++  },
++  // 赤焰灵狐：狐耳狐尾狐女，指夹燃烧黄符，狡黠笑容。
++  R002: {
++    base: 'talisman', face: FACE_F,
++    back: `
++    <g class="pc__part part-ribbon">
++      <path class="ca-tail" d="M100 118C134 126 150 164 140 202C141 170 126 142 98 134Z"/>
++      <path class="ca-tail-tip" d="M136 178C146 190 147 202 139 212C146 197 142 187 132 178Z"/>
++    </g>`,
++    weapon: `
++    <g class="ca-weapon">
++      <g class="ca-talisman">
++        <rect x="106.5" y="70" width="10.5" height="21" rx="1.6"/>
++        <path class="ca-talisman-rune" d="M109 75h5.5M111.7 73.2v8.6M109 80.5q2.7 2.4 5.4 0"/>
++      </g>
++      <path class="ca-flame" d="M111.8 69q3.8-4 .8-8.6q-.9 3.6-3.2 5.5q-1.3 2 2.4 3.1z"/>
++    </g>`,
++    hair: `
++    <g class="pc__hair">
++      <path class="ca-hair" d="M64 41C62 24 69 16.5 80 16.5C91 16.5 98 24 96 41C95 30.5 90 25.5 80 25.5C70 25.5 65 30.5 64 41Z"/>
++      <path class="ca-hair-b" d="M64 40C58 60 58 78 63 92L70 92C66 74 66.5 56 67.5 44Z"/>
++      <path class="ca-hair-b" d="M96 40C102 60 102 78 97 92L90 92C94 74 93.5 56 92.5 44Z"/>
++      <path class="ca-ear" d="M66.5 21L64 4L77 15.5Z"/>
++      <path class="ca-ear" d="M93.5 21L96 4L83 15.5Z"/>
++      <path class="ca-ear-in" d="M67.8 18L66.9 8.8L73.6 14.6Z"/>
++      <path class="ca-ear-in" d="M92.2 18L93.1 8.8L86.4 14.6Z"/>
++    </g>`,
++    hairColor: '#4a2620',
++  },
++  // 玄龟甲士：龟甲纹重铠，持圆盾 + 铁锤，灰短发。
++  R003: {
++    base: 'body', hairColor: '#93938c',
++    weapon: `
++    <g class="ca-weapon">
++      <path class="ca-shield" d="M40 90Q29 95 30.5 108Q32 123 40 129Q48 123 49.5 108Q51 95 40 90Z"/>
++      <circle class="ca-shield-boss" cx="40" cy="109" r="4.4"/>
++      <g class="ca-hammer">
++        <rect class="ca-hilt" x="111" y="76" width="4" height="40" rx="2"/>
++        <rect class="ca-hammer-head" x="101.5" y="66" width="23" height="13" rx="2.5"/>
++      </g>
++    </g>`,
++    chest: `
++    <g class="ca-shell">
++      <path d="M80 86l11 6.5v13L80 112l-11-6.5v-13z"/>
++      <path class="ca-shell-line" d="M69 92.5h22M80 86v26"/>
++    </g>`,
++  },
++  // 金戈锐士：银白镶金轻甲，执金剑斜指，眼神锐利，短黑发。
++  R004: {
++    base: 'sword',
++    weapon: `
++    <g class="ca-weapon">
++      <path class="ca-blade-gold" d="M102.6 94L100.6 34L103.6 25L106.6 34L104.6 94Z"/>
++      <path class="ca-guard" d="M97 93.5h13v4h-13z"/>
++      <rect class="ca-hilt" x="102" y="97.5" width="3.4" height="9" rx="1.5"/>
++    </g>`,
++    front: `
++    <path class="ca-pauldron" d="M93 61q11 2 13.5 14q-9.5-1-15-7.5z"/>
++    <path class="ca-pauldron" d="M67 61q-11 2-13.5 14q9.5-1 15-7.5z"/>`,
++    hair: `
++    <g class="pc__hair">
++      <path class="ca-hair" d="M64.5 39C63.5 24 70.5 18 80 18C89.5 18 96.5 24 95.5 39C94 30.5 90 26.5 80 26.5C70 26.5 66 30.5 64.5 39Z"/>
++    </g>`,
++  },
++  // 厚土力士：裸臂黄袍，石拳套，褐皮护胸，棕短发。
++  R005: {
++    base: 'body', hairColor: '#6b4a2c',
++    chest: `
++    <path class="ca-strap" d="M62 64l35 45"/>
++    <circle class="ca-shield-boss" cx="87" cy="99" r="3"/>`,
++    armL: `
++    <g class="pc__part part-arm_L">
++      <path class="ca-fore-bare" d="M61 70C51 79 46 91 46.5 101"/>
++      <circle class="ca-gauntlet" cx="47" cy="110" r="7.2"/>
++    </g>`,
++    armR: `
++    <g class="pc__part part-arm_R">
++      <path class="ca-fore-bare" d="M99 70C109 79 114 91 113.5 101"/>
++      <circle class="ca-gauntlet" cx="113" cy="110" r="7.2"/>
++    </g>`,
++    weapon: '',
++  },
++  // 柳叶医仙：温柔女医，青白道袍，捧青瓷药炉，长发披散。
++  R006: {
++    base: 'alchemy', face: FACE_F,
++    hair: `
++    <g class="pc__hair">
++      <path class="ca-hair" d="M63.5 42C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 42C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 42Z"/>
++      <path class="ca-hair-b" d="M63 40C56 66 55 96 60 122L68 122C63 96 64 66 67 46Z"/>
++      <path class="ca-hair-b" d="M97 40C104 66 105 96 100 122L92 122C97 96 96 66 93 46Z"/>
++      <path class="ca-hairpin" d="M70 11L90 15"/>
++    </g>`,
++  },
++  // 流火散修：不羁散修，破旧红衣（灼痕），铁剑扛肩，蓬松长发，狂放笑容。
++  R007: {
++    base: 'sword', hairColor: '#33261e',
++    back: `
++    <g class="pc__part part-ribbon">
++      <path class="ca-cape" d="M95 66C111 92 115 150 109 208C103 158 97 116 87 84Z"/>
++      <path class="ca-blade" d="M104 106L69 8L66 12L107 101Z"/>
++      <path class="ca-guard" d="M100 102l6-3 2 4-6 3z"/>
++    </g>`,
++    weapon: '',
++    hair: `
++    <g class="pc__hair">
++      <path class="ca-hair" d="M62 44C60 23 69 16 80 16C91 16 100 23 98 44C96 31 90 25.5 80 25.5C70 25.5 64 31 62 44Z"/>
++      <path class="ca-hair-b" d="M61 40C54 70 55 100 60 124L69 122C64 98 63 68 66 46Z"/>
++      <path class="ca-hair-b" d="M99 40C106 70 105 100 100 124L91 122C96 98 97 68 94 46Z"/>
++    </g>`,
++  },
++  // 霜月散修：高冷女修，纯白银雪绣袍，持冰蓝符，银白长发。
++  R008: {
++    base: 'talisman', face: FACE_F, hairColor: '#c6d3dd',
++    weapon: `
++    <g class="ca-weapon">
++      <g class="ca-talisman ca-talisman-ice">
++        <rect x="106.5" y="70" width="10.5" height="21" rx="1.6"/>
++        <path class="ca-talisman-rune" d="M109 75h5.5M111.7 73.2v8.6M109 80.5q2.7 2.4 5.4 0"/>
++      </g>
++    </g>`,
++    hair: `
++    <g class="pc__hair">
++      <path class="ca-hair" d="M63.5 42C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 42C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 42Z"/>
++      <path class="ca-hair-b" d="M62.5 40C55 68 56 100 62 126L70 124C64.5 100 64 68 67 46Z"/>
++      <path class="ca-hair-b" d="M97.5 40C105 68 104 100 98 126L90 124C95.5 100 96 68 93 46Z"/>
++      <path class="ca-hairpin" d="M67 10L93 14"/>
++    </g>`,
++  },
++  // 飞羽散修：敏捷阵修，金线羽纹道袍，持罗盘，短黑发 + 羽簪。
++  R009: {
++    base: 'array',
++    weapon: `
++    <g class="ca-weapon">
++      <circle class="ca-rune" cx="80" cy="112" r="22"/>
++      <circle class="ca-rune ca-rune-d" cx="80" cy="112" r="14"/>
++      <g class="ca-compass">
++        <circle class="ca-compass-rim" cx="80" cy="126" r="9"/>
++        <circle class="ca-compass-face" cx="80" cy="126" r="6.5"/>
++        <path class="ca-compass-needle" d="M80 120.5L82 126L80 131.5L78 126Z"/>
++      </g>
++    </g>`,
++    hair: `
++    <g class="pc__hair">
++      <path class="ca-hair" d="M64 39C63 24 70 18 80 18C90 18 97 24 96 39C94 30.5 90 26.5 80 26.5C70 26.5 66 30.5 64 39Z"/>
++      <path class="ca-feather" d="M87 14C92 6.5 100 4 105.5 6C102.5 12.5 94 16 87 14Z"/>
++      <path class="ca-hairpin" d="M85 14.5L104 8"/>
++    </g>`,
++  },
++
++  // —— SR 卡 · 绝品紫金 ——
++  // 白鹤仙子：白鹤羽衣金云纹，持玉净瓶，黑长发飘飞缀白羽簪。
++  SR001: {
++    base: 'alchemy', face: FACE_F,
++    weapon: `
++    <g class="ca-weapon">
++      <g class="ca-vase">
++        <rect class="ca-vase-neck" x="101.5" y="96" width="3" height="8" rx="1.2"/>
++        <path class="ca-vase-body" d="M96 104q7-6.5 14 0q2 8.5-7 14.5q-9-6-7-14.5z"/>
++      </g>
++    </g>`,
++    hair: `
++    <g class="pc__hair">
++      <path class="ca-hair" d="M63.5 42C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 42C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 42Z"/>
++      <path class="ca-hair-b" d="M62.5 40C54 70 55 104 62 128L71 126C65 102 64 68 68 46Z"/>
++      <path class="ca-hair-b" d="M97.5 40C106 70 105 104 98 128L89 126C95 102 96 68 92 46Z"/>
++      <path class="ca-feather" d="M70 11C66 3.5 58 1.5 53 3.5C56 10 64 13 70 11Z"/>
++    </g>`,
++  },
++  // 赤霄剑尊：红黑战袍金火纹，持赤红巨剑（火焰缠绕），红绳束发髻。
++  SR002: {
++    base: 'sword',
++    weapon: `
++    <g class="ca-weapon">
++      <path class="ca-blade-fire" d="M105.5 96L100.5 18L110.5 18L107.5 96Z"/>
++      <path class="ca-guard" d="M96 95h15v4.5h-15z"/>
++      <rect class="ca-hilt" x="104" y="99.5" width="4" height="9.5" rx="1.6"/>
++      <path class="ca-flame" d="M100.5 62q-6.5-6-2.5-13.5q2 6.5 6.5 8.5q3 3-4 5z"/>
++      <path class="ca-flame" d="M110.5 44q6.5-7 2.5-14.5q-2 7-6.5 9q-3 3 4 5.5z"/>
++    </g>`,
++    hair: `
++    <g class="pc__hair">
++      <path class="ca-hair" d="M63.5 41C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 41C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 41Z"/>
++      <circle class="ca-hair" cx="80" cy="13.5" r="5.5"/>
++      <path class="ca-band" d="M74.5 15.5q5.5 2.4 11 0l-1.2 3.4q-4.3 1.7-8.6 0z"/>
++    </g>`,
++  },
++  // 玄冥蛇姬：暗紫蛇鳞紧身袍，持盘蛇法杖，竖瞳狡笑，黑发缠小蛇。
++  SR003: {
++    base: 'talisman', face: FACE_SLIT, hairColor: '#2e2434',
++    weapon: `
++    <g class="ca-weapon">
++      <rect class="ca-staff" x="109.2" y="48" width="3.6" height="56" rx="1.8"/>
++      <path class="ca-snake" d="M111 49C103 47 100.5 40.5 105 36.5C109.5 32.8 116 35 115.6 40C115.2 44.4 110 45 110.6 40.6"/>
++      <circle class="ca-eye-red" cx="107" cy="36.5" r="1"/>
++    </g>`,
++    hair: `
++    <g class="pc__hair">
++      <path class="ca-hair" d="M63.5 42C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 42C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 42Z"/>
++      <path class="ca-hair-b" d="M63 40C56 68 57 98 62 122L70 120C65 96 65 68 67.5 46Z"/>
++      <path class="ca-hair-b" d="M97 40C104 68 103 98 98 122L90 120C95 96 95 68 92.5 46Z"/>
++      <path class="ca-snake" d="M66.5 16q-6.5-8 0-13.5q5.5-4 8.5 1q2 5.5-3.5 6.5"/>
++      <path class="ca-snake" d="M93.5 16q6.5-8 0-13.5q-5.5-4-8.5 1q-2 5.5 3.5 6.5"/>
++    </g>`,
++  },
++  // 青莲道尊：青莲道袍宽袖，持拂尘，灰白长发木簪，出尘安和。
++  SR004: {
++    base: 'array', hairColor: '#cfcac0',
++    weapon: `
++    <g class="ca-weapon">
++      <circle class="ca-rune" cx="80" cy="112" r="22"/>
++      <circle class="ca-rune ca-rune-d" cx="80" cy="112" r="14"/>
++      <g class="ca-whisk">
++        <path class="ca-staff-line" d="M84 110L102 76"/>
++        <path d="M102 76C98 68 100 60 106 56C106 64 108 70 106 76Z"/>
++        <path d="M102 76C108 70 114 68 120 70C114 74 110 78 104 79Z"/>
++        <path d="M102 76C96 70 90 68 84 70C90 74 94 78 100 79Z"/>
++      </g>
++    </g>`,
++    hair: `
++    <g class="pc__hair">
++      <path class="ca-hair" d="M64.5 38C63.5 25 70.5 19.5 80 19.5C89.5 19.5 96.5 25 95.5 38C94 30.5 90 27.5 80 27.5C70 27.5 66 30.5 64.5 38Z"/>
++      <circle class="ca-hair" cx="80" cy="14" r="5.5"/>
++      <path class="ca-hairpin" d="M70 11.5L92 15.5"/>
++    </g>`,
++  },
++
++  // —— SSR 卡 · 至品彩凰 ——
++  // 蚩尤残魂：牛角盔碎暗金魔甲，持巨斧（赤雷缠绕），红眼狂发，面部图腾纹。
++  SSR001: {
++    base: 'body', face: FACE_FIERCE, hairColor: '#26201c',
++    weapon: `
++    <g class="ca-weapon">
++      <g class="ca-axe">
++        <rect class="ca-staff" x="111" y="58" width="4.4" height="76" rx="2.2"/>
++        <path class="ca-axe-head" d="M115.4 58C130 58 138 66 138 76C130 80.5 122 80.5 115.4 78Z"/>
++        <path class="ca-axe-head" d="M111 58C96.4 58 88.4 66 88.4 76C96.4 80.5 104.4 80.5 111 78Z"/>
++        <path class="ca-lightning" d="M122 52l6 8-5 2 7 9"/>
++      </g>
++    </g>`,
++    chest: `
++    <path class="ca-armor-broken" d="M69 90h22v17q-11 8-22 0z"/>
++    <path class="ca-shell-line" d="M80 90v21M69 98h22M76 92l2 9"/>`,
++    hair: `
++    <g class="pc__hair">
++      <path class="ca-hair" d="M62 42C60 22 69 15 80 15C91 15 100 22 98 42C96 30 90 24 80 24C70 24 64 30 62 42Z"/>
++      <path class="ca-hair-b" d="M61 38C53 62 54 84 59 100L67 98C62 80 62 60 66 44Z"/>
++      <path class="ca-hair-b" d="M99 38C107 62 106 84 101 100L93 98C98 80 98 60 94 44Z"/>
++      <path class="ca-horn" d="M66.5 22C56.5 18 50.5 10 50.5 2C58.5 4 64.5 10 68.5 18Z"/>
++      <path class="ca-horn" d="M93.5 22C103.5 18 109.5 10 109.5 2C101.5 4 95.5 10 91.5 18Z"/>
++    </g>`,
++  },
++  // 瑶池圣母：七色彩凰霓裳 + 金凤冠，持玉杯甘露，光环绕首，立金莲之上。
++  SSR002: {
++    base: 'alchemy', face: FACE_F,
++    back: `
++    <g class="pc__part part-ribbon">
++      <path class="ca-ribbon" d="M93 72C112 82 122 106 117 132C124 105 113 76 94 66Z"/>
++      <circle class="ca-halo" cx="80" cy="38" r="27"/>
++      <circle class="ca-halo-h" cx="80" cy="38" r="21.5"/>
++    </g>`,
++    weapon: `
++    <g class="ca-weapon">
++      <g class="ca-goblet">
++        <path class="ca-goblet-cup" d="M97.5 97h12q0 8.5-6 10.8q-6-2.3-6-10.8z"/>
++        <rect class="ca-goblet-stem" x="102.7" y="108" width="1.8" height="6" rx="0.9"/>
++        <path class="ca-goblet-base" d="M99.5 114h8.5l1.4 3.4h-11.4z"/>
++      </g>
++    </g>`,
++    front: `
++    <g class="ca-lotus">
++      <path class="ca-lotus-p" d="M56 293q9 12 24 12t24-12q-10 6-24 6t-24-6z"/>
++      <path class="ca-lotus-p" d="M59 291q2 10 8.5 13.5q-1-8 1-13.5z"/>
++      <path class="ca-lotus-p" d="M74 295q2 9 6 11.5q0-7 1-11.5z"/>
++      <path class="ca-lotus-p" d="M101 291q-2 10-8.5 13.5q1-8-1-13.5z"/>
++      <path class="ca-lotus-p" d="M86 295q-2 9-6 11.5q0-7-1-11.5z"/>
++    </g>`,
++    hair: `
++    <g class="pc__hair">
++      <path class="ca-hair" d="M63.5 42C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 42C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 42Z"/>
++      <path class="ca-hair-b" d="M62.5 40C53 72 54 108 62 134L72 132C65 106 64 70 68 46Z"/>
++      <path class="ca-hair-b" d="M97.5 40C107 72 106 108 98 134L88 132C95 106 96 70 92 46Z"/>
++      <path class="ca-crown-phoenix" d="M70.5 13.5L78 3L82 12L87.5 4L90.5 13.5Z"/>
++    </g>`,
++  },
+ };
+ 
+ // 全身像：脚底对齐容器底边（xMidYMax），与 .portrait__doll 的布景衔接。
+@@ -189,11 +570,14 @@ const VB_BUST = '34 -4 92 118';
+ 
+ function figureEl(card, viewBox, preserve, opts) {
+   const cls = classDef(card && card.cls);
++  // 优先取角色专属设定（15 人 15 面），无设定的卡回退到职业骨架。
++  const spec = CHAR_SPECS[card && card.id] || {};
++  const build = BODIES[spec.base || cls.key] || BODIES.sword;
+   const el = h('span', {
+     class: `char-art${opts && opts.sil ? ' is-sil' : ''}`,
+-    html: `<svg viewBox="${viewBox}" preserveAspectRatio="${preserve}" aria-hidden="true" focusable="false">${ART[cls.key] || ART.sword}</svg>`,
++    html: `<svg viewBox="${viewBox}" preserveAspectRatio="${preserve}" aria-hidden="true" focusable="false">${build(spec)}</svg>`,
+   });
+-  // 五行代表色（可被卡牌 silhouetteColor 覆盖）落到画布自身，向下级 SVG 形状传递。
++  // 五行代表色（可被卡牌 silhouetteColor 覆盖）+ 角色发色落到画布自身，向下级 SVG 形状传递。
+   for (const [k, v] of Object.entries(charArtVars(card))) el.style.setProperty(k, v);
+   return el;
+ }
+@@ -212,5 +596,8 @@ export function charBust(card, opts = {}) {
+ // 卡面（portrait3D）与战场剪影（silhouetteRenderer）都从这里取值，保证同屏只有一档色。
+ export function charArtVars(card) {
+   const sil = silhouetteColor(card);
+-  return { '--sil': sil, '--sil-d': shade(sil, -0.35), '--sil-l': shade(sil, 0.3) };
++  const vars = { '--sil': sil, '--sil-d': shade(sil, -0.35), '--sil-l': shade(sil, 0.3) };
++  const hair = CHAR_SPECS[card && card.id] && CHAR_SPECS[card.id].hairColor;
++  if (hair) { vars['--hair'] = hair; vars['--hair-l'] = shade(hair, 0.3); }
++  return vars;
+ }
+diff --git a/apps/ling-xu-wen-jian-lu/src/ui/style.css b/apps/ling-xu-wen-jian-lu/src/ui/style.css
+index 46cce05..9e1889d 100644
+--- a/apps/ling-xu-wen-jian-lu/src/ui/style.css
++++ b/apps/ling-xu-wen-jian-lu/src/ui/style.css
+@@ -310,6 +310,14 @@
+ 
+ /* —— 绘卷（形象预设 + AI 绘图提示词）—— */
+ .art-spec { display: flex; flex-direction: column; gap: 6px; font-size: 13px; }
++/* 绘卷面板：左侧立绘预览 + 右侧设定文字 */
++.art-panel { display: flex; gap: 12px; align-items: stretch; }
++.art-figure { flex: 0 0 110px; min-height: 220px; display: flex; align-items: flex-end;
++  background: linear-gradient(180deg, rgba(60,50,40,.16), rgba(30,24,18,.28));
++  border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
++.art-figure .char-art { width: 100%; height: 100%; }
++.art-panel .art-spec { flex: 1; }
++@media (max-width: 560px) { .art-panel { flex-direction: column; } .art-figure { flex: none; height: 200px; } }
+ .art-spec__row { display: flex; gap: 10px; align-items: baseline; }
+ .art-spec__row .muted { flex: 0 0 3em; font-size: 12px; }
+ .art-prompt { white-space: pre-wrap; word-break: break-word; font-size: 11px; line-height: 1.6; background: var(--paper-2); border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; margin: 8px 0; max-height: 180px; overflow-y: auto; color: var(--ink); font-family: inherit; }
+@@ -620,8 +628,8 @@
+ .char-art .ca-skin-sh { fill: #e2c5a0; }
+ .char-art .ca-eye { fill: #2c1810; }
+ .char-art .ca-line { fill: none; stroke: #2c1810; stroke-width: 1.5; stroke-linecap: round; }
+-.char-art .ca-hair, .char-art .ca-hair-b { fill: #3a2a20; }
+-.char-art .ca-hair-l { fill: #52403a; }
++.char-art .ca-hair, .char-art .ca-hair-b { fill: var(--hair, #3a2a20); }
++.char-art .ca-hair-l { fill: var(--hair-l, #52403a); }
+ .char-art .ca-hairpin { stroke: var(--gold, #D4A04A); stroke-width: 2.4; stroke-linecap: round; }
+ .char-art .ca-shoe { fill: #2c1810; }
+ .char-art .ca-robe, .char-art .ca-sleeve-d { fill: var(--sil); }
+@@ -646,6 +654,56 @@
+ .char-art .ca-rune-d { stroke-dasharray: 3 5; opacity: .55; }
+ .char-art .ca-talisman rect { fill: #f7f0dc; stroke: #c9a24a; stroke-width: 1.2; }
+ .char-art .ca-talisman-rune { fill: none; stroke: #c23b22; stroke-width: 1.4; stroke-linecap: round; }
++
++/* —— 角色专属部件（issue #97：15 人 15 面，见 charArt.js CHAR_SPECS）—— */
++/* 赤焰灵狐：狐耳 / 狐尾（耳窝浅粉，尾尖白）*/
++.char-art .ca-ear { fill: var(--hair, #3a2a20); }
++.char-art .ca-ear-in { fill: #e8c0aa; }
++.char-art .ca-tail { fill: var(--sil); }
++.char-art .ca-tail-tip { fill: #f2e7da; }
++/* 青竹剑侍：竹节青刃 + 竹叶 */
++.char-art .ca-blade-bamboo { fill: #8fbc7a; stroke: #5f8a4e; stroke-width: 1; }
++.char-art .ca-leaf { fill: #6f9e5a; }
++/* 金戈锐士：金刃 + 兽吞肩甲 */
++.char-art .ca-blade-gold { fill: #e8c765; stroke: #b8933d; stroke-width: 1; }
++.char-art .ca-pauldron { fill: var(--sil-l); stroke: var(--sil-d); stroke-width: 1.4; }
++/* 玄龟甲士：铁锤 + 龟甲纹胸甲 */
++.char-art .ca-hammer-head { fill: #8d9299; stroke: #5c6167; stroke-width: 1; }
++.char-art .ca-shell { fill: var(--sil-d); }
++.char-art .ca-shell-line { fill: none; stroke: var(--sil-l); stroke-width: 1.4; }
++/* 厚土力士：裸臂 + 石拳套 + 皮甲斜带 */
++.char-art .ca-fore-bare { fill: none; stroke: #e2c5a0; stroke-width: 9; stroke-linecap: round; }
++.char-art .ca-gauntlet { fill: var(--sil-d); stroke: var(--sil-l); stroke-width: 2; }
++.char-art .ca-strap { fill: none; stroke: #7a4a2a; stroke-width: 7; stroke-linecap: round; }
++/* 霜月散修：冰蓝符纸 */
++.char-art .ca-talisman-ice rect { fill: #dcecf7; stroke: #9cc3e2; stroke-width: 1.2; }
++.char-art .ca-talisman-ice .ca-talisman-rune { stroke: #4a90c2; }
++/* 飞羽散修 / 白鹤仙子：羽饰 + 铜罗盘 */
++.char-art .ca-feather { fill: #d9c289; }
++.char-art .ca-compass-rim { fill: #c9a24a; }
++.char-art .ca-compass-face { fill: #f3ead2; }
++.char-art .ca-compass-needle { fill: #c23b22; }
++/* 白鹤仙子 / 瑶池圣母：玉净瓶 / 玉杯 */
++.char-art .ca-vase-neck, .char-art .ca-vase-body,
++.char-art .ca-goblet-cup, .char-art .ca-goblet-base { fill: #bfe0d4; stroke: #7fae9c; stroke-width: 1; }
++.char-art .ca-goblet-stem { fill: #7fae9c; }
++/* 玄冥蛇姬 / 青莲道尊：盘蛇法杖 / 拂尘 */
++.char-art .ca-staff { fill: #7a4a2a; }
++.char-art .ca-staff-line { fill: none; stroke: #8a5a32; stroke-width: 3.4; stroke-linecap: round; }
++.char-art .ca-snake { fill: #5c8a6a; stroke: #3d6350; stroke-width: 1; }
++.char-art .ca-whisk path { fill: #e8e2d2; }
++/* 蚩尤残魂：赤瞳 / 图腾纹 / 牛角 / 巨斧 + 赤雷 / 破碎魔甲 */
++.char-art .ca-eye-red { fill: #d43a2f; }
++.char-art .ca-totem { fill: none; stroke: #8a5a3a; stroke-width: 1.3; stroke-linecap: round; }
++.char-art .ca-horn { fill: #d8cbb2; stroke: #a3927a; stroke-width: 1; }
++.char-art .ca-axe-head { fill: #c9a24a; stroke: #8a6d2f; stroke-width: 1; }
++.char-art .ca-lightning { fill: none; stroke: #d43a2f; stroke-width: 2; stroke-linecap: round; }
++.char-art .ca-armor-broken { fill: var(--sil-d); stroke: var(--sil-l); stroke-width: 1.2; }
++/* 瑶池圣母：金凤冠 / 头光 / 金莲台 */
++.char-art .ca-crown-phoenix { fill: #e0b64f; stroke: #b8862f; stroke-width: 1; }
++.char-art .ca-halo { fill: none; stroke: rgba(224,182,79,.8); stroke-width: 2.5; }
++.char-art .ca-halo-h { fill: none; stroke: rgba(224,182,79,.4); stroke-width: 1.4; }
++.char-art .ca-lotus-p { fill: #e0b64f; opacity: .85; }
+ /* 阵法环缓转 / 符纸微悬 / 炉火摇曳（仅 SR/SSR 卡面启用，见 .dyn-1/.dyn-2）*/
+ .portrait__card.dyn-1 .ca-rune, .portrait__card.dyn-2 .ca-rune { animation: ca-rune-spin 9s linear infinite; transform-box: fill-box; transform-origin: 50% 50%; }
+ .portrait__card.dyn-1 .ca-talisman, .portrait__card.dyn-2 .ca-talisman { animation: ca-float 2.8s ease-in-out infinite; }
+@@ -797,23 +855,41 @@
+ /* 皮影化：全身像塌缩为五行代表色三阶单色剪影（人形轮廓 + 武器仍可辨识）*/
+ .char-art.is-sil .ca-skin, .char-art.is-sil .ca-skin-sh, .char-art.is-sil .ca-hand,
+ .char-art.is-sil .ca-hair, .char-art.is-sil .ca-hair-b, .char-art.is-sil .ca-hair-l,
+-.char-art.is-sil .ca-shoe, .char-art.is-sil .ca-crown { fill: var(--sil); }
++.char-art.is-sil .ca-shoe, .char-art.is-sil .ca-crown,
++.char-art.is-sil .ca-ear, .char-art.is-sil .ca-horn, .char-art.is-sil .ca-tail { fill: var(--sil); }
+ .char-art.is-sil .ca-robe, .char-art.is-sil .ca-sleeve-d, .char-art.is-sil .ca-cape,
+ .char-art.is-sil .ca-collar, .char-art.is-sil .ca-hem, .char-art.is-sil .ca-shield,
+-.char-art.is-sil .ca-tlg { fill: var(--sil-d); }
+-.char-art.is-sil .ca-sleeve { stroke: var(--sil); }
++.char-art.is-sil .ca-tlg,
++.char-art.is-sil .ca-gauntlet, .char-art.is-sil .ca-snake,
++.char-art.is-sil .ca-armor-broken, .char-art.is-sil .ca-shell { fill: var(--sil-d); }
++.char-art.is-sil .ca-sleeve, .char-art.is-sil .ca-fore-bare { stroke: var(--sil); }
+ .char-art.is-sil .ca-fore { stroke: var(--sil-d); }
+ .char-art.is-sil .ca-sash, .char-art.is-sil .ca-sash-tail, .char-art.is-sil .ca-band,
+ .char-art.is-sil .ca-ribbon, .char-art.is-sil .ca-blade, .char-art.is-sil .ca-guard,
+ .char-art.is-sil .ca-shield-boss, .char-art.is-sil .ca-mirror, .char-art.is-sil .ca-mirror-rim,
+ .char-art.is-sil .ca-tlg-l, .char-art.is-sil .ca-flame, .char-art.is-sil .ca-crown-b,
+-.char-art.is-sil .ca-hilt, .char-art.is-sil .ca-talisman rect { fill: var(--sil-l); }
++.char-art.is-sil .ca-hilt, .char-art.is-sil .ca-talisman rect,
++.char-art.is-sil .ca-ear-in, .char-art.is-sil .ca-tail-tip, .char-art.is-sil .ca-leaf,
++.char-art.is-sil .ca-blade-bamboo, .char-art.is-sil .ca-blade-gold,
++.char-art.is-sil .ca-blade-fire, .char-art.is-sil .ca-hammer-head,
++.char-art.is-sil .ca-pauldron, .char-art.is-sil .ca-feather,
++.char-art.is-sil .ca-compass-rim, .char-art.is-sil .ca-compass-face,
++.char-art.is-sil .ca-compass-needle, .char-art.is-sil .ca-vase-neck,
++.char-art.is-sil .ca-vase-body, .char-art.is-sil .ca-goblet-cup,
++.char-art.is-sil .ca-goblet-base, .char-art.is-sil .ca-goblet-stem,
++.char-art.is-sil .ca-staff, .char-art.is-sil .ca-whisk path,
++.char-art.is-sil .ca-axe-head, .char-art.is-sil .ca-crown-phoenix,
++.char-art.is-sil .ca-lotus-p, .char-art.is-sil .ca-eye-red { fill: var(--sil-l); }
+ .char-art.is-sil .ca-line, .char-art.is-sil .ca-hairpin,
+-.char-art.is-sil .ca-talisman-rune { stroke: var(--sil-l); }
++.char-art.is-sil .ca-talisman-rune, .char-art.is-sil .ca-totem,
++.char-art.is-sil .ca-lightning, .char-art.is-sil .ca-halo, .char-art.is-sil .ca-halo-h,
++.char-art.is-sil .ca-staff-line, .char-art.is-sil .ca-shell-line,
++.char-art.is-sil .ca-strap { stroke: var(--sil-l); }
+ .char-art.is-sil .ca-eye { fill: var(--sil-l); }
+ .char-art.is-sil .ca-rune { stroke: var(--sil-l); }
+ .char-art.is-sil .ca-blade, .char-art.is-sil .ca-shield, .char-art.is-sil .ca-mirror,
+-.char-art.is-sil .ca-hand, .char-art.is-sil .ca-talisman rect { stroke: none; }
++.char-art.is-sil .ca-hand, .char-art.is-sil .ca-talisman rect,
++.char-art.is-sil .ca-gauntlet, .char-art.is-sil .ca-armor-broken { stroke: none; }
+ /* 稀有度光环：青玉 / 紫金 / 彩凰 */
+ .silu .aura-R   { border-color: var(--sil, #9a8a72); }
+ .silu .aura-SR  { border-color: var(--r-SR); box-shadow: 0 0 6px var(--r-SR); }
diff --git a/.ai-tasks/issue-97/review_error_r1.log b/.ai-tasks/issue-97/review_error_r1.log
new file mode 100644
index 0000000..e69de29
diff --git a/.ai-tasks/issue-97/review_result_r1.md b/.ai-tasks/issue-97/review_result_r1.md
new file mode 100644
index 0000000..aaebcaf
--- /dev/null
+++ b/.ai-tasks/issue-97/review_result_r1.md
@@ -0,0 +1,14 @@
+DECISION: REQUEST_CHANGES
+COMMENT: 逐行核对了 charArt.js 的 BODIES/CHAR_SPECS 组装逻辑、style.css 的着色与 is-sil 塌缩规则、app.js 的接入点，发现以下问题：
+
+1.【逻辑缺陷·必改】BODIES.array 的躯体开头硬编码了两条侧长发 ca-hair-b（charArt.js 中 `array: (s) => ...` 的前两行 path），没有走 slot() 覆写机制。后果：R009 飞羽散修的设定是「短黑发 + 羽簪」，其 hair 槽覆写只替换了头顶层，但这两条垂至 y=110 的长发仍然渲染在背后，与设计稿「短黑发」直接矛盾，也破坏了注释宣称的「角色设定可逐槽覆写」契约。这两条 path 应当挪入 array 的默认 hair 槽（或包一层 slot(s,'hairBack',...)），使 R009/SR004 能显式控制。请修复。
+
+2.【层级隐患·建议修复】BODIES.body 把 weapon 槽放在袍服（ca-robe）之前绘制（沿袭原盾牌负于身后的画法）。这对默认盾没问题，但 R003 的铁锤、SSR001 的巨斧也走该槽：SSR001 左侧斧刃（x≈88-111，y≈58-80）与 R003 锤头左缘会被躯干/右臂遮挡一部分，SSR「持巨斧」的画面表现打折。建议 body 躯体将 weapon 拆为 back-weapon / front-weapon 两个槽，或把斧/锤类武器移到袍服之后绘制。
+
+3.【小问题】BODIES.sword 无条件绘制右手握剑位的手（cx=105.5 cy=100），R007 流火散修 weapon 覆写为空串（剑扛肩）后，这只手悬空握在原剑柄位置，仅恰好贴近背上的剑尾，属于侥幸对位。建议该手也纳入 weapon 槽或单独成槽。
+
+4.【核对通过的点】slot('') 显式去层的语义一致；CHAR_SPECS 15 个 id（R001-R009/SR001-SR004/SSR001-002）与 issue 设定一一对应无遗漏；charArtVars 对 card 为空的防御（`card && card.id`）正确；is-sil 剪影模式对新部件（ca-ear/ca-horn/ca-tail/ca-eye-red/ca-halo 等）的 fill/stroke 塌缩覆盖完整，未发现漏网部件；ca-fore-bare 的 stroke-width 9 裸臂在 is-sil 下正确转为 stroke 着色；CSS 变量 --hair/--hair-l 缺省回退墨黑，不影响无设定卡。
+
+5. context.md 的改动仅是删减 AI 提示词正文，无代码影响；style.css 的 .art-panel 布局含 560px 移动端断点，无问题。不涉及 CI/CD 或 workflows。
+
+综上：第 1 点是与本次 issue 目标（15 人 15 面、按设定逐人预置）直接冲突的功能性缺陷，必须修复后再合入；第 2、3 点建议一并处理。
diff --git a/apps/ling-xu-wen-jian-lu/src/ui/app.js b/apps/ling-xu-wen-jian-lu/src/ui/app.js
index 10a488f..94b2b4c 100644
--- a/apps/ling-xu-wen-jian-lu/src/ui/app.js
+++ b/apps/ling-xu-wen-jian-lu/src/ui/app.js
@@ -46,7 +46,7 @@ import {
 import { makeRng } from '../core/rng.js';
 import { BattleScene } from './battle-scene.js';
 import { Portrait3D } from './portrait3D.js';
-import { charBust } from './charArt.js';
+import { charBust, charFigure } from './charArt.js';
 
 const TABS = [
   { key: 'lineup', icon: '⚔️', label: '阵容' },
@@ -650,7 +650,9 @@ export class GameUI {
     return h('div', { class: 'cult-detail' },
       h('div', { class: 'panel' },
         h('div', { class: 'panel__head' }, `绘卷 · ${style.name}`),
-        h('div', { class: 'panel__body' },
+        h('div', { class: 'panel__body art-panel' },
+          // 角色专属立绘预览（charArt.js 的 15 人 15 面预制素材，与提示词设定一一对应）
+          h('div', { class: 'art-figure' }, charFigure(def)),
           h('div', { class: 'art-spec' },
             h('div', { class: 'art-spec__row' }, h('span', { class: 'muted' }, '形象'), h('span', null, preset.appearance)),
             h('div', { class: 'art-spec__row' }, h('span', { class: 'muted' }, '色调'), h('span', null, preset.palette)),
diff --git a/apps/ling-xu-wen-jian-lu/src/ui/charArt.js b/apps/ling-xu-wen-jian-lu/src/ui/charArt.js
index 4da9cab..e2dbb68 100644
--- a/apps/ling-xu-wen-jian-lu/src/ui/charArt.js
+++ b/apps/ling-xu-wen-jian-lu/src/ui/charArt.js
@@ -1,13 +1,16 @@
 // ============================================================================
-// 灵墟·问剑录 · 预制矢量人物素材库（issue #95）
+// 灵墟·问剑录 · 预制矢量人物素材库（issue #95 / issue #97）
 //
-// 早先的立绘 / 战场剪影由 CSS clip-path 程序化拼接，观感「连轮廓都不算人」。
-// 此处改为一次性预绘制好的矢量人物（内联 SVG），五大职业各一副全身像：
-//   剑修·执剑 / 体修·抱元持盾 / 丹修·托炉 / 阵修·结印 / 符修·持符点指
-// 头身比例按真实人形（约 1:7.5）绘制：头颅 / 颈 / 交领袍服 / 双臂 / 足履俱全。
+// 早先立绘 / 战场剪影按五大职业共用 5 副躯体，同职业角色（如三张剑修 R 卡）
+// 画面完全一致。issue #97 要求按设计稿为 15 位角色逐一预设形象素材：
+//   - 职业躯体（BODIES）提供头身骨架：头 / 颈 / 交领袍服 / 双臂 / 足履；
+//   - 角色设定（CHAR_SPECS，对齐 data/artPresets.js 的形象释义）按卡 id 覆写
+//     发式 / 发色 / 脸型（男女 / 竖瞳 / 红瞳）/ 武器 / 配饰（狐耳狐尾、牛角、
+//     光环、凤冠、莲台、龟甲纹、石拳套……），15 人 15 面，互不撞形。
 //
-// 着色契约：素材本身不定死颜色，服装取容器上的 CSS 变量
-//   --sil（正色）/ --sil-d（深）/ --sil-l（亮），即五行代表色（可被卡牌自定义色覆盖）。
+// 着色契约：素材不定死衣色，服装取容器 CSS 变量
+//   --sil（正色）/ --sil-d（深）/ --sil-l（亮），即五行代表色（可被卡牌自定义色覆盖）；
+//   发色取 --hair / --hair-l（由角色设定的 hairColor 落到画布，缺省墨黑）。
 // is-sil 模式整体塌缩为单色多层皮影剪影，供战场微缩表现使用。
 //
 // 导出：
@@ -17,18 +20,53 @@
 import { h } from './dom.js';
 import { classDef, silhouetteColor, shade } from '../config.js';
 
-// —— 共用部件（五官 / 颈 / 足），坐标基于 viewBox 0 0 160 320 ——
+// —— 共用部件，坐标基于 viewBox 0 0 160 320 ——
 // 眼睛组沿用 .portrait__eyes 类名：动画系统在其上打 .blink（合眼）/ .smile（满好感微笑）。
+const eyes = (cls) => `
+  <g class="portrait__eyes">
+    <ellipse class="${cls}" cx="74.2" cy="41.5" rx="1.7" ry="2.7"/>
+    <ellipse class="${cls}" cx="85.8" cy="41.5" rx="1.7" ry="2.7"/>
+  </g>`;
+
+// 男相（默认）：剑眉朗目。
 const FACE = `
   <ellipse class="ca-skin" cx="80" cy="41" rx="14.5" ry="16.5"/>
-  <g class="portrait__eyes">
-    <ellipse class="ca-eye" cx="74.2" cy="41.5" rx="1.7" ry="2.7"/>
-    <ellipse class="ca-eye" cx="85.8" cy="41.5" rx="1.7" ry="2.7"/>
-  </g>
+  ${eyes('ca-eye')}
   <path class="ca-line" d="M70.4 35.2q3.4-2.4 6.6-.6"/>
   <path class="ca-line" d="M89.6 35.2q-3.4-2.4-6.6-.6"/>
   <path class="ca-line" d="M77.2 49.6q2.8 1.9 5.6 0"/>`;
 
+// 女相：脸庞稍窄、眉目柔和。
+const FACE_F = `
+  <ellipse class="ca-skin" cx="80" cy="41" rx="13.6" ry="16"/>
+  ${eyes('ca-eye')}
+  <path class="ca-line" d="M70.8 35.6q3.1-2.1 6.1-.5"/>
+  <path class="ca-line" d="M89.2 35.6q-3.1-2.1-6.1-.5"/>
+  <path class="ca-line" d="M77.5 49.8q2.5 1.6 5 0"/>`;
+
+// 竖瞳（玄冥蛇姬）：窄长竖目。
+const FACE_SLIT = `
+  <ellipse class="ca-skin" cx="80" cy="41" rx="13.6" ry="16"/>
+  <g class="portrait__eyes">
+    <ellipse class="ca-eye" cx="74.4" cy="41.5" rx="1.1" ry="3"/>
+    <ellipse class="ca-eye" cx="85.6" cy="41.5" rx="1.1" ry="3"/>
+  </g>
+  <path class="ca-line" d="M70.6 34.8q3.4-1.8 6.4-.2"/>
+  <path class="ca-line" d="M89.4 34.8q-3.4-1.8-6.4-.2"/>
+  <path class="ca-line" d="M77.6 49.9q2.4-1.2 4.8 0"/>`;
+
+// 战神相（蚩尤残魂）：赤瞳怒目 + 面部图腾纹。
+const FACE_FIERCE = `
+  <ellipse class="ca-skin" cx="80" cy="41" rx="14.5" ry="16.5"/>
+  <g class="portrait__eyes">
+    <ellipse class="ca-eye-red" cx="74.2" cy="41.5" rx="1.9" ry="2.9"/>
+    <ellipse class="ca-eye-red" cx="85.8" cy="41.5" rx="1.9" ry="2.9"/>
+  </g>
+  <path class="ca-line" d="M70 33.6l8 3.2"/>
+  <path class="ca-line" d="M90 33.6l-8 3.2"/>
+  <path class="ca-line" d="M77 50.4q3-2.2 6 0"/>
+  <path class="ca-totem" d="M67.4 41q2 4 .4 7M92.6 41q-2 4-.4 7M80 54v3.5"/>`;
+
 const NECK = `<path class="ca-skin-sh" d="M75.5 52.5h9V62q-4.5 2.6-9 0z"/>`;
 
 // 足履画在袍摆之前，从下摆探出。
@@ -36,150 +74,507 @@ const FEET = `
   <path class="ca-shoe" d="M63 296h16v8q-8 3-16 0z"/>
   <path class="ca-shoe" d="M81 296h16v8q8 3-16 0z"/>`;
 
-// —— 五大职业全身像 ——
+// ── 职业躯体（骨架 + 默认部件；角色设定可逐槽覆写）──────────────────────────────
 // 分层顺序：背发 / 披风 / 飘带（后） → 颈 / 足 → 袍服 / 交领 / 腰带 → 武器 → 双臂 → 头 / 前发。
 // pc__hair / part-ribbon / part-arm_L / part-arm_R 挂在对应飘动部件上，沿用既有 CSS 关键帧。
-const ART = {
-  // 剑修：窄袖劲装 + 披风，右手执长剑，束发高马尾。
-  sword: `
-  <g class="pc__part part-ribbon"><path class="ca-cape" d="M95 66C111 92 115 150 109 208C103 158 97 116 87 84Z"/></g>
-  ${NECK}
-  ${FEET}
+// slot(spec, key, 默认)：传入 ''（空串）可显式去掉该层（如换武器、去披风）。
+const slot = (s, k, d) => (s && s[k] !== undefined ? s[k] : d);
+
+const CAPE_SWORD = `<g class="pc__part part-ribbon"><path class="ca-cape" d="M95 66C111 92 115 150 109 208C103 158 97 116 87 84Z"/></g>`;
+const ROBE_SWORD = `
   <path class="ca-robe" d="M63 62C61 88 67 110 68 132C60 174 54 234 52 292Q80 302 108 292C106 234 100 174 92 132C93 110 99 88 97 62Q80 55 63 62Z"/>
   <path class="ca-collar" d="M73 57L80 72L87 57L92 60L80 84L68 60Z"/>
   <path class="ca-sash" d="M67.5 128Q80 135 92.5 128L93.5 139Q80 146 66.5 139Z"/>
   <path class="ca-sash-tail" d="M77 139L73 172L79.5 174L83 139Z"/>
-  <path class="ca-sleeve" d="M95.5 70C103 76 106.5 86 105.5 95"/>
+  <path class="ca-sleeve" d="M95.5 70C103 76 106.5 86 105.5 95"/>`;
+const WEAPON_SWORD = `
   <g class="ca-weapon">
     <path class="ca-blade" d="M102.6 94L100.6 34L103.6 25L106.6 34L104.6 94Z"/>
     <path class="ca-guard" d="M97 93.5h13v4h-13z"/>
     <rect class="ca-hilt" x="102" y="97.5" width="3.4" height="9" rx="1.5"/>
-  </g>
-  <circle class="ca-hand" cx="105.5" cy="100" r="4.4"/>
+  </g>`;
+const ARM_SWORD_L = `
   <g class="pc__part part-arm_L">
     <path class="ca-sleeve" d="M65 70C58 84 55 98 56.5 112"/>
     <path class="ca-fore" d="M56.5 106C57 110 57.4 114 58 118"/>
     <circle class="ca-hand" cx="58.6" cy="121.5" r="4.2"/>
-  </g>
-  <g class="ca-head">${FACE}</g>
+  </g>`;
+const HAIR_PONY = `
   <g class="pc__hair">
     <path class="ca-hair" d="M63.5 41C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 41C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 41Z"/>
     <circle class="ca-hair" cx="80" cy="13.5" r="5"/>
     <path class="ca-hair-l" d="M84.5 15C98 20 103.5 37 101 53C106 36 99.5 17.5 85 12.5Z"/>
-  </g>`,
+  </g>`;
 
-  // 体修：短打 + 护心镜，双臂外张抱元，左臂负盾，束发系额带。
-  body: `
-  ${NECK}
-  ${FEET}
+const WEAPON_SHIELD = `
   <g class="ca-weapon">
     <path class="ca-shield" d="M40 90Q29 95 30.5 108Q32 123 40 129Q48 123 49.5 108Q51 95 40 90Z"/>
     <circle class="ca-shield-boss" cx="40" cy="109" r="4.4"/>
-  </g>
-  <path class="ca-robe" d="M58 64C56 92 64 112 66 130C58 168 52 228 50 292Q80 304 110 292C108 228 102 168 94 130C96 112 104 92 102 64Q80 55 58 64Z"/>
-  <path class="ca-collar" d="M72 58L80 73L88 58L94 61L80 86L66 61Z"/>
-  <path class="ca-sash" d="M66 126Q80 133 94 126L95 137Q80 144 65 137Z"/>
+  </g>`;
+const CHEST_MIRROR = `
   <circle class="ca-mirror-rim" cx="80" cy="100" r="11"/>
-  <circle class="ca-mirror" cx="80" cy="100" r="8"/>
+  <circle class="ca-mirror" cx="80" cy="100" r="8"/>`;
+const ARM_BODY_L = `
   <g class="pc__part part-arm_L">
     <path class="ca-sleeve" d="M61 70C51 79 46 91 46.5 101"/>
     <path class="ca-fore" d="M46.5 98C46 102 46 106 46.5 109"/>
     <circle class="ca-hand" cx="47" cy="113" r="5.2"/>
-  </g>
+  </g>`;
+const ARM_BODY_R = `
   <g class="pc__part part-arm_R">
     <path class="ca-sleeve" d="M99 70C109 79 114 91 113.5 101"/>
     <path class="ca-fore" d="M113.5 98C114 102 114 106 113.5 109"/>
     <circle class="ca-hand" cx="113" cy="113" r="5.2"/>
-  </g>
-  <g class="ca-head">${FACE}</g>
+  </g>`;
+const HAIR_BAND = `
   <g class="pc__hair">
     <path class="ca-hair" d="M64 39C63 24 70 18 80 18C90 18 97 24 96 39C94 30.5 90 26.5 80 26.5C70 26.5 66 30.5 64 39Z"/>
     <path class="ca-band" d="M64.6 32.5C68 29.6 74 28.2 80 28.2C86 28.2 92 29.6 95.4 32.5L96 36.8C91 34 86 32.8 80 32.8C74 32.8 69 34 64 36.8Z"/>
-  </g>`,
+  </g>`;
 
-  // 丹修：宽袍大袖 + 双飘带，发髻玉簪，右手托丹炉，炉下灵火摇曳。
-  alchemy: `
-  <g class="pc__part part-ribbon"><path class="ca-ribbon" d="M93 72C112 82 122 106 117 132C124 105 113 76 94 66Z"/></g>
-  ${NECK}
-  ${FEET}
-  <path class="ca-robe" d="M60 64C57 92 66 112 67 132C55 176 46 236 44 294Q80 306 116 294C114 236 105 176 93 132C94 112 103 92 100 64Q80 55 60 64Z"/>
-  <path class="ca-collar" d="M72 58L80 73L88 58L95 61L80 86L65 61Z"/>
-  <path class="ca-sash" d="M66.5 128Q80 135 93.5 128L94.5 139Q80 146 65.5 139Z"/>
-  <path class="ca-sleeve" d="M97 70C106 78 108.5 90 104 101"/>
+const RIBBON_ALCH = `<g class="pc__part part-ribbon"><path class="ca-ribbon" d="M93 72C112 82 122 106 117 132C124 105 113 76 94 66Z"/></g>`;
+const WEAPON_FURNACE = `
   <g class="ca-weapon">
     <path class="ca-tlg" d="M91 114Q103 109.5 115 114Q113 126.5 103 128.5Q93 126.5 91 114Z"/>
     <path class="ca-tlg-l" d="M91 114Q103 118.5 115 114L114.2 117.8Q103 122 91.8 117.8Z"/>
     <path class="ca-flame" d="M96 130Q103 125 110 130Q106.5 137 103 136Q99.5 137 96 130Z"/>
-  </g>
-  <circle class="ca-hand" cx="103" cy="105.5" r="4.2"/>
+  </g>`;
+const ARM_ALCH_L = `
   <g class="pc__part part-arm_L">
     <path class="ca-sleeve-d" d="M62 66C50 78 44 96 50 112C56 114 61 111 63 107C57 97 58 80 64 72Z"/>
     <path class="ca-sleeve" d="M63 70C53 80 47.5 94 51 107"/>
     <circle class="ca-hand" cx="51" cy="111" r="4.2"/>
-  </g>
-  <g class="ca-head">${FACE}</g>
+  </g>`;
+
+const WEAPON_RUNE = `
+  <g class="ca-weapon">
+    <circle class="ca-rune" cx="80" cy="112" r="22"/>
+    <circle class="ca-rune ca-rune-d" cx="80" cy="112" r="14"/>
+  </g>`;
+const HAIR_CROWN = `
   <g class="pc__hair">
-    <path class="ca-hair" d="M63.5 42C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 42C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 42Z"/>
-    <circle class="ca-hair" cx="80" cy="12.5" r="5.5"/>
-    <path class="ca-hairpin" d="M71.5 10.5L89 15.5"/>
-    <path class="ca-hair-b" d="M64.5 40C59.5 62 61 88 67 104L73.5 104C68.5 84 67.5 58 67.5 44Z"/>
-    <path class="ca-hair-b" d="M95.5 40C100.5 62 99 88 93 104L86.5 104C91.5 84 92.5 58 92.5 44Z"/>
-  </g>`,
+    <path class="ca-hair" d="M64.5 38C63.5 25 70.5 19.5 80 19.5C89.5 19.5 96.5 25 95.5 38C94 30.5 90 27.5 80 27.5C70 27.5 66 30.5 64.5 38Z"/>
+    <path class="ca-crown" d="M67.5 27.5L80 15.5L92.5 27.5L92.5 32L67.5 32Z"/>
+    <rect class="ca-crown-b" x="65.5" y="31.5" width="29" height="3.4" rx="1.7"/>
+  </g>`;
+
+const WEAPON_TALISMAN = `
+  <g class="ca-weapon">
+    <g class="ca-talisman">
+      <rect x="106.5" y="70" width="10.5" height="21" rx="1.6"/>
+      <path class="ca-talisman-rune" d="M109 75h5.5M111.7 73.2v8.6M109 80.5q2.7 2.4 5.4 0"/>
+    </g>
+  </g>`;
+const ARM_TAL_L = `
+  <g class="pc__part part-arm_L">
+    <path class="ca-sleeve" d="M64 70C56 82 53 96 55 108"/>
+    <circle class="ca-hand" cx="55.5" cy="112" r="4.2"/>
+  </g>`;
+const ARM_TAL_R = `
+  <g class="pc__part part-arm_R">
+    <path class="ca-sleeve" d="M96 68C106 73 111 83 111 93"/>
+    <circle class="ca-hand" cx="111" cy="97.5" r="4.2"/>
+  </g>`;
+
+const BODIES = {
+  // 剑修：窄袖劲装 + 披风，右手执剑。
+  sword: (s) => `
+  ${slot(s, 'back', CAPE_SWORD)}
+  ${NECK}
+  ${FEET}
+  ${slot(s, 'robe', ROBE_SWORD)}
+  ${slot(s, 'weapon', WEAPON_SWORD)}
+  ${slot(s, 'handR', `<circle class="ca-hand" cx="105.5" cy="100" r="4.4"/>`)}
+  ${slot(s, 'armL', ARM_SWORD_L)}
+  ${slot(s, 'front', '')}
+  <g class="ca-head">${slot(s, 'face', FACE)}</g>
+  ${slot(s, 'hair', HAIR_PONY)}`,
+
+  // 体修：短打 + 护心镜（可换龟甲纹 / 破碎魔甲 / 皮甲），双臂外张抱元。
+  // 武器分两层：盾等负于身后的走 weaponBack（袍服之前），斧 / 锤等大型武器走
+  // weapon（袍服之后、双臂之前绘制），刃部不被躯干遮挡，掌心覆于柄上呈握持状。
+  body: (s) => `
+  ${slot(s, 'back', '')}
+  ${slot(s, 'weaponBack', WEAPON_SHIELD)}
+  ${NECK}
+  ${FEET}
+  <path class="ca-robe" d="M58 64C56 92 64 112 66 130C58 168 52 228 50 292Q80 304 110 292C108 228 102 168 94 130C96 112 104 92 102 64Q80 55 58 64Z"/>
+  <path class="ca-collar" d="M72 58L80 73L88 58L94 61L80 86L66 61Z"/>
+  <path class="ca-sash" d="M66 126Q80 133 94 126L95 137Q80 144 65 137Z"/>
+  ${slot(s, 'chest', CHEST_MIRROR)}
+  ${slot(s, 'weapon', '')}
+  ${slot(s, 'armL', ARM_BODY_L)}
+  ${slot(s, 'armR', ARM_BODY_R)}
+  ${slot(s, 'front', '')}
+  <g class="ca-head">${slot(s, 'face', FACE)}</g>
+  ${slot(s, 'hair', HAIR_BAND)}`,
+
+  // 丹修：宽袍大袖 + 双飘带，右手托炉 / 瓶 / 杯。
+  alchemy: (s) => `
+  ${slot(s, 'back', RIBBON_ALCH)}
+  ${NECK}
+  ${FEET}
+  <path class="ca-robe" d="M60 64C57 92 66 112 67 132C55 176 46 236 44 294Q80 306 116 294C114 236 105 176 93 132C94 112 103 92 100 64Q80 55 60 64Z"/>
+  <path class="ca-collar" d="M72 58L80 73L88 58L95 61L80 86L65 61Z"/>
+  <path class="ca-sash" d="M66.5 128Q80 135 93.5 128L94.5 139Q80 146 65.5 139Z"/>
+  <path class="ca-sleeve" d="M97 70C106 78 108.5 90 104 101"/>
+  ${slot(s, 'weapon', WEAPON_FURNACE)}
+  <circle class="ca-hand" cx="103" cy="105.5" r="4.2"/>
+  ${slot(s, 'armL', ARM_ALCH_L)}
+  ${slot(s, 'front', '')}
+  <g class="ca-head">${slot(s, 'face', FACE)}</g>
+  ${slot(s, 'hair', HAIR_CROWN)}`,
 
   // 阵修：道冠 + 法衣（下摆卦纹带），双手于胸前结印，身后阵法环旋转。
-  array: `
+  array: (s) => `
+  ${slot(s, 'hairBack', `
   <path class="ca-hair-b" d="M65 34C58 62 60 92 67 110L75 110C69 88 68 58 69 40Z"/>
-  <path class="ca-hair-b" d="M95 34C102 62 100 92 93 110L85 110C91 88 92 58 91 40Z"/>
-  <g class="pc__part part-ribbon"><path class="ca-ribbon" d="M92 70C110 76 122 96 120 120C126 94 113 70 93 64Z"/></g>
+  <path class="ca-hair-b" d="M95 34C102 62 100 92 93 110L85 110C91 88 92 58 91 40Z"/>`)}
+  ${slot(s, 'back', `<g class="pc__part part-ribbon"><path class="ca-ribbon" d="M92 70C110 76 122 96 120 120C126 94 113 70 93 64Z"/></g>`)}
   ${NECK}
   ${FEET}
   <path class="ca-robe" d="M61 64C58 92 66 112 67 134C53 180 45 238 43 294Q80 306 117 294C115 238 107 180 93 134C94 112 102 92 99 64Q80 55 61 64Z"/>
   <path class="ca-collar" d="M72 58L80 73L88 58L94 61L80 86L66 61Z"/>
   <path class="ca-sash" d="M66.5 128Q80 135 93.5 128L94.5 139Q80 146 65.5 139Z"/>
   <path class="ca-hem" d="M45 272Q80 284 115 272L116.5 284Q80 296 43.5 284Z"/>
-  <g class="ca-weapon">
-    <circle class="ca-rune" cx="80" cy="112" r="22"/>
-    <circle class="ca-rune ca-rune-d" cx="80" cy="112" r="14"/>
-  </g>
+  ${slot(s, 'weapon', WEAPON_RUNE)}
   <path class="ca-sleeve" d="M64 70C58.5 84 64.5 98 73 105"/>
   <path class="ca-sleeve" d="M96 70C101.5 84 95.5 98 87 105"/>
   <circle class="ca-hand" cx="75.5" cy="108" r="4.2"/>
   <circle class="ca-hand" cx="84.5" cy="108" r="4.2"/>
-  <g class="ca-head">${FACE}</g>
-  <g class="pc__hair">
-    <path class="ca-hair" d="M64.5 38C63.5 25 70.5 19.5 80 19.5C89.5 19.5 96.5 25 95.5 38C94 30.5 90 27.5 80 27.5C70 27.5 66 30.5 64.5 38Z"/>
-    <path class="ca-crown" d="M67.5 27.5L80 15.5L92.5 27.5L92.5 32L67.5 32Z"/>
-    <rect class="ca-crown-b" x="65.5" y="31.5" width="29" height="3.4" rx="1.7"/>
-  </g>`,
+  ${slot(s, 'front', '')}
+  <g class="ca-head">${slot(s, 'face', FACE)}</g>
+  ${slot(s, 'hair', HAIR_CROWN)}`,
 
-  // 符修：鹤氅宽摆 + 长发垂绦，右手掐诀举符，符纸微悬。
-  talisman: `
-  <g class="pc__part part-ribbon"><path class="ca-ribbon" d="M92 68C112 74 124 94 122 118C128 92 114 66 93 62Z"/></g>
+  // 符修：鹤氅宽摆 + 长发垂绦，右手掐诀举符。
+  talisman: (s) => `
+  ${slot(s, 'back', `<g class="pc__part part-ribbon"><path class="ca-ribbon" d="M92 68C112 74 124 94 122 118C128 92 114 66 93 62Z"/></g>`)}
   ${NECK}
   ${FEET}
   <path class="ca-robe" d="M56 64C50 96 58 120 60 134C48 178 40 236 38 292Q80 304 122 292C120 236 112 178 100 134C102 120 110 96 104 64Q80 54 56 64Z"/>
   <path class="ca-collar" d="M71 57L80 74L89 57L97 61L80 88L63 61Z"/>
   <path class="ca-sash" d="M65 128Q80 136 95 128L96 139Q80 147 64 139Z"/>
-  <g class="pc__part part-arm_L">
-    <path class="ca-sleeve" d="M64 70C56 82 53 96 55 108"/>
-    <circle class="ca-hand" cx="55.5" cy="112" r="4.2"/>
-  </g>
-  <g class="ca-weapon">
-    <g class="ca-talisman">
-      <rect x="106.5" y="70" width="10.5" height="21" rx="1.6"/>
-      <path class="ca-talisman-rune" d="M109 75h5.5M111.7 73.2v8.6M109 80.5q2.7 2.4 5.4 0"/>
-    </g>
-  </g>
-  <g class="pc__part part-arm_R">
-    <path class="ca-sleeve" d="M96 68C106 73 111 83 111 93"/>
-    <circle class="ca-hand" cx="111" cy="97.5" r="4.2"/>
-  </g>
-  <g class="ca-head">${FACE}</g>
+  ${slot(s, 'armL', ARM_TAL_L)}
+  ${slot(s, 'weapon', WEAPON_TALISMAN)}
+  ${slot(s, 'armR', ARM_TAL_R)}
+  ${slot(s, 'front', '')}
+  <g class="ca-head">${slot(s, 'face', FACE)}</g>
+  ${slot(s, 'hair', `
   <g class="pc__hair">
     <path class="ca-hair" d="M63 43C61 24 69 17.5 80 17.5C91 17.5 99 24 97 43C95.5 31.5 90.5 26.5 80 26.5C69.5 26.5 64.5 31.5 63 43Z"/>
     <path class="ca-hair-b" d="M63.5 42C58.5 68 59.5 94 63.5 110L70 110C66.5 88 66 62 67 45Z"/>
     <path class="ca-hair-b" d="M96.5 42C101.5 68 100.5 94 96.5 110L90 110C93.5 88 94 62 93 45Z"/>
-  </g>`,
+  </g>`)}`,
+};
+
+// ── 15 位角色形象设定（对齐 data/artPresets.js 的中文形象释义）──────────────────
+// base 沿用职业骨架；hair / face / weapon / chest / arm / back / front 逐槽覆写。
+const CHAR_SPECS = {
+  // —— R 卡 · 逸品青玉 ——
+  // 青竹剑侍：绿白汉服竹叶刺绣，马尾高束，执青竹剑（竹节青刃 + 竹叶）。
+  R001: {
+    base: 'sword',
+    weapon: `
+    <g class="ca-weapon">
+      <path class="ca-blade-bamboo" d="M102.6 94L100.6 34L103.6 25L106.6 34L104.6 94Z"/>
+      <path class="ca-guard" d="M97 93.5h13v4h-13z"/>
+      <rect class="ca-hilt" x="102" y="97.5" width="3.4" height="9" rx="1.5"/>
+      <path class="ca-leaf" d="M106.5 62q7-4.5 11.5.5q-7.5 3.5-11.5-.5z"/>
+    </g>`,
+  },
+  // 赤焰灵狐：狐耳狐尾狐女，指夹燃烧黄符，狡黠笑容。
+  R002: {
+    base: 'talisman', face: FACE_F,
+    back: `
+    <g class="pc__part part-ribbon">
+      <path class="ca-tail" d="M100 118C134 126 150 164 140 202C141 170 126 142 98 134Z"/>
+      <path class="ca-tail-tip" d="M136 178C146 190 147 202 139 212C146 197 142 187 132 178Z"/>
+    </g>`,
+    weapon: `
+    <g class="ca-weapon">
+      <g class="ca-talisman">
+        <rect x="106.5" y="70" width="10.5" height="21" rx="1.6"/>
+        <path class="ca-talisman-rune" d="M109 75h5.5M111.7 73.2v8.6M109 80.5q2.7 2.4 5.4 0"/>
+      </g>
+      <path class="ca-flame" d="M111.8 69q3.8-4 .8-8.6q-.9 3.6-3.2 5.5q-1.3 2 2.4 3.1z"/>
+    </g>`,
+    hair: `
+    <g class="pc__hair">
+      <path class="ca-hair" d="M64 41C62 24 69 16.5 80 16.5C91 16.5 98 24 96 41C95 30.5 90 25.5 80 25.5C70 25.5 65 30.5 64 41Z"/>
+      <path class="ca-hair-b" d="M64 40C58 60 58 78 63 92L70 92C66 74 66.5 56 67.5 44Z"/>
+      <path class="ca-hair-b" d="M96 40C102 60 102 78 97 92L90 92C94 74 93.5 56 92.5 44Z"/>
+      <path class="ca-ear" d="M66.5 21L64 4L77 15.5Z"/>
+      <path class="ca-ear" d="M93.5 21L96 4L83 15.5Z"/>
+      <path class="ca-ear-in" d="M67.8 18L66.9 8.8L73.6 14.6Z"/>
+      <path class="ca-ear-in" d="M92.2 18L93.1 8.8L86.4 14.6Z"/>
+    </g>`,
+    hairColor: '#4a2620',
+  },
+  // 玄龟甲士：龟甲纹重铠，持圆盾 + 铁锤，灰短发。
+  R003: {
+    base: 'body', hairColor: '#93938c',
+    weaponBack: `
+    <g class="ca-weapon">
+      <path class="ca-shield" d="M40 90Q29 95 30.5 108Q32 123 40 129Q48 123 49.5 108Q51 95 40 90Z"/>
+      <circle class="ca-shield-boss" cx="40" cy="109" r="4.4"/>
+    </g>`,
+    weapon: `
+    <g class="ca-weapon">
+      <g class="ca-hammer">
+        <rect class="ca-hilt" x="111" y="76" width="4" height="40" rx="2"/>
+        <rect class="ca-hammer-head" x="101.5" y="66" width="23" height="13" rx="2.5"/>
+      </g>
+    </g>`,
+    chest: `
+    <g class="ca-shell">
+      <path d="M80 86l11 6.5v13L80 112l-11-6.5v-13z"/>
+      <path class="ca-shell-line" d="M69 92.5h22M80 86v26"/>
+    </g>`,
+  },
+  // 金戈锐士：银白镶金轻甲，执金剑斜指，眼神锐利，短黑发。
+  R004: {
+    base: 'sword',
+    weapon: `
+    <g class="ca-weapon">
+      <path class="ca-blade-gold" d="M102.6 94L100.6 34L103.6 25L106.6 34L104.6 94Z"/>
+      <path class="ca-guard" d="M97 93.5h13v4h-13z"/>
+      <rect class="ca-hilt" x="102" y="97.5" width="3.4" height="9" rx="1.5"/>
+    </g>`,
+    front: `
+    <path class="ca-pauldron" d="M93 61q11 2 13.5 14q-9.5-1-15-7.5z"/>
+    <path class="ca-pauldron" d="M67 61q-11 2-13.5 14q9.5-1 15-7.5z"/>`,
+    hair: `
+    <g class="pc__hair">
+      <path class="ca-hair" d="M64.5 39C63.5 24 70.5 18 80 18C89.5 18 96.5 24 95.5 39C94 30.5 90 26.5 80 26.5C70 26.5 66 30.5 64.5 39Z"/>
+    </g>`,
+  },
+  // 厚土力士：裸臂黄袍，石拳套，褐皮护胸，棕短发。
+  R005: {
+    base: 'body', hairColor: '#6b4a2c',
+    chest: `
+    <path class="ca-strap" d="M62 64l35 45"/>
+    <circle class="ca-shield-boss" cx="87" cy="99" r="3"/>`,
+    armL: `
+    <g class="pc__part part-arm_L">
+      <path class="ca-fore-bare" d="M61 70C51 79 46 91 46.5 101"/>
+      <circle class="ca-gauntlet" cx="47" cy="110" r="7.2"/>
+    </g>`,
+    armR: `
+    <g class="pc__part part-arm_R">
+      <path class="ca-fore-bare" d="M99 70C109 79 114 91 113.5 101"/>
+      <circle class="ca-gauntlet" cx="113" cy="110" r="7.2"/>
+    </g>`,
+    weapon: '',
+    // 石拳套力士不佩盾：显式去掉躯体默认的负后圆盾。
+    weaponBack: '',
+  },
+  // 柳叶医仙：温柔女医，青白道袍，捧青瓷药炉，长发披散。
+  R006: {
+    base: 'alchemy', face: FACE_F,
+    hair: `
+    <g class="pc__hair">
+      <path class="ca-hair" d="M63.5 42C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 42C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 42Z"/>
+      <path class="ca-hair-b" d="M63 40C56 66 55 96 60 122L68 122C63 96 64 66 67 46Z"/>
+      <path class="ca-hair-b" d="M97 40C104 66 105 96 100 122L92 122C97 96 96 66 93 46Z"/>
+      <path class="ca-hairpin" d="M70 11L90 15"/>
+    </g>`,
+  },
+  // 流火散修：不羁散修，破旧红衣（灼痕），铁剑扛肩，蓬松长发，狂放笑容。
+  R007: {
+    base: 'sword', hairColor: '#33261e',
+    back: `
+    <g class="pc__part part-ribbon">
+      <path class="ca-cape" d="M95 66C111 92 115 150 109 208C103 158 97 116 87 84Z"/>
+      <path class="ca-blade" d="M104 106L69 8L66 12L107 101Z"/>
+      <path class="ca-guard" d="M100 102l6-3 2 4-6 3z"/>
+    </g>`,
+    weapon: '',
+    // 剑扛肩上：右手改握肩头剑格，而非默认的右手下垂握剑位。
+    handR: `<circle class="ca-hand" cx="105" cy="102.5" r="4.4"/>`,
+    hair: `
+    <g class="pc__hair">
+      <path class="ca-hair" d="M62 44C60 23 69 16 80 16C91 16 100 23 98 44C96 31 90 25.5 80 25.5C70 25.5 64 31 62 44Z"/>
+      <path class="ca-hair-b" d="M61 40C54 70 55 100 60 124L69 122C64 98 63 68 66 46Z"/>
+      <path class="ca-hair-b" d="M99 40C106 70 105 100 100 124L91 122C96 98 97 68 94 46Z"/>
+    </g>`,
+  },
+  // 霜月散修：高冷女修，纯白银雪绣袍，持冰蓝符，银白长发。
+  R008: {
+    base: 'talisman', face: FACE_F, hairColor: '#c6d3dd',
+    weapon: `
+    <g class="ca-weapon">
+      <g class="ca-talisman ca-talisman-ice">
+        <rect x="106.5" y="70" width="10.5" height="21" rx="1.6"/>
+        <path class="ca-talisman-rune" d="M109 75h5.5M111.7 73.2v8.6M109 80.5q2.7 2.4 5.4 0"/>
+      </g>
+    </g>`,
+    hair: `
+    <g class="pc__hair">
+      <path class="ca-hair" d="M63.5 42C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 42C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 42Z"/>
+      <path class="ca-hair-b" d="M62.5 40C55 68 56 100 62 126L70 124C64.5 100 64 68 67 46Z"/>
+      <path class="ca-hair-b" d="M97.5 40C105 68 104 100 98 126L90 124C95.5 100 96 68 93 46Z"/>
+      <path class="ca-hairpin" d="M67 10L93 14"/>
+    </g>`,
+  },
+  // 飞羽散修：敏捷阵修，金线羽纹道袍，持罗盘，短黑发 + 羽簪。
+  R009: {
+    base: 'array',
+    // 短黑发：显式去掉躯体默认的两侧垂发（hairBack），只留头顶层 + 羽簪。
+    hairBack: '',
+    weapon: `
+    <g class="ca-weapon">
+      <circle class="ca-rune" cx="80" cy="112" r="22"/>
+      <circle class="ca-rune ca-rune-d" cx="80" cy="112" r="14"/>
+      <g class="ca-compass">
+        <circle class="ca-compass-rim" cx="80" cy="126" r="9"/>
+        <circle class="ca-compass-face" cx="80" cy="126" r="6.5"/>
+        <path class="ca-compass-needle" d="M80 120.5L82 126L80 131.5L78 126Z"/>
+      </g>
+    </g>`,
+    hair: `
+    <g class="pc__hair">
+      <path class="ca-hair" d="M64 39C63 24 70 18 80 18C90 18 97 24 96 39C94 30.5 90 26.5 80 26.5C70 26.5 66 30.5 64 39Z"/>
+      <path class="ca-feather" d="M87 14C92 6.5 100 4 105.5 6C102.5 12.5 94 16 87 14Z"/>
+      <path class="ca-hairpin" d="M85 14.5L104 8"/>
+    </g>`,
+  },
+
+  // —— SR 卡 · 绝品紫金 ——
+  // 白鹤仙子：白鹤羽衣金云纹，持玉净瓶，黑长发飘飞缀白羽簪。
+  SR001: {
+    base: 'alchemy', face: FACE_F,
+    weapon: `
+    <g class="ca-weapon">
+      <g class="ca-vase">
+        <rect class="ca-vase-neck" x="101.5" y="96" width="3" height="8" rx="1.2"/>
+        <path class="ca-vase-body" d="M96 104q7-6.5 14 0q2 8.5-7 14.5q-9-6-7-14.5z"/>
+      </g>
+    </g>`,
+    hair: `
+    <g class="pc__hair">
+      <path class="ca-hair" d="M63.5 42C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 42C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 42Z"/>
+      <path class="ca-hair-b" d="M62.5 40C54 70 55 104 62 128L71 126C65 102 64 68 68 46Z"/>
+      <path class="ca-hair-b" d="M97.5 40C106 70 105 104 98 128L89 126C95 102 96 68 92 46Z"/>
+      <path class="ca-feather" d="M70 11C66 3.5 58 1.5 53 3.5C56 10 64 13 70 11Z"/>
+    </g>`,
+  },
+  // 赤霄剑尊：红黑战袍金火纹，持赤红巨剑（火焰缠绕），红绳束发髻。
+  SR002: {
+    base: 'sword',
+    weapon: `
+    <g class="ca-weapon">
+      <path class="ca-blade-fire" d="M105.5 96L100.5 18L110.5 18L107.5 96Z"/>
+      <path class="ca-guard" d="M96 95h15v4.5h-15z"/>
+      <rect class="ca-hilt" x="104" y="99.5" width="4" height="9.5" rx="1.6"/>
+      <path class="ca-flame" d="M100.5 62q-6.5-6-2.5-13.5q2 6.5 6.5 8.5q3 3-4 5z"/>
+      <path class="ca-flame" d="M110.5 44q6.5-7 2.5-14.5q-2 7-6.5 9q-3 3 4 5.5z"/>
+    </g>`,
+    hair: `
+    <g class="pc__hair">
+      <path class="ca-hair" d="M63.5 41C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 41C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 41Z"/>
+      <circle class="ca-hair" cx="80" cy="13.5" r="5.5"/>
+      <path class="ca-band" d="M74.5 15.5q5.5 2.4 11 0l-1.2 3.4q-4.3 1.7-8.6 0z"/>
+    </g>`,
+  },
+  // 玄冥蛇姬：暗紫蛇鳞紧身袍，持盘蛇法杖，竖瞳狡笑，黑发缠小蛇。
+  SR003: {
+    base: 'talisman', face: FACE_SLIT, hairColor: '#2e2434',
+    weapon: `
+    <g class="ca-weapon">
+      <rect class="ca-staff" x="109.2" y="48" width="3.6" height="56" rx="1.8"/>
+      <path class="ca-snake" d="M111 49C103 47 100.5 40.5 105 36.5C109.5 32.8 116 35 115.6 40C115.2 44.4 110 45 110.6 40.6"/>
+      <circle class="ca-eye-red" cx="107" cy="36.5" r="1"/>
+    </g>`,
+    hair: `
+    <g class="pc__hair">
+      <path class="ca-hair" d="M63.5 42C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 42C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 42Z"/>
+      <path class="ca-hair-b" d="M63 40C56 68 57 98 62 122L70 120C65 96 65 68 67.5 46Z"/>
+      <path class="ca-hair-b" d="M97 40C104 68 103 98 98 122L90 120C95 96 95 68 92.5 46Z"/>
+      <path class="ca-snake" d="M66.5 16q-6.5-8 0-13.5q5.5-4 8.5 1q2 5.5-3.5 6.5"/>
+      <path class="ca-snake" d="M93.5 16q6.5-8 0-13.5q-5.5-4-8.5 1q-2 5.5 3.5 6.5"/>
+    </g>`,
+  },
+  // 青莲道尊：青莲道袍宽袖，持拂尘，灰白长发木簪，出尘安和。
+  SR004: {
+    base: 'array', hairColor: '#cfcac0',
+    // 灰白长发：保留躯体默认的两侧垂发（hairBack），由 hairColor 染成灰白。
+    weapon: `
+    <g class="ca-weapon">
+      <circle class="ca-rune" cx="80" cy="112" r="22"/>
+      <circle class="ca-rune ca-rune-d" cx="80" cy="112" r="14"/>
+      <g class="ca-whisk">
+        <path class="ca-staff-line" d="M84 110L102 76"/>
+        <path d="M102 76C98 68 100 60 106 56C106 64 108 70 106 76Z"/>
+        <path d="M102 76C108 70 114 68 120 70C114 74 110 78 104 79Z"/>
+        <path d="M102 76C96 70 90 68 84 70C90 74 94 78 100 79Z"/>
+      </g>
+    </g>`,
+    hair: `
+    <g class="pc__hair">
+      <path class="ca-hair" d="M64.5 38C63.5 25 70.5 19.5 80 19.5C89.5 19.5 96.5 25 95.5 38C94 30.5 90 27.5 80 27.5C70 27.5 66 30.5 64.5 38Z"/>
+      <circle class="ca-hair" cx="80" cy="14" r="5.5"/>
+      <path class="ca-hairpin" d="M70 11.5L92 15.5"/>
+    </g>`,
+  },
+
+  // —— SSR 卡 · 至品彩凰 ——
+  // 蚩尤残魂：牛角盔碎暗金魔甲，持巨斧（赤雷缠绕），红眼狂发，面部图腾纹。
+  SSR001: {
+    base: 'body', face: FACE_FIERCE, hairColor: '#26201c',
+    weapon: `
+    <g class="ca-weapon">
+      <g class="ca-axe">
+        <rect class="ca-staff" x="111" y="58" width="4.4" height="76" rx="2.2"/>
+        <path class="ca-axe-head" d="M115.4 58C130 58 138 66 138 76C130 80.5 122 80.5 115.4 78Z"/>
+        <path class="ca-axe-head" d="M111 58C96.4 58 88.4 66 88.4 76C96.4 80.5 104.4 80.5 111 78Z"/>
+        <path class="ca-lightning" d="M122 52l6 8-5 2 7 9"/>
+      </g>
+    </g>`,
+    chest: `
+    <path class="ca-armor-broken" d="M69 90h22v17q-11 8-22 0z"/>
+    <path class="ca-shell-line" d="M80 90v21M69 98h22M76 92l2 9"/>`,
+    hair: `
+    <g class="pc__hair">
+      <path class="ca-hair" d="M62 42C60 22 69 15 80 15C91 15 100 22 98 42C96 30 90 24 80 24C70 24 64 30 62 42Z"/>
+      <path class="ca-hair-b" d="M61 38C53 62 54 84 59 100L67 98C62 80 62 60 66 44Z"/>
+      <path class="ca-hair-b" d="M99 38C107 62 106 84 101 100L93 98C98 80 98 60 94 44Z"/>
+      <path class="ca-horn" d="M66.5 22C56.5 18 50.5 10 50.5 2C58.5 4 64.5 10 68.5 18Z"/>
+      <path class="ca-horn" d="M93.5 22C103.5 18 109.5 10 109.5 2C101.5 4 95.5 10 91.5 18Z"/>
+    </g>`,
+  },
+  // 瑶池圣母：七色彩凰霓裳 + 金凤冠，持玉杯甘露，光环绕首，立金莲之上。
+  SSR002: {
+    base: 'alchemy', face: FACE_F,
+    back: `
+    <g class="pc__part part-ribbon">
+      <path class="ca-ribbon" d="M93 72C112 82 122 106 117 132C124 105 113 76 94 66Z"/>
+      <circle class="ca-halo" cx="80" cy="38" r="27"/>
+      <circle class="ca-halo-h" cx="80" cy="38" r="21.5"/>
+    </g>`,
+    weapon: `
+    <g class="ca-weapon">
+      <g class="ca-goblet">
+        <path class="ca-goblet-cup" d="M97.5 97h12q0 8.5-6 10.8q-6-2.3-6-10.8z"/>
+        <rect class="ca-goblet-stem" x="102.7" y="108" width="1.8" height="6" rx="0.9"/>
+        <path class="ca-goblet-base" d="M99.5 114h8.5l1.4 3.4h-11.4z"/>
+      </g>
+    </g>`,
+    front: `
+    <g class="ca-lotus">
+      <path class="ca-lotus-p" d="M56 293q9 12 24 12t24-12q-10 6-24 6t-24-6z"/>
+      <path class="ca-lotus-p" d="M59 291q2 10 8.5 13.5q-1-8 1-13.5z"/>
+      <path class="ca-lotus-p" d="M74 295q2 9 6 11.5q0-7 1-11.5z"/>
+      <path class="ca-lotus-p" d="M101 291q-2 10-8.5 13.5q1-8-1-13.5z"/>
+      <path class="ca-lotus-p" d="M86 295q-2 9-6 11.5q0-7-1-11.5z"/>
+    </g>`,
+    hair: `
+    <g class="pc__hair">
+      <path class="ca-hair" d="M63.5 42C61.5 24 69 17.5 80 17.5C91 17.5 98.5 24 96.5 42C95.5 31 90.5 26.5 80 26.5C69.5 26.5 64.5 31 63.5 42Z"/>
+      <path class="ca-hair-b" d="M62.5 40C53 72 54 108 62 134L72 132C65 106 64 70 68 46Z"/>
+      <path class="ca-hair-b" d="M97.5 40C107 72 106 108 98 134L88 132C95 106 96 70 92 46Z"/>
+      <path class="ca-crown-phoenix" d="M70.5 13.5L78 3L82 12L87.5 4L90.5 13.5Z"/>
+    </g>`,
+  },
 };
 
 // 全身像：脚底对齐容器底边（xMidYMax），与 .portrait__doll 的布景衔接。
@@ -189,11 +584,14 @@ const VB_BUST = '34 -4 92 118';
 
 function figureEl(card, viewBox, preserve, opts) {
   const cls = classDef(card && card.cls);
+  // 优先取角色专属设定（15 人 15 面），无设定的卡回退到职业骨架。
+  const spec = CHAR_SPECS[card && card.id] || {};
+  const build = BODIES[spec.base || cls.key] || BODIES.sword;
   const el = h('span', {
     class: `char-art${opts && opts.sil ? ' is-sil' : ''}`,
-    html: `<svg viewBox="${viewBox}" preserveAspectRatio="${preserve}" aria-hidden="true" focusable="false">${ART[cls.key] || ART.sword}</svg>`,
+    html: `<svg viewBox="${viewBox}" preserveAspectRatio="${preserve}" aria-hidden="true" focusable="false">${build(spec)}</svg>`,
   });
-  // 五行代表色（可被卡牌 silhouetteColor 覆盖）落到画布自身，向下级 SVG 形状传递。
+  // 五行代表色（可被卡牌 silhouetteColor 覆盖）+ 角色发色落到画布自身，向下级 SVG 形状传递。
   for (const [k, v] of Object.entries(charArtVars(card))) el.style.setProperty(k, v);
   return el;
 }
@@ -212,5 +610,8 @@ export function charBust(card, opts = {}) {
 // 卡面（portrait3D）与战场剪影（silhouetteRenderer）都从这里取值，保证同屏只有一档色。
 export function charArtVars(card) {
   const sil = silhouetteColor(card);
-  return { '--sil': sil, '--sil-d': shade(sil, -0.35), '--sil-l': shade(sil, 0.3) };
+  const vars = { '--sil': sil, '--sil-d': shade(sil, -0.35), '--sil-l': shade(sil, 0.3) };
+  const hair = CHAR_SPECS[card && card.id] && CHAR_SPECS[card.id].hairColor;
+  if (hair) { vars['--hair'] = hair; vars['--hair-l'] = shade(hair, 0.3); }
+  return vars;
 }
diff --git a/apps/ling-xu-wen-jian-lu/src/ui/style.css b/apps/ling-xu-wen-jian-lu/src/ui/style.css
index 46cce05..9e1889d 100644
--- a/apps/ling-xu-wen-jian-lu/src/ui/style.css
+++ b/apps/ling-xu-wen-jian-lu/src/ui/style.css
@@ -310,6 +310,14 @@
 
 /* —— 绘卷（形象预设 + AI 绘图提示词）—— */
 .art-spec { display: flex; flex-direction: column; gap: 6px; font-size: 13px; }
+/* 绘卷面板：左侧立绘预览 + 右侧设定文字 */
+.art-panel { display: flex; gap: 12px; align-items: stretch; }
+.art-figure { flex: 0 0 110px; min-height: 220px; display: flex; align-items: flex-end;
+  background: linear-gradient(180deg, rgba(60,50,40,.16), rgba(30,24,18,.28));
+  border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
+.art-figure .char-art { width: 100%; height: 100%; }
+.art-panel .art-spec { flex: 1; }
+@media (max-width: 560px) { .art-panel { flex-direction: column; } .art-figure { flex: none; height: 200px; } }
 .art-spec__row { display: flex; gap: 10px; align-items: baseline; }
 .art-spec__row .muted { flex: 0 0 3em; font-size: 12px; }
 .art-prompt { white-space: pre-wrap; word-break: break-word; font-size: 11px; line-height: 1.6; background: var(--paper-2); border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; margin: 8px 0; max-height: 180px; overflow-y: auto; color: var(--ink); font-family: inherit; }
@@ -620,8 +628,8 @@
 .char-art .ca-skin-sh { fill: #e2c5a0; }
 .char-art .ca-eye { fill: #2c1810; }
 .char-art .ca-line { fill: none; stroke: #2c1810; stroke-width: 1.5; stroke-linecap: round; }
-.char-art .ca-hair, .char-art .ca-hair-b { fill: #3a2a20; }
-.char-art .ca-hair-l { fill: #52403a; }
+.char-art .ca-hair, .char-art .ca-hair-b { fill: var(--hair, #3a2a20); }
+.char-art .ca-hair-l { fill: var(--hair-l, #52403a); }
 .char-art .ca-hairpin { stroke: var(--gold, #D4A04A); stroke-width: 2.4; stroke-linecap: round; }
 .char-art .ca-shoe { fill: #2c1810; }
 .char-art .ca-robe, .char-art .ca-sleeve-d { fill: var(--sil); }
@@ -646,6 +654,56 @@
 .char-art .ca-rune-d { stroke-dasharray: 3 5; opacity: .55; }
 .char-art .ca-talisman rect { fill: #f7f0dc; stroke: #c9a24a; stroke-width: 1.2; }
 .char-art .ca-talisman-rune { fill: none; stroke: #c23b22; stroke-width: 1.4; stroke-linecap: round; }
+
+/* —— 角色专属部件（issue #97：15 人 15 面，见 charArt.js CHAR_SPECS）—— */
+/* 赤焰灵狐：狐耳 / 狐尾（耳窝浅粉，尾尖白）*/
+.char-art .ca-ear { fill: var(--hair, #3a2a20); }
+.char-art .ca-ear-in { fill: #e8c0aa; }
+.char-art .ca-tail { fill: var(--sil); }
+.char-art .ca-tail-tip { fill: #f2e7da; }
+/* 青竹剑侍：竹节青刃 + 竹叶 */
+.char-art .ca-blade-bamboo { fill: #8fbc7a; stroke: #5f8a4e; stroke-width: 1; }
+.char-art .ca-leaf { fill: #6f9e5a; }
+/* 金戈锐士：金刃 + 兽吞肩甲 */
+.char-art .ca-blade-gold { fill: #e8c765; stroke: #b8933d; stroke-width: 1; }
+.char-art .ca-pauldron { fill: var(--sil-l); stroke: var(--sil-d); stroke-width: 1.4; }
+/* 玄龟甲士：铁锤 + 龟甲纹胸甲 */
+.char-art .ca-hammer-head { fill: #8d9299; stroke: #5c6167; stroke-width: 1; }
+.char-art .ca-shell { fill: var(--sil-d); }
+.char-art .ca-shell-line { fill: none; stroke: var(--sil-l); stroke-width: 1.4; }
+/* 厚土力士：裸臂 + 石拳套 + 皮甲斜带 */
+.char-art .ca-fore-bare { fill: none; stroke: #e2c5a0; stroke-width: 9; stroke-linecap: round; }
+.char-art .ca-gauntlet { fill: var(--sil-d); stroke: var(--sil-l); stroke-width: 2; }
+.char-art .ca-strap { fill: none; stroke: #7a4a2a; stroke-width: 7; stroke-linecap: round; }
+/* 霜月散修：冰蓝符纸 */
+.char-art .ca-talisman-ice rect { fill: #dcecf7; stroke: #9cc3e2; stroke-width: 1.2; }
+.char-art .ca-talisman-ice .ca-talisman-rune { stroke: #4a90c2; }
+/* 飞羽散修 / 白鹤仙子：羽饰 + 铜罗盘 */
+.char-art .ca-feather { fill: #d9c289; }
+.char-art .ca-compass-rim { fill: #c9a24a; }
+.char-art .ca-compass-face { fill: #f3ead2; }
+.char-art .ca-compass-needle { fill: #c23b22; }
+/* 白鹤仙子 / 瑶池圣母：玉净瓶 / 玉杯 */
+.char-art .ca-vase-neck, .char-art .ca-vase-body,
+.char-art .ca-goblet-cup, .char-art .ca-goblet-base { fill: #bfe0d4; stroke: #7fae9c; stroke-width: 1; }
+.char-art .ca-goblet-stem { fill: #7fae9c; }
+/* 玄冥蛇姬 / 青莲道尊：盘蛇法杖 / 拂尘 */
+.char-art .ca-staff { fill: #7a4a2a; }
+.char-art .ca-staff-line { fill: none; stroke: #8a5a32; stroke-width: 3.4; stroke-linecap: round; }
+.char-art .ca-snake { fill: #5c8a6a; stroke: #3d6350; stroke-width: 1; }
+.char-art .ca-whisk path { fill: #e8e2d2; }
+/* 蚩尤残魂：赤瞳 / 图腾纹 / 牛角 / 巨斧 + 赤雷 / 破碎魔甲 */
+.char-art .ca-eye-red { fill: #d43a2f; }
+.char-art .ca-totem { fill: none; stroke: #8a5a3a; stroke-width: 1.3; stroke-linecap: round; }
+.char-art .ca-horn { fill: #d8cbb2; stroke: #a3927a; stroke-width: 1; }
+.char-art .ca-axe-head { fill: #c9a24a; stroke: #8a6d2f; stroke-width: 1; }
+.char-art .ca-lightning { fill: none; stroke: #d43a2f; stroke-width: 2; stroke-linecap: round; }
+.char-art .ca-armor-broken { fill: var(--sil-d); stroke: var(--sil-l); stroke-width: 1.2; }
+/* 瑶池圣母：金凤冠 / 头光 / 金莲台 */
+.char-art .ca-crown-phoenix { fill: #e0b64f; stroke: #b8862f; stroke-width: 1; }
+.char-art .ca-halo { fill: none; stroke: rgba(224,182,79,.8); stroke-width: 2.5; }
+.char-art .ca-halo-h { fill: none; stroke: rgba(224,182,79,.4); stroke-width: 1.4; }
+.char-art .ca-lotus-p { fill: #e0b64f; opacity: .85; }
 /* 阵法环缓转 / 符纸微悬 / 炉火摇曳（仅 SR/SSR 卡面启用，见 .dyn-1/.dyn-2）*/
 .portrait__card.dyn-1 .ca-rune, .portrait__card.dyn-2 .ca-rune { animation: ca-rune-spin 9s linear infinite; transform-box: fill-box; transform-origin: 50% 50%; }
 .portrait__card.dyn-1 .ca-talisman, .portrait__card.dyn-2 .ca-talisman { animation: ca-float 2.8s ease-in-out infinite; }
@@ -797,23 +855,41 @@
 /* 皮影化：全身像塌缩为五行代表色三阶单色剪影（人形轮廓 + 武器仍可辨识）*/
 .char-art.is-sil .ca-skin, .char-art.is-sil .ca-skin-sh, .char-art.is-sil .ca-hand,
 .char-art.is-sil .ca-hair, .char-art.is-sil .ca-hair-b, .char-art.is-sil .ca-hair-l,
-.char-art.is-sil .ca-shoe, .char-art.is-sil .ca-crown { fill: var(--sil); }
+.char-art.is-sil .ca-shoe, .char-art.is-sil .ca-crown,
+.char-art.is-sil .ca-ear, .char-art.is-sil .ca-horn, .char-art.is-sil .ca-tail { fill: var(--sil); }
 .char-art.is-sil .ca-robe, .char-art.is-sil .ca-sleeve-d, .char-art.is-sil .ca-cape,
 .char-art.is-sil .ca-collar, .char-art.is-sil .ca-hem, .char-art.is-sil .ca-shield,
-.char-art.is-sil .ca-tlg { fill: var(--sil-d); }
-.char-art.is-sil .ca-sleeve { stroke: var(--sil); }
+.char-art.is-sil .ca-tlg,
+.char-art.is-sil .ca-gauntlet, .char-art.is-sil .ca-snake,
+.char-art.is-sil .ca-armor-broken, .char-art.is-sil .ca-shell { fill: var(--sil-d); }
+.char-art.is-sil .ca-sleeve, .char-art.is-sil .ca-fore-bare { stroke: var(--sil); }
 .char-art.is-sil .ca-fore { stroke: var(--sil-d); }
 .char-art.is-sil .ca-sash, .char-art.is-sil .ca-sash-tail, .char-art.is-sil .ca-band,
 .char-art.is-sil .ca-ribbon, .char-art.is-sil .ca-blade, .char-art.is-sil .ca-guard,
 .char-art.is-sil .ca-shield-boss, .char-art.is-sil .ca-mirror, .char-art.is-sil .ca-mirror-rim,
 .char-art.is-sil .ca-tlg-l, .char-art.is-sil .ca-flame, .char-art.is-sil .ca-crown-b,
-.char-art.is-sil .ca-hilt, .char-art.is-sil .ca-talisman rect { fill: var(--sil-l); }
+.char-art.is-sil .ca-hilt, .char-art.is-sil .ca-talisman rect,
+.char-art.is-sil .ca-ear-in, .char-art.is-sil .ca-tail-tip, .char-art.is-sil .ca-leaf,
+.char-art.is-sil .ca-blade-bamboo, .char-art.is-sil .ca-blade-gold,
+.char-art.is-sil .ca-blade-fire, .char-art.is-sil .ca-hammer-head,
+.char-art.is-sil .ca-pauldron, .char-art.is-sil .ca-feather,
+.char-art.is-sil .ca-compass-rim, .char-art.is-sil .ca-compass-face,
+.char-art.is-sil .ca-compass-needle, .char-art.is-sil .ca-vase-neck,
+.char-art.is-sil .ca-vase-body, .char-art.is-sil .ca-goblet-cup,
+.char-art.is-sil .ca-goblet-base, .char-art.is-sil .ca-goblet-stem,
+.char-art.is-sil .ca-staff, .char-art.is-sil .ca-whisk path,
+.char-art.is-sil .ca-axe-head, .char-art.is-sil .ca-crown-phoenix,
+.char-art.is-sil .ca-lotus-p, .char-art.is-sil .ca-eye-red { fill: var(--sil-l); }
 .char-art.is-sil .ca-line, .char-art.is-sil .ca-hairpin,
-.char-art.is-sil .ca-talisman-rune { stroke: var(--sil-l); }
+.char-art.is-sil .ca-talisman-rune, .char-art.is-sil .ca-totem,
+.char-art.is-sil .ca-lightning, .char-art.is-sil .ca-halo, .char-art.is-sil .ca-halo-h,
+.char-art.is-sil .ca-staff-line, .char-art.is-sil .ca-shell-line,
+.char-art.is-sil .ca-strap { stroke: var(--sil-l); }
 .char-art.is-sil .ca-eye { fill: var(--sil-l); }
 .char-art.is-sil .ca-rune { stroke: var(--sil-l); }
 .char-art.is-sil .ca-blade, .char-art.is-sil .ca-shield, .char-art.is-sil .ca-mirror,
-.char-art.is-sil .ca-hand, .char-art.is-sil .ca-talisman rect { stroke: none; }
+.char-art.is-sil .ca-hand, .char-art.is-sil .ca-talisman rect,
+.char-art.is-sil .ca-gauntlet, .char-art.is-sil .ca-armor-broken { stroke: none; }
 /* 稀有度光环：青玉 / 紫金 / 彩凰 */
 .silu .aura-R   { border-color: var(--sil, #9a8a72); }
 .silu .aura-SR  { border-color: var(--r-SR); box-shadow: 0 0 6px var(--r-SR); }
