diff --git a/.ai-tasks/issue-93/ai-coder-prompt.md b/.ai-tasks/issue-93/ai-coder-prompt.md
new file mode 100644
index 0000000..ef98d88
--- /dev/null
+++ b/.ai-tasks/issue-93/ai-coder-prompt.md
@@ -0,0 +1,8 @@
+你是一个资深开发者。请解决以下 GitHub Issue：
+【任务标题】: 《灵墟·问剑录》角色人物优化
+【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-93/context.md 文件获取。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
+
+请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-93/ai-reviewer-prompt_r1.md b/.ai-tasks/issue-93/ai-reviewer-prompt_r1.md
new file mode 100644
index 0000000..33b80f4
--- /dev/null
+++ b/.ai-tasks/issue-93/ai-reviewer-prompt_r1.md
@@ -0,0 +1,14 @@
+你是一个极其严格、甚至有些刁钻的资深代码审查员。
+这是代码提交后的【第 1 轮】审查。
+请阅读当前目录下的 .ai-tasks/issue-93/pr_diff_r1.md 文件，这是本次 PR 的代码变更。
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
diff --git a/.ai-tasks/issue-93/context.md b/.ai-tasks/issue-93/context.md
new file mode 100644
index 0000000..4f6f17a
--- /dev/null
+++ b/.ai-tasks/issue-93/context.md
@@ -0,0 +1,157 @@
+以下为 《灵墟·问剑录》角色人物增量设计文档，涵盖人物分层结构、稀有度差异化表现、职业剪影识别、动态交互反馈，直接补充进整体方案。
+
+《灵墟·问剑录》角色人物视觉设计（增量文档）
+
+一、2.5D角色视觉架构（分层立体结构）
+
+每张卡牌内的角色并非一张平面图，而是拆解为 “三叠层”，利用 CSS 3D 视差营造立体纵深：
+
+```
+┌─────────────────────────────────────────────┐
+│   【前景层·特效】                           │
+│   ┌─────────────────────────────────────┐   │
+│   │   【角色层·本体】                   │   │
+│   │   ┌─────────────────────────────┐   │   │
+│   │   │  【背景层·意境】             │   │   │
+│   │   │  （水墨山水/门派洞府/星空） │   │   │
+│   │   └─────────────────────────────┘   │   │
+│   └─────────────────────────────────────┘   │
+└─────────────────────────────────────────────┘
+```
+
+层级 命名 内容 2.5D表现手法 素材格式
+底层 意境背景 对应角色身份的水墨场景（如白鹤仙子→云雾仙山，蚩尤残魂→熔岩战场） 固定于卡牌最深处，透明度随鼠标倾斜角度微变（模拟景深感） JPG/WebP（低饱和度水墨风）
+中层 角色本体 人物半身立绘（含武器、配饰、衣袂） 占据卡面主体，略有仰视透视（下大上小），人物脚部位于卡牌底部，头顶留白 PNG（透明底，含阴影层）
+上层 意境特效 水墨粒子、飘落花瓣、流转剑气、灵兽虚影等动态元素 独立 Canvas 或 CSS 动画循环，与角色本体互动（如绕手指盘旋） CSS/Canvas 实时绘制 + 少量PNG光效
+
+技术实现：鼠标在卡牌上左右移动时，三层以不同速度（背景慢、角色中速、特效快）做 translateX 偏移，产生 “裸眼2.5D视差” 效果。
+
+二、稀有度对应的人物美术规格（逐级细化）
+
+2.1 R卡·逸品青玉 —— “墨线白描工笔”
+
+维度 规格说明
+画风 纯墨线勾勒 + 淡彩晕染（类似古代画谱），无复杂光影，以线条表现衣褶与气质
+动态 静态，无任何动画，仅靠CSS使人物微微“呼吸”（scale 1.0↔1.02，周期4秒）
+背景 纯色宣纸底纹（#F5F0E6）+ 淡淡墨迹渍染，无具体场景
+色彩 墨色为主，仅嘴唇/发带/剑穗等局部点染朱砂或石绿（单色点缀）
+尺寸比例 人物占卡面高度的 50%，居中偏下，留白较多（“疏可走马”的国画构图）
+特殊标记 卡面左下角盖一枚 “逸品·青玉” 朱砂印章
+
+视觉关键词：素雅、留白、线条感、文人画。
+
+2.2 SR卡·绝品紫金 —— “淡彩半动态工笔重彩”
+
+维度 规格说明
+画风 工笔重彩为基础，增加淡彩渐变与柔和光影，服饰有云纹/雷纹等精细装饰
+动态 局部逐帧动画（Spritesheet 或 CSS 关键帧）：衣袂/飘带/长发 3~5 个部件缓慢飘动（类似 Live2D 微动），眼睛有轻微眨眼（每6秒一次）
+背景 带有具体场景的淡彩水墨（如角色所在门派、洞府），饱和度较低以突出人物
+色彩 丰富且和谐，主色 + 辅色 + 点缀色（金/紫），遵循传统“随类赋彩”原则
+尺寸比例 人物占卡面高度的 65%，略微放大，展现更多服饰细节
+特殊标记 卡面左下角盖 “绝品·紫金” 烫印印章 + 底部有金色流沙动态光效
+
+视觉关键词：华丽、局部灵动、金紫辉映、服饰考究。
+
+2.3 SSR卡·至品彩凰 —— “全动态泼彩大写意”
+
+维度 规格说明
+画风 融合张大千式泼墨泼彩 + 现代数码厚涂，色彩绚丽炸裂，光影强烈，有“仙气弥漫”的辉光效果
+动态 全卡动态系统：人物呼吸起伏 + 衣袂飞舞 + 身后灵兽/法器虚影环绕 + 水墨粒子向四周散逸 + 专属背景水流/火焰/雷电实时粒子系统
+背景 专属超大场景（如蚩尤残魂→上古战场+九黎图腾，瑶池圣母→瑶池金母蟠桃盛会），且背景本身有云海翻涌/熔岩流动等动态
+色彩 高饱和撞色但维持国风调性（朱红撞石青、紫金配翠绿），色彩对比强烈，视觉冲击力拉满
+尺寸比例 人物占卡面高度的 75%，几乎撑满卡面，溢出边框的“破框”特效（部分衣袂/剑气冲出卡牌边界）
+特殊标记 右上角动态飘浮 “至品·彩凰” 金字篆书 + 七彩流光循环扫过全卡
+
+视觉关键词：炸裂、全动态、神仙气、破框张力。
+
+三、五大职业剪影识别设计（让定位一目了然）
+
+即使不读文字，玩家仅凭角色姿态+武器+服饰轮廓即可判断职业：
+
+职业 典型姿态 核心武器 服饰特征 色彩倾向
+剑修 侧身45°执剑，剑尖指地或斜指天，身形挺拔 长剑/飞剑（必有剑穗） 窄袖劲装，腰带束身，披风或飘带 金/白/青（锐利色）
+体修 正面站立，双臂微张，肌肉线条明显，下盘沉稳 拳套/巨盾/降魔杵 裸露手臂或肩甲厚重，短打+护心镜 土黄/赤红/玄黑（厚重色）
+丹修 单手托举药炉/玉瓶，另一手掐诀，姿态柔和 葫芦/药炉/玉净瓶 宽袍大袖，道袍或禅衣，多有飘带环绕 青绿/月白/琥珀（温润色）
+阵修 双手结印，周身悬浮灵符或阵法符文 符箓/阵旗/罗盘 道冠+法衣，绣有八卦/河图洛书纹样 紫/蓝/银灰（神秘色）
+符修 单手持符贴于身前，另一手两指并拢点向目标 黄纸符/朱砂笔/法印 头戴逍遥巾，身披鹤氅，腰间挂满符袋 朱红/明黄/赭石（法术色）
+
+原则：同一稀有度下，不同职业姿态差异大于颜色差异，确保缩略图（如编队小头像）也能一眼识别。
+
+四、角色交互反馈（点击/悬停/拖拽）
+
+交互动作 视觉反馈 触发条件
+悬停预览 角色微微转头（CSS 3D旋转 5°）+ 衣袂飘动加速 + 背景墨迹向外扩散一圈涟漪 鼠标悬停卡牌 > 0.3s
+点击选中 角色全身金光描边闪烁一次 + 底部浮现角色专属诗词一句（如“云鹤九霄外，仙踪不可寻”） 鼠标点击卡牌
+拖拽旋转 卡牌跟随鼠标拖动绕Y轴 -30°~30° 旋转，三层视差图层产生位移，产生“实物把玩”感 鼠标在卡面按下并拖动
+长按详情 角色从卡面“跃出”（放大至120%，叠加模糊背景），进入全屏沉浸预览模式 长按卡牌 1.5s
+升级/突破成功 角色全身被金色光柱笼罩，水墨粒子从底部冲天而起，屏幕微震 养成操作完成瞬间
+满好感度 角色立绘增加一层柔光+粉色花瓣环绕，表情（眼睛/嘴角）CSS微调为微笑 知音值达到满级
+
+五、立绘制作规范（给画师/AI出图的具体参数）
+
+为保证全卡风格统一且适配2.5D等距视角，所有角色立绘必须遵循以下画布标准：
+
+参数 规格
+画布尺寸 2048 × 1536 px（4:3 比例，便于裁剪为卡面）
+人物位置 人物腰部以下位于画布底部，头部位于画布上1/3处，左右居中
+视角 微俯视 15°（人物略低头或眼睛向下看），避免纯正面大头照
+背景透明 角色本体PNG必须为透明底，背景层单独绘制（便于分层视差）
+图层命名（PSD分层标准） body（躯干）、head（头部）、hair_front/back（前/后发）、arm_L/R（双臂）、weapon（武器）、accessory（配饰/飘带）——分7层导出，用于CSS分体动画（SR/SSR局部飘动）
+色彩模式 sRGB，注意中国风用色（避免荧光色、高饱和纯紫/纯粉）
+边缘处理 水墨晕染边缘（PNG边缘带微透明墨迹扩散，而非硬边裁切）
+
+AI出图提示词示例（Midjourney）：
+Chinese ink wash painting, Song dynasty style, half-body portrait of a Taoist female immortal in white robes, holding a jade bottle, light cyan and gold color scheme, ethereal, floating ribbons, looking down slightly, transparent background, detailed brushwork, masterpiece --ar 4:3
+
+六、编队/战斗中的角色微缩表现（2.5D战场）
+
+在2.5D战斗棋盘上，角色并非以完整立绘出现，而是采用 “皮影剪影+属性光晕” 模式：
+
+元素 设计说明
+角色形象 使用立绘的简化剪影版本（去除复杂背景，只保留人物轮廓+武器），填充颜色为该角色的五行代表色
+稀有度标识 剪影底部用对应稀有度的光环（青玉/紫金/彩凰光圈）旋转环绕
+选中高亮 当前出手角色剪影变为实体水墨质感（从剪影还原为带纹理的淡彩形象），结束后恢复剪影
+受击反馈 剪影震动 + 水墨碎片飞溅
+阵亡退场 剪影从底部向上“化为墨烟”消散
+
+此设计大幅降低战场渲染压力（无需渲染高清立绘），同时保持2.5D国风氛围。
+
+七、角色数据库字段补充（cards.json 扩展）
+
+为支持上述人物样式，每张卡牌数据需增加以下字段：
+
+```json
+{
+  "id": "SR001",
+  "name": "白鹤仙子",
+  // ... 原有字段 ...
+  "portrait": {
+    "layers": {
+      "bg": "assets/portraits/SR001_bg.webp",
+      "body": "assets/portraits/SR001_body.png",
+      "head": "assets/portraits/SR001_head.png",
+      "hair": "assets/portraits/SR001_hair.png",
+      "arm_L": "assets/portraits/SR001_armL.png",
+      "arm_R": "assets/portraits/SR001_armR.png",
+      "weapon": "assets/portraits/SR001_weapon.png"
+    },
+    "animations": {
+      "sway_parts": ["hair", "arm_R"],    // 飘动部件
+      "blink_interval": 6000               // 眨眼间隔(ms)
+    }
+  },
+  "silhouette_color": "#3B82F6",            // 五行战场剪影用色
+  "poem": "云鹤九霄外，仙踪不可寻",            // 点击浮现诗句
+  "voice_quote": "道友，可愿与我共饮一杯？"    // 预留语音文案
+}
+```
+
+八、增量开发清单（人物模块）
+
+任务 产出 工时
+制定15张卡的人物分层PSD/PNG（可先用AI跑+手动抠层） 美术资产 并行进行
+CSS角色分层视差引擎（三层联动、拖拽旋转） portrait3D.js 2天
+SR/SSR局部飘动动画系统（CSS关键帧驱动分层部件） animationSystem.js 2天
+SSR全动态粒子背景（Canvas水墨粒子流） inkParticles.js 2天
+战场剪影生成器（立绘→剪影→五行着色） silhouetteRenderer.js 1天
+交互反馈集成（悬停/点击/长按/养成特效） 整合到 cardDetail.js 1.5天
diff --git a/.ai-tasks/issue-93/fixer-feedback_r1.md b/.ai-tasks/issue-93/fixer-feedback_r1.md
new file mode 100644
index 0000000..ec7323e
--- /dev/null
+++ b/.ai-tasks/issue-93/fixer-feedback_r1.md
@@ -0,0 +1,15 @@
+审查完毕（已通读全部 diff，并在仓库中核对了 battle.js / app.js / style.css 上下文，运行 scripts/logic-test.mjs 结果 206 通过 0 失败）。存在 1 个功能性 Bug 和若干次要问题：
+
+【Bug 1（主要，必须修复）】SSR 水墨粒子背景实际不可见。portrait3D.js 的 mount() 在 canvas 尚未插入 DOM 时调用 createInkStream()（buildCardStage 返回 wrap 之后才由 renderCultivate append 到 contentEl）。此时 inkParticles.js 的 resize() 中 getBoundingClientRect() 为 0，attribute/clientWidth 回退也均为 0，于是 canvas.width/height 被设为 1，粒子全部绘制在 1×1 的 backing store 上（坐标 0~120 全部落在画布外）。而 resize() 方法在整个代码库中没有任何外部调用者（无 ResizeObserver、无插入后二次 resize），因此 SSR 的常驻粒子流（设计稿 2.3 核心卖点）以及 celebrate() 对 SSR 卡的 burst() 冲天墨粒在真实浏览器中永远渲染不出来——测试全绿只是因为 jsdom 里本来就降级。建议：mount() 返回后在 requestAnimationFrame 中补一次 resize，或接入 ResizeObserver，或延迟到 isConnected 时再初始化。
+
+【Bug 2（次要）】长按 1.5s 打开沉浸预览后，pointerup 仍会派发 click；此时 moved === 0，通过 `if (this._dead || moved > 6) return` 守卫，导致 _strike() + _showPoem() 在全屏遮罩背后额外触发 toast 和诗词弹层。建议在 _openImmersive 后置标志（如 suppressClick）或在 end() 中消费掉。
+
+【Bug 3（次要）】_openImmersive 的 cloneNode(true) 复制了 SSR 粒子 canvas，但 clone 的画布是空白的（绘制内容不会随 clone 复制，也没有为新 canvas 重建 ink stream），沉浸预览模式下“全动态”效果丢失，只剩静态分层。
+
+【次要 4】destroy() 先清空 this._timers 再调用 this._immersive.close()，close 内部 push 进 _timers 的 260ms 收尾 timer 不再受管；虽然能自行移除 backdrop，但时序上脆弱，建议 close 改为同步移除或先 close 再清 timer。
+
+【次要 5】portrait-shake 关键帧硬编码 rotateY(16deg)，若用户拖拽到其他角度后触发 celebrate，会先跳回 16 度再震动，视觉跳变。
+
+【次要 6】_bursts 数组只增不减（burstInk 自毁后对象仍留在数组里），长时间会话下轻微累积，无实质泄漏但建议在 destroy 时或 burst 结束后清理。
+
+其余方面：config.js 的 CLASSES/RARITY_PORTRAIT/portraitLayers 纯数据无逻辑问题；battle.js 的 init 事件正确透传 cls/ref（buildCombatant 原本已有 ref 字段，已核实）；cards.js 15 张卡均补齐 poem/voiceQuote/silhouetteColor 且测试覆盖；战斗剪影 renderSilhouette 的降级路径安全；CSS 变量（--paper/--r-SR/--gold 等）均已存在；删除 app.js 的 shade() 后无残留引用。未发现安全问题；无 CI/workflows 改动需求。修复 Bug 1（及最好一并 Bug 2）后可通过。
diff --git a/.ai-tasks/issue-93/fixer-prompt_r1.md b/.ai-tasks/issue-93/fixer-prompt_r1.md
new file mode 100644
index 0000000..25511c6
--- /dev/null
+++ b/.ai-tasks/issue-93/fixer-prompt_r1.md
@@ -0,0 +1,7 @@
+你是一个资深开发工程师。这是针对上一轮代码的【第 1 轮】修复任务。
+以下是代码审查员给你的修改建议，请阅读当前目录下的 .ai-tasks/issue-93/fixer-feedback_r1.md 文件获取详细内容。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 .github/ 目录下的任何文件（特别是 workflows 等 CI/CD 配置），这会破坏项目的自动化流程！如果审查员要求你修改这些文件，请在回复中说明无法自动修改，需要人类介入。
+
+请直接分析并修改当前项目中的代码文件来满足审查员的要求，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-93/pr_diff_r1.md b/.ai-tasks/issue-93/pr_diff_r1.md
new file mode 100644
index 0000000..07f9c04
--- /dev/null
+++ b/.ai-tasks/issue-93/pr_diff_r1.md
@@ -0,0 +1,1468 @@
+diff --git a/.ai-tasks/issue-93/ai-coder-prompt.md b/.ai-tasks/issue-93/ai-coder-prompt.md
+new file mode 100644
+index 0000000..ef98d88
+--- /dev/null
++++ b/.ai-tasks/issue-93/ai-coder-prompt.md
+@@ -0,0 +1,8 @@
++你是一个资深开发者。请解决以下 GitHub Issue：
++【任务标题】: 《灵墟·问剑录》角色人物优化
++【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-93/context.md 文件获取。
++
++【⚠️ 严格红线规则】：
++请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
++
++请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
+diff --git a/.ai-tasks/issue-93/context.md b/.ai-tasks/issue-93/context.md
+new file mode 100644
+index 0000000..4f6f17a
+--- /dev/null
++++ b/.ai-tasks/issue-93/context.md
+@@ -0,0 +1,157 @@
++以下为 《灵墟·问剑录》角色人物增量设计文档，涵盖人物分层结构、稀有度差异化表现、职业剪影识别、动态交互反馈，直接补充进整体方案。
++
++《灵墟·问剑录》角色人物视觉设计（增量文档）
++
++一、2.5D角色视觉架构（分层立体结构）
++
++每张卡牌内的角色并非一张平面图，而是拆解为 “三叠层”，利用 CSS 3D 视差营造立体纵深：
++
++```
++┌─────────────────────────────────────────────┐
++│   【前景层·特效】                           │
++│   ┌─────────────────────────────────────┐   │
++│   │   【角色层·本体】                   │   │
++│   │   ┌─────────────────────────────┐   │   │
++│   │   │  【背景层·意境】             │   │   │
++│   │   │  （水墨山水/门派洞府/星空） │   │   │
++│   │   └─────────────────────────────┘   │   │
++│   └─────────────────────────────────────┘   │
++└─────────────────────────────────────────────┘
++```
++
++层级 命名 内容 2.5D表现手法 素材格式
++底层 意境背景 对应角色身份的水墨场景（如白鹤仙子→云雾仙山，蚩尤残魂→熔岩战场） 固定于卡牌最深处，透明度随鼠标倾斜角度微变（模拟景深感） JPG/WebP（低饱和度水墨风）
++中层 角色本体 人物半身立绘（含武器、配饰、衣袂） 占据卡面主体，略有仰视透视（下大上小），人物脚部位于卡牌底部，头顶留白 PNG（透明底，含阴影层）
++上层 意境特效 水墨粒子、飘落花瓣、流转剑气、灵兽虚影等动态元素 独立 Canvas 或 CSS 动画循环，与角色本体互动（如绕手指盘旋） CSS/Canvas 实时绘制 + 少量PNG光效
++
++技术实现：鼠标在卡牌上左右移动时，三层以不同速度（背景慢、角色中速、特效快）做 translateX 偏移，产生 “裸眼2.5D视差” 效果。
++
++二、稀有度对应的人物美术规格（逐级细化）
++
++2.1 R卡·逸品青玉 —— “墨线白描工笔”
++
++维度 规格说明
++画风 纯墨线勾勒 + 淡彩晕染（类似古代画谱），无复杂光影，以线条表现衣褶与气质
++动态 静态，无任何动画，仅靠CSS使人物微微“呼吸”（scale 1.0↔1.02，周期4秒）
++背景 纯色宣纸底纹（#F5F0E6）+ 淡淡墨迹渍染，无具体场景
++色彩 墨色为主，仅嘴唇/发带/剑穗等局部点染朱砂或石绿（单色点缀）
++尺寸比例 人物占卡面高度的 50%，居中偏下，留白较多（“疏可走马”的国画构图）
++特殊标记 卡面左下角盖一枚 “逸品·青玉” 朱砂印章
++
++视觉关键词：素雅、留白、线条感、文人画。
++
++2.2 SR卡·绝品紫金 —— “淡彩半动态工笔重彩”
++
++维度 规格说明
++画风 工笔重彩为基础，增加淡彩渐变与柔和光影，服饰有云纹/雷纹等精细装饰
++动态 局部逐帧动画（Spritesheet 或 CSS 关键帧）：衣袂/飘带/长发 3~5 个部件缓慢飘动（类似 Live2D 微动），眼睛有轻微眨眼（每6秒一次）
++背景 带有具体场景的淡彩水墨（如角色所在门派、洞府），饱和度较低以突出人物
++色彩 丰富且和谐，主色 + 辅色 + 点缀色（金/紫），遵循传统“随类赋彩”原则
++尺寸比例 人物占卡面高度的 65%，略微放大，展现更多服饰细节
++特殊标记 卡面左下角盖 “绝品·紫金” 烫印印章 + 底部有金色流沙动态光效
++
++视觉关键词：华丽、局部灵动、金紫辉映、服饰考究。
++
++2.3 SSR卡·至品彩凰 —— “全动态泼彩大写意”
++
++维度 规格说明
++画风 融合张大千式泼墨泼彩 + 现代数码厚涂，色彩绚丽炸裂，光影强烈，有“仙气弥漫”的辉光效果
++动态 全卡动态系统：人物呼吸起伏 + 衣袂飞舞 + 身后灵兽/法器虚影环绕 + 水墨粒子向四周散逸 + 专属背景水流/火焰/雷电实时粒子系统
++背景 专属超大场景（如蚩尤残魂→上古战场+九黎图腾，瑶池圣母→瑶池金母蟠桃盛会），且背景本身有云海翻涌/熔岩流动等动态
++色彩 高饱和撞色但维持国风调性（朱红撞石青、紫金配翠绿），色彩对比强烈，视觉冲击力拉满
++尺寸比例 人物占卡面高度的 75%，几乎撑满卡面，溢出边框的“破框”特效（部分衣袂/剑气冲出卡牌边界）
++特殊标记 右上角动态飘浮 “至品·彩凰” 金字篆书 + 七彩流光循环扫过全卡
++
++视觉关键词：炸裂、全动态、神仙气、破框张力。
++
++三、五大职业剪影识别设计（让定位一目了然）
++
++即使不读文字，玩家仅凭角色姿态+武器+服饰轮廓即可判断职业：
++
++职业 典型姿态 核心武器 服饰特征 色彩倾向
++剑修 侧身45°执剑，剑尖指地或斜指天，身形挺拔 长剑/飞剑（必有剑穗） 窄袖劲装，腰带束身，披风或飘带 金/白/青（锐利色）
++体修 正面站立，双臂微张，肌肉线条明显，下盘沉稳 拳套/巨盾/降魔杵 裸露手臂或肩甲厚重，短打+护心镜 土黄/赤红/玄黑（厚重色）
++丹修 单手托举药炉/玉瓶，另一手掐诀，姿态柔和 葫芦/药炉/玉净瓶 宽袍大袖，道袍或禅衣，多有飘带环绕 青绿/月白/琥珀（温润色）
++阵修 双手结印，周身悬浮灵符或阵法符文 符箓/阵旗/罗盘 道冠+法衣，绣有八卦/河图洛书纹样 紫/蓝/银灰（神秘色）
++符修 单手持符贴于身前，另一手两指并拢点向目标 黄纸符/朱砂笔/法印 头戴逍遥巾，身披鹤氅，腰间挂满符袋 朱红/明黄/赭石（法术色）
++
++原则：同一稀有度下，不同职业姿态差异大于颜色差异，确保缩略图（如编队小头像）也能一眼识别。
++
++四、角色交互反馈（点击/悬停/拖拽）
++
++交互动作 视觉反馈 触发条件
++悬停预览 角色微微转头（CSS 3D旋转 5°）+ 衣袂飘动加速 + 背景墨迹向外扩散一圈涟漪 鼠标悬停卡牌 > 0.3s
++点击选中 角色全身金光描边闪烁一次 + 底部浮现角色专属诗词一句（如“云鹤九霄外，仙踪不可寻”） 鼠标点击卡牌
++拖拽旋转 卡牌跟随鼠标拖动绕Y轴 -30°~30° 旋转，三层视差图层产生位移，产生“实物把玩”感 鼠标在卡面按下并拖动
++长按详情 角色从卡面“跃出”（放大至120%，叠加模糊背景），进入全屏沉浸预览模式 长按卡牌 1.5s
++升级/突破成功 角色全身被金色光柱笼罩，水墨粒子从底部冲天而起，屏幕微震 养成操作完成瞬间
++满好感度 角色立绘增加一层柔光+粉色花瓣环绕，表情（眼睛/嘴角）CSS微调为微笑 知音值达到满级
++
++五、立绘制作规范（给画师/AI出图的具体参数）
++
++为保证全卡风格统一且适配2.5D等距视角，所有角色立绘必须遵循以下画布标准：
++
++参数 规格
++画布尺寸 2048 × 1536 px（4:3 比例，便于裁剪为卡面）
++人物位置 人物腰部以下位于画布底部，头部位于画布上1/3处，左右居中
++视角 微俯视 15°（人物略低头或眼睛向下看），避免纯正面大头照
++背景透明 角色本体PNG必须为透明底，背景层单独绘制（便于分层视差）
++图层命名（PSD分层标准） body（躯干）、head（头部）、hair_front/back（前/后发）、arm_L/R（双臂）、weapon（武器）、accessory（配饰/飘带）——分7层导出，用于CSS分体动画（SR/SSR局部飘动）
++色彩模式 sRGB，注意中国风用色（避免荧光色、高饱和纯紫/纯粉）
++边缘处理 水墨晕染边缘（PNG边缘带微透明墨迹扩散，而非硬边裁切）
++
++AI出图提示词示例（Midjourney）：
++Chinese ink wash painting, Song dynasty style, half-body portrait of a Taoist female immortal in white robes, holding a jade bottle, light cyan and gold color scheme, ethereal, floating ribbons, looking down slightly, transparent background, detailed brushwork, masterpiece --ar 4:3
++
++六、编队/战斗中的角色微缩表现（2.5D战场）
++
++在2.5D战斗棋盘上，角色并非以完整立绘出现，而是采用 “皮影剪影+属性光晕” 模式：
++
++元素 设计说明
++角色形象 使用立绘的简化剪影版本（去除复杂背景，只保留人物轮廓+武器），填充颜色为该角色的五行代表色
++稀有度标识 剪影底部用对应稀有度的光环（青玉/紫金/彩凰光圈）旋转环绕
++选中高亮 当前出手角色剪影变为实体水墨质感（从剪影还原为带纹理的淡彩形象），结束后恢复剪影
++受击反馈 剪影震动 + 水墨碎片飞溅
++阵亡退场 剪影从底部向上“化为墨烟”消散
++
++此设计大幅降低战场渲染压力（无需渲染高清立绘），同时保持2.5D国风氛围。
++
++七、角色数据库字段补充（cards.json 扩展）
++
++为支持上述人物样式，每张卡牌数据需增加以下字段：
++
++```json
++{
++  "id": "SR001",
++  "name": "白鹤仙子",
++  // ... 原有字段 ...
++  "portrait": {
++    "layers": {
++      "bg": "assets/portraits/SR001_bg.webp",
++      "body": "assets/portraits/SR001_body.png",
++      "head": "assets/portraits/SR001_head.png",
++      "hair": "assets/portraits/SR001_hair.png",
++      "arm_L": "assets/portraits/SR001_armL.png",
++      "arm_R": "assets/portraits/SR001_armR.png",
++      "weapon": "assets/portraits/SR001_weapon.png"
++    },
++    "animations": {
++      "sway_parts": ["hair", "arm_R"],    // 飘动部件
++      "blink_interval": 6000               // 眨眼间隔(ms)
++    }
++  },
++  "silhouette_color": "#3B82F6",            // 五行战场剪影用色
++  "poem": "云鹤九霄外，仙踪不可寻",            // 点击浮现诗句
++  "voice_quote": "道友，可愿与我共饮一杯？"    // 预留语音文案
++}
++```
++
++八、增量开发清单（人物模块）
++
++任务 产出 工时
++制定15张卡的人物分层PSD/PNG（可先用AI跑+手动抠层） 美术资产 并行进行
++CSS角色分层视差引擎（三层联动、拖拽旋转） portrait3D.js 2天
++SR/SSR局部飘动动画系统（CSS关键帧驱动分层部件） animationSystem.js 2天
++SSR全动态粒子背景（Canvas水墨粒子流） inkParticles.js 2天
++战场剪影生成器（立绘→剪影→五行着色） silhouetteRenderer.js 1天
++交互反馈集成（悬停/点击/长按/养成特效） 整合到 cardDetail.js 1.5天
+diff --git a/apps/ling-xu-wen-jian-lu/scripts/logic-test.mjs b/apps/ling-xu-wen-jian-lu/scripts/logic-test.mjs
+index 6cad530..c836ca4 100644
+--- a/apps/ling-xu-wen-jian-lu/scripts/logic-test.mjs
++++ b/apps/ling-xu-wen-jian-lu/scripts/logic-test.mjs
+@@ -597,5 +597,45 @@ console.log('— battle events —');
+   void beforeLen;
+ }
+ 
++// ---------- 角色人物视觉系统（增量 第一~七节：分层立绘 / 职业剪影 / 诗词）----------
++console.log('— character portrait —');
++{
++  const {
++    CLASSES, classDef, silhouetteColor, poemOf,
++    RARITY_PORTRAIT, rarityPortrait, portraitConfig, portraitLayers,
++  } = await import(new URL('../src/config.js', import.meta.url).href);
++  ok(CLASSES.length === 5, '五大职业（剑/体/丹/阵/符）');
++  ok(new Set(CARDS.map((c) => c.cls)).size === 5, '卡牌覆盖全部 5 个职业');
++  ok(CARDS.every((c) => classDef(c.cls).weapon), '每张卡的职业均有核心武器');
++  // 数据字段（设计稿增量 七·cards.json 扩展）
++  ok(CARDS.every((c) => typeof c.poem === 'string' && c.poem.length > 0), '每张卡有专属诗词 poem');
++  ok(CARDS.every((c) => typeof c.voiceQuote === 'string' && c.voiceQuote.length > 0), '每张卡有语音文案 voiceQuote');
++  ok(CARDS.every((c) => /^#[0-9a-fA-F]{6}$/.test(c.silhouetteColor)), '每张卡有合法剪影色 silhouetteColor');
++  // 取色 / 取诗：优先卡牌字段，缺省回退五行色 / quote
++  ok(silhouetteColor(CARD_MAP.SR001) === CARD_MAP.SR001.silhouetteColor, 'silhouetteColor 读卡牌字段');
++  ok(silhouetteColor({ element: 'fire' }) === '#d4564f', 'silhouetteColor 缺省回退五行色');
++  ok(poemOf(CARD_MAP.SR001) === '云鹤九霄外，仙踪不可寻', 'poemOf 取白鹤仙子诗词');
++  ok(poemOf({ quote: 'Q' }) === 'Q', 'poemOf 缺省回退 quote');
++  // 稀有度美术规格：R 静态 / SR 局部 / SSR 全动态
++  ok(rarityPortrait('R').dynamic === 0 && rarityPortrait('SR').dynamic === 1 && rarityPortrait('SSR').dynamic === 2, '稀有度动态层级 0/1/2');
++  ok(rarityPortrait('SSR').particles === true && rarityPortrait('SSR').breakFrame === true, 'SSR 启用粒子背景 + 破框');
++  ok(rarityPortrait('R').inkline === true, 'R 启用墨线白描');
++  // 立绘分层 + 动画配置
++  const cfg = portraitConfig(CARD_MAP.SR001, 'SR');
++  ok(Object.keys(cfg.layers).length >= 7 && cfg.layers.weapon.endsWith('_weapon.png'), 'portraitConfig 含分层 PSD 命名（≥7 层）');
++  ok(cfg.animations.sway_parts.length >= 1, 'portraitConfig 派生飘动部件');
++  ok(cfg.animations.blink_interval === 6000, 'SR 眨眼间隔 6000ms');
++  ok(portraitConfig(CARD_MAP.SSR001, 'SSR').animations.blink_interval === 5000, 'SSR 眨眼间隔 5000ms');
++  ok(portraitConfig(CARD_MAP.R001, 'R').animations.blink_interval === 0, 'R 不眨眼（静态）');
++  ok(portraitLayers(CARD_MAP.R002).bg === 'assets/portraits/R002_bg.webp', 'portraitLayers 按卡牌 id 约定导出');
++  // 战斗 init 事件携带 cls + ref（供战场剪影渲染）
++  {
++    const specs = playerSpecsFrom((() => { const q = newPlayer(); ownCard(q, 'SR001'); setFormation(q, ['SR001', null, null, null, null]); return q; })());
++    const battle = createBattle(specs, makeEnemyFormation(100, 'fire', 'normal', makeRng(1)), makeRng(1));
++    const init = battle.events.find((e) => e.t === 'init' && e.side === 'player');
++    ok(init && init.cls === '丹修' && init.ref === 'SR001', 'init 事件携带职业 cls 与卡牌 ref');
++  }
++}
++
+ console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
+ process.exit(fail ? 1 : 0);
+diff --git a/apps/ling-xu-wen-jian-lu/src/config.js b/apps/ling-xu-wen-jian-lu/src/config.js
+index d32ebbf..931231d 100644
+--- a/apps/ling-xu-wen-jian-lu/src/config.js
++++ b/apps/ling-xu-wen-jian-lu/src/config.js
+@@ -250,6 +250,72 @@ export const BREAK_STONE = { metal: 'break_metal', wood: 'break_wood', water: 'b
+ // 五行 → 五行精华 id（化凡入圣用）
+ export const ESSENCE_STONE = { metal: 'essence_metal', wood: 'essence_wood', water: 'essence_water', fire: 'essence_fire', earth: 'essence_earth' };
+ 
++// ── 五大职业剪影（设计稿增量 第三节）──────────────────────────────────────────
++// 仅凭「姿态 + 武器 + 服饰轮廓」即可判断职业，缩略图也能一眼识别。
++// key：拉丁标识（用于 CSS 选择器）；weapon：核心武器 emoji；sway：可飘动部件。
++export const CLASSES = [
++  { id: '剑修', key: 'sword',    name: '剑修', weapon: '⚔️', pose: '侧身执剑', garment: '窄袖劲装·披风', color: '#c8a951', sway: ['hair', 'ribbon'] },
++  { id: '体修', key: 'body',     name: '体修', weapon: '🛡️', pose: '正面双臂微张', garment: '短打·护心镜', color: '#a17b4a', sway: ['arm_R'] },
++  { id: '丹修', key: 'alchemy',  name: '丹修', weapon: '⚗️', pose: '单手托炉', garment: '宽袍大袖·飘带', color: '#5fa85f', sway: ['ribbon', 'arm_L'] },
++  { id: '阵修', key: 'array',    name: '阵修', weapon: '🌀', pose: '双手结印', garment: '道冠·法衣', color: '#9B6BCC', sway: ['hair', 'ribbon'] },
++  { id: '符修', key: 'talisman', name: '符修', weapon: '📜', pose: '持符点指', garment: '鹤氅·符袋', color: '#C23B22', sway: ['ribbon', 'arm_R'] },
++];
++const CLASS_MAP = Object.fromEntries(CLASSES.map((c) => [c.id, c]));
++export function classDef(cls) { return CLASS_MAP[cls] || CLASSES[0]; }
++
++// 战场剪影用色（五行代表色），可被卡牌 silhouette_color 覆盖（设计稿增量 第六节）。
++export function silhouetteColor(card) {
++  if (card && card.silhouette_color) return card.silhouette_color;
++  const e = elDef(card && card.element);
++  return e ? e.color : '#9a8a72';
++}
++
++// 点击浮现的专属诗词（设计稿增量 第四节·点击选中）：缺省回退到角色 quote。
++export function poemOf(card) {
++  if (!card) return '';
++  return card.poem || card.quote || '';
++}
++
++// ── 稀有度人物美术规格（设计稿增量 第二节）──────────────────────────────────────
++// dynamic：动态层级（0 静态呼吸 / 1 局部飘动 / 2 全动态粒子）；
++// seal：左下角朱砂印章名；particles：是否启用 SSR 水墨粒子背景；breakFrame：破框特效。
++export const RARITY_PORTRAIT = {
++  R:   { dynamic: 0, seal: '逸品·青玉', inkline: true,  particles: false, breakFrame: false },
++  SR:  { dynamic: 1, seal: '绝品·紫金', inkline: false, particles: false, breakFrame: false },
++  SSR: { dynamic: 2, seal: '至品·彩凰', inkline: false, particles: true,  breakFrame: true },
++};
++export function rarityPortrait(rarity) { return RARITY_PORTRAIT[rarity] || RARITY_PORTRAIT.R; }
++
++// PSD 分层命名（body/head/hair/arm_L/arm_R/weapon/accessory）按卡牌 id 约定导出，
++// 供 CSS 分体动画逐层操控（设计稿增量 第五节）。无实图时由 portrait3D.js 程序化绘制。
++export function portraitLayers(card) {
++  const id = (card && card.id) || '';
++  const base = `assets/portraits/${id}`;
++  return {
++    bg: `${base}_bg.webp`,
++    body: `${base}_body.png`,
++    head: `${base}_head.png`,
++    hair: `${base}_hair.png`,
++    arm_L: `${base}_armL.png`,
++    arm_R: `${base}_armR.png`,
++    weapon: `${base}_weapon.png`,
++    accessory: `${base}_accessory.png`,
++  };
++}
++// 角色立绘动画配置：飘动部件取自职业，眨眼间隔随稀有度递减（越稀有越灵动）。
++export function portraitConfig(card, rarity) {
++  const cls = classDef(card && card.cls);
++  const rp = rarityPortrait(rarity || (card && card.rarity));
++  return {
++    layers: portraitLayers(card),
++    animations: {
++      sway_parts: cls.sway.slice(),
++      blink_interval: rp.dynamic >= 2 ? 5000 : rp.dynamic >= 1 ? 6000 : 0,
++      dynamic: rp.dynamic,
++    },
++  };
++}
++
+ // ── 起始资源（新档）─────────────────────────────────────────────────────────────
+ export const START_RESOURCES = {
+   lingshi: 3000,
+diff --git a/apps/ling-xu-wen-jian-lu/src/core/battle.js b/apps/ling-xu-wen-jian-lu/src/core/battle.js
+index 8f61fa3..9b9c8b3 100644
+--- a/apps/ling-xu-wen-jian-lu/src/core/battle.js
++++ b/apps/ling-xu-wen-jian-lu/src/core/battle.js
+@@ -27,6 +27,7 @@ export function buildCombatant(spec, side, pos) {
+     name: spec.name || '无名',
+     element: spec.element || null,
+     role: spec.role || 'dps',
++    cls: spec.cls || null,
+     baseAtk: s.atk, baseDef: s.def, baseSpd: s.spd,
+     maxHp: Math.max(1, Math.round(s.hp)), hp: Math.max(1, Math.round(s.hp)),
+     baseCrit: 0.05,
+@@ -75,7 +76,7 @@ export function playerSpecsFrom(player) {
+     const def = cardDef(id);
+     if (!def) continue;
+     out.push({
+-      ref: id, name: def.name, element: def.element, role: def.role,
++      ref: id, name: def.name, element: def.element, role: def.role, cls: def.cls,
+       stats: instanceStats(inst), actives: def.actives, passives: def.passives,
+       skillMult: skillMult(inst),
+     });
+@@ -105,7 +106,7 @@ export function createBattle(playerSpecs, enemySpecs, rng) {
+   const events = [];
+   // 初始化事件：把所有参战单位及其初始面板喂给动画回放器。
+   for (const c of [...players, ...enemies]) {
+-    events.push({ t: 'init', side: c.side, pos: c.pos, name: c.name, element: c.element, role: c.role, hp: c.hp, maxHp: c.maxHp, isBoss: !!c.isBoss });
++    events.push({ t: 'init', side: c.side, pos: c.pos, name: c.name, element: c.element, role: c.role, cls: c.cls, ref: c.ref, hp: c.hp, maxHp: c.maxHp, isBoss: !!c.isBoss });
+   }
+   return {
+     players, enemies,
+diff --git a/apps/ling-xu-wen-jian-lu/src/data/cards.js b/apps/ling-xu-wen-jian-lu/src/data/cards.js
+index 765d3bd..ff32974 100644
+--- a/apps/ling-xu-wen-jian-lu/src/data/cards.js
++++ b/apps/ling-xu-wen-jian-lu/src/data/cards.js
+@@ -34,6 +34,9 @@ export const CARDS = [
+     passives: [],
+     story: '青云山外门的执剑童子，以竹为剑，招式朴素却暗合剑理。',
+     quote: '一竹一剑，亦可问道。',
++    poem: '青竹三尺剑，问道一峰云',
++    voiceQuote: '师弟，今日剑谱可练熟了？',
++    silhouetteColor: '#5fa85f',
+   },
+   {
+     id: 'R002', name: '赤焰灵狐', rarity: 'R', element: 'fire', cls: '符修',
+@@ -43,6 +46,9 @@ export const CARDS = [
+     passives: [],
+     story: '生于赤焰峡谷的灵狐，尾火不熄，灼敌于无形。',
+     quote: '可别被我的尾巴燎到了。',
++    poem: '尾火燃千岭，灵狐过九原',
++    voiceQuote: '嘻，别踩到我的尾巴哦。',
++    silhouetteColor: '#d4564f',
+   },
+   {
+     id: 'R003', name: '玄龟甲士', rarity: 'R', element: 'water', cls: '体修',
+@@ -52,6 +58,9 @@ export const CARDS = [
+     passives: [],
+     story: '寒潭深处的玄龟一族，背甲坚逾玄铁，世代为阵前盾卫。',
+     quote: '有我在，谁也越不过此阵。',
++    poem: '玄甲沉渊底，一盾定江山',
++    voiceQuote: '阵在我前，谁敢越雷池？',
++    silhouetteColor: '#4a90c2',
+   },
+   {
+     id: 'R004', name: '金戈锐士', rarity: 'R', element: 'metal', cls: '剑修',
+@@ -60,6 +69,9 @@ export const CARDS = [
+     passives: [],
+     story: '金戈铁壁的守关锐士，一柄长戈可破百甲。',
+     quote: '破阵，只在须臾。',
++    poem: '金戈横大漠，一破百甲开',
++    voiceQuote: '破阵只在须臾，你看好了。',
++    silhouetteColor: '#c8a951',
+   },
+   {
+     id: 'R005', name: '厚土力士', rarity: 'R', element: 'earth', cls: '体修',
+@@ -69,6 +81,9 @@ export const CARDS = [
+     passives: [],
+     story: '地煞迷宫中修土行的大汉，一步撼地，万夫迟滞。',
+     quote: '大地，皆为我臂助。',
++    poem: '厚土承千钧，撼地万夫迟',
++    voiceQuote: '脚下这片地，都听我的。',
++    silhouetteColor: '#a17b4a',
+   },
+   {
+     id: 'R006', name: '柳叶医仙', rarity: 'R', element: 'wood', cls: '丹修',
+@@ -77,6 +92,9 @@ export const CARDS = [
+     passives: [],
+     story: '万木回廊采药的医仙，以柳叶为针，回春续命。',
+     quote: '且安心，伤可愈。',
++    poem: '柳叶为针细，回春续寸心',
++    voiceQuote: '且安心，伤总能好的。',
++    silhouetteColor: '#5fa85f',
+   },
+   {
+     id: 'R007', name: '流火散修', rarity: 'R', element: 'fire', cls: '剑修',
+@@ -85,6 +103,9 @@ export const CARDS = [
+     passives: [],
+     story: '游历四方的散修剑客，剑走偏锋，烈焰裹刃。',
+     quote: '我的剑，烫得很。',
++    poem: '流火焚长夜，孤剑走天涯',
++    voiceQuote: '我这剑烫得很，小心些。',
++    silhouetteColor: '#d4564f',
+   },
+   {
+     id: 'R008', name: '霜月散修', rarity: 'R', element: 'water', cls: '符修',
+@@ -94,6 +115,9 @@ export const CARDS = [
+     passives: [],
+     story: '寒潭月下修符的散修，一咒凝冰，封敌于瞬。',
+     quote: '且在这霜寒中静一静。',
++    poem: '霜月凝寒露，一符锁千秋',
++    voiceQuote: '在这霜寒里，静一静吧。',
++    silhouetteColor: '#4a90c2',
+   },
+   {
+     id: 'R009', name: '飞羽散修', rarity: 'R', element: 'metal', cls: '阵修',
+@@ -103,6 +127,9 @@ export const CARDS = [
+     passives: [],
+     story: '布阵如飞的散修道人，一聚灵，全队锋芒更盛。',
+     quote: '灵气已聚，放手施为。',
++    poem: '飞羽布灵阵，一气聚锋芒',
++    voiceQuote: '灵气已聚，放手施为便是。',
++    silhouetteColor: '#c8a951',
+   },
+ 
+   // ── SR 卡（4）绝品·紫金 ──────────────────────────────────────────────────────
+@@ -117,6 +144,9 @@ export const CARDS = [
+     passives: [{ kind: 'heal_in', amount: 0.15 }], // 鹤羽护体：受治疗 +15%
+     story: '云鹤化形的仙子，仙羽轻拂，百病皆消。',
+     quote: '愿这甘霖，洗净诸般苦厄。',
++    poem: '云鹤九霄外，仙踪不可寻',
++    voiceQuote: '道友，可愿与我共饮一杯？',
++    silhouetteColor: '#4a90c2',
+   },
+   {
+     id: 'SR002', name: '赤霄剑尊', rarity: 'SR', element: 'fire', cls: '剑修',
+@@ -128,6 +158,9 @@ export const CARDS = [
+     passives: [{ kind: 'crit', amount: 0.10 }], // 剑心通明：暴击率 +10%
+     story: '执赤霄神剑的剑道尊者，九式连环，星火燎原。',
+     quote: '剑出赤霄，万里燎原。',
++    poem: '赤霄横万里，一剑燎中原',
++    voiceQuote: '剑出赤霄，便无回头之路。',
++    silhouetteColor: '#d4564f',
+   },
+   {
+     id: 'SR003', name: '玄冥蛇姬', rarity: 'SR', element: 'earth', cls: '符修',
+@@ -141,6 +174,9 @@ export const CARDS = [
+     passives: [{ kind: 'thorns', amount: 0.15 }], // 蛇鳞反噬：受击反伤 15%
+     story: '玄冥深处的蛇姬，一瞥石化，毒雾蚀骨。',
+     quote: '与我斗，先问问我的鳞。',
++    poem: '玄冥蛇影晦，毒雾蚀枯骨',
++    voiceQuote: '与我斗？先问过我的鳞。',
++    silhouetteColor: '#a17b4a',
+   },
+   {
+     id: 'SR004', name: '青莲道尊', rarity: 'SR', element: 'wood', cls: '阵修',
+@@ -154,6 +190,9 @@ export const CARDS = [
+     passives: [{ kind: 'resist', amount: 0.20 }], // 道法自然：效果抵抗 +20%
+     story: '青莲峰上的道尊，一念成阵，万法自然。',
+     quote: '道法自然，何须强求。',
++    poem: '青莲生一念，万法自成阵',
++    voiceQuote: '道法自然，何须强求。',
++    silhouetteColor: '#5fa85f',
+   },
+ 
+   // ── SSR 卡（2）至品·彩凰 ─────────────────────────────────────────────────────
+@@ -173,6 +212,9 @@ export const CARDS = [
+     ],
+     story: '上古兵主蚩尤的一缕残魂，重聚九黎战意，所向披靡。',
+     quote: '吾乃九黎之主，战魂不灭！',
++    poem: '九黎图腾起，战魂燃苍穹',
++    voiceQuote: '吾乃九黎之主，战魂不灭！',
++    silhouetteColor: '#d4564f',
+   },
+   {
+     id: 'SSR002', name: '瑶池圣母', rarity: 'SSR', element: 'water', cls: '丹修',
+@@ -190,6 +232,9 @@ export const CARDS = [
+     ],
+     story: '瑶池之主，慈航普度，一滴仙露可活白骨。',
+     quote: '天泽万物，生生不息。',
++    poem: '瑶池金母降，一滴活白骨',
++    voiceQuote: '天泽万物，生生不息。',
++    silhouetteColor: '#4a90c2',
+   },
+ ];
+ 
+diff --git a/apps/ling-xu-wen-jian-lu/src/ui/animationSystem.js b/apps/ling-xu-wen-jian-lu/src/ui/animationSystem.js
+new file mode 100644
+index 0000000..3bc6bce
+--- /dev/null
++++ b/apps/ling-xu-wen-jian-lu/src/ui/animationSystem.js
+@@ -0,0 +1,44 @@
++// ============================================================================
++// 灵墟·问剑录 · SR/SSR 局部飘动动画系统（设计稿增量 第二节 2.2/2.3 / 第八节 animationSystem）
++//
++// 按稀有度挂载不同动态层级（由 portrait3D.js 调用）：
++//   R  （dynamic 0）：仅 CSS「呼吸」缩放，无逐帧动画。
++//   SR （dynamic 1）：衣袂 / 飘带 / 长发等部件 CSS 关键帧缓慢飘动 + 每 6s 眨眼一次。
++//   SSR（dynamic 2）：部件飘动更剧烈 + 每 5s 眨眼 + 悬停时整体加速（由 portrait3D 切 class）。
++//
++// 飘动完全由 CSS 关键帧驱动（.portrait__card.is-anim 与 .part-* 类），
++// 这里只负责：① 给卡面打上动态等级标记；② 驱动眨眼定时器（需 JS，因为要短暂合眼）。
++// 返回 { destroy }：清理眨眼定时器。jsdom 等无 eyes 的环境安全降级。
++// ============================================================================
++import { portraitConfig } from '../config.js';
++
++// opts: { blinkEyes: <HTMLElement|null> }
++export function attachAnimations(cardEl, card, rarity, opts = {}) {
++  if (!cardEl) return { destroy() {}, setHover() {} };
++  const cfg = portraitConfig(card, rarity);
++  const dynamic = cfg.animations.dynamic;
++  // 动态等级标记：CSS 据 .dyn-1 / .dyn-2 启用不同强度的关键帧。
++  cardEl.classList.remove('dyn-0', 'dyn-1', 'dyn-2', 'is-anim');
++  cardEl.classList.add(`dyn-${dynamic}`, 'is-anim');
++
++  const eyes = opts && opts.blinkEyes ? opts.blinkEyes : null;
++  const interval = cfg.animations.blink_interval || 0;
++  const timers = [];
++
++  // 眨眼：仅 SR/SSR 启用（interval > 0）；周期性给眼睛加 .blink（合眼 ~150ms）。
++  if (eyes && interval > 0) {
++    const id = setInterval(() => {
++      if (!eyes.parentNode) return;
++      eyes.classList.add('blink');
++      const t = setTimeout(() => eyes.classList.remove('blink'), 150);
++      timers.push(t);
++    }, interval);
++    timers.push(id);
++  }
++
++  return {
++    // 悬停 / 失焦时由 portrait3D 调用，整体加快飘动（CSS 据 .is-hover 缩短动画时长）。
++    setHover(on) { cardEl.classList.toggle('is-hover', !!on); },
++    destroy() { for (const t of timers) { clearTimeout(t); clearInterval(t); } },
++  };
++}
+diff --git a/apps/ling-xu-wen-jian-lu/src/ui/app.js b/apps/ling-xu-wen-jian-lu/src/ui/app.js
+index c89d2a8..4ffd302 100644
+--- a/apps/ling-xu-wen-jian-lu/src/ui/app.js
++++ b/apps/ling-xu-wen-jian-lu/src/ui/app.js
+@@ -44,6 +44,7 @@ import {
+ } from '../core/save.js';
+ import { makeRng } from '../core/rng.js';
+ import { BattleScene } from './battle-scene.js';
++import { Portrait3D } from './portrait3D.js';
+ 
+ const TABS = [
+   { key: 'lineup', icon: '⚔️', label: '阵容' },
+@@ -88,6 +89,7 @@ export class GameUI {
+ 
+   destroy() {
+     if (this._battleScene) { this._battleScene.destroy(); this._battleScene = null; }
++    if (this._portrait) { try { this._portrait.destroy(); } catch (_) {} this._portrait = null; }
+     this.stopLoop();
+     if (this._detachKeyboard) this._detachKeyboard();
+     try { document.removeEventListener('visibilitychange', this._onVis); } catch (_) {}
+@@ -265,6 +267,8 @@ export class GameUI {
+   }
+ 
+   renderTab() {
++    // 重建内容前先拆解上一张卡的视差引擎（rAF / canvas / 定时器），避免跨刷新累积泄漏。
++    if (this._portrait) { try { this._portrait.destroy(); } catch (_) {} this._portrait = null; }
+     clear(this.contentEl);
+     switch (this.tab) {
+       case 'lineup': return this.renderLineup();
+@@ -450,45 +454,24 @@ export class GameUI {
+     this.contentEl.append(picker, h('div', { class: 'cult-3d-wrap' }, stage, statsPanel), tabBar, detail);
+   }
+ 
+-  // 2.5D 卡牌展示区：perspective 立体卡 + 拖拽旋转 + 点击水墨涟漪（设计稿增量 1.3）
++  // 2.5D 卡牌展示区：三叠层视差立绘 + 悬停 / 点击 / 拖拽 / 长按交互（设计稿增量 一/四）。
++  // 由 Portrait3D 引擎渲染；展示区随养成成功触发 celebrate() 庆祝特效。
+   buildCardStage(def, inst, r) {
+-    const wrap = h('div', { class: 'cult-3d' });
+-    const card = h('div', {
+-      class: `cult-3d__card ${r.short === 'SSR' || inst.evo ? 'glow' : ''}`,
+-      style: {
+-        background: `linear-gradient(160deg, ${r.color}, ${shade(r.color, -0.25)})`,
+-        border: `2px solid ${r.short === 'SSR' ? '#D4A04A' : 'rgba(255,255,255,0.4)'}`,
+-      },
+-    },
+-      h('div', { class: 'cult-3d__art' }, elEmoji(def.element)),
+-      h('div', { class: 'cult-3d__name' }, def.name),
+-      h('div', { class: 'cult-3d__sub' }, `${r.short} · ${elName(def.element)}${def.cls}`),
+-      h('div', { class: 'cult-3d__sub' }, `${'★'.repeat(inst.star)}${'☆'.repeat(Math.max(0, 9 - inst.star))}`),
+-    );
+-    wrap.appendChild(card);
+-    // 拖拽旋转：pointerdown 时捕获指针，后续 move/up 均派发到 wrap 本身，
+-    // 避免向 window 注册监听造成跨刷新累积泄漏。
+-    let dragging = false; let startX = 0; let rotY = 18;
+-    const clientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);
+-    wrap.addEventListener('pointerdown', (e) => {
+-      dragging = true; startX = clientX(e);
+-      try { if (wrap.setPointerCapture && e.pointerId != null) wrap.setPointerCapture(e.pointerId); } catch (_) {}
+-    });
+-    wrap.addEventListener('pointermove', (e) => {
+-      if (!dragging) return;
+-      rotY = 18 + Math.max(-50, Math.min(50, (clientX(e) - startX) * 0.4));
+-      card.style.transform = `rotateX(12deg) rotateY(${rotY}deg)`;
++    if (this._portrait) { try { this._portrait.destroy(); } catch (_) {} this._portrait = null; }
++    const portrait = new Portrait3D({
++      card: def,
++      instance: inst,
++      rarity: effectiveRarity(inst),
++      onPoem: (text) => this.toast(text),
+     });
+-    wrap.addEventListener('pointerup', () => { dragging = false; });
+-    wrap.addEventListener('pointercancel', () => { dragging = false; });
+-    // 点击水墨涟漪
+-    wrap.addEventListener('click', () => {
+-      const rip = h('span', { class: 'cult-3d__ripple' });
+-      rip.style.left = '50%'; rip.style.top = '50%'; rip.style.transform = 'translate(-50%, -50%)';
+-      wrap.appendChild(rip);
+-      setTimeout(() => { if (rip.parentNode) rip.parentNode.removeChild(rip); }, 720);
+-    });
+-    return wrap;
++    this._portrait = portrait;
++    return portrait.mount();
++  }
++
++  // 养成成功庆祝：金光柱 + 冲天墨粒 + 微震（设计稿增量 四·升级/突破成功）。
++  // 须在 afterAction()（重建卡面）之后调用，使特效落到新渲染的卡面上。
++  _celebrate() {
++    if (this._portrait) { try { this._portrait.celebrate(); } catch (_) {} }
+   }
+ 
+   // 修炼子页：升级 + 突破
+@@ -658,13 +641,15 @@ export class GameUI {
+   doFeedPill(inst, pillId) {
+     const r = feedPill(this.player, inst, pillId, 1);
+     if (!r.ok) { this.toast(r.reason); return; }
++    const leveled = (r.logs || []).some((l) => l.kind === 'level');
+     for (const l of (r.logs || [])) if (l.kind === 'level') this.toast(l.text);
+     this.afterAction();
++    if (leveled) this._celebrate();
+   }
+-  doBreak(inst) { const r = doBreakThrough(this.player, inst); if (!r.ok) this.toast(r.reason); else this.toast(r.text); this.afterAction(); }
+-  doStar(inst) { const r = doStarUp(this.player, inst); if (!r.ok) this.toast(r.reason); else this.toast(r.text); this.afterAction(); }
++  doBreak(inst) { const r = doBreakThrough(this.player, inst); if (!r.ok) this.toast(r.reason); else this.toast(r.text); this.afterAction(); if (r.ok) this._celebrate(); }
++  doStar(inst) { const r = doStarUp(this.player, inst); if (!r.ok) this.toast(r.reason); else this.toast(r.text); this.afterAction(); if (r.ok) this._celebrate(); }
+   doSkill(inst) { const r = doSkillUp(this.player, inst); if (!r.ok) this.toast(r.reason); else this.toast(r.text); this.afterAction(); }
+-  doEvolve(inst) { const r = doEvolve(this.player, inst); if (!r.ok) this.toast(r.reason); else { this.toast(r.text); } this.afterAction(); }
++  doEvolve(inst) { const r = doEvolve(this.player, inst); if (!r.ok) this.toast(r.reason); else { this.toast(r.text); } this.afterAction(); if (r.ok) this._celebrate(); }
+   doGift(inst) { const r = doGift(this.player, inst); if (!r.ok) this.toast(r.reason); else this.toast(r.text); this.afterAction(); }
+   doTea(def, inst) {
+     const al = affinityLevel(inst.affinity);
+@@ -1020,15 +1005,6 @@ function targetLabel(t) {
+   const map = { enemy_one: '敌方单体', enemy_all: '敌方全体', ally_lowest: '最低血盟友', ally_all: '我方全体', self: '自身' };
+   return map[t] || t;
+ }
+-// 颜色加深 / 变亮（amt 负数加深，正数变亮）——用于 2.5D 卡牌渐变底色
+-function shade(hex, amt) {
+-  if (!hex || hex[0] !== '#') return hex || '#333';
+-  const n = hex.length === 4
+-    ? hex.slice(1).split('').map((c) => parseInt(c + c, 16))
+-    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
+-  const f = (v) => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
+-  return `rgb(${f(n[0])}, ${f(n[1])}, ${f(n[2])})`;
+-}
+ function cn(n) { return ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾', '拾壹', '拾贰'][n] || String(n); }
+ function copyText(text) {
+   try {
+diff --git a/apps/ling-xu-wen-jian-lu/src/ui/battle-scene.js b/apps/ling-xu-wen-jian-lu/src/ui/battle-scene.js
+index 169b720..615917d 100644
+--- a/apps/ling-xu-wen-jian-lu/src/ui/battle-scene.js
++++ b/apps/ling-xu-wen-jian-lu/src/ui/battle-scene.js
+@@ -10,6 +10,7 @@
+ import { h, clear, bar } from './dom.js';
+ import { elEmoji, resName, resEmoji } from '../config.js';
+ import { cardDef } from '../data/cards.js';
++import { renderSilhouette } from './silhouetteRenderer.js';
+ 
+ const EL_COLOR = { metal: '#c8a951', wood: '#5fa85f', water: '#4a90c2', fire: '#d4564f', earth: '#a17b4a', none: '#9a8a72' };
+ 
+@@ -102,12 +103,16 @@ export class BattleScene {
+     }
+     const floatLayer = h('div', { class: 'bs-unit__float' });
+     const hpBar = bar(data.hp, data.maxHp, { class: 'bs-hp', color: side === 'player' ? '' : '#d4564f' });
++    // 我方真实卡牌 → 皮影剪影 + 属性光晕（设计稿增量 第六节）；敌方仍用五行 emoji 头像。
++    const playerCard = side === 'player' && data.ref ? cardDef(data.ref) : null;
++    const art = h('div', { class: 'bs-unit__art', style: { background: hexA(EL_COLOR[data.element], 0.16) } },
++      playerCard ? renderSilhouette(playerCard, playerCard.rarity) : (elEmoji(data.element) || '✦'));
+     const el = h('div', {
+       class: `bs-unit bs-unit--${side} ${data.isBoss ? 'bs-unit--boss' : ''}`,
+       dataset: { side, pos: String(pos) },
+       style: { borderColor: EL_COLOR[data.element] || '#9a8a72' },
+     },
+-      h('div', { class: 'bs-unit__art', style: { background: hexA(EL_COLOR[data.element], 0.16) } }, elEmoji(data.element) || '✦'),
++      art,
+       h('div', { class: 'bs-unit__name' }, data.name),
+       hpBar,
+       floatLayer,
+diff --git a/apps/ling-xu-wen-jian-lu/src/ui/inkParticles.js b/apps/ling-xu-wen-jian-lu/src/ui/inkParticles.js
+new file mode 100644
+index 0000000..eaa4ac5
+--- /dev/null
++++ b/apps/ling-xu-wen-jian-lu/src/ui/inkParticles.js
+@@ -0,0 +1,165 @@
++// ============================================================================
++// 灵墟·问剑录 · SSR 全动态水墨粒子背景（设计稿增量 第二节 2.3 / 第八节 inkParticles）
++//
++// 两套能力：
++//   createInkStream(canvas, opts) —— SSR 卡面背景的常驻水墨粒子流（缓慢上浮 / 飘散）。
++//   burstInk(hostEl, color, opts) —— 一次性「冲天墨粒」爆裂（升级 / 突破成功时从底部冲起）。
++//
++// 纯 Canvas 2D 实现。在无 2D 上下文的环境（jsdom 冒烟、降级浏览器）下安全降级为空操作，
++// 不抛异常、不启动 rAF 循环，避免在测试环境里失控。
++// ============================================================================
++
++const RAF = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (fn) => setTimeout(fn, 16);
++const CAF = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : (id) => clearTimeout(id);
++
++// 解析 #RRGGBB / #RGB 为 [r,g,b]；非法色回退墨色。
++function parseColor(hex) {
++  if (!hex || typeof hex !== 'string' || hex[0] !== '#') return [44, 24, 16];
++  const n = hex.length === 4
++    ? hex.slice(1).split('').map((c) => parseInt(c + c, 16))
++    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
++  return n.some((x) => Number.isNaN(x)) ? [44, 24, 16] : n;
++}
++
++// 一个水墨粒子：位置 / 速度 / 半径 / 生命 / 颜色。
++function spawn(w, h, color, opts = {}) {
++  const [r, g, b] = color;
++  const baseR = opts.radius || (2 + Math.random() * 4);
++  return {
++    x: Math.random() * w,
++    y: opts.fromBottom ? h + baseR : Math.random() * h,
++    vx: (Math.random() - 0.5) * (opts.drift || 0.3),
++    vy: opts.fromBottom ? -(0.5 + Math.random() * 1.4) : -(0.1 + Math.random() * 0.4),
++    r: baseR,
++    life: 1,
++    decay: opts.decay || (0.002 + Math.random() * 0.004),
++    rgb: [r, g, b],
++  };
++}
++
++// —— 常驻水墨粒子流（SSR 卡面背景）——————————————————————————————
++// opts: { color, density }  density 控制同时存活粒子数（默认 26）。
++export function createInkStream(canvas, opts = {}) {
++  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
++  if (!canvas || !ctx) return { burst() {}, resize() {}, destroy() {} };
++  const color = parseColor(opts.color || '#D4A04A');
++  const density = Math.max(6, opts.density || 26);
++  let parts = [];
++  let w = 0, h = 0;
++  let raf = 0;
++  let running = true;
++
++  function resize() {
++    const rect = canvas.getBoundingClientRect();
++    // 退化为 attribute 尺寸；仍无尺寸则跳过绘制。
++    w = rect.width || parseFloat(canvas.getAttribute('width')) || canvas.clientWidth || 0;
++    h = rect.height || parseFloat(canvas.getAttribute('height')) || canvas.clientHeight || 0;
++    canvas.width = Math.max(1, Math.round(w));
++    canvas.height = Math.max(1, Math.round(h));
++    // 按密度补齐粒子
++    while (parts.length < density) parts.push(spawn(w || 120, h || 160, color));
++  }
++  resize();
++
++  function frame() {
++    if (!running) return;
++    ctx.clearRect(0, 0, w, h);
++    for (let i = 0; i < parts.length; i++) {
++      const p = parts[i];
++      p.x += p.vx; p.y += p.vy; p.life -= p.decay;
++      if (p.life <= 0 || p.y + p.r < -4) { parts[i] = spawn(w, h, color); continue; }
++      const a = Math.max(0, Math.min(0.5, p.life * 0.5));
++      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2);
++      grd.addColorStop(0, `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${a})`);
++      grd.addColorStop(1, `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},0)`);
++      ctx.fillStyle = grd;
++      ctx.beginPath();
++      ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
++      ctx.fill();
++    }
++    raf = RAF(frame);
++  }
++  raf = RAF(frame);
++
++  return {
++    // 从底部冲起一波短命粒子（升级 / 突破成功），与常驻流叠加。
++    burst() {
++      for (let i = 0; i < Math.min(40, density); i++) {
++        parts.push(spawn(w || 120, h || 160, color, { fromBottom: true, decay: 0.012 + Math.random() * 0.01 }));
++      }
++      // 防止粒子无限堆积：超过 3 倍密度时回收最老的一批。
++      if (parts.length > density * 3) parts = parts.slice(-density * 2);
++    },
++    resize,
++    destroy() {
++      running = false;
++      if (raf) CAF(raf);
++      raf = 0;
++    },
++  };
++}
++
++// —— 一次性「冲天墨粒」爆裂（非 SSR 卡也可用）————————————————————————
++// 在 hostEl 上临时盖一层 canvas，粒子从底部冲天而起，约 dur ms 后自毁。
++// opts: { color, count, dur }
++export function burstInk(hostEl, color, opts = {}) {
++  if (!hostEl || !hostEl.ownerDocument) return;
++  const doc = hostEl.ownerDocument;
++  const canvas = doc.createElement('canvas');
++  canvas.className = 'portrait__burst';
++  hostEl.appendChild(canvas);
++  const ctx = canvas.getContext && canvas.getContext('2d');
++  if (!ctx) { // 无 2D 上下文：留一个光柱占位后清理，保证视觉有反馈。
++    setTimeout(() => { if (canvas.parentNode) canvas.parentNode.removeChild(canvas); }, opts.dur || 900);
++    return { destroy() {} };
++  }
++  const rect = hostEl.getBoundingClientRect();
++  const w = rect.width || 130, h = rect.height || 180;
++  canvas.width = Math.max(1, Math.round(w));
++  canvas.height = Math.max(1, Math.round(h));
++  const rgb = parseColor(color || '#D4A04A');
++  const count = opts.count || 36;
++  const dur = opts.dur || 900;
++  const parts = [];
++  for (let i = 0; i < count; i++) {
++    parts.push({
++      x: w * (0.2 + Math.random() * 0.6),
++      y: h + 4,
++      vx: (Math.random() - 0.5) * 1.6,
++      vy: -(1.5 + Math.random() * 3.0),
++      r: 2 + Math.random() * 4,
++      life: 1,
++      decay: 0.010 + Math.random() * 0.012,
++    });
++  }
++  const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
++  let raf = 0; let running = true;
++  function frame() {
++    if (!running) return;
++    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
++    const t = now - start;
++    ctx.clearRect(0, 0, w, h);
++    for (const p of parts) {
++      p.x += p.vx; p.y += p.vy; p.vy += 0.02; p.life -= p.decay;
++      if (p.life <= 0) continue;
++      const a = Math.max(0, p.life * 0.6);
++      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2);
++      grd.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`);
++      grd.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
++      ctx.fillStyle = grd;
++      ctx.beginPath();
++      ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
++      ctx.fill();
++    }
++    if (t < dur) raf = RAF(frame);
++    else { running = false; if (canvas.parentNode) canvas.parentNode.removeChild(canvas); }
++  }
++  raf = RAF(frame);
++  return {
++    destroy() {
++      running = false;
++      if (raf) CAF(raf);
++      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
++    },
++  };
++}
+diff --git a/apps/ling-xu-wen-jian-lu/src/ui/portrait3D.js b/apps/ling-xu-wen-jian-lu/src/ui/portrait3D.js
+new file mode 100644
+index 0000000..8dc823a
+--- /dev/null
++++ b/apps/ling-xu-wen-jian-lu/src/ui/portrait3D.js
+@@ -0,0 +1,312 @@
++// ============================================================================
++// 灵墟·问剑录 · CSS 角色分层视差引擎（设计稿增量 第一节 / 第八节 portrait3D）
++//
++// 把卡面拆为「三叠层」做裸眼 2.5D 视差（设计稿增量 一）：
++//   ┌ 前景层·特效（.portrait__fx） 水墨粒子 / 流光 / 飘落花瓣（最快）
++//   │   ┌ 角色层·本体（.portrait__char） 程序化立绘：头 / 袍服 / 武器 / 飘动部件（中速）
++//   │   │   ┌ 背景层·意境（.portrait__bg） 水墨山水 / 门派洞府场景（最慢）
++//
++// 角色本体按职业（剑/体/丹/阵/符）程序化绘制，剪影 + 武器轮廓即可识别职业；
++// 稀有度决定动态层级（R 呼吸 / SR 局部飘动 / SSR 全动态粒子 + 破框）。
++//
++// 交互（设计稿增量 四）：
++//   悬停预览：角色微转头 + 飘动加速 + 背景墨迹涟漪；
++//   点击选中：金光描边闪烁 + 底部浮现专属诗词；
++//   拖拽旋转：卡牌绕 Y 轴 ±30° 旋转，三层视差位移；
++//   长按详情：角色「跃出」放大至 120%，进入全屏沉浸预览。
++// 养成反馈（设计稿增量 四·升级/突破成功）：celebrate() 金色光柱 + 冲天水墨粒子 + 微震。
++// ============================================================================
++import { h } from './dom.js';
++import {
++  elEmoji, elName, rarityDef, classDef, silhouetteColor, poemOf,
++  rarityPortrait, affinityLevel, AFFINITY_MAX,
++} from '../config.js';
++import { attachAnimations } from './animationSystem.js';
++import { createInkStream, burstInk } from './inkParticles.js';
++
++// 三层视差速率：背景慢、角色中、特效快（设计稿增量 一·技术实现）。
++const LAYER_SPEED = { bg: 0.25, char: 0.55, fx: 0.95 };
++
++export class Portrait3D {
++  // opts: { card, instance, rarity, onPoem }
++  constructor(opts = {}) {
++    this.card = opts.card;
++    this.instance = opts.instance || {};
++    this.onPoem = opts.onPoem || (() => {});
++    this.rarity = opts.rarity || (this.card && this.card.rarity) || 'R';
++    this._dead = false;
++    this._anim = null;
++    this._stream = null;
++    this._bursts = [];
++    this._timers = [];
++    this._immersive = null;
++    this._holdTimer = null;
++  }
++
++  mount() {
++    const def = this.card;
++    const r = rarityDef(this.rarity);
++    const rp = rarityPortrait(this.rarity);
++    const cls = classDef(def.cls);
++    const sil = silhouetteColor(def);
++    const aff = (this.instance.affinity || 0);
++    const maxAff = aff >= AFFINITY_MAX;
++
++    // —— 三叠层 ——
++    this.bg = h('div', { class: `portrait__bg scene-${def.element}` });
++    this.fx = h('div', { class: `portrait__fx${rp.particles ? ' is-stream' : ''}${maxAff ? ' is-affinity' : ''}` });
++    this.char = h('div', { class: 'portrait__char' }, this._buildDoll(def, cls, sil, rp, maxAff));
++
++    // —— 卡面本体 ——（保留 cult-3d__card 类以沿用既有阴影 / 渐变样式）
++    this.cardEl = h('div', {
++      class: [
++        'cult-3d__card', 'portrait__card',
++        `rarity-${this.rarity}`, `dyn-${rp.dynamic}`,
++        rp.inkline ? 'inkline' : '',
++        rp.breakFrame ? 'breakframe' : '',
++        maxAff ? 'is-affinity' : '',
++      ].filter(Boolean).join(' '),
++      style: {
++        background: `linear-gradient(160deg, ${r.color}, ${shade(r.color, -0.28)})`,
++        '--sil': sil,
++        '--sil-d': shade(sil, -0.35),
++        '--sil-l': shade(sil, 0.32),
++        '--cls': cls.color,
++      },
++    }, this.bg, this.char, this.fx, this._buildSeal(rp));
++
++    // wrap 保留 cult-3d 类（冒烟测试据此定位卡牌展示区）。
++    this.wrap = h('div', { class: 'cult-3d portrait' }, this.cardEl);
++
++    // SSR 全动态水墨粒子背景（无 2D 上下文时降级空操作）。
++    if (rp.particles) {
++      const canvas = h('canvas', { class: 'portrait__stream' });
++      this.fx.appendChild(canvas);
++      this._stream = createInkStream(canvas, { color: sil, density: 24 });
++    }
++    // 飘动 / 呼吸 / 眨眼动画系统。
++    this._anim = attachAnimations(this.cardEl, def, this.rarity, {
++      blinkEyes: this.char.querySelector('.portrait__eyes'),
++    });
++
++    this._wire();
++    this._applyTransform(0, 16); // 初始微侧视角，营造立体感
++    return this.wrap;
++  }
++
++  // —— 程序化立绘：头 / 袍服剪影 / 武器 / 飘动部件 ——
++  _buildDoll(def, cls, sil, rp, maxAff) {
++    const parts = [];
++    // 武器（职业识别核心），位置由 CSS 的 cls-<key> 控制。
++    parts.push(h('span', { class: 'pc__weapon' }, cls.weapon));
++    // 袍服躯干：clip-path 剪影，按剪影色着色。
++    parts.push(h('span', { class: 'pc__robe' }));
++    // 头部 + 眼睛（满好感时微笑）。
++    parts.push(h('span', { class: 'pc__head' },
++      h('span', { class: `portrait__eyes${maxAff ? ' smile' : ''}` }, h('i'), h('i')),
++      h('span', { class: 'pc__hair' }),
++    ));
++    // 飘动部件（仅 SR/SSR）。hair 额外由头部承担，这里补 ribbon / 双袖等。
++    if (rp.dynamic >= 1) {
++      for (const p of cls.sway) {
++        if (p === 'hair') continue; // 头发已在头部，避免重复
++        parts.push(h('span', { class: `pc__part part-${p}` }));
++      }
++    }
++    return h('div', { class: `portrait__doll cls-${cls.key}` }, ...parts);
++  }
++
++  // 朱砂印章：R/SR 左下角，SSR 右上角金字飘浮（设计稿增量 二）。
++  _buildSeal(rp) {
++    return h('span', { class: `portrait__seal pos-${rp.breakFrame ? 'tr' : 'bl'}` }, rp.seal);
++  }
++
++  // —— 交互布线 ——
++  _wire() {
++    const wrap = this.wrap;
++    let dragging = false;
++    let moved = 0;
++    let startX = 0, startY = 0;
++    let baseRot = 16;
++    let hoverPx = 0; // 悬停视差量 [-1..1]
++
++    const cx = (e) => (e.touches ? e.touches[0].clientX : e.clientX);
++    const cy = (e) => (e.touches ? e.touches[0].clientY : e.clientY);
++
++    wrap.addEventListener('pointerenter', () => this._setHover(true));
++    wrap.addEventListener('pointerleave', () => { this._setHover(false); if (!dragging) this._applyTransform(0, baseRot); });
++
++    wrap.addEventListener('pointerdown', (e) => {
++      if (this._dead) return;
++      dragging = false; moved = 0;
++      startX = cx(e); startY = cy(e);
++      try { if (wrap.setPointerCapture && e.pointerId != null) wrap.setPointerCapture(e.pointerId); } catch (_) {}
++      // 长按详情（1.5s）。
++      this._holdTimer = setTimeout(() => {
++        if (!dragging && moved < 6) this._openImmersive();
++      }, 1500);
++    });
++
++    wrap.addEventListener('pointermove', (e) => {
++      if (this._dead) return;
++      const dx = cx(e) - startX;
++      const dy = cy(e) - startY;
++      if (e.buttons > 0 || dragging) {
++        // 拖拽旋转：累计位移 → 绕 Y 轴 ±30°（设计稿 四·拖拽旋转）。
++        moved += Math.abs(dx) + Math.abs(dy);
++        if (moved > 6) {
++          dragging = true;
++          clearTimeout(this._holdTimer);
++          const rot = Math.max(-30, Math.min(30, baseRot + dx * 0.35));
++          this._applyTransform(dy * 0.08, rot);
++        }
++      } else {
++        // 悬停视差：指针偏移驱动三层位移（裸眼 2.5D）。
++        const rect = wrap.getBoundingClientRect();
++        const w = rect.width || 130;
++        hoverPx = Math.max(-1, Math.min(1, (cx(e) - (rect.left + w / 2)) / (w / 2)));
++        this._applyParallax(hoverPx);
++      }
++    });
++
++    const end = () => {
++      clearTimeout(this._holdTimer);
++      const wasDrag = dragging;
++      dragging = false;
++      if (wasDrag) { this._applyTransform(0, baseRot); this._applyParallax(0); }
++      else { /* 视作点击，由 click 处理 */ }
++    };
++    wrap.addEventListener('pointerup', end);
++    wrap.addEventListener('pointercancel', end);
++
++    // 点击选中：金光描边闪烁 + 底部浮现诗词（设计稿 四·点击选中）。
++    wrap.addEventListener('click', () => {
++      if (this._dead || moved > 6) return;
++      this._strike();
++      this._showPoem();
++    });
++  }
++
++  _setHover(on) {
++    if (this._anim && this._anim.setHover) this._anim.setHover(on);
++    this.cardEl.classList.toggle('is-hover', on);
++    if (on) this._ripple(); // 背景墨迹涟漪
++  }
++
++  // 三层 transform：cardEl 绕 Y/X 轴旋转；bg/char/fx 各自 translateX 视差。
++  _applyTransform(tiltX, rotY) {
++    if (this._dead) return;
++    this._rotY = rotY;
++    this.cardEl.style.transform = `rotateX(${(12 + tiltX).toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
++    // 旋转时三层也产生轻微视差位移，强化「实物把玩」感。
++    const px = (rotY - 16) / 30; // [-1..1]
++    this._applyParallax(px);
++  }
++  _applyParallax(px) {
++    const amt = (px || 0) * 12; // 最大 ±12px 位移
++    if (this.bg) this.bg.style.transform = `translateX(${(-amt * LAYER_SPEED.bg).toFixed(2)}px)`;
++    if (this.char) this.char.style.transform = `translateX(${(-amt * LAYER_SPEED.char).toFixed(2)}px)`;
++    if (this.fx) this.fx.style.transform = `translateX(${(-amt * LAYER_SPEED.fx).toFixed(2)}px)`;
++  }
++
++  // 背景墨迹涟漪（悬停时扩散一圈）。
++  _ripple() {
++    const rip = h('span', { class: 'portrait__ripple' });
++    this.bg.appendChild(rip);
++    setTimeout(() => { if (rip.parentNode) rip.parentNode.removeChild(rip); }, 900);
++  }
++
++  // 金光描边闪烁（点击选中）。
++  _strike() {
++    this.cardEl.classList.remove('is-strike');
++    void this.cardEl.offsetWidth; // 强制重绘以重启动画
++    this.cardEl.classList.add('is-strike');
++    setTimeout(() => this.cardEl.classList.remove('is-strike'), 600);
++  }
++
++  // 底部浮现专属诗词。
++  _showPoem() {
++    const text = poemOf(this.card);
++    if (!text) return;
++    this.onPoem(text);
++    const node = h('span', { class: 'portrait__poem' }, `「${text}」`);
++    this.cardEl.appendChild(node);
++    setTimeout(() => { if (node.parentNode) node.parentNode.removeChild(node); }, 2600);
++  }
++
++  // —— 全屏沉浸预览（长按 1.5s）——
++  _openImmersive() {
++    if (this._immersive || this._dead) return;
++    const doc = this.wrap.ownerDocument;
++    const clone = this.cardEl.cloneNode(true);
++    clone.classList.add('is-clone');
++    const backdrop = h('div', { class: 'portrait__immersive' },
++      h('div', { class: 'portrait__immersive-tip' }, '沉浸预览 · 点击关闭'),
++      h('div', { class: 'portrait__immersive-stage' }, clone),
++    );
++    (doc.body || this.wrap.parentNode).appendChild(backdrop);
++    void backdrop.offsetWidth;
++    backdrop.classList.add('show');
++    const close = () => {
++      backdrop.classList.remove('show');
++      const t = setTimeout(() => { if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop); this._immersive = null; }, 260);
++      this._timers.push(t);
++      backdrop.removeEventListener('click', close);
++      doc.removeEventListener('keydown', onKey);
++    };
++    const onKey = (e) => { if (e.key === 'Escape') close(); };
++    backdrop.addEventListener('click', close);
++    doc.addEventListener('keydown', onKey);
++    this._immersive = { close };
++  }
++
++  // —— 养成成功特效（升级 / 突破 / 升星 / 进化）——
++  // 金色光柱笼罩 + 底部冲天水墨粒子 + 屏幕微震（设计稿 四·升级/突破成功）。
++  celebrate() {
++    if (this._dead) return;
++    const sil = silhouetteColor(this.card);
++    this.cardEl.classList.add('is-celebrate');
++    const beam = h('span', { class: 'portrait__beam' });
++    this.cardEl.appendChild(beam);
++    // 底部冲天墨粒（SSR 复用常驻流，其它卡临时爆裂）。
++    if (this._stream && this._stream.burst) this._stream.burst();
++    else this._bursts.push(burstInk(this.cardEl, sil, { count: 30, dur: 900 }));
++    this._shake();
++    const t = setTimeout(() => {
++      this.cardEl.classList.remove('is-celebrate');
++      if (beam.parentNode) beam.parentNode.removeChild(beam);
++    }, 900);
++    this._timers.push(t);
++  }
++
++  _shake() {
++    this.cardEl.classList.remove('is-shake');
++    void this.cardEl.offsetWidth;
++    this.cardEl.classList.add('is-shake');
++    const t = setTimeout(() => this.cardEl.classList.remove('is-shake'), 340);
++    this._timers.push(t);
++  }
++
++  destroy() {
++    this._dead = true;
++    for (const t of this._timers) clearTimeout(t);
++    this._timers = [];
++    clearTimeout(this._holdTimer);
++    if (this._anim && this._anim.destroy) this._anim.destroy();
++    if (this._stream && this._stream.destroy) this._stream.destroy();
++    for (const b of this._bursts) if (b && b.destroy) b.destroy();
++    this._bursts = [];
++    if (this._immersive && this._immersive.close) this._immersive.close();
++    this._anim = this._stream = this._immersive = null;
++  }
++}
++
++// 颜色加深 / 变亮（与 app.js 同实现，独立于此避免循环依赖）。
++function shade(hex, amt) {
++  if (!hex || hex[0] !== '#') return hex || '#333';
++  const n = hex.length === 4
++    ? hex.slice(1).split('').map((c) => parseInt(c + c, 16))
++    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
++  const f = (v) => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
++  return `rgb(${f(n[0])}, ${f(n[1])}, ${f(n[2])})`;
++}
+diff --git a/apps/ling-xu-wen-jian-lu/src/ui/silhouetteRenderer.js b/apps/ling-xu-wen-jian-lu/src/ui/silhouetteRenderer.js
+new file mode 100644
+index 0000000..120fd8b
+--- /dev/null
++++ b/apps/ling-xu-wen-jian-lu/src/ui/silhouetteRenderer.js
+@@ -0,0 +1,43 @@
++// ============================================================================
++// 灵墟·问剑录 · 战场剪影生成器（设计稿增量 第六节：编队/战斗中的角色微缩表现）
++//
++// 2.5D 战场上角色不以完整立绘出现，而用「皮影剪影 + 属性光晕」模式：
++//   - 角色形象：立绘的简化剪影（人物轮廓 + 武器），填充为该角色的五行代表色。
++//   - 稀有度标识：剪影底部用对应稀有度的光环（青玉 / 紫金 / 彩凰光圈）旋转环绕。
++//   - 受击 / 阵亡 / 选中态由 battle-scene.js 叠加 .hit-flash / .dying / .acting 控制。
++//
++// 返回一个 DOM 节点，嵌入 battle-scene 的 .bs-unit__art 即可。
++// ============================================================================
++import { h } from './dom.js';
++import { classDef, silhouetteColor, elDef } from '../config.js';
++
++// card：卡牌定义（含 cls / silhouetteColor / element）；rarity：用于光环配色。
++export function renderSilhouette(card, rarity, opts = {}) {
++  const cls = classDef(card && card.cls);
++  const sil = silhouetteColor(card);
++  const el = elDef(card && card.element);
++  const size = opts.size || 'sm';
++  return h('div', {
++    class: `silu silu--${cls.key} silu--${size} rarity-${rarity || (card && card.rarity) || 'R'}`,
++    style: { '--sil': sil, '--sil-d': shade(sil, -0.35), '--sil-l': shade(sil, 0.3) },
++    title: cls.pose,
++  },
++    h('span', { class: 'silu__body' }),
++    h('span', { class: 'silu__head' }),
++    h('span', { class: 'silu__weapon' }, cls.weapon),
++    // 底部稀有度光环（青玉 / 紫金 / 彩凰）
++    h('span', { class: `silu__aura aura-${rarity || (card && card.rarity) || 'R'}` }),
++    // 五行代表色微标（便于一眼分辨属性）
++    el ? h('span', { class: 'silu__el' }, el.emoji) : null,
++  );
++}
++
++// 颜色加深 / 变亮：amt 负数加深、正数变亮（与 app.js 的 shade 同实现，独立于此处避免循环依赖）。
++function shade(hex, amt) {
++  if (!hex || hex[0] !== '#') return hex || '#333';
++  const n = hex.length === 4
++    ? hex.slice(1).split('').map((c) => parseInt(c + c, 16))
++    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
++  const f = (v) => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
++  return `rgb(${f(n[0])}, ${f(n[1])}, ${f(n[2])})`;
++}
+diff --git a/apps/ling-xu-wen-jian-lu/src/ui/style.css b/apps/ling-xu-wen-jian-lu/src/ui/style.css
+index 1c9f596..d9f571f 100644
+--- a/apps/ling-xu-wen-jian-lu/src/ui/style.css
++++ b/apps/ling-xu-wen-jian-lu/src/ui/style.css
+@@ -554,3 +554,231 @@
+ .sweep-batch-btns { display: flex; gap: 8px; margin-top: 8px; }
+ .stamina-chip { display: inline-flex; align-items: center; gap: 4px; background: rgba(74,144,194,0.14); border: 1px solid rgba(74,144,194,0.4); border-radius: 12px; padding: 2px 8px; font-size: 12px; }
+ 
++/* ============================================================================
++   角色人物视觉系统（设计稿增量 第一~六节）
++   —— 2.5D 三叠层视差立绘 + 稀有度差异 + 职业剪影 + 交互反馈
++   ============================================================================ */
++/* —— 三叠层容器 —— */
++.portrait__card { position: relative; transition: transform .12s ease; }
++.portrait__bg, .portrait__char, .portrait__fx {
++  position: absolute; inset: 0; pointer-events: none; border-radius: 14px;
++}
++.portrait__bg { z-index: 0; overflow: hidden; transition: transform .25s ease; }
++.portrait__char { z-index: 1; display: flex; align-items: flex-end; justify-content: center; transition: transform .18s ease; }
++.portrait__fx { z-index: 2; overflow: hidden; transition: transform .12s ease; }
++.portrait__card.breakframe { overflow: visible; }
++.portrait__card.breakframe .portrait__char { overflow: visible; }
++
++/* —— 意境背景（水墨山水 / 门派洞府，低饱和度）—— */
++.portrait__bg.scene-metal { background: radial-gradient(circle at 30% 20%, #e9e2cf, #cfc6ad 70%, #b6aa8c); }
++.portrait__bg.scene-wood  { background: radial-gradient(circle at 30% 25%, #d7e6cf, #b6cda6 70%, #8fae7c); }
++.portrait__bg.scene-water { background: radial-gradient(circle at 35% 20%, #d4e2ee, #aecbe2 70%, #82a6c4); }
++.portrait__bg.scene-fire  { background: radial-gradient(circle at 35% 25%, #f0d6cf, #e2a59a 70%, #c66f5f); }
++.portrait__bg.scene-earth { background: radial-gradient(circle at 30% 25%, #e4d8c4, #cbb38e 70%, #a08254); }
++.portrait__bg::after {
++  content: ''; position: absolute; inset: 0;
++  background: radial-gradient(circle at 50% 62%, transparent 38%, rgba(44,24,16,0.30));
++}
++/* R 卡：纯色宣纸底纹，无具体场景（设计稿增量 二·2.1）*/
++.portrait__card.inkline .portrait__bg { background: var(--paper); }
++.portrait__card.inkline .portrait__bg::after { background: radial-gradient(circle at 50% 60%, transparent 55%, rgba(44,24,16,0.10)); }
++
++/* —— 角色本体·程序化立绘（头 / 袍服 / 武器 / 飘动部件）—— */
++.portrait__doll { position: absolute; left: 21%; bottom: 14%; width: 58%; }
++.portrait__card.dyn-0 .portrait__doll { height: 50%; }   /* R 占卡面 50% */
++.portrait__card.dyn-1 .portrait__doll { height: 64%; }   /* SR 65% */
++.portrait__card.dyn-2 .portrait__doll { height: 74%; }   /* SSR 75% */
++
++.pc__robe {
++  position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
++  width: 80%; height: 62%; z-index: 1;
++  background: linear-gradient(180deg, var(--sil-l), var(--sil) 55%, var(--sil-d));
++  clip-path: polygon(38% 0, 62% 0, 78% 100%, 22% 100%);
++  box-shadow: inset 0 -6px 10px rgba(0,0,0,0.25);
++}
++/* 五大职业袍服剪影（姿态识别，设计稿增量 三）*/
++.cls-sword .pc__robe    { clip-path: polygon(42% 0, 58% 0, 64% 100%, 36% 100%); }
++.cls-body .pc__robe     { clip-path: polygon(26% 0, 74% 0, 88% 100%, 12% 100%); }
++.cls-alchemy .pc__robe  { clip-path: polygon(34% 0, 66% 0, 96% 100%, 4% 100%); }
++.cls-array .pc__robe    { clip-path: polygon(30% 4%, 70% 4%, 82% 42%, 96% 100%, 4% 100%, 18% 42%); }
++.cls-talisman .pc__robe { clip-path: polygon(34% 0, 66% 0, 80% 100%, 20% 100%); }
++/* R 卡墨线白描：袍服改为淡墨晕染（设计稿增量 二·2.1）*/
++.portrait__card.inkline .pc__robe { background: rgba(44,24,16,0.22); box-shadow: inset 0 0 0 2px rgba(44,24,16,0.35); }
++
++.pc__head {
++  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
++  width: 42%; aspect-ratio: 1; border-radius: 50%; z-index: 2;
++  background: linear-gradient(160deg, #f3e7d6, #e3cdb4);
++  box-shadow: inset -2px -2px 4px rgba(0,0,0,0.15);
++}
++.portrait__card.inkline .pc__head { background: var(--paper); box-shadow: inset 0 0 0 2px rgba(44,24,16,0.4); }
++.pc__hair {
++  position: absolute; top: -10%; left: 15%; width: 70%; height: 76%;
++  border-radius: 50% 50% 40% 40%; z-index: 0; transform-origin: 50% 0;
++  background: linear-gradient(180deg, var(--sil-d), var(--sil));
++}
++.portrait__eyes { position: absolute; top: 46%; left: 50%; transform: translate(-50%,-50%); display: flex; gap: 5px; }
++.portrait__eyes i { width: 4px; height: 5px; background: var(--ink); border-radius: 50%; transition: height .08s ease; }
++.portrait__eyes.blink i { height: 1px; }
++.portrait__eyes.smile i { height: 3px; border-radius: 3px 3px 0 0; } /* 满好感·微笑（设计稿 四）*/
++
++.pc__weapon {
++  position: absolute; z-index: 3; font-size: 22px; line-height: 1;
++  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));
++}
++.cls-sword .pc__weapon    { right: -2%; top: 30%; transform: rotate(22deg); }
++.cls-body .pc__weapon     { left: 50%; bottom: -6%; transform: translateX(-50%); font-size: 20px; }
++.cls-alchemy .pc__weapon  { left: 50%; bottom: -10%; transform: translateX(-50%); font-size: 20px; }
++.cls-array .pc__weapon    { left: 50%; top: 40%; transform: translate(-50%,-50%); font-size: 26px; opacity: .82; z-index: 0; }
++.cls-talisman .pc__weapon { left: 50%; top: 56%; transform: translate(-50%,-50%) rotate(-8deg); font-size: 20px; }
++
++/* 飘动部件（衣袂 / 飘带 / 双袖，仅 SR/SSR 渲染）*/
++.pc__part { position: absolute; transform-origin: 50% 0; z-index: 2; }
++.part-ribbon { right: 6%; top: 20%; width: 11%; height: 52%; border-radius: 0 0 45% 45%; opacity: .85; background: linear-gradient(180deg, var(--sil-l), var(--sil)); }
++.part-arm_L { left: 3%; top: 36%; width: 17%; height: 32%; background: linear-gradient(180deg, var(--sil), var(--sil-d)); clip-path: polygon(40% 0, 100% 0, 78% 100%, 0 100%); }
++.part-arm_R { right: 3%; top: 36%; width: 17%; height: 32%; background: linear-gradient(180deg, var(--sil), var(--sil-d)); clip-path: polygon(0 0, 60% 0, 100% 100%, 22% 100%); }
++
++/* —— 动态系统：R 呼吸 / SR 局部飘动 / SSR 全动态（设计稿增量 二）—— */
++@keyframes pc-breath { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
++@keyframes pc-sway   { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(6deg); } }
++@keyframes pc-sway-r { 0%,100% { transform: rotate(6deg); } 50% { transform: rotate(-7deg); } }
++.portrait__card.dyn-0 .portrait__doll { animation: pc-breath 4s ease-in-out infinite; }
++.portrait__card.dyn-1 .pc__hair    { animation: pc-sway   3.6s ease-in-out infinite; }
++.portrait__card.dyn-1 .part-ribbon { animation: pc-sway-r 4s   ease-in-out infinite; }
++.portrait__card.dyn-1 .part-arm_L  { animation: pc-sway   4.4s ease-in-out infinite; }
++.portrait__card.dyn-1 .part-arm_R  { animation: pc-sway-r 4.2s ease-in-out infinite; }
++.portrait__card.dyn-2 .pc__hair    { animation: pc-sway   2.4s ease-in-out infinite; }
++.portrait__card.dyn-2 .part-ribbon { animation: pc-sway-r 2.6s ease-in-out infinite; }
++.portrait__card.dyn-2 .part-arm_L  { animation: pc-sway   3s   ease-in-out infinite; }
++.portrait__card.dyn-2 .part-arm_R  { animation: pc-sway-r 2.8s ease-in-out infinite; }
++/* SSR 流光循环扫过全卡（设计稿增量 二·2.3 七彩流光）*/
++.portrait__card.dyn-2 .portrait__fx::after {
++  content: ''; position: absolute; inset: -40% -10%; pointer-events: none;
++  background: linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%);
++  animation: portrait-shine 3.4s ease-in-out infinite;
++}
++@keyframes portrait-shine { 0% { transform: translateX(-60%); } 60%,100% { transform: translateX(60%); } }
++/* 悬停：飘动加速（设计稿增量 四·悬停预览）*/
++.portrait__card.is-hover .pc__hair,
++.portrait__card.is-hover .part-ribbon,
++.portrait__card.is-hover .part-arm_L,
++.portrait__card.is-hover .part-arm_R { animation-duration: 1.1s !important; }
++.portrait__card.is-hover .pc__head { transform: translateX(-50%) rotateY(8deg); transition: transform .2s ease; }
++
++/* —— 朱砂印章（R/SR 左下；SSR 右上金字，设计稿增量 二）—— */
++.portrait__seal {
++  position: absolute; z-index: 4; font-size: 9px; letter-spacing: 1px; font-weight: bold;
++  padding: 3px 6px; border-radius: 3px; color: var(--paper);
++  background: var(--red); box-shadow: 0 1px 3px rgba(0,0,0,0.3);
++}
++.portrait__seal.pos-bl { left: 8px; bottom: 8px; }
++.portrait__seal.pos-tr { right: 8px; top: 8px; color: var(--ink); background: linear-gradient(135deg, var(--gold), #b8862f); }
++
++/* —— 交互反馈（设计稿增量 四）—— */
++.portrait__ripple {
++  position: absolute; left: 50%; top: 50%; width: 0; height: 0; border: 2px solid rgba(255,255,255,0.5);
++  border-radius: 50%; transform: translate(-50%,-50%); animation: portrait-ripple .9s ease-out forwards;
++}
++@keyframes portrait-ripple { to { width: 150%; height: 150%; opacity: 0; } }
++.portrait__card.is-strike { animation: portrait-strike .6s ease; }
++@keyframes portrait-strike {
++  0%,100% { box-shadow: 0 14px 30px rgba(0,0,0,0.3); }
++  30% { box-shadow: 0 0 0 3px var(--gold), 0 0 22px 6px rgba(212,160,74,0.8); }
++}
++.portrait__poem {
++  position: absolute; left: 50%; bottom: 12px; transform: translateX(-50%); white-space: nowrap;
++  font-size: 11px; letter-spacing: 1px; color: var(--paper); z-index: 5;
++  background: rgba(44,24,16,0.72); padding: 3px 9px; border-radius: 10px;
++  text-shadow: 0 1px 2px rgba(0,0,0,0.5); animation: portrait-poem 2.6s ease forwards;
++}
++@keyframes portrait-poem {
++  0% { opacity: 0; transform: translate(-50%, 8px); }
++  15% { opacity: 1; transform: translate(-50%, 0); }
++  80% { opacity: 1; }
++  100% { opacity: 0; }
++}
++/* 升级 / 突破成功：金色光柱 + 微震（celebrate）*/
++.portrait__beam {
++  position: absolute; left: 50%; bottom: 0; width: 70%; height: 100%; z-index: 4; pointer-events: none;
++  transform-origin: bottom; mix-blend-mode: screen;
++  background: linear-gradient(0deg, rgba(212,160,74,0.7), rgba(212,160,74,0));
++  animation: portrait-beam .9s ease-out forwards;
++}
++@keyframes portrait-beam { 0% { opacity: 0; transform: translateX(-50%) scaleY(0); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateX(-50%) scaleY(1); } }
++.portrait__card.is-shake { animation: portrait-shake .34s ease; }
++@keyframes portrait-shake {
++  0%,100% { transform: rotateX(12deg) rotateY(16deg); }
++  20% { transform: rotateX(12deg) rotateY(16deg) translate(-2px, 1px); }
++  40% { transform: rotateX(12deg) rotateY(16deg) translate(2px, -1px); }
++  60% { transform: rotateX(12deg) rotateY(16deg) translate(-1px, 1px); }
++  80% { transform: rotateX(12deg) rotateY(16deg) translate(1px, 0); }
++}
++
++/* SSR 水墨粒子画布 + 一次性冲天墨粒爆裂 */
++.portrait__stream, .portrait__burst { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
++.portrait__stream { mix-blend-mode: screen; opacity: .9; }
++
++/* —— 满好感：柔光 + 粉色花瓣环绕（设计稿增量 四）—— */
++.portrait__card.is-affinity { box-shadow: 0 0 16px 3px rgba(255,180,200,0.55), 0 14px 30px rgba(0,0,0,0.3); }
++.portrait__fx.is-affinity::before, .portrait__fx.is-affinity::after {
++  content: '🌸'; position: absolute; font-size: 12px; left: 28%; top: -10%; opacity: 0;
++  animation: petal-fall 5s linear infinite;
++}
++.portrait__fx.is-affinity::after { left: 62%; animation-delay: -2.5s; }
++@keyframes petal-fall {
++  0% { top: -10%; opacity: 0; }
++  15% { opacity: .9; }
++  100% { top: 110%; opacity: 0; transform: rotate(360deg) translateX(8px); }
++}
++
++/* —— 长按·全屏沉浸预览（设计稿增量 四·长按详情）—— */
++.portrait__immersive {
++  position: fixed; inset: 0; z-index: 200; display: flex; flex-direction: column;
++  align-items: center; justify-content: center; gap: 14px;
++  background: rgba(0,0,0,0); transition: background .26s ease;
++}
++.portrait__immersive.show { background: rgba(20,12,6,0.6); }
++.portrait__immersive-tip { color: var(--paper); font-size: 12px; opacity: 0; transition: opacity .26s ease .1s; }
++.portrait__immersive.show .portrait__immersive-tip { opacity: .85; }
++.portrait__immersive-stage { transform: scale(.6); opacity: 0; transition: transform .3s cubic-bezier(.2,.8,.3,1.2), opacity .26s ease; }
++.portrait__immersive.show .portrait__immersive-stage { transform: scale(1.15); opacity: 1; }
++.portrait__immersive-stage .cult-3d__card { width: 200px !important; height: 280px !important; transform: rotateX(6deg) rotateY(0deg) !important; }
++.portrait__immersive-stage .pc__weapon { font-size: 34px; }
++
++/* ============================================================================
++   战场剪影·皮影模式（设计稿增量 第六节）
++   ============================================================================ */
++.silu { position: relative; width: 100%; height: 100%; }
++.silu__body {
++  position: absolute; left: 50%; bottom: 10%; transform: translateX(-50%);
++  width: 60%; height: 62%;
++  background: linear-gradient(180deg, var(--sil-l), var(--sil) 60%, var(--sil-d));
++  clip-path: polygon(40% 0, 60% 0, 72% 100%, 28% 100%);
++}
++.silu__head {
++  position: absolute; left: 50%; top: 8%; transform: translateX(-50%);
++  width: 40%; aspect-ratio: 1; border-radius: 50%;
++  background: linear-gradient(160deg, var(--sil-l), var(--sil));
++}
++.silu__weapon { position: absolute; left: 50%; top: 42%; transform: translate(-50%,-50%); font-size: 13px; filter: drop-shadow(0 1px 1px rgba(0,0,0,.4)); }
++.silu__el { position: absolute; right: -1px; top: -1px; font-size: 9px; opacity: .85; }
++.silu__aura {
++  position: absolute; left: 50%; bottom: -2%; transform: translateX(-50%);
++  width: 82%; height: 12%; border-radius: 50%; border: 2px solid var(--sil);
++  opacity: .55; animation: silu-aura 4s linear infinite;
++}
++@keyframes silu-aura { from { transform: translateX(-50%) rotate(0); } to { transform: translateX(-50%) rotate(360deg); } }
++/* 各职业剪影差异 */
++.silu--sword .silu__body    { clip-path: polygon(44% 0, 56% 0, 62% 100%, 38% 100%); }
++.silu--body .silu__body     { clip-path: polygon(28% 0, 72% 0, 86% 100%, 14% 100%); }
++.silu--alchemy .silu__body  { clip-path: polygon(34% 0, 66% 0, 94% 100%, 6% 100%); }
++.silu--array .silu__body    { clip-path: polygon(30% 6%, 70% 6%, 82% 44%, 96% 100%, 4% 100%, 18% 44%); }
++.silu--talisman .silu__body { clip-path: polygon(34% 0, 66% 0, 80% 100%, 20% 100%); }
++/* 稀有度光环：青玉 / 紫金 / 彩凰 */
++.silu .aura-R   { border-color: var(--sil); }
++.silu .aura-SR  { border-color: var(--r-SR); box-shadow: 0 0 6px var(--r-SR); }
++.silu .aura-SSR { border-color: var(--gold); box-shadow: 0 0 8px var(--gold); opacity: .75; }
++/* 战场态：出手选中 → 剪影还原为淡彩实体（设计稿 六·选中高亮）*/
++.bs-unit.acting .silu__body, .bs-unit.acting .silu__head { filter: saturate(1.25) brightness(1.1); }
++.bs-unit.acting .silu__body { box-shadow: 0 0 8px rgba(212,160,74,.7); }
++
diff --git a/.ai-tasks/issue-93/review_error_r1.log b/.ai-tasks/issue-93/review_error_r1.log
new file mode 100644
index 0000000..e69de29
diff --git a/.ai-tasks/issue-93/review_result_r1.md b/.ai-tasks/issue-93/review_result_r1.md
new file mode 100644
index 0000000..1040248
--- /dev/null
+++ b/.ai-tasks/issue-93/review_result_r1.md
@@ -0,0 +1,16 @@
+DECISION: REQUEST_CHANGES
+COMMENT: 审查完毕（已通读全部 diff，并在仓库中核对了 battle.js / app.js / style.css 上下文，运行 scripts/logic-test.mjs 结果 206 通过 0 失败）。存在 1 个功能性 Bug 和若干次要问题：
+
+【Bug 1（主要，必须修复）】SSR 水墨粒子背景实际不可见。portrait3D.js 的 mount() 在 canvas 尚未插入 DOM 时调用 createInkStream()（buildCardStage 返回 wrap 之后才由 renderCultivate append 到 contentEl）。此时 inkParticles.js 的 resize() 中 getBoundingClientRect() 为 0，attribute/clientWidth 回退也均为 0，于是 canvas.width/height 被设为 1，粒子全部绘制在 1×1 的 backing store 上（坐标 0~120 全部落在画布外）。而 resize() 方法在整个代码库中没有任何外部调用者（无 ResizeObserver、无插入后二次 resize），因此 SSR 的常驻粒子流（设计稿 2.3 核心卖点）以及 celebrate() 对 SSR 卡的 burst() 冲天墨粒在真实浏览器中永远渲染不出来——测试全绿只是因为 jsdom 里本来就降级。建议：mount() 返回后在 requestAnimationFrame 中补一次 resize，或接入 ResizeObserver，或延迟到 isConnected 时再初始化。
+
+【Bug 2（次要）】长按 1.5s 打开沉浸预览后，pointerup 仍会派发 click；此时 moved === 0，通过 `if (this._dead || moved > 6) return` 守卫，导致 _strike() + _showPoem() 在全屏遮罩背后额外触发 toast 和诗词弹层。建议在 _openImmersive 后置标志（如 suppressClick）或在 end() 中消费掉。
+
+【Bug 3（次要）】_openImmersive 的 cloneNode(true) 复制了 SSR 粒子 canvas，但 clone 的画布是空白的（绘制内容不会随 clone 复制，也没有为新 canvas 重建 ink stream），沉浸预览模式下“全动态”效果丢失，只剩静态分层。
+
+【次要 4】destroy() 先清空 this._timers 再调用 this._immersive.close()，close 内部 push 进 _timers 的 260ms 收尾 timer 不再受管；虽然能自行移除 backdrop，但时序上脆弱，建议 close 改为同步移除或先 close 再清 timer。
+
+【次要 5】portrait-shake 关键帧硬编码 rotateY(16deg)，若用户拖拽到其他角度后触发 celebrate，会先跳回 16 度再震动，视觉跳变。
+
+【次要 6】_bursts 数组只增不减（burstInk 自毁后对象仍留在数组里），长时间会话下轻微累积，无实质泄漏但建议在 destroy 时或 burst 结束后清理。
+
+其余方面：config.js 的 CLASSES/RARITY_PORTRAIT/portraitLayers 纯数据无逻辑问题；battle.js 的 init 事件正确透传 cls/ref（buildCombatant 原本已有 ref 字段，已核实）；cards.js 15 张卡均补齐 poem/voiceQuote/silhouetteColor 且测试覆盖；战斗剪影 renderSilhouette 的降级路径安全；CSS 变量（--paper/--r-SR/--gold 等）均已存在；删除 app.js 的 shade() 后无残留引用。未发现安全问题；无 CI/workflows 改动需求。修复 Bug 1（及最好一并 Bug 2）后可通过。
diff --git a/apps/ling-xu-wen-jian-lu/scripts/logic-test.mjs b/apps/ling-xu-wen-jian-lu/scripts/logic-test.mjs
index 6cad530..c836ca4 100644
--- a/apps/ling-xu-wen-jian-lu/scripts/logic-test.mjs
+++ b/apps/ling-xu-wen-jian-lu/scripts/logic-test.mjs
@@ -597,5 +597,45 @@ console.log('— battle events —');
   void beforeLen;
 }
 
+// ---------- 角色人物视觉系统（增量 第一~七节：分层立绘 / 职业剪影 / 诗词）----------
+console.log('— character portrait —');
+{
+  const {
+    CLASSES, classDef, silhouetteColor, poemOf,
+    RARITY_PORTRAIT, rarityPortrait, portraitConfig, portraitLayers,
+  } = await import(new URL('../src/config.js', import.meta.url).href);
+  ok(CLASSES.length === 5, '五大职业（剑/体/丹/阵/符）');
+  ok(new Set(CARDS.map((c) => c.cls)).size === 5, '卡牌覆盖全部 5 个职业');
+  ok(CARDS.every((c) => classDef(c.cls).weapon), '每张卡的职业均有核心武器');
+  // 数据字段（设计稿增量 七·cards.json 扩展）
+  ok(CARDS.every((c) => typeof c.poem === 'string' && c.poem.length > 0), '每张卡有专属诗词 poem');
+  ok(CARDS.every((c) => typeof c.voiceQuote === 'string' && c.voiceQuote.length > 0), '每张卡有语音文案 voiceQuote');
+  ok(CARDS.every((c) => /^#[0-9a-fA-F]{6}$/.test(c.silhouetteColor)), '每张卡有合法剪影色 silhouetteColor');
+  // 取色 / 取诗：优先卡牌字段，缺省回退五行色 / quote
+  ok(silhouetteColor(CARD_MAP.SR001) === CARD_MAP.SR001.silhouetteColor, 'silhouetteColor 读卡牌字段');
+  ok(silhouetteColor({ element: 'fire' }) === '#d4564f', 'silhouetteColor 缺省回退五行色');
+  ok(poemOf(CARD_MAP.SR001) === '云鹤九霄外，仙踪不可寻', 'poemOf 取白鹤仙子诗词');
+  ok(poemOf({ quote: 'Q' }) === 'Q', 'poemOf 缺省回退 quote');
+  // 稀有度美术规格：R 静态 / SR 局部 / SSR 全动态
+  ok(rarityPortrait('R').dynamic === 0 && rarityPortrait('SR').dynamic === 1 && rarityPortrait('SSR').dynamic === 2, '稀有度动态层级 0/1/2');
+  ok(rarityPortrait('SSR').particles === true && rarityPortrait('SSR').breakFrame === true, 'SSR 启用粒子背景 + 破框');
+  ok(rarityPortrait('R').inkline === true, 'R 启用墨线白描');
+  // 立绘分层 + 动画配置
+  const cfg = portraitConfig(CARD_MAP.SR001, 'SR');
+  ok(Object.keys(cfg.layers).length >= 7 && cfg.layers.weapon.endsWith('_weapon.png'), 'portraitConfig 含分层 PSD 命名（≥7 层）');
+  ok(cfg.animations.sway_parts.length >= 1, 'portraitConfig 派生飘动部件');
+  ok(cfg.animations.blink_interval === 6000, 'SR 眨眼间隔 6000ms');
+  ok(portraitConfig(CARD_MAP.SSR001, 'SSR').animations.blink_interval === 5000, 'SSR 眨眼间隔 5000ms');
+  ok(portraitConfig(CARD_MAP.R001, 'R').animations.blink_interval === 0, 'R 不眨眼（静态）');
+  ok(portraitLayers(CARD_MAP.R002).bg === 'assets/portraits/R002_bg.webp', 'portraitLayers 按卡牌 id 约定导出');
+  // 战斗 init 事件携带 cls + ref（供战场剪影渲染）
+  {
+    const specs = playerSpecsFrom((() => { const q = newPlayer(); ownCard(q, 'SR001'); setFormation(q, ['SR001', null, null, null, null]); return q; })());
+    const battle = createBattle(specs, makeEnemyFormation(100, 'fire', 'normal', makeRng(1)), makeRng(1));
+    const init = battle.events.find((e) => e.t === 'init' && e.side === 'player');
+    ok(init && init.cls === '丹修' && init.ref === 'SR001', 'init 事件携带职业 cls 与卡牌 ref');
+  }
+}
+
 console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
 process.exit(fail ? 1 : 0);
diff --git a/apps/ling-xu-wen-jian-lu/src/config.js b/apps/ling-xu-wen-jian-lu/src/config.js
index d32ebbf..931231d 100644
--- a/apps/ling-xu-wen-jian-lu/src/config.js
+++ b/apps/ling-xu-wen-jian-lu/src/config.js
@@ -250,6 +250,72 @@ export const BREAK_STONE = { metal: 'break_metal', wood: 'break_wood', water: 'b
 // 五行 → 五行精华 id（化凡入圣用）
 export const ESSENCE_STONE = { metal: 'essence_metal', wood: 'essence_wood', water: 'essence_water', fire: 'essence_fire', earth: 'essence_earth' };
 
+// ── 五大职业剪影（设计稿增量 第三节）──────────────────────────────────────────
+// 仅凭「姿态 + 武器 + 服饰轮廓」即可判断职业，缩略图也能一眼识别。
+// key：拉丁标识（用于 CSS 选择器）；weapon：核心武器 emoji；sway：可飘动部件。
+export const CLASSES = [
+  { id: '剑修', key: 'sword',    name: '剑修', weapon: '⚔️', pose: '侧身执剑', garment: '窄袖劲装·披风', color: '#c8a951', sway: ['hair', 'ribbon'] },
+  { id: '体修', key: 'body',     name: '体修', weapon: '🛡️', pose: '正面双臂微张', garment: '短打·护心镜', color: '#a17b4a', sway: ['arm_R'] },
+  { id: '丹修', key: 'alchemy',  name: '丹修', weapon: '⚗️', pose: '单手托炉', garment: '宽袍大袖·飘带', color: '#5fa85f', sway: ['ribbon', 'arm_L'] },
+  { id: '阵修', key: 'array',    name: '阵修', weapon: '🌀', pose: '双手结印', garment: '道冠·法衣', color: '#9B6BCC', sway: ['hair', 'ribbon'] },
+  { id: '符修', key: 'talisman', name: '符修', weapon: '📜', pose: '持符点指', garment: '鹤氅·符袋', color: '#C23B22', sway: ['ribbon', 'arm_R'] },
+];
+const CLASS_MAP = Object.fromEntries(CLASSES.map((c) => [c.id, c]));
+export function classDef(cls) { return CLASS_MAP[cls] || CLASSES[0]; }
+
+// 战场剪影用色（五行代表色），可被卡牌 silhouette_color 覆盖（设计稿增量 第六节）。
+export function silhouetteColor(card) {
+  if (card && card.silhouette_color) return card.silhouette_color;
+  const e = elDef(card && card.element);
+  return e ? e.color : '#9a8a72';
+}
+
+// 点击浮现的专属诗词（设计稿增量 第四节·点击选中）：缺省回退到角色 quote。
+export function poemOf(card) {
+  if (!card) return '';
+  return card.poem || card.quote || '';
+}
+
+// ── 稀有度人物美术规格（设计稿增量 第二节）──────────────────────────────────────
+// dynamic：动态层级（0 静态呼吸 / 1 局部飘动 / 2 全动态粒子）；
+// seal：左下角朱砂印章名；particles：是否启用 SSR 水墨粒子背景；breakFrame：破框特效。
+export const RARITY_PORTRAIT = {
+  R:   { dynamic: 0, seal: '逸品·青玉', inkline: true,  particles: false, breakFrame: false },
+  SR:  { dynamic: 1, seal: '绝品·紫金', inkline: false, particles: false, breakFrame: false },
+  SSR: { dynamic: 2, seal: '至品·彩凰', inkline: false, particles: true,  breakFrame: true },
+};
+export function rarityPortrait(rarity) { return RARITY_PORTRAIT[rarity] || RARITY_PORTRAIT.R; }
+
+// PSD 分层命名（body/head/hair/arm_L/arm_R/weapon/accessory）按卡牌 id 约定导出，
+// 供 CSS 分体动画逐层操控（设计稿增量 第五节）。无实图时由 portrait3D.js 程序化绘制。
+export function portraitLayers(card) {
+  const id = (card && card.id) || '';
+  const base = `assets/portraits/${id}`;
+  return {
+    bg: `${base}_bg.webp`,
+    body: `${base}_body.png`,
+    head: `${base}_head.png`,
+    hair: `${base}_hair.png`,
+    arm_L: `${base}_armL.png`,
+    arm_R: `${base}_armR.png`,
+    weapon: `${base}_weapon.png`,
+    accessory: `${base}_accessory.png`,
+  };
+}
+// 角色立绘动画配置：飘动部件取自职业，眨眼间隔随稀有度递减（越稀有越灵动）。
+export function portraitConfig(card, rarity) {
+  const cls = classDef(card && card.cls);
+  const rp = rarityPortrait(rarity || (card && card.rarity));
+  return {
+    layers: portraitLayers(card),
+    animations: {
+      sway_parts: cls.sway.slice(),
+      blink_interval: rp.dynamic >= 2 ? 5000 : rp.dynamic >= 1 ? 6000 : 0,
+      dynamic: rp.dynamic,
+    },
+  };
+}
+
 // ── 起始资源（新档）─────────────────────────────────────────────────────────────
 export const START_RESOURCES = {
   lingshi: 3000,
diff --git a/apps/ling-xu-wen-jian-lu/src/core/battle.js b/apps/ling-xu-wen-jian-lu/src/core/battle.js
index 8f61fa3..9b9c8b3 100644
--- a/apps/ling-xu-wen-jian-lu/src/core/battle.js
+++ b/apps/ling-xu-wen-jian-lu/src/core/battle.js
@@ -27,6 +27,7 @@ export function buildCombatant(spec, side, pos) {
     name: spec.name || '无名',
     element: spec.element || null,
     role: spec.role || 'dps',
+    cls: spec.cls || null,
     baseAtk: s.atk, baseDef: s.def, baseSpd: s.spd,
     maxHp: Math.max(1, Math.round(s.hp)), hp: Math.max(1, Math.round(s.hp)),
     baseCrit: 0.05,
@@ -75,7 +76,7 @@ export function playerSpecsFrom(player) {
     const def = cardDef(id);
     if (!def) continue;
     out.push({
-      ref: id, name: def.name, element: def.element, role: def.role,
+      ref: id, name: def.name, element: def.element, role: def.role, cls: def.cls,
       stats: instanceStats(inst), actives: def.actives, passives: def.passives,
       skillMult: skillMult(inst),
     });
@@ -105,7 +106,7 @@ export function createBattle(playerSpecs, enemySpecs, rng) {
   const events = [];
   // 初始化事件：把所有参战单位及其初始面板喂给动画回放器。
   for (const c of [...players, ...enemies]) {
-    events.push({ t: 'init', side: c.side, pos: c.pos, name: c.name, element: c.element, role: c.role, hp: c.hp, maxHp: c.maxHp, isBoss: !!c.isBoss });
+    events.push({ t: 'init', side: c.side, pos: c.pos, name: c.name, element: c.element, role: c.role, cls: c.cls, ref: c.ref, hp: c.hp, maxHp: c.maxHp, isBoss: !!c.isBoss });
   }
   return {
     players, enemies,
diff --git a/apps/ling-xu-wen-jian-lu/src/data/cards.js b/apps/ling-xu-wen-jian-lu/src/data/cards.js
index 765d3bd..ff32974 100644
--- a/apps/ling-xu-wen-jian-lu/src/data/cards.js
+++ b/apps/ling-xu-wen-jian-lu/src/data/cards.js
@@ -34,6 +34,9 @@ export const CARDS = [
     passives: [],
     story: '青云山外门的执剑童子，以竹为剑，招式朴素却暗合剑理。',
     quote: '一竹一剑，亦可问道。',
+    poem: '青竹三尺剑，问道一峰云',
+    voiceQuote: '师弟，今日剑谱可练熟了？',
+    silhouetteColor: '#5fa85f',
   },
   {
     id: 'R002', name: '赤焰灵狐', rarity: 'R', element: 'fire', cls: '符修',
@@ -43,6 +46,9 @@ export const CARDS = [
     passives: [],
     story: '生于赤焰峡谷的灵狐，尾火不熄，灼敌于无形。',
     quote: '可别被我的尾巴燎到了。',
+    poem: '尾火燃千岭，灵狐过九原',
+    voiceQuote: '嘻，别踩到我的尾巴哦。',
+    silhouetteColor: '#d4564f',
   },
   {
     id: 'R003', name: '玄龟甲士', rarity: 'R', element: 'water', cls: '体修',
@@ -52,6 +58,9 @@ export const CARDS = [
     passives: [],
     story: '寒潭深处的玄龟一族，背甲坚逾玄铁，世代为阵前盾卫。',
     quote: '有我在，谁也越不过此阵。',
+    poem: '玄甲沉渊底，一盾定江山',
+    voiceQuote: '阵在我前，谁敢越雷池？',
+    silhouetteColor: '#4a90c2',
   },
   {
     id: 'R004', name: '金戈锐士', rarity: 'R', element: 'metal', cls: '剑修',
@@ -60,6 +69,9 @@ export const CARDS = [
     passives: [],
     story: '金戈铁壁的守关锐士，一柄长戈可破百甲。',
     quote: '破阵，只在须臾。',
+    poem: '金戈横大漠，一破百甲开',
+    voiceQuote: '破阵只在须臾，你看好了。',
+    silhouetteColor: '#c8a951',
   },
   {
     id: 'R005', name: '厚土力士', rarity: 'R', element: 'earth', cls: '体修',
@@ -69,6 +81,9 @@ export const CARDS = [
     passives: [],
     story: '地煞迷宫中修土行的大汉，一步撼地，万夫迟滞。',
     quote: '大地，皆为我臂助。',
+    poem: '厚土承千钧，撼地万夫迟',
+    voiceQuote: '脚下这片地，都听我的。',
+    silhouetteColor: '#a17b4a',
   },
   {
     id: 'R006', name: '柳叶医仙', rarity: 'R', element: 'wood', cls: '丹修',
@@ -77,6 +92,9 @@ export const CARDS = [
     passives: [],
     story: '万木回廊采药的医仙，以柳叶为针，回春续命。',
     quote: '且安心，伤可愈。',
+    poem: '柳叶为针细，回春续寸心',
+    voiceQuote: '且安心，伤总能好的。',
+    silhouetteColor: '#5fa85f',
   },
   {
     id: 'R007', name: '流火散修', rarity: 'R', element: 'fire', cls: '剑修',
@@ -85,6 +103,9 @@ export const CARDS = [
     passives: [],
     story: '游历四方的散修剑客，剑走偏锋，烈焰裹刃。',
     quote: '我的剑，烫得很。',
+    poem: '流火焚长夜，孤剑走天涯',
+    voiceQuote: '我这剑烫得很，小心些。',
+    silhouetteColor: '#d4564f',
   },
   {
     id: 'R008', name: '霜月散修', rarity: 'R', element: 'water', cls: '符修',
@@ -94,6 +115,9 @@ export const CARDS = [
     passives: [],
     story: '寒潭月下修符的散修，一咒凝冰，封敌于瞬。',
     quote: '且在这霜寒中静一静。',
+    poem: '霜月凝寒露，一符锁千秋',
+    voiceQuote: '在这霜寒里，静一静吧。',
+    silhouetteColor: '#4a90c2',
   },
   {
     id: 'R009', name: '飞羽散修', rarity: 'R', element: 'metal', cls: '阵修',
@@ -103,6 +127,9 @@ export const CARDS = [
     passives: [],
     story: '布阵如飞的散修道人，一聚灵，全队锋芒更盛。',
     quote: '灵气已聚，放手施为。',
+    poem: '飞羽布灵阵，一气聚锋芒',
+    voiceQuote: '灵气已聚，放手施为便是。',
+    silhouetteColor: '#c8a951',
   },
 
   // ── SR 卡（4）绝品·紫金 ──────────────────────────────────────────────────────
@@ -117,6 +144,9 @@ export const CARDS = [
     passives: [{ kind: 'heal_in', amount: 0.15 }], // 鹤羽护体：受治疗 +15%
     story: '云鹤化形的仙子，仙羽轻拂，百病皆消。',
     quote: '愿这甘霖，洗净诸般苦厄。',
+    poem: '云鹤九霄外，仙踪不可寻',
+    voiceQuote: '道友，可愿与我共饮一杯？',
+    silhouetteColor: '#4a90c2',
   },
   {
     id: 'SR002', name: '赤霄剑尊', rarity: 'SR', element: 'fire', cls: '剑修',
@@ -128,6 +158,9 @@ export const CARDS = [
     passives: [{ kind: 'crit', amount: 0.10 }], // 剑心通明：暴击率 +10%
     story: '执赤霄神剑的剑道尊者，九式连环，星火燎原。',
     quote: '剑出赤霄，万里燎原。',
+    poem: '赤霄横万里，一剑燎中原',
+    voiceQuote: '剑出赤霄，便无回头之路。',
+    silhouetteColor: '#d4564f',
   },
   {
     id: 'SR003', name: '玄冥蛇姬', rarity: 'SR', element: 'earth', cls: '符修',
@@ -141,6 +174,9 @@ export const CARDS = [
     passives: [{ kind: 'thorns', amount: 0.15 }], // 蛇鳞反噬：受击反伤 15%
     story: '玄冥深处的蛇姬，一瞥石化，毒雾蚀骨。',
     quote: '与我斗，先问问我的鳞。',
+    poem: '玄冥蛇影晦，毒雾蚀枯骨',
+    voiceQuote: '与我斗？先问过我的鳞。',
+    silhouetteColor: '#a17b4a',
   },
   {
     id: 'SR004', name: '青莲道尊', rarity: 'SR', element: 'wood', cls: '阵修',
@@ -154,6 +190,9 @@ export const CARDS = [
     passives: [{ kind: 'resist', amount: 0.20 }], // 道法自然：效果抵抗 +20%
     story: '青莲峰上的道尊，一念成阵，万法自然。',
     quote: '道法自然，何须强求。',
+    poem: '青莲生一念，万法自成阵',
+    voiceQuote: '道法自然，何须强求。',
+    silhouetteColor: '#5fa85f',
   },
 
   // ── SSR 卡（2）至品·彩凰 ─────────────────────────────────────────────────────
@@ -173,6 +212,9 @@ export const CARDS = [
     ],
     story: '上古兵主蚩尤的一缕残魂，重聚九黎战意，所向披靡。',
     quote: '吾乃九黎之主，战魂不灭！',
+    poem: '九黎图腾起，战魂燃苍穹',
+    voiceQuote: '吾乃九黎之主，战魂不灭！',
+    silhouetteColor: '#d4564f',
   },
   {
     id: 'SSR002', name: '瑶池圣母', rarity: 'SSR', element: 'water', cls: '丹修',
@@ -190,6 +232,9 @@ export const CARDS = [
     ],
     story: '瑶池之主，慈航普度，一滴仙露可活白骨。',
     quote: '天泽万物，生生不息。',
+    poem: '瑶池金母降，一滴活白骨',
+    voiceQuote: '天泽万物，生生不息。',
+    silhouetteColor: '#4a90c2',
   },
 ];
 
diff --git a/apps/ling-xu-wen-jian-lu/src/ui/animationSystem.js b/apps/ling-xu-wen-jian-lu/src/ui/animationSystem.js
new file mode 100644
index 0000000..3bc6bce
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/ui/animationSystem.js
@@ -0,0 +1,44 @@
+// ============================================================================
+// 灵墟·问剑录 · SR/SSR 局部飘动动画系统（设计稿增量 第二节 2.2/2.3 / 第八节 animationSystem）
+//
+// 按稀有度挂载不同动态层级（由 portrait3D.js 调用）：
+//   R  （dynamic 0）：仅 CSS「呼吸」缩放，无逐帧动画。
+//   SR （dynamic 1）：衣袂 / 飘带 / 长发等部件 CSS 关键帧缓慢飘动 + 每 6s 眨眼一次。
+//   SSR（dynamic 2）：部件飘动更剧烈 + 每 5s 眨眼 + 悬停时整体加速（由 portrait3D 切 class）。
+//
+// 飘动完全由 CSS 关键帧驱动（.portrait__card.is-anim 与 .part-* 类），
+// 这里只负责：① 给卡面打上动态等级标记；② 驱动眨眼定时器（需 JS，因为要短暂合眼）。
+// 返回 { destroy }：清理眨眼定时器。jsdom 等无 eyes 的环境安全降级。
+// ============================================================================
+import { portraitConfig } from '../config.js';
+
+// opts: { blinkEyes: <HTMLElement|null> }
+export function attachAnimations(cardEl, card, rarity, opts = {}) {
+  if (!cardEl) return { destroy() {}, setHover() {} };
+  const cfg = portraitConfig(card, rarity);
+  const dynamic = cfg.animations.dynamic;
+  // 动态等级标记：CSS 据 .dyn-1 / .dyn-2 启用不同强度的关键帧。
+  cardEl.classList.remove('dyn-0', 'dyn-1', 'dyn-2', 'is-anim');
+  cardEl.classList.add(`dyn-${dynamic}`, 'is-anim');
+
+  const eyes = opts && opts.blinkEyes ? opts.blinkEyes : null;
+  const interval = cfg.animations.blink_interval || 0;
+  const timers = [];
+
+  // 眨眼：仅 SR/SSR 启用（interval > 0）；周期性给眼睛加 .blink（合眼 ~150ms）。
+  if (eyes && interval > 0) {
+    const id = setInterval(() => {
+      if (!eyes.parentNode) return;
+      eyes.classList.add('blink');
+      const t = setTimeout(() => eyes.classList.remove('blink'), 150);
+      timers.push(t);
+    }, interval);
+    timers.push(id);
+  }
+
+  return {
+    // 悬停 / 失焦时由 portrait3D 调用，整体加快飘动（CSS 据 .is-hover 缩短动画时长）。
+    setHover(on) { cardEl.classList.toggle('is-hover', !!on); },
+    destroy() { for (const t of timers) { clearTimeout(t); clearInterval(t); } },
+  };
+}
diff --git a/apps/ling-xu-wen-jian-lu/src/ui/app.js b/apps/ling-xu-wen-jian-lu/src/ui/app.js
index c89d2a8..4ffd302 100644
--- a/apps/ling-xu-wen-jian-lu/src/ui/app.js
+++ b/apps/ling-xu-wen-jian-lu/src/ui/app.js
@@ -44,6 +44,7 @@ import {
 } from '../core/save.js';
 import { makeRng } from '../core/rng.js';
 import { BattleScene } from './battle-scene.js';
+import { Portrait3D } from './portrait3D.js';
 
 const TABS = [
   { key: 'lineup', icon: '⚔️', label: '阵容' },
@@ -88,6 +89,7 @@ export class GameUI {
 
   destroy() {
     if (this._battleScene) { this._battleScene.destroy(); this._battleScene = null; }
+    if (this._portrait) { try { this._portrait.destroy(); } catch (_) {} this._portrait = null; }
     this.stopLoop();
     if (this._detachKeyboard) this._detachKeyboard();
     try { document.removeEventListener('visibilitychange', this._onVis); } catch (_) {}
@@ -265,6 +267,8 @@ export class GameUI {
   }
 
   renderTab() {
+    // 重建内容前先拆解上一张卡的视差引擎（rAF / canvas / 定时器），避免跨刷新累积泄漏。
+    if (this._portrait) { try { this._portrait.destroy(); } catch (_) {} this._portrait = null; }
     clear(this.contentEl);
     switch (this.tab) {
       case 'lineup': return this.renderLineup();
@@ -450,45 +454,24 @@ export class GameUI {
     this.contentEl.append(picker, h('div', { class: 'cult-3d-wrap' }, stage, statsPanel), tabBar, detail);
   }
 
-  // 2.5D 卡牌展示区：perspective 立体卡 + 拖拽旋转 + 点击水墨涟漪（设计稿增量 1.3）
+  // 2.5D 卡牌展示区：三叠层视差立绘 + 悬停 / 点击 / 拖拽 / 长按交互（设计稿增量 一/四）。
+  // 由 Portrait3D 引擎渲染；展示区随养成成功触发 celebrate() 庆祝特效。
   buildCardStage(def, inst, r) {
-    const wrap = h('div', { class: 'cult-3d' });
-    const card = h('div', {
-      class: `cult-3d__card ${r.short === 'SSR' || inst.evo ? 'glow' : ''}`,
-      style: {
-        background: `linear-gradient(160deg, ${r.color}, ${shade(r.color, -0.25)})`,
-        border: `2px solid ${r.short === 'SSR' ? '#D4A04A' : 'rgba(255,255,255,0.4)'}`,
-      },
-    },
-      h('div', { class: 'cult-3d__art' }, elEmoji(def.element)),
-      h('div', { class: 'cult-3d__name' }, def.name),
-      h('div', { class: 'cult-3d__sub' }, `${r.short} · ${elName(def.element)}${def.cls}`),
-      h('div', { class: 'cult-3d__sub' }, `${'★'.repeat(inst.star)}${'☆'.repeat(Math.max(0, 9 - inst.star))}`),
-    );
-    wrap.appendChild(card);
-    // 拖拽旋转：pointerdown 时捕获指针，后续 move/up 均派发到 wrap 本身，
-    // 避免向 window 注册监听造成跨刷新累积泄漏。
-    let dragging = false; let startX = 0; let rotY = 18;
-    const clientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);
-    wrap.addEventListener('pointerdown', (e) => {
-      dragging = true; startX = clientX(e);
-      try { if (wrap.setPointerCapture && e.pointerId != null) wrap.setPointerCapture(e.pointerId); } catch (_) {}
-    });
-    wrap.addEventListener('pointermove', (e) => {
-      if (!dragging) return;
-      rotY = 18 + Math.max(-50, Math.min(50, (clientX(e) - startX) * 0.4));
-      card.style.transform = `rotateX(12deg) rotateY(${rotY}deg)`;
+    if (this._portrait) { try { this._portrait.destroy(); } catch (_) {} this._portrait = null; }
+    const portrait = new Portrait3D({
+      card: def,
+      instance: inst,
+      rarity: effectiveRarity(inst),
+      onPoem: (text) => this.toast(text),
     });
-    wrap.addEventListener('pointerup', () => { dragging = false; });
-    wrap.addEventListener('pointercancel', () => { dragging = false; });
-    // 点击水墨涟漪
-    wrap.addEventListener('click', () => {
-      const rip = h('span', { class: 'cult-3d__ripple' });
-      rip.style.left = '50%'; rip.style.top = '50%'; rip.style.transform = 'translate(-50%, -50%)';
-      wrap.appendChild(rip);
-      setTimeout(() => { if (rip.parentNode) rip.parentNode.removeChild(rip); }, 720);
-    });
-    return wrap;
+    this._portrait = portrait;
+    return portrait.mount();
+  }
+
+  // 养成成功庆祝：金光柱 + 冲天墨粒 + 微震（设计稿增量 四·升级/突破成功）。
+  // 须在 afterAction()（重建卡面）之后调用，使特效落到新渲染的卡面上。
+  _celebrate() {
+    if (this._portrait) { try { this._portrait.celebrate(); } catch (_) {} }
   }
 
   // 修炼子页：升级 + 突破
@@ -658,13 +641,15 @@ export class GameUI {
   doFeedPill(inst, pillId) {
     const r = feedPill(this.player, inst, pillId, 1);
     if (!r.ok) { this.toast(r.reason); return; }
+    const leveled = (r.logs || []).some((l) => l.kind === 'level');
     for (const l of (r.logs || [])) if (l.kind === 'level') this.toast(l.text);
     this.afterAction();
+    if (leveled) this._celebrate();
   }
-  doBreak(inst) { const r = doBreakThrough(this.player, inst); if (!r.ok) this.toast(r.reason); else this.toast(r.text); this.afterAction(); }
-  doStar(inst) { const r = doStarUp(this.player, inst); if (!r.ok) this.toast(r.reason); else this.toast(r.text); this.afterAction(); }
+  doBreak(inst) { const r = doBreakThrough(this.player, inst); if (!r.ok) this.toast(r.reason); else this.toast(r.text); this.afterAction(); if (r.ok) this._celebrate(); }
+  doStar(inst) { const r = doStarUp(this.player, inst); if (!r.ok) this.toast(r.reason); else this.toast(r.text); this.afterAction(); if (r.ok) this._celebrate(); }
   doSkill(inst) { const r = doSkillUp(this.player, inst); if (!r.ok) this.toast(r.reason); else this.toast(r.text); this.afterAction(); }
-  doEvolve(inst) { const r = doEvolve(this.player, inst); if (!r.ok) this.toast(r.reason); else { this.toast(r.text); } this.afterAction(); }
+  doEvolve(inst) { const r = doEvolve(this.player, inst); if (!r.ok) this.toast(r.reason); else { this.toast(r.text); } this.afterAction(); if (r.ok) this._celebrate(); }
   doGift(inst) { const r = doGift(this.player, inst); if (!r.ok) this.toast(r.reason); else this.toast(r.text); this.afterAction(); }
   doTea(def, inst) {
     const al = affinityLevel(inst.affinity);
@@ -1020,15 +1005,6 @@ function targetLabel(t) {
   const map = { enemy_one: '敌方单体', enemy_all: '敌方全体', ally_lowest: '最低血盟友', ally_all: '我方全体', self: '自身' };
   return map[t] || t;
 }
-// 颜色加深 / 变亮（amt 负数加深，正数变亮）——用于 2.5D 卡牌渐变底色
-function shade(hex, amt) {
-  if (!hex || hex[0] !== '#') return hex || '#333';
-  const n = hex.length === 4
-    ? hex.slice(1).split('').map((c) => parseInt(c + c, 16))
-    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
-  const f = (v) => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
-  return `rgb(${f(n[0])}, ${f(n[1])}, ${f(n[2])})`;
-}
 function cn(n) { return ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾', '拾壹', '拾贰'][n] || String(n); }
 function copyText(text) {
   try {
diff --git a/apps/ling-xu-wen-jian-lu/src/ui/battle-scene.js b/apps/ling-xu-wen-jian-lu/src/ui/battle-scene.js
index 169b720..615917d 100644
--- a/apps/ling-xu-wen-jian-lu/src/ui/battle-scene.js
+++ b/apps/ling-xu-wen-jian-lu/src/ui/battle-scene.js
@@ -10,6 +10,7 @@
 import { h, clear, bar } from './dom.js';
 import { elEmoji, resName, resEmoji } from '../config.js';
 import { cardDef } from '../data/cards.js';
+import { renderSilhouette } from './silhouetteRenderer.js';
 
 const EL_COLOR = { metal: '#c8a951', wood: '#5fa85f', water: '#4a90c2', fire: '#d4564f', earth: '#a17b4a', none: '#9a8a72' };
 
@@ -102,12 +103,16 @@ export class BattleScene {
     }
     const floatLayer = h('div', { class: 'bs-unit__float' });
     const hpBar = bar(data.hp, data.maxHp, { class: 'bs-hp', color: side === 'player' ? '' : '#d4564f' });
+    // 我方真实卡牌 → 皮影剪影 + 属性光晕（设计稿增量 第六节）；敌方仍用五行 emoji 头像。
+    const playerCard = side === 'player' && data.ref ? cardDef(data.ref) : null;
+    const art = h('div', { class: 'bs-unit__art', style: { background: hexA(EL_COLOR[data.element], 0.16) } },
+      playerCard ? renderSilhouette(playerCard, playerCard.rarity) : (elEmoji(data.element) || '✦'));
     const el = h('div', {
       class: `bs-unit bs-unit--${side} ${data.isBoss ? 'bs-unit--boss' : ''}`,
       dataset: { side, pos: String(pos) },
       style: { borderColor: EL_COLOR[data.element] || '#9a8a72' },
     },
-      h('div', { class: 'bs-unit__art', style: { background: hexA(EL_COLOR[data.element], 0.16) } }, elEmoji(data.element) || '✦'),
+      art,
       h('div', { class: 'bs-unit__name' }, data.name),
       hpBar,
       floatLayer,
diff --git a/apps/ling-xu-wen-jian-lu/src/ui/inkParticles.js b/apps/ling-xu-wen-jian-lu/src/ui/inkParticles.js
new file mode 100644
index 0000000..ed67539
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/ui/inkParticles.js
@@ -0,0 +1,175 @@
+// ============================================================================
+// 灵墟·问剑录 · SSR 全动态水墨粒子背景（设计稿增量 第二节 2.3 / 第八节 inkParticles）
+//
+// 两套能力：
+//   createInkStream(canvas, opts) —— SSR 卡面背景的常驻水墨粒子流（缓慢上浮 / 飘散）。
+//   burstInk(hostEl, color, opts) —— 一次性「冲天墨粒」爆裂（升级 / 突破成功时从底部冲起）。
+//
+// 纯 Canvas 2D 实现。在无 2D 上下文的环境（jsdom 冒烟、降级浏览器）下安全降级为空操作，
+// 不抛异常、不启动 rAF 循环，避免在测试环境里失控。
+// ============================================================================
+
+const RAF = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (fn) => setTimeout(fn, 16);
+const CAF = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : (id) => clearTimeout(id);
+
+// 解析 #RRGGBB / #RGB 为 [r,g,b]；非法色回退墨色。
+function parseColor(hex) {
+  if (!hex || typeof hex !== 'string' || hex[0] !== '#') return [44, 24, 16];
+  const n = hex.length === 4
+    ? hex.slice(1).split('').map((c) => parseInt(c + c, 16))
+    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
+  return n.some((x) => Number.isNaN(x)) ? [44, 24, 16] : n;
+}
+
+// 一个水墨粒子：位置 / 速度 / 半径 / 生命 / 颜色。
+function spawn(w, h, color, opts = {}) {
+  const [r, g, b] = color;
+  const baseR = opts.radius || (2 + Math.random() * 4);
+  return {
+    x: Math.random() * w,
+    y: opts.fromBottom ? h + baseR : Math.random() * h,
+    vx: (Math.random() - 0.5) * (opts.drift || 0.3),
+    vy: opts.fromBottom ? -(0.5 + Math.random() * 1.4) : -(0.1 + Math.random() * 0.4),
+    r: baseR,
+    life: 1,
+    decay: opts.decay || (0.002 + Math.random() * 0.004),
+    rgb: [r, g, b],
+  };
+}
+
+// —— 常驻水墨粒子流（SSR 卡面背景）——————————————————————————————
+// opts: { color, density }  density 控制同时存活粒子数（默认 26）。
+export function createInkStream(canvas, opts = {}) {
+  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
+  if (!canvas || !ctx) return { burst() {}, resize() {}, destroy() {} };
+  const color = parseColor(opts.color || '#D4A04A');
+  const density = Math.max(6, opts.density || 26);
+  let parts = [];
+  let w = 0, h = 0;
+  let raf = 0;
+  let running = true;
+
+  function resize() {
+    const rect = canvas.getBoundingClientRect();
+    // 退化为 attribute 尺寸；仍无尺寸则跳过绘制。
+    w = rect.width || parseFloat(canvas.getAttribute('width')) || canvas.clientWidth || 0;
+    h = rect.height || parseFloat(canvas.getAttribute('height')) || canvas.clientHeight || 0;
+    const nw = Math.max(1, Math.round(w));
+    const nh = Math.max(1, Math.round(h));
+    // 尺寸未变时不动 backing store，避免 ResizeObserver 自激循环。
+    if (nw !== canvas.width || nh !== canvas.height) {
+      canvas.width = nw;
+      canvas.height = nh;
+    }
+    // 按密度补齐粒子
+    while (parts.length < density) parts.push(spawn(w || 120, h || 160, color));
+  }
+  resize();
+
+  function frame() {
+    if (!running) return;
+    ctx.clearRect(0, 0, w, h);
+    for (let i = 0; i < parts.length; i++) {
+      const p = parts[i];
+      p.x += p.vx; p.y += p.vy; p.life -= p.decay;
+      if (p.life <= 0 || p.y + p.r < -4) { parts[i] = spawn(w, h, color); continue; }
+      const a = Math.max(0, Math.min(0.5, p.life * 0.5));
+      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2);
+      grd.addColorStop(0, `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${a})`);
+      grd.addColorStop(1, `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},0)`);
+      ctx.fillStyle = grd;
+      ctx.beginPath();
+      ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
+      ctx.fill();
+    }
+    raf = RAF(frame);
+  }
+  raf = RAF(frame);
+
+  return {
+    // 从底部冲起一波短命粒子（升级 / 突破成功），与常驻流叠加。
+    burst() {
+      for (let i = 0; i < Math.min(40, density); i++) {
+        parts.push(spawn(w || 120, h || 160, color, { fromBottom: true, decay: 0.012 + Math.random() * 0.01 }));
+      }
+      // 防止粒子无限堆积：超过 3 倍密度时回收最老的一批。
+      if (parts.length > density * 3) parts = parts.slice(-density * 2);
+    },
+    resize,
+    destroy() {
+      running = false;
+      if (raf) CAF(raf);
+      raf = 0;
+    },
+  };
+}
+
+// —— 一次性「冲天墨粒」爆裂（非 SSR 卡也可用）————————————————————————
+// 在 hostEl 上临时盖一层 canvas，粒子从底部冲天而起，约 dur ms 后自毁。
+// opts: { color, count, dur }
+export function burstInk(hostEl, color, opts = {}) {
+  if (!hostEl || !hostEl.ownerDocument) return;
+  const doc = hostEl.ownerDocument;
+  const canvas = doc.createElement('canvas');
+  canvas.className = 'portrait__burst';
+  hostEl.appendChild(canvas);
+  const ctx = canvas.getContext && canvas.getContext('2d');
+  if (!ctx) { // 无 2D 上下文：留一个光柱占位后清理，保证视觉有反馈。
+    const fallback = { done: false, destroy() { if (canvas.parentNode) canvas.parentNode.removeChild(canvas); fallback.done = true; } };
+    setTimeout(() => { if (canvas.parentNode) canvas.parentNode.removeChild(canvas); fallback.done = true; }, opts.dur || 900);
+    return fallback;
+  }
+  const rect = hostEl.getBoundingClientRect();
+  const w = rect.width || 130, h = rect.height || 180;
+  canvas.width = Math.max(1, Math.round(w));
+  canvas.height = Math.max(1, Math.round(h));
+  const rgb = parseColor(color || '#D4A04A');
+  const count = opts.count || 36;
+  const dur = opts.dur || 900;
+  const parts = [];
+  for (let i = 0; i < count; i++) {
+    parts.push({
+      x: w * (0.2 + Math.random() * 0.6),
+      y: h + 4,
+      vx: (Math.random() - 0.5) * 1.6,
+      vy: -(1.5 + Math.random() * 3.0),
+      r: 2 + Math.random() * 4,
+      life: 1,
+      decay: 0.010 + Math.random() * 0.012,
+    });
+  }
+  const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
+  let raf = 0; let running = true;
+  // done：自然播完自毁后置位，供调用方清理引用句柄（防止数组只增不减）。
+  const handle = {
+    done: false,
+    destroy() {
+      running = false;
+      if (raf) CAF(raf);
+      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
+      handle.done = true;
+    },
+  };
+  function frame() {
+    if (!running) return;
+    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
+    const t = now - start;
+    ctx.clearRect(0, 0, w, h);
+    for (const p of parts) {
+      p.x += p.vx; p.y += p.vy; p.vy += 0.02; p.life -= p.decay;
+      if (p.life <= 0) continue;
+      const a = Math.max(0, p.life * 0.6);
+      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2);
+      grd.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`);
+      grd.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
+      ctx.fillStyle = grd;
+      ctx.beginPath();
+      ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
+      ctx.fill();
+    }
+    if (t < dur) raf = RAF(frame);
+    else { running = false; if (canvas.parentNode) canvas.parentNode.removeChild(canvas); handle.done = true; }
+  }
+  raf = RAF(frame);
+  return handle;
+}
diff --git a/apps/ling-xu-wen-jian-lu/src/ui/portrait3D.js b/apps/ling-xu-wen-jian-lu/src/ui/portrait3D.js
new file mode 100644
index 0000000..939535e
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/ui/portrait3D.js
@@ -0,0 +1,365 @@
+// ============================================================================
+// 灵墟·问剑录 · CSS 角色分层视差引擎（设计稿增量 第一节 / 第八节 portrait3D）
+//
+// 把卡面拆为「三叠层」做裸眼 2.5D 视差（设计稿增量 一）：
+//   ┌ 前景层·特效（.portrait__fx） 水墨粒子 / 流光 / 飘落花瓣（最快）
+//   │   ┌ 角色层·本体（.portrait__char） 程序化立绘：头 / 袍服 / 武器 / 飘动部件（中速）
+//   │   │   ┌ 背景层·意境（.portrait__bg） 水墨山水 / 门派洞府场景（最慢）
+//
+// 角色本体按职业（剑/体/丹/阵/符）程序化绘制，剪影 + 武器轮廓即可识别职业；
+// 稀有度决定动态层级（R 呼吸 / SR 局部飘动 / SSR 全动态粒子 + 破框）。
+//
+// 交互（设计稿增量 四）：
+//   悬停预览：角色微转头 + 飘动加速 + 背景墨迹涟漪；
+//   点击选中：金光描边闪烁 + 底部浮现专属诗词；
+//   拖拽旋转：卡牌绕 Y 轴 ±30° 旋转，三层视差位移；
+//   长按详情：角色「跃出」放大至 120%，进入全屏沉浸预览。
+// 养成反馈（设计稿增量 四·升级/突破成功）：celebrate() 金色光柱 + 冲天水墨粒子 + 微震。
+// ============================================================================
+import { h } from './dom.js';
+import {
+  elEmoji, elName, rarityDef, classDef, silhouetteColor, poemOf,
+  rarityPortrait, affinityLevel, AFFINITY_MAX,
+} from '../config.js';
+import { attachAnimations } from './animationSystem.js';
+import { createInkStream, burstInk } from './inkParticles.js';
+
+// 三层视差速率：背景慢、角色中、特效快（设计稿增量 一·技术实现）。
+const LAYER_SPEED = { bg: 0.25, char: 0.55, fx: 0.95 };
+
+export class Portrait3D {
+  // opts: { card, instance, rarity, onPoem }
+  constructor(opts = {}) {
+    this.card = opts.card;
+    this.instance = opts.instance || {};
+    this.onPoem = opts.onPoem || (() => {});
+    this.rarity = opts.rarity || (this.card && this.card.rarity) || 'R';
+    this._dead = false;
+    this._anim = null;
+    this._stream = null;
+    this._streamCanvas = null;
+    this._streamColor = null;
+    this._ro = null;
+    this._suppressClick = false;
+    this._bursts = [];
+    this._timers = [];
+    this._immersive = null;
+    this._holdTimer = null;
+  }
+
+  mount() {
+    const def = this.card;
+    const r = rarityDef(this.rarity);
+    const rp = rarityPortrait(this.rarity);
+    const cls = classDef(def.cls);
+    const sil = silhouetteColor(def);
+    const aff = (this.instance.affinity || 0);
+    const maxAff = aff >= AFFINITY_MAX;
+
+    // —— 三叠层 ——
+    this.bg = h('div', { class: `portrait__bg scene-${def.element}` });
+    this.fx = h('div', { class: `portrait__fx${rp.particles ? ' is-stream' : ''}${maxAff ? ' is-affinity' : ''}` });
+    this.char = h('div', { class: 'portrait__char' }, this._buildDoll(def, cls, sil, rp, maxAff));
+
+    // —— 卡面本体 ——（保留 cult-3d__card 类以沿用既有阴影 / 渐变样式）
+    this.cardEl = h('div', {
+      class: [
+        'cult-3d__card', 'portrait__card',
+        `rarity-${this.rarity}`, `dyn-${rp.dynamic}`,
+        rp.inkline ? 'inkline' : '',
+        rp.breakFrame ? 'breakframe' : '',
+        maxAff ? 'is-affinity' : '',
+      ].filter(Boolean).join(' '),
+      style: {
+        background: `linear-gradient(160deg, ${r.color}, ${shade(r.color, -0.28)})`,
+        '--sil': sil,
+        '--sil-d': shade(sil, -0.35),
+        '--sil-l': shade(sil, 0.32),
+        '--cls': cls.color,
+      },
+    }, this.bg, this.char, this.fx, this._buildSeal(rp));
+
+    // wrap 保留 cult-3d 类（冒烟测试据此定位卡牌展示区）。
+    this.wrap = h('div', { class: 'cult-3d portrait' }, this.cardEl);
+
+    // SSR 全动态水墨粒子背景（无 2D 上下文时降级空操作）。
+    if (rp.particles) {
+      const canvas = h('canvas', { class: 'portrait__stream' });
+      this.fx.appendChild(canvas);
+      this._streamCanvas = canvas;
+      this._streamColor = sil;
+      this._stream = createInkStream(canvas, { color: sil, density: 24 });
+      // wrap 此时尚未插入 DOM，createInkStream 的首次 resize 拿不到真实尺寸；
+      // 等 canvas 挂载后再补一次 resize（见 _deferStreamResize）。
+      this._deferStreamResize(canvas);
+    }
+    // 飘动 / 呼吸 / 眨眼动画系统。
+    this._anim = attachAnimations(this.cardEl, def, this.rarity, {
+      blinkEyes: this.char.querySelector('.portrait__eyes'),
+    });
+
+    this._wire();
+    this._applyTransform(0, 16); // 初始微侧视角，营造立体感
+    return this.wrap;
+  }
+
+  // 等 canvas 真正插入 DOM 且有尺寸后，对常驻粒子流补一次 resize。
+  // 优先 ResizeObserver（顺带覆盖后续布局变化）；不可用时轮询 isConnected。
+  _deferStreamResize(canvas) {
+    const doResize = () => { if (!this._dead && this._stream) this._stream.resize(); };
+    if (typeof ResizeObserver === 'function') {
+      this._ro = new ResizeObserver(doResize);
+      this._ro.observe(canvas);
+      return;
+    }
+    let tries = 0;
+    const tick = () => {
+      if (this._dead || !this._stream) return;
+      if (canvas.isConnected) doResize();
+      else if (tries++ < 90) setTimeout(tick, 32); // 约 3s 内等待插入
+    };
+    setTimeout(tick, 0);
+  }
+
+  // —— 程序化立绘：头 / 袍服剪影 / 武器 / 飘动部件 ——
+  _buildDoll(def, cls, sil, rp, maxAff) {
+    const parts = [];
+    // 武器（职业识别核心），位置由 CSS 的 cls-<key> 控制。
+    parts.push(h('span', { class: 'pc__weapon' }, cls.weapon));
+    // 袍服躯干：clip-path 剪影，按剪影色着色。
+    parts.push(h('span', { class: 'pc__robe' }));
+    // 头部 + 眼睛（满好感时微笑）。
+    parts.push(h('span', { class: 'pc__head' },
+      h('span', { class: `portrait__eyes${maxAff ? ' smile' : ''}` }, h('i'), h('i')),
+      h('span', { class: 'pc__hair' }),
+    ));
+    // 飘动部件（仅 SR/SSR）。hair 额外由头部承担，这里补 ribbon / 双袖等。
+    if (rp.dynamic >= 1) {
+      for (const p of cls.sway) {
+        if (p === 'hair') continue; // 头发已在头部，避免重复
+        parts.push(h('span', { class: `pc__part part-${p}` }));
+      }
+    }
+    return h('div', { class: `portrait__doll cls-${cls.key}` }, ...parts);
+  }
+
+  // 朱砂印章：R/SR 左下角，SSR 右上角金字飘浮（设计稿增量 二）。
+  _buildSeal(rp) {
+    return h('span', { class: `portrait__seal pos-${rp.breakFrame ? 'tr' : 'bl'}` }, rp.seal);
+  }
+
+  // —— 交互布线 ——
+  _wire() {
+    const wrap = this.wrap;
+    let dragging = false;
+    let moved = 0;
+    let startX = 0, startY = 0;
+    let baseRot = 16;
+    let hoverPx = 0; // 悬停视差量 [-1..1]
+
+    const cx = (e) => (e.touches ? e.touches[0].clientX : e.clientX);
+    const cy = (e) => (e.touches ? e.touches[0].clientY : e.clientY);
+
+    wrap.addEventListener('pointerenter', () => this._setHover(true));
+    wrap.addEventListener('pointerleave', () => { this._setHover(false); if (!dragging) this._applyTransform(0, baseRot); });
+
+    wrap.addEventListener('pointerdown', (e) => {
+      if (this._dead) return;
+      dragging = false; moved = 0;
+      this._suppressClick = false;
+      startX = cx(e); startY = cy(e);
+      try { if (wrap.setPointerCapture && e.pointerId != null) wrap.setPointerCapture(e.pointerId); } catch (_) {}
+      // 长按详情（1.5s）。
+      this._holdTimer = setTimeout(() => {
+        if (!dragging && moved < 6) this._openImmersive();
+      }, 1500);
+    });
+
+    wrap.addEventListener('pointermove', (e) => {
+      if (this._dead) return;
+      const dx = cx(e) - startX;
+      const dy = cy(e) - startY;
+      if (e.buttons > 0 || dragging) {
+        // 拖拽旋转：累计位移 → 绕 Y 轴 ±30°（设计稿 四·拖拽旋转）。
+        moved += Math.abs(dx) + Math.abs(dy);
+        if (moved > 6) {
+          dragging = true;
+          clearTimeout(this._holdTimer);
+          const rot = Math.max(-30, Math.min(30, baseRot + dx * 0.35));
+          this._applyTransform(dy * 0.08, rot);
+        }
+      } else {
+        // 悬停视差：指针偏移驱动三层位移（裸眼 2.5D）。
+        const rect = wrap.getBoundingClientRect();
+        const w = rect.width || 130;
+        hoverPx = Math.max(-1, Math.min(1, (cx(e) - (rect.left + w / 2)) / (w / 2)));
+        this._applyParallax(hoverPx);
+      }
+    });
+
+    const end = () => {
+      clearTimeout(this._holdTimer);
+      const wasDrag = dragging;
+      dragging = false;
+      if (wasDrag) { this._applyTransform(0, baseRot); this._applyParallax(0); }
+      else { /* 视作点击，由 click 处理 */ }
+    };
+    wrap.addEventListener('pointerup', end);
+    wrap.addEventListener('pointercancel', end);
+
+    // 点击选中：金光描边闪烁 + 底部浮现诗词（设计稿 四·点击选中）。
+    wrap.addEventListener('click', () => {
+      // 长按打开沉浸预览后的 pointerup 仍会派发 click，这里消费掉，避免额外选中。
+      if (this._suppressClick) { this._suppressClick = false; return; }
+      if (this._dead || moved > 6) return;
+      this._strike();
+      this._showPoem();
+    });
+  }
+
+  _setHover(on) {
+    if (this._anim && this._anim.setHover) this._anim.setHover(on);
+    this.cardEl.classList.toggle('is-hover', on);
+    if (on) this._ripple(); // 背景墨迹涟漪
+  }
+
+  // 三层 transform：cardEl 绕 Y/X 轴旋转；bg/char/fx 各自 translateX 视差。
+  _applyTransform(tiltX, rotY) {
+    if (this._dead) return;
+    this._rotY = rotY;
+    this.cardEl.style.transform = `rotateX(${(12 + tiltX).toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
+    // 记录当前角度供 portrait-shake 关键帧引用，避免震屏时跳回固定 16deg。
+    this.cardEl.style.setProperty('--rot-y', `${rotY.toFixed(2)}deg`);
+    // 旋转时三层也产生轻微视差位移，强化「实物把玩」感。
+    const px = (rotY - 16) / 30; // [-1..1]
+    this._applyParallax(px);
+  }
+  _applyParallax(px) {
+    const amt = (px || 0) * 12; // 最大 ±12px 位移
+    if (this.bg) this.bg.style.transform = `translateX(${(-amt * LAYER_SPEED.bg).toFixed(2)}px)`;
+    if (this.char) this.char.style.transform = `translateX(${(-amt * LAYER_SPEED.char).toFixed(2)}px)`;
+    if (this.fx) this.fx.style.transform = `translateX(${(-amt * LAYER_SPEED.fx).toFixed(2)}px)`;
+  }
+
+  // 背景墨迹涟漪（悬停时扩散一圈）。
+  _ripple() {
+    const rip = h('span', { class: 'portrait__ripple' });
+    this.bg.appendChild(rip);
+    setTimeout(() => { if (rip.parentNode) rip.parentNode.removeChild(rip); }, 900);
+  }
+
+  // 金光描边闪烁（点击选中）。
+  _strike() {
+    this.cardEl.classList.remove('is-strike');
+    void this.cardEl.offsetWidth; // 强制重绘以重启动画
+    this.cardEl.classList.add('is-strike');
+    setTimeout(() => this.cardEl.classList.remove('is-strike'), 600);
+  }
+
+  // 底部浮现专属诗词。
+  _showPoem() {
+    const text = poemOf(this.card);
+    if (!text) return;
+    this.onPoem(text);
+    const node = h('span', { class: 'portrait__poem' }, `「${text}」`);
+    this.cardEl.appendChild(node);
+    setTimeout(() => { if (node.parentNode) node.parentNode.removeChild(node); }, 2600);
+  }
+
+  // —— 全屏沉浸预览（长按 1.5s）——
+  _openImmersive() {
+    if (this._immersive || this._dead) return;
+    const doc = this.wrap.ownerDocument;
+    const clone = this.cardEl.cloneNode(true);
+    clone.classList.add('is-clone');
+    const backdrop = h('div', { class: 'portrait__immersive' },
+      h('div', { class: 'portrait__immersive-tip' }, '沉浸预览 · 点击关闭'),
+      h('div', { class: 'portrait__immersive-stage' }, clone),
+    );
+    (doc.body || this.wrap.parentNode).appendChild(backdrop);
+    // cloneNode 不会复制画布内容：为克隆的粒子画布重建一条水墨流，
+    // 保证沉浸预览下 SSR「全动态」效果不退化为静态分层。
+    let cloneStream = null;
+    const cloneCanvas = clone.querySelector('canvas.portrait__stream');
+    if (cloneCanvas) {
+      cloneStream = createInkStream(cloneCanvas, { color: this._streamColor || silhouetteColor(this.card), density: 24 });
+    }
+    void backdrop.offsetWidth;
+    backdrop.classList.add('show');
+    // 长按后的 pointerup 仍会派发 click，标记由 click 处理器消费。
+    this._suppressClick = true;
+    let closed = false;
+    const close = () => {
+      if (closed) return;
+      closed = true;
+      if (cloneStream && cloneStream.destroy) cloneStream.destroy();
+      cloneStream = null;
+      backdrop.classList.remove('show');
+      const t = setTimeout(() => { if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop); this._immersive = null; }, 260);
+      this._timers.push(t);
+      backdrop.removeEventListener('click', close);
+      doc.removeEventListener('keydown', onKey);
+    };
+    const onKey = (e) => { if (e.key === 'Escape') close(); };
+    backdrop.addEventListener('click', close);
+    doc.addEventListener('keydown', onKey);
+    this._immersive = { close };
+  }
+
+  // —— 养成成功特效（升级 / 突破 / 升星 / 进化）——
+  // 金色光柱笼罩 + 底部冲天水墨粒子 + 屏幕微震（设计稿 四·升级/突破成功）。
+  celebrate() {
+    if (this._dead) return;
+    const sil = silhouetteColor(this.card);
+    this.cardEl.classList.add('is-celebrate');
+    const beam = h('span', { class: 'portrait__beam' });
+    this.cardEl.appendChild(beam);
+    // 底部冲天墨粒（SSR 复用常驻流，其它卡临时爆裂）。
+    if (this._stream && this._stream.burst) this._stream.burst();
+    else {
+      // 先回收已自毁（done）的句柄，避免长时间会话下数组只增不减。
+      this._bursts = this._bursts.filter((b) => b && !b.done);
+      this._bursts.push(burstInk(this.cardEl, sil, { count: 30, dur: 900 }));
+    }
+    this._shake();
+    const t = setTimeout(() => {
+      this.cardEl.classList.remove('is-celebrate');
+      if (beam.parentNode) beam.parentNode.removeChild(beam);
+    }, 900);
+    this._timers.push(t);
+  }
+
+  _shake() {
+    this.cardEl.classList.remove('is-shake');
+    void this.cardEl.offsetWidth;
+    this.cardEl.classList.add('is-shake');
+    const t = setTimeout(() => this.cardEl.classList.remove('is-shake'), 340);
+    this._timers.push(t);
+  }
+
+  destroy() {
+    this._dead = true;
+    clearTimeout(this._holdTimer);
+    // 先关闭沉浸预览（close 可能再 push 一个收尾 timer），随后统一清理。
+    if (this._immersive && this._immersive.close) this._immersive.close();
+    this._immersive = null;
+    if (this._anim && this._anim.destroy) this._anim.destroy();
+    if (this._stream && this._stream.destroy) this._stream.destroy();
+    for (const b of this._bursts) if (b && b.destroy) b.destroy();
+    this._bursts = [];
+    if (this._ro) { this._ro.disconnect(); this._ro = null; }
+    for (const t of this._timers) clearTimeout(t);
+    this._timers = [];
+    this._anim = this._stream = null;
+  }
+}
+
+// 颜色加深 / 变亮（与 app.js 同实现，独立于此避免循环依赖）。
+function shade(hex, amt) {
+  if (!hex || hex[0] !== '#') return hex || '#333';
+  const n = hex.length === 4
+    ? hex.slice(1).split('').map((c) => parseInt(c + c, 16))
+    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
+  const f = (v) => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
+  return `rgb(${f(n[0])}, ${f(n[1])}, ${f(n[2])})`;
+}
diff --git a/apps/ling-xu-wen-jian-lu/src/ui/silhouetteRenderer.js b/apps/ling-xu-wen-jian-lu/src/ui/silhouetteRenderer.js
new file mode 100644
index 0000000..120fd8b
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/ui/silhouetteRenderer.js
@@ -0,0 +1,43 @@
+// ============================================================================
+// 灵墟·问剑录 · 战场剪影生成器（设计稿增量 第六节：编队/战斗中的角色微缩表现）
+//
+// 2.5D 战场上角色不以完整立绘出现，而用「皮影剪影 + 属性光晕」模式：
+//   - 角色形象：立绘的简化剪影（人物轮廓 + 武器），填充为该角色的五行代表色。
+//   - 稀有度标识：剪影底部用对应稀有度的光环（青玉 / 紫金 / 彩凰光圈）旋转环绕。
+//   - 受击 / 阵亡 / 选中态由 battle-scene.js 叠加 .hit-flash / .dying / .acting 控制。
+//
+// 返回一个 DOM 节点，嵌入 battle-scene 的 .bs-unit__art 即可。
+// ============================================================================
+import { h } from './dom.js';
+import { classDef, silhouetteColor, elDef } from '../config.js';
+
+// card：卡牌定义（含 cls / silhouetteColor / element）；rarity：用于光环配色。
+export function renderSilhouette(card, rarity, opts = {}) {
+  const cls = classDef(card && card.cls);
+  const sil = silhouetteColor(card);
+  const el = elDef(card && card.element);
+  const size = opts.size || 'sm';
+  return h('div', {
+    class: `silu silu--${cls.key} silu--${size} rarity-${rarity || (card && card.rarity) || 'R'}`,
+    style: { '--sil': sil, '--sil-d': shade(sil, -0.35), '--sil-l': shade(sil, 0.3) },
+    title: cls.pose,
+  },
+    h('span', { class: 'silu__body' }),
+    h('span', { class: 'silu__head' }),
+    h('span', { class: 'silu__weapon' }, cls.weapon),
+    // 底部稀有度光环（青玉 / 紫金 / 彩凰）
+    h('span', { class: `silu__aura aura-${rarity || (card && card.rarity) || 'R'}` }),
+    // 五行代表色微标（便于一眼分辨属性）
+    el ? h('span', { class: 'silu__el' }, el.emoji) : null,
+  );
+}
+
+// 颜色加深 / 变亮：amt 负数加深、正数变亮（与 app.js 的 shade 同实现，独立于此处避免循环依赖）。
+function shade(hex, amt) {
+  if (!hex || hex[0] !== '#') return hex || '#333';
+  const n = hex.length === 4
+    ? hex.slice(1).split('').map((c) => parseInt(c + c, 16))
+    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
+  const f = (v) => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
+  return `rgb(${f(n[0])}, ${f(n[1])}, ${f(n[2])})`;
+}
diff --git a/apps/ling-xu-wen-jian-lu/src/ui/style.css b/apps/ling-xu-wen-jian-lu/src/ui/style.css
index 1c9f596..413dcee 100644
--- a/apps/ling-xu-wen-jian-lu/src/ui/style.css
+++ b/apps/ling-xu-wen-jian-lu/src/ui/style.css
@@ -554,3 +554,232 @@
 .sweep-batch-btns { display: flex; gap: 8px; margin-top: 8px; }
 .stamina-chip { display: inline-flex; align-items: center; gap: 4px; background: rgba(74,144,194,0.14); border: 1px solid rgba(74,144,194,0.4); border-radius: 12px; padding: 2px 8px; font-size: 12px; }
 
+/* ============================================================================
+   角色人物视觉系统（设计稿增量 第一~六节）
+   —— 2.5D 三叠层视差立绘 + 稀有度差异 + 职业剪影 + 交互反馈
+   ============================================================================ */
+/* —— 三叠层容器 —— */
+.portrait__card { position: relative; transition: transform .12s ease; }
+.portrait__bg, .portrait__char, .portrait__fx {
+  position: absolute; inset: 0; pointer-events: none; border-radius: 14px;
+}
+.portrait__bg { z-index: 0; overflow: hidden; transition: transform .25s ease; }
+.portrait__char { z-index: 1; display: flex; align-items: flex-end; justify-content: center; transition: transform .18s ease; }
+.portrait__fx { z-index: 2; overflow: hidden; transition: transform .12s ease; }
+.portrait__card.breakframe { overflow: visible; }
+.portrait__card.breakframe .portrait__char { overflow: visible; }
+
+/* —— 意境背景（水墨山水 / 门派洞府，低饱和度）—— */
+.portrait__bg.scene-metal { background: radial-gradient(circle at 30% 20%, #e9e2cf, #cfc6ad 70%, #b6aa8c); }
+.portrait__bg.scene-wood  { background: radial-gradient(circle at 30% 25%, #d7e6cf, #b6cda6 70%, #8fae7c); }
+.portrait__bg.scene-water { background: radial-gradient(circle at 35% 20%, #d4e2ee, #aecbe2 70%, #82a6c4); }
+.portrait__bg.scene-fire  { background: radial-gradient(circle at 35% 25%, #f0d6cf, #e2a59a 70%, #c66f5f); }
+.portrait__bg.scene-earth { background: radial-gradient(circle at 30% 25%, #e4d8c4, #cbb38e 70%, #a08254); }
+.portrait__bg::after {
+  content: ''; position: absolute; inset: 0;
+  background: radial-gradient(circle at 50% 62%, transparent 38%, rgba(44,24,16,0.30));
+}
+/* R 卡：纯色宣纸底纹，无具体场景（设计稿增量 二·2.1）*/
+.portrait__card.inkline .portrait__bg { background: var(--paper); }
+.portrait__card.inkline .portrait__bg::after { background: radial-gradient(circle at 50% 60%, transparent 55%, rgba(44,24,16,0.10)); }
+
+/* —— 角色本体·程序化立绘（头 / 袍服 / 武器 / 飘动部件）—— */
+.portrait__doll { position: absolute; left: 21%; bottom: 14%; width: 58%; }
+.portrait__card.dyn-0 .portrait__doll { height: 50%; }   /* R 占卡面 50% */
+.portrait__card.dyn-1 .portrait__doll { height: 64%; }   /* SR 65% */
+.portrait__card.dyn-2 .portrait__doll { height: 74%; }   /* SSR 75% */
+
+.pc__robe {
+  position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
+  width: 80%; height: 62%; z-index: 1;
+  background: linear-gradient(180deg, var(--sil-l), var(--sil) 55%, var(--sil-d));
+  clip-path: polygon(38% 0, 62% 0, 78% 100%, 22% 100%);
+  box-shadow: inset 0 -6px 10px rgba(0,0,0,0.25);
+}
+/* 五大职业袍服剪影（姿态识别，设计稿增量 三）*/
+.cls-sword .pc__robe    { clip-path: polygon(42% 0, 58% 0, 64% 100%, 36% 100%); }
+.cls-body .pc__robe     { clip-path: polygon(26% 0, 74% 0, 88% 100%, 12% 100%); }
+.cls-alchemy .pc__robe  { clip-path: polygon(34% 0, 66% 0, 96% 100%, 4% 100%); }
+.cls-array .pc__robe    { clip-path: polygon(30% 4%, 70% 4%, 82% 42%, 96% 100%, 4% 100%, 18% 42%); }
+.cls-talisman .pc__robe { clip-path: polygon(34% 0, 66% 0, 80% 100%, 20% 100%); }
+/* R 卡墨线白描：袍服改为淡墨晕染（设计稿增量 二·2.1）*/
+.portrait__card.inkline .pc__robe { background: rgba(44,24,16,0.22); box-shadow: inset 0 0 0 2px rgba(44,24,16,0.35); }
+
+.pc__head {
+  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
+  width: 42%; aspect-ratio: 1; border-radius: 50%; z-index: 2;
+  background: linear-gradient(160deg, #f3e7d6, #e3cdb4);
+  box-shadow: inset -2px -2px 4px rgba(0,0,0,0.15);
+}
+.portrait__card.inkline .pc__head { background: var(--paper); box-shadow: inset 0 0 0 2px rgba(44,24,16,0.4); }
+.pc__hair {
+  position: absolute; top: -10%; left: 15%; width: 70%; height: 76%;
+  border-radius: 50% 50% 40% 40%; z-index: 0; transform-origin: 50% 0;
+  background: linear-gradient(180deg, var(--sil-d), var(--sil));
+}
+.portrait__eyes { position: absolute; top: 46%; left: 50%; transform: translate(-50%,-50%); display: flex; gap: 5px; }
+.portrait__eyes i { width: 4px; height: 5px; background: var(--ink); border-radius: 50%; transition: height .08s ease; }
+.portrait__eyes.blink i { height: 1px; }
+.portrait__eyes.smile i { height: 3px; border-radius: 3px 3px 0 0; } /* 满好感·微笑（设计稿 四）*/
+
+.pc__weapon {
+  position: absolute; z-index: 3; font-size: 22px; line-height: 1;
+  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));
+}
+.cls-sword .pc__weapon    { right: -2%; top: 30%; transform: rotate(22deg); }
+.cls-body .pc__weapon     { left: 50%; bottom: -6%; transform: translateX(-50%); font-size: 20px; }
+.cls-alchemy .pc__weapon  { left: 50%; bottom: -10%; transform: translateX(-50%); font-size: 20px; }
+.cls-array .pc__weapon    { left: 50%; top: 40%; transform: translate(-50%,-50%); font-size: 26px; opacity: .82; z-index: 0; }
+.cls-talisman .pc__weapon { left: 50%; top: 56%; transform: translate(-50%,-50%) rotate(-8deg); font-size: 20px; }
+
+/* 飘动部件（衣袂 / 飘带 / 双袖，仅 SR/SSR 渲染）*/
+.pc__part { position: absolute; transform-origin: 50% 0; z-index: 2; }
+.part-ribbon { right: 6%; top: 20%; width: 11%; height: 52%; border-radius: 0 0 45% 45%; opacity: .85; background: linear-gradient(180deg, var(--sil-l), var(--sil)); }
+.part-arm_L { left: 3%; top: 36%; width: 17%; height: 32%; background: linear-gradient(180deg, var(--sil), var(--sil-d)); clip-path: polygon(40% 0, 100% 0, 78% 100%, 0 100%); }
+.part-arm_R { right: 3%; top: 36%; width: 17%; height: 32%; background: linear-gradient(180deg, var(--sil), var(--sil-d)); clip-path: polygon(0 0, 60% 0, 100% 100%, 22% 100%); }
+
+/* —— 动态系统：R 呼吸 / SR 局部飘动 / SSR 全动态（设计稿增量 二）—— */
+@keyframes pc-breath { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
+@keyframes pc-sway   { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(6deg); } }
+@keyframes pc-sway-r { 0%,100% { transform: rotate(6deg); } 50% { transform: rotate(-7deg); } }
+.portrait__card.dyn-0 .portrait__doll { animation: pc-breath 4s ease-in-out infinite; }
+.portrait__card.dyn-1 .pc__hair    { animation: pc-sway   3.6s ease-in-out infinite; }
+.portrait__card.dyn-1 .part-ribbon { animation: pc-sway-r 4s   ease-in-out infinite; }
+.portrait__card.dyn-1 .part-arm_L  { animation: pc-sway   4.4s ease-in-out infinite; }
+.portrait__card.dyn-1 .part-arm_R  { animation: pc-sway-r 4.2s ease-in-out infinite; }
+.portrait__card.dyn-2 .pc__hair    { animation: pc-sway   2.4s ease-in-out infinite; }
+.portrait__card.dyn-2 .part-ribbon { animation: pc-sway-r 2.6s ease-in-out infinite; }
+.portrait__card.dyn-2 .part-arm_L  { animation: pc-sway   3s   ease-in-out infinite; }
+.portrait__card.dyn-2 .part-arm_R  { animation: pc-sway-r 2.8s ease-in-out infinite; }
+/* SSR 流光循环扫过全卡（设计稿增量 二·2.3 七彩流光）*/
+.portrait__card.dyn-2 .portrait__fx::after {
+  content: ''; position: absolute; inset: -40% -10%; pointer-events: none;
+  background: linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%);
+  animation: portrait-shine 3.4s ease-in-out infinite;
+}
+@keyframes portrait-shine { 0% { transform: translateX(-60%); } 60%,100% { transform: translateX(60%); } }
+/* 悬停：飘动加速（设计稿增量 四·悬停预览）*/
+.portrait__card.is-hover .pc__hair,
+.portrait__card.is-hover .part-ribbon,
+.portrait__card.is-hover .part-arm_L,
+.portrait__card.is-hover .part-arm_R { animation-duration: 1.1s !important; }
+.portrait__card.is-hover .pc__head { transform: translateX(-50%) rotateY(8deg); transition: transform .2s ease; }
+
+/* —— 朱砂印章（R/SR 左下；SSR 右上金字，设计稿增量 二）—— */
+.portrait__seal {
+  position: absolute; z-index: 4; font-size: 9px; letter-spacing: 1px; font-weight: bold;
+  padding: 3px 6px; border-radius: 3px; color: var(--paper);
+  background: var(--red); box-shadow: 0 1px 3px rgba(0,0,0,0.3);
+}
+.portrait__seal.pos-bl { left: 8px; bottom: 8px; }
+.portrait__seal.pos-tr { right: 8px; top: 8px; color: var(--ink); background: linear-gradient(135deg, var(--gold), #b8862f); }
+
+/* —— 交互反馈（设计稿增量 四）—— */
+.portrait__ripple {
+  position: absolute; left: 50%; top: 50%; width: 0; height: 0; border: 2px solid rgba(255,255,255,0.5);
+  border-radius: 50%; transform: translate(-50%,-50%); animation: portrait-ripple .9s ease-out forwards;
+}
+@keyframes portrait-ripple { to { width: 150%; height: 150%; opacity: 0; } }
+.portrait__card.is-strike { animation: portrait-strike .6s ease; }
+@keyframes portrait-strike {
+  0%,100% { box-shadow: 0 14px 30px rgba(0,0,0,0.3); }
+  30% { box-shadow: 0 0 0 3px var(--gold), 0 0 22px 6px rgba(212,160,74,0.8); }
+}
+.portrait__poem {
+  position: absolute; left: 50%; bottom: 12px; transform: translateX(-50%); white-space: nowrap;
+  font-size: 11px; letter-spacing: 1px; color: var(--paper); z-index: 5;
+  background: rgba(44,24,16,0.72); padding: 3px 9px; border-radius: 10px;
+  text-shadow: 0 1px 2px rgba(0,0,0,0.5); animation: portrait-poem 2.6s ease forwards;
+}
+@keyframes portrait-poem {
+  0% { opacity: 0; transform: translate(-50%, 8px); }
+  15% { opacity: 1; transform: translate(-50%, 0); }
+  80% { opacity: 1; }
+  100% { opacity: 0; }
+}
+/* 升级 / 突破成功：金色光柱 + 微震（celebrate）*/
+.portrait__beam {
+  position: absolute; left: 50%; bottom: 0; width: 70%; height: 100%; z-index: 4; pointer-events: none;
+  transform-origin: bottom; mix-blend-mode: screen;
+  background: linear-gradient(0deg, rgba(212,160,74,0.7), rgba(212,160,74,0));
+  animation: portrait-beam .9s ease-out forwards;
+}
+@keyframes portrait-beam { 0% { opacity: 0; transform: translateX(-50%) scaleY(0); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateX(-50%) scaleY(1); } }
+.portrait__card.is-shake { animation: portrait-shake .34s ease; }
+/* --rot-y 由 portrait3D._applyTransform 实时写入，震屏时不跳回固定角度 */
+@keyframes portrait-shake {
+  0%,100% { transform: rotateX(12deg) rotateY(var(--rot-y, 16deg)); }
+  20% { transform: rotateX(12deg) rotateY(var(--rot-y, 16deg)) translate(-2px, 1px); }
+  40% { transform: rotateX(12deg) rotateY(var(--rot-y, 16deg)) translate(2px, -1px); }
+  60% { transform: rotateX(12deg) rotateY(var(--rot-y, 16deg)) translate(-1px, 1px); }
+  80% { transform: rotateX(12deg) rotateY(var(--rot-y, 16deg)) translate(1px, 0); }
+}
+
+/* SSR 水墨粒子画布 + 一次性冲天墨粒爆裂 */
+.portrait__stream, .portrait__burst { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
+.portrait__stream { mix-blend-mode: screen; opacity: .9; }
+
+/* —— 满好感：柔光 + 粉色花瓣环绕（设计稿增量 四）—— */
+.portrait__card.is-affinity { box-shadow: 0 0 16px 3px rgba(255,180,200,0.55), 0 14px 30px rgba(0,0,0,0.3); }
+.portrait__fx.is-affinity::before, .portrait__fx.is-affinity::after {
+  content: '🌸'; position: absolute; font-size: 12px; left: 28%; top: -10%; opacity: 0;
+  animation: petal-fall 5s linear infinite;
+}
+.portrait__fx.is-affinity::after { left: 62%; animation-delay: -2.5s; }
+@keyframes petal-fall {
+  0% { top: -10%; opacity: 0; }
+  15% { opacity: .9; }
+  100% { top: 110%; opacity: 0; transform: rotate(360deg) translateX(8px); }
+}
+
+/* —— 长按·全屏沉浸预览（设计稿增量 四·长按详情）—— */
+.portrait__immersive {
+  position: fixed; inset: 0; z-index: 200; display: flex; flex-direction: column;
+  align-items: center; justify-content: center; gap: 14px;
+  background: rgba(0,0,0,0); transition: background .26s ease;
+}
+.portrait__immersive.show { background: rgba(20,12,6,0.6); }
+.portrait__immersive-tip { color: var(--paper); font-size: 12px; opacity: 0; transition: opacity .26s ease .1s; }
+.portrait__immersive.show .portrait__immersive-tip { opacity: .85; }
+.portrait__immersive-stage { transform: scale(.6); opacity: 0; transition: transform .3s cubic-bezier(.2,.8,.3,1.2), opacity .26s ease; }
+.portrait__immersive.show .portrait__immersive-stage { transform: scale(1.15); opacity: 1; }
+.portrait__immersive-stage .cult-3d__card { width: 200px !important; height: 280px !important; transform: rotateX(6deg) rotateY(0deg) !important; }
+.portrait__immersive-stage .pc__weapon { font-size: 34px; }
+
+/* ============================================================================
+   战场剪影·皮影模式（设计稿增量 第六节）
+   ============================================================================ */
+.silu { position: relative; width: 100%; height: 100%; }
+.silu__body {
+  position: absolute; left: 50%; bottom: 10%; transform: translateX(-50%);
+  width: 60%; height: 62%;
+  background: linear-gradient(180deg, var(--sil-l), var(--sil) 60%, var(--sil-d));
+  clip-path: polygon(40% 0, 60% 0, 72% 100%, 28% 100%);
+}
+.silu__head {
+  position: absolute; left: 50%; top: 8%; transform: translateX(-50%);
+  width: 40%; aspect-ratio: 1; border-radius: 50%;
+  background: linear-gradient(160deg, var(--sil-l), var(--sil));
+}
+.silu__weapon { position: absolute; left: 50%; top: 42%; transform: translate(-50%,-50%); font-size: 13px; filter: drop-shadow(0 1px 1px rgba(0,0,0,.4)); }
+.silu__el { position: absolute; right: -1px; top: -1px; font-size: 9px; opacity: .85; }
+.silu__aura {
+  position: absolute; left: 50%; bottom: -2%; transform: translateX(-50%);
+  width: 82%; height: 12%; border-radius: 50%; border: 2px solid var(--sil);
+  opacity: .55; animation: silu-aura 4s linear infinite;
+}
+@keyframes silu-aura { from { transform: translateX(-50%) rotate(0); } to { transform: translateX(-50%) rotate(360deg); } }
+/* 各职业剪影差异 */
+.silu--sword .silu__body    { clip-path: polygon(44% 0, 56% 0, 62% 100%, 38% 100%); }
+.silu--body .silu__body     { clip-path: polygon(28% 0, 72% 0, 86% 100%, 14% 100%); }
+.silu--alchemy .silu__body  { clip-path: polygon(34% 0, 66% 0, 94% 100%, 6% 100%); }
+.silu--array .silu__body    { clip-path: polygon(30% 6%, 70% 6%, 82% 44%, 96% 100%, 4% 100%, 18% 44%); }
+.silu--talisman .silu__body { clip-path: polygon(34% 0, 66% 0, 80% 100%, 20% 100%); }
+/* 稀有度光环：青玉 / 紫金 / 彩凰 */
+.silu .aura-R   { border-color: var(--sil); }
+.silu .aura-SR  { border-color: var(--r-SR); box-shadow: 0 0 6px var(--r-SR); }
+.silu .aura-SSR { border-color: var(--gold); box-shadow: 0 0 8px var(--gold); opacity: .75; }
+/* 战场态：出手选中 → 剪影还原为淡彩实体（设计稿 六·选中高亮）*/
+.bs-unit.acting .silu__body, .bs-unit.acting .silu__head { filter: saturate(1.25) brightness(1.1); }
+.bs-unit.acting .silu__body { box-shadow: 0 0 8px rgba(212,160,74,.7); }
+
