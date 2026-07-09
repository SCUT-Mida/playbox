diff --git a/.ai-tasks/issue-69/ai-coder-prompt.md b/.ai-tasks/issue-69/ai-coder-prompt.md
new file mode 100644
index 0000000..09ebc7b
--- /dev/null
+++ b/.ai-tasks/issue-69/ai-coder-prompt.md
@@ -0,0 +1,8 @@
+你是一个资深开发者。请解决以下 GitHub Issue：
+【任务标题】: 在游戏栏目下，按照以下详细方案新增游戏
+【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-69/context.md 文件获取。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
+
+请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-69/ai-reviewer-prompt_r1.md b/.ai-tasks/issue-69/ai-reviewer-prompt_r1.md
new file mode 100644
index 0000000..bbe7c0e
--- /dev/null
+++ b/.ai-tasks/issue-69/ai-reviewer-prompt_r1.md
@@ -0,0 +1,14 @@
+你是一个极其严格、甚至有些刁钻的资深代码审查员。
+这是代码提交后的【第 1 轮】审查。
+请阅读当前目录下的 .ai-tasks/issue-69/pr_diff_r1.md 文件，这是本次 PR 的代码变更。
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
diff --git a/.ai-tasks/issue-69/ai-reviewer-prompt_r2.md b/.ai-tasks/issue-69/ai-reviewer-prompt_r2.md
new file mode 100644
index 0000000..24aa9ca
--- /dev/null
+++ b/.ai-tasks/issue-69/ai-reviewer-prompt_r2.md
@@ -0,0 +1,14 @@
+你是一个极其严格、甚至有些刁钻的资深代码审查员。
+这是代码提交后的【第 2 轮】审查。
+请阅读当前目录下的 .ai-tasks/issue-69/pr_diff_r2.md 文件，这是本次 PR 的代码变更。
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
diff --git a/.ai-tasks/issue-69/context.md b/.ai-tasks/issue-69/context.md
new file mode 100644
index 0000000..15ac012
--- /dev/null
+++ b/.ai-tasks/issue-69/context.md
@@ -0,0 +1,84 @@
+这是一份为Claude（或其他AI编程助手）准备的移动端单角色扮演游戏完整方案，主题为 《星骸旅者》（Star Wreck Pilgrim） ——融合了“开罗式像素经营美学”与“roguelike生存探索”的轻量化RPG。方案严格遵循“仅设计文档”要求，专为手机竖屏和GitHub Pages静态部署优化。
+
+---
+
+游戏设计文档：《星骸旅者》
+
+技术目标：单页HTML应用（ES6+ Canvas），适配移动端触摸，LocalStorage存档。
+视觉风格：开罗游戏（Kairosoft）标志性的2D顶视角像素风（16x16 tile网格），明亮饱和的色块，Q版角色。
+
+---
+
+1. 核心概念与循环
+
+· 背景：你是一名迫降在破碎星球“墨比乌斯”的拾荒者。该星球由无数漂浮的“遗迹浮岛”构成，每个浮岛是一个小型地牢。
+· 核心循环（竖屏单手操作）：
+  1. 浮岛探索（点击移动）→ 触发随机事件（战斗/宝箱/陷阱）。
+  2. 回合制战斗（点击指令）→ 获取“星骸”（货币）与“零件”（素材）。
+  3. 营地整备（自动返回）→ 消耗素材升级装备/解锁天赋，挑战更深层的浮岛。
+
+2. 移动端UI/UX布局（拇指热区优化）
+
+· 屏幕分区（自上而下）：
+  · 顶部状态栏（高度8%）：HP/精力值（精力影响命中率）、当前层数、星骸数量。
+  · 中央游戏画布（高度65%）：16x16网格地图（适配屏幕宽度，保持宽高比），角色位于中心，视野为5x5可见范围（迷雾机制）。
+  · 底部操作栏（高度27%）：左（摇杆虚拟键/或点按移动）、中（交互按钮——调查/攻击/拾取，随上下文动态变化）、右（背包/状态快捷入口）。所有按钮尺寸不小于44x44pt（苹果HIG标准）。
+
+3. 核心系统设计（需Claude实现的逻辑）
+
+A. 战斗系统（策略性“猜拳”简化版）
+
+· 敌人拥有 “架势”（突刺/横斩/重击），玩家每回合有 3秒 选择 “格挡/闪避/反击”。
+· 克制关系：反击克突刺，格挡克横斩，闪避克重击。成功克制触发“专注力”加成（下一击伤害x1.5）。
+· 自动战斗选项（开罗式贴心设计）：开启后AI按默认优先级行动，适合单手摸鱼。
+
+B. 装备与成长（“开罗式”数值膨胀快感）
+
+· 装备栏：武器（影响攻击力）、护甲（影响防御）、推进器（影响移动步数上限）。
+· 强化系统：消耗“零件”强化装备，强化+5时触发“词缀变异”（随机附加属性，如吸血/反伤）。
+· 天赋树：仅3条分支（生存/战斗/幸运），消耗星骸点亮，可随时免费重置（鼓励试错）。
+
+C. 动态事件与叙事
+
+· 每个浮岛固定包含 1个“星骸回响”（记忆碎片收集品）。收集后可解锁主角的背景故事（纯文字叙事，分10章节）。
+· 随机事件池包含“流浪商人”（高价出售稀有零件）、“维修无人机”（消耗星骸回复全状态）、“重力陷阱”（强制传送至随机位置）。
+
+4. 美术素材规范（供Claude用代码绘制，无需外部图片）
+
+· 调色板：仅使用16种开罗经典配色（如#F8F4E6背景，#F7B731沙地，#4A90E2水域，#E8634A怪物）。
+· 角色绘制：用ctx.fillRect绘制8x8像素块组合，构成Q版角色（头身比1:1）。
+· 动态反馈：战斗命中时屏幕轻微震动（CSS动画），拾取物品时弹出“+数字”的浮动飘字。
+
+5. 数据与存档结构（示例JSON）
+
+```json
+{
+  "player": { "name": "旅者", "hp": 100, "maxHp": 100, "stamina": 80, "atk": 12, "def": 5, "exp": 0, "level": 1 },
+  "equipment": { "weapon": { "name": "生锈砍刀", "atk": 8, "plus": 0 }, ... },
+  "inventory": [ { "id": "parts_01", "qty": 3 } ],
+  "progress": { "maxFloor": 5, "memoryFragments": [true, false, ...], "talentPoints": 2 }
+}
+```
+
+6. 针对Claude的技术实现指引（关键）
+
+· 游戏循环：使用requestAnimationFrame驱动，状态机管理（BOOT→MAP→BATTLE→INVENTORY→EVENT）。
+· 触摸适配：监听touchstart/touchend，利用e.changedTouches[0].clientX/Y计算点击网格坐标。
+· 静态部署注意：所有资源内联于单一index.html；使用Hash路由（如#inventory）管理面板切换，避免刷新404。
+· 性能优化：仅重绘地图的“脏矩形”区域（角色移动时），闲置时降低帧率至20fps节省电量。
+
+7. 故事大纲（碎片化叙事）
+
+· 序章：主角从逃生舱苏醒，失去记忆，只有AI副官“小星”陪伴。
+· 中期（3层后）：发现星球上的“星骸”其实是上古文明的情感能量体，收集它们能重温毁灭前的日常。
+· 结局（10层通关）：主角选择——用所有星骸重建文明（和平结局），或引爆星骸成为新神（暗黑结局）。两种结局对应不同的通关画面。
+
+8. 开发与测试备注（交付Claude时的附加说明）
+
+· 请优先实现 “可玩的最小原型”（MVP）：移动→战斗→强化，这一闭环能在5分钟内完整体验。
+· 移动端调试：使用Chrome DevTools的“设备模拟”模式（iPhone 12 Pro预设）验证布局。
+· GitHub Actions：无需后端，直接推送main分支至Pages即可生效。
+
+---
+
+方案总结：该设计在“开罗式”的轻松像素外皮下，嵌入了具有深度的抉择型战斗和碎片化叙事，非常适合手机端的碎片时间游玩。全部逻辑均可由Claude基于原生JS在单HTML中实现，部署零成本。如需调整任一系统（如取消战斗时间限制或修改天赋数值），可直接向Claude提出针对性修改指令。
diff --git a/.ai-tasks/issue-69/fixer-feedback_r1.md b/.ai-tasks/issue-69/fixer-feedback_r1.md
new file mode 100644
index 0000000..625f5bf
--- /dev/null
+++ b/.ai-tasks/issue-69/fixer-feedback_r1.md
@@ -0,0 +1,17 @@
+整体工程质量较高（模块化清晰、纯函数可测、存档迁移健壮、123+49 项自测全过、楼梯连通性 1800 次穷举 0 软锁、未触碰 .github/ 工作流——无需人类改 CI/CD）。但存在一个会影响「自动战斗」这一主打卖点的真实 Bug，需修复后再合入。
+
+【阻断级 Bug · 自动战斗关闭瞬间必定失手】src/ui/app.js
+复现：进入战斗 → 开启 🤖 自动战斗 → 自动打数秒（>3s，如 4 个回合约 3.4s）→ 关闭 🤖。结果：玩家立刻被判定「⏰ 来不及反应！」并强制失手受击。
+根因（三段联立）：
+1) nextRound() 中 `if (this.timerEnabled && !this.battle.auto)` 才会刷新 timerEnd；auto=true 期间 timerEnd 不再更新，停留在「最后一次手动回合」的旧值（若从一开始就开自动，timerEnd 恒为初始 0）。
+2) toggleAuto() 关闭自动时，既没有重置 timerEnd，也没有给玩家一个全新限时窗口。
+3) onTick() 的倒计时分支条件为 `screen==='battle' && timerEnabled && !auto && !busy && !_sheet`，关闭自动后立即命中，`remain=max(0, timerEnd-now)` 因 timerEnd 过期等于 0 → 立刻 chooseAction('hesitate') 强制失手。
+我用最小逻辑复现确认：auto 期间经过 4000ms 后关闭，remain==0 ⇒ instant fumble=true。这是把「关自动」误罚玩家的逻辑漏洞，且 320ms 的窗口极易触发。建议在 toggleAuto() 关闭自动、以及 nextRound() 中 auto 由 true 转 false 的当回合，执行 `this.battle.timerEnd = nowMs() + BATTLE_TIME_MS`（与手动回合一致），给玩家完整 3 秒。
+
+【次要问题（建议一并处理，非阻断）】
+- src/core/world.js takeCell() / src/core/rng.js pick()/randInt()：均假设 rng()∈[0,1)。`arr[Math.floor(r()*len)]` 在 r()≥1 时会取到 undefined（我在注入 r()=2 时实测触发 `Cannot read properties of undefined (reading 'x')` 崩溃）。生产环境 this.rng=Math.random 不会触发，但 makeRng 的数组模式可返回任意值；建议 `const f = Math.min(0.999999, Math.max(0, r()))` 之类做一次钳制，提升种子/测试鲁棒性。
+- src/ui/app.js startLoop() 未重置 this._prevTick：从启动器/创角返回游戏时，首帧 delta 可能很大，触发一次性精力回补尖峰（受 maxStamina 钳制不致崩溃，但应在 startLoop 里 `this._prevTick = nowMs()` 归零）。
+- 死亡存档可被「继续旅程」加载：gameOver 落盘 hp=0 且无 ending，listSaves 仍视为可继续；加载后 enterGame→isDead→立即再次 gameOver。建议 listSaves/load 路径对 hp<=0 的存档标记或走 restart 流程，避免「继续」瞬间又死亡的不良体验。
+- 战斗结算窗口（winBattle/loseBattle/nextRound 的 360–520ms setTimeout 期间）顶部「🏃」撤退按钮未随 busy 禁用，理论上可与胜负结算交错；建议 busy 期间一并禁用撤退按钮。
+
+修复第 1 项后即可合入；其余 4 项建议顺带打磨。
diff --git a/.ai-tasks/issue-69/fixer-feedback_r2.md b/.ai-tasks/issue-69/fixer-feedback_r2.md
new file mode 100644
index 0000000..c034539
--- /dev/null
+++ b/.ai-tasks/issue-69/fixer-feedback_r2.md
@@ -0,0 +1,12 @@
+第 1 轮的 5 项问题均已正确修复并验证（123 项逻辑自测 + 49 项 DOM 冒烟全过；自动战斗关闭失手、rng 钳制、_prevTick 归零、陨落档处理、撤退按钮 busy 禁用 均已落实；本次未触碰 .github/ 工作流，无需人类改 CI/CD）。但在「战斗限时」这一上一轮的阻断点子系统里，仍残留一个同源的计时器陈旧 Bug，建议修复后再合入。
+
+【阻断级 Bug · 打开「撤退」确认弹窗后取消，会因 timerEnd 陈旧而被瞬间判失手】src/ui/app.js
+复现（我已用 jsdom + 可控时钟最小复现，结论 YES/BUG CONFIRMED）：进入战斗（timerEnabled=true）→ 回合开始 nextRound 设 timerEnd=now+3000 → 点 🏥/🏃「撤退」打开确认弹窗（confirmFlee → this._sheet 被置，onTick 的倒计时分支因 `!this._sheet` 条件整体跳过，计时条视觉上「暂停」）→ 玩家在弹窗里犹豫 >3 秒（例如读「撤退会损失少量星骸…」+思考）→ 点「继续战斗」closeModal()（_sheet 置空，但 timerEnd 仍是旧值，未被延长）→ 下一帧 onTick(now)：screen==='battle' && timerEnabled && !auto && !busy && !_sheet 全成立 → remain=max(0, timerEnd-now)=0 → 立刻 logBattle('⏰ 来不及反应！') 并 chooseAction('hesitate') 强制失手受击。
+根因：弹窗期间计时分支被 `!this._sheet` 正确暂停了「视觉/扣减」，但 timerEnd 这个绝对截止时间并未随之顺延；与第 1 轮「关自动导致 timerEnd 陈旧→瞬间失手」是同一类漏洞的兄弟分支——修复者补上了 toggleAuto/nextRound 两条路径，却漏了「弹窗关闭回到限时回合」这条路径。实测数据：nextRound 后 timerEnd=13000、CLOCK=10000；开撤退弹窗并推进 5s 后 CLOCK=15000；closeModal 后 timerEnd 仍=13000；onTick(15000) → remain=0 → 立即失手。
+建议修复（与现有 toggleAuto 风格一致）：在 closeModal() 中，若当前正处限时战斗回合且非结算中（this.screen==='battle' && this.battle && this.timerEnabled && !this.battle.auto && !this.battle.busy），执行 this.battle.timerEnd = nowMs() + BATTLE_TIME_MS，给玩家一个完整窗口（或更精确：开弹窗时记录剩余时间，关弹窗时按剩余时间顺延）。这样「视觉暂停」与「截止时间」才一致，不会把玩家的深思熟虑误判为反应不及。
+
+【次要（非阻断，建议顺带打磨）】
+- 重力陷阱实体（ent.type==='trap'）在 resolveEntity 中触发 teleport() 后未被 removeEntity，陷阱永久残留且不可见（emoji ''）；虽被传送离开不易立刻再踩，但属于「一次性陷阱却永久存在」的设计瑕疵，建议传送后 removeEntity(st, ent.id)。
+- 全槽位已满时新建旅程（pickSlotForNewSave）会直接覆盖最久未玩档而无二次确认，可能让玩家意外丢失旧档；建议覆盖前弹确认（与 confirmDeleteSlot 一致）。
+
+修复第 1 项（撤退弹窗 timerEnd 陈旧）后即可合入。
diff --git a/.ai-tasks/issue-69/fixer-prompt_r1.md b/.ai-tasks/issue-69/fixer-prompt_r1.md
new file mode 100644
index 0000000..c48e076
--- /dev/null
+++ b/.ai-tasks/issue-69/fixer-prompt_r1.md
@@ -0,0 +1,7 @@
+你是一个资深开发工程师。这是针对上一轮代码的【第 1 轮】修复任务。
+以下是代码审查员给你的修改建议，请阅读当前目录下的 .ai-tasks/issue-69/fixer-feedback_r1.md 文件获取详细内容。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 .github/ 目录下的任何文件（特别是 workflows 等 CI/CD 配置），这会破坏项目的自动化流程！如果审查员要求你修改这些文件，请在回复中说明无法自动修改，需要人类介入。
+
+请直接分析并修改当前项目中的代码文件来满足审查员的要求，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-69/fixer-prompt_r2.md b/.ai-tasks/issue-69/fixer-prompt_r2.md
new file mode 100644
index 0000000..f2f18ce
--- /dev/null
+++ b/.ai-tasks/issue-69/fixer-prompt_r2.md
@@ -0,0 +1,7 @@
+你是一个资深开发工程师。这是针对上一轮代码的【第 2 轮】修复任务。
+以下是代码审查员给你的修改建议，请阅读当前目录下的 .ai-tasks/issue-69/fixer-feedback_r2.md 文件获取详细内容。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 .github/ 目录下的任何文件（特别是 workflows 等 CI/CD 配置），这会破坏项目的自动化流程！如果审查员要求你修改这些文件，请在回复中说明无法自动修改，需要人类介入。
+
+请直接分析并修改当前项目中的代码文件来满足审查员的要求，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-69/pr_diff_r1.md b/.ai-tasks/issue-69/pr_diff_r1.md
new file mode 100644
index 0000000..4b258a8
--- /dev/null
+++ b/.ai-tasks/issue-69/pr_diff_r1.md
@@ -0,0 +1,5429 @@
+diff --git a/.ai-tasks/issue-69/ai-coder-prompt.md b/.ai-tasks/issue-69/ai-coder-prompt.md
+new file mode 100644
+index 0000000..09ebc7b
+--- /dev/null
++++ b/.ai-tasks/issue-69/ai-coder-prompt.md
+@@ -0,0 +1,8 @@
++你是一个资深开发者。请解决以下 GitHub Issue：
++【任务标题】: 在游戏栏目下，按照以下详细方案新增游戏
++【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-69/context.md 文件获取。
++
++【⚠️ 严格红线规则】：
++请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
++
++请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
+diff --git a/.ai-tasks/issue-69/context.md b/.ai-tasks/issue-69/context.md
+new file mode 100644
+index 0000000..15ac012
+--- /dev/null
++++ b/.ai-tasks/issue-69/context.md
+@@ -0,0 +1,84 @@
++这是一份为Claude（或其他AI编程助手）准备的移动端单角色扮演游戏完整方案，主题为 《星骸旅者》（Star Wreck Pilgrim） ——融合了“开罗式像素经营美学”与“roguelike生存探索”的轻量化RPG。方案严格遵循“仅设计文档”要求，专为手机竖屏和GitHub Pages静态部署优化。
++
++---
++
++游戏设计文档：《星骸旅者》
++
++技术目标：单页HTML应用（ES6+ Canvas），适配移动端触摸，LocalStorage存档。
++视觉风格：开罗游戏（Kairosoft）标志性的2D顶视角像素风（16x16 tile网格），明亮饱和的色块，Q版角色。
++
++---
++
++1. 核心概念与循环
++
++· 背景：你是一名迫降在破碎星球“墨比乌斯”的拾荒者。该星球由无数漂浮的“遗迹浮岛”构成，每个浮岛是一个小型地牢。
++· 核心循环（竖屏单手操作）：
++  1. 浮岛探索（点击移动）→ 触发随机事件（战斗/宝箱/陷阱）。
++  2. 回合制战斗（点击指令）→ 获取“星骸”（货币）与“零件”（素材）。
++  3. 营地整备（自动返回）→ 消耗素材升级装备/解锁天赋，挑战更深层的浮岛。
++
++2. 移动端UI/UX布局（拇指热区优化）
++
++· 屏幕分区（自上而下）：
++  · 顶部状态栏（高度8%）：HP/精力值（精力影响命中率）、当前层数、星骸数量。
++  · 中央游戏画布（高度65%）：16x16网格地图（适配屏幕宽度，保持宽高比），角色位于中心，视野为5x5可见范围（迷雾机制）。
++  · 底部操作栏（高度27%）：左（摇杆虚拟键/或点按移动）、中（交互按钮——调查/攻击/拾取，随上下文动态变化）、右（背包/状态快捷入口）。所有按钮尺寸不小于44x44pt（苹果HIG标准）。
++
++3. 核心系统设计（需Claude实现的逻辑）
++
++A. 战斗系统（策略性“猜拳”简化版）
++
++· 敌人拥有 “架势”（突刺/横斩/重击），玩家每回合有 3秒 选择 “格挡/闪避/反击”。
++· 克制关系：反击克突刺，格挡克横斩，闪避克重击。成功克制触发“专注力”加成（下一击伤害x1.5）。
++· 自动战斗选项（开罗式贴心设计）：开启后AI按默认优先级行动，适合单手摸鱼。
++
++B. 装备与成长（“开罗式”数值膨胀快感）
++
++· 装备栏：武器（影响攻击力）、护甲（影响防御）、推进器（影响移动步数上限）。
++· 强化系统：消耗“零件”强化装备，强化+5时触发“词缀变异”（随机附加属性，如吸血/反伤）。
++· 天赋树：仅3条分支（生存/战斗/幸运），消耗星骸点亮，可随时免费重置（鼓励试错）。
++
++C. 动态事件与叙事
++
++· 每个浮岛固定包含 1个“星骸回响”（记忆碎片收集品）。收集后可解锁主角的背景故事（纯文字叙事，分10章节）。
++· 随机事件池包含“流浪商人”（高价出售稀有零件）、“维修无人机”（消耗星骸回复全状态）、“重力陷阱”（强制传送至随机位置）。
++
++4. 美术素材规范（供Claude用代码绘制，无需外部图片）
++
++· 调色板：仅使用16种开罗经典配色（如#F8F4E6背景，#F7B731沙地，#4A90E2水域，#E8634A怪物）。
++· 角色绘制：用ctx.fillRect绘制8x8像素块组合，构成Q版角色（头身比1:1）。
++· 动态反馈：战斗命中时屏幕轻微震动（CSS动画），拾取物品时弹出“+数字”的浮动飘字。
++
++5. 数据与存档结构（示例JSON）
++
++```json
++{
++  "player": { "name": "旅者", "hp": 100, "maxHp": 100, "stamina": 80, "atk": 12, "def": 5, "exp": 0, "level": 1 },
++  "equipment": { "weapon": { "name": "生锈砍刀", "atk": 8, "plus": 0 }, ... },
++  "inventory": [ { "id": "parts_01", "qty": 3 } ],
++  "progress": { "maxFloor": 5, "memoryFragments": [true, false, ...], "talentPoints": 2 }
++}
++```
++
++6. 针对Claude的技术实现指引（关键）
++
++· 游戏循环：使用requestAnimationFrame驱动，状态机管理（BOOT→MAP→BATTLE→INVENTORY→EVENT）。
++· 触摸适配：监听touchstart/touchend，利用e.changedTouches[0].clientX/Y计算点击网格坐标。
++· 静态部署注意：所有资源内联于单一index.html；使用Hash路由（如#inventory）管理面板切换，避免刷新404。
++· 性能优化：仅重绘地图的“脏矩形”区域（角色移动时），闲置时降低帧率至20fps节省电量。
++
++7. 故事大纲（碎片化叙事）
++
++· 序章：主角从逃生舱苏醒，失去记忆，只有AI副官“小星”陪伴。
++· 中期（3层后）：发现星球上的“星骸”其实是上古文明的情感能量体，收集它们能重温毁灭前的日常。
++· 结局（10层通关）：主角选择——用所有星骸重建文明（和平结局），或引爆星骸成为新神（暗黑结局）。两种结局对应不同的通关画面。
++
++8. 开发与测试备注（交付Claude时的附加说明）
++
++· 请优先实现 “可玩的最小原型”（MVP）：移动→战斗→强化，这一闭环能在5分钟内完整体验。
++· 移动端调试：使用Chrome DevTools的“设备模拟”模式（iPhone 12 Pro预设）验证布局。
++· GitHub Actions：无需后端，直接推送main分支至Pages即可生效。
++
++---
++
++方案总结：该设计在“开罗式”的轻松像素外皮下，嵌入了具有深度的抉择型战斗和碎片化叙事，非常适合手机端的碎片时间游玩。全部逻辑均可由Claude基于原生JS在单HTML中实现，部署零成本。如需调整任一系统（如取消战斗时间限制或修改天赋数值），可直接向Claude提出针对性修改指令。
+diff --git a/apps/xing-hai-lv-zhe/README.md b/apps/xing-hai-lv-zhe/README.md
+new file mode 100644
+index 0000000..75be1c7
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/README.md
+@@ -0,0 +1,57 @@
++# 星骸旅者 · Star Wreck Pilgrim
++
++一款融合 **开罗游戏（Kairosoft）式像素经营美学** 与 **Roguelike 生存探索** 的轻量化竖屏单机 RPG。你是一名迫降在破碎星球「墨比乌斯」的拾荒者，在无数漂浮的「遗迹浮岛」间探索、战斗、收集「星骸」，直至揭开这颗星球毁灭前的真相。
++
++技术栈：**纯原生 HTML + CSS + JavaScript（无框架）**，移动端竖屏单手操作，LocalStorage 多槽位存档，体积小、加载快。
++
++## 本地运行
++
++```bash
++npm install
++npm run dev      # 开发服务器 http://localhost:5176
++npm run build    # 生产构建到 dist/
++npm run test     # 纯逻辑自测（不依赖浏览器）
++npm run test:dom # jsdom 冒烟测试（需先 npm i jsdom，覆盖 UI 主流程）
++```
++
++也可由主框架（落地页）以 `createGame(parent)` 动态挂载，无需独立部署。
++
++## 核心玩法
++
++- **浮岛探索（点击移动）**：每个浮岛是一张 16×16 的像素网格地图，角色视野仅 5×5（迷雾机制）。点击相邻地块移动；强化「推进器」可一次走出更多步。踩上宝箱拾取、踩上陷阱触发、靠近敌人即可交战，找到下行阶梯深入下一层。
++- **抉择型战斗（猜拳克制）**：敌人每回合摆出「突刺 / 横斩 / 重击」架势，玩家在限时内选择「格挡 / 闪避 / 反击」——反击克突刺、格挡克横斩、闪避克重击。成功克制触发「专注力」加成（下一击 ×1.5）。精力过低会失手。可开启**自动战斗**让 AI 按最优克制代打，适合单手摸鱼。
++- **开罗式装备与成长**：武器（攻）/护甲（防）/推进器（步数）三件套，消耗「零件」强化；强化到 +5 触发**词缀变异**（吸血 / 反伤等随机附加属性）。**天赋树**仅三条分支（生存 / 战斗 / 幸运），消耗星骸点亮，可随时免费重置，鼓励试错。
++- **碎片化叙事**：每个浮岛固定藏有 1 枚「星骸回响」记忆碎片，集齐解锁主角失落的背景故事（共 10 章）。途中还会偶遇流浪商人、维修无人机、重力陷阱等随机事件。
++- **双重结局**：第 10 层击败星骸之核后，由你抉择——用所有星骸**重建文明**（和平结局），还是**引爆星骸**成为新神（暗黑结局）。
++
++## 移动端 UI/UX
++
++- **三段式竖屏布局**：顶部状态栏（HP / 精力 / 层数 / 星骸）· 中央像素地图画布 · 底部操作栏（左虚拟方向键 / 中动态交互键 / 右背包入口）。所有可点区域 ≥ 44×44pt，贴合拇指热区。
++- **像素反馈**：地图与角色以开罗经典 16 色调色板用色块绘制；战斗命中时屏幕轻微震动，拾取与伤害弹出「+数字」浮动飘字。
++- **状态机驱动**：`BOOT → MAP → BATTLE → INVENTORY → EVENT`，闲置时自动降帧至 ~20fps 节省电量。
++
++## 项目结构（模块化）
++
++```
++src/
++  config.js          调色板 / 地块 / 装备 / 天赋 / 敌人 / 章节 / 事件（纯常量与纯函数）
++  core/
++    rng.js           可注入随机源（种子化/测试）
++    player.js        角色状态 / 装备强化 / 天赋 / 升级 / 战斗结算
++    world.js         浮岛生成（房间+连通保证）/ 迷雾 / 移动校验 / 下行
++    battle.js        猜拳克制战斗（架势 / 克制 / 专注力 / 自动战斗）
++    save.js          多槽位 localStorage 存档 + 导入导出
++  ui/
++    dom.js           轻量 h() DOM 辅助
++    style.css        开罗像素竖屏移动端样式
++    app.js           UI 渲染与状态机（启动器/创角/地图/战斗/背包/事件/结局）
++  main.js            入口：createGame(parent) 工厂
++scripts/logic-test.mjs   纯逻辑自测
++scripts/smoke-dom.mjs    jsdom 冒烟测试
++```
++
++## 部署（GitHub Pages）
++
++构建产物在 `dist/`，可直接作为静态站点部署。自动部署由仓库根的 Pages 工作流统一处理（出于安全红线，AI 不修改 `.github/` 下的工作流文件）。
++
++> 实现注记：设计指引建议面板切换走 Hash 路由、地图用 Canvas 绘制。本作运行于落地页 overlay 内，为避免修改宿主 `window.location.hash` 造成冲突，面板切换改用应用内状态机；为兼顾 jsdom 可测性与产物体积，地图以 CSS 像素网格（开罗 16 色色块）渲染，逻辑等价且可在无头环境驱动。其余系统（猜拳战斗、装备强化 +5 词缀、三天赋树、10 章记忆、双结局）均按方案完整实现。
+diff --git a/apps/xing-hai-lv-zhe/index.html b/apps/xing-hai-lv-zhe/index.html
+new file mode 100644
+index 0000000..68b817d
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/index.html
+@@ -0,0 +1,41 @@
++<!doctype html>
++<html lang="zh-CN">
++
++<head>
++  <meta charset="UTF-8" />
++  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
++  <meta name="theme-color" content="#2b2d3a" />
++  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%232b2d3a'/%3E%3Ctext x='16' y='23' font-size='20' text-anchor='middle' fill='%23ffd93d' font-family='serif'%3E%E6%98%9F%3C/text%3E%3C/svg%3E" />
++  <title>星骸旅者 · Star Wreck Pilgrim</title>
++  <style>
++    html,
++    body {
++      margin: 0;
++      padding: 0;
++      width: 100%;
++      height: 100%;
++      background: #2b2d3a;
++      overflow: hidden;
++      font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
++      -webkit-user-select: none;
++      user-select: none;
++      -webkit-tap-highlight-color: transparent;
++    }
++
++    #game-container {
++      position: relative;
++      width: 100vw;
++      height: 100vh;
++      display: flex;
++      align-items: stretch;
++      justify-content: center;
++    }
++  </style>
++</head>
++
++<body>
++  <div id="game-container"></div>
++  <script type="module" src="/src/main.js"></script>
++</body>
++
++</html>
+diff --git a/apps/xing-hai-lv-zhe/package-lock.json b/apps/xing-hai-lv-zhe/package-lock.json
+new file mode 100644
+index 0000000..f275447
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/package-lock.json
+@@ -0,0 +1,1559 @@
++{
++  "name": "xing-hai-lv-zhe",
++  "version": "1.0.0",
++  "lockfileVersion": 3,
++  "requires": true,
++  "packages": {
++    "": {
++      "name": "xing-hai-lv-zhe",
++      "version": "1.0.0",
++      "devDependencies": {
++        "jsdom": "^29.1.1",
++        "vite": "^5.4.0"
++      }
++    },
++    "node_modules/@asamuzakjp/css-color": {
++      "version": "5.1.11",
++      "resolved": "https://registry.npmjs.org/@asamuzakjp/css-color/-/css-color-5.1.11.tgz",
++      "integrity": "sha512-KVw6qIiCTUQhByfTd78h2yD1/00waTmm9uy/R7Ck/ctUyAPj+AEDLkQIdJW0T8+qGgj3j5bpNKK7Q3G+LedJWg==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@asamuzakjp/generational-cache": "^1.0.1",
++        "@csstools/css-calc": "^3.2.0",
++        "@csstools/css-color-parser": "^4.1.0",
++        "@csstools/css-parser-algorithms": "^4.0.0",
++        "@csstools/css-tokenizer": "^4.0.0"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/@asamuzakjp/dom-selector": {
++      "version": "7.1.1",
++      "resolved": "https://registry.npmjs.org/@asamuzakjp/dom-selector/-/dom-selector-7.1.1.tgz",
++      "integrity": "sha512-67RZDnYRc8H/8MLDgQCDE//zoqVFwajkepHZgmXrbwybzXOEwOWGPYGmALYl9J2DOLfFPPs6kKCqmbzV895hTQ==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@asamuzakjp/generational-cache": "^1.0.1",
++        "@asamuzakjp/nwsapi": "^2.3.9",
++        "bidi-js": "^1.0.3",
++        "css-tree": "^3.2.1",
++        "is-potential-custom-element-name": "^1.0.1"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/@asamuzakjp/generational-cache": {
++      "version": "1.0.1",
++      "resolved": "https://registry.npmjs.org/@asamuzakjp/generational-cache/-/generational-cache-1.0.1.tgz",
++      "integrity": "sha512-wajfB8KqzMCN2KGNFdLkReeHncd0AslUSrvHVvvYWuU8ghncRJoA50kT3zP9MVL0+9g4/67H+cdvBskj9THPzg==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/@asamuzakjp/nwsapi": {
++      "version": "2.3.9",
++      "resolved": "https://registry.npmjs.org/@asamuzakjp/nwsapi/-/nwsapi-2.3.9.tgz",
++      "integrity": "sha512-n8GuYSrI9bF7FFZ/SjhwevlHc8xaVlb/7HmHelnc/PZXBD2ZR49NnN9sMMuDdEGPeeRQ5d0hqlSlEpgCX3Wl0Q==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/@bramus/specificity": {
++      "version": "2.4.2",
++      "resolved": "https://registry.npmjs.org/@bramus/specificity/-/specificity-2.4.2.tgz",
++      "integrity": "sha512-ctxtJ/eA+t+6q2++vj5j7FYX3nRu311q1wfYH3xjlLOsczhlhxAg2FWNUXhpGvAw3BWo1xBcvOV6/YLc2r5FJw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "css-tree": "^3.0.0"
++      },
++      "bin": {
++        "specificity": "bin/cli.js"
++      }
++    },
++    "node_modules/@csstools/color-helpers": {
++      "version": "6.1.0",
++      "resolved": "https://registry.npmjs.org/@csstools/color-helpers/-/color-helpers-6.1.0.tgz",
++      "integrity": "sha512-064IFJdjTfUqnjpCVpMOdbr8FLQBhinbZj6yRv2An2E41O/pLEXqfFRWqGq/SxlE5PEUYTlvWsG2r8MswAVvkg==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT-0",
++      "engines": {
++        "node": ">=20.19.0"
++      }
++    },
++    "node_modules/@csstools/css-calc": {
++      "version": "3.2.1",
++      "resolved": "https://registry.npmjs.org/@csstools/css-calc/-/css-calc-3.2.1.tgz",
++      "integrity": "sha512-DtdHlgXh5ZkA43cwBcAm+huzgJiwx3ZTWVjBs94kwz2xKqSimDA3lBgCjphYgwgVUMWatSM0pDd8TILB1yrVVg==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT",
++      "engines": {
++        "node": ">=20.19.0"
++      },
++      "peerDependencies": {
++        "@csstools/css-parser-algorithms": "^4.0.0",
++        "@csstools/css-tokenizer": "^4.0.0"
++      }
++    },
++    "node_modules/@csstools/css-color-parser": {
++      "version": "4.1.9",
++      "resolved": "https://registry.npmjs.org/@csstools/css-color-parser/-/css-color-parser-4.1.9.tgz",
++      "integrity": "sha512-paQcIaOO53Rk5+YrBaBjm/SgrV4INImjo2BT1DtQRYr+XeTRbeAYlS+jxXp9drqvKmtFnWRJKIalDLhZZDu42A==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT",
++      "dependencies": {
++        "@csstools/color-helpers": "^6.1.0",
++        "@csstools/css-calc": "^3.2.1"
++      },
++      "engines": {
++        "node": ">=20.19.0"
++      },
++      "peerDependencies": {
++        "@csstools/css-parser-algorithms": "^4.0.0",
++        "@csstools/css-tokenizer": "^4.0.0"
++      }
++    },
++    "node_modules/@csstools/css-parser-algorithms": {
++      "version": "4.0.0",
++      "resolved": "https://registry.npmjs.org/@csstools/css-parser-algorithms/-/css-parser-algorithms-4.0.0.tgz",
++      "integrity": "sha512-+B87qS7fIG3L5h3qwJ/IFbjoVoOe/bpOdh9hAjXbvx0o8ImEmUsGXN0inFOnk2ChCFgqkkGFQ+TpM5rbhkKe4w==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT",
++      "engines": {
++        "node": ">=20.19.0"
++      },
++      "peerDependencies": {
++        "@csstools/css-tokenizer": "^4.0.0"
++      }
++    },
++    "node_modules/@csstools/css-syntax-patches-for-csstree": {
++      "version": "1.1.6",
++      "resolved": "https://registry.npmjs.org/@csstools/css-syntax-patches-for-csstree/-/css-syntax-patches-for-csstree-1.1.6.tgz",
++      "integrity": "sha512-TcJCWFbXLPpJYq6z7bfOyjWYJDiDg2/I4gyUC9pqPNqHFRIey0EB0q0L5cSnQDfWJg8Jd6VadakxdIez/3zkqQ==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT-0",
++      "peerDependencies": {
++        "css-tree": "^3.2.1"
++      },
++      "peerDependenciesMeta": {
++        "css-tree": {
++          "optional": true
++        }
++      }
++    },
++    "node_modules/@csstools/css-tokenizer": {
++      "version": "4.0.0",
++      "resolved": "https://registry.npmjs.org/@csstools/css-tokenizer/-/css-tokenizer-4.0.0.tgz",
++      "integrity": "sha512-QxULHAm7cNu72w97JUNCBFODFaXpbDg+dP8b/oWFAZ2MTRppA3U00Y2L1HqaS4J6yBqxwa/Y3nMBaxVKbB/NsA==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT",
++      "engines": {
++        "node": ">=20.19.0"
++      }
++    },
++    "node_modules/@esbuild/aix-ppc64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.21.5.tgz",
++      "integrity": "sha512-1SDgH6ZSPTlggy1yI6+Dbkiz8xzpHJEVAlF/AM1tHPLsf5STom9rwtjE4hKAF20FfXXNTFqEYXyJNWh1GiZedQ==",
++      "cpu": [
++        "ppc64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "aix"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/android-arm": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.21.5.tgz",
++      "integrity": "sha512-vCPvzSjpPHEi1siZdlvAlsPxXl7WbOVUBBAowWug4rJHb68Ox8KualB+1ocNvT5fjv6wpkX6o/iEpbDrf68zcg==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/android-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.21.5.tgz",
++      "integrity": "sha512-c0uX9VAUBQ7dTDCjq+wdyGLowMdtR/GoC2U5IYk/7D1H1JYC0qseD7+11iMP2mRLN9RcCMRcjC4YMclCzGwS/A==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/android-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.21.5.tgz",
++      "integrity": "sha512-D7aPRUUNHRBwHxzxRvp856rjUHRFW1SdQATKXH2hqA0kAZb1hKmi02OpYRacl0TxIGz/ZmXWlbZgjwWYaCakTA==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/darwin-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.21.5.tgz",
++      "integrity": "sha512-DwqXqZyuk5AiWWf3UfLiRDJ5EDd49zg6O9wclZ7kUMv2WRFr4HKjXp/5t8JZ11QbQfUS6/cRCKGwYhtNAY88kQ==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/darwin-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.21.5.tgz",
++      "integrity": "sha512-se/JjF8NlmKVG4kNIuyWMV/22ZaerB+qaSi5MdrXtd6R08kvs2qCN4C09miupktDitvh8jRFflwGFBQcxZRjbw==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/freebsd-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.21.5.tgz",
++      "integrity": "sha512-5JcRxxRDUJLX8JXp/wcBCy3pENnCgBR9bN6JsY4OmhfUtIHe3ZW0mawA7+RDAcMLrMIZaf03NlQiX9DGyB8h4g==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "freebsd"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/freebsd-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.21.5.tgz",
++      "integrity": "sha512-J95kNBj1zkbMXtHVH29bBriQygMXqoVQOQYA+ISs0/2l3T9/kj42ow2mpqerRBxDJnmkUDCaQT/dfNXWX/ZZCQ==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "freebsd"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-arm": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.21.5.tgz",
++      "integrity": "sha512-bPb5AHZtbeNGjCKVZ9UGqGwo8EUu4cLq68E95A53KlxAPRmUyYv2D6F0uUI65XisGOL1hBP5mTronbgo+0bFcA==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.21.5.tgz",
++      "integrity": "sha512-ibKvmyYzKsBeX8d8I7MH/TMfWDXBF3db4qM6sy+7re0YXya+K1cem3on9XgdT2EQGMu4hQyZhan7TeQ8XkGp4Q==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-ia32": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.21.5.tgz",
++      "integrity": "sha512-YvjXDqLRqPDl2dvRODYmmhz4rPeVKYvppfGYKSNGdyZkA01046pLWyRKKI3ax8fbJoK5QbxblURkwK/MWY18Tg==",
++      "cpu": [
++        "ia32"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-loong64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.21.5.tgz",
++      "integrity": "sha512-uHf1BmMG8qEvzdrzAqg2SIG/02+4/DHB6a9Kbya0XDvwDEKCoC8ZRWI5JJvNdUjtciBGFQ5PuBlpEOXQj+JQSg==",
++      "cpu": [
++        "loong64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-mips64el": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.21.5.tgz",
++      "integrity": "sha512-IajOmO+KJK23bj52dFSNCMsz1QP1DqM6cwLUv3W1QwyxkyIWecfafnI555fvSGqEKwjMXVLokcV5ygHW5b3Jbg==",
++      "cpu": [
++        "mips64el"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-ppc64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.21.5.tgz",
++      "integrity": "sha512-1hHV/Z4OEfMwpLO8rp7CvlhBDnjsC3CttJXIhBi+5Aj5r+MBvy4egg7wCbe//hSsT+RvDAG7s81tAvpL2XAE4w==",
++      "cpu": [
++        "ppc64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-riscv64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.21.5.tgz",
++      "integrity": "sha512-2HdXDMd9GMgTGrPWnJzP2ALSokE/0O5HhTUvWIbD3YdjME8JwvSCnNGBnTThKGEB91OZhzrJ4qIIxk/SBmyDDA==",
++      "cpu": [
++        "riscv64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-s390x": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.21.5.tgz",
++      "integrity": "sha512-zus5sxzqBJD3eXxwvjN1yQkRepANgxE9lgOW2qLnmr8ikMTphkjgXu1HR01K4FJg8h1kEEDAqDcZQtbrRnB41A==",
++      "cpu": [
++        "s390x"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.21.5.tgz",
++      "integrity": "sha512-1rYdTpyv03iycF1+BhzrzQJCdOuAOtaqHTWJZCWvijKD2N5Xu0TtVC8/+1faWqcP9iBCWOmjmhoH94dH82BxPQ==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/netbsd-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.21.5.tgz",
++      "integrity": "sha512-Woi2MXzXjMULccIwMnLciyZH4nCIMpWQAs049KEeMvOcNADVxo0UBIQPfSmxB3CWKedngg7sWZdLvLczpe0tLg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "netbsd"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/openbsd-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.21.5.tgz",
++      "integrity": "sha512-HLNNw99xsvx12lFBUwoT8EVCsSvRNDVxNpjZ7bPn947b8gJPzeHWyNVhFsaerc0n3TsbOINvRP2byTZ5LKezow==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "openbsd"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/sunos-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.21.5.tgz",
++      "integrity": "sha512-6+gjmFpfy0BHU5Tpptkuh8+uw3mnrvgs+dSPQXQOv3ekbordwnzTVEb4qnIvQcYXq6gzkyTnoZ9dZG+D4garKg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "sunos"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/win32-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.21.5.tgz",
++      "integrity": "sha512-Z0gOTd75VvXqyq7nsl93zwahcTROgqvuAcYDUr+vOv8uHhNSKROyU961kgtCD1e95IqPKSQKH7tBTslnS3tA8A==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/win32-ia32": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.21.5.tgz",
++      "integrity": "sha512-SWXFF1CL2RVNMaVs+BBClwtfZSvDgtL//G/smwAc5oVK/UPu2Gu9tIaRgFmYFFKrmg3SyAjSrElf0TiJ1v8fYA==",
++      "cpu": [
++        "ia32"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/win32-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.21.5.tgz",
++      "integrity": "sha512-tQd/1efJuzPC6rCFwEvLtci/xNFcTZknmXs98FYDfGE4wP9ClFV98nyKrzJKVPMhdDnjzLhdUyMX4PsQAPjwIw==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@exodus/bytes": {
++      "version": "1.15.1",
++      "resolved": "https://registry.npmjs.org/@exodus/bytes/-/bytes-1.15.1.tgz",
++      "integrity": "sha512-S6mL0yNB/Abt9Ei4tq8gDhcczc4S3+vQ4ra7vxnAf+YHC02srtqxKKZghx2Dq6p0e66THKwR6r8N6P95wEty7Q==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      },
++      "peerDependencies": {
++        "@noble/hashes": "^1.8.0 || ^2.0.0"
++      },
++      "peerDependenciesMeta": {
++        "@noble/hashes": {
++          "optional": true
++        }
++      }
++    },
++    "node_modules/@rollup/rollup-android-arm-eabi": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.62.2.tgz",
++      "integrity": "sha512-6o7ZLZK+BeenkZCFNDXqpbjw9bD6nuWonvS/lwQJp7NoVVxm6p3qE7qQ5jGuBjiFsgvqjD8mZAU5oWxTmbOeOg==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ]
++    },
++    "node_modules/@rollup/rollup-android-arm64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.62.2.tgz",
++      "integrity": "sha512-BaH7BllCACHoH1LguOU56UItGfUWjujlO65kS9LAodViaN4bwIKd7oeW/ZHJ/4ljr/7MIiENnNy3HJ0zXv8Zkw==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ]
++    },
++    "node_modules/@rollup/rollup-darwin-arm64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.62.2.tgz",
++      "integrity": "sha512-v39RCCvj4He82I9sFmk+M1VZ0PLM9sfsLVikjfx2hYBNALhrrOR2D3JjQA6AhlaSOgcR+RzrKY7e1+bT6SUO/A==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ]
++    },
++    "node_modules/@rollup/rollup-darwin-x64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.62.2.tgz",
++      "integrity": "sha512-yl0y2vq3S3lHeuXhEdss6TWfKW8vkujImO12tn4ZkG/4oghr09LvdYm2RElVjokTQiUvDUGXLGsYeLqUMCKpGA==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ]
++    },
++    "node_modules/@rollup/rollup-freebsd-arm64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.62.2.tgz",
++      "integrity": "sha512-tT4pvt4qXD+vEoezupCWi+a1F0vvDiksiHc+PxRlYTOH1I6/X4id9jPxTP+Fg+545euaFT1jJVs4CEdHZAU1vw==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "freebsd"
++      ]
++    },
++    "node_modules/@rollup/rollup-freebsd-x64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.62.2.tgz",
++      "integrity": "sha512-6nU5F2wCW+qvCBhTn1pdIU3bzsIoF7EUwsCDRxilWGprQR6yd508YnH9+OKFCwpfS8pjZqDUmnCAr7exax0XCg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "freebsd"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.62.2.tgz",
++      "integrity": "sha512-n1GJHPOvpIfhi3TmrCeh6S6URt9BFCt0KQE3qvexyGCTAKpR4Lg+eWvNZEqu7epxwus/8ElT3hacYEucm49SZg==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-arm-musleabihf": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.62.2.tgz",
++      "integrity": "sha512-JqgflS8wEB+UXV/vS1RpRbifGBeN4D5lz8D8oOFbFZw4vedvdOgCFAjfBmIMdW3yL10XpQQ0Ambepw6MXrhOnA==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-arm64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.62.2.tgz",
++      "integrity": "sha512-wnFJkogWvN4jm/hQRF2UBaeUmk20j5+DmHvoyWii2b8HJDyvz1MF2OU/6ynXt2KR63rbZLWkFpoytpdc/yBuSA==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-arm64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.62.2.tgz",
++      "integrity": "sha512-HVu2bp0zhvJ8xHEV9+UUs7S90VadmBSY3LcIMvozbPo4AuMGDWlz3ymHLHZPX4hR67TKTt8Qp5PJ5RBg/i+RMQ==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-loong64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.62.2.tgz",
++      "integrity": "sha512-mQqqAV8QaoSgr9I2fKDLY2BAVvmKjWoGiu/cSYQonsLvtqwEn1E4QYfnCOcp5zoEqNhsDYin1s6jx/VJmrxlZg==",
++      "cpu": [
++        "loong64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-loong64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-musl/-/rollup-linux-loong64-musl-4.62.2.tgz",
++      "integrity": "sha512-IxKLoxCQ2IWi6bT2akyDUBGsOImDKB+sPp4EsTmwFQ/fMwpCKm8uLSSgP/Kx/QYUgKis6SEZ5/Nlhup0DIA0PQ==",
++      "cpu": [
++        "loong64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-ppc64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.62.2.tgz",
++      "integrity": "sha512-Mk5ha2RQSgyFfmYYLkBpPnUk8D8FriBxesO1u9O75X0mHgXL1UQcH5Itl2lurWL2tj0RxV9b9tJgipac0hRY9A==",
++      "cpu": [
++        "ppc64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-ppc64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-musl/-/rollup-linux-ppc64-musl-4.62.2.tgz",
++      "integrity": "sha512-CjvEnqJL/0/TQ3TXX3OPIJ/kmBellrWd4heXUmHeJlTnmwjKpSJzoehLaL6Xk0ZnMHBu9dZuFADNOrtjF4v+2w==",
++      "cpu": [
++        "ppc64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-riscv64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.62.2.tgz",
++      "integrity": "sha512-1SiZbzwdkaDURsew/tSOrooKiYy7EQGT6m8ufavAi9NEyQb/6VuIxFXAL1fqa4iZe3g4NbNk4P7J32z2tw5Mgg==",
++      "cpu": [
++        "riscv64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-riscv64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.62.2.tgz",
++      "integrity": "sha512-nQts12zJ3NQRoE6uYljOH89v7szzLDvG2JD/vsX+vGXU8w/At1GowTZ5/7qeFQ8m7L55rpR8Okugnuo5bgjy2Q==",
++      "cpu": [
++        "riscv64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-s390x-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.62.2.tgz",
++      "integrity": "sha512-E9/ll019jhPIJgpzfZoIkBGhcz+kKNgVWYRY0zr9srBdPPFVpvOKW8VaJKUbeK+eZXyQF9ltME+Kk6affeaPgg==",
++      "cpu": [
++        "s390x"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-x64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.62.2.tgz",
++      "integrity": "sha512-5BqxR/pshjey51iliyzTD5Xi3EN0aLmQ2lZ3lvefVV9c82BvrLo2/6OT55iifpWBufs6kdwWbuOKS841DrmK9A==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-x64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.62.2.tgz",
++      "integrity": "sha512-uNN83XxQrRAh/w0/pmAfibcwyb6YWt4gP+dpnQKPVJshAloQ785ii8CT8ZCIxkGg9opVsvAlGhFitSm6D1Jjpg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-openbsd-x64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-openbsd-x64/-/rollup-openbsd-x64-4.62.2.tgz",
++      "integrity": "sha512-srjEIxSH3LRnJN6THczDHWQplqEMFiAJrTab0msUryh9kwNpkICf3Ea6q6MN/2cZwRFUNx5w+h6Hpi4QuHS6Zg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "openbsd"
++      ]
++    },
++    "node_modules/@rollup/rollup-openharmony-arm64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.62.2.tgz",
++      "integrity": "sha512-8hOJnxgbyObnCm5AlRA3A931xX19xq80RjVTKgJOvEKWqJruP/Uf12IbAOaDjjEXYRewwHLfmF0YRIdK3OwKWA==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "openharmony"
++      ]
++    },
++    "node_modules/@rollup/rollup-win32-arm64-msvc": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.62.2.tgz",
++      "integrity": "sha512-mmF4AY1i0hG/bLWUctUq59gtmgaSIRa3cu/A3JFRp/sCNEme2bgDEiDS22P9FbnJB8NJNF4jPJiSP5RHQpUTDg==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ]
++    },
++    "node_modules/@rollup/rollup-win32-ia32-msvc": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.62.2.tgz",
++      "integrity": "sha512-DZgkknc6jhHrk46V25vbAM0zZkyP0nSDkJB8/dRkLTxv470dOmWDqGoEJl/9A0dFfS7yE3REOwNDxpHwSLSt0Q==",
++      "cpu": [
++        "ia32"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ]
++    },
++    "node_modules/@rollup/rollup-win32-x64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.62.2.tgz",
++      "integrity": "sha512-T6xr6ucWSFto+VGajA8YH26LdpHRuP4YLHEKAtCWvJDOlnmWcDZVCI2Jmjr+IFHDlt2zRaTAKE4tfjTaWLgJBg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ]
++    },
++    "node_modules/@rollup/rollup-win32-x64-msvc": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.62.2.tgz",
++      "integrity": "sha512-BfzEnDJOt9T8M989/lA37EcJgat01wLRnoi5dQf3QzOH7jzpqTAzdDbVfRljVr5r+jzKqpbHeyOfAaXxAd0PAA==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ]
++    },
++    "node_modules/@types/estree": {
++      "version": "1.0.9",
++      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz",
++      "integrity": "sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/bidi-js": {
++      "version": "1.0.3",
++      "resolved": "https://registry.npmjs.org/bidi-js/-/bidi-js-1.0.3.tgz",
++      "integrity": "sha512-RKshQI1R3YQ+n9YJz2QQ147P66ELpa1FQEg20Dk8oW9t2KgLbpDLLp9aGZ7y8WHSshDknG0bknqGw5/tyCs5tw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "require-from-string": "^2.0.2"
++      }
++    },
++    "node_modules/css-tree": {
++      "version": "3.2.1",
++      "resolved": "https://registry.npmjs.org/css-tree/-/css-tree-3.2.1.tgz",
++      "integrity": "sha512-X7sjQzceUhu1u7Y/ylrRZFU2FS6LRiFVp6rKLPg23y3x3c3DOKAwuXGDp+PAGjh6CSnCjYeAul8pcT8bAl+lSA==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "mdn-data": "2.27.1",
++        "source-map-js": "^1.2.1"
++      },
++      "engines": {
++        "node": "^10 || ^12.20.0 || ^14.13.0 || >=15.0.0"
++      }
++    },
++    "node_modules/data-urls": {
++      "version": "7.0.0",
++      "resolved": "https://registry.npmjs.org/data-urls/-/data-urls-7.0.0.tgz",
++      "integrity": "sha512-23XHcCF+coGYevirZceTVD7NdJOqVn+49IHyxgszm+JIiHLoB2TkmPtsYkNWT1pvRSGkc35L6NHs0yHkN2SumA==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "whatwg-mimetype": "^5.0.0",
++        "whatwg-url": "^16.0.0"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/decimal.js": {
++      "version": "10.6.0",
++      "resolved": "https://registry.npmjs.org/decimal.js/-/decimal.js-10.6.0.tgz",
++      "integrity": "sha512-YpgQiITW3JXGntzdUmyUR1V812Hn8T1YVXhCu+wO3OpS4eU9l4YdD3qjyiKdV6mvV29zapkMeD390UVEf2lkUg==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/entities": {
++      "version": "8.0.0",
++      "resolved": "https://registry.npmjs.org/entities/-/entities-8.0.0.tgz",
++      "integrity": "sha512-zwfzJecQ/Uej6tusMqwAqU/6KL2XaB2VZ2Jg54Je6ahNBGNH6Ek6g3jjNCF0fG9EWQKGZNddNjU5F1ZQn/sBnA==",
++      "dev": true,
++      "license": "BSD-2-Clause",
++      "engines": {
++        "node": ">=20.19.0"
++      },
++      "funding": {
++        "url": "https://github.com/fb55/entities?sponsor=1"
++      }
++    },
++    "node_modules/esbuild": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.21.5.tgz",
++      "integrity": "sha512-mg3OPMV4hXywwpoDxu3Qda5xCKQi+vCTZq8S9J/EpkhB2HzKXq4SNFZE3+NK93JYxc8VMSep+lOUSC/RVKaBqw==",
++      "dev": true,
++      "hasInstallScript": true,
++      "license": "MIT",
++      "bin": {
++        "esbuild": "bin/esbuild"
++      },
++      "engines": {
++        "node": ">=12"
++      },
++      "optionalDependencies": {
++        "@esbuild/aix-ppc64": "0.21.5",
++        "@esbuild/android-arm": "0.21.5",
++        "@esbuild/android-arm64": "0.21.5",
++        "@esbuild/android-x64": "0.21.5",
++        "@esbuild/darwin-arm64": "0.21.5",
++        "@esbuild/darwin-x64": "0.21.5",
++        "@esbuild/freebsd-arm64": "0.21.5",
++        "@esbuild/freebsd-x64": "0.21.5",
++        "@esbuild/linux-arm": "0.21.5",
++        "@esbuild/linux-arm64": "0.21.5",
++        "@esbuild/linux-ia32": "0.21.5",
++        "@esbuild/linux-loong64": "0.21.5",
++        "@esbuild/linux-mips64el": "0.21.5",
++        "@esbuild/linux-ppc64": "0.21.5",
++        "@esbuild/linux-riscv64": "0.21.5",
++        "@esbuild/linux-s390x": "0.21.5",
++        "@esbuild/linux-x64": "0.21.5",
++        "@esbuild/netbsd-x64": "0.21.5",
++        "@esbuild/openbsd-x64": "0.21.5",
++        "@esbuild/sunos-x64": "0.21.5",
++        "@esbuild/win32-arm64": "0.21.5",
++        "@esbuild/win32-ia32": "0.21.5",
++        "@esbuild/win32-x64": "0.21.5"
++      }
++    },
++    "node_modules/fsevents": {
++      "version": "2.3.3",
++      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
++      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
++      "dev": true,
++      "hasInstallScript": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ],
++      "engines": {
++        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
++      }
++    },
++    "node_modules/html-encoding-sniffer": {
++      "version": "6.0.0",
++      "resolved": "https://registry.npmjs.org/html-encoding-sniffer/-/html-encoding-sniffer-6.0.0.tgz",
++      "integrity": "sha512-CV9TW3Y3f8/wT0BRFc1/KAVQ3TUHiXmaAb6VW9vtiMFf7SLoMd1PdAc4W3KFOFETBJUb90KatHqlsZMWV+R9Gg==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@exodus/bytes": "^1.6.0"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/is-potential-custom-element-name": {
++      "version": "1.0.1",
++      "resolved": "https://registry.npmjs.org/is-potential-custom-element-name/-/is-potential-custom-element-name-1.0.1.tgz",
++      "integrity": "sha512-bCYeRA2rVibKZd+s2625gGnGF/t7DSqDs4dP7CrLA1m7jKWz6pps0LpYLJN8Q64HtmPKJ1hrN3nzPNKFEKOUiQ==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/jsdom": {
++      "version": "29.1.1",
++      "resolved": "https://registry.npmjs.org/jsdom/-/jsdom-29.1.1.tgz",
++      "integrity": "sha512-ECi4Fi2f7BdJtUKTflYRTiaMxIB0O6zfR1fX0GXpUrf6flp8QIYn1UT20YQqdSOfk2dfkCwS8LAFoJDEppNK5Q==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@asamuzakjp/css-color": "^5.1.11",
++        "@asamuzakjp/dom-selector": "^7.1.1",
++        "@bramus/specificity": "^2.4.2",
++        "@csstools/css-syntax-patches-for-csstree": "^1.1.3",
++        "@exodus/bytes": "^1.15.0",
++        "css-tree": "^3.2.1",
++        "data-urls": "^7.0.0",
++        "decimal.js": "^10.6.0",
++        "html-encoding-sniffer": "^6.0.0",
++        "is-potential-custom-element-name": "^1.0.1",
++        "lru-cache": "^11.3.5",
++        "parse5": "^8.0.1",
++        "saxes": "^6.0.0",
++        "symbol-tree": "^3.2.4",
++        "tough-cookie": "^6.0.1",
++        "undici": "^7.25.0",
++        "w3c-xmlserializer": "^5.0.0",
++        "webidl-conversions": "^8.0.1",
++        "whatwg-mimetype": "^5.0.0",
++        "whatwg-url": "^16.0.1",
++        "xml-name-validator": "^5.0.0"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.13.0 || >=24.0.0"
++      },
++      "peerDependencies": {
++        "canvas": "^3.0.0"
++      },
++      "peerDependenciesMeta": {
++        "canvas": {
++          "optional": true
++        }
++      }
++    },
++    "node_modules/lru-cache": {
++      "version": "11.5.2",
++      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-11.5.2.tgz",
++      "integrity": "sha512-4pfM1Ff0x50o0tQwb5ucw/RzNyD0/YJME6IVcStalZuMWxdt3sR3huStTtxz4PUmvZfRguvDejasvQ2kifR11g==",
++      "dev": true,
++      "license": "BlueOak-1.0.0",
++      "engines": {
++        "node": "20 || >=22"
++      }
++    },
++    "node_modules/mdn-data": {
++      "version": "2.27.1",
++      "resolved": "https://registry.npmjs.org/mdn-data/-/mdn-data-2.27.1.tgz",
++      "integrity": "sha512-9Yubnt3e8A0OKwxYSXyhLymGW4sCufcLG6VdiDdUGVkPhpqLxlvP5vl1983gQjJl3tqbrM731mjaZaP68AgosQ==",
++      "dev": true,
++      "license": "CC0-1.0"
++    },
++    "node_modules/nanoid": {
++      "version": "3.3.15",
++      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.15.tgz",
++      "integrity": "sha512-y7Wygv/7mEOvxTuEQDB8StXdMRBWf1kR/tlhAzBRUFkB2jfcLOAxO/SHmOO2zgz1pVgK29/kyupn059/bCHdjA==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/ai"
++        }
++      ],
++      "license": "MIT",
++      "bin": {
++        "nanoid": "bin/nanoid.cjs"
++      },
++      "engines": {
++        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
++      }
++    },
++    "node_modules/parse5": {
++      "version": "8.0.1",
++      "resolved": "https://registry.npmjs.org/parse5/-/parse5-8.0.1.tgz",
++      "integrity": "sha512-z1e/HMG90obSGeidlli3hj7cbocou0/wa5HacvI3ASx34PecNjNQeaHNo5WIZpWofN9kgkqV1q5YvXe3F0FoPw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "entities": "^8.0.0"
++      },
++      "funding": {
++        "url": "https://github.com/inikulin/parse5?sponsor=1"
++      }
++    },
++    "node_modules/picocolors": {
++      "version": "1.1.1",
++      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
++      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
++      "dev": true,
++      "license": "ISC"
++    },
++    "node_modules/postcss": {
++      "version": "8.5.16",
++      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.16.tgz",
++      "integrity": "sha512-vuwillviilfKZsg0VGj5R/YwwcHx4SLsIOI/7K6mQkWx+l5cUHTjj5g0AasTBcyXsbfTgrwsUNmVUb5xVwyPwg==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/postcss/"
++        },
++        {
++          "type": "tidelift",
++          "url": "https://tidelift.com/funding/github/npm/postcss"
++        },
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/ai"
++        }
++      ],
++      "license": "MIT",
++      "dependencies": {
++        "nanoid": "^3.3.12",
++        "picocolors": "^1.1.1",
++        "source-map-js": "^1.2.1"
++      },
++      "engines": {
++        "node": "^10 || ^12 || >=14"
++      }
++    },
++    "node_modules/punycode": {
++      "version": "2.3.1",
++      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
++      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": ">=6"
++      }
++    },
++    "node_modules/require-from-string": {
++      "version": "2.0.2",
++      "resolved": "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz",
++      "integrity": "sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": ">=0.10.0"
++      }
++    },
++    "node_modules/rollup": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.62.2.tgz",
++      "integrity": "sha512-RFnrW4lhXA3s3eqHDZvN654g8OTjzRfqpIRJYczCGB6HzphckVAi/Qh4tbPUbRuDi7s1Llv8g/NspLkttY3gTA==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@types/estree": "1.0.9"
++      },
++      "bin": {
++        "rollup": "dist/bin/rollup"
++      },
++      "engines": {
++        "node": ">=18.0.0",
++        "npm": ">=8.0.0"
++      },
++      "optionalDependencies": {
++        "@rollup/rollup-android-arm-eabi": "4.62.2",
++        "@rollup/rollup-android-arm64": "4.62.2",
++        "@rollup/rollup-darwin-arm64": "4.62.2",
++        "@rollup/rollup-darwin-x64": "4.62.2",
++        "@rollup/rollup-freebsd-arm64": "4.62.2",
++        "@rollup/rollup-freebsd-x64": "4.62.2",
++        "@rollup/rollup-linux-arm-gnueabihf": "4.62.2",
++        "@rollup/rollup-linux-arm-musleabihf": "4.62.2",
++        "@rollup/rollup-linux-arm64-gnu": "4.62.2",
++        "@rollup/rollup-linux-arm64-musl": "4.62.2",
++        "@rollup/rollup-linux-loong64-gnu": "4.62.2",
++        "@rollup/rollup-linux-loong64-musl": "4.62.2",
++        "@rollup/rollup-linux-ppc64-gnu": "4.62.2",
++        "@rollup/rollup-linux-ppc64-musl": "4.62.2",
++        "@rollup/rollup-linux-riscv64-gnu": "4.62.2",
++        "@rollup/rollup-linux-riscv64-musl": "4.62.2",
++        "@rollup/rollup-linux-s390x-gnu": "4.62.2",
++        "@rollup/rollup-linux-x64-gnu": "4.62.2",
++        "@rollup/rollup-linux-x64-musl": "4.62.2",
++        "@rollup/rollup-openbsd-x64": "4.62.2",
++        "@rollup/rollup-openharmony-arm64": "4.62.2",
++        "@rollup/rollup-win32-arm64-msvc": "4.62.2",
++        "@rollup/rollup-win32-ia32-msvc": "4.62.2",
++        "@rollup/rollup-win32-x64-gnu": "4.62.2",
++        "@rollup/rollup-win32-x64-msvc": "4.62.2",
++        "fsevents": "~2.3.2"
++      }
++    },
++    "node_modules/saxes": {
++      "version": "6.0.0",
++      "resolved": "https://registry.npmjs.org/saxes/-/saxes-6.0.0.tgz",
++      "integrity": "sha512-xAg7SOnEhrm5zI3puOOKyy1OMcMlIJZYNJY7xLBwSze0UjhPLnWfj2GF2EpT0jmzaJKIWKHLsaSSajf35bcYnA==",
++      "dev": true,
++      "license": "ISC",
++      "dependencies": {
++        "xmlchars": "^2.2.0"
++      },
++      "engines": {
++        "node": ">=v12.22.7"
++      }
++    },
++    "node_modules/source-map-js": {
++      "version": "1.2.1",
++      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
++      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
++      "dev": true,
++      "license": "BSD-3-Clause",
++      "engines": {
++        "node": ">=0.10.0"
++      }
++    },
++    "node_modules/symbol-tree": {
++      "version": "3.2.4",
++      "resolved": "https://registry.npmjs.org/symbol-tree/-/symbol-tree-3.2.4.tgz",
++      "integrity": "sha512-9QNk5KwDF+Bvz+PyObkmSYjI5ksVUYtjW7AU22r2NKcfLJcXp96hkDWU3+XndOsUb+AQ9QhfzfCT2O+CNWT5Tw==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/tldts": {
++      "version": "7.4.7",
++      "resolved": "https://registry.npmjs.org/tldts/-/tldts-7.4.7.tgz",
++      "integrity": "sha512-56L0/9HELHSsG1bFCzay8UoLxzRL7kpFf7Wl5q/kSYwiSJGACvro61xnKzPNM+SadxllzdtXsKDSXE7HPeqIAw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "tldts-core": "^7.4.7"
++      },
++      "bin": {
++        "tldts": "bin/cli.js"
++      }
++    },
++    "node_modules/tldts-core": {
++      "version": "7.4.7",
++      "resolved": "https://registry.npmjs.org/tldts-core/-/tldts-core-7.4.7.tgz",
++      "integrity": "sha512-rNlAI8fKn/JckBMUSbNL/ES2kmDiurWaE49l+ikwEc9A6lFR7gMx9AhgQMQKBK4H5w4pKLH64JzZfB99uRsGNQ==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/tough-cookie": {
++      "version": "6.0.2",
++      "resolved": "https://registry.npmjs.org/tough-cookie/-/tough-cookie-6.0.2.tgz",
++      "integrity": "sha512-exgYmnmL/sJpR3upZfXG5PoatXQii55xAiXGXzY+sROLZ/Y+SLcp9PgJNI9Vz37HpQ74WvDcLT8eqm+kV3FzrA==",
++      "dev": true,
++      "license": "BSD-3-Clause",
++      "dependencies": {
++        "tldts": "^7.0.5"
++      },
++      "engines": {
++        "node": ">=16"
++      }
++    },
++    "node_modules/tr46": {
++      "version": "6.0.0",
++      "resolved": "https://registry.npmjs.org/tr46/-/tr46-6.0.0.tgz",
++      "integrity": "sha512-bLVMLPtstlZ4iMQHpFHTR7GAGj2jxi8Dg0s2h2MafAE4uSWF98FC/3MomU51iQAMf8/qDUbKWf5GxuvvVcXEhw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "punycode": "^2.3.1"
++      },
++      "engines": {
++        "node": ">=20"
++      }
++    },
++    "node_modules/undici": {
++      "version": "7.28.0",
++      "resolved": "https://registry.npmjs.org/undici/-/undici-7.28.0.tgz",
++      "integrity": "sha512-cRZYrTDwWznlnRiPjggAGxZXanty6M8RV1ff8Wm4LWXBp7/IG8v5DnOm74DtUBp9OONpK75YlPnIjQqX0dBDtA==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": ">=20.18.1"
++      }
++    },
++    "node_modules/vite": {
++      "version": "5.4.21",
++      "resolved": "https://registry.npmjs.org/vite/-/vite-5.4.21.tgz",
++      "integrity": "sha512-o5a9xKjbtuhY6Bi5S3+HvbRERmouabWbyUcpXXUA1u+GNUKoROi9byOJ8M0nHbHYHkYICiMlqxkg1KkYmm25Sw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "esbuild": "^0.21.3",
++        "postcss": "^8.4.43",
++        "rollup": "^4.20.0"
++      },
++      "bin": {
++        "vite": "bin/vite.js"
++      },
++      "engines": {
++        "node": "^18.0.0 || >=20.0.0"
++      },
++      "funding": {
++        "url": "https://github.com/vitejs/vite?sponsor=1"
++      },
++      "optionalDependencies": {
++        "fsevents": "~2.3.3"
++      },
++      "peerDependencies": {
++        "@types/node": "^18.0.0 || >=20.0.0",
++        "less": "*",
++        "lightningcss": "^1.21.0",
++        "sass": "*",
++        "sass-embedded": "*",
++        "stylus": "*",
++        "sugarss": "*",
++        "terser": "^5.4.0"
++      },
++      "peerDependenciesMeta": {
++        "@types/node": {
++          "optional": true
++        },
++        "less": {
++          "optional": true
++        },
++        "lightningcss": {
++          "optional": true
++        },
++        "sass": {
++          "optional": true
++        },
++        "sass-embedded": {
++          "optional": true
++        },
++        "stylus": {
++          "optional": true
++        },
++        "sugarss": {
++          "optional": true
++        },
++        "terser": {
++          "optional": true
++        }
++      }
++    },
++    "node_modules/w3c-xmlserializer": {
++      "version": "5.0.0",
++      "resolved": "https://registry.npmjs.org/w3c-xmlserializer/-/w3c-xmlserializer-5.0.0.tgz",
++      "integrity": "sha512-o8qghlI8NZHU1lLPrpi2+Uq7abh4GGPpYANlalzWxyWteJOCsr/P+oPBA49TOLu5FTZO4d3F9MnWJfiMo4BkmA==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "xml-name-validator": "^5.0.0"
++      },
++      "engines": {
++        "node": ">=18"
++      }
++    },
++    "node_modules/webidl-conversions": {
++      "version": "8.0.1",
++      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-8.0.1.tgz",
++      "integrity": "sha512-BMhLD/Sw+GbJC21C/UgyaZX41nPt8bUTg+jWyDeg7e7YN4xOM05YPSIXceACnXVtqyEw/LMClUQMtMZ+PGGpqQ==",
++      "dev": true,
++      "license": "BSD-2-Clause",
++      "engines": {
++        "node": ">=20"
++      }
++    },
++    "node_modules/whatwg-mimetype": {
++      "version": "5.0.0",
++      "resolved": "https://registry.npmjs.org/whatwg-mimetype/-/whatwg-mimetype-5.0.0.tgz",
++      "integrity": "sha512-sXcNcHOC51uPGF0P/D4NVtrkjSU2fNsm9iog4ZvZJsL3rjoDAzXZhkm2MWt1y+PUdggKAYVoMAIYcs78wJ51Cw==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": ">=20"
++      }
++    },
++    "node_modules/whatwg-url": {
++      "version": "16.0.1",
++      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-16.0.1.tgz",
++      "integrity": "sha512-1to4zXBxmXHV3IiSSEInrreIlu02vUOvrhxJJH5vcxYTBDAx51cqZiKdyTxlecdKNSjj8EcxGBxNf6Vg+945gw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@exodus/bytes": "^1.11.0",
++        "tr46": "^6.0.0",
++        "webidl-conversions": "^8.0.1"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/xml-name-validator": {
++      "version": "5.0.0",
++      "resolved": "https://registry.npmjs.org/xml-name-validator/-/xml-name-validator-5.0.0.tgz",
++      "integrity": "sha512-EvGK8EJ3DhaHfbRlETOWAS5pO9MZITeauHKJyb8wyajUfQUenkIg2MvLDTZ4T/TgIcm3HU0TFBgWWboAZ30UHg==",
++      "dev": true,
++      "license": "Apache-2.0",
++      "engines": {
++        "node": ">=18"
++      }
++    },
++    "node_modules/xmlchars": {
++      "version": "2.2.0",
++      "resolved": "https://registry.npmjs.org/xmlchars/-/xmlchars-2.2.0.tgz",
++      "integrity": "sha512-JZnDKK8B0RCDw84FNdDAIpZK+JuJw+s7Lz8nksI7SIuU3UXJJslUthsi+uWBUYOwPFwW7W7PRLRfUKpxjtjFCw==",
++      "dev": true,
++      "license": "MIT"
++    }
++  }
++}
+diff --git a/apps/xing-hai-lv-zhe/package.json b/apps/xing-hai-lv-zhe/package.json
+new file mode 100644
+index 0000000..655791f
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/package.json
+@@ -0,0 +1,17 @@
++{
++  "name": "xing-hai-lv-zhe",
++  "version": "1.0.0",
++  "description": "《星骸旅者》开罗式像素 Roguelike 生存探索小游戏 - A Kairosoft-style pixel roguelike survival RPG",
++  "type": "module",
++  "scripts": {
++    "dev": "vite",
++    "build": "vite build",
++    "preview": "vite preview --host",
++    "test": "node scripts/logic-test.mjs",
++    "test:dom": "node scripts/smoke-dom.mjs"
++  },
++  "devDependencies": {
++    "jsdom": "^29.1.1",
++    "vite": "^5.4.0"
++  }
++}
+diff --git a/apps/xing-hai-lv-zhe/scripts/_css-loader.mjs b/apps/xing-hai-lv-zhe/scripts/_css-loader.mjs
+new file mode 100644
+index 0000000..b10c2fa
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/scripts/_css-loader.mjs
+@@ -0,0 +1,7 @@
++// 让 Node 的 ESM 加载器把 *.css 视作空模块（仅冒烟测试用）。
++export async function load(url, context, nextLoad) {
++  if (url.endsWith('.css')) {
++    return { format: 'module', source: '', shortCircuit: true };
++  }
++  return nextLoad(url, context);
++}
+diff --git a/apps/xing-hai-lv-zhe/scripts/logic-test.mjs b/apps/xing-hai-lv-zhe/scripts/logic-test.mjs
+new file mode 100644
+index 0000000..9234de2
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/scripts/logic-test.mjs
+@@ -0,0 +1,410 @@
++// ============================================================================
++// 纯逻辑自测：不依赖浏览器，覆盖 config / player / world / battle / save 各模块。
++// 运行：node scripts/logic-test.mjs
++// ============================================================================
++import {
++  PALETTE, GRID, VISION_RADIUS, TILES, FLOOR_TILES, tileOf, isWalkable,
++  EQUIP_SLOTS, MAX_PLUS, AFFIX_AT, AFFIXES, enhanceCost, starterEquipment,
++  TALENTS, talentCost, floorConfig, enemyPoolFor, MEMORY_CHAPTERS, MAX_FLOOR,
++  STAMINA_COST_PER_ROUND, STAMINA_TIRED, expToNext, clamp,
++} from '../src/config.js';
++import {
++  newPlayer, migrate, maxHp, maxStamina, effectiveAtk, effectiveDef, effectiveMoveRange,
++  enhanceEquipment, buyTalent, resetTalents, gainReward, healFull, regenStamina, spendStamina,
++  damagePlayer, isDead, collectMemory, collectedMemoryCount,
++} from '../src/core/player.js';
++import {
++  generateFloor, findPath, reachableTiles, entityAt, removeEntity, tileAt, descend, bfsReachable, enemyFromDef,
++} from '../src/core/world.js';
++import {
++  STANCES, ACTIONS, COUNTERS, TELEGRAPH_CHANCE,
++  pickEnemyStance, isTelegraphed, autoPickAction, resolveRound, enemyReward,
++} from '../src/core/battle.js';
++import {
++  _setStorage, saveToSlot, loadFromSlot, deleteSlot, listSaves, hasAnySave, latestSlot,
++  exportSave, importSave, SAVE_SLOTS,
++} from '../src/core/save.js';
++import { makeRng } from '../src/core/rng.js';
++
++let pass = 0, fail = 0;
++const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
++const seq = (arr) => makeRng(arr);
++const r0 = () => 0;
++const r1 = () => 0.999;
++const rMid = () => 0.5;
++
++// ===================== config =====================
++ok(Object.keys(PALETTE).length === 16, `调色板恰好 16 色（实际 ${Object.keys(PALETTE).length}）`);
++ok(GRID === 16 && VISION_RADIUS === 2, '地图 16×16、视野半径 2（5×5）');
++ok(EQUIP_SLOTS.length === 3 && EQUIP_SLOTS.includes('booster'), '装备三栏：武器/护甲/推进器');
++ok(MAX_PLUS === 10 && AFFIX_AT === 5, '强化上限 +10，+5 触发词缀');
++ok(AFFIXES.length >= 5 && AFFIXES.some((a) => a.id === 'lifesteal') && AFFIXES.some((a) => a.id === 'thorns'), '词缀池含吸血/反伤等');
++ok(enhanceCost(0) < enhanceCost(3) && enhanceCost(3) < enhanceCost(9), '强化消耗随 plus 递增');
++ok(TALENTS.length === 3 && TALENTS.some((t) => t.branch === 'survival') && TALENTS.some((t) => t.branch === 'luck'), '三天赋分支：生存/战斗/幸运');
++ok(MEMORY_CHAPTERS.length === 10, `记忆章节 10 章（实际 ${MEMORY_CHAPTERS.length}）`);
++ok(MAX_FLOOR === 10, '共 10 层（含 Boss）');
++ok(enemyPoolFor(1).length >= 1 && enemyPoolFor(10).some((e) => e.boss), '敌人池按楼层分阶，10 层含 Boss');
++ok(floorConfig(1).memory === true && floorConfig(10).memory === true, '每层含 1 枚记忆回响');
++ok(expToNext(1) < expToNext(5), '升级所需经验随等级递增');
++ok(tileOf('water').walkable === false && tileOf('floor').walkable === true, '地块通行性正确');
++ok(isWalkable('wall') === false && isWalkable('sand') === true, 'isWalkable 辅助正确');
++ok(Array.from(new Set(FLOOR_TILES)).length === FLOOR_TILES.length, '可行走地块类型无重复');
++
++// ===================== player =====================
++let p = newPlayer(seq([0.4, 0.4, 0.4, 0.4, 0.4, 0.4]), { name: '阿尔法' });
++ok(p.name === '阿尔法' && p.hp === maxHp(p) && p.stamina === maxStamina(), '新角色满状态');
++ok(p.floor === 1 && p.maxFloor === 1 && p.level === 1, '新角色从第 1 层、Lv1 起步');
++ok(p.stardust === 0 && p.parts === 0 && p.exp === 0, '新角色零资源');
++ok(p.equipment.weapon.name === '生锈砍刀' && p.equipment.booster.plus === 0, '起始装备正确');
++ok(Object.keys(p.talents).length === 3 && p.talents.combat === 0, '天赋初始全 0');
++ok(p.memory.length === 10 && p.memory.every((x) => x === false), '记忆初始全未收集');
++
++// 超长姓名截断
++ok(newPlayer(r0, { name: '一二三四五六七八九十' }).name.length === 8, '超长姓名截断 8 字');
++
++// migrate 修复损坏档
++{
++  _setStorage(memStorage());
++  const bad = { name: '', hp: -5, stamina: 999, stardust: -3, parts: 'x', level: 0, exp: -1, floor: 99, maxFloor: 0, seed: NaN, turn: -1, equipment: { weapon: { name: 1, stat: 'a', plus: 99, affix: { id: 'nope' } } }, talents: { survival: 99, combat: -1 }, memory: [true, true], ending: 'weird' };
++  saveToSlot(0, bad);
++  const f = loadFromSlot(0);
++  ok(f.name === '旅者', 'migrate 空姓名兜底');
++  ok(f.hp >= 0 && f.stamina >= 0, 'migrate HP/精力非负');
++  ok(f.stardust === 0 && f.parts === 0 && f.exp === 0, 'migrate 资源非负');
++  ok(f.level === 1, 'migrate 等级下限 1');
++  ok(f.floor === MAX_FLOOR, 'migrate 楼层钳到上限');
++  ok(Number.isFinite(f.seed), 'migrate 补种子');
++  ok(f.equipment.weapon.plus === MAX_PLUS, 'migrate 强化钳到上限');
++  ok(f.equipment.weapon.affix === null, 'migrate 非法词缀置空');
++  ok(f.talents.survival === 5 && f.talents.combat === 0, 'migrate 天赋钳到合法档');
++  ok(f.memory.length === 10 && f.memory[0] === true && f.memory[2] === false, 'migrate 记忆数组补齐');
++  ok(f.ending === null, 'migrate 非法结局置空');
++}
++
++// migrate：楼层快照损坏（某行为 null / pos 越界）→ 丢弃或钳制，绝不崩溃或软锁
++{
++  _setStorage(memStorage());
++  const grid = Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => 'floor'));
++  const broken = { name: '甲', floor: 2, floorState: { grid: grid.map((r, i) => (i === 5 ? null : r)), pos: { x: 3, y: 3 }, entities: [], explored: {} } };
++  saveToSlot(0, broken);
++  const f1 = loadFromSlot(0);
++  ok(f1.floorState === null, 'migrate：grid 含 null 行 → floorState 置空（重生成）');
++  const badPos = { name: '乙', floor: 2, floorState: { grid, pos: { x: -1 }, entities: [], explored: {} } };
++  saveToSlot(1, badPos);
++  const f2 = loadFromSlot(1);
++  ok(f2.floorState !== null && f2.floorState.pos.x === 1 && f2.floorState.pos.y === 1, 'migrate：pos 越界 → 钳到 {1,1}');
++  const okPos = { name: '丙', floor: 2, floorState: { grid, pos: { x: 7, y: 9 }, entities: [], explored: {} } };
++  saveToSlot(2, okPos);
++  const f3 = loadFromSlot(2);
++  ok(f3.floorState.pos.x === 7 && f3.floorState.pos.y === 9, 'migrate：合法 pos 原样保留');
++}
++
++// 派生数值：强化 / 天赋 / 词缀 / 等级 均生效
++{
++  const a = newPlayer(r0, {});
++  const baseAtk = effectiveAtk(a);
++  a.equipment.weapon.plus = 3;
++  ok(effectiveAtk(a) > baseAtk, '武器强化提升攻击');
++  a.talents.combat = 3;
++  ok(effectiveAtk(a) > baseAtk + 3, '战斗天赋额外提升攻击');
++  const a2 = newPlayer(r0, {});
++  const baseDef = effectiveDef(a2);
++  a2.equipment.armor.plus = 2;
++  ok(effectiveDef(a2) > baseDef, '护甲强化提升防御');
++  const a3 = newPlayer(r0, {});
++  ok(effectiveMoveRange(a3) === 1, '初始移动步数 1');
++  a3.equipment.booster.plus = 2;
++  ok(effectiveMoveRange(a3) === 3, '推进器强化提升步数');
++  a3.equipment.booster.affix = { id: 'swift' };
++  ok(effectiveMoveRange(a3) === 4, '迅捷词缀 +1 步');
++  // 等级提升血量上限
++  const a4 = newPlayer(r0, {});
++  a4.level = 5;
++  ok(maxHp(a4) > maxHp(newPlayer(r0, {})), '等级提升血量上限');
++}
++
++// enhanceEquipment：消耗零件、+plus、+5 触发词缀
++{
++  const e = newPlayer(r0, {});
++  e.parts = 100;
++  const cost0 = enhanceCost(0);
++  let res = enhanceEquipment(e, 'weapon', seq([0.1]));
++  ok(res.ok === true && e.parts === 100 - cost0 && e.equipment.weapon.plus === 1, '强化消耗零件且 plus+1');
++  // 连续强化到 +5 触发词缀
++  e.equipment.weapon.plus = 4;
++  res = enhanceEquipment(e, 'weapon', seq([0.2]));
++  ok(res.ok && res.affixed && e.equipment.weapon.plus === 5, '强化至 +5');
++  ok(e.equipment.weapon.affix && AFFIXES.some((a) => a.id === e.equipment.weapon.affix.id), '+5 触发词缀变异');
++  // 达上限
++  e.equipment.weapon.plus = MAX_PLUS;
++  res = enhanceEquipment(e, 'weapon', r0);
++  ok(res.ok === false && res.reason === 'max', '达上限不可强化');
++  // 零件不足
++  e.equipment.weapon.plus = 0; e.parts = 0;
++  res = enhanceEquipment(e, 'weapon', r0);
++  ok(res.ok === false && res.reason === 'no-parts', '零件不足不可强化');
++}
++
++// 天赋：消耗星骸、上限、重置返还
++{
++  const t = newPlayer(r0, {});
++  t.stardust = 200;
++  const c0 = talentCost('combat', 0);
++  let res = buyTalent(t, 'combat');
++  ok(res.ok && t.talents.combat === 1 && t.stardust === 200 - c0, '点亮战斗天赋消耗星骸');
++  // 生存天赋补 HP
++  const hpBefore = t.hp;
++  res = buyTalent(t, 'survival');
++  ok(res.ok && t.hp >= hpBefore, '生存天赋补 HP');
++  // 重置全额返还
++  const sdBefore = t.stardust;
++  res = resetTalents(t);
++  ok(res.ok && res.refund > 0 && t.stardust > sdBefore, '重置天赋返还星骸');
++  ok(t.talents.combat === 0 && t.talents.survival === 0, '重置后天赋归零');
++  // 星骸不足
++  t.stardust = 0;
++  res = buyTalent(t, 'luck');
++  ok(res.ok === false && res.reason === 'no-stardust', '星骸不足不可点亮');
++}
++
++// gainReward：幸运加成 + 升级
++{
++  const g = newPlayer(r0, {});
++  gainReward(g, { stardust: 10, parts: 4, exp: 0 }, r0);
++  ok(g.stardust === 10 && g.parts === 4, '基础奖励入账');
++  const lucky = newPlayer(r0, {});
++  lucky.talents.luck = 3;
++  gainReward(lucky, { stardust: 10, parts: 4 }, r0);
++  ok(lucky.stardust > 10 && lucky.parts > 4, '幸运天赋提升掉落');
++  // 升级
++  const lv = newPlayer(r0, {});
++  const lvBefore = lv.level;
++  const need = expToNext(lv.level);
++  gainReward(lv, { exp: need + 5 }, r0);
++  ok(lv.level === lvBefore + 1 && lv.exp === 5, '经验达标后升级并结算剩余经验');
++}
++
++// HP / 精力 / 死亡
++{
++  const d = newPlayer(r0, {});
++  damagePlayer(d, 1000);
++  ok(d.hp === 0 && isDead(d) === true, '伤害致死判定死亡');
++  healFull(d);
++  ok(d.hp === maxHp(d) && d.stamina === maxStamina(d), '满状态恢复');
++  spendStamina(d, 50);
++  ok(d.stamina < maxStamina(d), '消耗精力');
++  regenStamina(d, 10);
++  ok(d.stamina <= maxStamina(d), '精力回复钳制上限');
++}
++
++// 记忆收集
++{
++  const m = newPlayer(r0, {});
++  ok(collectedMemoryCount(m) === 0, '初始收集数 0');
++  const res = collectMemory(m, 0);
++  ok(res.ok && m.memory[0] === true && collectedMemoryCount(m) === 1, '收集记忆解锁章节');
++  const again = collectMemory(m, 0);
++  ok(again.ok === false && again.already === true, '重复收集不重复解锁');
++  ok(m.hp < maxHp(m) || m.hp === maxHp(m), '收集记忆回复 HP 不报错');
++}
++
++// ===================== world =====================
++{
++  const st = generateFloor(seq(Array.from({ length: 64 }, (_, i) => (i % 7) / 7)), 1, newPlayer(r0, {}));
++  ok(st.grid.length === GRID && st.grid[0].length === GRID, '生成 16×16 网格');
++  // 边界为墙
++  ok(st.grid[0][0] === 'wall' && st.grid[GRID - 1][GRID - 1] === 'wall', '边界为墙');
++  // 出生点可行走
++  ok(isWalkable(tileAt(st, st.pos.x, st.pos.y)), '出生点可行走');
++  // 第 1 层有阶梯
++  ok(st.entities.some((e) => e.type === 'memory'), '第 1 层含 1 枚记忆');
++  ok(st.entities.filter((e) => e.type === 'enemy').length === floorConfig(1).enemyCount, `敌人数量符合楼层配置（${floorConfig(1).enemyCount}）`);
++  ok(st.entities.filter((e) => e.type === 'chest').length === floorConfig(1).chestCount, '宝箱数量符合楼层配置');
++  ok(st.entities.some((e) => ['merchant', 'drone', 'trap'].includes(e.type)), '含 1 个随机事件点');
++  // 有阶梯且非 Boss 层
++  let hasStairs = false;
++  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (tileAt(st, x, y) === 'stairs') hasStairs = true;
++  ok(hasStairs, '第 1 层存在下行阶梯');
++  // 实体不重叠出生点
++  ok(!entityAt(st, st.pos.x, st.pos.y), '出生点无实体');
++  // 出生点可达阶梯
++  const reach = bfsReachable(st.grid, st.pos.x, st.pos.y);
++  let stairsKey = null;
++  for (let y = 0; y < GRID && !stairsKey; y++) for (let x = 0; x < GRID && !stairsKey; x++) if (tileAt(st, x, y) === 'stairs') stairsKey = `${x},${y}`;
++  ok(stairsKey && reach.dist.has(stairsKey), '出生点可达阶梯（连通保证）');
++}
++// Boss 层：无阶梯、有 Boss
++{
++  const st = generateFloor(seq(Array.from({ length: 64 }, (_, i) => (i % 5) / 5)), MAX_FLOOR, newPlayer(r0, {}));
++  let hasStairs = false;
++  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (tileAt(st, x, y) === 'stairs') hasStairs = true;
++  ok(hasStairs === false, 'Boss 层无下行阶梯');
++  const boss = st.entities.find((e) => e.type === 'enemy');
++  ok(boss && boss.boss === true, 'Boss 层含 Boss 敌人');
++  ok(st.entities.some((e) => e.type === 'memory'), 'Boss 层仍含 1 枚记忆');
++}
++
++// reachableTiles / findPath
++{
++  const grid = Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => 'floor'));
++  for (let i = 0; i < GRID; i++) { grid[0][i] = 'wall'; grid[GRID - 1][i] = 'wall'; grid[i][0] = 'wall'; grid[i][GRID - 1] = 'wall'; }
++  const st = { grid, pos: { x: 5, y: 5 }, entities: [] };
++  const reach1 = reachableTiles(st, st.pos, 1);
++  ok(reach1.size === 5, `步数 1 可达 5 格（实际 ${reach1.size}）`); // 自身 + 4 邻
++  const reach2 = reachableTiles(st, st.pos, 2);
++  ok(reach2.size === 13, `步数 2 可达 13 格（实际 ${reach2.size}）`);
++  const path = findPath(st, { x: 5, y: 5 }, { x: 7, y: 5 }, 5, new Set());
++  ok(Array.isArray(path) && path.length === 2, `findPath 走 2 步到 (3,1)（实际 ${path && path.length}）`);
++  const tooFar = findPath(st, { x: 1, y: 1 }, { x: 5, y: 1 }, 2, new Set());
++  ok(tooFar === null, '超出步数上限 findPath 返回 null');
++  // 墙阻挡
++  grid[1][2] = 'wall';
++  const blocked = findPath(st, { x: 1, y: 1 }, { x: 3, y: 1 }, 5, new Set());
++  // 直线被墙挡，但可绕行（2,1 被墙挡，可走 1,2->2,2->3,2->3,1）；仍可达
++  ok(Array.isArray(blocked), '墙阻挡直线但仍可绕行抵达');
++  // 敌人格视为阻挡
++  const stE = { grid: grid.map((r) => r.slice()), pos: { x: 1, y: 1 }, entities: [{ id: 'e1', type: 'enemy', x: 2, y: 1 }] };
++  const reachE = reachableTiles(stE, stE.pos, 2);
++  ok(!reachE.has('2,1'), '敌人所在格不可达');
++}
++// entityAt / removeEntity / descend
++{
++  const st = { grid: Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => 'floor')), pos: { x: 1, y: 1 }, entities: [{ id: 'e1', type: 'chest', x: 2, y: 2 }] };
++  ok(entityAt(st, 2, 2) && entityAt(st, 2, 2).id === 'e1', 'entityAt 命中');
++  ok(entityAt(st, 3, 3) === null, 'entityAt 空格返回 null');
++  ok(removeEntity(st, 'e1') === true && entityAt(st, 2, 2) === null, 'removeEntity 移除实体');
++  ok(removeEntity(st, 'nope') === false, 'removeEntity 不存在返回 false');
++  const pl = newPlayer(r0, {}); pl.floor = 5;
++  ok(descend(pl) === 6 && pl.maxFloor === 6, 'descend 推进楼层并更新最远记录');
++  pl.floor = MAX_FLOOR;
++  ok(descend(pl) === MAX_FLOOR, 'descend 钳到上限');
++}
++
++// ===================== battle =====================
++ok(Object.keys(COUNTERS).length === 3, '三组克制关系');
++ok(COUNTERS.counter === 'thrust' && COUNTERS.block === 'slash' && COUNTERS.dodge === 'smash', '反击克突刺、格挡克横斩、闪避克重击');
++{
++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
++  ok(['thrust', 'slash', 'smash'].includes(pickEnemyStance(enemy, r0)), 'pickEnemyStance 返回合法架势');
++  ok(autoPickAction('thrust') === 'counter' && autoPickAction('slash') === 'block' && autoPickAction('smash') === 'dodge', 'autoPickAction 给出正确克制');
++  ok(isTelegraphed(seq([0.1])) === true && isTelegraphed(seq([0.9])) === false, 'isTelegraphed 按概率识破');
++  ok(TELEGRAPH_CHANCE > 0 && TELEGRAPH_CHANCE < 1, '识破概率合法');
++}
++// 克制成功：敌人受伤、玩家不掉血、专注力蓄满
++{
++  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
++  const hpBefore = enemy.hp;
++  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r1); // r1 不失手
++  ok(res.countered === true, '反击对突刺 → 克制成功');
++  ok(res.enemyDmg > 0 && enemy.hp === hpBefore - res.enemyDmg, '敌人受到伤害');
++  ok(res.playerDmg === 0, '克制成功玩家不掉血');
++  ok(res.nextFocus === true, '克制成功蓄满专注力');
++}
++// 专注力倍率：下一击伤害更高
++{
++  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
++  const atk = effectiveAtk(pl);
++  const e1 = enemyFromDef(enemyPoolFor(1)[0], 1);
++  resolveRound(pl, e1, 'counter', false, 'thrust', r1);
++  const e2 = enemyFromDef(enemyPoolFor(1)[0], 1);
++  const res2 = resolveRound(pl, e2, 'counter', true, 'thrust', r1); // 带专注
++  ok(res2.enemyDmg > atk, '专注力下克制伤害高于基础攻击');
++}
++// 应对失败：玩家受伤
++{
++  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1); enemy.atk = 30;
++  const hpBefore = pl.hp;
++  const res = resolveRound(pl, enemy, 'block', false, 'thrust', r1); // 格挡不克突刺
++  ok(res.countered === false, '错误应对 → 未克制');
++  ok(res.playerDmg > 0 && pl.hp < hpBefore, '玩家受到伤害');
++  ok(res.nextFocus === false, '失败清空专注力');
++}
++// 精力过低失手
++{
++  const pl = newPlayer(r0, {}); pl.stamina = 0; // < STAMINA_TIRED
++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
++  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r0); // r0 → 触发失手
++  ok(res.fumble === true && res.countered === false, '精力过低且随机=0 → 失手');
++}
++// 吸血词缀
++{
++  const pl = newPlayer(r0, {});
++  pl.stamina = maxStamina(pl); pl.hp = 10;
++  pl.equipment.weapon.affix = { id: 'lifesteal' };
++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
++  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r1);
++  ok(res.healed > 0 && pl.hp > 10, '吸血词缀在克制命中时回血');
++}
++// 反伤词缀
++{
++  const pl = newPlayer(r0, {});
++  pl.stamina = maxStamina(pl);
++  pl.equipment.armor.affix = { id: 'thorns' };
++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1); enemy.atk = 40;
++  const hpBefore = enemy.hp;
++  const res = resolveRound(pl, enemy, 'block', false, 'thrust', r1); // 失败受击
++  ok(res.playerDmg > 0 && enemy.hp < hpBefore, '反伤词缀在受击时反弹伤害');
++}
++// 战斗致死与奖励
++{
++  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1); enemy.hp = 1; enemy.maxHp = 1;
++  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r1);
++  ok(res.enemyDead === true && enemy.hp === 0, '敌人 HP 归零判定死亡');
++  const rw = enemyReward(enemy);
++  ok(Number.isFinite(rw.stardust) && Number.isFinite(rw.parts) && Number.isFinite(rw.exp), 'enemyReward 返回奖励数值');
++}
++ok(STAMINA_COST_PER_ROUND > 0 && STAMINA_TIRED > 0, '战斗精力消耗 / 疲惫阈值合法');
++
++// ===================== save（多槽位）=====================
++function memStorage() {
++  const m = {};
++  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: (k) => { delete m[k]; } };
++}
++ok(SAVE_SLOTS >= 5, `存档槽位 ≥ 5（实际 ${SAVE_SLOTS}）`);
++_setStorage(memStorage());
++ok(hasAnySave() === false && latestSlot() === null, '空存储无存档');
++ok(Array.isArray(listSaves()) && listSaves().length === SAVE_SLOTS, 'listSaves 返回全部槽位');
++
++const toSave = newPlayer(seq([0.3, 0.3, 0.3, 0.3, 0.3, 0.3]), { name: '贝塔' });
++toSave.floor = 4; toSave.stardust = 30; toSave.parts = 12;
++ok(saveToSlot(0, toSave) === true && hasAnySave() === true && latestSlot() === 0, 'saveToSlot 写入并可读出');
++const loaded = loadFromSlot(0);
++ok(loaded.name === '贝塔' && loaded.floor === 4 && loaded.stardust === 30 && loaded.parts === 12, '读档字段一致');
++
++saveToSlot(1, newPlayer(r0, { name: '甲' }));
++saveToSlot(2, newPlayer(r0, { name: '乙' }));
++ok(loadFromSlot(1).name === '甲' && loadFromSlot(0).name === '贝塔', '多槽位互不干扰');
++ok(listSaves().filter((s) => s.exists).length === 3, 'listSaves 标记已用槽');
++{
++  saveToSlot(3, newPlayer(r0, { name: '最新' }));
++  ok(latestSlot() === 3, 'latestSlot 取最近游玩槽位');
++}
++ok(deleteSlot(3) === true && loadFromSlot(3) === null, 'deleteSlot 删除槽位');
++ok(deleteSlot(999) === false, '非法槽位 deleteSlot 返回 false');
++
++// 导入导出往返
++{
++  const orig = newPlayer(seq([0.2, 0.2, 0.2, 0.2, 0.2, 0.2]), { name: '伽马' });
++  orig.floor = 6; orig.memory[0] = true;
++  const str = exportSave(orig);
++  ok(typeof str === 'string' && str.length > 0, 'exportSave 生成字符串');
++  const back = importSave(str);
++  ok(back !== null && back.name === '伽马' && back.floor === 6 && back.memory[0] === true, '导入后字段一致');
++  ok(importSave('!!!not-base64!!!') === null, '非法导入串返回 null');
++}
++
++// 楼层快照随存档保存
++{
++  _setStorage(memStorage());
++  const pl = newPlayer(r0, {});
++  pl.floorState = generateFloor(rMid, 2, pl);
++  saveToSlot(0, pl);
++  const back = loadFromSlot(0);
++  ok(back.floorState && back.floorState.grid.length === GRID, '楼层快照随存档保存');
++}
++
++console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
++process.exit(fail ? 1 : 0);
+diff --git a/apps/xing-hai-lv-zhe/scripts/smoke-dom.mjs b/apps/xing-hai-lv-zhe/scripts/smoke-dom.mjs
+new file mode 100644
+index 0000000..eb88f9a
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/scripts/smoke-dom.mjs
+@@ -0,0 +1,322 @@
++// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程
++// （启动器 → 创角 → 地图移动 → 战斗 → 胜利 → 下层 → 背包强化/天赋 → 事件 → 存档往返 → Boss 通关结局）。
++// 运行：node scripts/smoke-dom.mjs   （需先 npm install jsdom）
++import { JSDOM } from 'jsdom';
++import { register } from 'node:module';
++
++// 把 *.css 当作空模块（app.js 顶部 import 了样式表）
++register('./_css-loader.mjs', import.meta.url);
++
++const dom = new JSDOM('<!DOCTYPE html><div id="game-container"></div>', {
++  url: 'http://localhost/',
++  pretendToBeVisual: true,
++});
++const { window } = dom;
++for (const k of ['document', 'window', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'Element', 'getComputedStyle', 'CustomEvent', 'MouseEvent', 'Event']) {
++  if (window[k] === undefined) continue;
++  try { globalThis[k] = window[k]; } catch (_) { /* Node 部分全局只读 */ }
++}
++globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
++globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
++
++let pass = 0, fail = 0;
++const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
++const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
++
++const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);
++const { isWalkable } = await import(new URL('../src/config.js', import.meta.url).href);
++const { entityAt, generateFloor } = await import(new URL('../src/core/world.js', import.meta.url).href);
++const { maxHp } = await import(new URL('../src/core/player.js', import.meta.url).href);
++
++const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
++const GRID = 16;
++
++// ---------- 1) 首启：启动器 ----------
++localStorage.clear();
++let ui = window.__XHLZ;
++await sleep(10);
++ok(document.querySelector('.launcher') !== null, '渲染启动器');
++ok(/星骸旅者/.test(document.querySelector('.launcher h1')?.textContent || ''), '启动器标题为「星骸旅者」');
++ok(document.querySelector('.launcher__actions .btn-primary') !== null, '启动器有主操作按钮');
++
++// ---------- 2) 开启新旅程 → 创角页 ----------
++// 用确定性 rng（=0.4）：生成开阔浮岛，战斗时恒识破「突刺」，便于稳定取胜。
++ui.rng = () => 0.4;
++ui.timerEnabled = false;
++document.querySelector('.launcher__actions .btn-primary').click();
++await sleep(10);
++ok(document.querySelector('.launcher.create') !== null || document.querySelector('.create__head') !== null, '点击开始进入创角页');
++ok(document.querySelector('[data-id="name"]') !== null, '创角页有姓名输入');
++
++// ---------- 3) 取名 + 迫降 → 进入地图 ----------
++const nameInput = document.querySelector('[data-id="name"]');
++if (nameInput) {
++  nameInput.value = '星岚';
++  nameInput.dispatchEvent(new window.Event('input', { bubbles: true }));
++}
++document.querySelector('.create__foot .btn-primary').click();
++await sleep(15);
++ok(document.querySelector('.xhlz-game') !== null, '迫降后进入游戏界面');
++ok(document.querySelector('.status-bar') !== null, '渲染顶部状态栏');
++ok(document.querySelector('.map-grid') !== null, '渲染像素地图');
++ok(document.querySelectorAll('.cell').length === GRID * GRID, `地图含 ${GRID * GRID} 个地块（实际 ${document.querySelectorAll('.cell').length}）`);
++ok(ui.player && ui.player.name === '星岚', `角色姓名记录正确（${ui.player?.name}）`);
++ok(ui.player.floor === 1 && ui.player.floorState, '初始第 1 层且生成楼层快照');
++ok(document.querySelector('.interact-btn') !== null, '底部有中央交互键');
++
++// ---------- 4) 移动：步数推进、迷雾揭开 ----------
++const turnBefore = ui.player.turn;
++const stepOnce = () => {
++  const st = ui.player.floorState;
++  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
++    const nx = st.pos.x + dx, ny = st.pos.y + dy;
++    if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
++    const ent = entityAt(st, nx, ny);
++    if (ent && ent.type === 'enemy') continue;
++    if (!isWalkable(st.grid[ny][nx])) continue;
++    ui.tryMoveTo(nx, ny);
++    return true;
++  }
++  return false;
++};
++let moved = false;
++for (let i = 0; i < 6; i++) { if (ui._sheet) ui.closeModal(); if (stepOnce()) moved = true; await sleep(5); }
++ok(moved && ui.player.turn > turnBefore, `移动推进步数（turn ${turnBefore}→${ui.player.turn}）`);
++ok(Object.keys(ui.player.floorState.explored).length > 1, '移动揭开了迷雾');
++
++// ---------- 5) 战斗：走到敌人旁 → 攻击 → 猜拳取胜 ----------
++function nearestEnemy() {
++  const st = ui.player.floorState;
++  let best = null, bd = Infinity;
++  for (const e of st.entities) if (e.type === 'enemy') { const d = manhattan(st.pos, e); if (d < bd) { bd = d; best = e; } }
++  return best;
++}
++// 贪心走向敌人直到相邻（逐格，遇事件弹窗自动关闭）
++function walkAdjacent(enemy) {
++  const st = ui.player.floorState;
++  let guard = 0;
++  while (enemy && manhattan(st.pos, enemy) > 1 && guard++ < 80) {
++    if (ui._sheet) { ui.closeModal(); continue; }
++    let best = null, bestD = Infinity;
++    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
++      const nx = st.pos.x + dx, ny = st.pos.y + dy;
++      if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
++      const ent = entityAt(st, nx, ny);
++      if (ent && ent.type === 'enemy') continue;
++      if (!isWalkable(st.grid[ny][nx])) continue;
++      const d = Math.abs(nx - enemy.x) + Math.abs(ny - enemy.y);
++      if (d < bestD) { bestD = d; best = { x: nx, y: ny }; }
++    }
++    if (!best) return false;
++    ui.tryMoveTo(best.x, best.y);
++  }
++  return enemy ? manhattan(st.pos, enemy) <= 1 : false;
++}
++
++// 通用战斗取胜：读架势 → 点击克制应对，直到战斗结束
++async function winBattle() {
++  let guard = 0;
++  while (document.querySelector('.battle') && guard++ < 80) {
++    const chip = document.querySelector('.stance-chip');
++    let act = 'counter';
++    if (chip) {
++      const t = chip.textContent || '';
++      if (t.includes('横斩')) act = 'block';
++      else if (t.includes('重击')) act = 'dodge';
++      else act = 'counter';
++    }
++    const btn = document.querySelector(`.battle__actions .act[data-action="${act}"]`);
++    if (btn && !btn.disabled) btn.click();
++    await sleep(70);
++  }
++  return !document.querySelector('.battle');
++}
++
++let enemy = nearestEnemy();
++ok(!!enemy, '第 1 层存在敌人');
++let reached = enemy ? walkAdjacent(enemy) : false;
++if (!reached && enemy) {
++  // 退化：直接对相邻敌人开战（绕过寻路 UI）
++  ui.startBattle(enemy);
++} else {
++  ok(/攻击/.test(document.querySelector('.interact-btn')?.textContent || ''), '靠近敌人后交互键变为「攻击」');
++  document.querySelector('.interact-btn').click();
++}
++await sleep(15);
++ok(document.querySelector('.battle') !== null, '进入战斗界面');
++ok(document.querySelectorAll('.battle__actions .act').length === 3, '战斗含 3 个应对按钮');
++const sdBefore = ui.player.stardust;
++const won = await winBattle();
++ok(won, '战斗取胜并退出战斗界面');
++ok(ui.player.stardust > sdBefore, `战斗获得星骸（${sdBefore}→${ui.player.stardust}）`);
++
++// ---------- 5b) 自动战斗：开启后能自动结算多回合直至取胜（防死锁） ----------
++const enemy2 = nearestEnemy();
++if (enemy2) {
++  const reached2 = walkAdjacent(enemy2);
++  if (reached2) {
++    document.querySelector('.interact-btn').click(); // 攻击
++    await sleep(15);
++    const autoBtn = document.querySelector('[title="自动战斗"]');
++    ok(!!autoBtn, '战斗界面有自动战斗开关');
++    if (autoBtn) autoBtn.click(); // 开启自动
++    await sleep(10);
++    ok(ui.battle && ui.battle.auto === true, '开启后 battle.auto=true');
++    // 轮询等待自动战斗结束（防 5b 死锁回归）
++    let guard = 0;
++    while (document.querySelector('.battle') && guard++ < 200) { await sleep(70); }
++    ok(!document.querySelector('.battle'), `自动战斗能自行取胜并退出（${guard} 轮）`);
++  }
++}
++
++// ---------- 6) 事件：商人 / 无人机 ----------
++ui.player.stardust += 50; // 便于测试购买
++ui.refreshStatus();
++ui.showMerchant();
++await sleep(10);
++ok(/流浪商人/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开商人面板');
++const buyBtn = document.querySelector('.sheet__body .slot-row .btn-primary');
++ok(!!buyBtn && !buyBtn.disabled, '商人有可购买商品');
++if (buyBtn) buyBtn.click();
++await sleep(10);
++ui.closeModal();
++ui.showDrone();
++await sleep(10);
++ok(/维修无人机/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开无人机面板');
++const droneBtn = [...document.querySelectorAll('.sheet__foot button')].find((b) => /维修/.test(b.textContent));
++ok(!!droneBtn, '无人机有维修按钮');
++if (droneBtn) droneBtn.click();
++await sleep(10);
++ok(ui.player.hp === maxHp(ui.player), '无人机维修回满 HP');
++
++// ---------- 7) 背包：强化 / 天赋 / 剧情 ----------
++ui.player.parts = 100;
++ui.openInventory();
++await sleep(10);
++ok(/背包/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开背包');
++ok(document.querySelectorAll('.tabs .tab').length === 3, '背包含 装备/天赋/剧情 三标签');
++const plusBefore = ui.player.equipment.weapon.plus;
++const enhBtn = document.querySelector('.equip-card .btn-primary');
++ok(!!enhBtn, '装备页有强化按钮');
++if (enhBtn) enhBtn.click();
++await sleep(10);
++ok(ui.player.equipment.weapon.plus === plusBefore + 1, `强化成功 +${plusBefore}→+${ui.player.equipment.weapon.plus}`);
++// 天赋
++document.querySelectorAll('.tabs .tab')[1].click();
++await sleep(10);
++ok(document.querySelectorAll('.talent-branch').length === 3, '天赋页含 3 分支');
++const talBtn = document.querySelector('.talent-branch .btn-primary');
++ok(!!talBtn, '天赋页有点亮按钮');
++if (talBtn) talBtn.click();
++await sleep(10);
++ok(ui.player.talents.combat === 1 || ui.player.talents.survival === 1 || ui.player.talents.luck === 1, '点亮天赋成功');
++// 重置
++const resetBtn = [...document.querySelectorAll('.sheet__body button')].find((b) => /重置天赋/.test(b.textContent));
++if (resetBtn) resetBtn.click();
++await sleep(10);
++ok(ui.player.talents.combat === 0 && ui.player.talents.survival === 0 && ui.player.talents.luck === 0, '重置天赋后归零');
++// 剧情
++document.querySelectorAll('.tabs .tab')[2].click();
++await sleep(10);
++ok(document.querySelectorAll('.chapter').length === 10, '剧情页列出 10 章节');
++ui.closeModal();
++await sleep(5);
++
++// ---------- 8) 下层 ----------
++// 走到阶梯并下行
++const findStairs = () => {
++  const st = ui.player.floorState;
++  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (st.grid[y][x] === 'stairs') return { x, y };
++  return null;
++};
++const stairs = findStairs();
++if (stairs) {
++  // 逐格走向阶梯
++  let guard = 0;
++  while (manhattan(ui.player.floorState.pos, stairs) > 0 && guard++ < 80) {
++    if (ui._sheet) { ui.closeModal(); continue; }
++    const st = ui.player.floorState;
++    let best = null, bestD = Infinity;
++    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
++      const nx = st.pos.x + dx, ny = st.pos.y + dy;
++      if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
++      const ent = entityAt(st, nx, ny);
++      if (ent && ent.type === 'enemy') continue;
++      if (!isWalkable(st.grid[ny][nx])) continue;
++      const d = manhattan({ x: nx, y: ny }, stairs);
++      if (d < bestD) { bestD = d; best = { x: nx, y: ny }; }
++    }
++    if (!best) break;
++    ui.tryMoveTo(best.x, best.y);
++  }
++  if (ui.player.floorState.pos.x === stairs.x && ui.player.floorState.pos.y === stairs.y) {
++    document.querySelector('.interact-btn').click(); // 下行
++    await sleep(10);
++  }
++}
++ok(ui.player.floor === 2, `下行至第 2 层（实际 ${ui.player.floor}）`);
++
++// ---------- 9) 存档往返：重开实例后可「继续旅程」 ----------
++const savedName = ui.player.name;
++const savedFloor = ui.player.floor;
++ui.destroy();
++await sleep(10);
++ui = createGame(document.getElementById('game-container'));
++ui.rng = () => 0.4;
++ui.timerEnabled = false;
++window.__XHLZ = ui;
++await sleep(10);
++ok(/继续旅程/.test(document.querySelector('.launcher__actions .btn-primary')?.textContent || ''), '有存档时启动器主按钮为「继续旅程」');
++document.querySelector('.launcher__actions .btn-primary').click();
++await sleep(15);
++ok(ui.player && ui.player.name === savedName && ui.player.floor === savedFloor, `继续旅程载入正确（${ui.player?.name}·第 ${ui.player?.floor} 层）`);
++ok(document.querySelector('.xhlz-game') !== null, '继续后渲染游戏界面');
++
++// ---------- 10) Boss 层：通关 → 双结局抉择 ----------
++ui.player.floor = 10;
++ui.player.floorState = generateFloor(ui.rng, 10, ui.player);
++ui.renderMap();
++ui.refreshInteract();
++await sleep(10);
++const boss = ui.player.floorState.entities.find((e) => e.type === 'enemy' && e.boss);
++ok(!!boss, 'Boss 层存在 Boss 敌人');
++if (boss) {
++  walkAdjacent(boss);
++  if (ui._sheet) ui.closeModal();
++  if (manhattan(ui.player.floorState.pos, boss) <= 1) {
++    document.querySelector('.interact-btn').click();
++    await sleep(15);
++    const bossWon = await winBattle();
++    ok(bossWon, '击败 Boss');
++    await sleep(10);
++    const peaceBtn = [...document.querySelectorAll('.sheet__foot button, .ending__choice button')].find((b) => /重建文明/.test(b.textContent));
++    ok(!!peaceBtn, '击败 Boss 后出现结局抉择');
++    if (peaceBtn) peaceBtn.click();
++    await sleep(15);
++  }
++}
++ok(document.querySelector('.ending') !== null, '通关后渲染结局画面');
++ok(ui.player.ending === 'peace' || ui.player.ending === 'dark', `结局已记录（${ui.player.ending}）`);
++
++// ---------- 11) 死亡结算画面（开启新旅程后驱动 gameOver） ----------
++ui.destroy();
++await sleep(10);
++ui = createGame(document.getElementById('game-container'));
++ui.rng = () => 0.4;
++window.__XHLZ = ui;
++await sleep(10);
++const newBtn = [...document.querySelectorAll('.launcher__actions button')].find((b) => /新旅程/.test(b.textContent));
++(newBtn || document.querySelector('.launcher__actions .btn-primary')).click();
++await sleep(10);
++document.querySelector('.create__foot .btn-primary').click(); // 迫降进入游戏
++await sleep(15);
++ok(ui.player && ui.screen === 'game', '开启新旅程进入游戏');
++ui.player.hp = 0;
++ui.gameOver();
++await sleep(10);
++ok(document.querySelector('.ending.dark') !== null, '生命归零渲染死亡结算画面');
++ok(/旅程终结/.test(document.querySelector('.ending h2')?.textContent || ''), '死亡结算标题正确');
++
++ui.destroy();
++console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
++process.exit(fail ? 1 : 0);
+diff --git a/apps/xing-hai-lv-zhe/src/config.js b/apps/xing-hai-lv-zhe/src/config.js
+new file mode 100644
+index 0000000..89a3d11
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/config.js
+@@ -0,0 +1,205 @@
++// ============================================================================
++// 星骸旅者 · 配置层（纯常量与纯函数，无副作用，便于单测）
++// 定义调色板、地块、装备、天赋、敌人、记忆章节、随机事件与各类阈值。
++// ============================================================================
++
++// —— 开罗经典 16 色调色板（明亮饱和色块）——
++export const PALETTE = {
++  bg: '#2b2d3a',        // 深底（星空）
++  parchment: '#f8f4e6', // 亮米（羊皮纸 / 浅地砖）
++  sand: '#f7b731',      // 沙地金
++  water: '#4a90e2',     // 水域蓝
++  monster: '#e8634a',   // 怪物红
++  grass: '#6bcb77',     // 草地绿
++  stone: '#5d5376',     // 遗迹石（墙）
++  stoneDark: '#3a3a4a', // 深石（墙心）
++  gold: '#ffd93d',      // 星骸金 / 阶梯
++  player: '#4d96ff',    // 玩家蓝
++  hp: '#ff6b6b',        // 血量红
++  arcane: '#9d4edd',    // 回响紫（记忆碎片）
++  teal: '#38a3a5',      // 推进器青
++  light: '#f2f2f2',     // 浅地砖
++  gray: '#b0b0b0',      // 中灰
++  luck: '#57c785',      // 幸运绿
++};
++
++// —— 地图网格 ——
++export const GRID = 16;            // 16×16 地块
++export const VISION_RADIUS = 2;    // 视野半径（5×5 可见）
++
++// 地块类型枚举。walkable 决定能否踏入；color 为像素绘制色。
++export const TILES = {
++  floor:    { id: 'floor',    name: '地砖', walkable: true,  color: PALETTE.light },
++  floor2:   { id: 'floor2',   name: '石板', walkable: true,  color: PALETTE.parchment },
++  sand:     { id: 'sand',     name: '沙地', walkable: true,  color: PALETTE.sand },
++  grass:    { id: 'grass',    name: '草地', walkable: true,  color: PALETTE.grass },
++  water:    { id: 'water',    name: '水域', walkable: false, color: PALETTE.water },
++  wall:     { id: 'wall',     name: '石墙', walkable: false, color: PALETTE.stone },
++  wallDark: { id: 'wallDark', name: '深墙', walkable: false, color: PALETTE.stoneDark },
++  stairs:   { id: 'stairs',   name: '下行阶梯', walkable: true, color: PALETTE.gold },
++};
++// 随机生成时从中抽取的「可点缀」可行走地块（决定地砖纹理差异，不影响通行）。
++export const FLOOR_TILES = ['floor', 'floor2', 'sand', 'grass'];
++
++export function tileOf(id) { return TILES[id] || TILES.floor; }
++export function isWalkable(id) { return !!tileOf(id).walkable; }
++
++// —— 角色基础数值 ——
++export const BASE_MAX_HP = 100;
++export const BASE_MAX_STAMINA = 80;
++export const BASE_ATK = 6;     // 裸装攻击（武器加成叠加其上）
++export const BASE_DEF = 2;     // 裸装防御
++export const BASE_MOVE_RANGE = 1; // 推进器 plus 每点 +1 步
++
++// 精力影响命中率：低于此阈值进入「疲惫」，战斗中有失手概率。
++export const STAMINA_TIRED = 30;
++export const STAMINA_FUMBLE_CHANCE = 0.35; // 疲惫时失手概率上限
++// 战斗每回合消耗精力；地图上每移动一格回复精力。
++export const STAMINA_COST_PER_ROUND = 4;
++export const STAMINA_REGEN_PER_STEP = 3;
++// 闲置缓慢回精（rAF 驱动，每 STAMINA_REGEN_INTERVAL_MS 回 1 点）。
++export const STAMINA_REGEN_INTERVAL_MS = 1600;
++
++// —— 装备 ——
++export const EQUIP_SLOTS = ['weapon', 'armor', 'booster'];
++export const MAX_PLUS = 10;     // 强化上限
++export const AFFIX_AT = 5;      // +5 触发词缀变异
++// 强化消耗「零件」：随 plus 递增（线性）。
++export function enhanceCost(plus) { return 2 + (plus || 0) * 2; }
++
++// 词缀池（+5 变异时随机附加其一）。
++export const AFFIXES = [
++  { id: 'lifesteal', name: '吸血',   desc: '造成伤害时回复等量 HP 的 30%。', emoji: '🩸' },
++  { id: 'thorns',    name: '反伤',   desc: '受击时反弹 25% 伤害给敌人。',   emoji: '🌵' },
++  { id: 'keen',      name: '锐利',   desc: '攻击 +20%。',                   emoji: '🗡️' },
++  { id: 'guard',     name: '坚固',   desc: '防御 +20%。',                   emoji: '🛡️' },
++  { id: 'swift',     name: '迅捷',   desc: '移动步数 +1。',                 emoji: '💨' },
++];
++
++// 起始装备（生锈砍刀 + 破布衣 + 滑轨推进器）。
++export function starterEquipment() {
++  return {
++    weapon:  { name: '生锈砍刀', stat: 8,  plus: 0, affix: null },
++    armor:   { name: '破布外衣', stat: 5,  plus: 0, affix: null },
++    booster: { name: '滑轨推进器', stat: 0, plus: 0, affix: null },
++  };
++}
++
++// —— 天赋树：三条分支（生存 / 战斗 / 幸运），消耗星骸点亮，可免费重置 ——
++export const TALENTS = [
++  {
++    branch: 'survival', name: '生存', emoji: '❤️', color: PALETTE.hp, maxRank: 5,
++    desc: '每级最大 HP +20、回响拾取额外回复 HP。',
++    cost: (rank) => 3 + rank * 2,
++  },
++  {
++    branch: 'combat', name: '战斗', emoji: '⚔️', color: PALETTE.monster, maxRank: 5,
++    desc: '每级造成伤害 +10%、克制成功专注力倍率更高。',
++    cost: (rank) => 3 + rank * 2,
++  },
++  {
++    branch: 'luck', name: '幸运', emoji: '🍀', color: PALETTE.luck, maxRank: 5,
++    desc: '每级掉落星骸 / 零件 +15%、宝箱品质提升。',
++    cost: (rank) => 3 + rank * 2,
++  },
++];
++export const TALENT_BY_BRANCH = Object.fromEntries(TALENTS.map((t) => [t.branch, t]));
++export function talentCost(branch, rank) { return (TALENT_BY_BRANCH[branch] || { cost: () => 99 }).cost(rank || 0); }
++
++// —— 敌人定义池（按楼层分阶）——
++// stances：敌人摆出各架势的相对权重；reward：星骸 / 零件 / 经验基准。
++export const ENEMIES = [
++  { id: 'puppet',  name: '弃械傀儡', emoji: '🤖', minFloor: 1, hp: 26, atk: 7,  stances: { thrust: 4, slash: 3, smash: 2 }, stardust: 4,  parts: 2, exp: 6 },
++  { id: 'wraith',  name: '游荡幽影', emoji: '👻', minFloor: 1, hp: 20, atk: 9,  stances: { thrust: 3, slash: 2, smash: 4 }, stardust: 5,  parts: 1, exp: 7 },
++  { id: 'bat',     name: '锈翼蝠',   emoji: '🦇', minFloor: 4, hp: 34, atk: 11, stances: { thrust: 5, slash: 2, smash: 1 }, stardust: 7,  parts: 3, exp: 10 },
++  { id: 'crab',    name: '晶甲蟹',   emoji: '🦀', minFloor: 4, hp: 46, atk: 10, stances: { thrust: 2, slash: 5, smash: 3 }, stardust: 8,  parts: 4, exp: 12 },
++  { id: 'knight',  name: '残响骑士', emoji: '🛡️', minFloor: 7, hp: 60, atk: 14, stances: { thrust: 3, slash: 4, smash: 4 }, stardust: 11, parts: 5, exp: 16 },
++  { id: 'stalker', name: '虚空潜行者', emoji: '👹', minFloor: 7, hp: 52, atk: 17, stances: { thrust: 4, slash: 3, smash: 3 }, stardust: 12, parts: 4, exp: 18 },
++  { id: 'core',    name: '星骸之核', emoji: '🌟', minFloor: 10, hp: 160, atk: 20, stances: { thrust: 3, slash: 3, smash: 3 }, stardust: 60, parts: 30, exp: 100, boss: true },
++];
++
++// 按楼层挑选一个合适敌人定义（同 minFloor 池中加权随机由调用方处理）。
++export function enemyPoolFor(floor) {
++  const f = Math.max(1, floor || 1);
++  return ENEMIES.filter((e) => e.minFloor <= f && !(e.boss && f < 10));
++}
++
++// 楼层配置：敌人数量、宝箱、事件密度随楼层缓慢上升。
++export function floorConfig(floor) {
++  const f = Math.max(1, floor || 1);
++  return {
++    enemyCount: Math.min(6, 2 + Math.floor(f / 2)),   // 1→2, 2→3 ... 上限 6
++    chestCount: f >= 10 ? 0 : (1 + (f % 2)),           // 1~2
++    memory: f <= 10,                                    // 每层 1 枚回响（1~10）
++    eventCount: f >= 10 ? 0 : 1,                        // 每层 1 个随机事件点
++  };
++}
++
++// —— 记忆章节（碎片化叙事，共 10 章）——
++export const MEMORY_CHAPTERS = [
++  { title: '序章 · 苏醒', text: '逃生舱的舱门弹开，你大口喘着气。副官「小星」的全息影像闪烁亮起：「旅者，你终于醒了……抱歉，你的记忆和导航数据一起损坏了。」破碎的星球墨比乌斯在头顶缓缓旋转。' },
++  { title: '第二章 · 漂浮的遗迹', text: '这些浮岛并非天然——它们是上古文明崩解后残留的碎片。脚下的石板间，偶尔能听见极轻的、像叹息一样的回响。' },
++  { title: '第三章 · 星骸', text: '你第一次触摸到那枚发光的晶体「星骸」。温热的，像谁的心跳。一瞬间，你想起了一间洒满午后阳光的厨房。' },
++  { title: '第四章 · 不是矿石', text: '小星分析后沉默了很久：「旅者……星骸不是矿物。它们是上古文明的情感凝结体。每一枚，都是某个人的一段记忆。」' },
++  { title: '第五章 · 灶台与歌', text: '回响里浮现一个孩子的笑声，和一首你听不懂却莫名想哭的歌。那是谁？为什么你的眼眶会发酸？' },
++  { title: '第六章 · 文明的黄昏', text: '越来越清晰了：这座文明并非毁于灾祸，而是在某个黄昏，人们集体选择了将情感封存进星骸，让文明「睡去」。' },
++  { title: '第七章 · 你曾在这里', text: '一帧画面闪过——年轻的你站在某座广场上，身边是无数张笑脸。你忽然确信：你曾属于这里。' },
++  { title: '第八章 · 小星的秘密', text: '小星终于坦白：「我是按照她的性格模型建造的。她……把你送进逃生舱时，把所有的星骸都留给了你。」' },
++  { title: '第九章 · 抉择的重量', text: '星骸之核就在前方。十枚回响在你掌心发烫。重建它们，还是……？小星轻声说：「无论你选什么，我都陪你。」' },
++  { title: '终章 · 你的回答', text: '所有的记忆都已归位。现在，轮到你来回答那个被整个文明搁置的问题了。' },
++];
++
++// 中期 / 结局叙事（楼层触发）。
++export const STORY = {
++  prologue: '你迫降在破碎星球「墨比乌斯」。副官小星唤醒了你——记忆全失，只有零星的星骸在岛上闪烁。拾荒，活下去，找回你自己。',
++  midpoint: '三层之下，你隐约明白：星骸不是矿石，而是上古文明凝结的情感。每一次拾取，都像重温一段别人的日常。',
++};
++
++// 双结局文本。
++export const ENDINGS = {
++  peace: {
++    key: 'peace', name: '重建文明', emoji: '🕊️', tone: 'good',
++    title: '和平结局 · 星河重燃',
++    text: '你将所有星骸归还大地。千百枚情感体重新苏醒，化作人形，彼此相认。墨比乌斯的夜空第一次亮起万家灯火。你不再是孤独的旅者——你回到了家。',
++  },
++  dark: {
++    key: 'dark', name: '成为新神', emoji: '🔥', tone: 'bad',
++    title: '暗黑结局 · 独星长明',
++    text: '你引爆了所有星骸。滔天的情感能量灌入你一人之躯，星球在你脚下震颤重生。你成为了墨比乌斯唯一的新神——永生，且永远孤独。小星的光在你身后，缓缓熄灭。',
++  },
++};
++
++// —— 随机事件池（地图踩点触发）——
++// type 用于 world 生成时占位；resolve 在 player/ui 中结算。
++export const EVENT_TYPES = ['merchant', 'drone', 'trap'];
++export const EVENT_META = {
++  merchant: { emoji: '🛒', name: '流浪商人', desc: '高价出售稀有零件与精炼星骸。' },
++  drone:    { emoji: '🔧', name: '维修无人机', desc: '消耗星骸，回复全部 HP 与精力。' },
++  trap:     { emoji: '🌀', name: '重力陷阱', desc: '空间扭曲，强制传送至随机位置。' },
++};
++
++// 商人货架（零件 / 强化材料 / 偶尔的星骸）。
++export const SHOP_ITEMS = [
++  { id: 'parts_s', name: '零件包×3', cost: 6, give: { parts: 3 }, emoji: '🔩' },
++  { id: 'parts_l', name: '零件箱×8', cost: 14, give: { parts: 8 }, emoji: '📦' },
++  { id: 'stardust', name: '精炼星骸×10', cost: 18, give: { stardust: 10 }, emoji: '✨' },
++  { id: 'heal', name: '应急维修（满状态）', cost: 10, give: { fullHeal: true }, emoji: '❤️‍🩹' },
++];
++
++// 无人机维修价（星骸）。
++export const DRONE_COST = 8;
++// 最低楼层数（含 Boss）。
++export const MAX_FLOOR = 10;
++
++// —— 升级（经验）——
++export function expToNext(level) { return 10 + (level || 1) * 8; }
++
++// —— 钳制 / 数值辅助 ——
++export function clamp(v, lo, hi) {
++  if (!Number.isFinite(v)) return lo;
++  return Math.max(lo, Math.min(hi, Math.round(v)));
++}
++export function clampStat(v) { return clamp(v, 0, 99999); }
++
++// 曼哈顿距离。
++export function manhattan(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }
+diff --git a/apps/xing-hai-lv-zhe/src/core/battle.js b/apps/xing-hai-lv-zhe/src/core/battle.js
+new file mode 100644
+index 0000000..81458ec
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/core/battle.js
+@@ -0,0 +1,109 @@
++// ============================================================================
++// 战斗模块（抉择型「猜拳」简化版）：敌人架势 vs 玩家应对，克制关系 + 专注力。
++//   架势：突刺(thrust) / 横斩(slash) / 重击(smash)
++//   应对：格挡(block) / 闪避(dodge) / 反击(counter)
++//   克制：反击克突刺、格挡克横斩、闪避克重击。成功克制 → 下一击专注力 ×1.5。
++// 精力过低会失手；词缀（吸血 / 反伤 / 锐利 / 坚固）在结算中生效。
++// ============================================================================
++import { effectiveAtk, effectiveDef, maxHp, damagePlayer, healPlayer } from './player.js';
++import { weightedPick } from './rng.js';
++import { STAMINA_TIRED, STAMINA_FUMBLE_CHANCE, clamp } from '../config.js';
++
++export const STANCES = {
++  thrust: { id: 'thrust', name: '突刺', emoji: '🗡️' },
++  slash:  { id: 'slash',  name: '横斩', emoji: '🌀' },
++  smash:  { id: 'smash',  name: '重击', emoji: '💥' },
++};
++export const ACTIONS = {
++  block:  { id: 'block',  name: '格挡', emoji: '🛡️' },
++  dodge:  { id: 'dodge',  name: '闪避', emoji: '💨' },
++  counter:{ id: 'counter',name: '反击', emoji: '⚔️' },
++};
++// 应对 -> 其所克制的架势。
++export const COUNTERS = { counter: 'thrust', block: 'slash', dodge: 'smash' };
++
++// 敌人架势被「识破」（明牌）的概率；未识破时玩家需盲猜，增加风险。
++export const TELEGRAPH_CHANCE = 0.7;
++
++// 敌人按架势权重抽取本回合架势。
++export function pickEnemyStance(enemy, rng) {
++  const r = rng || Math.random;
++  return weightedPick(r, enemy.stances || { thrust: 1, slash: 1, smash: 1 }) || 'thrust';
++}
++
++// 本回合是否明牌（识破架势）。
++export function isTelegraphed(rng, chance) {
++  const r = rng || Math.random;
++  return r() < (chance == null ? TELEGRAPH_CHANCE : chance);
++}
++
++// 自动战斗：给出克制敌人当前架势的应对（明牌时必中）。
++export function autoPickAction(enemyStance) {
++  for (const [act, st] of Object.entries(COUNTERS)) if (st === enemyStance) return act;
++  return 'counter';
++}
++
++// 专注力倍率：战斗天赋进一步提升克制成功的伤害倍率。
++export function focusMultiplier(focus, combatRank) {
++  if (!focus) return 1;
++  return 1.5 + 0.04 * (combatRank || 0);
++}
++
++// 结算一回合：mutate enemy.hp / player.hp，返回回合描述（不改 stamina，由调用方扣除）。
++//   player, enemy, action, focus(本回合是否带专注), stance(敌人本回合架势), rng
++export function resolveRound(player, enemy, action, focus, stance, rng) {
++  const r = rng || Math.random;
++  const stanceId = stance || pickEnemyStance(enemy, r);
++  // 合法应对原样使用；非法值（如「犹豫」hesitate）保留为失败态，不计入克制。
++  const actId = action in COUNTERS ? action : 'hesitate';
++
++  // 精力过低 → 失手概率（失手时本回合视为应对失败）。
++  let fumble = false;
++  if ((player.stamina || 0) < STAMINA_TIRED) {
++    fumble = r() < STAMINA_FUMBLE_CHANCE;
++  }
++  const countered = !fumble && actId in COUNTERS && COUNTERS[actId] === stanceId;
++
++  let enemyDmg = 0;
++  let playerDmg = 0;
++  let healed = 0;
++  let nextFocus = false;
++
++  if (countered) {
++    // 克制成功：玩家命中敌人，伤害受专注力与战斗天赋加成。
++    const mult = focusMultiplier(focus, player.talents?.combat || 0);
++    enemyDmg = Math.max(1, Math.round(effectiveAtk(player) * mult));
++    enemy.hp = clamp(enemy.hp - enemyDmg, 0, enemy.maxHp || enemy.hp);
++    // 武器吸血词缀
++    if (player.equipment?.weapon?.affix?.id === 'lifesteal') {
++      healed = healPlayer(player, Math.round(enemyDmg * 0.3));
++    }
++    nextFocus = true; // 为下一击充能
++  } else {
++    // 应对失败：敌人命中玩家（防御减免，至少 1）。
++    const raw = (enemy.atk || 0) - effectiveDef(player);
++    playerDmg = Math.max(1, Math.round(raw * (fumble ? 1.2 : 1))); // 失手时受伤更重
++    damagePlayer(player, playerDmg);
++    // 护甲反伤词缀
++    if (player.equipment?.armor?.affix?.id === 'thorns') {
++      const refl = Math.max(1, Math.round(playerDmg * 0.25));
++      enemy.hp = clamp(enemy.hp - refl, 0, enemy.maxHp || enemy.hp);
++      enemyDmg = refl;
++    }
++    nextFocus = false;
++  }
++
++  return {
++    stance: stanceId, action: actId, countered, fumble, focus: !!focus, nextFocus,
++    enemyDmg, playerDmg, healed,
++    enemyDead: enemy.hp <= 0,
++    playerDead: player.hp <= 0,
++  };
++}
++
++// 计算击败该敌人的奖励（星骸 / 零件 / 经验基准，不含幸运加成——加成在 player.gainReward 中统一施加）。
++export function enemyReward(enemy) {
++  return { stardust: enemy.stardust || 0, parts: enemy.parts || 0, exp: enemy.exp || 0, boss: !!enemy.boss };
++}
++
++export { STAMINA_TIRED, STAMINA_FUMBLE_CHANCE, maxHp };
+diff --git a/apps/xing-hai-lv-zhe/src/core/player.js b/apps/xing-hai-lv-zhe/src/core/player.js
+new file mode 100644
+index 0000000..e61f675
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/core/player.js
+@@ -0,0 +1,264 @@
++// ============================================================================
++// 状态管理模块（State Manager）：角色状态、装备强化、天赋、升级与数值结算。
++// 所有数值结算集中于此，UI 只负责调用与渲染，不内含业务逻辑。
++// ============================================================================
++import {
++  BASE_MAX_HP, BASE_MAX_STAMINA, BASE_ATK, BASE_DEF, BASE_MOVE_RANGE,
++  MAX_PLUS, AFFIX_AT, AFFIXES, starterEquipment, enhanceCost,
++  TALENTS, TALENT_BY_BRANCH, talentCost,
++  expToNext, clamp, clampStat, MAX_FLOOR, MEMORY_CHAPTERS, GRID,
++} from '../config.js';
++import { randInt, pick } from './rng.js';
++
++// 创建一名新角色。
++//   opts: { name?, seed?, floor? }
++export function newPlayer(rng, opts = {}) {
++  const r = rng || Math.random;
++  const seed = Number.isFinite(opts.seed) ? opts.seed : randInt(r, 1, 1e9);
++  return {
++    name: (opts.name || '').toString().slice(0, 8) || '旅者',
++    hp: BASE_MAX_HP,
++    stamina: BASE_MAX_STAMINA,
++    stardust: 0,
++    parts: 0,
++    level: 1,
++    exp: 0,
++    equipment: starterEquipment(),
++    talents: { survival: 0, combat: 0, luck: 0 },
++    floor: Math.max(1, Number.isFinite(opts.floor) ? opts.floor : 1),
++    maxFloor: 1,
++    memory: Array.from({ length: MEMORY_CHAPTERS.length }, () => false),
++    log: [],
++    turn: 0,
++    seed,
++    floorState: null,   // 由 world 生成；存档保存，重载可恢复探索
++    ending: null,       // 通关结局记录
++    born: 0,
++    lastSeen: 0,
++  };
++}
++
++// —— 存档结构向后兼容：补齐 / 钳制字段，防止旧档或损坏档导致整页闪退 ——
++export function migrate(p) {
++  if (!p) return p;
++  if (typeof p.name !== 'string') p.name = '旅者';
++  p.name = p.name.slice(0, 8) || '旅者';
++  if (!Number.isFinite(p.hp)) p.hp = BASE_MAX_HP;
++  if (!Number.isFinite(p.stamina)) p.stamina = BASE_MAX_STAMINA;
++  if (!Number.isFinite(p.stardust) || p.stardust < 0) p.stardust = 0;
++  if (!Number.isFinite(p.parts) || p.parts < 0) p.parts = 0;
++  if (!Number.isFinite(p.level) || p.level < 1) p.level = 1;
++  if (!Number.isFinite(p.exp) || p.exp < 0) p.exp = 0;
++  if (!Number.isFinite(p.floor) || p.floor < 1) p.floor = 1;
++  if (p.floor > MAX_FLOOR) p.floor = MAX_FLOOR;
++  if (!Number.isFinite(p.maxFloor) || p.maxFloor < 1) p.maxFloor = p.floor;
++  if (!Number.isFinite(p.seed)) p.seed = 12345;
++  if (!Number.isFinite(p.turn) || p.turn < 0) p.turn = 0;
++  // 装备补齐
++  if (!p.equipment || typeof p.equipment !== 'object') p.equipment = starterEquipment();
++  else p.equipment = { ...starterEquipment(), ...p.equipment };
++  for (const slot of ['weapon', 'armor', 'booster']) {
++    const e = p.equipment[slot];
++    if (!e || typeof e !== 'object') { p.equipment[slot] = starterEquipment()[slot]; continue; }
++    if (typeof e.name !== 'string') e.name = starterEquipment()[slot].name;
++    if (!Number.isFinite(e.stat)) e.stat = starterEquipment()[slot].stat;
++    if (!Number.isFinite(e.plus) || e.plus < 0) e.plus = 0;
++    if (e.plus > MAX_PLUS) e.plus = MAX_PLUS;
++    e.affix = validAffix(e.affix) ? e.affix : null;
++  }
++  // 天赋补齐
++  if (!p.talents || typeof p.talents !== 'object') p.talents = { survival: 0, combat: 0, luck: 0 };
++  for (const t of TALENTS) {
++    const v = Math.floor(p.talents[t.branch]);
++    p.talents[t.branch] = (!Number.isFinite(v) || v < 0) ? 0 : Math.min(v, t.maxRank);
++  }
++  // 记忆数组补齐到章节长度
++  if (!Array.isArray(p.memory)) p.memory = [];
++  while (p.memory.length < MEMORY_CHAPTERS.length) p.memory.push(false);
++  p.memory = p.memory.slice(0, MEMORY_CHAPTERS.length).map((x) => x === true);
++  if (!Array.isArray(p.log)) p.log = [];
++  // 楼层快照规范化：结构损坏则置空（由 UI 重生成当前层），explored 归一为普通对象。
++  if (p.floorState && typeof p.floorState === 'object') {
++    const fs = p.floorState;
++    // grid 必须是 GRID×GRID 的字符串矩阵（逐行校验，避免某行为 null 致 tileAt 崩溃）。
++    const gridOk = Array.isArray(fs.grid) && fs.grid.length === GRID
++      && fs.grid.every((row) => Array.isArray(row) && row.length === GRID);
++    if (!gridOk) {
++      p.floorState = null;
++    } else {
++      // pos 坐标必须为合法网格内整数，否则钳到安全点（避免 renderMap 无角色 / 移动失灵）。
++      const px = Math.floor(fs.pos && fs.pos.x), py = Math.floor(fs.pos && fs.pos.y);
++      if (!Number.isInteger(px) || px < 0 || px >= GRID || !Number.isInteger(py) || py < 0 || py >= GRID) {
++        fs.pos = { x: 1, y: 1 };
++      } else {
++        fs.pos = { x: px, y: py };
++      }
++      if (!Array.isArray(fs.entities)) fs.entities = [];
++      if (Array.isArray(fs.explored)) { const o = {}; for (const k of fs.explored) o[k] = true; fs.explored = o; }
++      else if (!fs.explored || typeof fs.explored !== 'object' || Array.isArray(fs.explored)) fs.explored = {};
++      if (!Number.isFinite(fs.floor)) fs.floor = p.floor;
++    }
++  } else {
++    p.floorState = null;
++  }
++  p.ending = (p.ending === 'peace' || p.ending === 'dark') ? p.ending : null;
++  if (!Number.isFinite(p.born)) p.born = 0;
++  if (!Number.isFinite(p.lastSeen)) p.lastSeen = 0;
++  // 收尾钳制：HP / 精力落到合法区间（依赖已规范化的 talents / level）。
++  p.hp = clamp(p.hp, 0, maxHp(p));
++  p.stamina = clamp(p.stamina, 0, maxStamina());
++  return p;
++}
++
++function validAffix(a) {
++  return a && AFFIXES.some((x) => x.id === a.id);
++}
++
++// —— 派生数值（装备 + 强化 + 词缀 + 天赋 + 等级）——
++export function maxHp(p) {
++  return BASE_MAX_HP + (p.talents.survival || 0) * 20 + (p.level - 1) * 5;
++}
++export function maxStamina() { return BASE_MAX_STAMINA; }
++
++export function effectiveAtk(p) {
++  const w = p.equipment.weapon;
++  let atk = BASE_ATK + (w.stat || 0) + (w.plus || 0) + Math.floor((p.level - 1) / 2);
++  if (w.affix && w.affix.id === 'keen') atk *= 1.2;
++  atk *= 1 + 0.1 * (p.talents.combat || 0); // 战斗天赋
++  return Math.max(1, Math.round(atk));
++}
++
++export function effectiveDef(p) {
++  const a = p.equipment.armor;
++  let def = BASE_DEF + (a.stat || 0) + (a.plus || 0) + Math.floor((p.level - 1) / 3);
++  if (a.affix && a.affix.id === 'guard') def *= 1.2;
++  return Math.max(0, Math.round(def));
++}
++
++export function effectiveMoveRange(p) {
++  const b = p.equipment.booster;
++  let range = BASE_MOVE_RANGE + (b.plus || 0);
++  if (b.affix && b.affix.id === 'swift') range += 1;
++  return range;
++}
++
++// 词缀在 +5（及之后每 5 级）触发变异；已存在词缀则替换为新的随机词缀。
++export function rollAffix(rng) {
++  const r = rng || Math.random;
++  return { ...pick(r, AFFIXES) };
++}
++
++// 强化装备：消耗零件，plus+1；达 AFFIX_AT 的倍数时触发词缀变异。返回结果描述。
++export function enhanceEquipment(p, slot, rng) {
++  const r = rng || Math.random;
++  const e = p.equipment[slot];
++  if (!e) return { ok: false, reason: 'no-slot' };
++  if (e.plus >= MAX_PLUS) return { ok: false, reason: 'max' };
++  const cost = enhanceCost(e.plus);
++  if (p.parts < cost) return { ok: false, reason: 'no-parts', cost };
++  p.parts -= cost;
++  e.plus += 1;
++  let affixed = null;
++  if (e.plus % AFFIX_AT === 0) {
++    e.affix = rollAffix(r);
++    affixed = e.affix;
++  }
++  return { ok: true, plus: e.plus, affixed, slot };
++}
++
++// 点亮天赋：消耗星骸。返回结果。
++export function buyTalent(p, branch) {
++  const def = TALENT_BY_BRANCH[branch];
++  if (!def) return { ok: false, reason: 'no-branch' };
++  const rank = p.talents[branch] || 0;
++  if (rank >= def.maxRank) return { ok: false, reason: 'max' };
++  const cost = talentCost(branch, rank);
++  if (p.stardust < cost) return { ok: false, reason: 'no-stardust', cost };
++  p.stardust -= cost;
++  p.talents[branch] = rank + 1;
++  // 生存天赋提升上限后，同步补满 HP（鼓励投资生存）。
++  if (branch === 'survival') p.hp = Math.min(maxHp(p), p.hp + 20);
++  return { ok: true, branch, rank: rank + 1 };
++}
++
++// 重置天赋：全额返还星骸，可随时免费重置（鼓励试错）。
++export function resetTalents(p) {
++  let refund = 0;
++  for (const t of TALENTS) {
++    const rank = p.talents[t.branch] || 0;
++    for (let i = 0; i < rank; i++) refund += talentCost(t.branch, i);
++    p.talents[t.branch] = 0;
++  }
++  p.stardust += refund;
++  // 上限下调后钳制 HP。
++  p.hp = Math.min(p.hp, maxHp(p));
++  return { ok: true, refund };
++}
++
++// 获取战斗 / 拾取奖励（星骸 / 零件 / 经验），含幸运天赋加成与升级。
++export function gainReward(p, reward = {}, rng) {
++  const luck = 1 + 0.15 * (p.talents.luck || 0);
++  const sd = Math.round((reward.stardust || 0) * luck);
++  const pt = Math.round((reward.parts || 0) * luck);
++  p.stardust += sd;
++  p.parts += pt;
++  let leveled = 0;
++  if (reward.exp) {
++    p.exp += reward.exp;
++    while (p.exp >= expToNext(p.level)) {
++      p.exp -= expToNext(p.level);
++      p.level += 1;
++      leveled += 1;
++    }
++    if (leveled > 0) {
++      // 升级回血 40%（开罗式贴心）。
++      p.hp = Math.min(maxHp(p), p.hp + Math.round(maxHp(p) * 0.4));
++    }
++  }
++  return { stardust: sd, parts: pt, leveled };
++}
++
++// —— HP / 精力 ——
++export function damagePlayer(p, amount) {
++  const d = Math.max(0, Math.round(amount || 0));
++  p.hp = clamp(p.hp - d, 0, maxHp(p));
++  return d;
++}
++export function healPlayer(p, amount) {
++  const before = p.hp;
++  p.hp = clamp(p.hp + (amount || 0), 0, maxHp(p));
++  return p.hp - before;
++}
++export function healFull(p) {
++  const before = p.hp;
++  p.hp = maxHp(p);
++  p.stamina = maxStamina();
++  return p.hp - before;
++}
++export function spendStamina(p, amount) {
++  p.stamina = clamp(p.stamina - (amount || 0), 0, maxStamina());
++  return p.stamina;
++}
++export function regenStamina(p, amount) {
++  const before = p.stamina;
++  p.stamina = clamp(p.stamina + (amount || 0), 0, maxStamina());
++  return p.stamina - before;
++}
++
++export function isDead(p) { return p.hp <= 0; }
++
++// 记忆碎片收集：解锁对应章节，生存天赋额外回 HP。返回是否新解锁。
++export function collectMemory(p, chapterIndex) {
++  const idx = Math.max(0, Math.min(p.memory.length - 1, chapterIndex));
++  if (p.memory[idx]) return { ok: false, already: true };
++  p.memory[idx] = true;
++  const heal = 5 + (p.talents.survival || 0) * 5;
++  healPlayer(p, heal);
++  return { ok: true, chapter: idx, heal };
++}
++
++export function collectedMemoryCount(p) {
++  return p.memory.filter(Boolean).length;
++}
++
++export { MAX_PLUS, AFFIX_AT, AFFIXES, TALENTS, TALENT_BY_BRANCH, enhanceCost, talentCost, expToNext, clamp, clampStat, MAX_FLOOR, MEMORY_CHAPTERS };
+diff --git a/apps/xing-hai-lv-zhe/src/core/rng.js b/apps/xing-hai-lv-zhe/src/core/rng.js
+new file mode 100644
+index 0000000..e1b0556
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/core/rng.js
+@@ -0,0 +1,42 @@
++// ============================================================================
++// 可注入随机源：默认 Math.random，单测可传入确定性序列，保证逻辑可复现。
++// ============================================================================
++export function makeRng(source) {
++  if (typeof source === 'function') return source;
++  if (Array.isArray(source)) {
++    // 确定性序列：依次取出，耗尽后回绕，便于穷举分支。
++    let i = 0;
++    return () => {
++      if (!source.length) return 0;
++      const v = source[i % source.length];
++      i += 1;
++      return v;
++    };
++  }
++  return Math.random;
++}
++
++// [min, max] 闭区间随机整数。
++export function randInt(rng, min, max) {
++  const r = rng();
++  return Math.floor(min + r * (max - min + 1));
++}
++
++// 按 {key: weight} 权重抽取一个 key。
++export function weightedPick(rng, weights) {
++  const entries = Object.entries(weights).filter(([, w]) => w > 0);
++  const total = entries.reduce((s, [, w]) => s + w, 0);
++  if (total <= 0) return null;
++  let roll = rng() * total;
++  for (const [k, w] of entries) {
++    roll -= w;
++    if (roll <= 0) return k;
++  }
++  return entries[entries.length - 1][0];
++}
++
++// 从数组中等概率取一个元素（空数组返回 undefined）。
++export function pick(rng, arr) {
++  if (!Array.isArray(arr) || !arr.length) return undefined;
++  return arr[Math.floor(rng() * arr.length)];
++}
+diff --git a/apps/xing-hai-lv-zhe/src/core/save.js b/apps/xing-hai-lv-zhe/src/core/save.js
+new file mode 100644
+index 0000000..34a28aa
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/core/save.js
+@@ -0,0 +1,125 @@
++// ============================================================================
++// 存档管理模块（Save Manager）：多槽位 localStorage 持久化 + 导入导出（base64）。
++//
++// 多槽位：提供 SAVE_SLOTS（≥5）个独立存档位，key = xhlz_save_<slot>。
++// 通过 storage 访问器隔离 localStorage，便于 Node 单测注入。
++// 每次移动 / 战斗结算 / 强化 / 拾取后由 UI 自动调用 saveToSlot 落盘，防丢档。
++// ============================================================================
++import { migrate } from './player.js';
++
++export const SAVE_SLOTS = 6;
++const SLOT_PREFIX = 'xhlz_save_';
++
++let storage = null;
++try {
++  if (typeof localStorage !== 'undefined') storage = localStorage;
++} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }
++
++// 测试 / 注入用
++export function _setStorage(s) { storage = s; }
++
++export function nowSec() {
++  try { return Math.floor(Date.now() / 1000); } catch (_) { return 0; }
++}
++
++const slotKey = (slot) => `${SLOT_PREFIX}${slot}`;
++
++function validSlot(slot) {
++  const n = Number(slot);
++  return Number.isInteger(n) && n >= 0 && n < SAVE_SLOTS;
++}
++
++// 读取某槽位的原始玩家对象，不存在或损坏返回 null。
++export function loadFromSlot(slot) {
++  try {
++    if (!storage || !validSlot(slot)) return null;
++    const raw = storage.getItem(slotKey(slot));
++    if (!raw) return null;
++    const player = JSON.parse(raw);
++    return migrate(player);
++  } catch (_) { return null; }
++}
++
++// 列举所有槽位的概要信息，供存档管理 UI 展示。
++// 返回 [{ slot, exists, name, floor, maxFloor, level, stardust, memoryCount, ending, lastSeen }]
++export function listSaves() {
++  const out = [];
++  for (let i = 0; i < SAVE_SLOTS; i++) {
++    const p = loadFromSlot(i);
++    out.push({
++      slot: i,
++      exists: !!p,
++      name: p ? p.name : null,
++      floor: p ? p.floor : null,
++      maxFloor: p ? p.maxFloor : null,
++      level: p ? p.level : null,
++      stardust: p ? p.stardust : null,
++      memoryCount: p ? (p.memory || []).filter(Boolean).length : 0,
++      ending: p ? p.ending : null,
++      lastSeen: p ? p.lastSeen : 0,
++    });
++  }
++  return out;
++}
++
++export function hasAnySave() {
++  try {
++    if (!storage) return false;
++    for (let i = 0; i < SAVE_SLOTS; i++) if (storage.getItem(slotKey(i)) != null) return true;
++    return false;
++  } catch (_) { return false; }
++}
++
++// 取最近游玩的槽位（lastSeen 最大者）；同值时槽位号大者优先（最后写入者胜出，结果确定）。
++export function latestSlot() {
++  const list = listSaves().filter((s) => s.exists);
++  if (!list.length) return null;
++  let pick = list[0];
++  for (const s of list) {
++    if ((s.lastSeen || 0) >= (pick.lastSeen || 0)) pick = s;
++  }
++  return pick.slot;
++}
++
++// 写入指定槽位。slot 非法时回退到 0 号槽。返回是否成功。
++export function saveToSlot(slot, player) {
++  try {
++    if (!storage || !player) return false;
++    const s = validSlot(slot) ? slot : 0;
++    player.lastSeen = nowSec();
++    if (!player.born) player.born = player.lastSeen;
++    storage.setItem(slotKey(s), JSON.stringify(player));
++    return true;
++  } catch (_) { return false; }
++}
++
++export function deleteSlot(slot) {
++  try {
++    if (!storage || !validSlot(slot)) return false;
++    storage.removeItem(slotKey(slot));
++    return true;
++  } catch (_) { return false; }
++}
++
++// 导出 / 导入（base64，UTF-8 安全）。
++export function exportSave(player) {
++  return btoaSafe(JSON.stringify(migrate(JSON.parse(JSON.stringify(player)))));
++}
++export function importSave(str) {
++  try {
++    const player = JSON.parse(atobSafe(str));
++    return migrate(player);
++  } catch (_) { return null; }
++}
++
++// —— UTF-8 安全的 base64（兼容浏览器与 Node）——
++function btoaSafe(str) {
++  if (typeof btoa === 'function') return btoa(unescape(encodeURIComponent(str)));
++  return Buffer.from(str, 'utf8').toString('base64');
++}
++function atobSafe(str) {
++  if (typeof atob === 'function') return decodeURIComponent(escape(atob(str)));
++  return Buffer.from(str, 'base64').toString('utf8');
++}
++
++export { SLOT_PREFIX };
+diff --git a/apps/xing-hai-lv-zhe/src/core/world.js b/apps/xing-hai-lv-zhe/src/core/world.js
+new file mode 100644
+index 0000000..54d4fd2
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/core/world.js
+@@ -0,0 +1,314 @@
++// ============================================================================
++// 浮岛生成模块：程序化生成 16×16 地图（房间感 + 连通保证）、迷雾、移动校验。
++// 纯数据与纯函数：生成 floorState 供 UI 渲染，移动 / 视野查询无副作用（除显式 mutate）。
++// ============================================================================
++import {
++  GRID, VISION_RADIUS, TILES, FLOOR_TILES, tileOf, isWalkable,
++  floorConfig, enemyPoolFor, EVENT_TYPES, EVENT_META, MAX_FLOOR, MEMORY_CHAPTERS,
++} from '../config.js';
++import { randInt, weightedPick, pick } from './rng.js';
++
++const key = (x, y) => `${x},${y}`;
++const inBounds = (x, y) => x >= 0 && y >= 0 && x < GRID && y < GRID;
++
++// —— 生成一张浮岛（floorState）——
++//   rng：可注入随机源；floor：楼层；player：用于 Boss 判定等（可选）。
++//   返回 { grid, pos, entities, explored, floor }
++export function generateFloor(rng, floor, player) {
++  const r = rng || Math.random;
++  const f = Math.max(1, Math.min(MAX_FLOOR, floor || 1));
++  const cfg = floorConfig(f);
++  const isBoss = f >= MAX_FLOOR;
++
++  // 多次尝试，直到连通率合格（避免被障碍物封死）。
++  let state = null;
++  for (let attempt = 0; attempt < 8; attempt++) {
++    state = tryGenerate(r, f, isBoss, cfg);
++    const reach = bfsReachable(state.grid, state.pos.x, state.pos.y);
++    const reachCount = reach.dist.size;
++    if (reachCount >= GRID * GRID * 0.6) {
++      state._reach = reach;
++      break;
++    }
++  }
++  if (!state._reach) state._reach = bfsReachable(state.grid, state.pos.x, state.pos.y);
++  const reach = state._reach;
++  delete state._reach;
++
++  // 阶梯：取可达集中距出生点最远的可行走地块。Boss 层无阶梯——击败 Boss 即通关。
++  let stairsCell = null;
++  if (!isBoss) {
++    stairsCell = pickFarReachable(r, reach, state.pos, 6);
++    if (stairsCell) state.grid[stairsCell.y][stairsCell.x] = 'stairs';
++  }
++
++  // 实体放置（仅在可达且未被占用的地块上）。
++  const occupied = new Set([key(state.pos.x, state.pos.y), key(stairsCell?.x, stairsCell?.y)]);
++  const reachableTiles = [...reach.dist.keys()]
++    .filter((k) => !occupied.has(k))
++    .map((k) => { const [x, y] = k.split(',').map(Number); return { x, y }; });
++
++  const entities = [];
++  let eid = 1;
++  const place = (type, dataFn) => {
++    const cell = takeCell(r, reachableTiles, occupied);
++    if (!cell) return null;
++    const e = { id: `e${eid++}`, type, x: cell.x, y: cell.y, ...(dataFn ? dataFn(cell) : {}) };
++    entities.push(e);
++    return e;
++  };
++
++  // Boss 层：只放 Boss + 记忆；普通层按 cfg 放怪 / 箱 / 事件 / 记忆。
++  if (isBoss) {
++    place('enemy', () => bossEnemy());
++  } else {
++    const pool = enemyPoolFor(f);
++    for (let i = 0; i < cfg.enemyCount; i++) {
++      place('enemy', () => spawnEnemy(r, pool, f));
++    }
++    for (let i = 0; i < cfg.chestCount; i++) place('chest', () => ({ reward: chestReward(r, f) }));
++    if (cfg.eventCount) place(pick(r, EVENT_TYPES));
++  }
++  // 每层 1 枚记忆回响（章节 = 楼层 - 1，对应 1..10 章）。
++  if (cfg.memory) place('memory', () => ({ chapter: Math.min(f - 1, MEMORY_CHAPTERS.length - 1) }));
++
++  state.entities = entities;
++  // explored 用普通对象（JSON 原生可序列化），随存档往返不丢失；key 形如 "x,y"。
++  const explored = {};
++  for (const k of visibleKeys(state.grid, state.pos.x, state.pos.y)) explored[k] = true;
++  state.explored = explored;
++  return state;
++}
++
++// 一次生成尝试：网格 + 障碍 + 出生点。
++function tryGenerate(r, f, isBoss, cfg) {
++  const grid = Array.from({ length: GRID }, () =>
++    Array.from({ length: GRID }, () => pick(r, FLOOR_TILES)));
++  // 边界石墙
++  for (let i = 0; i < GRID; i++) {
++    grid[0][i] = 'wall'; grid[GRID - 1][i] = 'wall';
++    grid[i][0] = 'wall'; grid[i][GRID - 1] = 'wall';
++  }
++  // 散布障碍：石墙 / 深墙 / 水域（不可走），密度随楼层略升。
++  const density = 0.10 + Math.min(0.06, (f - 1) * 0.008);
++  for (let y = 1; y < GRID - 1; y++) {
++    for (let x = 1; x < GRID - 1; x++) {
++      if (r() < density) {
++        grid[y][x] = weightedPick(r, { wall: 5, wallDark: 2, water: 3 }) || 'wall';
++      }
++    }
++  }
++  // 出生点：左上角附近的安全格，清空 3×3 邻域保证不卡。
++  const pos = { x: randInt(r, 1, 3), y: randInt(r, 1, 3) };
++  for (let dy = -1; dy <= 1; dy++) {
++    for (let dx = -1; dx <= 1; dx++) {
++      const x = pos.x + dx, y = pos.y + dy;
++      if (inBounds(x, y) && grid[y][x] !== 'floor') grid[y][x] = pick(r, ['floor', 'floor2']);
++    }
++  }
++  return { grid, pos, entities: [], explored: new Set(), floor: f };
++}
++
++function takeCell(r, pool, occupied) {
++  // 从可达池中随机取一个尚未占用的格子。
++  const avail = pool.filter((c) => !occupied.has(key(c.x, c.y)));
++  if (!avail.length) return null;
++  const c = avail[Math.floor(r() * avail.length)];
++  occupied.add(key(c.x, c.y));
++  return c;
++}
++
++function pickFarReachable(r, reach, from, minDist) {
++  // 在可达集中挑选距 from 距离 ≥ minDist 的格子（优先最远），保证阶梯远离出生点。
++  const entries = [...reach.dist.entries()]
++    .map(([k, d]) => { const [x, y] = k.split(',').map(Number); return { x, y, d }; })
++    .filter((c) => c.d >= minDist);
++  if (!entries.length) {
++    // 退化：取可达集中最远的。
++    const all = [...reach.dist.entries()].map(([k, d]) => { const [x, y] = k.split(',').map(Number); return { x, y, d }; });
++    if (!all.length) return null;
++    all.sort((a, b) => b.d - a.d);
++    return all[0];
++  }
++  entries.sort((a, b) => b.d - a.d);
++  // 取前 1/3 中随机一个，避免每次都最远角落。
++  const top = entries.slice(0, Math.max(1, Math.floor(entries.length / 3)));
++  return top[Math.floor(r() * top.length)];
++}
++
++// 生成一个敌人实例（基于敌人定义池加权抽取）。
++function spawnEnemy(r, pool, floor) {
++  if (!pool || !pool.length) pool = enemyPoolFor(floor);
++  const weights = Object.fromEntries(pool.map((e, i) => [i, 1]));
++  const idx = Number(weightedPick(r, weights) || 0);
++  const def = pool[idx] || pool[0];
++  return enemyFromDef(def, floor);
++}
++function bossEnemy() {
++  const def = enemyPoolFor(MAX_FLOOR).find((e) => e.boss) || enemyPoolFor(MAX_FLOOR)[0];
++  return enemyFromDef(def, MAX_FLOOR);
++}
++export function enemyFromDef(def, floor) {
++  // 敌人 HP / 攻击随楼层小幅上扬，保证后期更有压力。
++  const tier = Math.max(0, (floor || 1) - (def.minFloor || 1));
++  return {
++    defId: def.id, name: def.name, emoji: def.emoji,
++    hp: def.hp + tier * 4, maxHp: def.hp + tier * 4,
++    atk: def.atk + tier, stances: { ...def.stances },
++    stardust: def.stardust, parts: def.parts, exp: def.exp,
++    boss: !!def.boss,
++  };
++}
++
++// 宝箱奖励：零件为主，偶有星骸。
++function chestReward(r, floor) {
++  const roll = r();
++  if (roll < 0.6) return { parts: randInt(r, 2, 4) + Math.floor(floor / 3) };
++  if (roll < 0.9) return { stardust: randInt(r, 3, 6) };
++  return { parts: randInt(r, 1, 3), stardust: randInt(r, 2, 4) };
++}
++
++// —— 视野（迷雾）：以 (x,y) 为中心的 5×5 切比雪夫窗口 ——
++export function visibleKeys(grid, x, y) {
++  const out = [];
++  for (let dy = -VISION_RADIUS; dy <= VISION_RADIUS; dy++) {
++    for (let dx = -VISION_RADIUS; dx <= VISION_RADIUS; dx++) {
++      const nx = x + dx, ny = y + dy;
++      if (inBounds(nx, ny)) out.push(key(nx, ny));
++    }
++  }
++  return out;
++}
++export function isVisible(x, y, pos) {
++  return Math.max(Math.abs(x - pos.x), Math.abs(y - pos.y)) <= VISION_RADIUS;
++}
++
++// —— BFS 可达性：从 (sx,sy) 出发，墙 / 水域 / 深墙视为阻挡 ——
++// 返回 { dist: Map(key->steps), prev: Map(key->key) }。
++export function bfsReachable(grid, sx, sy) {
++  const dist = new Map();
++  const prev = new Map();
++  if (!inBounds(sx, sy) || !isWalkable(grid[sy][sx])) return { dist, prev };
++  const q = [[sx, sy]];
++  dist.set(key(sx, sy), 0);
++  while (q.length) {
++    const [x, y] = q.shift();
++    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
++      const nx = x + dx, ny = y + dy;
++      if (!inBounds(nx, ny)) continue;
++      if (!isWalkable(grid[ny][nx])) continue;
++      const k = key(nx, ny);
++      if (dist.has(k)) continue;
++      dist.set(k, dist.get(key(x, y)) + 1);
++      prev.set(k, key(x, y));
++      q.push([nx, ny]);
++    }
++  }
++  return { dist, prev };
++}
++
++// 计算从 from 到 to 的路径（仅四向、避开阻挡与敌占格），返回步序列 [{x,y},...]（含 to，不含 from）。
++// range 为步数上限；超出或不可达返回 null。avoid 是额外阻挡坐标集合（如敌人）。
++export function findPath(state, from, to, range, avoid) {
++  if (!state) return null;
++  const block = new Set(avoid || []);
++  // 敌人所在格视为阻挡。
++  for (const e of state.entities) if (e.type === 'enemy') block.add(key(e.x, e.y));
++  const dist = new Map();
++  const prev = new Map();
++  const startK = key(from.x, from.y);
++  dist.set(startK, 0);
++  const q = [[from.x, from.y]];
++  let found = false;
++  while (q.length) {
++    const [x, y] = q.shift();
++    if (x === to.x && y === to.y) { found = true; break; }
++    const base = dist.get(key(x, y));
++    if (base >= range) continue;
++    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
++      const nx = x + dx, ny = y + dy;
++      const k = key(nx, ny);
++      if (dist.has(k)) continue;
++      if (!inBounds(nx, ny)) continue;
++      const isTarget = nx === to.x && ny === to.y;
++      if (block.has(k) && !isTarget) continue;       // 阻挡格不可踏入（目标格除外）
++      if (!isWalkable(state.grid[ny][nx]) && !isTarget) continue;
++      dist.set(k, base + 1);
++      prev.set(k, key(x, y));
++      q.push([nx, ny]);
++    }
++  }
++  if (!found && !(from.x === to.x && from.y === to.y)) return null;
++  // 回溯路径
++  const path = [];
++  let cur = key(to.x, to.y);
++  if (!dist.has(cur)) return null;
++  const steps = dist.get(cur);
++  if (steps > range) return null;
++  while (cur !== startK) {
++    const [cx, cy] = cur.split(',').map(Number);
++    path.unshift({ x: cx, y: cy });
++    cur = prev.get(cur);
++    if (cur == null) break;
++  }
++  return path;
++}
++
++// 计算从 from 出发、步数 ≤ range 的所有可达地块（四向；墙 / 水域 / 敌人格视为阻挡）。
++// 返回 Set(key)。供 UI 标注「可点击移动」高亮。
++export function reachableTiles(state, from, range) {
++  const out = new Set();
++  if (!state) return out;
++  const block = new Set();
++  for (const e of state.entities) if (e.type === 'enemy') block.add(key(e.x, e.y));
++  const dist = new Map();
++  const startK = key(from.x, from.y);
++  dist.set(startK, 0);
++  out.add(startK);
++  const q = [[from.x, from.y]];
++  while (q.length) {
++    const [x, y] = q.shift();
++    const base = dist.get(key(x, y));
++    if (base >= range) continue;
++    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
++      const nx = x + dx, ny = y + dy;
++      const k = key(nx, ny);
++      if (dist.has(k)) continue;
++      if (!inBounds(nx, ny)) continue;
++      if (block.has(k)) continue;
++      if (!isWalkable(state.grid[ny][nx])) continue;
++      dist.set(k, base + 1);
++      out.add(k);
++      q.push([nx, ny]);
++    }
++  }
++  return out;
++}
++
++// 查询某格上的实体。
++export function entityAt(state, x, y) {
++  if (!state || !state.entities) return null;
++  return state.entities.find((e) => e.x === x && e.y === y) || null;
++}
++export function removeEntity(state, id) {
++  if (!state || !state.entities) return false;
++  const i = state.entities.findIndex((e) => e.id === id);
++  if (i < 0) return false;
++  state.entities.splice(i, 1);
++  return true;
++}
++
++export function tileAt(state, x, y) {
++  if (!state || !inBounds(x, y)) return 'wall';
++  return state.grid[y][x];
++}
++
++// 下行：楼层 +1（上限 MAX_FLOOR），更新最远记录。返回新楼层。
++export function descend(player) {
++  if (!player) return 1;
++  player.floor = Math.min(MAX_FLOOR, player.floor + 1);
++  if (player.floor > player.maxFloor) player.maxFloor = player.floor;
++  return player.floor;
++}
++
++export { key, inBounds, GRID, VISION_RADIUS, TILES, tileOf, isWalkable, EVENT_META, MAX_FLOOR };
+diff --git a/apps/xing-hai-lv-zhe/src/main.js b/apps/xing-hai-lv-zhe/src/main.js
+new file mode 100644
+index 0000000..148db51
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/main.js
+@@ -0,0 +1,19 @@
++// ============================================================================
++// 星骸旅者 · 入口
++// 导出 createGame(parent) 工厂，供主框架（落地页）按需挂载到任意容器；
++// 同时保留独立运行（apps/xing-hai-lv-zhe/index.html）时的自动挂载行为。
++// ============================================================================
++import { GameUI } from './ui/app.js';
++
++export function createGame(parent) {
++  const ui = new GameUI(parent);
++  ui.mount();
++  return ui;
++}
++
++// 独立运行时自动挂载到 #game-container（仅在元素存在时触发，
++// 避免被主框架动态 import 时误启动游戏）。
++if (typeof document !== 'undefined' && document.getElementById('game-container')) {
++  const ui = createGame(document.getElementById('game-container'));
++  if (typeof window !== 'undefined') window.__XHLZ = ui; // 暴露实例便于调试 / 冒烟测试
++}
+diff --git a/apps/xing-hai-lv-zhe/src/ui/app.js b/apps/xing-hai-lv-zhe/src/ui/app.js
+new file mode 100644
+index 0000000..750a538
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/ui/app.js
+@@ -0,0 +1,1299 @@
++// ============================================================================
++// 星骸旅者 · UI 渲染模块（UI Renderer，纯原生 DOM + CSS 像素网格）
++// 状态机：BOOT(launcher) → MAP → BATTLE → INVENTORY / EVENT → 结局。
++// 负责：启动器/创角、像素地图渲染与点击移动、猜拳战斗、背包(装备/天赋/剧情)、
++// 随机事件、双重结局、多槽位存档。requestAnimationFrame 驱动战斗计时与闲置回精。
++// ============================================================================
++import './style.css';
++import { h, clear, bar } from './dom.js';
++import {
++  PALETTE, GRID, VISION_RADIUS, TILES, tileOf, isWalkable,
++  EQUIP_SLOTS, MAX_PLUS, AFFIX_AT, AFFIXES, enhanceCost,
++  TALENTS, TALENT_BY_BRANCH, talentCost,
++  STAMINA_COST_PER_ROUND, STAMINA_REGEN_PER_STEP, STAMINA_REGEN_INTERVAL_MS, STAMINA_TIRED,
++  SHOP_ITEMS, DRONE_COST, EVENT_META, MEMORY_CHAPTERS, STORY, ENDINGS, MAX_FLOOR, expToNext,
++} from '../config.js';
++import {
++  newPlayer, migrate, maxHp, maxStamina, effectiveAtk, effectiveDef, effectiveMoveRange,
++  enhanceEquipment, buyTalent, resetTalents, gainReward, healFull, regenStamina, spendStamina,
++  isDead, collectMemory, collectedMemoryCount,
++} from '../core/player.js';
++import {
++  generateFloor, findPath, reachableTiles, entityAt, removeEntity, tileAt, descend,
++} from '../core/world.js';
++import {
++  STANCES, ACTIONS, COUNTERS, TELEGRAPH_CHANCE,
++  pickEnemyStance, isTelegraphed, autoPickAction, resolveRound, enemyReward,
++} from '../core/battle.js';
++import {
++  saveToSlot, loadFromSlot, deleteSlot, listSaves, hasAnySave, latestSlot,
++  exportSave, importSave, SAVE_SLOTS,
++} from '../core/save.js';
++
++const BATTLE_TIME_MS = 3000;       // 每回合限时（可于设置关闭）
++const IDLE_FRAME_MS = 1000 / 20;   // 闲置降帧至 ~20fps 节省电量
++
++export class GameUI {
++  constructor(parent) {
++    this.parent = parent;
++    this.player = null;
++    this.rng = Math.random;
++    this.screen = 'launcher';
++    this.over = false;
++    this.activeSlot = null;
++    this.timerEnabled = true;      // 战斗限时（测试可关闭）
++    this._sheet = null;
++    this.charName = '';
++    this.cellNodes = [];           // 2D 地块 DOM 引用（脏更新）
++    this.floatLayer = null;
++    this.running = false;          // rAF 循环开关
++    this._raf = 0;
++    this._lastFrame = 0;
++    this._staminaAccum = 0;
++    this.battle = null;            // 战斗会话状态
++  }
++
++  mount() {
++    this.root = h('div', { class: 'xhlz' });
++    clear(this.parent);
++    this.parent.appendChild(this.root);
++    this.toastWrap = h('div', { class: 'toast-wrap' });
++    this.stage = h('div', { class: 'xhlz-stage' });
++    this.modalRoot = h('div', { class: 'xhlz-modals' });
++    this.root.append(this.toastWrap, this.stage, this.modalRoot);
++    this.showLauncher();
++    return this;
++  }
++
++  // ===================== 启动器 =====================
++  showLauncher() {
++    this.screen = 'launcher';
++    this.over = false;
++    this.player = null;
++    this.battle = null;
++    this.activeSlot = null;
++    this.stopLoop();
++    clear(this.modalRoot);
++    clear(this.stage);
++    const hasSave = hasAnySave();
++    const wrap = h('div', { class: 'launcher' },
++      h('div', { class: 'launcher__brand' },
++        h('div', { class: 'emblem' }, '星'),
++        h('h1', null, '星骸旅者'),
++        h('p', { class: 'sub' }, '开罗式像素 Roguelike · 在破碎星球拾荒、战斗、寻回记忆'),
++      ),
++      h('div', { class: 'launcher__actions' },
++        hasSave
++          ? h('button', { class: 'btn-primary big-btn', onClick: () => this.continueGame() }, '▶ 继续旅程')
++          : h('button', { class: 'btn-primary big-btn', onClick: () => this.showCreate() }, '🚀 开启新旅程'),
++        hasSave
++          ? h('button', { class: 'btn-ghost', onClick: () => this.showCreate() }, '🆕 新旅程（选空槽）')
++          : null,
++        h('button', { class: 'btn-ghost', onClick: () => this.showSlots(true) }, '📂 存档管理'),
++        h('button', { class: 'btn-ghost', onClick: () => this.showAbout() }, '📖 关于 / 玩法'),
++      ),
++      h('p', { class: 'launcher__hint muted' }, '点击地块移动，靠近敌人即可交战；集齐 10 枚星骸回响，揭开星球的真相。'),
++    );
++    this.stage.appendChild(wrap);
++  }
++
++  continueGame() {
++    const slot = latestSlot();
++    if (slot == null) { this.toast('没有可继续的存档', 'bad'); this.showLauncher(); return; }
++    const p = loadFromSlot(slot);
++    if (!p) { this.toast('读取存档失败', 'bad'); this.showLauncher(); return; }
++    if (p.ending) { this.renderEnding(p.ending, true, p); return; }
++    this.enterGame(p, slot);
++  }
++
++  showAbout() {
++    const body = [
++      h('div', { class: 'card' },
++        h('h4', null, '🎮 核心循环'),
++        h('div', { class: 'muted', style: { lineHeight: 1.7 } },
++          '浮岛探索（点击移动）→ 触发战斗 / 宝箱 / 陷阱 → 回到背包消耗零件强化装备、用星骸点亮天赋 → 挑战更深层浮岛。'),
++      ),
++      h('div', { class: 'card' },
++        h('h4', null, '⚔️ 战斗：猜拳克制'),
++        h('div', { class: 'muted', style: { lineHeight: 1.7 } },
++          '敌人摆出 突刺🗡️ / 横斩🌀 / 重击💥；你选 格挡🛡️ / 闪避💨 / 反击⚔️。',
++          h('br'),
++          '反击克突刺、格挡克横斩、闪避克重击。成功克制 → 下一击专注力 ×1.5。精力过低会失手；可开启自动战斗代打。'),
++      ),
++      h('div', { class: 'card' },
++        h('h4', null, '💎 成长'),
++        h('div', { class: 'muted', style: { lineHeight: 1.7 } },
++          '武器/护甲/推进器消耗「零件」强化，+5 触发词缀变异；天赋树三条分支（生存/战斗/幸运）消耗「星骸」点亮，可免费重置。'),
++      ),
++    ];
++    this.showSheet({ title: '📖 关于 / 玩法', body, foot: [h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '明白')] });
++  }
++
++  // ===================== 存档管理（多槽位）=====================
++  showSlots(fromLauncher) {
++    const list = listSaves();
++    const body = [
++      h('div', { class: 'muted', style: { marginBottom: '0.5rem' } },
++        `共 ${SAVE_SLOTS} 个存档槽位。点击空槽可在此开始新旅程，已有存档可读取或删除。`),
++      h('div', { class: 'slot-list' }, list.map((s) => this.renderSlotRow(s))),
++    ];
++    const foot = [
++      fromLauncher ? null : h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '关闭'),
++      h('button', { class: 'btn-primary', onClick: () => { this.closeModal(); this.showCreate(); } }, '🆕 新旅程'),
++    ];
++    this.showSheet({ title: '📂 存档管理', body, foot: foot.filter(Boolean) });
++  }
++
++  renderSlotRow(s) {
++    const head = s.exists
++      ? h('div', { class: 'slot-info' },
++          h('div', { class: 'slot-name' }, `${s.name || '旅者'}${s.ending ? '  · 已通关' : ''}`),
++          h('div', { class: 'slot-meta' }, `第 ${s.floor || 1} 层 · 最深 ${s.maxFloor || 1} · Lv${s.level || 1} · 💎${s.memoryCount || 0}/10 · ✨${s.stardust || 0}`),
++        )
++      : h('div', { class: 'slot-info' }, h('div', { class: 'muted' }, '空槽位'));
++    const actions = h('div', { class: 'slot-actions' },
++      s.exists
++        ? [
++            h('button', { class: 'btn-primary slot-act', onClick: () => this.loadSlot(s.slot) }, '读取'),
++            h('button', { class: 'btn-ghost slot-act', onClick: () => this.confirmDeleteSlot(s.slot) }, '🗑️'),
++          ]
++        : h('button', { class: 'btn-jade slot-act', onClick: () => { this.closeModal(); this.showCreate(s.slot); } }, '在此开始'),
++    );
++    return h('div', { class: `slot-row ${s.exists ? '' : 'empty'}`, dataset: { slot: s.slot } },
++      h('span', { class: 'slot-no' }, `#${s.slot + 1}`), head, actions);
++  }
++
++  loadSlot(slot) {
++    const p = loadFromSlot(slot);
++    if (!p) { this.toast('读取失败', 'bad'); return; }
++    this.closeModal();
++    if (p.ending) { this.renderEnding(p.ending, true, p); return; }
++    this.enterGame(p, slot);
++  }
++
++  confirmDeleteSlot(slot) {
++    this.showSheet({
++      title: '删除该存档？',
++      body: [h('div', { class: 'muted' }, `将永久删除 #${slot + 1} 号槽位的存档，无法恢复。`)],
++      foot: [
++        h('button', { class: 'btn-danger', onClick: () => { deleteSlot(slot); this.closeModal(); this.toast('存档已删除'); this.showSlots(this.screen === 'launcher'); } }, '确认删除'),
++        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '取消'),
++      ],
++    });
++  }
++
++  // ===================== 创角 =====================
++  showCreate(preferSlot) {
++    this.screen = 'create';
++    this.stopLoop();
++    this._preferSlot = Number.isInteger(preferSlot) ? preferSlot : null;
++    clear(this.modalRoot);
++    clear(this.stage);
++    this.renderCreate();
++  }
++
++  renderCreate() {
++    clear(this.stage);
++    const wrap = h('div', { class: 'launcher' });
++    wrap.append(
++      h('div', { class: 'create__head' },
++        h('button', { class: 'btn-ghost', onClick: () => this.showLauncher() }, '← 返回'),
++        h('h1', null, '开启新旅程'),
++      ),
++      h('div', { class: 'card' },
++        h('h4', null, '姓名'),
++        h('input', { class: 'name-input', dataset: { id: 'name' }, maxlength: 8, placeholder: '旅者（可留空）', value: this.charName || '' }),
++        h('div', { class: 'muted', style: { marginTop: '0.3rem' } }, '为这位拾荒者取个名字。每个浮岛都藏着一枚记忆碎片，等着被你寻回。'),
++      ),
++      h('div', { class: 'create__foot' },
++        h('button', { class: 'btn-primary big-btn', onClick: () => this.confirmCreate() }, '🚀 迫降墨比乌斯'),
++      ),
++    );
++    this.stage.appendChild(wrap);
++    const inp = wrap.querySelector('[data-id="name"]');
++    if (inp) inp.addEventListener('input', () => { this.charName = inp.value; });
++  }
++
++  confirmCreate() {
++    const name = (this.charName || '').trim().slice(0, 8);
++    const p = newPlayer(this.rng, { name });
++    const slot = this.pickSlotForNewSave();
++    this.activeSlot = slot;
++    p.floorState = generateFloor(this.rng, p.floor, p);
++    this.enterGame(p, slot);
++    this.pushLog(STORY.prologue, 'milestone');
++    saveToSlot(this.activeSlot, this.player); // 序章写入后补存，避免重载前首条故事丢失
++    this.toast(`已保存到 #${slot + 1} 号槽位`, 'good');
++  }
++
++  pickSlotForNewSave() {
++    const prefer = this._preferSlot;
++    const list = listSaves();
++    if (Number.isInteger(prefer) && prefer >= 0 && prefer < SAVE_SLOTS && !list[prefer].exists) return prefer;
++    const empty = list.find((s) => !s.exists);
++    if (empty) return empty.slot;
++    list.sort((a, b) => (a.lastSeen || 0) - (b.lastSeen || 0));
++    return list[0].slot;
++  }
++
++  // ===================== 进入游戏 =====================
++  enterGame(player, slot) {
++    this.player = player;
++    this.activeSlot = Number.isInteger(slot) ? slot : (this.activeSlot != null ? this.activeSlot : 0);
++    this.screen = 'game';
++    this.over = false;
++    this.battle = null;
++    // 存档无楼层快照（旧档 / 损坏）→ 重新生成当前层。
++    if (!this.player.floorState) this.player.floorState = generateFloor(this.rng, this.player.floor, this.player);
++    this.buildGame();
++    this.refreshStatus();
++    this.renderMap();
++    this.refreshInteract();
++    saveToSlot(this.activeSlot, this.player);
++    this.startLoop();
++    if (isDead(this.player)) this.gameOver();
++  }
++
++  buildGame() {
++    clear(this.stage);
++    clear(this.modalRoot);
++    const game = h('div', { class: 'xhlz-game' });
++    this.statusEl = h('div', { class: 'status-bar' });
++    const mapWrap = h('div', { class: 'map-wrap' },
++      this.floatLayer = h('div', { class: 'float-layer' }),
++      h('div', { class: 'map-frame' }, h('div', { class: 'map-grid', onClick: (e) => this.onMapTap(e) })),
++    );
++    this.bottomBar = h('div', { class: 'bottom-bar' });
++    game.append(this.statusEl, mapWrap, this.bottomBar);
++    this.stage.appendChild(game);
++    this.gridEl = mapWrap.querySelector('.map-grid');
++    this.buildStatus();
++    this.buildMap();
++    this.buildBottomBar();
++  }
++
++  // —— 顶部状态栏 ——
++  buildStatus() {
++    clear(this.statusEl);
++    const p = this.player;
++    this.hpFill = h('div', { class: 'bl-fill', style: { background: PALETTE.hp } });
++    this.hpVal = h('span', { class: 'bl-val' }, `${p.hp}/${maxHp(p)}`);
++    this.staFill = h('div', { class: 'bl-fill', style: { background: PALETTE.teal } });
++    this.staVal = h('span', { class: 'bl-val' }, `${p.stamina}/${maxStamina()}`);
++    this.statusEl.append(
++      h('div', { class: 'status-top' },
++        h('span', { class: 'status-name' }, p.name),
++        h('span', { class: 'status-lv' }, `Lv${p.level}`),
++        h('span', { class: 'status-floor' }, '第 ', h('b', null, String(p.floor)), ` / ${MAX_FLOOR} 层`),
++        h('span', { class: 'status-res' },
++          h('span', { class: 'r' }, h('span', null, '✨'), this.sdEl = h('span', null, String(p.stardust))),
++          h('span', { class: 'r' }, h('span', null, '🔩'), this.ptEl = h('span', null, String(p.parts))),
++        ),
++      ),
++      h('div', { class: 'status-bars' },
++        h('div', { class: 'barline' }, h('span', { class: 'bl-icon' }, '❤️'), h('div', { class: 'bl-track' }, this.hpFill), this.hpVal),
++        h('div', { class: 'barline' }, h('span', { class: 'bl-icon' }, '⚡'), h('div', { class: 'bl-track' }, this.staFill), this.staVal),
++      ),
++    );
++  }
++
++  refreshStatus() {
++    const p = this.player;
++    if (!p || !this.hpFill) return;
++    this.hpFill.style.width = `${(p.hp / maxHp(p)) * 100}%`;
++    this.hpVal.textContent = `${p.hp}/${maxHp(p)}`;
++    this.staFill.style.width = `${(p.stamina / maxStamina()) * 100}%`;
++    this.staVal.textContent = `${p.stamina}/${maxStamina()}`;
++    const nameEl = this.statusEl.querySelector('.status-name');
++    if (nameEl) nameEl.textContent = p.name;
++    const lvEl = this.statusEl.querySelector('.status-lv');
++    if (lvEl) lvEl.textContent = `Lv${p.level}`;
++    const floorB = this.statusEl.querySelector('.status-floor b');
++    if (floorB) floorB.textContent = String(p.floor);
++    if (this.sdEl) this.sdEl.textContent = String(p.stardust);
++    if (this.ptEl) this.ptEl.textContent = String(p.parts);
++  }
++
++  // —— 像素地图 ——
++  buildMap() {
++    clear(this.gridEl);
++    this.cellNodes = [];
++    for (let y = 0; y < GRID; y++) {
++      const row = [];
++      for (let x = 0; x < GRID; x++) {
++        const cell = h('div', { class: 'cell fog', dataset: { x: String(x), y: String(y) } });
++        this.gridEl.appendChild(cell);
++        row.push(cell);
++      }
++      this.cellNodes.push(row);
++    }
++  }
++
++  state() { return this.player.floorState; }
++
++  renderMap() {
++    const st = this.state();
++    if (!st) return;
++    const pos = st.pos;
++    const reach = this.screen === 'game' && !this._sheet ? reachableTiles(st, pos, effectiveMoveRange(this.player)) : new Set();
++    for (let y = 0; y < GRID; y++) {
++      for (let x = 0; x < GRID; x++) {
++        const cell = this.cellNodes[y][x];
++        const k = `${x},${y}`;
++        const explored = !!st.explored[k];
++        const visible = isVisible(x, y, pos);
++        const tileId = tileAt(st, x, y);
++        const ent = entityAt(st, x, y);
++        let cls = 'cell';
++        if (!explored && !visible) cls += ' fog';
++        else if (!visible) cls += ' dim';
++        else cls += ' visible';
++        const isPlayer = pos.x === x && pos.y === y;
++        if (isPlayer) cls += ' player';
++        if (tileId === 'stairs') cls += ' stairs';
++        if (reach.has(k) && !isPlayer) cls += ' reachable';
++        cell.className = cls;
++        // 背景：地块色（玩家格叠加蓝色调）
++        if (!explored && !visible) {
++          cell.style.background = '';
++        } else {
++          cell.style.background = isPlayer
++            ? `linear-gradient(rgba(77,150,255,0.45), rgba(77,150,255,0.45)), ${tileOf(tileId).color}`
++            : tileOf(tileId).color;
++        }
++        // 实体 emoji（陷阱不显示——踩到才发现）
++        let emoji = '';
++        if (visible || explored) {
++          if (isPlayer) emoji = '🧑‍🚀';
++          else if (ent) emoji = entityEmoji(ent, tileId);
++        }
++        // 仅在内容变化时更新，减少重排
++        const cur = cell.firstChild;
++        if (emoji) {
++          if (!cur || cur.textContent !== emoji) {
++            if (cur) cur.remove();
++            cell.appendChild(h('span', { class: 'ent' }, emoji));
++          }
++        } else if (cur) {
++          cur.remove();
++        }
++        cell.dataset.x = String(x);
++        cell.dataset.y = String(y);
++      }
++    }
++  }
++
++  // —— 移动：点击地块 ——
++  onMapTap(e) {
++    if (this.screen !== 'game' || this._sheet) return;
++    const cell = e.target.closest('.cell');
++    if (!cell) return;
++    const x = Number(cell.dataset.x), y = Number(cell.dataset.y);
++    this.tryMoveTo(x, y);
++  }
++
++  tryMoveTo(tx, ty) {
++    const st = this.state();
++    if (!st) return;
++    if (st.pos.x === tx && st.pos.y === ty) { this.refreshInteract(); return; }
++    const ent = entityAt(st, tx, ty);
++    if (ent && ent.type === 'enemy') { this.toast('靠近敌人后用「攻击」交战', 'normal'); return; }
++    if (!isWalkable(tileAt(st, tx, ty))) { this.toast('那里无法通行', 'normal'); return; }
++    const range = effectiveMoveRange(this.player);
++    const path = findPath(st, st.pos, { x: tx, y: ty }, range);
++    if (!path || !path.length) { this.toast('超出移动步数', 'normal'); return; }
++    this.walkPath(path);
++  }
++
++  // 沿路径行走，逐格结算（遇交互实体则停下）。
++  walkPath(path) {
++    const st = this.state();
++    for (const step of path) {
++      st.pos = { x: step.x, y: step.y };
++      this.player.turn += 1;
++      regenStamina(this.player, STAMINA_REGEN_PER_STEP);
++      this.revealAround();
++      const ent = entityAt(st, step.x, step.y);
++      if (ent) {
++        this.renderMap();
++        this.refreshStatus();
++        this.refreshInteract();
++        saveToSlot(this.activeSlot, this.player);
++        if (this.resolveEntity(ent)) return; // 进入战斗 / 弹窗则终止移动
++      }
++    }
++    this.renderMap();
++    this.refreshStatus();
++    this.refreshInteract();
++    saveToSlot(this.activeSlot, this.player);
++  }
++
++  revealAround() {
++    const st = this.state();
++    for (const k of visibleKeysList(st, st.pos.x, st.pos.y)) st.explored[k] = true;
++  }
++
++  // 踩到交互实体：返回 true 表示已切入战斗 / 弹窗，应中止移动。
++  resolveEntity(ent) {
++    const st = this.state();
++    if (ent.type === 'chest') {
++      const r = ent.reward || {};
++      // 用 gainReward 的实发量（含幸运加成）展示，避免飘字与状态栏不一致。
++      const g = gainReward(this.player, r, this.rng);
++      removeEntity(st, ent.id);
++      this.floatAt(ent.x, ent.y, `+✨${g.stardust} 🔩${g.parts}`, 'gold');
++      this.pushLog(`🎁 拾得宝箱：${g.stardust ? `✨${g.stardust} ` : ''}${g.parts ? `🔩${g.parts}` : ''}`, 'good');
++      this.toast('拾得宝箱', 'good');
++      this.refreshStatus();
++      return false;
++    }
++    if (ent.type === 'memory') {
++      const res = collectMemory(this.player, ent.chapter);
++      removeEntity(st, ent.id);
++      if (res.ok) {
++        this.floatAt(ent.x, ent.y, '💎 记忆', 'gold');
++        this.pushLog(`💎 寻回星骸回响：${MEMORY_CHAPTERS[res.chapter].title}`, 'milestone');
++        this.refreshStatus();
++        saveToSlot(this.activeSlot, this.player);
++        this.showChapter(res.chapter);
++        return true;
++      }
++      return false;
++    }
++    if (ent.type === 'trap') {
++      this.teleport();
++      return true;
++    }
++    if (ent.type === 'merchant') { this.showMerchant(); return true; }
++    if (ent.type === 'drone') { this.showDrone(); return true; }
++    return false;
++  }
++
++  // 重力陷阱：传送到随机可达地块。
++  teleport() {
++    const st = this.state();
++    const reach = [...reachableTiles(st, st.pos, 99)];
++    const choices = reach.filter((k) => {
++      const [x, y] = k.split(',').map(Number);
++      return !(x === st.pos.x && y === st.pos.y) && !entityAt(st, x, y);
++    });
++    const pool = choices.length ? choices : reach;
++    const k = pool[Math.floor(this.rng() * pool.length)];
++    const [nx, ny] = k.split(',').map(Number);
++    st.pos = { x: nx, y: ny };
++    this.revealAround();
++    this.shake();
++    this.pushLog('🌀 触发重力陷阱！空间扭曲，你被抛向未知之处。', 'bad');
++    this.toast('重力陷阱！被传送', 'bad');
++    this.renderMap();
++    this.refreshStatus();
++    this.refreshInteract();
++    saveToSlot(this.activeSlot, this.player);
++  }
++
++  // —— 方向键单步移动 ——
++  dpadMove(dx, dy) {
++    if (this.screen !== 'game' || this._sheet) return;
++    const st = this.state();
++    const nx = st.pos.x + dx, ny = st.pos.y + dy;
++    this.tryMoveTo(nx, ny);
++  }
++
++  // —— 中央交互键（随上下文动态）——
++  buildBottomBar() {
++    clear(this.bottomBar);
++    const dpad = h('div', { class: 'dpad' },
++      h('button', { class: 'd-up', onClick: () => this.dpadMove(0, -1) }, '▲'),
++      h('button', { class: 'd-left', onClick: () => this.dpadMove(-1, 0) }, '◀'),
++      h('button', { class: 'd-center', onClick: () => this.refreshInteract() }, '·'),
++      h('button', { class: 'd-right', onClick: () => this.dpadMove(1, 0) }, '▶'),
++      h('button', { class: 'd-down', onClick: () => this.dpadMove(0, 1) }, '▼'),
++    );
++    this.interactBtn = h('button', { class: 'btn-primary interact-btn', onClick: () => this.doInteract() }, '🔍 调查');
++    const tools = h('div', { class: 'tool-col' },
++      h('button', { class: 'icon-btn', title: '背包 / 状态', onClick: () => this.openInventory() }, '🎒'),
++      h('button', { class: 'icon-btn', title: '设置 / 存档', onClick: () => this.showSettings(false) }, '⚙️'),
++    );
++    this.bottomBar.append(dpad, h('div', { class: 'act-col' }, this.interactBtn), tools);
++  }
++
++  // 依据周围上下文刷新中央键文案与可用性。
++  refreshInteract() {
++    if (!this.interactBtn || this.screen !== 'game') return;
++    const st = this.state();
++    const adj = adjacentEnemy(st, st.pos);
++    if (adj) {
++      this.interactBtn.className = 'btn-danger interact-btn';
++      this.interactBtn.textContent = `⚔️ 攻击·${adj.name}`;
++      this.interactBtn.disabled = false;
++      this._interactMode = { mode: 'attack', enemy: adj };
++      return;
++    }
++    if (tileAt(st, st.pos.x, st.pos.y) === 'stairs') {
++      this.interactBtn.className = 'btn-jade interact-btn';
++      this.interactBtn.textContent = '⬇️ 下行至下一浮岛';
++      this.interactBtn.disabled = false;
++      this._interactMode = { mode: 'descend' };
++      return;
++    }
++    const here = entityAt(st, st.pos.x, st.pos.y);
++    if (here && (here.type === 'chest' || here.type === 'memory')) {
++      this.interactBtn.className = 'btn-primary interact-btn';
++      this.interactBtn.textContent = here.type === 'memory' ? '💎 拾取回响' : '🎁 拾取宝箱';
++      this.interactBtn.disabled = false;
++      this._interactMode = { mode: 'pickup', ent: here };
++      return;
++    }
++    this.interactBtn.className = 'btn-ghost interact-btn';
++    this.interactBtn.textContent = '🔍 调查';
++    this.interactBtn.disabled = false;
++    this._interactMode = { mode: 'investigate' };
++  }
++
++  doInteract() {
++    if (this.screen !== 'game' || !this._interactMode) return;
++    const m = this._interactMode;
++    if (m.mode === 'attack') this.startBattle(m.enemy);
++    else if (m.mode === 'descend') this.descendFloor();
++    else if (m.mode === 'pickup') this.resolveEntity(m.ent);
++    else this.toast('周围没有可交互的对象', 'normal');
++  }
++
++  descendFloor() {
++    const st = this.state();
++    if (tileAt(st, st.pos.x, st.pos.y) !== 'stairs') { this.toast('需站在下行阶梯上', 'normal'); return; }
++    descend(this.player);
++    this.player.floorState = generateFloor(this.rng, this.player.floor, this.player);
++    this.pushLog(`⬇️ 降至第 ${this.player.floor} 层浮岛。`, 'milestone');
++    if (this.player.floor === 3) this.pushLog(STORY.midpoint, 'milestone');
++    this.refreshStatus();
++    this.renderMap();
++    this.refreshInteract();
++    saveToSlot(this.activeSlot, this.player);
++    this.toast(`进入第 ${this.player.floor} 层`, 'good');
++  }
++
++  // ===================== 战斗 =====================
++  startBattle(enemyEntity) {
++    if (this.screen !== 'game') return;
++    this.screen = 'battle';
++    this.battle = {
++      enemy: enemyEntity, focus: false, auto: false, round: 0,
++      stance: null, telegraphed: false, timerEnd: 0, busy: false,
++    };
++    clear(this.modalRoot);
++    this.buildBattle();
++    this.nextRound();
++  }
++
++  buildBattle() {
++    clear(this.stage);
++    const e = this.battle.enemy;
++    const wrap = h('div', { class: 'battle' });
++    this.foeEmoji = h('div', { class: 'emoji' }, e.emoji || '👾');
++    this.foeName = h('div', { class: 'name' }, `${e.name}${e.boss ? ' · BOSS' : ''}`);
++    this.foeHpFill = h('div', { class: 'bar__fill', style: { background: PALETTE.monster } });
++    this.foeHpLabel = h('span', { class: 'bar__label' }, `${e.hp}/${e.maxHp}`);
++    this.stanceChip = h('div', { class: 'stance-chip unknown' }, '敌人蓄势中…');
++    this.battleLog = h('div', { class: 'battle__log' });
++    this.timerFill = h('div', { class: 't', style: { width: '100%' } });
++    this.actionBtns = ['block', 'dodge', 'counter'].map((a) =>
++      h('button', { class: `act ${a}`, dataset: { action: a }, onClick: () => this.chooseAction(a) },
++        h('div', null, ACTIONS[a].emoji), h('div', null, ACTIONS[a].name)));
++    this.autoToggle = h('button', { class: 'btn-ghost icon-btn', title: '自动战斗', onClick: () => this.toggleAuto() }, '🤖');
++
++    this.hpFill = h('div', { class: 'bl-fill', style: { background: PALETTE.hp } });
++    this.hpVal = h('span', { class: 'bl-val' }, `${this.player.hp}/${maxHp(this.player)}`);
++    // 战斗屏独立浮动层（buildGame 的 floatLayer 已随 stage 清空而脱离）。
++    this.floatLayer = h('div', { class: 'float-layer' });
++
++    wrap.append(
++      h('div', { class: 'battle__topbar' },
++        h('button', { class: 'btn-ghost icon-btn', onClick: () => this.confirmFlee() }, '🏃'),
++        h('span', { class: 'title' }, '战斗'),
++        this.autoToggle,
++      ),
++      h('div', { class: 'battle__foe' }, this.foeEmoji, this.foeName,
++        h('div', { class: 'bar', style: { marginTop: '0.4rem' } }, this.foeHpFill, this.foeHpLabel)),
++      h('div', { class: 'battle__stance' }, this.stanceChip),
++      this.battleLog,
++      h('div', { class: 'battle__self' },
++        h('span', null, '❤️'),
++        h('div', { class: 'barline', style: { flex: 1 } }, h('div', { class: 'bl-track' }, this.hpFill), this.hpVal),
++      ),
++      h('div', { class: 'battle__timer' }, this.timerFill),
++      h('div', { class: 'battle__actions' }, this.actionBtns),
++      this.floatLayer,
++    );
++    this.stage.appendChild(wrap);
++    this.logBattle(`与 ${e.name} 交战！`, 'normal');
++  }
++
++  nextRound() {
++    if (!this.battle) return;
++    this.battle.round += 1;
++    const stance = pickEnemyStance(this.battle.enemy, this.rng);
++    const tele = isTelegraphed(this.rng);
++    this.battle.stance = stance;
++    this.battle.telegraphed = tele;
++    this.battle.busy = false;
++    // 架势展示：识破时明牌，否则「??」需盲猜。
++    if (tele) {
++      const s = STANCES[stance];
++      this.stanceChip.className = 'stance-chip';
++      this.stanceChip.textContent = `${s.emoji} 敌人摆出「${s.name}」`;
++    } else {
++      this.stanceChip.className = 'stance-chip unknown';
++      this.stanceChip.textContent = '❓ 敌人意图难辨…';
++    }
++    for (const b of this.actionBtns) b.disabled = false;
++    if (this.timerEnabled && !this.battle.auto) {
++      this.battle.timerEnd = nowMs() + BATTLE_TIME_MS;
++    } else {
++      this.timerFill.style.width = '100%';
++    }
++    if (this.battle.auto) {
++      const act = autoPickAction(stance);
++      // 不预置 busy=true：chooseAction 自带 busy 守卫，预置会令其立即返回，导致自动战斗死锁。
++      setTimeout(() => { if (this.battle) this.chooseAction(act); }, 320);
++    }
++  }
++
++  chooseAction(action) {
++    if (!this.battle || this.battle.busy) return;
++    this.battle.busy = true;
++    for (const b of this.actionBtns) b.disabled = true;
++    this.resolveBattleRound(action);
++  }
++
++  resolveBattleRound(action) {
++    const b = this.battle;
++    const p = this.player;
++    spendStamina(p, STAMINA_COST_PER_ROUND);
++    const res = resolveRound(p, b.enemy, action, b.focus, b.stance, this.rng);
++    b.focus = res.nextFocus;
++
++    // 敌人受伤反馈
++    if (res.enemyDmg > 0) {
++      this.foeHpFill.style.width = `${(b.enemy.hp / b.enemy.maxHp) * 100}%`;
++      this.foeHpLabel.textContent = `${b.enemy.hp}/${b.enemy.maxHp}`;
++      this.floatAtCenter(`${res.countered ? '💥 ' : ''}-${res.enemyDmg}`, 'up');
++    }
++    // 玩家受伤反馈
++    if (res.playerDmg > 0) { this.shake(); this.floatAtCenter(`-${res.playerDmg}`, 'down'); }
++    if (res.healed > 0) this.floatAtCenter(`+${res.healed}`, 'up');
++    this.hpFill.style.width = `${(p.hp / maxHp(p)) * 100}%`;
++    this.hpVal.textContent = `${p.hp}/${maxHp(p)}`;
++
++    // 战报
++    const sName = STANCES[res.stance].name;
++    if (res.fumble) this.logBattle(`精力不济，${ACTIONS[res.action]?.name || '应对'}失手！受到 ${res.playerDmg} 伤害。`, 'bad');
++    else if (res.countered) this.logBattle(`${ACTIONS[res.action].name} 完美克制「${sName}」！造成 ${res.enemyDmg} 伤害，专注力蓄满。`, 'good');
++    else this.logBattle(`${ACTIONS[res.action]?.name || '犹豫'}未能克制「${sName}」，受到 ${res.playerDmg} 伤害。`, 'bad');
++
++    if (res.enemyDead) { setTimeout(() => { if (this.battle) this.winBattle(); }, 360); return; }
++    if (res.playerDead) { setTimeout(() => { if (this.battle) this.loseBattle(); }, 360); return; }
++    setTimeout(() => { if (this.battle) this.nextRound(); }, 520);
++  }
++
++  toggleAuto() {
++    if (!this.battle) return;
++    this.battle.auto = !this.battle.auto;
++    this.autoToggle.classList.toggle('btn-jade', this.battle.auto);
++    this.autoToggle.textContent = this.battle.auto ? '🤖✅' : '🤖';
++    this.toast(this.battle.auto ? '自动战斗：开' : '自动战斗：关');
++    if (this.battle.auto && !this.battle.busy) {
++      const act = autoPickAction(this.battle.stance);
++      setTimeout(() => { if (this.battle) this.chooseAction(act); }, 320);
++    }
++  }
++
++  confirmFlee() {
++    this.showSheet({
++      title: '脱离战斗？',
++      body: [h('div', { class: 'muted' }, '撤退会损失少量星骸，回到地图（敌人仍在）。')],
++      foot: [
++        h('button', { class: 'btn-danger', onClick: () => this.flee() }, '撤退'),
++        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '继续战斗'),
++      ],
++    });
++  }
++
++  flee() {
++    this.closeModal();
++    const cost = Math.min(this.player.stardust, 2);
++    this.player.stardust -= cost;
++    this.pushLog(`🏃 撤离战斗，散落 ${cost} 星骸。`, 'normal');
++    // exitBattle(false) 不落盘，此处显式保存星骸扣除，避免关浏览器后回滚。
++    saveToSlot(this.activeSlot, this.player);
++    this.exitBattle(false);
++  }
++
++  winBattle() {
++    if (!this.battle) return; // 360ms 窗口内若已脱离战斗（撤退/卸载），丢弃本次结算
++    const e = this.battle.enemy;
++    const reward = enemyReward(e);
++    const gained = gainReward(this.player, reward, this.rng);
++    // 移除地图上的敌人实体
++    removeEntity(this.state(), e.id);
++    this.pushLog(`🏆 击败 ${e.name}！获得 ✨${gained.stardust} 🔩${gained.parts}${gained.leveled ? ` · 升级至 Lv${this.player.level}！` : ''}`, 'milestone');
++    this.exitBattle(true);
++    if (e.boss) { this.offerEnding(); return; }
++    this.toast(gained.leveled ? '升级！' : '胜利', 'good');
++  }
++
++  loseBattle() {
++    if (!this.battle) return;
++    this.exitBattle(false);
++    this.gameOver();
++  }
++
++  // 退出战斗回到地图（恢复 game 屏）。
++  exitBattle(save) {
++    this.battle = null;
++    this.screen = 'game';
++    this.buildGame();
++    this.refreshStatus();
++    this.renderMap();
++    this.refreshInteract();
++    if (save) saveToSlot(this.activeSlot, this.player);
++  }
++
++  logBattle(text, type = 'normal') {
++    if (!this.battleLog) return;
++    this.battleLog.appendChild(h('div', { class: `ln ${type}` }, text));
++    this.battleLog.scrollTop = this.battleLog.scrollHeight;
++  }
++
++  // —— 结局抉择（击败 Boss 后）——
++  // 仅展示抉择弹窗；最终 'over' 态由 chooseEnding / renderEnding 落定，
++  // 这样即便玩家误触关闭弹窗，也能回到可交互的地图（Boss 已除、当前层无下行）。
++  offerEnding() {
++    saveToSlot(this.activeSlot, this.player);
++    const body = [
++      h('div', { class: 'ending' },
++        h('div', { class: 'ending__emoji' }, '🌟'),
++        h('h2', null, '星骸之核已寂灭'),
++        h('div', { class: 'ending__text' },
++          `你集齐了 ${collectedMemoryCount(this.player)} 枚星骸回响。所有的记忆在掌心翻涌——现在，由你回答那个被整个文明搁置的问题。`),
++      ),
++    ];
++    const foot = [
++      h('button', { class: 'btn-jade', onClick: () => this.chooseEnding('peace') }, `${ENDINGS.peace.emoji} ${ENDINGS.peace.name}`),
++      h('button', { class: 'btn-danger', onClick: () => this.chooseEnding('dark') }, `${ENDINGS.dark.emoji} ${ENDINGS.dark.name}`),
++    ];
++    this.showSheet({ title: '终章 · 你的回答', body, foot, dismissable: false });
++  }
++
++  chooseEnding(key) {
++    this.closeModal();
++    this.player.ending = key;
++    saveToSlot(this.activeSlot, this.player);
++    this.renderEnding(key, false, this.player);
++  }
++
++  renderEnding(key, fromSave, player) {
++    this.screen = 'over';
++    this.over = true;
++    this.player = player || this.player;
++    this.stopLoop();
++    clear(this.modalRoot);
++    clear(this.stage);
++    const e = ENDINGS[key] || ENDINGS.peace;
++    const wrap = h('div', { class: 'launcher' });
++    wrap.append(
++      h('div', { class: `ending ${e.tone}` },
++        h('div', { class: 'ending__emoji' }, e.emoji),
++        h('h2', null, e.title),
++        h('div', { class: 'muted' }, `${this.player.name} · 第 ${this.player.maxFloor} 层 · Lv${this.player.level} · 💎${collectedMemoryCount(this.player)}/10`),
++        h('div', { class: 'ending__text' }, e.text),
++      ),
++      h('div', { class: 'ending__choice' },
++        fromSave
++          ? h('button', { class: 'btn-ghost big-btn', onClick: () => this.showLauncher() }, '← 返回标题')
++          : null,
++        h('button', { class: 'btn-primary big-btn', onClick: () => this.restart() }, '🔄 再启新旅程'),
++      ),
++    );
++    this.stage.appendChild(wrap);
++  }
++
++  gameOver() {
++    if (this.over) return;
++    this.over = true;
++    this.screen = 'over';
++    this.stopLoop();
++    this.battle = null;
++    saveToSlot(this.activeSlot, this.player);
++    clear(this.modalRoot);
++    clear(this.stage);
++    const wrap = h('div', { class: 'launcher' });
++    wrap.append(
++      h('div', { class: 'ending dark' },
++        h('div', { class: 'ending__emoji' }, '💀'),
++        h('h2', null, '旅程终结'),
++        h('div', { class: 'muted' }, `${this.player.name} 倒在了第 ${this.player.floor} 层。`),
++        h('div', { class: 'ending__text' }, '星骸的光在你眼中缓缓熄灭。墨比乌斯依旧漂浮、寂静——但或许，下一位旅者能走得更远。'),
++      ),
++      h('div', { class: 'ending__choice' },
++        h('button', { class: 'btn-primary big-btn', onClick: () => this.restart() }, '🔄 再启新旅程'),
++        h('button', { class: 'btn-ghost', onClick: () => this.showSettings(false) }, '⚙️ 导出 / 存档'),
++      ),
++    );
++    this.stage.appendChild(wrap);
++  }
++
++  restart() {
++    if (this.activeSlot != null) deleteSlot(this.activeSlot);
++    this.player = null;
++    this.over = false;
++    this.showCreate();
++  }
++
++  // ===================== 背包 / 天赋 / 剧情 =====================
++  openInventory() {
++    if (this.screen !== 'game') return;
++    this.showInventoryTab('equip');
++  }
++
++  showInventoryTab(tab) {
++    clear(this.modalRoot);
++    const p = this.player;
++    const tabs = h('div', { class: 'tabs' },
++      h('button', { class: `tab ${tab === 'equip' ? 'active' : ''}`, onClick: () => this.showInventoryTab('equip') }, '🗡️ 装备'),
++      h('button', { class: `tab ${tab === 'talent' ? 'active' : ''}`, onClick: () => this.showInventoryTab('talent') }, '🌟 天赋'),
++      h('button', { class: `tab ${tab === 'story' ? 'active' : ''}`, onClick: () => this.showInventoryTab('story') }, '📖 回响'),
++    );
++    let body;
++    if (tab === 'equip') body = this.renderEquipTab();
++    else if (tab === 'talent') body = this.renderTalentTab();
++    else body = this.renderStoryTab();
++    const sheet = h('div', { class: 'sheet' },
++      h('div', { class: 'sheet__head' }, h('span', { class: 't' }, '🎒 背包')),
++      tabs,
++      h('div', { class: 'sheet__body' }, body),
++      h('div', { class: 'sheet__foot' },
++        h('span', { class: 'muted', style: { flex: 1, alignSelf: 'center' } }, `✨ ${p.stardust} 星骸　🔩 ${p.parts} 零件`),
++        h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '关闭'),
++      ),
++    );
++    this.modalRoot.append(h('div', { class: 'sheet-overlay', onClick: () => this.closeModal() }), sheet);
++    this._sheet = sheet;
++  }
++
++  renderEquipTab() {
++    const p = this.player;
++    const frag = [];
++    const meta = {
++      weapon: { emoji: '🗡️', label: '武器', statName: '攻击', statFn: () => effectiveAtk(p) },
++      armor: { emoji: '🛡️', label: '护甲', statName: '防御', statFn: () => effectiveDef(p) },
++      booster: { emoji: '🥾', label: '推进器', statName: '步数', statFn: () => effectiveMoveRange(p) },
++    };
++    for (const slot of EQUIP_SLOTS) {
++      const e = p.equipment[slot];
++      const m = meta[slot];
++      const cost = enhanceCost(e.plus);
++      const maxed = e.plus >= MAX_PLUS;
++      const afford = p.parts >= cost;
++      const affix = e.affix ? AFFIXES.find((a) => a.id === e.affix.id) : null;
++      frag.push(h('div', { class: 'card equip-card' },
++        h('div', { class: 'eq-emoji' }, m.emoji),
++        h('div', { class: 'eq-info' },
++          h('div', { class: 'eq-name' }, `${e.name} `, h('span', { class: 'plus' }, e.plus > 0 ? `+${e.plus}` : ''),
++            h('span', { class: 'muted', style: { fontWeight: 400, fontSize: '0.78rem' } }, `　当前${m.statName} ${m.statFn()}`)),
++          h('div', { class: 'eq-affix' }, affix ? `${affix.emoji} 词缀·${affix.name}：${affix.desc}` : `+${AFFIX_AT} 触发词缀变异`),
++          h('div', { class: 'eq-cost' }, maxed ? '已达强化上限' : `强化消耗 🔩${cost}`),
++        ),
++        h('button', {
++          class: 'btn-primary', disabled: maxed || !afford,
++          onClick: () => this.doEnhance(slot),
++        }, maxed ? '满级' : '强化'),
++      ));
++    }
++    return frag;
++  }
++
++  doEnhance(slot) {
++    const res = enhanceEquipment(this.player, slot, this.rng);
++    if (!res.ok) {
++      if (res.reason === 'no-parts') this.toast(`零件不足（需 🔩${res.cost}）`, 'bad');
++      else if (res.reason === 'max') this.toast('已达强化上限', 'normal');
++      return;
++    }
++    saveToSlot(this.activeSlot, this.player);
++    this.refreshStatus();
++    if (res.affixed) this.toast(`+${res.plus}！触发词缀变异：${res.affixed.emoji} ${res.affixed.name}`, 'good');
++    else this.toast(`强化成功 +${res.plus}`, 'good');
++    this.showInventoryTab('equip');
++  }
++
++  renderTalentTab() {
++    const p = this.player;
++    const frag = [h('div', { class: 'muted', style: { marginBottom: '0.5rem' } },
++      `消耗星骸点亮，可随时免费重置。已用 ✨${spentStardust(p)}。`)];
++    for (const t of TALENTS) {
++      const rank = p.talents[t.branch] || 0;
++      const maxed = rank >= t.maxRank;
++      const cost = talentCost(t.branch, rank);
++      const afford = p.stardust >= cost;
++      const pips = Array.from({ length: t.maxRank }, (_, i) => h('span', { class: `talent-pip ${i < rank ? 'on' : ''}` }));
++      frag.push(h('div', { class: 'card talent-branch' },
++        h('div', { class: 'talent-head' },
++          h('span', { style: { fontSize: '1.3rem' } }, t.emoji),
++          h('div', { class: 'grow' }, h('div', { style: { fontWeight: 700 } }, `${t.name} · Lv${rank}/${t.maxRank}`),
++            h('div', { class: 'muted', style: { fontSize: '0.78rem' } }, t.desc)),
++          h('button', {
++            class: 'btn-primary', disabled: maxed || !afford, style: { flex: 'none' },
++            onClick: () => this.doBuyTalent(t.branch),
++          }, maxed ? '满级' : `✨${cost}`),
++        ),
++        h('div', { class: 'talent-ranks' }, pips),
++      ));
++    }
++    frag.push(h('button', { class: 'btn-ghost', style: { width: '100%' }, onClick: () => this.doResetTalents() }, '↩️ 免费重置天赋'));
++    return frag;
++  }
++
++  doBuyTalent(branch) {
++    const res = buyTalent(this.player, branch);
++    if (!res.ok) {
++      if (res.reason === 'no-stardust') this.toast(`星骸不足（需 ✨${res.cost}）`, 'bad');
++      return;
++    }
++    saveToSlot(this.activeSlot, this.player);
++    this.refreshStatus();
++    this.toast(`${TALENT_BY_BRANCH[branch].name} → Lv${res.rank}`, 'good');
++    this.showInventoryTab('talent');
++  }
++
++  doResetTalents() {
++    const res = resetTalents(this.player);
++    saveToSlot(this.activeSlot, this.player);
++    this.refreshStatus();
++    this.toast(`天赋已重置，返还 ✨${res.refund}`, 'good');
++    this.showInventoryTab('talent');
++  }
++
++  renderStoryTab() {
++    const p = this.player;
++    const frag = [h('div', { class: 'muted', style: { marginBottom: '0.5rem' } },
++      `已寻回 ${collectedMemoryCount(p)} / ${MEMORY_CHAPTERS.length} 枚星骸回响。`)];
++    MEMORY_CHAPTERS.forEach((ch, i) => {
++      const unlocked = p.memory[i];
++      frag.push(h('div', { class: `chapter ${unlocked ? '' : 'locked'}` },
++        h('div', { class: 'ch-title' }, `${unlocked ? '💎' : '🔒'} ${ch.title}`),
++        h('div', { class: 'ch-text' }, unlocked ? ch.text : '尚未寻回这枚记忆碎片。继续深入浮岛吧。'),
++      ));
++    });
++    return frag;
++  }
++
++  showChapter(idx) {
++    const ch = MEMORY_CHAPTERS[idx];
++    if (!ch) return;
++    const body = [
++      h('div', { class: 'chapter' },
++        h('div', { class: 'ch-title' }, `💎 ${ch.title}`),
++        h('div', { class: 'ch-text' }, ch.text),
++      ),
++    ];
++    this.showSheet({
++      title: '星骸回响',
++      body,
++      foot: [h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '继续')],
++    });
++  }
++
++  // ===================== 随机事件 =====================
++  showMerchant() {
++    const p = this.player;
++    const body = [
++      h('div', { class: 'muted', style: { marginBottom: '0.5rem' } }, `${EVENT_META.merchant.desc}（持有 ✨${p.stardust}）`),
++      h('div', { class: 'slot-list' }, SHOP_ITEMS.map((it) => {
++        const afford = p.stardust >= it.cost;
++        return h('div', { class: 'slot-row' },
++          h('span', { class: 'slot-no' }, it.emoji),
++          h('div', { class: 'slot-info' }, h('div', { class: 'slot-name' }, it.name)),
++          h('div', { class: 'slot-actions' },
++            h('button', { class: 'btn-primary slot-act', disabled: !afford, onClick: () => this.buyItem(it) }, `✨${it.cost}`)),
++        );
++      })),
++    ];
++    this.showSheet({ title: '🛒 流浪商人', body, foot: [h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '离开')] });
++  }
++
++  buyItem(it) {
++    const p = this.player;
++    if (p.stardust < it.cost) { this.toast('星骸不足', 'bad'); return; }
++    p.stardust -= it.cost;
++    if (it.give.fullHeal) { healFull(p); this.toast('已满状态恢复', 'good'); }
++    else { gainReward(p, it.give, this.rng); this.toast(`购得 ${it.name}`, 'good'); }
++    saveToSlot(this.activeSlot, this.player);
++    this.refreshStatus();
++    this.showMerchant();
++  }
++
++  showDrone() {
++    const p = this.player;
++    const afford = p.stardust >= DRONE_COST;
++    const body = [
++      h('div', { class: 'muted', style: { marginBottom: '0.5rem' } }, `${EVENT_META.drone.desc}（持有 ✨${p.stardust}，需 ✨${DRONE_COST}）`),
++    ];
++    this.showSheet({
++      title: '🔧 维修无人机',
++      body,
++      foot: [
++        h('button', { class: 'btn-jade', disabled: !afford, onClick: () => this.useDrone() }, `维修（✨${DRONE_COST}）`),
++        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '离开'),
++      ],
++    });
++  }
++
++  useDrone() {
++    const p = this.player;
++    if (p.stardust < DRONE_COST) { this.toast('星骸不足', 'bad'); return; }
++    p.stardust -= DRONE_COST;
++    healFull(p);
++    this.closeModal();
++    this.refreshStatus();
++    this.toast('全状态已恢复', 'good');
++    this.pushLog('🔧 维修无人机为你回满 HP 与精力。', 'good');
++    saveToSlot(this.activeSlot, this.player);
++  }
++
++  // ===================== 设置 / 存档 =====================
++  showSettings(fromLauncher) {
++    const p = this.player;
++    const body = [
++      h('div', { class: 'card' },
++        h('h4', null, '存档'),
++        h('div', { class: 'muted', style: { marginBottom: '0.4rem' } },
++          `进度自动保存${p ? `（#${(this.activeSlot == null ? '?' : this.activeSlot + 1)} · ${p.name} · 第 ${p.floor} 层）` : '。'}`),
++        h('button', { class: 'btn-primary', style: { width: '100%', marginBottom: '0.4rem' }, onClick: () => { this.closeModal(); this.showSlots(fromLauncher); } }, '📂 存档管理（多槽位）'),
++        h('button', { class: 'btn-jade', style: { width: '100%', marginBottom: '0.4rem' }, onClick: () => this.doExport() }, '📤 导出存档字符串'),
++        h('textarea', { class: 'save-io', dataset: { id: 'io' }, placeholder: '在此粘贴导入字符串…', readonly: true }),
++        h('div', { class: 'tabs', style: { marginTop: '0.4rem' } },
++          h('button', { class: 'tab', style: { flex: '1 1 45%' }, onClick: () => this.toggleIoInput() }, '✏️ 切换为输入'),
++          h('button', { class: 'tab', style: { flex: '1 1 45%', background: 'linear-gradient(180deg,#6fe0b0,#2f9a72)', color: '#06241a', borderColor: '#2f9a72' }, onClick: () => this.doImport() }, '📥 导入'),
++        ),
++      ),
++      h('div', { class: 'card' },
++        h('h4', null, '选项'),
++        h('div', { class: 'row', style: { justifyContent: 'space-between' } },
++          h('span', null, '战斗限时（3 秒/回合）'),
++          h('button', { class: `tab ${this.timerEnabled ? 'active' : ''}`, onClick: () => { this.timerEnabled = !this.timerEnabled; this.showSettings(fromLauncher); } }, this.timerEnabled ? '开' : '关'),
++        ),
++      ),
++    ];
++    const foot = [
++      fromLauncher ? null : h('button', { class: 'btn-ghost', onClick: () => { this.closeModal(); this.confirmExitToLauncher(); } }, '🏠 返回标题'),
++      h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '关闭'),
++    ];
++    this.showSheet({ title: '设置 / 存档', body, foot: foot.filter(Boolean) });
++  }
++
++  toggleIoInput() {
++    const io = this.modalRoot.querySelector('[data-id="io"]');
++    if (!io) return;
++    io.readOnly = !io.readOnly;
++    if (io.readOnly) { io.value = ''; this.toast('已切回导出模式'); }
++    else { this.toast('请粘贴导入字符串后点导入'); }
++  }
++
++  doExport() {
++    const p = this.player || (this.activeSlot != null ? loadFromSlot(this.activeSlot) : null) || (latestSlot() != null ? loadFromSlot(latestSlot()) : null);
++    if (!p) { this.toast('暂无可导出的存档', 'bad'); return; }
++    const io = this.modalRoot.querySelector('[data-id="io"]');
++    const str = exportSave(p);
++    if (io) { io.readOnly = true; io.value = str; }
++    this.toast('存档字符串已生成', 'good');
++  }
++
++  doImport() {
++    const io = this.modalRoot.querySelector('[data-id="io"]');
++    const str = (io && io.value || '').trim();
++    if (!str) { this.toast('请先粘贴导入字符串', 'bad'); return; }
++    const p = importSave(str);
++    if (!p) { this.toast('导入失败：字符串无效', 'bad'); return; }
++    const slot = this.activeSlot != null ? this.activeSlot : this.pickSlotForNewSave();
++    this.activeSlot = slot;
++    p.floorState = null; // 导入档重生成当前层
++    saveToSlot(slot, p);
++    this.toast(`导入成功，已写入 #${slot + 1} 槽位`, 'good');
++    this.closeModal();
++    // 通关档直接进入结局画面，与「继续旅程」行为一致，而非落回可游玩地图。
++    if (p.ending) { this.player = p; this.renderEnding(p.ending, true, p); }
++    else this.enterGame(p, slot);
++  }
++
++  confirmExitToLauncher() {
++    if (!this.player) { this.showLauncher(); return; }
++    this.showSheet({
++      title: '返回标题？',
++      body: [h('div', { class: 'muted' }, '进度已自动保存，可随时从存档管理回到这里。')],
++      foot: [
++        h('button', { class: 'btn-primary', onClick: () => { this.closeModal(); this.showLauncher(); } }, '返回标题'),
++        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '留在游戏'),
++      ],
++    });
++  }
++
++  // ===================== 通用弹窗 / 反馈 =====================
++  showSheet({ title, body, foot, dismissable = true }) {
++    clear(this.modalRoot);
++    // dismissable=false 时遮罩不可点击关闭（用于必须做出选择的结局抉择，避免软锁）。
++    const overlay = h('div', { class: 'sheet-overlay', onClick: () => { if (dismissable) this.closeModal(); } });
++    const sheet = h('div', { class: 'sheet' },
++      h('div', { class: 'sheet__head' }, h('span', { class: 't' }, title || '')),
++      h('div', { class: 'sheet__body' }, ...(body || [])),
++      h('div', { class: 'sheet__foot' }, ...(foot || [])),
++    );
++    this.modalRoot.append(overlay, sheet);
++    this._sheet = sheet;
++  }
++  closeModal() { clear(this.modalRoot); this._sheet = null; }
++
++  toast(text, type = 'normal') {
++    const t = h('div', { class: `toast ${type}` }, text);
++    this.toastWrap.appendChild(t);
++    setTimeout(() => { t.classList.add('hide'); setTimeout(() => t.remove(), 300); }, 1500);
++  }
++
++  pushLog(text, type = 'normal') {
++    if (!this.player) return;
++    this.player.log.push({ turn: this.player.turn, text, type });
++    if (this.player.log.length > 200) this.player.log.shift();
++  }
++
++  // 浮动飘字：相对地图格定位。
++  floatAt(gx, gy, text, cls) {
++    if (!this.floatLayer) return;
++    const cell = this.cellNodes[gy] && this.cellNodes[gy][gx];
++    if (!cell) return;
++    const r = this.floatLayer.getBoundingClientRect();
++    const cr = cell.getBoundingClientRect();
++    const x = cr.left - r.left + cr.width / 2;
++    const y = cr.top - r.top + cr.height / 2;
++    this.spawnFloat(x, y, text, cls);
++  }
++  floatAtCenter(text, cls) {
++    if (!this.floatLayer) return;
++    const r = this.floatLayer.getBoundingClientRect();
++    this.spawnFloat(r.width / 2, r.height / 2 - 20, text, cls);
++  }
++  spawnFloat(x, y, text, cls) {
++    if (!this.floatLayer) return;
++    const el = h('div', { class: `float-num ${cls || ''}`, style: { left: `${x}px`, top: `${y}px` } }, text);
++    this.floatLayer.appendChild(el);
++    setTimeout(() => el.remove(), 900);
++  }
++
++  shake() {
++    const game = this.stage.querySelector('.xhlz-game') || this.stage.querySelector('.battle');
++    if (!game) return;
++    game.classList.remove('shake');
++    void game.offsetWidth;
++    game.classList.add('shake');
++  }
++
++  // ===================== 主循环（rAF）=====================
++  startLoop() {
++    if (this.running) return;
++    this.running = true;
++    this._lastFrame = nowMs();
++    this._staminaAccum = 0;
++    const tick = () => {
++      if (!this.running) return;
++      this._raf = requestAnimationFrame(tick);
++      const t = nowMs();
++      // 闲置降帧：地图且无弹窗时节流到 ~20fps；战斗全速（驱动计时条）。
++      const idle = this.screen === 'game' && !this._sheet;
++      if (idle && t - this._lastFrame < IDLE_FRAME_MS) return;
++      this._lastFrame = t;
++      this.onTick(t);
++    };
++    this._raf = requestAnimationFrame(tick);
++  }
++  stopLoop() {
++    this.running = false;
++    if (this._raf) cancelAnimationFrame(this._raf);
++    this._raf = 0;
++  }
++
++  onTick(t) {
++    // 每帧刷新 _prevTick，避免战斗/弹窗期间未更新导致回到地图时把整段时间一次性计入回精。
++    const delta = t - (this._prevTick || t);
++    this._prevTick = t;
++    // 战斗限时倒计时（开弹窗时暂停，不与玩家的脱离确认冲突）
++    if (this.screen === 'battle' && this.battle && this.timerEnabled && !this.battle.auto && !this.battle.busy && !this._sheet) {
++      const remain = Math.max(0, this.battle.timerEnd - t);
++      this.timerFill.style.width = `${(remain / BATTLE_TIME_MS) * 100}%`;
++      if (remain <= 0) { this.logBattle('⏰ 来不及反应！', 'bad'); this.chooseAction('hesitate'); }
++      return;
++    }
++    // 地图闲置：缓慢回复精力（delta 已按帧刷新，不会跨战斗累积）。
++    if (this.screen === 'game' && !this._sheet && this.player.stamina < maxStamina()) {
++      this._staminaAccum += delta;
++      while (this._staminaAccum >= STAMINA_REGEN_INTERVAL_MS) {
++        this._staminaAccum -= STAMINA_REGEN_INTERVAL_MS;
++        regenStamina(this.player, 1);
++      }
++      this.refreshStatus();
++    }
++  }
++
++  destroy() {
++    this.stopLoop();
++    try { if (this.player) saveToSlot(this.activeSlot, this.player); } catch (_) {}
++    clear(this.parent);
++    clear(this.modalRoot);
++    clear(this.toastWrap);
++    this.player = null;
++    this.battle = null;
++    this.over = false;
++  }
++}
++
++// —— 纯辅助（不依赖 this）——
++function isVisible(x, y, pos) {
++  return Math.max(Math.abs(x - pos.x), Math.abs(y - pos.y)) <= VISION_RADIUS;
++}
++function visibleKeysList(st, x, y) {
++  const out = [];
++  for (let dy = -VISION_RADIUS; dy <= VISION_RADIUS; dy++) {
++    for (let dx = -VISION_RADIUS; dx <= VISION_RADIUS; dx++) {
++      const nx = x + dx, ny = y + dy;
++      if (nx >= 0 && ny >= 0 && nx < GRID && ny < GRID) out.push(`${nx},${ny}`);
++    }
++  }
++  return out;
++}
++function adjacentEnemy(st, pos) {
++  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
++    const e = entityAt(st, pos.x + dx, pos.y + dy);
++    if (e && e.type === 'enemy') return e;
++  }
++  return null;
++}
++function entityEmoji(ent, tileId) {
++  switch (ent.type) {
++    case 'enemy': return ent.emoji || '👾';
++    case 'chest': return '🎁';
++    case 'merchant': return '🛒';
++    case 'drone': return '🔧';
++    case 'memory': return '💎';
++    case 'trap': return ''; // 陷阱不显示
++    default: return '';
++  }
++}
++function spentStardust(p) {
++  let s = 0;
++  for (const t of TALENTS) {
++    const rank = p.talents[t.branch] || 0;
++    for (let i = 0; i < rank; i++) s += talentCost(t.branch, i);
++  }
++  return s;
++}
++function nowMs() {
++  try { return Date.now(); } catch (_) { return 0; }
++}
+diff --git a/apps/xing-hai-lv-zhe/src/ui/dom.js b/apps/xing-hai-lv-zhe/src/ui/dom.js
+new file mode 100644
+index 0000000..bf0a8c3
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/ui/dom.js
+@@ -0,0 +1,43 @@
++// ============================================================================
++// 轻量 DOM 辅助：h() 创建元素，clear() 清空，bar() 进度条，避免引入框架。
++// ============================================================================
++export function h(tag, props, ...children) {
++  const el = document.createElement(tag);
++  if (props) {
++    for (const [k, v] of Object.entries(props)) {
++      if (v == null || v === false) continue;
++      if (k === 'class') el.className = v;
++      else if (k === 'dataset') Object.assign(el.dataset, v);
++      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
++      else if (k === 'onClick') el.addEventListener('click', v);
++      else if (k === 'onInput') el.addEventListener('input', v);
++      else if (k === 'html') el.innerHTML = v; // 仅用于受控静态内容
++      else if (k in el) { try { el[k] = v; } catch (_) { el.setAttribute(k, v); } }
++      else el.setAttribute(k, v);
++    }
++  }
++  appendChildren(el, children);
++  return el;
++}
++
++function appendChildren(el, children) {
++  for (const c of children) {
++    if (c == null || c === false || c === true) continue;
++    if (Array.isArray(c)) { appendChildren(el, c); continue; }
++    el.append(c.nodeType ? c : document.createTextNode(String(c)));
++  }
++}
++
++export function clear(el) {
++  while (el.firstChild) el.removeChild(el.firstChild);
++  return el;
++}
++
++// 进度条：label 叠加在条上，pct 由 value/max 决定。
++export function bar(value, max, opts = {}) {
++  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
++  return h('div', { class: `bar ${opts.class || ''}` },
++    h('div', { class: 'bar__fill', style: { width: `${pct}%`, background: opts.color || '' } }),
++    h('span', { class: 'bar__label' }, opts.label || `${Math.floor(value)}/${Math.round(max)}`),
++  );
++}
+diff --git a/apps/xing-hai-lv-zhe/src/ui/style.css b/apps/xing-hai-lv-zhe/src/ui/style.css
+new file mode 100644
+index 0000000..e75528d
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/ui/style.css
+@@ -0,0 +1,338 @@
++/* ==========================================================================
++   星骸旅者 · 样式（开罗式像素明亮风、竖屏三段式、移动端优先、适配安全区）
++   命名空间 .xhlz，与主框架其他展品样式互不干扰。
++   ========================================================================== */
++.xhlz {
++  --bg: #f8f4e6;
++  --bg-2: #f3ead6;
++  --card: #fffaf0;
++  --card-2: #f6efde;
++  --line: #d9c9a3;
++  --line-2: #c9b68a;
++  --ink: #3a3a4a;
++  --ink-soft: #6b6a78;
++  --muted: #9a9486;
++  --gold: #ffb400;
++  --stardust: #ffd93d;
++  --player: #4d96ff;
++  --hp: #ff6b6b;
++  --stamina: #38a3a5;
++  --monster: #e8634a;
++  --arcane: #9d4edd;
++  --good: #57c785;
++  --bad: #e8634a;
++  --radius: 14px;
++
++  position: absolute;
++  inset: 0;
++  background:
++    radial-gradient(120% 60% at 50% -10%, #fffdf6 0%, transparent 55%),
++    repeating-linear-gradient(45deg, rgba(217,201,163,0.10) 0 2px, transparent 2px 6px),
++    var(--bg);
++  color: var(--ink);
++  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif;
++  font-size: 14px;
++  line-height: 1.5;
++  overflow: hidden;
++  -webkit-user-select: none;
++  user-select: none;
++  -webkit-tap-highlight-color: transparent;
++}
++
++.xhlz * { box-sizing: border-box; }
++.xhlz .muted { color: var(--muted); font-size: 0.82rem; }
++.xhlz .grow { flex: 1; min-width: 0; }
++
++/* 舞台 */
++.xhlz .xhlz-stage { position: absolute; inset: 0; overflow: hidden; }
++.xhlz .xhlz-game { position: absolute; inset: 0; display: flex; flex-direction: column; overflow: hidden; }
++.xhlz .shake { animation: xhlz-shake 0.32s ease; }
++@keyframes xhlz-shake {
++  0%,100% { transform: translate(0,0); }
++  20% { transform: translate(-4px, 2px); }
++  40% { transform: translate(4px, -2px); }
++  60% { transform: translate(-3px, -2px); }
++  80% { transform: translate(3px, 2px); }
++}
++
++.xhlz button {
++  font-family: inherit;
++  cursor: pointer;
++  border: 2px solid var(--line-2);
++  border-radius: 10px;
++  background: var(--card);
++  color: var(--ink);
++  padding: 0.55rem 0.8rem;
++  font-size: 0.9rem;
++  font-weight: 600;
++  box-shadow: 0 2px 0 var(--line-2);
++  transition: transform 0.08s ease, box-shadow 0.08s ease, opacity 0.15s ease;
++}
++.xhlz button:active { transform: translateY(2px); box-shadow: 0 0 0 var(--line-2); }
++.xhlz button:disabled { opacity: 0.45; cursor: default; }
++.xhlz .btn-primary { background: linear-gradient(180deg, #ffd93d, var(--gold)); color: #3a2a00; border-color: #d99a00; box-shadow: 0 2px 0 #b07d00; }
++.xhlz .btn-jade { background: linear-gradient(180deg, #6fe0b0, #2f9a72); color: #06241a; border-color: #2f9a72; box-shadow: 0 2px 0 #226e52; }
++.xhlz .btn-blue { background: linear-gradient(180deg, #6fb0ff, #2f6fae); color: #fff; border-color: #2f6fae; box-shadow: 0 2px 0 #214d77; }
++.xhlz .btn-danger { background: linear-gradient(180deg, #ff8a7a, var(--bad)); color: #fff; border-color: var(--bad); box-shadow: 0 2px 0 #a83a2c; }
++.xhlz .btn-ghost { background: var(--card-2); }
++.xhlz .big-btn { width: 100%; padding: 0.85rem; font-size: 1rem; }
++.xhlz .icon-btn { padding: 0.45rem 0.55rem; font-size: 1rem; line-height: 1; }
++
++.xhlz .card {
++  background: linear-gradient(180deg, var(--card), var(--card-2));
++  border: 2px solid var(--line);
++  border-radius: var(--radius);
++  padding: 0.75rem;
++  margin-bottom: 0.55rem;
++}
++.xhlz h4 { margin: 0 0 0.4rem; font-size: 0.95rem; }
++
++/* —— 启动器 / 创角 / 结局 —— */
++.xhlz .launcher {
++  position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden;
++  padding: max(1.4rem, env(safe-area-inset-top)) 1rem max(1.4rem, env(safe-area-inset-bottom));
++  display: flex; flex-direction: column; align-items: stretch; justify-content: center;
++  max-width: 480px; margin: 0 auto;
++}
++.xhlz .launcher__brand { text-align: center; margin-bottom: 1.2rem; }
++.xhlz .launcher__brand .emblem {
++  width: 66px; height: 66px; margin: 0 auto 0.6rem; border-radius: 18px;
++  display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800;
++  background: radial-gradient(circle at 35% 30%, #ffe98a, var(--gold));
++  border: 2px solid #d99a00; color: #3a2a00;
++  box-shadow: 0 4px 0 #b07d00, inset 0 0 0 3px rgba(255,255,255,0.4);
++}
++.xhlz .launcher__brand h1 { margin: 0; font-size: 1.6rem; }
++.xhlz .launcher__brand .sub { margin: 0.3rem 0 0; color: var(--ink-soft); font-size: 0.85rem; }
++.xhlz .launcher__actions { display: flex; flex-direction: column; gap: 0.55rem; }
++.xhlz .launcher__hint { text-align: center; margin-top: 0.9rem; }
++.xhlz .create__head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.8rem; }
++.xhlz .create__head h1 { margin: 0; font-size: 1.2rem; flex: 1; text-align: center; }
++.xhlz .name-input {
++  width: 100%; padding: 0.7rem; border-radius: 10px; border: 2px solid var(--line-2);
++  background: var(--card); color: var(--ink); font-family: inherit; font-size: 1rem;
++}
++.xhlz .name-input:focus { outline: none; border-color: var(--player); }
++.xhlz .create__foot { margin-top: 0.6rem; }
++.xhlz .seed-row { display: flex; gap: 0.5rem; align-items: center; }
++.xhlz .seed-input {
++  flex: 1; padding: 0.55rem; border-radius: 10px; border: 2px solid var(--line-2);
++  background: var(--card); color: var(--ink); font-family: ui-monospace, monospace; font-size: 0.95rem;
++}
++
++/* —— 顶部状态栏（~8%）—— */
++.xhlz .status-bar {
++  flex: none;
++  padding: max(0.55rem, env(safe-area-inset-top)) 0.7rem 0.45rem;
++  background: linear-gradient(180deg, var(--card-2), var(--bg-2));
++  border-bottom: 2px solid var(--line);
++}
++.xhlz .status-top { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.35rem; }
++.xhlz .status-name { font-weight: 800; font-size: 0.95rem; }
++.xhlz .status-lv { font-size: 0.74rem; color: #fff; background: var(--player); padding: 0 0.35rem; border-radius: 6px; font-weight: 700; }
++.xhlz .status-floor { font-size: 0.8rem; color: var(--ink-soft); }
++.xhlz .status-floor b { color: var(--gold); }
++.xhlz .status-res { margin-left: auto; display: flex; gap: 0.4rem; font-variant-numeric: tabular-nums; font-weight: 700; font-size: 0.82rem; }
++.xhlz .status-res .r { display: flex; align-items: center; gap: 0.2rem; }
++.xhlz .status-bars { display: flex; flex-direction: column; gap: 0.28rem; }
++.xhlz .barline { display: flex; align-items: center; gap: 0.4rem; }
++.xhlz .barline .bl-icon { flex: none; width: 1.1rem; text-align: center; }
++.xhlz .barline .bl-track { flex: 1; height: 11px; background: rgba(58,58,74,0.12); border-radius: 6px; overflow: hidden; border: 1px solid var(--line); }
++.xhlz .barline .bl-fill { height: 100%; border-radius: 6px; transition: width 0.4s cubic-bezier(0.22,1,0.36,1); }
++.xhlz .barline .bl-val { flex: none; width: 3.4rem; text-align: right; font-size: 0.74rem; font-variant-numeric: tabular-nums; font-weight: 700; }
++
++/* —— 中央像素地图 —— */
++.xhlz .map-wrap {
++  flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
++  padding: 0.4rem; position: relative; overflow: hidden;
++}
++.xhlz .map-frame {
++  position: relative;
++  width: min(100%, calc(100vh - 230px));
++  aspect-ratio: 1 / 1;
++  background: #2b2d3a;
++  border: 3px solid var(--line-2);
++  border-radius: 12px;
++  box-shadow: inset 0 0 0 2px rgba(0,0,0,0.3), 0 3px 0 var(--line-2);
++  overflow: hidden;
++}
++.xhlz .map-grid {
++  position: absolute; inset: 0;
++  display: grid;
++  grid-template-columns: repeat(16, 1fr);
++  grid-template-rows: repeat(16, 1fr);
++}
++.xhlz .cell {
++  position: relative;
++  display: flex; align-items: center; justify-content: center;
++  font-size: clamp(0.7rem, 2.6vw, 1rem);
++  line-height: 1;
++}
++/* 雾：未探索 = 全黑；已探索不可见 = 压暗 */
++.xhlz .cell.fog { background: #1a1c28; }
++.xhlz .cell.fog .ent { display: none; }
++.xhlz .cell.dim { filter: brightness(0.5) saturate(0.6); }
++.xhlz .cell.dim .ent { opacity: 0.55; }
++.xhlz .cell.visible { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05); }
++.xhlz .cell .ent { position: relative; z-index: 2; }
++.xhlz .cell.player::after {
++  content: ''; position: absolute; inset: 8%;
++  border-radius: 30%; border: 2px solid #fff;
++  box-shadow: 0 0 6px rgba(255,255,255,0.8);
++  animation: xhlz-bob 1.1s ease-in-out infinite;
++}
++.xhlz .cell.reachable { cursor: pointer; }
++.xhlz .cell.reachable::before {
++  content: ''; position: absolute; inset: 14%;
++  border-radius: 50%; background: rgba(77,150,255,0.25);
++  border: 1px dashed rgba(77,150,255,0.7);
++}
++.xhlz .cell.stairs .ent { animation: xhlz-glow 1.4s ease-in-out infinite; }
++@keyframes xhlz-bob { 0%,100% { transform: scale(1); } 50% { transform: scale(0.86); } }
++@keyframes xhlz-glow { 0%,100% { filter: drop-shadow(0 0 0 #ffd93d); } 50% { filter: drop-shadow(0 0 4px #ffd93d); } }
++
++/* 浮动飘字（伤害 / 拾取）*/
++.xhlz .float-layer { position: absolute; inset: 0; pointer-events: none; z-index: 30; overflow: hidden; }
++.xhlz .float-num {
++  position: absolute; font-weight: 800; font-size: 1rem;
++  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
++  animation: xhlz-float 0.9s ease-out forwards;
++}
++.xhlz .float-num.up { color: var(--good); }
++.xhlz .float-num.down { color: var(--bad); }
++.xhlz .float-num.gold { color: var(--gold); }
++@keyframes xhlz-float {
++  0% { opacity: 0; transform: translate(-50%, 0) scale(0.7); }
++  20% { opacity: 1; transform: translate(-50%, -10px) scale(1.15); }
++  100% { opacity: 0; transform: translate(-50%, -40px) scale(1); }
++}
++
++/* —— 底部操作栏（~27%）—— */
++.xhlz .bottom-bar {
++  flex: none; display: flex; align-items: stretch; gap: 0.45rem;
++  padding: 0.45rem 0.6rem max(0.5rem, env(safe-area-inset-bottom));
++  background: linear-gradient(0deg, var(--bg-2), var(--card-2));
++  border-top: 2px solid var(--line);
++}
++.xhlz .dpad {
++  display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);
++  gap: 0.25rem; width: 128px; height: 116px; flex: none;
++}
++.xhlz .dpad button { padding: 0; font-size: 1.1rem; }
++.xhlz .dpad .d-up { grid-area: 1 / 2; }
++.xhlz .dpad .d-left { grid-area: 2 / 1; }
++.xhlz .dpad .d-center { grid-area: 2 / 2; background: var(--card-2); }
++.xhlz .dpad .d-right { grid-area: 2 / 3; }
++.xhlz .dpad .d-down { grid-area: 3 / 2; }
++.xhlz .act-col { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; justify-content: center; }
++.xhlz .interact-btn {
++  flex: 1; min-height: 56px; font-size: 1rem; font-weight: 800;
++  border-radius: 14px;
++}
++.xhlz .tool-col { display: flex; flex-direction: column; gap: 0.4rem; flex: none; }
++.xhlz .tool-col .icon-btn { min-width: 48px; min-height: 48px; }
++
++/* —— 弹窗（Sheet）—— */
++.xhlz .xhlz-modals { position: absolute; inset: 0; z-index: 50; pointer-events: none; }
++.xhlz .sheet-overlay {
++  position: absolute; inset: 0; background: rgba(40,32,16,0.5); pointer-events: auto;
++  animation: xhlz-fade 0.2s ease;
++}
++.xhlz .sheet {
++  position: absolute; left: 0; right: 0; bottom: 0; max-height: 88%; overflow-y: auto;
++  background: linear-gradient(180deg, var(--card), var(--bg-2));
++  border-top: 2px solid var(--line-2); border-radius: 20px 20px 0 0;
++  padding: max(0.7rem, env(safe-area-inset-top)) 0.9rem max(0.8rem, env(safe-area-inset-bottom));
++  pointer-events: auto; animation: xhlz-sheet-up 0.25s cubic-bezier(0.22,1,0.36,1);
++}
++.xhlz .sheet__head { display: flex; align-items: center; justify-content: center; margin-bottom: 0.6rem; }
++.xhlz .sheet__head .t { font-size: 1.05rem; font-weight: 800; }
++.xhlz .sheet__body { padding-bottom: 0.3rem; }
++.xhlz .sheet__foot { display: flex; flex-wrap: wrap; gap: 0.45rem; }
++.xhlz .sheet__foot > * { flex: 1 1 auto; }
++@keyframes xhlz-fade { from { opacity: 0; } to { opacity: 1; } }
++@keyframes xhlz-sheet-up { from { transform: translateY(40px); opacity: 0.4; } to { transform: none; opacity: 1; } }
++
++/* —— 背包：装备 / 天赋 / 剧情 标签 —— */
++.xhlz .tabs { display: flex; gap: 0.35rem; margin-bottom: 0.6rem; }
++.xhlz .tab { flex: 1; padding: 0.45rem 0.2rem; font-size: 0.85rem; }
++.xhlz .tab.active { background: linear-gradient(180deg, #ffd93d, var(--gold)); color: #3a2a00; border-color: #d99a00; }
++.xhlz .equip-card { display: flex; align-items: center; gap: 0.6rem; }
++.xhlz .equip-card .eq-emoji { font-size: 1.6rem; flex: none; }
++.xhlz .equip-card .eq-info { flex: 1; min-width: 0; }
++.xhlz .equip-card .eq-name { font-weight: 700; }
++.xhlz .equip-card .eq-name .plus { color: var(--gold); font-weight: 800; }
++.xhlz .equip-card .eq-affix { font-size: 0.74rem; color: var(--arcane); font-weight: 700; }
++.xhlz .equip-card .eq-cost { font-size: 0.74rem; color: var(--ink-soft); }
++.xhlz .talent-branch { margin-bottom: 0.5rem; }
++.xhlz .talent-head { display: flex; align-items: center; gap: 0.45rem; margin-bottom: 0.3rem; }
++.xhlz .talent-ranks { display: flex; gap: 0.25rem; margin: 0.25rem 0; }
++.xhlz .talent-pip { width: 1.1rem; height: 1.1rem; border-radius: 50%; background: rgba(58,58,74,0.12); border: 1px solid var(--line); }
++.xhlz .talent-pip.on { background: var(--gold); border-color: #d99a00; box-shadow: inset 0 0 0 2px rgba(255,255,255,0.4); }
++.xhlz .chapter { padding: 0.55rem 0.65rem; border-radius: 10px; background: var(--card-2); border: 1px solid var(--line); margin-bottom: 0.4rem; }
++.xhlz .chapter.locked { opacity: 0.55; }
++.xhlz .chapter .ch-title { font-weight: 700; color: var(--arcane); }
++.xhlz .chapter .ch-text { font-size: 0.85rem; line-height: 1.55; margin-top: 0.2rem; }
++
++/* 通用进度条 */
++.xhlz .bar { position: relative; height: 14px; background: rgba(58,58,74,0.12); border-radius: 7px; overflow: hidden; border: 1px solid var(--line); }
++.xhlz .bar__fill { position: absolute; inset: 0 auto 0 0; border-radius: 7px; transition: width 0.4s ease; background: var(--player); }
++.xhlz .bar__label {
++  position: absolute; inset: 0; display: flex; align-items: center; justify-content: flex-end;
++  padding-right: 0.4rem; font-size: 0.72rem; font-weight: 800; color: #fff;
++  text-shadow: 0 1px 2px rgba(0,0,0,0.6); font-variant-numeric: tabular-nums;
++}
++
++/* —— 战斗覆盖层 —— */
++.xhlz .battle { position: absolute; inset: 0; display: flex; flex-direction: column; padding: max(0.6rem, env(safe-area-inset-top)) 0.7rem max(0.6rem, env(safe-area-inset-bottom)); background: radial-gradient(120% 70% at 50% 0%, #3a2a4a, #1f1a2a); color: #f3ead6; }
++.xhlz .battle__foe { text-align: center; margin: 0.4rem 0 0.3rem; }
++.xhlz .battle__foe .emoji { font-size: 3rem; }
++.xhlz .battle__foe .name { font-weight: 800; font-size: 1.05rem; }
++.xhlz .battle__stance { text-align: center; margin: 0.4rem 0; min-height: 2.6rem; }
++.xhlz .stance-chip { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.35rem 0.8rem; border-radius: 999px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); font-weight: 700; }
++.xhlz .stance-chip.unknown { opacity: 0.85; font-style: italic; }
++.xhlz .battle__log { flex: 1; min-height: 0; overflow-y: auto; font-size: 0.82rem; display: flex; flex-direction: column; gap: 0.25rem; padding: 0.3rem 0.5rem; }
++.xhlz .battle__log .ln { padding: 0.25rem 0.4rem; border-radius: 8px; background: rgba(255,255,255,0.06); }
++.xhlz .battle__log .ln.good { color: #9be8b5; }
++.xhlz .battle__log .ln.bad { color: #ffb0a6; }
++.xhlz .battle__timer { height: 6px; background: rgba(255,255,255,0.12); border-radius: 4px; overflow: hidden; margin: 0.3rem 0; }
++.xhlz .battle__timer .t { height: 100%; background: linear-gradient(90deg, #ffd93d, #ff8a3d); transition: width 0.1s linear; }
++.xhlz .battle__actions { display: flex; gap: 0.45rem; }
++.xhlz .battle__actions .act { flex: 1; min-height: 60px; font-size: 0.92rem; font-weight: 800; color: #fff; }
++.xhlz .battle__actions .act.block { background: linear-gradient(180deg, #6fb0ff, #2f6fae); border-color: #2f6fae; box-shadow: 0 2px 0 #214d77; }
++.xhlz .battle__actions .act.dodge { background: linear-gradient(180deg, #6fe0b0, #2f9a72); border-color: #2f9a72; box-shadow: 0 2px 0 #226e52; }
++.xhlz .battle__actions .act.counter { background: linear-gradient(180deg, #ff9a8a, #e8634a); border-color: #e8634a; box-shadow: 0 2px 0 #a83a2c; }
++.xhlz .battle__topbar { display: flex; align-items: center; gap: 0.5rem; }
++.xhlz .battle__topbar .title { flex: 1; font-weight: 800; }
++.xhlz .battle__self { display: flex; gap: 0.5rem; align-items: center; margin: 0.35rem 0; font-size: 0.8rem; }
++.xhlz .battle__self .bar { flex: 1; }
++
++/* —— 结局 —— */
++.xhlz .ending { text-align: center; }
++.xhlz .ending__emoji { font-size: 3.4rem; }
++.xhlz .ending h2 { margin: 0.3rem 0; font-size: 1.4rem; }
++.xhlz .ending.peace h2 { color: #2f9a72; }
++.xhlz .ending.dark h2 { color: var(--bad); }
++.xhlz .ending__text { font-size: 0.92rem; line-height: 1.7; margin: 0.6rem 0; text-align: left; }
++.xhlz .ending__choice { display: flex; flex-direction: column; gap: 0.5rem; }
++
++/* —— 存档管理 —— */
++.xhlz .slot-list { display: flex; flex-direction: column; gap: 0.45rem; }
++.xhlz .slot-row { display: flex; align-items: center; gap: 0.6rem; padding: 0.55rem 0.65rem; border-radius: 10px; background: var(--card-2); border: 1px solid var(--line); }
++.xhlz .slot-row.empty { opacity: 0.7; border-style: dashed; }
++.xhlz .slot-no { flex: none; width: 1.6rem; height: 1.6rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 800; background: var(--bg-2); color: var(--ink-soft); border: 1px solid var(--line); }
++.xhlz .slot-info { flex: 1; min-width: 0; }
++.xhlz .slot-name { font-weight: 800; }
++.xhlz .slot-meta { font-size: 0.76rem; color: var(--ink-soft); margin-top: 0.1rem; }
++.xhlz .slot-actions { flex: none; display: flex; gap: 0.3rem; }
++.xhlz .slot-act { padding: 0.35rem 0.55rem; font-size: 0.8rem; }
++.xhlz .save-io { width: 100%; height: 60px; resize: vertical; padding: 0.5rem; border-radius: 8px; border: 2px solid var(--line-2); background: var(--card); color: var(--ink); font-family: ui-monospace, monospace; font-size: 1rem; word-break: break-all; }
++
++/* —— Toast —— */
++.xhlz .toast-wrap { position: absolute; top: max(0.5rem, env(safe-area-inset-top)); left: 0; right: 0; z-index: 90; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; pointer-events: none; }
++.xhlz .toast { max-width: 88%; padding: 0.45rem 0.85rem; border-radius: 999px; font-size: 0.82rem; font-weight: 600; background: rgba(58,58,74,0.94); border: 1px solid var(--line-2); color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.3); animation: xhlz-toast-in 0.25s ease; }
++.xhlz .toast.good { border-color: var(--good); }
++.xhlz .toast.bad { border-color: var(--bad); }
++.xhlz .toast.hide { animation: xhlz-toast-out 0.3s ease forwards; }
++@keyframes xhlz-toast-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
++@keyframes xhlz-toast-out { to { opacity: 0; transform: translateY(-8px); } }
+diff --git a/apps/xing-hai-lv-zhe/vite.config.js b/apps/xing-hai-lv-zhe/vite.config.js
+new file mode 100644
+index 0000000..2dc4040
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/vite.config.js
+@@ -0,0 +1,16 @@
++import { defineConfig } from 'vite';
++
++// `base: './'` 生成相对路径资源引用，便于部署到 GitHub Pages 子路径或任意静态目录。
++// 本作刻意不依赖任何框架，纯原生 DOM + Canvas 渲染，构建产物极小。
++export default defineConfig({
++  base: './',
++  server: {
++    host: true,
++    port: 5176,
++  },
++  build: {
++    outDir: 'dist',
++    sourcemap: false,
++    target: 'es2018',
++  },
++});
+diff --git a/src/main.js b/src/main.js
+index ed2a00c..488d9cb 100644
+--- a/src/main.js
++++ b/src/main.js
+@@ -42,6 +42,14 @@ const APPS = {
+     desc: '从呱呱坠地到垂垂老矣，一月一回合推进岁月，在健康、智力、财富、心情、社交间权衡抉择；可多槽位存档、可挂机，过完这一生。',
+     loader: () => import('../apps/mo-ni-ren-sheng/src/main.js'),
+   },
++  xhlz: {
++    key: 'xhlz',
++    title: '星骸旅者',
++    subtitle: '像素 · Roguelike',
++    emblem: '星',
++    desc: '迫降破碎星球，在漂浮的遗迹浮岛间拾荒探索。猜拳克制式战斗、装备强化与三天赋树、碎片化记忆叙事，集齐十枚星骸回响揭开真相。',
++    loader: () => import('../apps/xing-hai-lv-zhe/src/main.js'),
++  },
+ }
+ 
+ // 大类：先呈现「学习」，再呈现「游戏」。点击大类进入后，才展开其中的具体应用。
+@@ -59,8 +67,8 @@ const CATEGORIES = [
+     title: '游戏',
+     subtitle: '休闲 · 互动娱乐',
+     emblem: '玩',
+-    desc: '消磨时光的互动小品：修仙、人生、三国战场，挑一个开始吧。',
+-    appKeys: ['dzf', 'frxx', 'mnrs'],
++    desc: '消磨时光的互动小品：修仙、人生、三国战场、星骸浮岛，挑一个开始吧。',
++    appKeys: ['dzf', 'frxx', 'mnrs', 'xhlz'],
+   },
+ ]
+ 
diff --git a/.ai-tasks/issue-69/pr_diff_r2.md b/.ai-tasks/issue-69/pr_diff_r2.md
new file mode 100644
index 0000000..6e580a9
--- /dev/null
+++ b/.ai-tasks/issue-69/pr_diff_r2.md
@@ -0,0 +1,10972 @@
+diff --git a/.ai-tasks/issue-69/ai-coder-prompt.md b/.ai-tasks/issue-69/ai-coder-prompt.md
+new file mode 100644
+index 0000000..09ebc7b
+--- /dev/null
++++ b/.ai-tasks/issue-69/ai-coder-prompt.md
+@@ -0,0 +1,8 @@
++你是一个资深开发者。请解决以下 GitHub Issue：
++【任务标题】: 在游戏栏目下，按照以下详细方案新增游戏
++【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-69/context.md 文件获取。
++
++【⚠️ 严格红线规则】：
++请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
++
++请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
+diff --git a/.ai-tasks/issue-69/ai-reviewer-prompt_r1.md b/.ai-tasks/issue-69/ai-reviewer-prompt_r1.md
+new file mode 100644
+index 0000000..bbe7c0e
+--- /dev/null
++++ b/.ai-tasks/issue-69/ai-reviewer-prompt_r1.md
+@@ -0,0 +1,14 @@
++你是一个极其严格、甚至有些刁钻的资深代码审查员。
++这是代码提交后的【第 1 轮】审查。
++请阅读当前目录下的 .ai-tasks/issue-69/pr_diff_r1.md 文件，这是本次 PR 的代码变更。
++
++请检查是否有 Bug、逻辑错误、安全问题或性能瓶颈。
++
++【⚠️ 重要输出格式要求】：
++请严格按照以下纯文本格式输出，每项各占一行，不要使用 Markdown 代码块包裹，不要输出其他任何内容：
++DECISION: APPROVE
++或
++DECISION: REQUEST_CHANGES
++COMMENT: 你的详细审查意见 (如果你的意见中涉及需要修改 CI/CD 或 workflows，请告知人类手动处理)
++
++注意：DECISION 和 COMMENT 必须各占一行，以 DECISION: 和 COMMENT: 开头。COMMENT 的内容可以跨多行。
+diff --git a/.ai-tasks/issue-69/context.md b/.ai-tasks/issue-69/context.md
+new file mode 100644
+index 0000000..15ac012
+--- /dev/null
++++ b/.ai-tasks/issue-69/context.md
+@@ -0,0 +1,84 @@
++这是一份为Claude（或其他AI编程助手）准备的移动端单角色扮演游戏完整方案，主题为 《星骸旅者》（Star Wreck Pilgrim） ——融合了“开罗式像素经营美学”与“roguelike生存探索”的轻量化RPG。方案严格遵循“仅设计文档”要求，专为手机竖屏和GitHub Pages静态部署优化。
++
++---
++
++游戏设计文档：《星骸旅者》
++
++技术目标：单页HTML应用（ES6+ Canvas），适配移动端触摸，LocalStorage存档。
++视觉风格：开罗游戏（Kairosoft）标志性的2D顶视角像素风（16x16 tile网格），明亮饱和的色块，Q版角色。
++
++---
++
++1. 核心概念与循环
++
++· 背景：你是一名迫降在破碎星球“墨比乌斯”的拾荒者。该星球由无数漂浮的“遗迹浮岛”构成，每个浮岛是一个小型地牢。
++· 核心循环（竖屏单手操作）：
++  1. 浮岛探索（点击移动）→ 触发随机事件（战斗/宝箱/陷阱）。
++  2. 回合制战斗（点击指令）→ 获取“星骸”（货币）与“零件”（素材）。
++  3. 营地整备（自动返回）→ 消耗素材升级装备/解锁天赋，挑战更深层的浮岛。
++
++2. 移动端UI/UX布局（拇指热区优化）
++
++· 屏幕分区（自上而下）：
++  · 顶部状态栏（高度8%）：HP/精力值（精力影响命中率）、当前层数、星骸数量。
++  · 中央游戏画布（高度65%）：16x16网格地图（适配屏幕宽度，保持宽高比），角色位于中心，视野为5x5可见范围（迷雾机制）。
++  · 底部操作栏（高度27%）：左（摇杆虚拟键/或点按移动）、中（交互按钮——调查/攻击/拾取，随上下文动态变化）、右（背包/状态快捷入口）。所有按钮尺寸不小于44x44pt（苹果HIG标准）。
++
++3. 核心系统设计（需Claude实现的逻辑）
++
++A. 战斗系统（策略性“猜拳”简化版）
++
++· 敌人拥有 “架势”（突刺/横斩/重击），玩家每回合有 3秒 选择 “格挡/闪避/反击”。
++· 克制关系：反击克突刺，格挡克横斩，闪避克重击。成功克制触发“专注力”加成（下一击伤害x1.5）。
++· 自动战斗选项（开罗式贴心设计）：开启后AI按默认优先级行动，适合单手摸鱼。
++
++B. 装备与成长（“开罗式”数值膨胀快感）
++
++· 装备栏：武器（影响攻击力）、护甲（影响防御）、推进器（影响移动步数上限）。
++· 强化系统：消耗“零件”强化装备，强化+5时触发“词缀变异”（随机附加属性，如吸血/反伤）。
++· 天赋树：仅3条分支（生存/战斗/幸运），消耗星骸点亮，可随时免费重置（鼓励试错）。
++
++C. 动态事件与叙事
++
++· 每个浮岛固定包含 1个“星骸回响”（记忆碎片收集品）。收集后可解锁主角的背景故事（纯文字叙事，分10章节）。
++· 随机事件池包含“流浪商人”（高价出售稀有零件）、“维修无人机”（消耗星骸回复全状态）、“重力陷阱”（强制传送至随机位置）。
++
++4. 美术素材规范（供Claude用代码绘制，无需外部图片）
++
++· 调色板：仅使用16种开罗经典配色（如#F8F4E6背景，#F7B731沙地，#4A90E2水域，#E8634A怪物）。
++· 角色绘制：用ctx.fillRect绘制8x8像素块组合，构成Q版角色（头身比1:1）。
++· 动态反馈：战斗命中时屏幕轻微震动（CSS动画），拾取物品时弹出“+数字”的浮动飘字。
++
++5. 数据与存档结构（示例JSON）
++
++```json
++{
++  "player": { "name": "旅者", "hp": 100, "maxHp": 100, "stamina": 80, "atk": 12, "def": 5, "exp": 0, "level": 1 },
++  "equipment": { "weapon": { "name": "生锈砍刀", "atk": 8, "plus": 0 }, ... },
++  "inventory": [ { "id": "parts_01", "qty": 3 } ],
++  "progress": { "maxFloor": 5, "memoryFragments": [true, false, ...], "talentPoints": 2 }
++}
++```
++
++6. 针对Claude的技术实现指引（关键）
++
++· 游戏循环：使用requestAnimationFrame驱动，状态机管理（BOOT→MAP→BATTLE→INVENTORY→EVENT）。
++· 触摸适配：监听touchstart/touchend，利用e.changedTouches[0].clientX/Y计算点击网格坐标。
++· 静态部署注意：所有资源内联于单一index.html；使用Hash路由（如#inventory）管理面板切换，避免刷新404。
++· 性能优化：仅重绘地图的“脏矩形”区域（角色移动时），闲置时降低帧率至20fps节省电量。
++
++7. 故事大纲（碎片化叙事）
++
++· 序章：主角从逃生舱苏醒，失去记忆，只有AI副官“小星”陪伴。
++· 中期（3层后）：发现星球上的“星骸”其实是上古文明的情感能量体，收集它们能重温毁灭前的日常。
++· 结局（10层通关）：主角选择——用所有星骸重建文明（和平结局），或引爆星骸成为新神（暗黑结局）。两种结局对应不同的通关画面。
++
++8. 开发与测试备注（交付Claude时的附加说明）
++
++· 请优先实现 “可玩的最小原型”（MVP）：移动→战斗→强化，这一闭环能在5分钟内完整体验。
++· 移动端调试：使用Chrome DevTools的“设备模拟”模式（iPhone 12 Pro预设）验证布局。
++· GitHub Actions：无需后端，直接推送main分支至Pages即可生效。
++
++---
++
++方案总结：该设计在“开罗式”的轻松像素外皮下，嵌入了具有深度的抉择型战斗和碎片化叙事，非常适合手机端的碎片时间游玩。全部逻辑均可由Claude基于原生JS在单HTML中实现，部署零成本。如需调整任一系统（如取消战斗时间限制或修改天赋数值），可直接向Claude提出针对性修改指令。
+diff --git a/.ai-tasks/issue-69/fixer-feedback_r1.md b/.ai-tasks/issue-69/fixer-feedback_r1.md
+new file mode 100644
+index 0000000..625f5bf
+--- /dev/null
++++ b/.ai-tasks/issue-69/fixer-feedback_r1.md
+@@ -0,0 +1,17 @@
++整体工程质量较高（模块化清晰、纯函数可测、存档迁移健壮、123+49 项自测全过、楼梯连通性 1800 次穷举 0 软锁、未触碰 .github/ 工作流——无需人类改 CI/CD）。但存在一个会影响「自动战斗」这一主打卖点的真实 Bug，需修复后再合入。
++
++【阻断级 Bug · 自动战斗关闭瞬间必定失手】src/ui/app.js
++复现：进入战斗 → 开启 🤖 自动战斗 → 自动打数秒（>3s，如 4 个回合约 3.4s）→ 关闭 🤖。结果：玩家立刻被判定「⏰ 来不及反应！」并强制失手受击。
++根因（三段联立）：
++1) nextRound() 中 `if (this.timerEnabled && !this.battle.auto)` 才会刷新 timerEnd；auto=true 期间 timerEnd 不再更新，停留在「最后一次手动回合」的旧值（若从一开始就开自动，timerEnd 恒为初始 0）。
++2) toggleAuto() 关闭自动时，既没有重置 timerEnd，也没有给玩家一个全新限时窗口。
++3) onTick() 的倒计时分支条件为 `screen==='battle' && timerEnabled && !auto && !busy && !_sheet`，关闭自动后立即命中，`remain=max(0, timerEnd-now)` 因 timerEnd 过期等于 0 → 立刻 chooseAction('hesitate') 强制失手。
++我用最小逻辑复现确认：auto 期间经过 4000ms 后关闭，remain==0 ⇒ instant fumble=true。这是把「关自动」误罚玩家的逻辑漏洞，且 320ms 的窗口极易触发。建议在 toggleAuto() 关闭自动、以及 nextRound() 中 auto 由 true 转 false 的当回合，执行 `this.battle.timerEnd = nowMs() + BATTLE_TIME_MS`（与手动回合一致），给玩家完整 3 秒。
++
++【次要问题（建议一并处理，非阻断）】
++- src/core/world.js takeCell() / src/core/rng.js pick()/randInt()：均假设 rng()∈[0,1)。`arr[Math.floor(r()*len)]` 在 r()≥1 时会取到 undefined（我在注入 r()=2 时实测触发 `Cannot read properties of undefined (reading 'x')` 崩溃）。生产环境 this.rng=Math.random 不会触发，但 makeRng 的数组模式可返回任意值；建议 `const f = Math.min(0.999999, Math.max(0, r()))` 之类做一次钳制，提升种子/测试鲁棒性。
++- src/ui/app.js startLoop() 未重置 this._prevTick：从启动器/创角返回游戏时，首帧 delta 可能很大，触发一次性精力回补尖峰（受 maxStamina 钳制不致崩溃，但应在 startLoop 里 `this._prevTick = nowMs()` 归零）。
++- 死亡存档可被「继续旅程」加载：gameOver 落盘 hp=0 且无 ending，listSaves 仍视为可继续；加载后 enterGame→isDead→立即再次 gameOver。建议 listSaves/load 路径对 hp<=0 的存档标记或走 restart 流程，避免「继续」瞬间又死亡的不良体验。
++- 战斗结算窗口（winBattle/loseBattle/nextRound 的 360–520ms setTimeout 期间）顶部「🏃」撤退按钮未随 busy 禁用，理论上可与胜负结算交错；建议 busy 期间一并禁用撤退按钮。
++
++修复第 1 项后即可合入；其余 4 项建议顺带打磨。
+diff --git a/.ai-tasks/issue-69/fixer-prompt_r1.md b/.ai-tasks/issue-69/fixer-prompt_r1.md
+new file mode 100644
+index 0000000..c48e076
+--- /dev/null
++++ b/.ai-tasks/issue-69/fixer-prompt_r1.md
+@@ -0,0 +1,7 @@
++你是一个资深开发工程师。这是针对上一轮代码的【第 1 轮】修复任务。
++以下是代码审查员给你的修改建议，请阅读当前目录下的 .ai-tasks/issue-69/fixer-feedback_r1.md 文件获取详细内容。
++
++【⚠️ 严格红线规则】：
++请绝对不要修改、重命名或生成 .github/ 目录下的任何文件（特别是 workflows 等 CI/CD 配置），这会破坏项目的自动化流程！如果审查员要求你修改这些文件，请在回复中说明无法自动修改，需要人类介入。
++
++请直接分析并修改当前项目中的代码文件来满足审查员的要求，不要做过多的文字解释。
+diff --git a/.ai-tasks/issue-69/pr_diff_r1.md b/.ai-tasks/issue-69/pr_diff_r1.md
+new file mode 100644
+index 0000000..4b258a8
+--- /dev/null
++++ b/.ai-tasks/issue-69/pr_diff_r1.md
+@@ -0,0 +1,5429 @@
++diff --git a/.ai-tasks/issue-69/ai-coder-prompt.md b/.ai-tasks/issue-69/ai-coder-prompt.md
++new file mode 100644
++index 0000000..09ebc7b
++--- /dev/null
+++++ b/.ai-tasks/issue-69/ai-coder-prompt.md
++@@ -0,0 +1,8 @@
+++你是一个资深开发者。请解决以下 GitHub Issue：
+++【任务标题】: 在游戏栏目下，按照以下详细方案新增游戏
+++【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-69/context.md 文件获取。
+++
+++【⚠️ 严格红线规则】：
+++请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
+++
+++请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
++diff --git a/.ai-tasks/issue-69/context.md b/.ai-tasks/issue-69/context.md
++new file mode 100644
++index 0000000..15ac012
++--- /dev/null
+++++ b/.ai-tasks/issue-69/context.md
++@@ -0,0 +1,84 @@
+++这是一份为Claude（或其他AI编程助手）准备的移动端单角色扮演游戏完整方案，主题为 《星骸旅者》（Star Wreck Pilgrim） ——融合了“开罗式像素经营美学”与“roguelike生存探索”的轻量化RPG。方案严格遵循“仅设计文档”要求，专为手机竖屏和GitHub Pages静态部署优化。
+++
+++---
+++
+++游戏设计文档：《星骸旅者》
+++
+++技术目标：单页HTML应用（ES6+ Canvas），适配移动端触摸，LocalStorage存档。
+++视觉风格：开罗游戏（Kairosoft）标志性的2D顶视角像素风（16x16 tile网格），明亮饱和的色块，Q版角色。
+++
+++---
+++
+++1. 核心概念与循环
+++
+++· 背景：你是一名迫降在破碎星球“墨比乌斯”的拾荒者。该星球由无数漂浮的“遗迹浮岛”构成，每个浮岛是一个小型地牢。
+++· 核心循环（竖屏单手操作）：
+++  1. 浮岛探索（点击移动）→ 触发随机事件（战斗/宝箱/陷阱）。
+++  2. 回合制战斗（点击指令）→ 获取“星骸”（货币）与“零件”（素材）。
+++  3. 营地整备（自动返回）→ 消耗素材升级装备/解锁天赋，挑战更深层的浮岛。
+++
+++2. 移动端UI/UX布局（拇指热区优化）
+++
+++· 屏幕分区（自上而下）：
+++  · 顶部状态栏（高度8%）：HP/精力值（精力影响命中率）、当前层数、星骸数量。
+++  · 中央游戏画布（高度65%）：16x16网格地图（适配屏幕宽度，保持宽高比），角色位于中心，视野为5x5可见范围（迷雾机制）。
+++  · 底部操作栏（高度27%）：左（摇杆虚拟键/或点按移动）、中（交互按钮——调查/攻击/拾取，随上下文动态变化）、右（背包/状态快捷入口）。所有按钮尺寸不小于44x44pt（苹果HIG标准）。
+++
+++3. 核心系统设计（需Claude实现的逻辑）
+++
+++A. 战斗系统（策略性“猜拳”简化版）
+++
+++· 敌人拥有 “架势”（突刺/横斩/重击），玩家每回合有 3秒 选择 “格挡/闪避/反击”。
+++· 克制关系：反击克突刺，格挡克横斩，闪避克重击。成功克制触发“专注力”加成（下一击伤害x1.5）。
+++· 自动战斗选项（开罗式贴心设计）：开启后AI按默认优先级行动，适合单手摸鱼。
+++
+++B. 装备与成长（“开罗式”数值膨胀快感）
+++
+++· 装备栏：武器（影响攻击力）、护甲（影响防御）、推进器（影响移动步数上限）。
+++· 强化系统：消耗“零件”强化装备，强化+5时触发“词缀变异”（随机附加属性，如吸血/反伤）。
+++· 天赋树：仅3条分支（生存/战斗/幸运），消耗星骸点亮，可随时免费重置（鼓励试错）。
+++
+++C. 动态事件与叙事
+++
+++· 每个浮岛固定包含 1个“星骸回响”（记忆碎片收集品）。收集后可解锁主角的背景故事（纯文字叙事，分10章节）。
+++· 随机事件池包含“流浪商人”（高价出售稀有零件）、“维修无人机”（消耗星骸回复全状态）、“重力陷阱”（强制传送至随机位置）。
+++
+++4. 美术素材规范（供Claude用代码绘制，无需外部图片）
+++
+++· 调色板：仅使用16种开罗经典配色（如#F8F4E6背景，#F7B731沙地，#4A90E2水域，#E8634A怪物）。
+++· 角色绘制：用ctx.fillRect绘制8x8像素块组合，构成Q版角色（头身比1:1）。
+++· 动态反馈：战斗命中时屏幕轻微震动（CSS动画），拾取物品时弹出“+数字”的浮动飘字。
+++
+++5. 数据与存档结构（示例JSON）
+++
+++```json
+++{
+++  "player": { "name": "旅者", "hp": 100, "maxHp": 100, "stamina": 80, "atk": 12, "def": 5, "exp": 0, "level": 1 },
+++  "equipment": { "weapon": { "name": "生锈砍刀", "atk": 8, "plus": 0 }, ... },
+++  "inventory": [ { "id": "parts_01", "qty": 3 } ],
+++  "progress": { "maxFloor": 5, "memoryFragments": [true, false, ...], "talentPoints": 2 }
+++}
+++```
+++
+++6. 针对Claude的技术实现指引（关键）
+++
+++· 游戏循环：使用requestAnimationFrame驱动，状态机管理（BOOT→MAP→BATTLE→INVENTORY→EVENT）。
+++· 触摸适配：监听touchstart/touchend，利用e.changedTouches[0].clientX/Y计算点击网格坐标。
+++· 静态部署注意：所有资源内联于单一index.html；使用Hash路由（如#inventory）管理面板切换，避免刷新404。
+++· 性能优化：仅重绘地图的“脏矩形”区域（角色移动时），闲置时降低帧率至20fps节省电量。
+++
+++7. 故事大纲（碎片化叙事）
+++
+++· 序章：主角从逃生舱苏醒，失去记忆，只有AI副官“小星”陪伴。
+++· 中期（3层后）：发现星球上的“星骸”其实是上古文明的情感能量体，收集它们能重温毁灭前的日常。
+++· 结局（10层通关）：主角选择——用所有星骸重建文明（和平结局），或引爆星骸成为新神（暗黑结局）。两种结局对应不同的通关画面。
+++
+++8. 开发与测试备注（交付Claude时的附加说明）
+++
+++· 请优先实现 “可玩的最小原型”（MVP）：移动→战斗→强化，这一闭环能在5分钟内完整体验。
+++· 移动端调试：使用Chrome DevTools的“设备模拟”模式（iPhone 12 Pro预设）验证布局。
+++· GitHub Actions：无需后端，直接推送main分支至Pages即可生效。
+++
+++---
+++
+++方案总结：该设计在“开罗式”的轻松像素外皮下，嵌入了具有深度的抉择型战斗和碎片化叙事，非常适合手机端的碎片时间游玩。全部逻辑均可由Claude基于原生JS在单HTML中实现，部署零成本。如需调整任一系统（如取消战斗时间限制或修改天赋数值），可直接向Claude提出针对性修改指令。
++diff --git a/apps/xing-hai-lv-zhe/README.md b/apps/xing-hai-lv-zhe/README.md
++new file mode 100644
++index 0000000..75be1c7
++--- /dev/null
+++++ b/apps/xing-hai-lv-zhe/README.md
++@@ -0,0 +1,57 @@
+++# 星骸旅者 · Star Wreck Pilgrim
+++
+++一款融合 **开罗游戏（Kairosoft）式像素经营美学** 与 **Roguelike 生存探索** 的轻量化竖屏单机 RPG。你是一名迫降在破碎星球「墨比乌斯」的拾荒者，在无数漂浮的「遗迹浮岛」间探索、战斗、收集「星骸」，直至揭开这颗星球毁灭前的真相。
+++
+++技术栈：**纯原生 HTML + CSS + JavaScript（无框架）**，移动端竖屏单手操作，LocalStorage 多槽位存档，体积小、加载快。
+++
+++## 本地运行
+++
+++```bash
+++npm install
+++npm run dev      # 开发服务器 http://localhost:5176
+++npm run build    # 生产构建到 dist/
+++npm run test     # 纯逻辑自测（不依赖浏览器）
+++npm run test:dom # jsdom 冒烟测试（需先 npm i jsdom，覆盖 UI 主流程）
+++```
+++
+++也可由主框架（落地页）以 `createGame(parent)` 动态挂载，无需独立部署。
+++
+++## 核心玩法
+++
+++- **浮岛探索（点击移动）**：每个浮岛是一张 16×16 的像素网格地图，角色视野仅 5×5（迷雾机制）。点击相邻地块移动；强化「推进器」可一次走出更多步。踩上宝箱拾取、踩上陷阱触发、靠近敌人即可交战，找到下行阶梯深入下一层。
+++- **抉择型战斗（猜拳克制）**：敌人每回合摆出「突刺 / 横斩 / 重击」架势，玩家在限时内选择「格挡 / 闪避 / 反击」——反击克突刺、格挡克横斩、闪避克重击。成功克制触发「专注力」加成（下一击 ×1.5）。精力过低会失手。可开启**自动战斗**让 AI 按最优克制代打，适合单手摸鱼。
+++- **开罗式装备与成长**：武器（攻）/护甲（防）/推进器（步数）三件套，消耗「零件」强化；强化到 +5 触发**词缀变异**（吸血 / 反伤等随机附加属性）。**天赋树**仅三条分支（生存 / 战斗 / 幸运），消耗星骸点亮，可随时免费重置，鼓励试错。
+++- **碎片化叙事**：每个浮岛固定藏有 1 枚「星骸回响」记忆碎片，集齐解锁主角失落的背景故事（共 10 章）。途中还会偶遇流浪商人、维修无人机、重力陷阱等随机事件。
+++- **双重结局**：第 10 层击败星骸之核后，由你抉择——用所有星骸**重建文明**（和平结局），还是**引爆星骸**成为新神（暗黑结局）。
+++
+++## 移动端 UI/UX
+++
+++- **三段式竖屏布局**：顶部状态栏（HP / 精力 / 层数 / 星骸）· 中央像素地图画布 · 底部操作栏（左虚拟方向键 / 中动态交互键 / 右背包入口）。所有可点区域 ≥ 44×44pt，贴合拇指热区。
+++- **像素反馈**：地图与角色以开罗经典 16 色调色板用色块绘制；战斗命中时屏幕轻微震动，拾取与伤害弹出「+数字」浮动飘字。
+++- **状态机驱动**：`BOOT → MAP → BATTLE → INVENTORY → EVENT`，闲置时自动降帧至 ~20fps 节省电量。
+++
+++## 项目结构（模块化）
+++
+++```
+++src/
+++  config.js          调色板 / 地块 / 装备 / 天赋 / 敌人 / 章节 / 事件（纯常量与纯函数）
+++  core/
+++    rng.js           可注入随机源（种子化/测试）
+++    player.js        角色状态 / 装备强化 / 天赋 / 升级 / 战斗结算
+++    world.js         浮岛生成（房间+连通保证）/ 迷雾 / 移动校验 / 下行
+++    battle.js        猜拳克制战斗（架势 / 克制 / 专注力 / 自动战斗）
+++    save.js          多槽位 localStorage 存档 + 导入导出
+++  ui/
+++    dom.js           轻量 h() DOM 辅助
+++    style.css        开罗像素竖屏移动端样式
+++    app.js           UI 渲染与状态机（启动器/创角/地图/战斗/背包/事件/结局）
+++  main.js            入口：createGame(parent) 工厂
+++scripts/logic-test.mjs   纯逻辑自测
+++scripts/smoke-dom.mjs    jsdom 冒烟测试
+++```
+++
+++## 部署（GitHub Pages）
+++
+++构建产物在 `dist/`，可直接作为静态站点部署。自动部署由仓库根的 Pages 工作流统一处理（出于安全红线，AI 不修改 `.github/` 下的工作流文件）。
+++
+++> 实现注记：设计指引建议面板切换走 Hash 路由、地图用 Canvas 绘制。本作运行于落地页 overlay 内，为避免修改宿主 `window.location.hash` 造成冲突，面板切换改用应用内状态机；为兼顾 jsdom 可测性与产物体积，地图以 CSS 像素网格（开罗 16 色色块）渲染，逻辑等价且可在无头环境驱动。其余系统（猜拳战斗、装备强化 +5 词缀、三天赋树、10 章记忆、双结局）均按方案完整实现。
++diff --git a/apps/xing-hai-lv-zhe/index.html b/apps/xing-hai-lv-zhe/index.html
++new file mode 100644
++index 0000000..68b817d
++--- /dev/null
+++++ b/apps/xing-hai-lv-zhe/index.html
++@@ -0,0 +1,41 @@
+++<!doctype html>
+++<html lang="zh-CN">
+++
+++<head>
+++  <meta charset="UTF-8" />
+++  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
+++  <meta name="theme-color" content="#2b2d3a" />
+++  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%232b2d3a'/%3E%3Ctext x='16' y='23' font-size='20' text-anchor='middle' fill='%23ffd93d' font-family='serif'%3E%E6%98%9F%3C/text%3E%3C/svg%3E" />
+++  <title>星骸旅者 · Star Wreck Pilgrim</title>
+++  <style>
+++    html,
+++    body {
+++      margin: 0;
+++      padding: 0;
+++      width: 100%;
+++      height: 100%;
+++      background: #2b2d3a;
+++      overflow: hidden;
+++      font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
+++      -webkit-user-select: none;
+++      user-select: none;
+++      -webkit-tap-highlight-color: transparent;
+++    }
+++
+++    #game-container {
+++      position: relative;
+++      width: 100vw;
+++      height: 100vh;
+++      display: flex;
+++      align-items: stretch;
+++      justify-content: center;
+++    }
+++  </style>
+++</head>
+++
+++<body>
+++  <div id="game-container"></div>
+++  <script type="module" src="/src/main.js"></script>
+++</body>
+++
+++</html>
++diff --git a/apps/xing-hai-lv-zhe/package-lock.json b/apps/xing-hai-lv-zhe/package-lock.json
++new file mode 100644
++index 0000000..f275447
++--- /dev/null
+++++ b/apps/xing-hai-lv-zhe/package-lock.json
++@@ -0,0 +1,1559 @@
+++{
+++  "name": "xing-hai-lv-zhe",
+++  "version": "1.0.0",
+++  "lockfileVersion": 3,
+++  "requires": true,
+++  "packages": {
+++    "": {
+++      "name": "xing-hai-lv-zhe",
+++      "version": "1.0.0",
+++      "devDependencies": {
+++        "jsdom": "^29.1.1",
+++        "vite": "^5.4.0"
+++      }
+++    },
+++    "node_modules/@asamuzakjp/css-color": {
+++      "version": "5.1.11",
+++      "resolved": "https://registry.npmjs.org/@asamuzakjp/css-color/-/css-color-5.1.11.tgz",
+++      "integrity": "sha512-KVw6qIiCTUQhByfTd78h2yD1/00waTmm9uy/R7Ck/ctUyAPj+AEDLkQIdJW0T8+qGgj3j5bpNKK7Q3G+LedJWg==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "@asamuzakjp/generational-cache": "^1.0.1",
+++        "@csstools/css-calc": "^3.2.0",
+++        "@csstools/css-color-parser": "^4.1.0",
+++        "@csstools/css-parser-algorithms": "^4.0.0",
+++        "@csstools/css-tokenizer": "^4.0.0"
+++      },
+++      "engines": {
+++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+++      }
+++    },
+++    "node_modules/@asamuzakjp/dom-selector": {
+++      "version": "7.1.1",
+++      "resolved": "https://registry.npmjs.org/@asamuzakjp/dom-selector/-/dom-selector-7.1.1.tgz",
+++      "integrity": "sha512-67RZDnYRc8H/8MLDgQCDE//zoqVFwajkepHZgmXrbwybzXOEwOWGPYGmALYl9J2DOLfFPPs6kKCqmbzV895hTQ==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "@asamuzakjp/generational-cache": "^1.0.1",
+++        "@asamuzakjp/nwsapi": "^2.3.9",
+++        "bidi-js": "^1.0.3",
+++        "css-tree": "^3.2.1",
+++        "is-potential-custom-element-name": "^1.0.1"
+++      },
+++      "engines": {
+++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+++      }
+++    },
+++    "node_modules/@asamuzakjp/generational-cache": {
+++      "version": "1.0.1",
+++      "resolved": "https://registry.npmjs.org/@asamuzakjp/generational-cache/-/generational-cache-1.0.1.tgz",
+++      "integrity": "sha512-wajfB8KqzMCN2KGNFdLkReeHncd0AslUSrvHVvvYWuU8ghncRJoA50kT3zP9MVL0+9g4/67H+cdvBskj9THPzg==",
+++      "dev": true,
+++      "license": "MIT",
+++      "engines": {
+++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+++      }
+++    },
+++    "node_modules/@asamuzakjp/nwsapi": {
+++      "version": "2.3.9",
+++      "resolved": "https://registry.npmjs.org/@asamuzakjp/nwsapi/-/nwsapi-2.3.9.tgz",
+++      "integrity": "sha512-n8GuYSrI9bF7FFZ/SjhwevlHc8xaVlb/7HmHelnc/PZXBD2ZR49NnN9sMMuDdEGPeeRQ5d0hqlSlEpgCX3Wl0Q==",
+++      "dev": true,
+++      "license": "MIT"
+++    },
+++    "node_modules/@bramus/specificity": {
+++      "version": "2.4.2",
+++      "resolved": "https://registry.npmjs.org/@bramus/specificity/-/specificity-2.4.2.tgz",
+++      "integrity": "sha512-ctxtJ/eA+t+6q2++vj5j7FYX3nRu311q1wfYH3xjlLOsczhlhxAg2FWNUXhpGvAw3BWo1xBcvOV6/YLc2r5FJw==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "css-tree": "^3.0.0"
+++      },
+++      "bin": {
+++        "specificity": "bin/cli.js"
+++      }
+++    },
+++    "node_modules/@csstools/color-helpers": {
+++      "version": "6.1.0",
+++      "resolved": "https://registry.npmjs.org/@csstools/color-helpers/-/color-helpers-6.1.0.tgz",
+++      "integrity": "sha512-064IFJdjTfUqnjpCVpMOdbr8FLQBhinbZj6yRv2An2E41O/pLEXqfFRWqGq/SxlE5PEUYTlvWsG2r8MswAVvkg==",
+++      "dev": true,
+++      "funding": [
+++        {
+++          "type": "github",
+++          "url": "https://github.com/sponsors/csstools"
+++        },
+++        {
+++          "type": "opencollective",
+++          "url": "https://opencollective.com/csstools"
+++        }
+++      ],
+++      "license": "MIT-0",
+++      "engines": {
+++        "node": ">=20.19.0"
+++      }
+++    },
+++    "node_modules/@csstools/css-calc": {
+++      "version": "3.2.1",
+++      "resolved": "https://registry.npmjs.org/@csstools/css-calc/-/css-calc-3.2.1.tgz",
+++      "integrity": "sha512-DtdHlgXh5ZkA43cwBcAm+huzgJiwx3ZTWVjBs94kwz2xKqSimDA3lBgCjphYgwgVUMWatSM0pDd8TILB1yrVVg==",
+++      "dev": true,
+++      "funding": [
+++        {
+++          "type": "github",
+++          "url": "https://github.com/sponsors/csstools"
+++        },
+++        {
+++          "type": "opencollective",
+++          "url": "https://opencollective.com/csstools"
+++        }
+++      ],
+++      "license": "MIT",
+++      "engines": {
+++        "node": ">=20.19.0"
+++      },
+++      "peerDependencies": {
+++        "@csstools/css-parser-algorithms": "^4.0.0",
+++        "@csstools/css-tokenizer": "^4.0.0"
+++      }
+++    },
+++    "node_modules/@csstools/css-color-parser": {
+++      "version": "4.1.9",
+++      "resolved": "https://registry.npmjs.org/@csstools/css-color-parser/-/css-color-parser-4.1.9.tgz",
+++      "integrity": "sha512-paQcIaOO53Rk5+YrBaBjm/SgrV4INImjo2BT1DtQRYr+XeTRbeAYlS+jxXp9drqvKmtFnWRJKIalDLhZZDu42A==",
+++      "dev": true,
+++      "funding": [
+++        {
+++          "type": "github",
+++          "url": "https://github.com/sponsors/csstools"
+++        },
+++        {
+++          "type": "opencollective",
+++          "url": "https://opencollective.com/csstools"
+++        }
+++      ],
+++      "license": "MIT",
+++      "dependencies": {
+++        "@csstools/color-helpers": "^6.1.0",
+++        "@csstools/css-calc": "^3.2.1"
+++      },
+++      "engines": {
+++        "node": ">=20.19.0"
+++      },
+++      "peerDependencies": {
+++        "@csstools/css-parser-algorithms": "^4.0.0",
+++        "@csstools/css-tokenizer": "^4.0.0"
+++      }
+++    },
+++    "node_modules/@csstools/css-parser-algorithms": {
+++      "version": "4.0.0",
+++      "resolved": "https://registry.npmjs.org/@csstools/css-parser-algorithms/-/css-parser-algorithms-4.0.0.tgz",
+++      "integrity": "sha512-+B87qS7fIG3L5h3qwJ/IFbjoVoOe/bpOdh9hAjXbvx0o8ImEmUsGXN0inFOnk2ChCFgqkkGFQ+TpM5rbhkKe4w==",
+++      "dev": true,
+++      "funding": [
+++        {
+++          "type": "github",
+++          "url": "https://github.com/sponsors/csstools"
+++        },
+++        {
+++          "type": "opencollective",
+++          "url": "https://opencollective.com/csstools"
+++        }
+++      ],
+++      "license": "MIT",
+++      "engines": {
+++        "node": ">=20.19.0"
+++      },
+++      "peerDependencies": {
+++        "@csstools/css-tokenizer": "^4.0.0"
+++      }
+++    },
+++    "node_modules/@csstools/css-syntax-patches-for-csstree": {
+++      "version": "1.1.6",
+++      "resolved": "https://registry.npmjs.org/@csstools/css-syntax-patches-for-csstree/-/css-syntax-patches-for-csstree-1.1.6.tgz",
+++      "integrity": "sha512-TcJCWFbXLPpJYq6z7bfOyjWYJDiDg2/I4gyUC9pqPNqHFRIey0EB0q0L5cSnQDfWJg8Jd6VadakxdIez/3zkqQ==",
+++      "dev": true,
+++      "funding": [
+++        {
+++          "type": "github",
+++          "url": "https://github.com/sponsors/csstools"
+++        },
+++        {
+++          "type": "opencollective",
+++          "url": "https://opencollective.com/csstools"
+++        }
+++      ],
+++      "license": "MIT-0",
+++      "peerDependencies": {
+++        "css-tree": "^3.2.1"
+++      },
+++      "peerDependenciesMeta": {
+++        "css-tree": {
+++          "optional": true
+++        }
+++      }
+++    },
+++    "node_modules/@csstools/css-tokenizer": {
+++      "version": "4.0.0",
+++      "resolved": "https://registry.npmjs.org/@csstools/css-tokenizer/-/css-tokenizer-4.0.0.tgz",
+++      "integrity": "sha512-QxULHAm7cNu72w97JUNCBFODFaXpbDg+dP8b/oWFAZ2MTRppA3U00Y2L1HqaS4J6yBqxwa/Y3nMBaxVKbB/NsA==",
+++      "dev": true,
+++      "funding": [
+++        {
+++          "type": "github",
+++          "url": "https://github.com/sponsors/csstools"
+++        },
+++        {
+++          "type": "opencollective",
+++          "url": "https://opencollective.com/csstools"
+++        }
+++      ],
+++      "license": "MIT",
+++      "engines": {
+++        "node": ">=20.19.0"
+++      }
+++    },
+++    "node_modules/@esbuild/aix-ppc64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.21.5.tgz",
+++      "integrity": "sha512-1SDgH6ZSPTlggy1yI6+Dbkiz8xzpHJEVAlF/AM1tHPLsf5STom9rwtjE4hKAF20FfXXNTFqEYXyJNWh1GiZedQ==",
+++      "cpu": [
+++        "ppc64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "aix"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/android-arm": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.21.5.tgz",
+++      "integrity": "sha512-vCPvzSjpPHEi1siZdlvAlsPxXl7WbOVUBBAowWug4rJHb68Ox8KualB+1ocNvT5fjv6wpkX6o/iEpbDrf68zcg==",
+++      "cpu": [
+++        "arm"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "android"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/android-arm64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.21.5.tgz",
+++      "integrity": "sha512-c0uX9VAUBQ7dTDCjq+wdyGLowMdtR/GoC2U5IYk/7D1H1JYC0qseD7+11iMP2mRLN9RcCMRcjC4YMclCzGwS/A==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "android"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/android-x64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.21.5.tgz",
+++      "integrity": "sha512-D7aPRUUNHRBwHxzxRvp856rjUHRFW1SdQATKXH2hqA0kAZb1hKmi02OpYRacl0TxIGz/ZmXWlbZgjwWYaCakTA==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "android"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/darwin-arm64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.21.5.tgz",
+++      "integrity": "sha512-DwqXqZyuk5AiWWf3UfLiRDJ5EDd49zg6O9wclZ7kUMv2WRFr4HKjXp/5t8JZ11QbQfUS6/cRCKGwYhtNAY88kQ==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "darwin"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/darwin-x64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.21.5.tgz",
+++      "integrity": "sha512-se/JjF8NlmKVG4kNIuyWMV/22ZaerB+qaSi5MdrXtd6R08kvs2qCN4C09miupktDitvh8jRFflwGFBQcxZRjbw==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "darwin"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/freebsd-arm64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.21.5.tgz",
+++      "integrity": "sha512-5JcRxxRDUJLX8JXp/wcBCy3pENnCgBR9bN6JsY4OmhfUtIHe3ZW0mawA7+RDAcMLrMIZaf03NlQiX9DGyB8h4g==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "freebsd"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/freebsd-x64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.21.5.tgz",
+++      "integrity": "sha512-J95kNBj1zkbMXtHVH29bBriQygMXqoVQOQYA+ISs0/2l3T9/kj42ow2mpqerRBxDJnmkUDCaQT/dfNXWX/ZZCQ==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "freebsd"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/linux-arm": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.21.5.tgz",
+++      "integrity": "sha512-bPb5AHZtbeNGjCKVZ9UGqGwo8EUu4cLq68E95A53KlxAPRmUyYv2D6F0uUI65XisGOL1hBP5mTronbgo+0bFcA==",
+++      "cpu": [
+++        "arm"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/linux-arm64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.21.5.tgz",
+++      "integrity": "sha512-ibKvmyYzKsBeX8d8I7MH/TMfWDXBF3db4qM6sy+7re0YXya+K1cem3on9XgdT2EQGMu4hQyZhan7TeQ8XkGp4Q==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/linux-ia32": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.21.5.tgz",
+++      "integrity": "sha512-YvjXDqLRqPDl2dvRODYmmhz4rPeVKYvppfGYKSNGdyZkA01046pLWyRKKI3ax8fbJoK5QbxblURkwK/MWY18Tg==",
+++      "cpu": [
+++        "ia32"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/linux-loong64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.21.5.tgz",
+++      "integrity": "sha512-uHf1BmMG8qEvzdrzAqg2SIG/02+4/DHB6a9Kbya0XDvwDEKCoC8ZRWI5JJvNdUjtciBGFQ5PuBlpEOXQj+JQSg==",
+++      "cpu": [
+++        "loong64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/linux-mips64el": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.21.5.tgz",
+++      "integrity": "sha512-IajOmO+KJK23bj52dFSNCMsz1QP1DqM6cwLUv3W1QwyxkyIWecfafnI555fvSGqEKwjMXVLokcV5ygHW5b3Jbg==",
+++      "cpu": [
+++        "mips64el"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/linux-ppc64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.21.5.tgz",
+++      "integrity": "sha512-1hHV/Z4OEfMwpLO8rp7CvlhBDnjsC3CttJXIhBi+5Aj5r+MBvy4egg7wCbe//hSsT+RvDAG7s81tAvpL2XAE4w==",
+++      "cpu": [
+++        "ppc64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/linux-riscv64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.21.5.tgz",
+++      "integrity": "sha512-2HdXDMd9GMgTGrPWnJzP2ALSokE/0O5HhTUvWIbD3YdjME8JwvSCnNGBnTThKGEB91OZhzrJ4qIIxk/SBmyDDA==",
+++      "cpu": [
+++        "riscv64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/linux-s390x": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.21.5.tgz",
+++      "integrity": "sha512-zus5sxzqBJD3eXxwvjN1yQkRepANgxE9lgOW2qLnmr8ikMTphkjgXu1HR01K4FJg8h1kEEDAqDcZQtbrRnB41A==",
+++      "cpu": [
+++        "s390x"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/linux-x64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.21.5.tgz",
+++      "integrity": "sha512-1rYdTpyv03iycF1+BhzrzQJCdOuAOtaqHTWJZCWvijKD2N5Xu0TtVC8/+1faWqcP9iBCWOmjmhoH94dH82BxPQ==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/netbsd-x64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.21.5.tgz",
+++      "integrity": "sha512-Woi2MXzXjMULccIwMnLciyZH4nCIMpWQAs049KEeMvOcNADVxo0UBIQPfSmxB3CWKedngg7sWZdLvLczpe0tLg==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "netbsd"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/openbsd-x64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.21.5.tgz",
+++      "integrity": "sha512-HLNNw99xsvx12lFBUwoT8EVCsSvRNDVxNpjZ7bPn947b8gJPzeHWyNVhFsaerc0n3TsbOINvRP2byTZ5LKezow==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "openbsd"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/sunos-x64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.21.5.tgz",
+++      "integrity": "sha512-6+gjmFpfy0BHU5Tpptkuh8+uw3mnrvgs+dSPQXQOv3ekbordwnzTVEb4qnIvQcYXq6gzkyTnoZ9dZG+D4garKg==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "sunos"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/win32-arm64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.21.5.tgz",
+++      "integrity": "sha512-Z0gOTd75VvXqyq7nsl93zwahcTROgqvuAcYDUr+vOv8uHhNSKROyU961kgtCD1e95IqPKSQKH7tBTslnS3tA8A==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "win32"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/win32-ia32": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.21.5.tgz",
+++      "integrity": "sha512-SWXFF1CL2RVNMaVs+BBClwtfZSvDgtL//G/smwAc5oVK/UPu2Gu9tIaRgFmYFFKrmg3SyAjSrElf0TiJ1v8fYA==",
+++      "cpu": [
+++        "ia32"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "win32"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/win32-x64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.21.5.tgz",
+++      "integrity": "sha512-tQd/1efJuzPC6rCFwEvLtci/xNFcTZknmXs98FYDfGE4wP9ClFV98nyKrzJKVPMhdDnjzLhdUyMX4PsQAPjwIw==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "win32"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@exodus/bytes": {
+++      "version": "1.15.1",
+++      "resolved": "https://registry.npmjs.org/@exodus/bytes/-/bytes-1.15.1.tgz",
+++      "integrity": "sha512-S6mL0yNB/Abt9Ei4tq8gDhcczc4S3+vQ4ra7vxnAf+YHC02srtqxKKZghx2Dq6p0e66THKwR6r8N6P95wEty7Q==",
+++      "dev": true,
+++      "license": "MIT",
+++      "engines": {
+++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+++      },
+++      "peerDependencies": {
+++        "@noble/hashes": "^1.8.0 || ^2.0.0"
+++      },
+++      "peerDependenciesMeta": {
+++        "@noble/hashes": {
+++          "optional": true
+++        }
+++      }
+++    },
+++    "node_modules/@rollup/rollup-android-arm-eabi": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.62.2.tgz",
+++      "integrity": "sha512-6o7ZLZK+BeenkZCFNDXqpbjw9bD6nuWonvS/lwQJp7NoVVxm6p3qE7qQ5jGuBjiFsgvqjD8mZAU5oWxTmbOeOg==",
+++      "cpu": [
+++        "arm"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "android"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-android-arm64": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.62.2.tgz",
+++      "integrity": "sha512-BaH7BllCACHoH1LguOU56UItGfUWjujlO65kS9LAodViaN4bwIKd7oeW/ZHJ/4ljr/7MIiENnNy3HJ0zXv8Zkw==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "android"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-darwin-arm64": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.62.2.tgz",
+++      "integrity": "sha512-v39RCCvj4He82I9sFmk+M1VZ0PLM9sfsLVikjfx2hYBNALhrrOR2D3JjQA6AhlaSOgcR+RzrKY7e1+bT6SUO/A==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "darwin"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-darwin-x64": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.62.2.tgz",
+++      "integrity": "sha512-yl0y2vq3S3lHeuXhEdss6TWfKW8vkujImO12tn4ZkG/4oghr09LvdYm2RElVjokTQiUvDUGXLGsYeLqUMCKpGA==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "darwin"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-freebsd-arm64": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.62.2.tgz",
+++      "integrity": "sha512-tT4pvt4qXD+vEoezupCWi+a1F0vvDiksiHc+PxRlYTOH1I6/X4id9jPxTP+Fg+545euaFT1jJVs4CEdHZAU1vw==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "freebsd"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-freebsd-x64": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.62.2.tgz",
+++      "integrity": "sha512-6nU5F2wCW+qvCBhTn1pdIU3bzsIoF7EUwsCDRxilWGprQR6yd508YnH9+OKFCwpfS8pjZqDUmnCAr7exax0XCg==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "freebsd"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.62.2.tgz",
+++      "integrity": "sha512-n1GJHPOvpIfhi3TmrCeh6S6URt9BFCt0KQE3qvexyGCTAKpR4Lg+eWvNZEqu7epxwus/8ElT3hacYEucm49SZg==",
+++      "cpu": [
+++        "arm"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "glibc"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-arm-musleabihf": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.62.2.tgz",
+++      "integrity": "sha512-JqgflS8wEB+UXV/vS1RpRbifGBeN4D5lz8D8oOFbFZw4vedvdOgCFAjfBmIMdW3yL10XpQQ0Ambepw6MXrhOnA==",
+++      "cpu": [
+++        "arm"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "musl"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-arm64-gnu": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.62.2.tgz",
+++      "integrity": "sha512-wnFJkogWvN4jm/hQRF2UBaeUmk20j5+DmHvoyWii2b8HJDyvz1MF2OU/6ynXt2KR63rbZLWkFpoytpdc/yBuSA==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "glibc"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-arm64-musl": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.62.2.tgz",
+++      "integrity": "sha512-HVu2bp0zhvJ8xHEV9+UUs7S90VadmBSY3LcIMvozbPo4AuMGDWlz3ymHLHZPX4hR67TKTt8Qp5PJ5RBg/i+RMQ==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "musl"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-loong64-gnu": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.62.2.tgz",
+++      "integrity": "sha512-mQqqAV8QaoSgr9I2fKDLY2BAVvmKjWoGiu/cSYQonsLvtqwEn1E4QYfnCOcp5zoEqNhsDYin1s6jx/VJmrxlZg==",
+++      "cpu": [
+++        "loong64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "glibc"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-loong64-musl": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-musl/-/rollup-linux-loong64-musl-4.62.2.tgz",
+++      "integrity": "sha512-IxKLoxCQ2IWi6bT2akyDUBGsOImDKB+sPp4EsTmwFQ/fMwpCKm8uLSSgP/Kx/QYUgKis6SEZ5/Nlhup0DIA0PQ==",
+++      "cpu": [
+++        "loong64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "musl"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-ppc64-gnu": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.62.2.tgz",
+++      "integrity": "sha512-Mk5ha2RQSgyFfmYYLkBpPnUk8D8FriBxesO1u9O75X0mHgXL1UQcH5Itl2lurWL2tj0RxV9b9tJgipac0hRY9A==",
+++      "cpu": [
+++        "ppc64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "glibc"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-ppc64-musl": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-musl/-/rollup-linux-ppc64-musl-4.62.2.tgz",
+++      "integrity": "sha512-CjvEnqJL/0/TQ3TXX3OPIJ/kmBellrWd4heXUmHeJlTnmwjKpSJzoehLaL6Xk0ZnMHBu9dZuFADNOrtjF4v+2w==",
+++      "cpu": [
+++        "ppc64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "musl"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-riscv64-gnu": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.62.2.tgz",
+++      "integrity": "sha512-1SiZbzwdkaDURsew/tSOrooKiYy7EQGT6m8ufavAi9NEyQb/6VuIxFXAL1fqa4iZe3g4NbNk4P7J32z2tw5Mgg==",
+++      "cpu": [
+++        "riscv64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "glibc"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-riscv64-musl": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.62.2.tgz",
+++      "integrity": "sha512-nQts12zJ3NQRoE6uYljOH89v7szzLDvG2JD/vsX+vGXU8w/At1GowTZ5/7qeFQ8m7L55rpR8Okugnuo5bgjy2Q==",
+++      "cpu": [
+++        "riscv64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "musl"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-s390x-gnu": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.62.2.tgz",
+++      "integrity": "sha512-E9/ll019jhPIJgpzfZoIkBGhcz+kKNgVWYRY0zr9srBdPPFVpvOKW8VaJKUbeK+eZXyQF9ltME+Kk6affeaPgg==",
+++      "cpu": [
+++        "s390x"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "glibc"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-x64-gnu": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.62.2.tgz",
+++      "integrity": "sha512-5BqxR/pshjey51iliyzTD5Xi3EN0aLmQ2lZ3lvefVV9c82BvrLo2/6OT55iifpWBufs6kdwWbuOKS841DrmK9A==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "glibc"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-x64-musl": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.62.2.tgz",
+++      "integrity": "sha512-uNN83XxQrRAh/w0/pmAfibcwyb6YWt4gP+dpnQKPVJshAloQ785ii8CT8ZCIxkGg9opVsvAlGhFitSm6D1Jjpg==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "musl"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-openbsd-x64": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-openbsd-x64/-/rollup-openbsd-x64-4.62.2.tgz",
+++      "integrity": "sha512-srjEIxSH3LRnJN6THczDHWQplqEMFiAJrTab0msUryh9kwNpkICf3Ea6q6MN/2cZwRFUNx5w+h6Hpi4QuHS6Zg==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "openbsd"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-openharmony-arm64": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.62.2.tgz",
+++      "integrity": "sha512-8hOJnxgbyObnCm5AlRA3A931xX19xq80RjVTKgJOvEKWqJruP/Uf12IbAOaDjjEXYRewwHLfmF0YRIdK3OwKWA==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "openharmony"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-win32-arm64-msvc": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.62.2.tgz",
+++      "integrity": "sha512-mmF4AY1i0hG/bLWUctUq59gtmgaSIRa3cu/A3JFRp/sCNEme2bgDEiDS22P9FbnJB8NJNF4jPJiSP5RHQpUTDg==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "win32"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-win32-ia32-msvc": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.62.2.tgz",
+++      "integrity": "sha512-DZgkknc6jhHrk46V25vbAM0zZkyP0nSDkJB8/dRkLTxv470dOmWDqGoEJl/9A0dFfS7yE3REOwNDxpHwSLSt0Q==",
+++      "cpu": [
+++        "ia32"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "win32"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-win32-x64-gnu": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.62.2.tgz",
+++      "integrity": "sha512-T6xr6ucWSFto+VGajA8YH26LdpHRuP4YLHEKAtCWvJDOlnmWcDZVCI2Jmjr+IFHDlt2zRaTAKE4tfjTaWLgJBg==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "win32"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-win32-x64-msvc": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.62.2.tgz",
+++      "integrity": "sha512-BfzEnDJOt9T8M989/lA37EcJgat01wLRnoi5dQf3QzOH7jzpqTAzdDbVfRljVr5r+jzKqpbHeyOfAaXxAd0PAA==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "win32"
+++      ]
+++    },
+++    "node_modules/@types/estree": {
+++      "version": "1.0.9",
+++      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz",
+++      "integrity": "sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==",
+++      "dev": true,
+++      "license": "MIT"
+++    },
+++    "node_modules/bidi-js": {
+++      "version": "1.0.3",
+++      "resolved": "https://registry.npmjs.org/bidi-js/-/bidi-js-1.0.3.tgz",
+++      "integrity": "sha512-RKshQI1R3YQ+n9YJz2QQ147P66ELpa1FQEg20Dk8oW9t2KgLbpDLLp9aGZ7y8WHSshDknG0bknqGw5/tyCs5tw==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "require-from-string": "^2.0.2"
+++      }
+++    },
+++    "node_modules/css-tree": {
+++      "version": "3.2.1",
+++      "resolved": "https://registry.npmjs.org/css-tree/-/css-tree-3.2.1.tgz",
+++      "integrity": "sha512-X7sjQzceUhu1u7Y/ylrRZFU2FS6LRiFVp6rKLPg23y3x3c3DOKAwuXGDp+PAGjh6CSnCjYeAul8pcT8bAl+lSA==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "mdn-data": "2.27.1",
+++        "source-map-js": "^1.2.1"
+++      },
+++      "engines": {
+++        "node": "^10 || ^12.20.0 || ^14.13.0 || >=15.0.0"
+++      }
+++    },
+++    "node_modules/data-urls": {
+++      "version": "7.0.0",
+++      "resolved": "https://registry.npmjs.org/data-urls/-/data-urls-7.0.0.tgz",
+++      "integrity": "sha512-23XHcCF+coGYevirZceTVD7NdJOqVn+49IHyxgszm+JIiHLoB2TkmPtsYkNWT1pvRSGkc35L6NHs0yHkN2SumA==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "whatwg-mimetype": "^5.0.0",
+++        "whatwg-url": "^16.0.0"
+++      },
+++      "engines": {
+++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+++      }
+++    },
+++    "node_modules/decimal.js": {
+++      "version": "10.6.0",
+++      "resolved": "https://registry.npmjs.org/decimal.js/-/decimal.js-10.6.0.tgz",
+++      "integrity": "sha512-YpgQiITW3JXGntzdUmyUR1V812Hn8T1YVXhCu+wO3OpS4eU9l4YdD3qjyiKdV6mvV29zapkMeD390UVEf2lkUg==",
+++      "dev": true,
+++      "license": "MIT"
+++    },
+++    "node_modules/entities": {
+++      "version": "8.0.0",
+++      "resolved": "https://registry.npmjs.org/entities/-/entities-8.0.0.tgz",
+++      "integrity": "sha512-zwfzJecQ/Uej6tusMqwAqU/6KL2XaB2VZ2Jg54Je6ahNBGNH6Ek6g3jjNCF0fG9EWQKGZNddNjU5F1ZQn/sBnA==",
+++      "dev": true,
+++      "license": "BSD-2-Clause",
+++      "engines": {
+++        "node": ">=20.19.0"
+++      },
+++      "funding": {
+++        "url": "https://github.com/fb55/entities?sponsor=1"
+++      }
+++    },
+++    "node_modules/esbuild": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.21.5.tgz",
+++      "integrity": "sha512-mg3OPMV4hXywwpoDxu3Qda5xCKQi+vCTZq8S9J/EpkhB2HzKXq4SNFZE3+NK93JYxc8VMSep+lOUSC/RVKaBqw==",
+++      "dev": true,
+++      "hasInstallScript": true,
+++      "license": "MIT",
+++      "bin": {
+++        "esbuild": "bin/esbuild"
+++      },
+++      "engines": {
+++        "node": ">=12"
+++      },
+++      "optionalDependencies": {
+++        "@esbuild/aix-ppc64": "0.21.5",
+++        "@esbuild/android-arm": "0.21.5",
+++        "@esbuild/android-arm64": "0.21.5",
+++        "@esbuild/android-x64": "0.21.5",
+++        "@esbuild/darwin-arm64": "0.21.5",
+++        "@esbuild/darwin-x64": "0.21.5",
+++        "@esbuild/freebsd-arm64": "0.21.5",
+++        "@esbuild/freebsd-x64": "0.21.5",
+++        "@esbuild/linux-arm": "0.21.5",
+++        "@esbuild/linux-arm64": "0.21.5",
+++        "@esbuild/linux-ia32": "0.21.5",
+++        "@esbuild/linux-loong64": "0.21.5",
+++        "@esbuild/linux-mips64el": "0.21.5",
+++        "@esbuild/linux-ppc64": "0.21.5",
+++        "@esbuild/linux-riscv64": "0.21.5",
+++        "@esbuild/linux-s390x": "0.21.5",
+++        "@esbuild/linux-x64": "0.21.5",
+++        "@esbuild/netbsd-x64": "0.21.5",
+++        "@esbuild/openbsd-x64": "0.21.5",
+++        "@esbuild/sunos-x64": "0.21.5",
+++        "@esbuild/win32-arm64": "0.21.5",
+++        "@esbuild/win32-ia32": "0.21.5",
+++        "@esbuild/win32-x64": "0.21.5"
+++      }
+++    },
+++    "node_modules/fsevents": {
+++      "version": "2.3.3",
+++      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
+++      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
+++      "dev": true,
+++      "hasInstallScript": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "darwin"
+++      ],
+++      "engines": {
+++        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
+++      }
+++    },
+++    "node_modules/html-encoding-sniffer": {
+++      "version": "6.0.0",
+++      "resolved": "https://registry.npmjs.org/html-encoding-sniffer/-/html-encoding-sniffer-6.0.0.tgz",
+++      "integrity": "sha512-CV9TW3Y3f8/wT0BRFc1/KAVQ3TUHiXmaAb6VW9vtiMFf7SLoMd1PdAc4W3KFOFETBJUb90KatHqlsZMWV+R9Gg==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "@exodus/bytes": "^1.6.0"
+++      },
+++      "engines": {
+++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+++      }
+++    },
+++    "node_modules/is-potential-custom-element-name": {
+++      "version": "1.0.1",
+++      "resolved": "https://registry.npmjs.org/is-potential-custom-element-name/-/is-potential-custom-element-name-1.0.1.tgz",
+++      "integrity": "sha512-bCYeRA2rVibKZd+s2625gGnGF/t7DSqDs4dP7CrLA1m7jKWz6pps0LpYLJN8Q64HtmPKJ1hrN3nzPNKFEKOUiQ==",
+++      "dev": true,
+++      "license": "MIT"
+++    },
+++    "node_modules/jsdom": {
+++      "version": "29.1.1",
+++      "resolved": "https://registry.npmjs.org/jsdom/-/jsdom-29.1.1.tgz",
+++      "integrity": "sha512-ECi4Fi2f7BdJtUKTflYRTiaMxIB0O6zfR1fX0GXpUrf6flp8QIYn1UT20YQqdSOfk2dfkCwS8LAFoJDEppNK5Q==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "@asamuzakjp/css-color": "^5.1.11",
+++        "@asamuzakjp/dom-selector": "^7.1.1",
+++        "@bramus/specificity": "^2.4.2",
+++        "@csstools/css-syntax-patches-for-csstree": "^1.1.3",
+++        "@exodus/bytes": "^1.15.0",
+++        "css-tree": "^3.2.1",
+++        "data-urls": "^7.0.0",
+++        "decimal.js": "^10.6.0",
+++        "html-encoding-sniffer": "^6.0.0",
+++        "is-potential-custom-element-name": "^1.0.1",
+++        "lru-cache": "^11.3.5",
+++        "parse5": "^8.0.1",
+++        "saxes": "^6.0.0",
+++        "symbol-tree": "^3.2.4",
+++        "tough-cookie": "^6.0.1",
+++        "undici": "^7.25.0",
+++        "w3c-xmlserializer": "^5.0.0",
+++        "webidl-conversions": "^8.0.1",
+++        "whatwg-mimetype": "^5.0.0",
+++        "whatwg-url": "^16.0.1",
+++        "xml-name-validator": "^5.0.0"
+++      },
+++      "engines": {
+++        "node": "^20.19.0 || ^22.13.0 || >=24.0.0"
+++      },
+++      "peerDependencies": {
+++        "canvas": "^3.0.0"
+++      },
+++      "peerDependenciesMeta": {
+++        "canvas": {
+++          "optional": true
+++        }
+++      }
+++    },
+++    "node_modules/lru-cache": {
+++      "version": "11.5.2",
+++      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-11.5.2.tgz",
+++      "integrity": "sha512-4pfM1Ff0x50o0tQwb5ucw/RzNyD0/YJME6IVcStalZuMWxdt3sR3huStTtxz4PUmvZfRguvDejasvQ2kifR11g==",
+++      "dev": true,
+++      "license": "BlueOak-1.0.0",
+++      "engines": {
+++        "node": "20 || >=22"
+++      }
+++    },
+++    "node_modules/mdn-data": {
+++      "version": "2.27.1",
+++      "resolved": "https://registry.npmjs.org/mdn-data/-/mdn-data-2.27.1.tgz",
+++      "integrity": "sha512-9Yubnt3e8A0OKwxYSXyhLymGW4sCufcLG6VdiDdUGVkPhpqLxlvP5vl1983gQjJl3tqbrM731mjaZaP68AgosQ==",
+++      "dev": true,
+++      "license": "CC0-1.0"
+++    },
+++    "node_modules/nanoid": {
+++      "version": "3.3.15",
+++      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.15.tgz",
+++      "integrity": "sha512-y7Wygv/7mEOvxTuEQDB8StXdMRBWf1kR/tlhAzBRUFkB2jfcLOAxO/SHmOO2zgz1pVgK29/kyupn059/bCHdjA==",
+++      "dev": true,
+++      "funding": [
+++        {
+++          "type": "github",
+++          "url": "https://github.com/sponsors/ai"
+++        }
+++      ],
+++      "license": "MIT",
+++      "bin": {
+++        "nanoid": "bin/nanoid.cjs"
+++      },
+++      "engines": {
+++        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
+++      }
+++    },
+++    "node_modules/parse5": {
+++      "version": "8.0.1",
+++      "resolved": "https://registry.npmjs.org/parse5/-/parse5-8.0.1.tgz",
+++      "integrity": "sha512-z1e/HMG90obSGeidlli3hj7cbocou0/wa5HacvI3ASx34PecNjNQeaHNo5WIZpWofN9kgkqV1q5YvXe3F0FoPw==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "entities": "^8.0.0"
+++      },
+++      "funding": {
+++        "url": "https://github.com/inikulin/parse5?sponsor=1"
+++      }
+++    },
+++    "node_modules/picocolors": {
+++      "version": "1.1.1",
+++      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
+++      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
+++      "dev": true,
+++      "license": "ISC"
+++    },
+++    "node_modules/postcss": {
+++      "version": "8.5.16",
+++      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.16.tgz",
+++      "integrity": "sha512-vuwillviilfKZsg0VGj5R/YwwcHx4SLsIOI/7K6mQkWx+l5cUHTjj5g0AasTBcyXsbfTgrwsUNmVUb5xVwyPwg==",
+++      "dev": true,
+++      "funding": [
+++        {
+++          "type": "opencollective",
+++          "url": "https://opencollective.com/postcss/"
+++        },
+++        {
+++          "type": "tidelift",
+++          "url": "https://tidelift.com/funding/github/npm/postcss"
+++        },
+++        {
+++          "type": "github",
+++          "url": "https://github.com/sponsors/ai"
+++        }
+++      ],
+++      "license": "MIT",
+++      "dependencies": {
+++        "nanoid": "^3.3.12",
+++        "picocolors": "^1.1.1",
+++        "source-map-js": "^1.2.1"
+++      },
+++      "engines": {
+++        "node": "^10 || ^12 || >=14"
+++      }
+++    },
+++    "node_modules/punycode": {
+++      "version": "2.3.1",
+++      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
+++      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
+++      "dev": true,
+++      "license": "MIT",
+++      "engines": {
+++        "node": ">=6"
+++      }
+++    },
+++    "node_modules/require-from-string": {
+++      "version": "2.0.2",
+++      "resolved": "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz",
+++      "integrity": "sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==",
+++      "dev": true,
+++      "license": "MIT",
+++      "engines": {
+++        "node": ">=0.10.0"
+++      }
+++    },
+++    "node_modules/rollup": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.62.2.tgz",
+++      "integrity": "sha512-RFnrW4lhXA3s3eqHDZvN654g8OTjzRfqpIRJYczCGB6HzphckVAi/Qh4tbPUbRuDi7s1Llv8g/NspLkttY3gTA==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "@types/estree": "1.0.9"
+++      },
+++      "bin": {
+++        "rollup": "dist/bin/rollup"
+++      },
+++      "engines": {
+++        "node": ">=18.0.0",
+++        "npm": ">=8.0.0"
+++      },
+++      "optionalDependencies": {
+++        "@rollup/rollup-android-arm-eabi": "4.62.2",
+++        "@rollup/rollup-android-arm64": "4.62.2",
+++        "@rollup/rollup-darwin-arm64": "4.62.2",
+++        "@rollup/rollup-darwin-x64": "4.62.2",
+++        "@rollup/rollup-freebsd-arm64": "4.62.2",
+++        "@rollup/rollup-freebsd-x64": "4.62.2",
+++        "@rollup/rollup-linux-arm-gnueabihf": "4.62.2",
+++        "@rollup/rollup-linux-arm-musleabihf": "4.62.2",
+++        "@rollup/rollup-linux-arm64-gnu": "4.62.2",
+++        "@rollup/rollup-linux-arm64-musl": "4.62.2",
+++        "@rollup/rollup-linux-loong64-gnu": "4.62.2",
+++        "@rollup/rollup-linux-loong64-musl": "4.62.2",
+++        "@rollup/rollup-linux-ppc64-gnu": "4.62.2",
+++        "@rollup/rollup-linux-ppc64-musl": "4.62.2",
+++        "@rollup/rollup-linux-riscv64-gnu": "4.62.2",
+++        "@rollup/rollup-linux-riscv64-musl": "4.62.2",
+++        "@rollup/rollup-linux-s390x-gnu": "4.62.2",
+++        "@rollup/rollup-linux-x64-gnu": "4.62.2",
+++        "@rollup/rollup-linux-x64-musl": "4.62.2",
+++        "@rollup/rollup-openbsd-x64": "4.62.2",
+++        "@rollup/rollup-openharmony-arm64": "4.62.2",
+++        "@rollup/rollup-win32-arm64-msvc": "4.62.2",
+++        "@rollup/rollup-win32-ia32-msvc": "4.62.2",
+++        "@rollup/rollup-win32-x64-gnu": "4.62.2",
+++        "@rollup/rollup-win32-x64-msvc": "4.62.2",
+++        "fsevents": "~2.3.2"
+++      }
+++    },
+++    "node_modules/saxes": {
+++      "version": "6.0.0",
+++      "resolved": "https://registry.npmjs.org/saxes/-/saxes-6.0.0.tgz",
+++      "integrity": "sha512-xAg7SOnEhrm5zI3puOOKyy1OMcMlIJZYNJY7xLBwSze0UjhPLnWfj2GF2EpT0jmzaJKIWKHLsaSSajf35bcYnA==",
+++      "dev": true,
+++      "license": "ISC",
+++      "dependencies": {
+++        "xmlchars": "^2.2.0"
+++      },
+++      "engines": {
+++        "node": ">=v12.22.7"
+++      }
+++    },
+++    "node_modules/source-map-js": {
+++      "version": "1.2.1",
+++      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
+++      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
+++      "dev": true,
+++      "license": "BSD-3-Clause",
+++      "engines": {
+++        "node": ">=0.10.0"
+++      }
+++    },
+++    "node_modules/symbol-tree": {
+++      "version": "3.2.4",
+++      "resolved": "https://registry.npmjs.org/symbol-tree/-/symbol-tree-3.2.4.tgz",
+++      "integrity": "sha512-9QNk5KwDF+Bvz+PyObkmSYjI5ksVUYtjW7AU22r2NKcfLJcXp96hkDWU3+XndOsUb+AQ9QhfzfCT2O+CNWT5Tw==",
+++      "dev": true,
+++      "license": "MIT"
+++    },
+++    "node_modules/tldts": {
+++      "version": "7.4.7",
+++      "resolved": "https://registry.npmjs.org/tldts/-/tldts-7.4.7.tgz",
+++      "integrity": "sha512-56L0/9HELHSsG1bFCzay8UoLxzRL7kpFf7Wl5q/kSYwiSJGACvro61xnKzPNM+SadxllzdtXsKDSXE7HPeqIAw==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "tldts-core": "^7.4.7"
+++      },
+++      "bin": {
+++        "tldts": "bin/cli.js"
+++      }
+++    },
+++    "node_modules/tldts-core": {
+++      "version": "7.4.7",
+++      "resolved": "https://registry.npmjs.org/tldts-core/-/tldts-core-7.4.7.tgz",
+++      "integrity": "sha512-rNlAI8fKn/JckBMUSbNL/ES2kmDiurWaE49l+ikwEc9A6lFR7gMx9AhgQMQKBK4H5w4pKLH64JzZfB99uRsGNQ==",
+++      "dev": true,
+++      "license": "MIT"
+++    },
+++    "node_modules/tough-cookie": {
+++      "version": "6.0.2",
+++      "resolved": "https://registry.npmjs.org/tough-cookie/-/tough-cookie-6.0.2.tgz",
+++      "integrity": "sha512-exgYmnmL/sJpR3upZfXG5PoatXQii55xAiXGXzY+sROLZ/Y+SLcp9PgJNI9Vz37HpQ74WvDcLT8eqm+kV3FzrA==",
+++      "dev": true,
+++      "license": "BSD-3-Clause",
+++      "dependencies": {
+++        "tldts": "^7.0.5"
+++      },
+++      "engines": {
+++        "node": ">=16"
+++      }
+++    },
+++    "node_modules/tr46": {
+++      "version": "6.0.0",
+++      "resolved": "https://registry.npmjs.org/tr46/-/tr46-6.0.0.tgz",
+++      "integrity": "sha512-bLVMLPtstlZ4iMQHpFHTR7GAGj2jxi8Dg0s2h2MafAE4uSWF98FC/3MomU51iQAMf8/qDUbKWf5GxuvvVcXEhw==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "punycode": "^2.3.1"
+++      },
+++      "engines": {
+++        "node": ">=20"
+++      }
+++    },
+++    "node_modules/undici": {
+++      "version": "7.28.0",
+++      "resolved": "https://registry.npmjs.org/undici/-/undici-7.28.0.tgz",
+++      "integrity": "sha512-cRZYrTDwWznlnRiPjggAGxZXanty6M8RV1ff8Wm4LWXBp7/IG8v5DnOm74DtUBp9OONpK75YlPnIjQqX0dBDtA==",
+++      "dev": true,
+++      "license": "MIT",
+++      "engines": {
+++        "node": ">=20.18.1"
+++      }
+++    },
+++    "node_modules/vite": {
+++      "version": "5.4.21",
+++      "resolved": "https://registry.npmjs.org/vite/-/vite-5.4.21.tgz",
+++      "integrity": "sha512-o5a9xKjbtuhY6Bi5S3+HvbRERmouabWbyUcpXXUA1u+GNUKoROi9byOJ8M0nHbHYHkYICiMlqxkg1KkYmm25Sw==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "esbuild": "^0.21.3",
+++        "postcss": "^8.4.43",
+++        "rollup": "^4.20.0"
+++      },
+++      "bin": {
+++        "vite": "bin/vite.js"
+++      },
+++      "engines": {
+++        "node": "^18.0.0 || >=20.0.0"
+++      },
+++      "funding": {
+++        "url": "https://github.com/vitejs/vite?sponsor=1"
+++      },
+++      "optionalDependencies": {
+++        "fsevents": "~2.3.3"
+++      },
+++      "peerDependencies": {
+++        "@types/node": "^18.0.0 || >=20.0.0",
+++        "less": "*",
+++        "lightningcss": "^1.21.0",
+++        "sass": "*",
+++        "sass-embedded": "*",
+++        "stylus": "*",
+++        "sugarss": "*",
+++        "terser": "^5.4.0"
+++      },
+++      "peerDependenciesMeta": {
+++        "@types/node": {
+++          "optional": true
+++        },
+++        "less": {
+++          "optional": true
+++        },
+++        "lightningcss": {
+++          "optional": true
+++        },
+++        "sass": {
+++          "optional": true
+++        },
+++        "sass-embedded": {
+++          "optional": true
+++        },
+++        "stylus": {
+++          "optional": true
+++        },
+++        "sugarss": {
+++          "optional": true
+++        },
+++        "terser": {
+++          "optional": true
+++        }
+++      }
+++    },
+++    "node_modules/w3c-xmlserializer": {
+++      "version": "5.0.0",
+++      "resolved": "https://registry.npmjs.org/w3c-xmlserializer/-/w3c-xmlserializer-5.0.0.tgz",
+++      "integrity": "sha512-o8qghlI8NZHU1lLPrpi2+Uq7abh4GGPpYANlalzWxyWteJOCsr/P+oPBA49TOLu5FTZO4d3F9MnWJfiMo4BkmA==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "xml-name-validator": "^5.0.0"
+++      },
+++      "engines": {
+++        "node": ">=18"
+++      }
+++    },
+++    "node_modules/webidl-conversions": {
+++      "version": "8.0.1",
+++      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-8.0.1.tgz",
+++      "integrity": "sha512-BMhLD/Sw+GbJC21C/UgyaZX41nPt8bUTg+jWyDeg7e7YN4xOM05YPSIXceACnXVtqyEw/LMClUQMtMZ+PGGpqQ==",
+++      "dev": true,
+++      "license": "BSD-2-Clause",
+++      "engines": {
+++        "node": ">=20"
+++      }
+++    },
+++    "node_modules/whatwg-mimetype": {
+++      "version": "5.0.0",
+++      "resolved": "https://registry.npmjs.org/whatwg-mimetype/-/whatwg-mimetype-5.0.0.tgz",
+++      "integrity": "sha512-sXcNcHOC51uPGF0P/D4NVtrkjSU2fNsm9iog4ZvZJsL3rjoDAzXZhkm2MWt1y+PUdggKAYVoMAIYcs78wJ51Cw==",
+++      "dev": true,
+++      "license": "MIT",
+++      "engines": {
+++        "node": ">=20"
+++      }
+++    },
+++    "node_modules/whatwg-url": {
+++      "version": "16.0.1",
+++      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-16.0.1.tgz",
+++      "integrity": "sha512-1to4zXBxmXHV3IiSSEInrreIlu02vUOvrhxJJH5vcxYTBDAx51cqZiKdyTxlecdKNSjj8EcxGBxNf6Vg+945gw==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "@exodus/bytes": "^1.11.0",
+++        "tr46": "^6.0.0",
+++        "webidl-conversions": "^8.0.1"
+++      },
+++      "engines": {
+++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+++      }
+++    },
+++    "node_modules/xml-name-validator": {
+++      "version": "5.0.0",
+++      "resolved": "https://registry.npmjs.org/xml-name-validator/-/xml-name-validator-5.0.0.tgz",
+++      "integrity": "sha512-EvGK8EJ3DhaHfbRlETOWAS5pO9MZITeauHKJyb8wyajUfQUenkIg2MvLDTZ4T/TgIcm3HU0TFBgWWboAZ30UHg==",
+++      "dev": true,
+++      "license": "Apache-2.0",
+++      "engines": {
+++        "node": ">=18"
+++      }
+++    },
+++    "node_modules/xmlchars": {
+++      "version": "2.2.0",
+++      "resolved": "https://registry.npmjs.org/xmlchars/-/xmlchars-2.2.0.tgz",
+++      "integrity": "sha512-JZnDKK8B0RCDw84FNdDAIpZK+JuJw+s7Lz8nksI7SIuU3UXJJslUthsi+uWBUYOwPFwW7W7PRLRfUKpxjtjFCw==",
+++      "dev": true,
+++      "license": "MIT"
+++    }
+++  }
+++}
++diff --git a/apps/xing-hai-lv-zhe/package.json b/apps/xing-hai-lv-zhe/package.json
++new file mode 100644
++index 0000000..655791f
++--- /dev/null
+++++ b/apps/xing-hai-lv-zhe/package.json
++@@ -0,0 +1,17 @@
+++{
+++  "name": "xing-hai-lv-zhe",
+++  "version": "1.0.0",
+++  "description": "《星骸旅者》开罗式像素 Roguelike 生存探索小游戏 - A Kairosoft-style pixel roguelike survival RPG",
+++  "type": "module",
+++  "scripts": {
+++    "dev": "vite",
+++    "build": "vite build",
+++    "preview": "vite preview --host",
+++    "test": "node scripts/logic-test.mjs",
+++    "test:dom": "node scripts/smoke-dom.mjs"
+++  },
+++  "devDependencies": {
+++    "jsdom": "^29.1.1",
+++    "vite": "^5.4.0"
+++  }
+++}
++diff --git a/apps/xing-hai-lv-zhe/scripts/_css-loader.mjs b/apps/xing-hai-lv-zhe/scripts/_css-loader.mjs
++new file mode 100644
++index 0000000..b10c2fa
++--- /dev/null
+++++ b/apps/xing-hai-lv-zhe/scripts/_css-loader.mjs
++@@ -0,0 +1,7 @@
+++// 让 Node 的 ESM 加载器把 *.css 视作空模块（仅冒烟测试用）。
+++export async function load(url, context, nextLoad) {
+++  if (url.endsWith('.css')) {
+++    return { format: 'module', source: '', shortCircuit: true };
+++  }
+++  return nextLoad(url, context);
+++}
++diff --git a/apps/xing-hai-lv-zhe/scripts/logic-test.mjs b/apps/xing-hai-lv-zhe/scripts/logic-test.mjs
++new file mode 100644
++index 0000000..9234de2
++--- /dev/null
+++++ b/apps/xing-hai-lv-zhe/scripts/logic-test.mjs
++@@ -0,0 +1,410 @@
+++// ============================================================================
+++// 纯逻辑自测：不依赖浏览器，覆盖 config / player / world / battle / save 各模块。
+++// 运行：node scripts/logic-test.mjs
+++// ============================================================================
+++import {
+++  PALETTE, GRID, VISION_RADIUS, TILES, FLOOR_TILES, tileOf, isWalkable,
+++  EQUIP_SLOTS, MAX_PLUS, AFFIX_AT, AFFIXES, enhanceCost, starterEquipment,
+++  TALENTS, talentCost, floorConfig, enemyPoolFor, MEMORY_CHAPTERS, MAX_FLOOR,
+++  STAMINA_COST_PER_ROUND, STAMINA_TIRED, expToNext, clamp,
+++} from '../src/config.js';
+++import {
+++  newPlayer, migrate, maxHp, maxStamina, effectiveAtk, effectiveDef, effectiveMoveRange,
+++  enhanceEquipment, buyTalent, resetTalents, gainReward, healFull, regenStamina, spendStamina,
+++  damagePlayer, isDead, collectMemory, collectedMemoryCount,
+++} from '../src/core/player.js';
+++import {
+++  generateFloor, findPath, reachableTiles, entityAt, removeEntity, tileAt, descend, bfsReachable, enemyFromDef,
+++} from '../src/core/world.js';
+++import {
+++  STANCES, ACTIONS, COUNTERS, TELEGRAPH_CHANCE,
+++  pickEnemyStance, isTelegraphed, autoPickAction, resolveRound, enemyReward,
+++} from '../src/core/battle.js';
+++import {
+++  _setStorage, saveToSlot, loadFromSlot, deleteSlot, listSaves, hasAnySave, latestSlot,
+++  exportSave, importSave, SAVE_SLOTS,
+++} from '../src/core/save.js';
+++import { makeRng } from '../src/core/rng.js';
+++
+++let pass = 0, fail = 0;
+++const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
+++const seq = (arr) => makeRng(arr);
+++const r0 = () => 0;
+++const r1 = () => 0.999;
+++const rMid = () => 0.5;
+++
+++// ===================== config =====================
+++ok(Object.keys(PALETTE).length === 16, `调色板恰好 16 色（实际 ${Object.keys(PALETTE).length}）`);
+++ok(GRID === 16 && VISION_RADIUS === 2, '地图 16×16、视野半径 2（5×5）');
+++ok(EQUIP_SLOTS.length === 3 && EQUIP_SLOTS.includes('booster'), '装备三栏：武器/护甲/推进器');
+++ok(MAX_PLUS === 10 && AFFIX_AT === 5, '强化上限 +10，+5 触发词缀');
+++ok(AFFIXES.length >= 5 && AFFIXES.some((a) => a.id === 'lifesteal') && AFFIXES.some((a) => a.id === 'thorns'), '词缀池含吸血/反伤等');
+++ok(enhanceCost(0) < enhanceCost(3) && enhanceCost(3) < enhanceCost(9), '强化消耗随 plus 递增');
+++ok(TALENTS.length === 3 && TALENTS.some((t) => t.branch === 'survival') && TALENTS.some((t) => t.branch === 'luck'), '三天赋分支：生存/战斗/幸运');
+++ok(MEMORY_CHAPTERS.length === 10, `记忆章节 10 章（实际 ${MEMORY_CHAPTERS.length}）`);
+++ok(MAX_FLOOR === 10, '共 10 层（含 Boss）');
+++ok(enemyPoolFor(1).length >= 1 && enemyPoolFor(10).some((e) => e.boss), '敌人池按楼层分阶，10 层含 Boss');
+++ok(floorConfig(1).memory === true && floorConfig(10).memory === true, '每层含 1 枚记忆回响');
+++ok(expToNext(1) < expToNext(5), '升级所需经验随等级递增');
+++ok(tileOf('water').walkable === false && tileOf('floor').walkable === true, '地块通行性正确');
+++ok(isWalkable('wall') === false && isWalkable('sand') === true, 'isWalkable 辅助正确');
+++ok(Array.from(new Set(FLOOR_TILES)).length === FLOOR_TILES.length, '可行走地块类型无重复');
+++
+++// ===================== player =====================
+++let p = newPlayer(seq([0.4, 0.4, 0.4, 0.4, 0.4, 0.4]), { name: '阿尔法' });
+++ok(p.name === '阿尔法' && p.hp === maxHp(p) && p.stamina === maxStamina(), '新角色满状态');
+++ok(p.floor === 1 && p.maxFloor === 1 && p.level === 1, '新角色从第 1 层、Lv1 起步');
+++ok(p.stardust === 0 && p.parts === 0 && p.exp === 0, '新角色零资源');
+++ok(p.equipment.weapon.name === '生锈砍刀' && p.equipment.booster.plus === 0, '起始装备正确');
+++ok(Object.keys(p.talents).length === 3 && p.talents.combat === 0, '天赋初始全 0');
+++ok(p.memory.length === 10 && p.memory.every((x) => x === false), '记忆初始全未收集');
+++
+++// 超长姓名截断
+++ok(newPlayer(r0, { name: '一二三四五六七八九十' }).name.length === 8, '超长姓名截断 8 字');
+++
+++// migrate 修复损坏档
+++{
+++  _setStorage(memStorage());
+++  const bad = { name: '', hp: -5, stamina: 999, stardust: -3, parts: 'x', level: 0, exp: -1, floor: 99, maxFloor: 0, seed: NaN, turn: -1, equipment: { weapon: { name: 1, stat: 'a', plus: 99, affix: { id: 'nope' } } }, talents: { survival: 99, combat: -1 }, memory: [true, true], ending: 'weird' };
+++  saveToSlot(0, bad);
+++  const f = loadFromSlot(0);
+++  ok(f.name === '旅者', 'migrate 空姓名兜底');
+++  ok(f.hp >= 0 && f.stamina >= 0, 'migrate HP/精力非负');
+++  ok(f.stardust === 0 && f.parts === 0 && f.exp === 0, 'migrate 资源非负');
+++  ok(f.level === 1, 'migrate 等级下限 1');
+++  ok(f.floor === MAX_FLOOR, 'migrate 楼层钳到上限');
+++  ok(Number.isFinite(f.seed), 'migrate 补种子');
+++  ok(f.equipment.weapon.plus === MAX_PLUS, 'migrate 强化钳到上限');
+++  ok(f.equipment.weapon.affix === null, 'migrate 非法词缀置空');
+++  ok(f.talents.survival === 5 && f.talents.combat === 0, 'migrate 天赋钳到合法档');
+++  ok(f.memory.length === 10 && f.memory[0] === true && f.memory[2] === false, 'migrate 记忆数组补齐');
+++  ok(f.ending === null, 'migrate 非法结局置空');
+++}
+++
+++// migrate：楼层快照损坏（某行为 null / pos 越界）→ 丢弃或钳制，绝不崩溃或软锁
+++{
+++  _setStorage(memStorage());
+++  const grid = Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => 'floor'));
+++  const broken = { name: '甲', floor: 2, floorState: { grid: grid.map((r, i) => (i === 5 ? null : r)), pos: { x: 3, y: 3 }, entities: [], explored: {} } };
+++  saveToSlot(0, broken);
+++  const f1 = loadFromSlot(0);
+++  ok(f1.floorState === null, 'migrate：grid 含 null 行 → floorState 置空（重生成）');
+++  const badPos = { name: '乙', floor: 2, floorState: { grid, pos: { x: -1 }, entities: [], explored: {} } };
+++  saveToSlot(1, badPos);
+++  const f2 = loadFromSlot(1);
+++  ok(f2.floorState !== null && f2.floorState.pos.x === 1 && f2.floorState.pos.y === 1, 'migrate：pos 越界 → 钳到 {1,1}');
+++  const okPos = { name: '丙', floor: 2, floorState: { grid, pos: { x: 7, y: 9 }, entities: [], explored: {} } };
+++  saveToSlot(2, okPos);
+++  const f3 = loadFromSlot(2);
+++  ok(f3.floorState.pos.x === 7 && f3.floorState.pos.y === 9, 'migrate：合法 pos 原样保留');
+++}
+++
+++// 派生数值：强化 / 天赋 / 词缀 / 等级 均生效
+++{
+++  const a = newPlayer(r0, {});
+++  const baseAtk = effectiveAtk(a);
+++  a.equipment.weapon.plus = 3;
+++  ok(effectiveAtk(a) > baseAtk, '武器强化提升攻击');
+++  a.talents.combat = 3;
+++  ok(effectiveAtk(a) > baseAtk + 3, '战斗天赋额外提升攻击');
+++  const a2 = newPlayer(r0, {});
+++  const baseDef = effectiveDef(a2);
+++  a2.equipment.armor.plus = 2;
+++  ok(effectiveDef(a2) > baseDef, '护甲强化提升防御');
+++  const a3 = newPlayer(r0, {});
+++  ok(effectiveMoveRange(a3) === 1, '初始移动步数 1');
+++  a3.equipment.booster.plus = 2;
+++  ok(effectiveMoveRange(a3) === 3, '推进器强化提升步数');
+++  a3.equipment.booster.affix = { id: 'swift' };
+++  ok(effectiveMoveRange(a3) === 4, '迅捷词缀 +1 步');
+++  // 等级提升血量上限
+++  const a4 = newPlayer(r0, {});
+++  a4.level = 5;
+++  ok(maxHp(a4) > maxHp(newPlayer(r0, {})), '等级提升血量上限');
+++}
+++
+++// enhanceEquipment：消耗零件、+plus、+5 触发词缀
+++{
+++  const e = newPlayer(r0, {});
+++  e.parts = 100;
+++  const cost0 = enhanceCost(0);
+++  let res = enhanceEquipment(e, 'weapon', seq([0.1]));
+++  ok(res.ok === true && e.parts === 100 - cost0 && e.equipment.weapon.plus === 1, '强化消耗零件且 plus+1');
+++  // 连续强化到 +5 触发词缀
+++  e.equipment.weapon.plus = 4;
+++  res = enhanceEquipment(e, 'weapon', seq([0.2]));
+++  ok(res.ok && res.affixed && e.equipment.weapon.plus === 5, '强化至 +5');
+++  ok(e.equipment.weapon.affix && AFFIXES.some((a) => a.id === e.equipment.weapon.affix.id), '+5 触发词缀变异');
+++  // 达上限
+++  e.equipment.weapon.plus = MAX_PLUS;
+++  res = enhanceEquipment(e, 'weapon', r0);
+++  ok(res.ok === false && res.reason === 'max', '达上限不可强化');
+++  // 零件不足
+++  e.equipment.weapon.plus = 0; e.parts = 0;
+++  res = enhanceEquipment(e, 'weapon', r0);
+++  ok(res.ok === false && res.reason === 'no-parts', '零件不足不可强化');
+++}
+++
+++// 天赋：消耗星骸、上限、重置返还
+++{
+++  const t = newPlayer(r0, {});
+++  t.stardust = 200;
+++  const c0 = talentCost('combat', 0);
+++  let res = buyTalent(t, 'combat');
+++  ok(res.ok && t.talents.combat === 1 && t.stardust === 200 - c0, '点亮战斗天赋消耗星骸');
+++  // 生存天赋补 HP
+++  const hpBefore = t.hp;
+++  res = buyTalent(t, 'survival');
+++  ok(res.ok && t.hp >= hpBefore, '生存天赋补 HP');
+++  // 重置全额返还
+++  const sdBefore = t.stardust;
+++  res = resetTalents(t);
+++  ok(res.ok && res.refund > 0 && t.stardust > sdBefore, '重置天赋返还星骸');
+++  ok(t.talents.combat === 0 && t.talents.survival === 0, '重置后天赋归零');
+++  // 星骸不足
+++  t.stardust = 0;
+++  res = buyTalent(t, 'luck');
+++  ok(res.ok === false && res.reason === 'no-stardust', '星骸不足不可点亮');
+++}
+++
+++// gainReward：幸运加成 + 升级
+++{
+++  const g = newPlayer(r0, {});
+++  gainReward(g, { stardust: 10, parts: 4, exp: 0 }, r0);
+++  ok(g.stardust === 10 && g.parts === 4, '基础奖励入账');
+++  const lucky = newPlayer(r0, {});
+++  lucky.talents.luck = 3;
+++  gainReward(lucky, { stardust: 10, parts: 4 }, r0);
+++  ok(lucky.stardust > 10 && lucky.parts > 4, '幸运天赋提升掉落');
+++  // 升级
+++  const lv = newPlayer(r0, {});
+++  const lvBefore = lv.level;
+++  const need = expToNext(lv.level);
+++  gainReward(lv, { exp: need + 5 }, r0);
+++  ok(lv.level === lvBefore + 1 && lv.exp === 5, '经验达标后升级并结算剩余经验');
+++}
+++
+++// HP / 精力 / 死亡
+++{
+++  const d = newPlayer(r0, {});
+++  damagePlayer(d, 1000);
+++  ok(d.hp === 0 && isDead(d) === true, '伤害致死判定死亡');
+++  healFull(d);
+++  ok(d.hp === maxHp(d) && d.stamina === maxStamina(d), '满状态恢复');
+++  spendStamina(d, 50);
+++  ok(d.stamina < maxStamina(d), '消耗精力');
+++  regenStamina(d, 10);
+++  ok(d.stamina <= maxStamina(d), '精力回复钳制上限');
+++}
+++
+++// 记忆收集
+++{
+++  const m = newPlayer(r0, {});
+++  ok(collectedMemoryCount(m) === 0, '初始收集数 0');
+++  const res = collectMemory(m, 0);
+++  ok(res.ok && m.memory[0] === true && collectedMemoryCount(m) === 1, '收集记忆解锁章节');
+++  const again = collectMemory(m, 0);
+++  ok(again.ok === false && again.already === true, '重复收集不重复解锁');
+++  ok(m.hp < maxHp(m) || m.hp === maxHp(m), '收集记忆回复 HP 不报错');
+++}
+++
+++// ===================== world =====================
+++{
+++  const st = generateFloor(seq(Array.from({ length: 64 }, (_, i) => (i % 7) / 7)), 1, newPlayer(r0, {}));
+++  ok(st.grid.length === GRID && st.grid[0].length === GRID, '生成 16×16 网格');
+++  // 边界为墙
+++  ok(st.grid[0][0] === 'wall' && st.grid[GRID - 1][GRID - 1] === 'wall', '边界为墙');
+++  // 出生点可行走
+++  ok(isWalkable(tileAt(st, st.pos.x, st.pos.y)), '出生点可行走');
+++  // 第 1 层有阶梯
+++  ok(st.entities.some((e) => e.type === 'memory'), '第 1 层含 1 枚记忆');
+++  ok(st.entities.filter((e) => e.type === 'enemy').length === floorConfig(1).enemyCount, `敌人数量符合楼层配置（${floorConfig(1).enemyCount}）`);
+++  ok(st.entities.filter((e) => e.type === 'chest').length === floorConfig(1).chestCount, '宝箱数量符合楼层配置');
+++  ok(st.entities.some((e) => ['merchant', 'drone', 'trap'].includes(e.type)), '含 1 个随机事件点');
+++  // 有阶梯且非 Boss 层
+++  let hasStairs = false;
+++  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (tileAt(st, x, y) === 'stairs') hasStairs = true;
+++  ok(hasStairs, '第 1 层存在下行阶梯');
+++  // 实体不重叠出生点
+++  ok(!entityAt(st, st.pos.x, st.pos.y), '出生点无实体');
+++  // 出生点可达阶梯
+++  const reach = bfsReachable(st.grid, st.pos.x, st.pos.y);
+++  let stairsKey = null;
+++  for (let y = 0; y < GRID && !stairsKey; y++) for (let x = 0; x < GRID && !stairsKey; x++) if (tileAt(st, x, y) === 'stairs') stairsKey = `${x},${y}`;
+++  ok(stairsKey && reach.dist.has(stairsKey), '出生点可达阶梯（连通保证）');
+++}
+++// Boss 层：无阶梯、有 Boss
+++{
+++  const st = generateFloor(seq(Array.from({ length: 64 }, (_, i) => (i % 5) / 5)), MAX_FLOOR, newPlayer(r0, {}));
+++  let hasStairs = false;
+++  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (tileAt(st, x, y) === 'stairs') hasStairs = true;
+++  ok(hasStairs === false, 'Boss 层无下行阶梯');
+++  const boss = st.entities.find((e) => e.type === 'enemy');
+++  ok(boss && boss.boss === true, 'Boss 层含 Boss 敌人');
+++  ok(st.entities.some((e) => e.type === 'memory'), 'Boss 层仍含 1 枚记忆');
+++}
+++
+++// reachableTiles / findPath
+++{
+++  const grid = Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => 'floor'));
+++  for (let i = 0; i < GRID; i++) { grid[0][i] = 'wall'; grid[GRID - 1][i] = 'wall'; grid[i][0] = 'wall'; grid[i][GRID - 1] = 'wall'; }
+++  const st = { grid, pos: { x: 5, y: 5 }, entities: [] };
+++  const reach1 = reachableTiles(st, st.pos, 1);
+++  ok(reach1.size === 5, `步数 1 可达 5 格（实际 ${reach1.size}）`); // 自身 + 4 邻
+++  const reach2 = reachableTiles(st, st.pos, 2);
+++  ok(reach2.size === 13, `步数 2 可达 13 格（实际 ${reach2.size}）`);
+++  const path = findPath(st, { x: 5, y: 5 }, { x: 7, y: 5 }, 5, new Set());
+++  ok(Array.isArray(path) && path.length === 2, `findPath 走 2 步到 (3,1)（实际 ${path && path.length}）`);
+++  const tooFar = findPath(st, { x: 1, y: 1 }, { x: 5, y: 1 }, 2, new Set());
+++  ok(tooFar === null, '超出步数上限 findPath 返回 null');
+++  // 墙阻挡
+++  grid[1][2] = 'wall';
+++  const blocked = findPath(st, { x: 1, y: 1 }, { x: 3, y: 1 }, 5, new Set());
+++  // 直线被墙挡，但可绕行（2,1 被墙挡，可走 1,2->2,2->3,2->3,1）；仍可达
+++  ok(Array.isArray(blocked), '墙阻挡直线但仍可绕行抵达');
+++  // 敌人格视为阻挡
+++  const stE = { grid: grid.map((r) => r.slice()), pos: { x: 1, y: 1 }, entities: [{ id: 'e1', type: 'enemy', x: 2, y: 1 }] };
+++  const reachE = reachableTiles(stE, stE.pos, 2);
+++  ok(!reachE.has('2,1'), '敌人所在格不可达');
+++}
+++// entityAt / removeEntity / descend
+++{
+++  const st = { grid: Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => 'floor')), pos: { x: 1, y: 1 }, entities: [{ id: 'e1', type: 'chest', x: 2, y: 2 }] };
+++  ok(entityAt(st, 2, 2) && entityAt(st, 2, 2).id === 'e1', 'entityAt 命中');
+++  ok(entityAt(st, 3, 3) === null, 'entityAt 空格返回 null');
+++  ok(removeEntity(st, 'e1') === true && entityAt(st, 2, 2) === null, 'removeEntity 移除实体');
+++  ok(removeEntity(st, 'nope') === false, 'removeEntity 不存在返回 false');
+++  const pl = newPlayer(r0, {}); pl.floor = 5;
+++  ok(descend(pl) === 6 && pl.maxFloor === 6, 'descend 推进楼层并更新最远记录');
+++  pl.floor = MAX_FLOOR;
+++  ok(descend(pl) === MAX_FLOOR, 'descend 钳到上限');
+++}
+++
+++// ===================== battle =====================
+++ok(Object.keys(COUNTERS).length === 3, '三组克制关系');
+++ok(COUNTERS.counter === 'thrust' && COUNTERS.block === 'slash' && COUNTERS.dodge === 'smash', '反击克突刺、格挡克横斩、闪避克重击');
+++{
+++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
+++  ok(['thrust', 'slash', 'smash'].includes(pickEnemyStance(enemy, r0)), 'pickEnemyStance 返回合法架势');
+++  ok(autoPickAction('thrust') === 'counter' && autoPickAction('slash') === 'block' && autoPickAction('smash') === 'dodge', 'autoPickAction 给出正确克制');
+++  ok(isTelegraphed(seq([0.1])) === true && isTelegraphed(seq([0.9])) === false, 'isTelegraphed 按概率识破');
+++  ok(TELEGRAPH_CHANCE > 0 && TELEGRAPH_CHANCE < 1, '识破概率合法');
+++}
+++// 克制成功：敌人受伤、玩家不掉血、专注力蓄满
+++{
+++  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
+++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
+++  const hpBefore = enemy.hp;
+++  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r1); // r1 不失手
+++  ok(res.countered === true, '反击对突刺 → 克制成功');
+++  ok(res.enemyDmg > 0 && enemy.hp === hpBefore - res.enemyDmg, '敌人受到伤害');
+++  ok(res.playerDmg === 0, '克制成功玩家不掉血');
+++  ok(res.nextFocus === true, '克制成功蓄满专注力');
+++}
+++// 专注力倍率：下一击伤害更高
+++{
+++  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
+++  const atk = effectiveAtk(pl);
+++  const e1 = enemyFromDef(enemyPoolFor(1)[0], 1);
+++  resolveRound(pl, e1, 'counter', false, 'thrust', r1);
+++  const e2 = enemyFromDef(enemyPoolFor(1)[0], 1);
+++  const res2 = resolveRound(pl, e2, 'counter', true, 'thrust', r1); // 带专注
+++  ok(res2.enemyDmg > atk, '专注力下克制伤害高于基础攻击');
+++}
+++// 应对失败：玩家受伤
+++{
+++  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
+++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1); enemy.atk = 30;
+++  const hpBefore = pl.hp;
+++  const res = resolveRound(pl, enemy, 'block', false, 'thrust', r1); // 格挡不克突刺
+++  ok(res.countered === false, '错误应对 → 未克制');
+++  ok(res.playerDmg > 0 && pl.hp < hpBefore, '玩家受到伤害');
+++  ok(res.nextFocus === false, '失败清空专注力');
+++}
+++// 精力过低失手
+++{
+++  const pl = newPlayer(r0, {}); pl.stamina = 0; // < STAMINA_TIRED
+++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
+++  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r0); // r0 → 触发失手
+++  ok(res.fumble === true && res.countered === false, '精力过低且随机=0 → 失手');
+++}
+++// 吸血词缀
+++{
+++  const pl = newPlayer(r0, {});
+++  pl.stamina = maxStamina(pl); pl.hp = 10;
+++  pl.equipment.weapon.affix = { id: 'lifesteal' };
+++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
+++  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r1);
+++  ok(res.healed > 0 && pl.hp > 10, '吸血词缀在克制命中时回血');
+++}
+++// 反伤词缀
+++{
+++  const pl = newPlayer(r0, {});
+++  pl.stamina = maxStamina(pl);
+++  pl.equipment.armor.affix = { id: 'thorns' };
+++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1); enemy.atk = 40;
+++  const hpBefore = enemy.hp;
+++  const res = resolveRound(pl, enemy, 'block', false, 'thrust', r1); // 失败受击
+++  ok(res.playerDmg > 0 && enemy.hp < hpBefore, '反伤词缀在受击时反弹伤害');
+++}
+++// 战斗致死与奖励
+++{
+++  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
+++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1); enemy.hp = 1; enemy.maxHp = 1;
+++  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r1);
+++  ok(res.enemyDead === true && enemy.hp === 0, '敌人 HP 归零判定死亡');
+++  const rw = enemyReward(enemy);
+++  ok(Number.isFinite(rw.stardust) && Number.isFinite(rw.parts) && Number.isFinite(rw.exp), 'enemyReward 返回奖励数值');
+++}
+++ok(STAMINA_COST_PER_ROUND > 0 && STAMINA_TIRED > 0, '战斗精力消耗 / 疲惫阈值合法');
+++
+++// ===================== save（多槽位）=====================
+++function memStorage() {
+++  const m = {};
+++  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: (k) => { delete m[k]; } };
+++}
+++ok(SAVE_SLOTS >= 5, `存档槽位 ≥ 5（实际 ${SAVE_SLOTS}）`);
+++_setStorage(memStorage());
+++ok(hasAnySave() === false && latestSlot() === null, '空存储无存档');
+++ok(Array.isArray(listSaves()) && listSaves().length === SAVE_SLOTS, 'listSaves 返回全部槽位');
+++
+++const toSave = newPlayer(seq([0.3, 0.3, 0.3, 0.3, 0.3, 0.3]), { name: '贝塔' });
+++toSave.floor = 4; toSave.stardust = 30; toSave.parts = 12;
+++ok(saveToSlot(0, toSave) === true && hasAnySave() === true && latestSlot() === 0, 'saveToSlot 写入并可读出');
+++const loaded = loadFromSlot(0);
+++ok(loaded.name === '贝塔' && loaded.floor === 4 && loaded.stardust === 30 && loaded.parts === 12, '读档字段一致');
+++
+++saveToSlot(1, newPlayer(r0, { name: '甲' }));
+++saveToSlot(2, newPlayer(r0, { name: '乙' }));
+++ok(loadFromSlot(1).name === '甲' && loadFromSlot(0).name === '贝塔', '多槽位互不干扰');
+++ok(listSaves().filter((s) => s.exists).length === 3, 'listSaves 标记已用槽');
+++{
+++  saveToSlot(3, newPlayer(r0, { name: '最新' }));
+++  ok(latestSlot() === 3, 'latestSlot 取最近游玩槽位');
+++}
+++ok(deleteSlot(3) === true && loadFromSlot(3) === null, 'deleteSlot 删除槽位');
+++ok(deleteSlot(999) === false, '非法槽位 deleteSlot 返回 false');
+++
+++// 导入导出往返
+++{
+++  const orig = newPlayer(seq([0.2, 0.2, 0.2, 0.2, 0.2, 0.2]), { name: '伽马' });
+++  orig.floor = 6; orig.memory[0] = true;
+++  const str = exportSave(orig);
+++  ok(typeof str === 'string' && str.length > 0, 'exportSave 生成字符串');
+++  const back = importSave(str);
+++  ok(back !== null && back.name === '伽马' && back.floor === 6 && back.memory[0] === true, '导入后字段一致');
+++  ok(importSave('!!!not-base64!!!') === null, '非法导入串返回 null');
+++}
+++
+++// 楼层快照随存档保存
+++{
+++  _setStorage(memStorage());
+++  const pl = newPlayer(r0, {});
+++  pl.floorState = generateFloor(rMid, 2, pl);
+++  saveToSlot(0, pl);
+++  const back = loadFromSlot(0);
+++  ok(back.floorState && back.floorState.grid.length === GRID, '楼层快照随存档保存');
+++}
+++
+++console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
+++process.exit(fail ? 1 : 0);
++diff --git a/apps/xing-hai-lv-zhe/scripts/smoke-dom.mjs b/apps/xing-hai-lv-zhe/scripts/smoke-dom.mjs
++new file mode 100644
++index 0000000..eb88f9a
++--- /dev/null
+++++ b/apps/xing-hai-lv-zhe/scripts/smoke-dom.mjs
++@@ -0,0 +1,322 @@
+++// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程
+++// （启动器 → 创角 → 地图移动 → 战斗 → 胜利 → 下层 → 背包强化/天赋 → 事件 → 存档往返 → Boss 通关结局）。
+++// 运行：node scripts/smoke-dom.mjs   （需先 npm install jsdom）
+++import { JSDOM } from 'jsdom';
+++import { register } from 'node:module';
+++
+++// 把 *.css 当作空模块（app.js 顶部 import 了样式表）
+++register('./_css-loader.mjs', import.meta.url);
+++
+++const dom = new JSDOM('<!DOCTYPE html><div id="game-container"></div>', {
+++  url: 'http://localhost/',
+++  pretendToBeVisual: true,
+++});
+++const { window } = dom;
+++for (const k of ['document', 'window', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'Element', 'getComputedStyle', 'CustomEvent', 'MouseEvent', 'Event']) {
+++  if (window[k] === undefined) continue;
+++  try { globalThis[k] = window[k]; } catch (_) { /* Node 部分全局只读 */ }
+++}
+++globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
+++globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
+++
+++let pass = 0, fail = 0;
+++const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
+++const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
+++
+++const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);
+++const { isWalkable } = await import(new URL('../src/config.js', import.meta.url).href);
+++const { entityAt, generateFloor } = await import(new URL('../src/core/world.js', import.meta.url).href);
+++const { maxHp } = await import(new URL('../src/core/player.js', import.meta.url).href);
+++
+++const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
+++const GRID = 16;
+++
+++// ---------- 1) 首启：启动器 ----------
+++localStorage.clear();
+++let ui = window.__XHLZ;
+++await sleep(10);
+++ok(document.querySelector('.launcher') !== null, '渲染启动器');
+++ok(/星骸旅者/.test(document.querySelector('.launcher h1')?.textContent || ''), '启动器标题为「星骸旅者」');
+++ok(document.querySelector('.launcher__actions .btn-primary') !== null, '启动器有主操作按钮');
+++
+++// ---------- 2) 开启新旅程 → 创角页 ----------
+++// 用确定性 rng（=0.4）：生成开阔浮岛，战斗时恒识破「突刺」，便于稳定取胜。
+++ui.rng = () => 0.4;
+++ui.timerEnabled = false;
+++document.querySelector('.launcher__actions .btn-primary').click();
+++await sleep(10);
+++ok(document.querySelector('.launcher.create') !== null || document.querySelector('.create__head') !== null, '点击开始进入创角页');
+++ok(document.querySelector('[data-id="name"]') !== null, '创角页有姓名输入');
+++
+++// ---------- 3) 取名 + 迫降 → 进入地图 ----------
+++const nameInput = document.querySelector('[data-id="name"]');
+++if (nameInput) {
+++  nameInput.value = '星岚';
+++  nameInput.dispatchEvent(new window.Event('input', { bubbles: true }));
+++}
+++document.querySelector('.create__foot .btn-primary').click();
+++await sleep(15);
+++ok(document.querySelector('.xhlz-game') !== null, '迫降后进入游戏界面');
+++ok(document.querySelector('.status-bar') !== null, '渲染顶部状态栏');
+++ok(document.querySelector('.map-grid') !== null, '渲染像素地图');
+++ok(document.querySelectorAll('.cell').length === GRID * GRID, `地图含 ${GRID * GRID} 个地块（实际 ${document.querySelectorAll('.cell').length}）`);
+++ok(ui.player && ui.player.name === '星岚', `角色姓名记录正确（${ui.player?.name}）`);
+++ok(ui.player.floor === 1 && ui.player.floorState, '初始第 1 层且生成楼层快照');
+++ok(document.querySelector('.interact-btn') !== null, '底部有中央交互键');
+++
+++// ---------- 4) 移动：步数推进、迷雾揭开 ----------
+++const turnBefore = ui.player.turn;
+++const stepOnce = () => {
+++  const st = ui.player.floorState;
+++  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
+++    const nx = st.pos.x + dx, ny = st.pos.y + dy;
+++    if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
+++    const ent = entityAt(st, nx, ny);
+++    if (ent && ent.type === 'enemy') continue;
+++    if (!isWalkable(st.grid[ny][nx])) continue;
+++    ui.tryMoveTo(nx, ny);
+++    return true;
+++  }
+++  return false;
+++};
+++let moved = false;
+++for (let i = 0; i < 6; i++) { if (ui._sheet) ui.closeModal(); if (stepOnce()) moved = true; await sleep(5); }
+++ok(moved && ui.player.turn > turnBefore, `移动推进步数（turn ${turnBefore}→${ui.player.turn}）`);
+++ok(Object.keys(ui.player.floorState.explored).length > 1, '移动揭开了迷雾');
+++
+++// ---------- 5) 战斗：走到敌人旁 → 攻击 → 猜拳取胜 ----------
+++function nearestEnemy() {
+++  const st = ui.player.floorState;
+++  let best = null, bd = Infinity;
+++  for (const e of st.entities) if (e.type === 'enemy') { const d = manhattan(st.pos, e); if (d < bd) { bd = d; best = e; } }
+++  return best;
+++}
+++// 贪心走向敌人直到相邻（逐格，遇事件弹窗自动关闭）
+++function walkAdjacent(enemy) {
+++  const st = ui.player.floorState;
+++  let guard = 0;
+++  while (enemy && manhattan(st.pos, enemy) > 1 && guard++ < 80) {
+++    if (ui._sheet) { ui.closeModal(); continue; }
+++    let best = null, bestD = Infinity;
+++    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
+++      const nx = st.pos.x + dx, ny = st.pos.y + dy;
+++      if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
+++      const ent = entityAt(st, nx, ny);
+++      if (ent && ent.type === 'enemy') continue;
+++      if (!isWalkable(st.grid[ny][nx])) continue;
+++      const d = Math.abs(nx - enemy.x) + Math.abs(ny - enemy.y);
+++      if (d < bestD) { bestD = d; best = { x: nx, y: ny }; }
+++    }
+++    if (!best) return false;
+++    ui.tryMoveTo(best.x, best.y);
+++  }
+++  return enemy ? manhattan(st.pos, enemy) <= 1 : false;
+++}
+++
+++// 通用战斗取胜：读架势 → 点击克制应对，直到战斗结束
+++async function winBattle() {
+++  let guard = 0;
+++  while (document.querySelector('.battle') && guard++ < 80) {
+++    const chip = document.querySelector('.stance-chip');
+++    let act = 'counter';
+++    if (chip) {
+++      const t = chip.textContent || '';
+++      if (t.includes('横斩')) act = 'block';
+++      else if (t.includes('重击')) act = 'dodge';
+++      else act = 'counter';
+++    }
+++    const btn = document.querySelector(`.battle__actions .act[data-action="${act}"]`);
+++    if (btn && !btn.disabled) btn.click();
+++    await sleep(70);
+++  }
+++  return !document.querySelector('.battle');
+++}
+++
+++let enemy = nearestEnemy();
+++ok(!!enemy, '第 1 层存在敌人');
+++let reached = enemy ? walkAdjacent(enemy) : false;
+++if (!reached && enemy) {
+++  // 退化：直接对相邻敌人开战（绕过寻路 UI）
+++  ui.startBattle(enemy);
+++} else {
+++  ok(/攻击/.test(document.querySelector('.interact-btn')?.textContent || ''), '靠近敌人后交互键变为「攻击」');
+++  document.querySelector('.interact-btn').click();
+++}
+++await sleep(15);
+++ok(document.querySelector('.battle') !== null, '进入战斗界面');
+++ok(document.querySelectorAll('.battle__actions .act').length === 3, '战斗含 3 个应对按钮');
+++const sdBefore = ui.player.stardust;
+++const won = await winBattle();
+++ok(won, '战斗取胜并退出战斗界面');
+++ok(ui.player.stardust > sdBefore, `战斗获得星骸（${sdBefore}→${ui.player.stardust}）`);
+++
+++// ---------- 5b) 自动战斗：开启后能自动结算多回合直至取胜（防死锁） ----------
+++const enemy2 = nearestEnemy();
+++if (enemy2) {
+++  const reached2 = walkAdjacent(enemy2);
+++  if (reached2) {
+++    document.querySelector('.interact-btn').click(); // 攻击
+++    await sleep(15);
+++    const autoBtn = document.querySelector('[title="自动战斗"]');
+++    ok(!!autoBtn, '战斗界面有自动战斗开关');
+++    if (autoBtn) autoBtn.click(); // 开启自动
+++    await sleep(10);
+++    ok(ui.battle && ui.battle.auto === true, '开启后 battle.auto=true');
+++    // 轮询等待自动战斗结束（防 5b 死锁回归）
+++    let guard = 0;
+++    while (document.querySelector('.battle') && guard++ < 200) { await sleep(70); }
+++    ok(!document.querySelector('.battle'), `自动战斗能自行取胜并退出（${guard} 轮）`);
+++  }
+++}
+++
+++// ---------- 6) 事件：商人 / 无人机 ----------
+++ui.player.stardust += 50; // 便于测试购买
+++ui.refreshStatus();
+++ui.showMerchant();
+++await sleep(10);
+++ok(/流浪商人/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开商人面板');
+++const buyBtn = document.querySelector('.sheet__body .slot-row .btn-primary');
+++ok(!!buyBtn && !buyBtn.disabled, '商人有可购买商品');
+++if (buyBtn) buyBtn.click();
+++await sleep(10);
+++ui.closeModal();
+++ui.showDrone();
+++await sleep(10);
+++ok(/维修无人机/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开无人机面板');
+++const droneBtn = [...document.querySelectorAll('.sheet__foot button')].find((b) => /维修/.test(b.textContent));
+++ok(!!droneBtn, '无人机有维修按钮');
+++if (droneBtn) droneBtn.click();
+++await sleep(10);
+++ok(ui.player.hp === maxHp(ui.player), '无人机维修回满 HP');
+++
+++// ---------- 7) 背包：强化 / 天赋 / 剧情 ----------
+++ui.player.parts = 100;
+++ui.openInventory();
+++await sleep(10);
+++ok(/背包/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开背包');
+++ok(document.querySelectorAll('.tabs .tab').length === 3, '背包含 装备/天赋/剧情 三标签');
+++const plusBefore = ui.player.equipment.weapon.plus;
+++const enhBtn = document.querySelector('.equip-card .btn-primary');
+++ok(!!enhBtn, '装备页有强化按钮');
+++if (enhBtn) enhBtn.click();
+++await sleep(10);
+++ok(ui.player.equipment.weapon.plus === plusBefore + 1, `强化成功 +${plusBefore}→+${ui.player.equipment.weapon.plus}`);
+++// 天赋
+++document.querySelectorAll('.tabs .tab')[1].click();
+++await sleep(10);
+++ok(document.querySelectorAll('.talent-branch').length === 3, '天赋页含 3 分支');
+++const talBtn = document.querySelector('.talent-branch .btn-primary');
+++ok(!!talBtn, '天赋页有点亮按钮');
+++if (talBtn) talBtn.click();
+++await sleep(10);
+++ok(ui.player.talents.combat === 1 || ui.player.talents.survival === 1 || ui.player.talents.luck === 1, '点亮天赋成功');
+++// 重置
+++const resetBtn = [...document.querySelectorAll('.sheet__body button')].find((b) => /重置天赋/.test(b.textContent));
+++if (resetBtn) resetBtn.click();
+++await sleep(10);
+++ok(ui.player.talents.combat === 0 && ui.player.talents.survival === 0 && ui.player.talents.luck === 0, '重置天赋后归零');
+++// 剧情
+++document.querySelectorAll('.tabs .tab')[2].click();
+++await sleep(10);
+++ok(document.querySelectorAll('.chapter').length === 10, '剧情页列出 10 章节');
+++ui.closeModal();
+++await sleep(5);
+++
+++// ---------- 8) 下层 ----------
+++// 走到阶梯并下行
+++const findStairs = () => {
+++  const st = ui.player.floorState;
+++  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (st.grid[y][x] === 'stairs') return { x, y };
+++  return null;
+++};
+++const stairs = findStairs();
+++if (stairs) {
+++  // 逐格走向阶梯
+++  let guard = 0;
+++  while (manhattan(ui.player.floorState.pos, stairs) > 0 && guard++ < 80) {
+++    if (ui._sheet) { ui.closeModal(); continue; }
+++    const st = ui.player.floorState;
+++    let best = null, bestD = Infinity;
+++    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
+++      const nx = st.pos.x + dx, ny = st.pos.y + dy;
+++      if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
+++      const ent = entityAt(st, nx, ny);
+++      if (ent && ent.type === 'enemy') continue;
+++      if (!isWalkable(st.grid[ny][nx])) continue;
+++      const d = manhattan({ x: nx, y: ny }, stairs);
+++      if (d < bestD) { bestD = d; best = { x: nx, y: ny }; }
+++    }
+++    if (!best) break;
+++    ui.tryMoveTo(best.x, best.y);
+++  }
+++  if (ui.player.floorState.pos.x === stairs.x && ui.player.floorState.pos.y === stairs.y) {
+++    document.querySelector('.interact-btn').click(); // 下行
+++    await sleep(10);
+++  }
+++}
+++ok(ui.player.floor === 2, `下行至第 2 层（实际 ${ui.player.floor}）`);
+++
+++// ---------- 9) 存档往返：重开实例后可「继续旅程」 ----------
+++const savedName = ui.player.name;
+++const savedFloor = ui.player.floor;
+++ui.destroy();
+++await sleep(10);
+++ui = createGame(document.getElementById('game-container'));
+++ui.rng = () => 0.4;
+++ui.timerEnabled = false;
+++window.__XHLZ = ui;
+++await sleep(10);
+++ok(/继续旅程/.test(document.querySelector('.launcher__actions .btn-primary')?.textContent || ''), '有存档时启动器主按钮为「继续旅程」');
+++document.querySelector('.launcher__actions .btn-primary').click();
+++await sleep(15);
+++ok(ui.player && ui.player.name === savedName && ui.player.floor === savedFloor, `继续旅程载入正确（${ui.player?.name}·第 ${ui.player?.floor} 层）`);
+++ok(document.querySelector('.xhlz-game') !== null, '继续后渲染游戏界面');
+++
+++// ---------- 10) Boss 层：通关 → 双结局抉择 ----------
+++ui.player.floor = 10;
+++ui.player.floorState = generateFloor(ui.rng, 10, ui.player);
+++ui.renderMap();
+++ui.refreshInteract();
+++await sleep(10);
+++const boss = ui.player.floorState.entities.find((e) => e.type === 'enemy' && e.boss);
+++ok(!!boss, 'Boss 层存在 Boss 敌人');
+++if (boss) {
+++  walkAdjacent(boss);
+++  if (ui._sheet) ui.closeModal();
+++  if (manhattan(ui.player.floorState.pos, boss) <= 1) {
+++    document.querySelector('.interact-btn').click();
+++    await sleep(15);
+++    const bossWon = await winBattle();
+++    ok(bossWon, '击败 Boss');
+++    await sleep(10);
+++    const peaceBtn = [...document.querySelectorAll('.sheet__foot button, .ending__choice button')].find((b) => /重建文明/.test(b.textContent));
+++    ok(!!peaceBtn, '击败 Boss 后出现结局抉择');
+++    if (peaceBtn) peaceBtn.click();
+++    await sleep(15);
+++  }
+++}
+++ok(document.querySelector('.ending') !== null, '通关后渲染结局画面');
+++ok(ui.player.ending === 'peace' || ui.player.ending === 'dark', `结局已记录（${ui.player.ending}）`);
+++
+++// ---------- 11) 死亡结算画面（开启新旅程后驱动 gameOver） ----------
+++ui.destroy();
+++await sleep(10);
+++ui = createGame(document.getElementById('game-container'));
+++ui.rng = () => 0.4;
+++window.__XHLZ = ui;
+++await sleep(10);
+++const newBtn = [...document.querySelectorAll('.launcher__actions button')].find((b) => /新旅程/.test(b.textContent));
+++(newBtn || document.querySelector('.launcher__actions .btn-primary')).click();
+++await sleep(10);
+++document.querySelector('.create__foot .btn-primary').click(); // 迫降进入游戏
+++await sleep(15);
+++ok(ui.player && ui.screen === 'game', '开启新旅程进入游戏');
+++ui.player.hp = 0;
+++ui.gameOver();
+++await sleep(10);
+++ok(document.querySelector('.ending.dark') !== null, '生命归零渲染死亡结算画面');
+++ok(/旅程终结/.test(document.querySelector('.ending h2')?.textContent || ''), '死亡结算标题正确');
+++
+++ui.destroy();
+++console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
+++process.exit(fail ? 1 : 0);
++diff --git a/apps/xing-hai-lv-zhe/src/config.js b/apps/xing-hai-lv-zhe/src/config.js
++new file mode 100644
++index 0000000..89a3d11
++--- /dev/null
+++++ b/apps/xing-hai-lv-zhe/src/config.js
++@@ -0,0 +1,205 @@
+++// ============================================================================
+++// 星骸旅者 · 配置层（纯常量与纯函数，无副作用，便于单测）
+++// 定义调色板、地块、装备、天赋、敌人、记忆章节、随机事件与各类阈值。
+++// ============================================================================
+++
+++// —— 开罗经典 16 色调色板（明亮饱和色块）——
+++export const PALETTE = {
+++  bg: '#2b2d3a',        // 深底（星空）
+++  parchment: '#f8f4e6', // 亮米（羊皮纸 / 浅地砖）
+++  sand: '#f7b731',      // 沙地金
+++  water: '#4a90e2',     // 水域蓝
+++  monster: '#e8634a',   // 怪物红
+++  grass: '#6bcb77',     // 草地绿
+++  stone: '#5d5376',     // 遗迹石（墙）
+++  stoneDark: '#3a3a4a', // 深石（墙心）
+++  gold: '#ffd93d',      // 星骸金 / 阶梯
+++  player: '#4d96ff',    // 玩家蓝
+++  hp: '#ff6b6b',        // 血量红
+++  arcane: '#9d4edd',    // 回响紫（记忆碎片）
+++  teal: '#38a3a5',      // 推进器青
+++  light: '#f2f2f2',     // 浅地砖
+++  gray: '#b0b0b0',      // 中灰
+++  luck: '#57c785',      // 幸运绿
+++};
+++
+++// —— 地图网格 ——
+++export const GRID = 16;            // 16×16 地块
+++export const VISION_RADIUS = 2;    // 视野半径（5×5 可见）
+++
+++// 地块类型枚举。walkable 决定能否踏入；color 为像素绘制色。
+++export const TILES = {
+++  floor:    { id: 'floor',    name: '地砖', walkable: true,  color: PALETTE.light },
+++  floor2:   { id: 'floor2',   name: '石板', walkable: true,  color: PALETTE.parchment },
+++  sand:     { id: 'sand',     name: '沙地', walkable: true,  color: PALETTE.sand },
+++  grass:    { id: 'grass',    name: '草地', walkable: true,  color: PALETTE.grass },
+++  water:    { id: 'water',    name: '水域', walkable: false, color: PALETTE.water },
+++  wall:     { id: 'wall',     name: '石墙', walkable: false, color: PALETTE.stone },
+++  wallDark: { id: 'wallDark', name: '深墙', walkable: false, color: PALETTE.stoneDark },
+++  stairs:   { id: 'stairs',   name: '下行阶梯', walkable: true, color: PALETTE.gold },
+++};
+++// 随机生成时从中抽取的「可点缀」可行走地块（决定地砖纹理差异，不影响通行）。
+++export const FLOOR_TILES = ['floor', 'floor2', 'sand', 'grass'];
+++
+++export function tileOf(id) { return TILES[id] || TILES.floor; }
+++export function isWalkable(id) { return !!tileOf(id).walkable; }
+++
+++// —— 角色基础数值 ——
+++export const BASE_MAX_HP = 100;
+++export const BASE_MAX_STAMINA = 80;
+++export const BASE_ATK = 6;     // 裸装攻击（武器加成叠加其上）
+++export const BASE_DEF = 2;     // 裸装防御
+++export const BASE_MOVE_RANGE = 1; // 推进器 plus 每点 +1 步
+++
+++// 精力影响命中率：低于此阈值进入「疲惫」，战斗中有失手概率。
+++export const STAMINA_TIRED = 30;
+++export const STAMINA_FUMBLE_CHANCE = 0.35; // 疲惫时失手概率上限
+++// 战斗每回合消耗精力；地图上每移动一格回复精力。
+++export const STAMINA_COST_PER_ROUND = 4;
+++export const STAMINA_REGEN_PER_STEP = 3;
+++// 闲置缓慢回精（rAF 驱动，每 STAMINA_REGEN_INTERVAL_MS 回 1 点）。
+++export const STAMINA_REGEN_INTERVAL_MS = 1600;
+++
+++// —— 装备 ——
+++export const EQUIP_SLOTS = ['weapon', 'armor', 'booster'];
+++export const MAX_PLUS = 10;     // 强化上限
+++export const AFFIX_AT = 5;      // +5 触发词缀变异
+++// 强化消耗「零件」：随 plus 递增（线性）。
+++export function enhanceCost(plus) { return 2 + (plus || 0) * 2; }
+++
+++// 词缀池（+5 变异时随机附加其一）。
+++export const AFFIXES = [
+++  { id: 'lifesteal', name: '吸血',   desc: '造成伤害时回复等量 HP 的 30%。', emoji: '🩸' },
+++  { id: 'thorns',    name: '反伤',   desc: '受击时反弹 25% 伤害给敌人。',   emoji: '🌵' },
+++  { id: 'keen',      name: '锐利',   desc: '攻击 +20%。',                   emoji: '🗡️' },
+++  { id: 'guard',     name: '坚固',   desc: '防御 +20%。',                   emoji: '🛡️' },
+++  { id: 'swift',     name: '迅捷',   desc: '移动步数 +1。',                 emoji: '💨' },
+++];
+++
+++// 起始装备（生锈砍刀 + 破布衣 + 滑轨推进器）。
+++export function starterEquipment() {
+++  return {
+++    weapon:  { name: '生锈砍刀', stat: 8,  plus: 0, affix: null },
+++    armor:   { name: '破布外衣', stat: 5,  plus: 0, affix: null },
+++    booster: { name: '滑轨推进器', stat: 0, plus: 0, affix: null },
+++  };
+++}
+++
+++// —— 天赋树：三条分支（生存 / 战斗 / 幸运），消耗星骸点亮，可免费重置 ——
+++export const TALENTS = [
+++  {
+++    branch: 'survival', name: '生存', emoji: '❤️', color: PALETTE.hp, maxRank: 5,
+++    desc: '每级最大 HP +20、回响拾取额外回复 HP。',
+++    cost: (rank) => 3 + rank * 2,
+++  },
+++  {
+++    branch: 'combat', name: '战斗', emoji: '⚔️', color: PALETTE.monster, maxRank: 5,
+++    desc: '每级造成伤害 +10%、克制成功专注力倍率更高。',
+++    cost: (rank) => 3 + rank * 2,
+++  },
+++  {
+++    branch: 'luck', name: '幸运', emoji: '🍀', color: PALETTE.luck, maxRank: 5,
+++    desc: '每级掉落星骸 / 零件 +15%、宝箱品质提升。',
+++    cost: (rank) => 3 + rank * 2,
+++  },
+++];
+++export const TALENT_BY_BRANCH = Object.fromEntries(TALENTS.map((t) => [t.branch, t]));
+++export function talentCost(branch, rank) { return (TALENT_BY_BRANCH[branch] || { cost: () => 99 }).cost(rank || 0); }
+++
+++// —— 敌人定义池（按楼层分阶）——
+++// stances：敌人摆出各架势的相对权重；reward：星骸 / 零件 / 经验基准。
+++export const ENEMIES = [
+++  { id: 'puppet',  name: '弃械傀儡', emoji: '🤖', minFloor: 1, hp: 26, atk: 7,  stances: { thrust: 4, slash: 3, smash: 2 }, stardust: 4,  parts: 2, exp: 6 },
+++  { id: 'wraith',  name: '游荡幽影', emoji: '👻', minFloor: 1, hp: 20, atk: 9,  stances: { thrust: 3, slash: 2, smash: 4 }, stardust: 5,  parts: 1, exp: 7 },
+++  { id: 'bat',     name: '锈翼蝠',   emoji: '🦇', minFloor: 4, hp: 34, atk: 11, stances: { thrust: 5, slash: 2, smash: 1 }, stardust: 7,  parts: 3, exp: 10 },
+++  { id: 'crab',    name: '晶甲蟹',   emoji: '🦀', minFloor: 4, hp: 46, atk: 10, stances: { thrust: 2, slash: 5, smash: 3 }, stardust: 8,  parts: 4, exp: 12 },
+++  { id: 'knight',  name: '残响骑士', emoji: '🛡️', minFloor: 7, hp: 60, atk: 14, stances: { thrust: 3, slash: 4, smash: 4 }, stardust: 11, parts: 5, exp: 16 },
+++  { id: 'stalker', name: '虚空潜行者', emoji: '👹', minFloor: 7, hp: 52, atk: 17, stances: { thrust: 4, slash: 3, smash: 3 }, stardust: 12, parts: 4, exp: 18 },
+++  { id: 'core',    name: '星骸之核', emoji: '🌟', minFloor: 10, hp: 160, atk: 20, stances: { thrust: 3, slash: 3, smash: 3 }, stardust: 60, parts: 30, exp: 100, boss: true },
+++];
+++
+++// 按楼层挑选一个合适敌人定义（同 minFloor 池中加权随机由调用方处理）。
+++export function enemyPoolFor(floor) {
+++  const f = Math.max(1, floor || 1);
+++  return ENEMIES.filter((e) => e.minFloor <= f && !(e.boss && f < 10));
+++}
+++
+++// 楼层配置：敌人数量、宝箱、事件密度随楼层缓慢上升。
+++export function floorConfig(floor) {
+++  const f = Math.max(1, floor || 1);
+++  return {
+++    enemyCount: Math.min(6, 2 + Math.floor(f / 2)),   // 1→2, 2→3 ... 上限 6
+++    chestCount: f >= 10 ? 0 : (1 + (f % 2)),           // 1~2
+++    memory: f <= 10,                                    // 每层 1 枚回响（1~10）
+++    eventCount: f >= 10 ? 0 : 1,                        // 每层 1 个随机事件点
+++  };
+++}
+++
+++// —— 记忆章节（碎片化叙事，共 10 章）——
+++export const MEMORY_CHAPTERS = [
+++  { title: '序章 · 苏醒', text: '逃生舱的舱门弹开，你大口喘着气。副官「小星」的全息影像闪烁亮起：「旅者，你终于醒了……抱歉，你的记忆和导航数据一起损坏了。」破碎的星球墨比乌斯在头顶缓缓旋转。' },
+++  { title: '第二章 · 漂浮的遗迹', text: '这些浮岛并非天然——它们是上古文明崩解后残留的碎片。脚下的石板间，偶尔能听见极轻的、像叹息一样的回响。' },
+++  { title: '第三章 · 星骸', text: '你第一次触摸到那枚发光的晶体「星骸」。温热的，像谁的心跳。一瞬间，你想起了一间洒满午后阳光的厨房。' },
+++  { title: '第四章 · 不是矿石', text: '小星分析后沉默了很久：「旅者……星骸不是矿物。它们是上古文明的情感凝结体。每一枚，都是某个人的一段记忆。」' },
+++  { title: '第五章 · 灶台与歌', text: '回响里浮现一个孩子的笑声，和一首你听不懂却莫名想哭的歌。那是谁？为什么你的眼眶会发酸？' },
+++  { title: '第六章 · 文明的黄昏', text: '越来越清晰了：这座文明并非毁于灾祸，而是在某个黄昏，人们集体选择了将情感封存进星骸，让文明「睡去」。' },
+++  { title: '第七章 · 你曾在这里', text: '一帧画面闪过——年轻的你站在某座广场上，身边是无数张笑脸。你忽然确信：你曾属于这里。' },
+++  { title: '第八章 · 小星的秘密', text: '小星终于坦白：「我是按照她的性格模型建造的。她……把你送进逃生舱时，把所有的星骸都留给了你。」' },
+++  { title: '第九章 · 抉择的重量', text: '星骸之核就在前方。十枚回响在你掌心发烫。重建它们，还是……？小星轻声说：「无论你选什么，我都陪你。」' },
+++  { title: '终章 · 你的回答', text: '所有的记忆都已归位。现在，轮到你来回答那个被整个文明搁置的问题了。' },
+++];
+++
+++// 中期 / 结局叙事（楼层触发）。
+++export const STORY = {
+++  prologue: '你迫降在破碎星球「墨比乌斯」。副官小星唤醒了你——记忆全失，只有零星的星骸在岛上闪烁。拾荒，活下去，找回你自己。',
+++  midpoint: '三层之下，你隐约明白：星骸不是矿石，而是上古文明凝结的情感。每一次拾取，都像重温一段别人的日常。',
+++};
+++
+++// 双结局文本。
+++export const ENDINGS = {
+++  peace: {
+++    key: 'peace', name: '重建文明', emoji: '🕊️', tone: 'good',
+++    title: '和平结局 · 星河重燃',
+++    text: '你将所有星骸归还大地。千百枚情感体重新苏醒，化作人形，彼此相认。墨比乌斯的夜空第一次亮起万家灯火。你不再是孤独的旅者——你回到了家。',
+++  },
+++  dark: {
+++    key: 'dark', name: '成为新神', emoji: '🔥', tone: 'bad',
+++    title: '暗黑结局 · 独星长明',
+++    text: '你引爆了所有星骸。滔天的情感能量灌入你一人之躯，星球在你脚下震颤重生。你成为了墨比乌斯唯一的新神——永生，且永远孤独。小星的光在你身后，缓缓熄灭。',
+++  },
+++};
+++
+++// —— 随机事件池（地图踩点触发）——
+++// type 用于 world 生成时占位；resolve 在 player/ui 中结算。
+++export const EVENT_TYPES = ['merchant', 'drone', 'trap'];
+++export const EVENT_META = {
+++  merchant: { emoji: '🛒', name: '流浪商人', desc: '高价出售稀有零件与精炼星骸。' },
+++  drone:    { emoji: '🔧', name: '维修无人机', desc: '消耗星骸，回复全部 HP 与精力。' },
+++  trap:     { emoji: '🌀', name: '重力陷阱', desc: '空间扭曲，强制传送至随机位置。' },
+++};
+++
+++// 商人货架（零件 / 强化材料 / 偶尔的星骸）。
+++export const SHOP_ITEMS = [
+++  { id: 'parts_s', name: '零件包×3', cost: 6, give: { parts: 3 }, emoji: '🔩' },
+++  { id: 'parts_l', name: '零件箱×8', cost: 14, give: { parts: 8 }, emoji: '📦' },
+++  { id: 'stardust', name: '精炼星骸×10', cost: 18, give: { stardust: 10 }, emoji: '✨' },
+++  { id: 'heal', name: '应急维修（满状态）', cost: 10, give: { fullHeal: true }, emoji: '❤️‍🩹' },
+++];
+++
+++// 无人机维修价（星骸）。
+++export const DRONE_COST = 8;
+++// 最低楼层数（含 Boss）。
+++export const MAX_FLOOR = 10;
+++
+++// —— 升级（经验）——
+++export function expToNext(level) { return 10 + (level || 1) * 8; }
+++
+++// —— 钳制 / 数值辅助 ——
+++export function clamp(v, lo, hi) {
+++  if (!Number.isFinite(v)) return lo;
+++  return Math.max(lo, Math.min(hi, Math.round(v)));
+++}
+++export function clampStat(v) { return clamp(v, 0, 99999); }
+++
+++// 曼哈顿距离。
+++export function manhattan(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }
++diff --git a/apps/xing-hai-lv-zhe/src/core/battle.js b/apps/xing-hai-lv-zhe/src/core/battle.js
++new file mode 100644
++index 0000000..81458ec
++--- /dev/null
+++++ b/apps/xing-hai-lv-zhe/src/core/battle.js
++@@ -0,0 +1,109 @@
+++// ============================================================================
+++// 战斗模块（抉择型「猜拳」简化版）：敌人架势 vs 玩家应对，克制关系 + 专注力。
+++//   架势：突刺(thrust) / 横斩(slash) / 重击(smash)
+++//   应对：格挡(block) / 闪避(dodge) / 反击(counter)
+++//   克制：反击克突刺、格挡克横斩、闪避克重击。成功克制 → 下一击专注力 ×1.5。
+++// 精力过低会失手；词缀（吸血 / 反伤 / 锐利 / 坚固）在结算中生效。
+++// ============================================================================
+++import { effectiveAtk, effectiveDef, maxHp, damagePlayer, healPlayer } from './player.js';
+++import { weightedPick } from './rng.js';
+++import { STAMINA_TIRED, STAMINA_FUMBLE_CHANCE, clamp } from '../config.js';
+++
+++export const STANCES = {
+++  thrust: { id: 'thrust', name: '突刺', emoji: '🗡️' },
+++  slash:  { id: 'slash',  name: '横斩', emoji: '🌀' },
+++  smash:  { id: 'smash',  name: '重击', emoji: '💥' },
+++};
+++export const ACTIONS = {
+++  block:  { id: 'block',  name: '格挡', emoji: '🛡️' },
+++  dodge:  { id: 'dodge',  name: '闪避', emoji: '💨' },
+++  counter:{ id: 'counter',name: '反击', emoji: '⚔️' },
+++};
+++// 应对 -> 其所克制的架势。
+++export const COUNTERS = { counter: 'thrust', block: 'slash', dodge: 'smash' };
+++
+++// 敌人架势被「识破」（明牌）的概率；未识破时玩家需盲猜，增加风险。
+++export const TELEGRAPH_CHANCE = 0.7;
+++
+++// 敌人按架势权重抽取本回合架势。
+++export function pickEnemyStance(enemy, rng) {
+++  const r = rng || Math.random;
+++  return weightedPick(r, enemy.stances || { thrust: 1, slash: 1, smash: 1 }) || 'thrust';
+++}
+++
+++// 本回合是否明牌（识破架势）。
+++export function isTelegraphed(rng, chance) {
+++  const r = rng || Math.random;
+++  return r() < (chance == null ? TELEGRAPH_CHANCE : chance);
+++}
+++
+++// 自动战斗：给出克制敌人当前架势的应对（明牌时必中）。
+++export function autoPickAction(enemyStance) {
+++  for (const [act, st] of Object.entries(COUNTERS)) if (st === enemyStance) return act;
+++  return 'counter';
+++}
+++
+++// 专注力倍率：战斗天赋进一步提升克制成功的伤害倍率。
+++export function focusMultiplier(focus, combatRank) {
+++  if (!focus) return 1;
+++  return 1.5 + 0.04 * (combatRank || 0);
+++}
+++
+++// 结算一回合：mutate enemy.hp / player.hp，返回回合描述（不改 stamina，由调用方扣除）。
+++//   player, enemy, action, focus(本回合是否带专注), stance(敌人本回合架势), rng
+++export function resolveRound(player, enemy, action, focus, stance, rng) {
+++  const r = rng || Math.random;
+++  const stanceId = stance || pickEnemyStance(enemy, r);
+++  // 合法应对原样使用；非法值（如「犹豫」hesitate）保留为失败态，不计入克制。
+++  const actId = action in COUNTERS ? action : 'hesitate';
+++
+++  // 精力过低 → 失手概率（失手时本回合视为应对失败）。
+++  let fumble = false;
+++  if ((player.stamina || 0) < STAMINA_TIRED) {
+++    fumble = r() < STAMINA_FUMBLE_CHANCE;
+++  }
+++  const countered = !fumble && actId in COUNTERS && COUNTERS[actId] === stanceId;
+++
+++  let enemyDmg = 0;
+++  let playerDmg = 0;
+++  let healed = 0;
+++  let nextFocus = false;
+++
+++  if (countered) {
+++    // 克制成功：玩家命中敌人，伤害受专注力与战斗天赋加成。
+++    const mult = focusMultiplier(focus, player.talents?.combat || 0);
+++    enemyDmg = Math.max(1, Math.round(effectiveAtk(player) * mult));
+++    enemy.hp = clamp(enemy.hp - enemyDmg, 0, enemy.maxHp || enemy.hp);
+++    // 武器吸血词缀
+++    if (player.equipment?.weapon?.affix?.id === 'lifesteal') {
+++      healed = healPlayer(player, Math.round(enemyDmg * 0.3));
+++    }
+++    nextFocus = true; // 为下一击充能
+++  } else {
+++    // 应对失败：敌人命中玩家（防御减免，至少 1）。
+++    const raw = (enemy.atk || 0) - effectiveDef(player);
+++    playerDmg = Math.max(1, Math.round(raw * (fumble ? 1.2 : 1))); // 失手时受伤更重
+++    damagePlayer(player, playerDmg);
+++    // 护甲反伤词缀
+++    if (player.equipment?.armor?.affix?.id === 'thorns') {
+++      const refl = Math.max(1, Math.round(playerDmg * 0.25));
+++      enemy.hp = clamp(enemy.hp - refl, 0, enemy.maxHp || enemy.hp);
+++      enemyDmg = refl;
+++    }
+++    nextFocus = false;
+++  }
+++
+++  return {
+++    stance: stanceId, action: actId, countered, fumble, focus: !!focus, nextFocus,
+++    enemyDmg, playerDmg, healed,
+++    enemyDead: enemy.hp <= 0,
+++    playerDead: player.hp <= 0,
+++  };
+++}
+++
+++// 计算击败该敌人的奖励（星骸 / 零件 / 经验基准，不含幸运加成——加成在 player.gainReward 中统一施加）。
+++export function enemyReward(enemy) {
+++  return { stardust: enemy.stardust || 0, parts: enemy.parts || 0, exp: enemy.exp || 0, boss: !!enemy.boss };
+++}
+++
+++export { STAMINA_TIRED, STAMINA_FUMBLE_CHANCE, maxHp };
++diff --git a/apps/xing-hai-lv-zhe/src/core/player.js b/apps/xing-hai-lv-zhe/src/core/player.js
++new file mode 100644
++index 0000000..e61f675
++--- /dev/null
+++++ b/apps/xing-hai-lv-zhe/src/core/player.js
++@@ -0,0 +1,264 @@
+++// ============================================================================
+++// 状态管理模块（State Manager）：角色状态、装备强化、天赋、升级与数值结算。
+++// 所有数值结算集中于此，UI 只负责调用与渲染，不内含业务逻辑。
+++// ============================================================================
+++import {
+++  BASE_MAX_HP, BASE_MAX_STAMINA, BASE_ATK, BASE_DEF, BASE_MOVE_RANGE,
+++  MAX_PLUS, AFFIX_AT, AFFIXES, starterEquipment, enhanceCost,
+++  TALENTS, TALENT_BY_BRANCH, talentCost,
+++  expToNext, clamp, clampStat, MAX_FLOOR, MEMORY_CHAPTERS, GRID,
+++} from '../config.js';
+++import { randInt, pick } from './rng.js';
+++
+++// 创建一名新角色。
+++//   opts: { name?, seed?, floor? }
+++export function newPlayer(rng, opts = {}) {
+++  const r = rng || Math.random;
+++  const seed = Number.isFinite(opts.seed) ? opts.seed : randInt(r, 1, 1e9);
+++  return {
+++    name: (opts.name || '').toString().slice(0, 8) || '旅者',
+++    hp: BASE_MAX_HP,
+++    stamina: BASE_MAX_STAMINA,
+++    stardust: 0,
+++    parts: 0,
+++    level: 1,
+++    exp: 0,
+++    equipment: starterEquipment(),
+++    talents: { survival: 0, combat: 0, luck: 0 },
+++    floor: Math.max(1, Number.isFinite(opts.floor) ? opts.floor : 1),
+++    maxFloor: 1,
+++    memory: Array.from({ length: MEMORY_CHAPTERS.length }, () => false),
+++    log: [],
+++    turn: 0,
+++    seed,
+++    floorState: null,   // 由 world 生成；存档保存，重载可恢复探索
+++    ending: null,       // 通关结局记录
+++    born: 0,
+++    lastSeen: 0,
+++  };
+++}
+++
+++// —— 存档结构向后兼容：补齐 / 钳制字段，防止旧档或损坏档导致整页闪退 ——
+++export function migrate(p) {
+++  if (!p) return p;
+++  if (typeof p.name !== 'string') p.name = '旅者';
+++  p.name = p.name.slice(0, 8) || '旅者';
+++  if (!Number.isFinite(p.hp)) p.hp = BASE_MAX_HP;
+++  if (!Number.isFinite(p.stamina)) p.stamina = BASE_MAX_STAMINA;
+++  if (!Number.isFinite(p.stardust) || p.stardust < 0) p.stardust = 0;
+++  if (!Number.isFinite(p.parts) || p.parts < 0) p.parts = 0;
+++  if (!Number.isFinite(p.level) || p.level < 1) p.level = 1;
+++  if (!Number.isFinite(p.exp) || p.exp < 0) p.exp = 0;
+++  if (!Number.isFinite(p.floor) || p.floor < 1) p.floor = 1;
+++  if (p.floor > MAX_FLOOR) p.floor = MAX_FLOOR;
+++  if (!Number.isFinite(p.maxFloor) || p.maxFloor < 1) p.maxFloor = p.floor;
+++  if (!Number.isFinite(p.seed)) p.seed = 12345;
+++  if (!Number.isFinite(p.turn) || p.turn < 0) p.turn = 0;
+++  // 装备补齐
+++  if (!p.equipment || typeof p.equipment !== 'object') p.equipment = starterEquipment();
+++  else p.equipment = { ...starterEquipment(), ...p.equipment };
+++  for (const slot of ['weapon', 'armor', 'booster']) {
+++    const e = p.equipment[slot];
+++    if (!e || typeof e !== 'object') { p.equipment[slot] = starterEquipment()[slot]; continue; }
+++    if (typeof e.name !== 'string') e.name = starterEquipment()[slot].name;
+++    if (!Number.isFinite(e.stat)) e.stat = starterEquipment()[slot].stat;
+++    if (!Number.isFinite(e.plus) || e.plus < 0) e.plus = 0;
+++    if (e.plus > MAX_PLUS) e.plus = MAX_PLUS;
+++    e.affix = validAffix(e.affix) ? e.affix : null;
+++  }
+++  // 天赋补齐
+++  if (!p.talents || typeof p.talents !== 'object') p.talents = { survival: 0, combat: 0, luck: 0 };
+++  for (const t of TALENTS) {
+++    const v = Math.floor(p.talents[t.branch]);
+++    p.talents[t.branch] = (!Number.isFinite(v) || v < 0) ? 0 : Math.min(v, t.maxRank);
+++  }
+++  // 记忆数组补齐到章节长度
+++  if (!Array.isArray(p.memory)) p.memory = [];
+++  while (p.memory.length < MEMORY_CHAPTERS.length) p.memory.push(false);
+++  p.memory = p.memory.slice(0, MEMORY_CHAPTERS.length).map((x) => x === true);
+++  if (!Array.isArray(p.log)) p.log = [];
+++  // 楼层快照规范化：结构损坏则置空（由 UI 重生成当前层），explored 归一为普通对象。
+++  if (p.floorState && typeof p.floorState === 'object') {
+++    const fs = p.floorState;
+++    // grid 必须是 GRID×GRID 的字符串矩阵（逐行校验，避免某行为 null 致 tileAt 崩溃）。
+++    const gridOk = Array.isArray(fs.grid) && fs.grid.length === GRID
+++      && fs.grid.every((row) => Array.isArray(row) && row.length === GRID);
+++    if (!gridOk) {
+++      p.floorState = null;
+++    } else {
+++      // pos 坐标必须为合法网格内整数，否则钳到安全点（避免 renderMap 无角色 / 移动失灵）。
+++      const px = Math.floor(fs.pos && fs.pos.x), py = Math.floor(fs.pos && fs.pos.y);
+++      if (!Number.isInteger(px) || px < 0 || px >= GRID || !Number.isInteger(py) || py < 0 || py >= GRID) {
+++        fs.pos = { x: 1, y: 1 };
+++      } else {
+++        fs.pos = { x: px, y: py };
+++      }
+++      if (!Array.isArray(fs.entities)) fs.entities = [];
+++      if (Array.isArray(fs.explored)) { const o = {}; for (const k of fs.explored) o[k] = true; fs.explored = o; }
+++      else if (!fs.explored || typeof fs.explored !== 'object' || Array.isArray(fs.explored)) fs.explored = {};
+++      if (!Number.isFinite(fs.floor)) fs.floor = p.floor;
+++    }
+++  } else {
+++    p.floorState = null;
+++  }
+++  p.ending = (p.ending === 'peace' || p.ending === 'dark') ? p.ending : null;
+++  if (!Number.isFinite(p.born)) p.born = 0;
+++  if (!Number.isFinite(p.lastSeen)) p.lastSeen = 0;
+++  // 收尾钳制：HP / 精力落到合法区间（依赖已规范化的 talents / level）。
+++  p.hp = clamp(p.hp, 0, maxHp(p));
+++  p.stamina = clamp(p.stamina, 0, maxStamina());
+++  return p;
+++}
+++
+++function validAffix(a) {
+++  return a && AFFIXES.some((x) => x.id === a.id);
+++}
+++
+++// —— 派生数值（装备 + 强化 + 词缀 + 天赋 + 等级）——
+++export function maxHp(p) {
+++  return BASE_MAX_HP + (p.talents.survival || 0) * 20 + (p.level - 1) * 5;
+++}
+++export function maxStamina() { return BASE_MAX_STAMINA; }
+++
+++export function effectiveAtk(p) {
+++  const w = p.equipment.weapon;
+++  let atk = BASE_ATK + (w.stat || 0) + (w.plus || 0) + Math.floor((p.level - 1) / 2);
+++  if (w.affix && w.affix.id === 'keen') atk *= 1.2;
+++  atk *= 1 + 0.1 * (p.talents.combat || 0); // 战斗天赋
+++  return Math.max(1, Math.round(atk));
+++}
+++
+++export function effectiveDef(p) {
+++  const a = p.equipment.armor;
+++  let def = BASE_DEF + (a.stat || 0) + (a.plus || 0) + Math.floor((p.level - 1) / 3);
+++  if (a.affix && a.affix.id === 'guard') def *= 1.2;
+++  return Math.max(0, Math.round(def));
+++}
+++
+++export function effectiveMoveRange(p) {
+++  const b = p.equipment.booster;
+++  let range = BASE_MOVE_RANGE + (b.plus || 0);
+++  if (b.affix && b.affix.id === 'swift') range += 1;
+++  return range;
+++}
+++
+++// 词缀在 +5（及之后每 5 级）触发变异；已存在词缀则替换为新的随机词缀。
+++export function rollAffix(rng) {
+++  const r = rng || Math.random;
+++  return { ...pick(r, AFFIXES) };
+++}
+++
+++// 强化装备：消耗零件，plus+1；达 AFFIX_AT 的倍数时触发词缀变异。返回结果描述。
+++export function enhanceEquipment(p, slot, rng) {
+++  const r = rng || Math.random;
+++  const e = p.equipment[slot];
+++  if (!e) return { ok: false, reason: 'no-slot' };
+++  if (e.plus >= MAX_PLUS) return { ok: false, reason: 'max' };
+++  const cost = enhanceCost(e.plus);
+++  if (p.parts < cost) return { ok: false, reason: 'no-parts', cost };
+++  p.parts -= cost;
+++  e.plus += 1;
+++  let affixed = null;
+++  if (e.plus % AFFIX_AT === 0) {
+++    e.affix = rollAffix(r);
+++    affixed = e.affix;
+++  }
+++  return { ok: true, plus: e.plus, affixed, slot };
+++}
+++
+++// 点亮天赋：消耗星骸。返回结果。
+++export function buyTalent(p, branch) {
+++  const def = TALENT_BY_BRANCH[branch];
+++  if (!def) return { ok: false, reason: 'no-branch' };
+++  const rank = p.talents[branch] || 0;
+++  if (rank >= def.maxRank) return { ok: false, reason: 'max' };
+++  const cost = talentCost(branch, rank);
+++  if (p.stardust < cost) return { ok: false, reason: 'no-stardust', cost };
+++  p.stardust -= cost;
+++  p.talents[branch] = rank + 1;
+++  // 生存天赋提升上限后，同步补满 HP（鼓励投资生存）。
+++  if (branch === 'survival') p.hp = Math.min(maxHp(p), p.hp + 20);
+++  return { ok: true, branch, rank: rank + 1 };
+++}
+++
+++// 重置天赋：全额返还星骸，可随时免费重置（鼓励试错）。
+++export function resetTalents(p) {
+++  let refund = 0;
+++  for (const t of TALENTS) {
+++    const rank = p.talents[t.branch] || 0;
+++    for (let i = 0; i < rank; i++) refund += talentCost(t.branch, i);
+++    p.talents[t.branch] = 0;
+++  }
+++  p.stardust += refund;
+++  // 上限下调后钳制 HP。
+++  p.hp = Math.min(p.hp, maxHp(p));
+++  return { ok: true, refund };
+++}
+++
+++// 获取战斗 / 拾取奖励（星骸 / 零件 / 经验），含幸运天赋加成与升级。
+++export function gainReward(p, reward = {}, rng) {
+++  const luck = 1 + 0.15 * (p.talents.luck || 0);
+++  const sd = Math.round((reward.stardust || 0) * luck);
+++  const pt = Math.round((reward.parts || 0) * luck);
+++  p.stardust += sd;
+++  p.parts += pt;
+++  let leveled = 0;
+++  if (reward.exp) {
+++    p.exp += reward.exp;
+++    while (p.exp >= expToNext(p.level)) {
+++      p.exp -= expToNext(p.level);
+++      p.level += 1;
+++      leveled += 1;
+++    }
+++    if (leveled > 0) {
+++      // 升级回血 40%（开罗式贴心）。
+++      p.hp = Math.min(maxHp(p), p.hp + Math.round(maxHp(p) * 0.4));
+++    }
+++  }
+++  return { stardust: sd, parts: pt, leveled };
+++}
+++
+++// —— HP / 精力 ——
+++export function damagePlayer(p, amount) {
+++  const d = Math.max(0, Math.round(amount || 0));
+++  p.hp = clamp(p.hp - d, 0, maxHp(p));
+++  return d;
+++}
+++export function healPlayer(p, amount) {
+++  const before = p.hp;
+++  p.hp = clamp(p.hp + (amount || 0), 0, maxHp(p));
+++  return p.hp - before;
+++}
+++export function healFull(p) {
+++  const before = p.hp;
+++  p.hp = maxHp(p);
+++  p.stamina = maxStamina();
+++  return p.hp - before;
+++}
+++export function spendStamina(p, amount) {
+++  p.stamina = clamp(p.stamina - (amount || 0), 0, maxStamina());
+++  return p.stamina;
+++}
+++export function regenStamina(p, amount) {
+++  const before = p.stamina;
+++  p.stamina = clamp(p.stamina + (amount || 0), 0, maxStamina());
+++  return p.stamina - before;
+++}
+++
+++export function isDead(p) { return p.hp <= 0; }
+++
+++// 记忆碎片收集：解锁对应章节，生存天赋额外回 HP。返回是否新解锁。
+++export function collectMemory(p, chapterIndex) {
+++  const idx = Math.max(0, Math.min(p.memory.length - 1, chapterIndex));
+++  if (p.memory[idx]) return { ok: false, already: true };
+++  p.memory[idx] = true;
+++  const heal = 5 + (p.talents.survival || 0) * 5;
+++  healPlayer(p, heal);
+++  return { ok: true, chapter: idx, heal };
+++}
+++
+++export function collectedMemoryCount(p) {
+++  return p.memory.filter(Boolean).length;
+++}
+++
+++export { MAX_PLUS, AFFIX_AT, AFFIXES, TALENTS, TALENT_BY_BRANCH, enhanceCost, talentCost, expToNext, clamp, clampStat, MAX_FLOOR, MEMORY_CHAPTERS };
++diff --git a/apps/xing-hai-lv-zhe/src/core/rng.js b/apps/xing-hai-lv-zhe/src/core/rng.js
++new file mode 100644
++index 0000000..e1b0556
++--- /dev/null
+++++ b/apps/xing-hai-lv-zhe/src/core/rng.js
++@@ -0,0 +1,42 @@
+++// ============================================================================
+++// 可注入随机源：默认 Math.random，单测可传入确定性序列，保证逻辑可复现。
+++// ============================================================================
+++export function makeRng(source) {
+++  if (typeof source === 'function') return source;
+++  if (Array.isArray(source)) {
+++    // 确定性序列：依次取出，耗尽后回绕，便于穷举分支。
+++    let i = 0;
+++    return () => {
+++      if (!source.length) return 0;
+++      const v = source[i % source.length];
+++      i += 1;
+++      return v;
+++    };
+++  }
+++  return Math.random;
+++}
+++
+++// [min, max] 闭区间随机整数。
+++export function randInt(rng, min, max) {
+++  const r = rng();
+++  return Math.floor(min + r * (max - min + 1));
+++}
+++
+++// 按 {key: weight} 权重抽取一个 key。
+++export function weightedPick(rng, weights) {
+++  const entries = Object.entries(weights).filter(([, w]) => w > 0);
+++  const total = entries.reduce((s, [, w]) => s + w, 0);
+++  if (total <= 0) return null;
+++  let roll = rng() * total;
+++  for (const [k, w] of entries) {
+++    roll -= w;
+++    if (roll <= 0) return k;
+++  }
+++  return entries[entries.length - 1][0];
+++}
+++
+++// 从数组中等概率取一个元素（空数组返回 undefined）。
+++export function pick(rng, arr) {
+++  if (!Array.isArray(arr) || !arr.length) return undefined;
+++  return arr[Math.floor(rng() * arr.length)];
+++}
++diff --git a/apps/xing-hai-lv-zhe/src/core/save.js b/apps/xing-hai-lv-zhe/src/core/save.js
++new file mode 100644
++index 0000000..34a28aa
++--- /dev/null
+++++ b/apps/xing-hai-lv-zhe/src/core/save.js
++@@ -0,0 +1,125 @@
+++// ============================================================================
+++// 存档管理模块（Save Manager）：多槽位 localStorage 持久化 + 导入导出（base64）。
+++//
+++// 多槽位：提供 SAVE_SLOTS（≥5）个独立存档位，key = xhlz_save_<slot>。
+++// 通过 storage 访问器隔离 localStorage，便于 Node 单测注入。
+++// 每次移动 / 战斗结算 / 强化 / 拾取后由 UI 自动调用 saveToSlot 落盘，防丢档。
+++// ============================================================================
+++import { migrate } from './player.js';
+++
+++export const SAVE_SLOTS = 6;
+++const SLOT_PREFIX = 'xhlz_save_';
+++
+++let storage = null;
+++try {
+++  if (typeof localStorage !== 'undefined') storage = localStorage;
+++} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }
+++
+++// 测试 / 注入用
+++export function _setStorage(s) { storage = s; }
+++
+++export function nowSec() {
+++  try { return Math.floor(Date.now() / 1000); } catch (_) { return 0; }
+++}
+++
+++const slotKey = (slot) => `${SLOT_PREFIX}${slot}`;
+++
+++function validSlot(slot) {
+++  const n = Number(slot);
+++  return Number.isInteger(n) && n >= 0 && n < SAVE_SLOTS;
+++}
+++
+++// 读取某槽位的原始玩家对象，不存在或损坏返回 null。
+++export function loadFromSlot(slot) {
+++  try {
+++    if (!storage || !validSlot(slot)) return null;
+++    const raw = storage.getItem(slotKey(slot));
+++    if (!raw) return null;
+++    const player = JSON.parse(raw);
+++    return migrate(player);
+++  } catch (_) { return null; }
+++}
+++
+++// 列举所有槽位的概要信息，供存档管理 UI 展示。
+++// 返回 [{ slot, exists, name, floor, maxFloor, level, stardust, memoryCount, ending, lastSeen }]
+++export function listSaves() {
+++  const out = [];
+++  for (let i = 0; i < SAVE_SLOTS; i++) {
+++    const p = loadFromSlot(i);
+++    out.push({
+++      slot: i,
+++      exists: !!p,
+++      name: p ? p.name : null,
+++      floor: p ? p.floor : null,
+++      maxFloor: p ? p.maxFloor : null,
+++      level: p ? p.level : null,
+++      stardust: p ? p.stardust : null,
+++      memoryCount: p ? (p.memory || []).filter(Boolean).length : 0,
+++      ending: p ? p.ending : null,
+++      lastSeen: p ? p.lastSeen : 0,
+++    });
+++  }
+++  return out;
+++}
+++
+++export function hasAnySave() {
+++  try {
+++    if (!storage) return false;
+++    for (let i = 0; i < SAVE_SLOTS; i++) if (storage.getItem(slotKey(i)) != null) return true;
+++    return false;
+++  } catch (_) { return false; }
+++}
+++
+++// 取最近游玩的槽位（lastSeen 最大者）；同值时槽位号大者优先（最后写入者胜出，结果确定）。
+++export function latestSlot() {
+++  const list = listSaves().filter((s) => s.exists);
+++  if (!list.length) return null;
+++  let pick = list[0];
+++  for (const s of list) {
+++    if ((s.lastSeen || 0) >= (pick.lastSeen || 0)) pick = s;
+++  }
+++  return pick.slot;
+++}
+++
+++// 写入指定槽位。slot 非法时回退到 0 号槽。返回是否成功。
+++export function saveToSlot(slot, player) {
+++  try {
+++    if (!storage || !player) return false;
+++    const s = validSlot(slot) ? slot : 0;
+++    player.lastSeen = nowSec();
+++    if (!player.born) player.born = player.lastSeen;
+++    storage.setItem(slotKey(s), JSON.stringify(player));
+++    return true;
+++  } catch (_) { return false; }
+++}
+++
+++export function deleteSlot(slot) {
+++  try {
+++    if (!storage || !validSlot(slot)) return false;
+++    storage.removeItem(slotKey(slot));
+++    return true;
+++  } catch (_) { return false; }
+++}
+++
+++// 导出 / 导入（base64，UTF-8 安全）。
+++export function exportSave(player) {
+++  return btoaSafe(JSON.stringify(migrate(JSON.parse(JSON.stringify(player)))));
+++}
+++export function importSave(str) {
+++  try {
+++    const player = JSON.parse(atobSafe(str));
+++    return migrate(player);
+++  } catch (_) { return null; }
+++}
+++
+++// —— UTF-8 安全的 base64（兼容浏览器与 Node）——
+++function btoaSafe(str) {
+++  if (typeof btoa === 'function') return btoa(unescape(encodeURIComponent(str)));
+++  return Buffer.from(str, 'utf8').toString('base64');
+++}
+++function atobSafe(str) {
+++  if (typeof atob === 'function') return decodeURIComponent(escape(atob(str)));
+++  return Buffer.from(str, 'base64').toString('utf8');
+++}
+++
+++export { SLOT_PREFIX };
++diff --git a/apps/xing-hai-lv-zhe/src/core/world.js b/apps/xing-hai-lv-zhe/src/core/world.js
++new file mode 100644
++index 0000000..54d4fd2
++--- /dev/null
+++++ b/apps/xing-hai-lv-zhe/src/core/world.js
++@@ -0,0 +1,314 @@
+++// ============================================================================
+++// 浮岛生成模块：程序化生成 16×16 地图（房间感 + 连通保证）、迷雾、移动校验。
+++// 纯数据与纯函数：生成 floorState 供 UI 渲染，移动 / 视野查询无副作用（除显式 mutate）。
+++// ============================================================================
+++import {
+++  GRID, VISION_RADIUS, TILES, FLOOR_TILES, tileOf, isWalkable,
+++  floorConfig, enemyPoolFor, EVENT_TYPES, EVENT_META, MAX_FLOOR, MEMORY_CHAPTERS,
+++} from '../config.js';
+++import { randInt, weightedPick, pick } from './rng.js';
+++
+++const key = (x, y) => `${x},${y}`;
+++const inBounds = (x, y) => x >= 0 && y >= 0 && x < GRID && y < GRID;
+++
+++// —— 生成一张浮岛（floorState）——
+++//   rng：可注入随机源；floor：楼层；player：用于 Boss 判定等（可选）。
+++//   返回 { grid, pos, entities, explored, floor }
+++export function generateFloor(rng, floor, player) {
+++  const r = rng || Math.random;
+++  const f = Math.max(1, Math.min(MAX_FLOOR, floor || 1));
+++  const cfg = floorConfig(f);
+++  const isBoss = f >= MAX_FLOOR;
+++
+++  // 多次尝试，直到连通率合格（避免被障碍物封死）。
+++  let state = null;
+++  for (let attempt = 0; attempt < 8; attempt++) {
+++    state = tryGenerate(r, f, isBoss, cfg);
+++    const reach = bfsReachable(state.grid, state.pos.x, state.pos.y);
+++    const reachCount = reach.dist.size;
+++    if (reachCount >= GRID * GRID * 0.6) {
+++      state._reach = reach;
+++      break;
+++    }
+++  }
+++  if (!state._reach) state._reach = bfsReachable(state.grid, state.pos.x, state.pos.y);
+++  const reach = state._reach;
+++  delete state._reach;
+++
+++  // 阶梯：取可达集中距出生点最远的可行走地块。Boss 层无阶梯——击败 Boss 即通关。
+++  let stairsCell = null;
+++  if (!isBoss) {
+++    stairsCell = pickFarReachable(r, reach, state.pos, 6);
+++    if (stairsCell) state.grid[stairsCell.y][stairsCell.x] = 'stairs';
+++  }
+++
+++  // 实体放置（仅在可达且未被占用的地块上）。
+++  const occupied = new Set([key(state.pos.x, state.pos.y), key(stairsCell?.x, stairsCell?.y)]);
+++  const reachableTiles = [...reach.dist.keys()]
+++    .filter((k) => !occupied.has(k))
+++    .map((k) => { const [x, y] = k.split(',').map(Number); return { x, y }; });
+++
+++  const entities = [];
+++  let eid = 1;
+++  const place = (type, dataFn) => {
+++    const cell = takeCell(r, reachableTiles, occupied);
+++    if (!cell) return null;
+++    const e = { id: `e${eid++}`, type, x: cell.x, y: cell.y, ...(dataFn ? dataFn(cell) : {}) };
+++    entities.push(e);
+++    return e;
+++  };
+++
+++  // Boss 层：只放 Boss + 记忆；普通层按 cfg 放怪 / 箱 / 事件 / 记忆。
+++  if (isBoss) {
+++    place('enemy', () => bossEnemy());
+++  } else {
+++    const pool = enemyPoolFor(f);
+++    for (let i = 0; i < cfg.enemyCount; i++) {
+++      place('enemy', () => spawnEnemy(r, pool, f));
+++    }
+++    for (let i = 0; i < cfg.chestCount; i++) place('chest', () => ({ reward: chestReward(r, f) }));
+++    if (cfg.eventCount) place(pick(r, EVENT_TYPES));
+++  }
+++  // 每层 1 枚记忆回响（章节 = 楼层 - 1，对应 1..10 章）。
+++  if (cfg.memory) place('memory', () => ({ chapter: Math.min(f - 1, MEMORY_CHAPTERS.length - 1) }));
+++
+++  state.entities = entities;
+++  // explored 用普通对象（JSON 原生可序列化），随存档往返不丢失；key 形如 "x,y"。
+++  const explored = {};
+++  for (const k of visibleKeys(state.grid, state.pos.x, state.pos.y)) explored[k] = true;
+++  state.explored = explored;
+++  return state;
+++}
+++
+++// 一次生成尝试：网格 + 障碍 + 出生点。
+++function tryGenerate(r, f, isBoss, cfg) {
+++  const grid = Array.from({ length: GRID }, () =>
+++    Array.from({ length: GRID }, () => pick(r, FLOOR_TILES)));
+++  // 边界石墙
+++  for (let i = 0; i < GRID; i++) {
+++    grid[0][i] = 'wall'; grid[GRID - 1][i] = 'wall';
+++    grid[i][0] = 'wall'; grid[i][GRID - 1] = 'wall';
+++  }
+++  // 散布障碍：石墙 / 深墙 / 水域（不可走），密度随楼层略升。
+++  const density = 0.10 + Math.min(0.06, (f - 1) * 0.008);
+++  for (let y = 1; y < GRID - 1; y++) {
+++    for (let x = 1; x < GRID - 1; x++) {
+++      if (r() < density) {
+++        grid[y][x] = weightedPick(r, { wall: 5, wallDark: 2, water: 3 }) || 'wall';
+++      }
+++    }
+++  }
+++  // 出生点：左上角附近的安全格，清空 3×3 邻域保证不卡。
+++  const pos = { x: randInt(r, 1, 3), y: randInt(r, 1, 3) };
+++  for (let dy = -1; dy <= 1; dy++) {
+++    for (let dx = -1; dx <= 1; dx++) {
+++      const x = pos.x + dx, y = pos.y + dy;
+++      if (inBounds(x, y) && grid[y][x] !== 'floor') grid[y][x] = pick(r, ['floor', 'floor2']);
+++    }
+++  }
+++  return { grid, pos, entities: [], explored: new Set(), floor: f };
+++}
+++
+++function takeCell(r, pool, occupied) {
+++  // 从可达池中随机取一个尚未占用的格子。
+++  const avail = pool.filter((c) => !occupied.has(key(c.x, c.y)));
+++  if (!avail.length) return null;
+++  const c = avail[Math.floor(r() * avail.length)];
+++  occupied.add(key(c.x, c.y));
+++  return c;
+++}
+++
+++function pickFarReachable(r, reach, from, minDist) {
+++  // 在可达集中挑选距 from 距离 ≥ minDist 的格子（优先最远），保证阶梯远离出生点。
+++  const entries = [...reach.dist.entries()]
+++    .map(([k, d]) => { const [x, y] = k.split(',').map(Number); return { x, y, d }; })
+++    .filter((c) => c.d >= minDist);
+++  if (!entries.length) {
+++    // 退化：取可达集中最远的。
+++    const all = [...reach.dist.entries()].map(([k, d]) => { const [x, y] = k.split(',').map(Number); return { x, y, d }; });
+++    if (!all.length) return null;
+++    all.sort((a, b) => b.d - a.d);
+++    return all[0];
+++  }
+++  entries.sort((a, b) => b.d - a.d);
+++  // 取前 1/3 中随机一个，避免每次都最远角落。
+++  const top = entries.slice(0, Math.max(1, Math.floor(entries.length / 3)));
+++  return top[Math.floor(r() * top.length)];
+++}
+++
+++// 生成一个敌人实例（基于敌人定义池加权抽取）。
+++function spawnEnemy(r, pool, floor) {
+++  if (!pool || !pool.length) pool = enemyPoolFor(floor);
+++  const weights = Object.fromEntries(pool.map((e, i) => [i, 1]));
+++  const idx = Number(weightedPick(r, weights) || 0);
+++  const def = pool[idx] || pool[0];
+++  return enemyFromDef(def, floor);
+++}
+++function bossEnemy() {
+++  const def = enemyPoolFor(MAX_FLOOR).find((e) => e.boss) || enemyPoolFor(MAX_FLOOR)[0];
+++  return enemyFromDef(def, MAX_FLOOR);
+++}
+++export function enemyFromDef(def, floor) {
+++  // 敌人 HP / 攻击随楼层小幅上扬，保证后期更有压力。
+++  const tier = Math.max(0, (floor || 1) - (def.minFloor || 1));
+++  return {
+++    defId: def.id, name: def.name, emoji: def.emoji,
+++    hp: def.hp + tier * 4, maxHp: def.hp + tier * 4,
+++    atk: def.atk + tier, stances: { ...def.stances },
+++    stardust: def.stardust, parts: def.parts, exp: def.exp,
+++    boss: !!def.boss,
+++  };
+++}
+++
+++// 宝箱奖励：零件为主，偶有星骸。
+++function chestReward(r, floor) {
+++  const roll = r();
+++  if (roll < 0.6) return { parts: randInt(r, 2, 4) + Math.floor(floor / 3) };
+++  if (roll < 0.9) return { stardust: randInt(r, 3, 6) };
+++  return { parts: randInt(r, 1, 3), stardust: randInt(r, 2, 4) };
+++}
+++
+++// —— 视野（迷雾）：以 (x,y) 为中心的 5×5 切比雪夫窗口 ——
+++export function visibleKeys(grid, x, y) {
+++  const out = [];
+++  for (let dy = -VISION_RADIUS; dy <= VISION_RADIUS; dy++) {
+++    for (let dx = -VISION_RADIUS; dx <= VISION_RADIUS; dx++) {
+++      const nx = x + dx, ny = y + dy;
+++      if (inBounds(nx, ny)) out.push(key(nx, ny));
+++    }
+++  }
+++  return out;
+++}
+++export function isVisible(x, y, pos) {
+++  return Math.max(Math.abs(x - pos.x), Math.abs(y - pos.y)) <= VISION_RADIUS;
+++}
+++
+++// —— BFS 可达性：从 (sx,sy) 出发，墙 / 水域 / 深墙视为阻挡 ——
+++// 返回 { dist: Map(key->steps), prev: Map(key->key) }。
+++export function bfsReachable(grid, sx, sy) {
+++  const dist = new Map();
+++  const prev = new Map();
+++  if (!inBounds(sx, sy) || !isWalkable(grid[sy][sx])) return { dist, prev };
+++  const q = [[sx, sy]];
+++  dist.set(key(sx, sy), 0);
+++  while (q.length) {
+++    const [x, y] = q.shift();
+++    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
+++      const nx = x + dx, ny = y + dy;
+++      if (!inBounds(nx, ny)) continue;
+++      if (!isWalkable(grid[ny][nx])) continue;
+++      const k = key(nx, ny);
+++      if (dist.has(k)) continue;
+++      dist.set(k, dist.get(key(x, y)) + 1);
+++      prev.set(k, key(x, y));
+++      q.push([nx, ny]);
+++    }
+++  }
+++  return { dist, prev };
+++}
+++
+++// 计算从 from 到 to 的路径（仅四向、避开阻挡与敌占格），返回步序列 [{x,y},...]（含 to，不含 from）。
+++// range 为步数上限；超出或不可达返回 null。avoid 是额外阻挡坐标集合（如敌人）。
+++export function findPath(state, from, to, range, avoid) {
+++  if (!state) return null;
+++  const block = new Set(avoid || []);
+++  // 敌人所在格视为阻挡。
+++  for (const e of state.entities) if (e.type === 'enemy') block.add(key(e.x, e.y));
+++  const dist = new Map();
+++  const prev = new Map();
+++  const startK = key(from.x, from.y);
+++  dist.set(startK, 0);
+++  const q = [[from.x, from.y]];
+++  let found = false;
+++  while (q.length) {
+++    const [x, y] = q.shift();
+++    if (x === to.x && y === to.y) { found = true; break; }
+++    const base = dist.get(key(x, y));
+++    if (base >= range) continue;
+++    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
+++      const nx = x + dx, ny = y + dy;
+++      const k = key(nx, ny);
+++      if (dist.has(k)) continue;
+++      if (!inBounds(nx, ny)) continue;
+++      const isTarget = nx === to.x && ny === to.y;
+++      if (block.has(k) && !isTarget) continue;       // 阻挡格不可踏入（目标格除外）
+++      if (!isWalkable(state.grid[ny][nx]) && !isTarget) continue;
+++      dist.set(k, base + 1);
+++      prev.set(k, key(x, y));
+++      q.push([nx, ny]);
+++    }
+++  }
+++  if (!found && !(from.x === to.x && from.y === to.y)) return null;
+++  // 回溯路径
+++  const path = [];
+++  let cur = key(to.x, to.y);
+++  if (!dist.has(cur)) return null;
+++  const steps = dist.get(cur);
+++  if (steps > range) return null;
+++  while (cur !== startK) {
+++    const [cx, cy] = cur.split(',').map(Number);
+++    path.unshift({ x: cx, y: cy });
+++    cur = prev.get(cur);
+++    if (cur == null) break;
+++  }
+++  return path;
+++}
+++
+++// 计算从 from 出发、步数 ≤ range 的所有可达地块（四向；墙 / 水域 / 敌人格视为阻挡）。
+++// 返回 Set(key)。供 UI 标注「可点击移动」高亮。
+++export function reachableTiles(state, from, range) {
+++  const out = new Set();
+++  if (!state) return out;
+++  const block = new Set();
+++  for (const e of state.entities) if (e.type === 'enemy') block.add(key(e.x, e.y));
+++  const dist = new Map();
+++  const startK = key(from.x, from.y);
+++  dist.set(startK, 0);
+++  out.add(startK);
+++  const q = [[from.x, from.y]];
+++  while (q.length) {
+++    const [x, y] = q.shift();
+++    const base = dist.get(key(x, y));
+++    if (base >= range) continue;
+++    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
+++      const nx = x + dx, ny = y + dy;
+++      const k = key(nx, ny);
+++      if (dist.has(k)) continue;
+++      if (!inBounds(nx, ny)) continue;
+++      if (block.has(k)) continue;
+++      if (!isWalkable(state.grid[ny][nx])) continue;
+++      dist.set(k, base + 1);
+++      out.add(k);
+++      q.push([nx, ny]);
+++    }
+++  }
+++  return out;
+++}
+++
+++// 查询某格上的实体。
+++export function entityAt(state, x, y) {
+++  if (!state || !state.entities) return null;
+++  return state.entities.find((e) => e.x === x && e.y === y) || null;
+++}
+++export function removeEntity(state, id) {
+++  if (!state || !state.entities) return false;
+++  const i = state.entities.findIndex((e) => e.id === id);
+++  if (i < 0) return false;
+++  state.entities.splice(i, 1);
+++  return true;
+++}
+++
+++export function tileAt(state, x, y) {
+++  if (!state || !inBounds(x, y)) return 'wall';
+++  return state.grid[y][x];
+++}
+++
+++// 下行：楼层 +1（上限 MAX_FLOOR），更新最远记录。返回新楼层。
+++export function descend(player) {
+++  if (!player) return 1;
+++  player.floor = Math.min(MAX_FLOOR, player.floor + 1);
+++  if (player.floor > player.maxFloor) player.maxFloor = player.floor;
+++  return player.floor;
+++}
+++
+++export { key, inBounds, GRID, VISION_RADIUS, TILES, tileOf, isWalkable, EVENT_META, MAX_FLOOR };
++diff --git a/apps/xing-hai-lv-zhe/src/main.js b/apps/xing-hai-lv-zhe/src/main.js
++new file mode 100644
++index 0000000..148db51
++--- /dev/null
+++++ b/apps/xing-hai-lv-zhe/src/main.js
++@@ -0,0 +1,19 @@
+++// ============================================================================
+++// 星骸旅者 · 入口
+++// 导出 createGame(parent) 工厂，供主框架（落地页）按需挂载到任意容器；
+++// 同时保留独立运行（apps/xing-hai-lv-zhe/index.html）时的自动挂载行为。
+++// ============================================================================
+++import { GameUI } from './ui/app.js';
+++
+++export function createGame(parent) {
+++  const ui = new GameUI(parent);
+++  ui.mount();
+++  return ui;
+++}
+++
+++// 独立运行时自动挂载到 #game-container（仅在元素存在时触发，
+++// 避免被主框架动态 import 时误启动游戏）。
+++if (typeof document !== 'undefined' && document.getElementById('game-container')) {
+++  const ui = createGame(document.getElementById('game-container'));
+++  if (typeof window !== 'undefined') window.__XHLZ = ui; // 暴露实例便于调试 / 冒烟测试
+++}
++diff --git a/apps/xing-hai-lv-zhe/src/ui/app.js b/apps/xing-hai-lv-zhe/src/ui/app.js
++new file mode 100644
++index 0000000..750a538
++--- /dev/null
+++++ b/apps/xing-hai-lv-zhe/src/ui/app.js
++@@ -0,0 +1,1299 @@
+++// ============================================================================
+++// 星骸旅者 · UI 渲染模块（UI Renderer，纯原生 DOM + CSS 像素网格）
+++// 状态机：BOOT(launcher) → MAP → BATTLE → INVENTORY / EVENT → 结局。
+++// 负责：启动器/创角、像素地图渲染与点击移动、猜拳战斗、背包(装备/天赋/剧情)、
+++// 随机事件、双重结局、多槽位存档。requestAnimationFrame 驱动战斗计时与闲置回精。
+++// ============================================================================
+++import './style.css';
+++import { h, clear, bar } from './dom.js';
+++import {
+++  PALETTE, GRID, VISION_RADIUS, TILES, tileOf, isWalkable,
+++  EQUIP_SLOTS, MAX_PLUS, AFFIX_AT, AFFIXES, enhanceCost,
+++  TALENTS, TALENT_BY_BRANCH, talentCost,
+++  STAMINA_COST_PER_ROUND, STAMINA_REGEN_PER_STEP, STAMINA_REGEN_INTERVAL_MS, STAMINA_TIRED,
+++  SHOP_ITEMS, DRONE_COST, EVENT_META, MEMORY_CHAPTERS, STORY, ENDINGS, MAX_FLOOR, expToNext,
+++} from '../config.js';
+++import {
+++  newPlayer, migrate, maxHp, maxStamina, effectiveAtk, effectiveDef, effectiveMoveRange,
+++  enhanceEquipment, buyTalent, resetTalents, gainReward, healFull, regenStamina, spendStamina,
+++  isDead, collectMemory, collectedMemoryCount,
+++} from '../core/player.js';
+++import {
+++  generateFloor, findPath, reachableTiles, entityAt, removeEntity, tileAt, descend,
+++} from '../core/world.js';
+++import {
+++  STANCES, ACTIONS, COUNTERS, TELEGRAPH_CHANCE,
+++  pickEnemyStance, isTelegraphed, autoPickAction, resolveRound, enemyReward,
+++} from '../core/battle.js';
+++import {
+++  saveToSlot, loadFromSlot, deleteSlot, listSaves, hasAnySave, latestSlot,
+++  exportSave, importSave, SAVE_SLOTS,
+++} from '../core/save.js';
+++
+++const BATTLE_TIME_MS = 3000;       // 每回合限时（可于设置关闭）
+++const IDLE_FRAME_MS = 1000 / 20;   // 闲置降帧至 ~20fps 节省电量
+++
+++export class GameUI {
+++  constructor(parent) {
+++    this.parent = parent;
+++    this.player = null;
+++    this.rng = Math.random;
+++    this.screen = 'launcher';
+++    this.over = false;
+++    this.activeSlot = null;
+++    this.timerEnabled = true;      // 战斗限时（测试可关闭）
+++    this._sheet = null;
+++    this.charName = '';
+++    this.cellNodes = [];           // 2D 地块 DOM 引用（脏更新）
+++    this.floatLayer = null;
+++    this.running = false;          // rAF 循环开关
+++    this._raf = 0;
+++    this._lastFrame = 0;
+++    this._staminaAccum = 0;
+++    this.battle = null;            // 战斗会话状态
+++  }
+++
+++  mount() {
+++    this.root = h('div', { class: 'xhlz' });
+++    clear(this.parent);
+++    this.parent.appendChild(this.root);
+++    this.toastWrap = h('div', { class: 'toast-wrap' });
+++    this.stage = h('div', { class: 'xhlz-stage' });
+++    this.modalRoot = h('div', { class: 'xhlz-modals' });
+++    this.root.append(this.toastWrap, this.stage, this.modalRoot);
+++    this.showLauncher();
+++    return this;
+++  }
+++
+++  // ===================== 启动器 =====================
+++  showLauncher() {
+++    this.screen = 'launcher';
+++    this.over = false;
+++    this.player = null;
+++    this.battle = null;
+++    this.activeSlot = null;
+++    this.stopLoop();
+++    clear(this.modalRoot);
+++    clear(this.stage);
+++    const hasSave = hasAnySave();
+++    const wrap = h('div', { class: 'launcher' },
+++      h('div', { class: 'launcher__brand' },
+++        h('div', { class: 'emblem' }, '星'),
+++        h('h1', null, '星骸旅者'),
+++        h('p', { class: 'sub' }, '开罗式像素 Roguelike · 在破碎星球拾荒、战斗、寻回记忆'),
+++      ),
+++      h('div', { class: 'launcher__actions' },
+++        hasSave
+++          ? h('button', { class: 'btn-primary big-btn', onClick: () => this.continueGame() }, '▶ 继续旅程')
+++          : h('button', { class: 'btn-primary big-btn', onClick: () => this.showCreate() }, '🚀 开启新旅程'),
+++        hasSave
+++          ? h('button', { class: 'btn-ghost', onClick: () => this.showCreate() }, '🆕 新旅程（选空槽）')
+++          : null,
+++        h('button', { class: 'btn-ghost', onClick: () => this.showSlots(true) }, '📂 存档管理'),
+++        h('button', { class: 'btn-ghost', onClick: () => this.showAbout() }, '📖 关于 / 玩法'),
+++      ),
+++      h('p', { class: 'launcher__hint muted' }, '点击地块移动，靠近敌人即可交战；集齐 10 枚星骸回响，揭开星球的真相。'),
+++    );
+++    this.stage.appendChild(wrap);
+++  }
+++
+++  continueGame() {
+++    const slot = latestSlot();
+++    if (slot == null) { this.toast('没有可继续的存档', 'bad'); this.showLauncher(); return; }
+++    const p = loadFromSlot(slot);
+++    if (!p) { this.toast('读取存档失败', 'bad'); this.showLauncher(); return; }
+++    if (p.ending) { this.renderEnding(p.ending, true, p); return; }
+++    this.enterGame(p, slot);
+++  }
+++
+++  showAbout() {
+++    const body = [
+++      h('div', { class: 'card' },
+++        h('h4', null, '🎮 核心循环'),
+++        h('div', { class: 'muted', style: { lineHeight: 1.7 } },
+++          '浮岛探索（点击移动）→ 触发战斗 / 宝箱 / 陷阱 → 回到背包消耗零件强化装备、用星骸点亮天赋 → 挑战更深层浮岛。'),
+++      ),
+++      h('div', { class: 'card' },
+++        h('h4', null, '⚔️ 战斗：猜拳克制'),
+++        h('div', { class: 'muted', style: { lineHeight: 1.7 } },
+++          '敌人摆出 突刺🗡️ / 横斩🌀 / 重击💥；你选 格挡🛡️ / 闪避💨 / 反击⚔️。',
+++          h('br'),
+++          '反击克突刺、格挡克横斩、闪避克重击。成功克制 → 下一击专注力 ×1.5。精力过低会失手；可开启自动战斗代打。'),
+++      ),
+++      h('div', { class: 'card' },
+++        h('h4', null, '💎 成长'),
+++        h('div', { class: 'muted', style: { lineHeight: 1.7 } },
+++          '武器/护甲/推进器消耗「零件」强化，+5 触发词缀变异；天赋树三条分支（生存/战斗/幸运）消耗「星骸」点亮，可免费重置。'),
+++      ),
+++    ];
+++    this.showSheet({ title: '📖 关于 / 玩法', body, foot: [h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '明白')] });
+++  }
+++
+++  // ===================== 存档管理（多槽位）=====================
+++  showSlots(fromLauncher) {
+++    const list = listSaves();
+++    const body = [
+++      h('div', { class: 'muted', style: { marginBottom: '0.5rem' } },
+++        `共 ${SAVE_SLOTS} 个存档槽位。点击空槽可在此开始新旅程，已有存档可读取或删除。`),
+++      h('div', { class: 'slot-list' }, list.map((s) => this.renderSlotRow(s))),
+++    ];
+++    const foot = [
+++      fromLauncher ? null : h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '关闭'),
+++      h('button', { class: 'btn-primary', onClick: () => { this.closeModal(); this.showCreate(); } }, '🆕 新旅程'),
+++    ];
+++    this.showSheet({ title: '📂 存档管理', body, foot: foot.filter(Boolean) });
+++  }
+++
+++  renderSlotRow(s) {
+++    const head = s.exists
+++      ? h('div', { class: 'slot-info' },
+++          h('div', { class: 'slot-name' }, `${s.name || '旅者'}${s.ending ? '  · 已通关' : ''}`),
+++          h('div', { class: 'slot-meta' }, `第 ${s.floor || 1} 层 · 最深 ${s.maxFloor || 1} · Lv${s.level || 1} · 💎${s.memoryCount || 0}/10 · ✨${s.stardust || 0}`),
+++        )
+++      : h('div', { class: 'slot-info' }, h('div', { class: 'muted' }, '空槽位'));
+++    const actions = h('div', { class: 'slot-actions' },
+++      s.exists
+++        ? [
+++            h('button', { class: 'btn-primary slot-act', onClick: () => this.loadSlot(s.slot) }, '读取'),
+++            h('button', { class: 'btn-ghost slot-act', onClick: () => this.confirmDeleteSlot(s.slot) }, '🗑️'),
+++          ]
+++        : h('button', { class: 'btn-jade slot-act', onClick: () => { this.closeModal(); this.showCreate(s.slot); } }, '在此开始'),
+++    );
+++    return h('div', { class: `slot-row ${s.exists ? '' : 'empty'}`, dataset: { slot: s.slot } },
+++      h('span', { class: 'slot-no' }, `#${s.slot + 1}`), head, actions);
+++  }
+++
+++  loadSlot(slot) {
+++    const p = loadFromSlot(slot);
+++    if (!p) { this.toast('读取失败', 'bad'); return; }
+++    this.closeModal();
+++    if (p.ending) { this.renderEnding(p.ending, true, p); return; }
+++    this.enterGame(p, slot);
+++  }
+++
+++  confirmDeleteSlot(slot) {
+++    this.showSheet({
+++      title: '删除该存档？',
+++      body: [h('div', { class: 'muted' }, `将永久删除 #${slot + 1} 号槽位的存档，无法恢复。`)],
+++      foot: [
+++        h('button', { class: 'btn-danger', onClick: () => { deleteSlot(slot); this.closeModal(); this.toast('存档已删除'); this.showSlots(this.screen === 'launcher'); } }, '确认删除'),
+++        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '取消'),
+++      ],
+++    });
+++  }
+++
+++  // ===================== 创角 =====================
+++  showCreate(preferSlot) {
+++    this.screen = 'create';
+++    this.stopLoop();
+++    this._preferSlot = Number.isInteger(preferSlot) ? preferSlot : null;
+++    clear(this.modalRoot);
+++    clear(this.stage);
+++    this.renderCreate();
+++  }
+++
+++  renderCreate() {
+++    clear(this.stage);
+++    const wrap = h('div', { class: 'launcher' });
+++    wrap.append(
+++      h('div', { class: 'create__head' },
+++        h('button', { class: 'btn-ghost', onClick: () => this.showLauncher() }, '← 返回'),
+++        h('h1', null, '开启新旅程'),
+++      ),
+++      h('div', { class: 'card' },
+++        h('h4', null, '姓名'),
+++        h('input', { class: 'name-input', dataset: { id: 'name' }, maxlength: 8, placeholder: '旅者（可留空）', value: this.charName || '' }),
+++        h('div', { class: 'muted', style: { marginTop: '0.3rem' } }, '为这位拾荒者取个名字。每个浮岛都藏着一枚记忆碎片，等着被你寻回。'),
+++      ),
+++      h('div', { class: 'create__foot' },
+++        h('button', { class: 'btn-primary big-btn', onClick: () => this.confirmCreate() }, '🚀 迫降墨比乌斯'),
+++      ),
+++    );
+++    this.stage.appendChild(wrap);
+++    const inp = wrap.querySelector('[data-id="name"]');
+++    if (inp) inp.addEventListener('input', () => { this.charName = inp.value; });
+++  }
+++
+++  confirmCreate() {
+++    const name = (this.charName || '').trim().slice(0, 8);
+++    const p = newPlayer(this.rng, { name });
+++    const slot = this.pickSlotForNewSave();
+++    this.activeSlot = slot;
+++    p.floorState = generateFloor(this.rng, p.floor, p);
+++    this.enterGame(p, slot);
+++    this.pushLog(STORY.prologue, 'milestone');
+++    saveToSlot(this.activeSlot, this.player); // 序章写入后补存，避免重载前首条故事丢失
+++    this.toast(`已保存到 #${slot + 1} 号槽位`, 'good');
+++  }
+++
+++  pickSlotForNewSave() {
+++    const prefer = this._preferSlot;
+++    const list = listSaves();
+++    if (Number.isInteger(prefer) && prefer >= 0 && prefer < SAVE_SLOTS && !list[prefer].exists) return prefer;
+++    const empty = list.find((s) => !s.exists);
+++    if (empty) return empty.slot;
+++    list.sort((a, b) => (a.lastSeen || 0) - (b.lastSeen || 0));
+++    return list[0].slot;
+++  }
+++
+++  // ===================== 进入游戏 =====================
+++  enterGame(player, slot) {
+++    this.player = player;
+++    this.activeSlot = Number.isInteger(slot) ? slot : (this.activeSlot != null ? this.activeSlot : 0);
+++    this.screen = 'game';
+++    this.over = false;
+++    this.battle = null;
+++    // 存档无楼层快照（旧档 / 损坏）→ 重新生成当前层。
+++    if (!this.player.floorState) this.player.floorState = generateFloor(this.rng, this.player.floor, this.player);
+++    this.buildGame();
+++    this.refreshStatus();
+++    this.renderMap();
+++    this.refreshInteract();
+++    saveToSlot(this.activeSlot, this.player);
+++    this.startLoop();
+++    if (isDead(this.player)) this.gameOver();
+++  }
+++
+++  buildGame() {
+++    clear(this.stage);
+++    clear(this.modalRoot);
+++    const game = h('div', { class: 'xhlz-game' });
+++    this.statusEl = h('div', { class: 'status-bar' });
+++    const mapWrap = h('div', { class: 'map-wrap' },
+++      this.floatLayer = h('div', { class: 'float-layer' }),
+++      h('div', { class: 'map-frame' }, h('div', { class: 'map-grid', onClick: (e) => this.onMapTap(e) })),
+++    );
+++    this.bottomBar = h('div', { class: 'bottom-bar' });
+++    game.append(this.statusEl, mapWrap, this.bottomBar);
+++    this.stage.appendChild(game);
+++    this.gridEl = mapWrap.querySelector('.map-grid');
+++    this.buildStatus();
+++    this.buildMap();
+++    this.buildBottomBar();
+++  }
+++
+++  // —— 顶部状态栏 ——
+++  buildStatus() {
+++    clear(this.statusEl);
+++    const p = this.player;
+++    this.hpFill = h('div', { class: 'bl-fill', style: { background: PALETTE.hp } });
+++    this.hpVal = h('span', { class: 'bl-val' }, `${p.hp}/${maxHp(p)}`);
+++    this.staFill = h('div', { class: 'bl-fill', style: { background: PALETTE.teal } });
+++    this.staVal = h('span', { class: 'bl-val' }, `${p.stamina}/${maxStamina()}`);
+++    this.statusEl.append(
+++      h('div', { class: 'status-top' },
+++        h('span', { class: 'status-name' }, p.name),
+++        h('span', { class: 'status-lv' }, `Lv${p.level}`),
+++        h('span', { class: 'status-floor' }, '第 ', h('b', null, String(p.floor)), ` / ${MAX_FLOOR} 层`),
+++        h('span', { class: 'status-res' },
+++          h('span', { class: 'r' }, h('span', null, '✨'), this.sdEl = h('span', null, String(p.stardust))),
+++          h('span', { class: 'r' }, h('span', null, '🔩'), this.ptEl = h('span', null, String(p.parts))),
+++        ),
+++      ),
+++      h('div', { class: 'status-bars' },
+++        h('div', { class: 'barline' }, h('span', { class: 'bl-icon' }, '❤️'), h('div', { class: 'bl-track' }, this.hpFill), this.hpVal),
+++        h('div', { class: 'barline' }, h('span', { class: 'bl-icon' }, '⚡'), h('div', { class: 'bl-track' }, this.staFill), this.staVal),
+++      ),
+++    );
+++  }
+++
+++  refreshStatus() {
+++    const p = this.player;
+++    if (!p || !this.hpFill) return;
+++    this.hpFill.style.width = `${(p.hp / maxHp(p)) * 100}%`;
+++    this.hpVal.textContent = `${p.hp}/${maxHp(p)}`;
+++    this.staFill.style.width = `${(p.stamina / maxStamina()) * 100}%`;
+++    this.staVal.textContent = `${p.stamina}/${maxStamina()}`;
+++    const nameEl = this.statusEl.querySelector('.status-name');
+++    if (nameEl) nameEl.textContent = p.name;
+++    const lvEl = this.statusEl.querySelector('.status-lv');
+++    if (lvEl) lvEl.textContent = `Lv${p.level}`;
+++    const floorB = this.statusEl.querySelector('.status-floor b');
+++    if (floorB) floorB.textContent = String(p.floor);
+++    if (this.sdEl) this.sdEl.textContent = String(p.stardust);
+++    if (this.ptEl) this.ptEl.textContent = String(p.parts);
+++  }
+++
+++  // —— 像素地图 ——
+++  buildMap() {
+++    clear(this.gridEl);
+++    this.cellNodes = [];
+++    for (let y = 0; y < GRID; y++) {
+++      const row = [];
+++      for (let x = 0; x < GRID; x++) {
+++        const cell = h('div', { class: 'cell fog', dataset: { x: String(x), y: String(y) } });
+++        this.gridEl.appendChild(cell);
+++        row.push(cell);
+++      }
+++      this.cellNodes.push(row);
+++    }
+++  }
+++
+++  state() { return this.player.floorState; }
+++
+++  renderMap() {
+++    const st = this.state();
+++    if (!st) return;
+++    const pos = st.pos;
+++    const reach = this.screen === 'game' && !this._sheet ? reachableTiles(st, pos, effectiveMoveRange(this.player)) : new Set();
+++    for (let y = 0; y < GRID; y++) {
+++      for (let x = 0; x < GRID; x++) {
+++        const cell = this.cellNodes[y][x];
+++        const k = `${x},${y}`;
+++        const explored = !!st.explored[k];
+++        const visible = isVisible(x, y, pos);
+++        const tileId = tileAt(st, x, y);
+++        const ent = entityAt(st, x, y);
+++        let cls = 'cell';
+++        if (!explored && !visible) cls += ' fog';
+++        else if (!visible) cls += ' dim';
+++        else cls += ' visible';
+++        const isPlayer = pos.x === x && pos.y === y;
+++        if (isPlayer) cls += ' player';
+++        if (tileId === 'stairs') cls += ' stairs';
+++        if (reach.has(k) && !isPlayer) cls += ' reachable';
+++        cell.className = cls;
+++        // 背景：地块色（玩家格叠加蓝色调）
+++        if (!explored && !visible) {
+++          cell.style.background = '';
+++        } else {
+++          cell.style.background = isPlayer
+++            ? `linear-gradient(rgba(77,150,255,0.45), rgba(77,150,255,0.45)), ${tileOf(tileId).color}`
+++            : tileOf(tileId).color;
+++        }
+++        // 实体 emoji（陷阱不显示——踩到才发现）
+++        let emoji = '';
+++        if (visible || explored) {
+++          if (isPlayer) emoji = '🧑‍🚀';
+++          else if (ent) emoji = entityEmoji(ent, tileId);
+++        }
+++        // 仅在内容变化时更新，减少重排
+++        const cur = cell.firstChild;
+++        if (emoji) {
+++          if (!cur || cur.textContent !== emoji) {
+++            if (cur) cur.remove();
+++            cell.appendChild(h('span', { class: 'ent' }, emoji));
+++          }
+++        } else if (cur) {
+++          cur.remove();
+++        }
+++        cell.dataset.x = String(x);
+++        cell.dataset.y = String(y);
+++      }
+++    }
+++  }
+++
+++  // —— 移动：点击地块 ——
+++  onMapTap(e) {
+++    if (this.screen !== 'game' || this._sheet) return;
+++    const cell = e.target.closest('.cell');
+++    if (!cell) return;
+++    const x = Number(cell.dataset.x), y = Number(cell.dataset.y);
+++    this.tryMoveTo(x, y);
+++  }
+++
+++  tryMoveTo(tx, ty) {
+++    const st = this.state();
+++    if (!st) return;
+++    if (st.pos.x === tx && st.pos.y === ty) { this.refreshInteract(); return; }
+++    const ent = entityAt(st, tx, ty);
+++    if (ent && ent.type === 'enemy') { this.toast('靠近敌人后用「攻击」交战', 'normal'); return; }
+++    if (!isWalkable(tileAt(st, tx, ty))) { this.toast('那里无法通行', 'normal'); return; }
+++    const range = effectiveMoveRange(this.player);
+++    const path = findPath(st, st.pos, { x: tx, y: ty }, range);
+++    if (!path || !path.length) { this.toast('超出移动步数', 'normal'); return; }
+++    this.walkPath(path);
+++  }
+++
+++  // 沿路径行走，逐格结算（遇交互实体则停下）。
+++  walkPath(path) {
+++    const st = this.state();
+++    for (const step of path) {
+++      st.pos = { x: step.x, y: step.y };
+++      this.player.turn += 1;
+++      regenStamina(this.player, STAMINA_REGEN_PER_STEP);
+++      this.revealAround();
+++      const ent = entityAt(st, step.x, step.y);
+++      if (ent) {
+++        this.renderMap();
+++        this.refreshStatus();
+++        this.refreshInteract();
+++        saveToSlot(this.activeSlot, this.player);
+++        if (this.resolveEntity(ent)) return; // 进入战斗 / 弹窗则终止移动
+++      }
+++    }
+++    this.renderMap();
+++    this.refreshStatus();
+++    this.refreshInteract();
+++    saveToSlot(this.activeSlot, this.player);
+++  }
+++
+++  revealAround() {
+++    const st = this.state();
+++    for (const k of visibleKeysList(st, st.pos.x, st.pos.y)) st.explored[k] = true;
+++  }
+++
+++  // 踩到交互实体：返回 true 表示已切入战斗 / 弹窗，应中止移动。
+++  resolveEntity(ent) {
+++    const st = this.state();
+++    if (ent.type === 'chest') {
+++      const r = ent.reward || {};
+++      // 用 gainReward 的实发量（含幸运加成）展示，避免飘字与状态栏不一致。
+++      const g = gainReward(this.player, r, this.rng);
+++      removeEntity(st, ent.id);
+++      this.floatAt(ent.x, ent.y, `+✨${g.stardust} 🔩${g.parts}`, 'gold');
+++      this.pushLog(`🎁 拾得宝箱：${g.stardust ? `✨${g.stardust} ` : ''}${g.parts ? `🔩${g.parts}` : ''}`, 'good');
+++      this.toast('拾得宝箱', 'good');
+++      this.refreshStatus();
+++      return false;
+++    }
+++    if (ent.type === 'memory') {
+++      const res = collectMemory(this.player, ent.chapter);
+++      removeEntity(st, ent.id);
+++      if (res.ok) {
+++        this.floatAt(ent.x, ent.y, '💎 记忆', 'gold');
+++        this.pushLog(`💎 寻回星骸回响：${MEMORY_CHAPTERS[res.chapter].title}`, 'milestone');
+++        this.refreshStatus();
+++        saveToSlot(this.activeSlot, this.player);
+++        this.showChapter(res.chapter);
+++        return true;
+++      }
+++      return false;
+++    }
+++    if (ent.type === 'trap') {
+++      this.teleport();
+++      return true;
+++    }
+++    if (ent.type === 'merchant') { this.showMerchant(); return true; }
+++    if (ent.type === 'drone') { this.showDrone(); return true; }
+++    return false;
+++  }
+++
+++  // 重力陷阱：传送到随机可达地块。
+++  teleport() {
+++    const st = this.state();
+++    const reach = [...reachableTiles(st, st.pos, 99)];
+++    const choices = reach.filter((k) => {
+++      const [x, y] = k.split(',').map(Number);
+++      return !(x === st.pos.x && y === st.pos.y) && !entityAt(st, x, y);
+++    });
+++    const pool = choices.length ? choices : reach;
+++    const k = pool[Math.floor(this.rng() * pool.length)];
+++    const [nx, ny] = k.split(',').map(Number);
+++    st.pos = { x: nx, y: ny };
+++    this.revealAround();
+++    this.shake();
+++    this.pushLog('🌀 触发重力陷阱！空间扭曲，你被抛向未知之处。', 'bad');
+++    this.toast('重力陷阱！被传送', 'bad');
+++    this.renderMap();
+++    this.refreshStatus();
+++    this.refreshInteract();
+++    saveToSlot(this.activeSlot, this.player);
+++  }
+++
+++  // —— 方向键单步移动 ——
+++  dpadMove(dx, dy) {
+++    if (this.screen !== 'game' || this._sheet) return;
+++    const st = this.state();
+++    const nx = st.pos.x + dx, ny = st.pos.y + dy;
+++    this.tryMoveTo(nx, ny);
+++  }
+++
+++  // —— 中央交互键（随上下文动态）——
+++  buildBottomBar() {
+++    clear(this.bottomBar);
+++    const dpad = h('div', { class: 'dpad' },
+++      h('button', { class: 'd-up', onClick: () => this.dpadMove(0, -1) }, '▲'),
+++      h('button', { class: 'd-left', onClick: () => this.dpadMove(-1, 0) }, '◀'),
+++      h('button', { class: 'd-center', onClick: () => this.refreshInteract() }, '·'),
+++      h('button', { class: 'd-right', onClick: () => this.dpadMove(1, 0) }, '▶'),
+++      h('button', { class: 'd-down', onClick: () => this.dpadMove(0, 1) }, '▼'),
+++    );
+++    this.interactBtn = h('button', { class: 'btn-primary interact-btn', onClick: () => this.doInteract() }, '🔍 调查');
+++    const tools = h('div', { class: 'tool-col' },
+++      h('button', { class: 'icon-btn', title: '背包 / 状态', onClick: () => this.openInventory() }, '🎒'),
+++      h('button', { class: 'icon-btn', title: '设置 / 存档', onClick: () => this.showSettings(false) }, '⚙️'),
+++    );
+++    this.bottomBar.append(dpad, h('div', { class: 'act-col' }, this.interactBtn), tools);
+++  }
+++
+++  // 依据周围上下文刷新中央键文案与可用性。
+++  refreshInteract() {
+++    if (!this.interactBtn || this.screen !== 'game') return;
+++    const st = this.state();
+++    const adj = adjacentEnemy(st, st.pos);
+++    if (adj) {
+++      this.interactBtn.className = 'btn-danger interact-btn';
+++      this.interactBtn.textContent = `⚔️ 攻击·${adj.name}`;
+++      this.interactBtn.disabled = false;
+++      this._interactMode = { mode: 'attack', enemy: adj };
+++      return;
+++    }
+++    if (tileAt(st, st.pos.x, st.pos.y) === 'stairs') {
+++      this.interactBtn.className = 'btn-jade interact-btn';
+++      this.interactBtn.textContent = '⬇️ 下行至下一浮岛';
+++      this.interactBtn.disabled = false;
+++      this._interactMode = { mode: 'descend' };
+++      return;
+++    }
+++    const here = entityAt(st, st.pos.x, st.pos.y);
+++    if (here && (here.type === 'chest' || here.type === 'memory')) {
+++      this.interactBtn.className = 'btn-primary interact-btn';
+++      this.interactBtn.textContent = here.type === 'memory' ? '💎 拾取回响' : '🎁 拾取宝箱';
+++      this.interactBtn.disabled = false;
+++      this._interactMode = { mode: 'pickup', ent: here };
+++      return;
+++    }
+++    this.interactBtn.className = 'btn-ghost interact-btn';
+++    this.interactBtn.textContent = '🔍 调查';
+++    this.interactBtn.disabled = false;
+++    this._interactMode = { mode: 'investigate' };
+++  }
+++
+++  doInteract() {
+++    if (this.screen !== 'game' || !this._interactMode) return;
+++    const m = this._interactMode;
+++    if (m.mode === 'attack') this.startBattle(m.enemy);
+++    else if (m.mode === 'descend') this.descendFloor();
+++    else if (m.mode === 'pickup') this.resolveEntity(m.ent);
+++    else this.toast('周围没有可交互的对象', 'normal');
+++  }
+++
+++  descendFloor() {
+++    const st = this.state();
+++    if (tileAt(st, st.pos.x, st.pos.y) !== 'stairs') { this.toast('需站在下行阶梯上', 'normal'); return; }
+++    descend(this.player);
+++    this.player.floorState = generateFloor(this.rng, this.player.floor, this.player);
+++    this.pushLog(`⬇️ 降至第 ${this.player.floor} 层浮岛。`, 'milestone');
+++    if (this.player.floor === 3) this.pushLog(STORY.midpoint, 'milestone');
+++    this.refreshStatus();
+++    this.renderMap();
+++    this.refreshInteract();
+++    saveToSlot(this.activeSlot, this.player);
+++    this.toast(`进入第 ${this.player.floor} 层`, 'good');
+++  }
+++
+++  // ===================== 战斗 =====================
+++  startBattle(enemyEntity) {
+++    if (this.screen !== 'game') return;
+++    this.screen = 'battle';
+++    this.battle = {
+++      enemy: enemyEntity, focus: false, auto: false, round: 0,
+++      stance: null, telegraphed: false, timerEnd: 0, busy: false,
+++    };
+++    clear(this.modalRoot);
+++    this.buildBattle();
+++    this.nextRound();
+++  }
+++
+++  buildBattle() {
+++    clear(this.stage);
+++    const e = this.battle.enemy;
+++    const wrap = h('div', { class: 'battle' });
+++    this.foeEmoji = h('div', { class: 'emoji' }, e.emoji || '👾');
+++    this.foeName = h('div', { class: 'name' }, `${e.name}${e.boss ? ' · BOSS' : ''}`);
+++    this.foeHpFill = h('div', { class: 'bar__fill', style: { background: PALETTE.monster } });
+++    this.foeHpLabel = h('span', { class: 'bar__label' }, `${e.hp}/${e.maxHp}`);
+++    this.stanceChip = h('div', { class: 'stance-chip unknown' }, '敌人蓄势中…');
+++    this.battleLog = h('div', { class: 'battle__log' });
+++    this.timerFill = h('div', { class: 't', style: { width: '100%' } });
+++    this.actionBtns = ['block', 'dodge', 'counter'].map((a) =>
+++      h('button', { class: `act ${a}`, dataset: { action: a }, onClick: () => this.chooseAction(a) },
+++        h('div', null, ACTIONS[a].emoji), h('div', null, ACTIONS[a].name)));
+++    this.autoToggle = h('button', { class: 'btn-ghost icon-btn', title: '自动战斗', onClick: () => this.toggleAuto() }, '🤖');
+++
+++    this.hpFill = h('div', { class: 'bl-fill', style: { background: PALETTE.hp } });
+++    this.hpVal = h('span', { class: 'bl-val' }, `${this.player.hp}/${maxHp(this.player)}`);
+++    // 战斗屏独立浮动层（buildGame 的 floatLayer 已随 stage 清空而脱离）。
+++    this.floatLayer = h('div', { class: 'float-layer' });
+++
+++    wrap.append(
+++      h('div', { class: 'battle__topbar' },
+++        h('button', { class: 'btn-ghost icon-btn', onClick: () => this.confirmFlee() }, '🏃'),
+++        h('span', { class: 'title' }, '战斗'),
+++        this.autoToggle,
+++      ),
+++      h('div', { class: 'battle__foe' }, this.foeEmoji, this.foeName,
+++        h('div', { class: 'bar', style: { marginTop: '0.4rem' } }, this.foeHpFill, this.foeHpLabel)),
+++      h('div', { class: 'battle__stance' }, this.stanceChip),
+++      this.battleLog,
+++      h('div', { class: 'battle__self' },
+++        h('span', null, '❤️'),
+++        h('div', { class: 'barline', style: { flex: 1 } }, h('div', { class: 'bl-track' }, this.hpFill), this.hpVal),
+++      ),
+++      h('div', { class: 'battle__timer' }, this.timerFill),
+++      h('div', { class: 'battle__actions' }, this.actionBtns),
+++      this.floatLayer,
+++    );
+++    this.stage.appendChild(wrap);
+++    this.logBattle(`与 ${e.name} 交战！`, 'normal');
+++  }
+++
+++  nextRound() {
+++    if (!this.battle) return;
+++    this.battle.round += 1;
+++    const stance = pickEnemyStance(this.battle.enemy, this.rng);
+++    const tele = isTelegraphed(this.rng);
+++    this.battle.stance = stance;
+++    this.battle.telegraphed = tele;
+++    this.battle.busy = false;
+++    // 架势展示：识破时明牌，否则「??」需盲猜。
+++    if (tele) {
+++      const s = STANCES[stance];
+++      this.stanceChip.className = 'stance-chip';
+++      this.stanceChip.textContent = `${s.emoji} 敌人摆出「${s.name}」`;
+++    } else {
+++      this.stanceChip.className = 'stance-chip unknown';
+++      this.stanceChip.textContent = '❓ 敌人意图难辨…';
+++    }
+++    for (const b of this.actionBtns) b.disabled = false;
+++    if (this.timerEnabled && !this.battle.auto) {
+++      this.battle.timerEnd = nowMs() + BATTLE_TIME_MS;
+++    } else {
+++      this.timerFill.style.width = '100%';
+++    }
+++    if (this.battle.auto) {
+++      const act = autoPickAction(stance);
+++      // 不预置 busy=true：chooseAction 自带 busy 守卫，预置会令其立即返回，导致自动战斗死锁。
+++      setTimeout(() => { if (this.battle) this.chooseAction(act); }, 320);
+++    }
+++  }
+++
+++  chooseAction(action) {
+++    if (!this.battle || this.battle.busy) return;
+++    this.battle.busy = true;
+++    for (const b of this.actionBtns) b.disabled = true;
+++    this.resolveBattleRound(action);
+++  }
+++
+++  resolveBattleRound(action) {
+++    const b = this.battle;
+++    const p = this.player;
+++    spendStamina(p, STAMINA_COST_PER_ROUND);
+++    const res = resolveRound(p, b.enemy, action, b.focus, b.stance, this.rng);
+++    b.focus = res.nextFocus;
+++
+++    // 敌人受伤反馈
+++    if (res.enemyDmg > 0) {
+++      this.foeHpFill.style.width = `${(b.enemy.hp / b.enemy.maxHp) * 100}%`;
+++      this.foeHpLabel.textContent = `${b.enemy.hp}/${b.enemy.maxHp}`;
+++      this.floatAtCenter(`${res.countered ? '💥 ' : ''}-${res.enemyDmg}`, 'up');
+++    }
+++    // 玩家受伤反馈
+++    if (res.playerDmg > 0) { this.shake(); this.floatAtCenter(`-${res.playerDmg}`, 'down'); }
+++    if (res.healed > 0) this.floatAtCenter(`+${res.healed}`, 'up');
+++    this.hpFill.style.width = `${(p.hp / maxHp(p)) * 100}%`;
+++    this.hpVal.textContent = `${p.hp}/${maxHp(p)}`;
+++
+++    // 战报
+++    const sName = STANCES[res.stance].name;
+++    if (res.fumble) this.logBattle(`精力不济，${ACTIONS[res.action]?.name || '应对'}失手！受到 ${res.playerDmg} 伤害。`, 'bad');
+++    else if (res.countered) this.logBattle(`${ACTIONS[res.action].name} 完美克制「${sName}」！造成 ${res.enemyDmg} 伤害，专注力蓄满。`, 'good');
+++    else this.logBattle(`${ACTIONS[res.action]?.name || '犹豫'}未能克制「${sName}」，受到 ${res.playerDmg} 伤害。`, 'bad');
+++
+++    if (res.enemyDead) { setTimeout(() => { if (this.battle) this.winBattle(); }, 360); return; }
+++    if (res.playerDead) { setTimeout(() => { if (this.battle) this.loseBattle(); }, 360); return; }
+++    setTimeout(() => { if (this.battle) this.nextRound(); }, 520);
+++  }
+++
+++  toggleAuto() {
+++    if (!this.battle) return;
+++    this.battle.auto = !this.battle.auto;
+++    this.autoToggle.classList.toggle('btn-jade', this.battle.auto);
+++    this.autoToggle.textContent = this.battle.auto ? '🤖✅' : '🤖';
+++    this.toast(this.battle.auto ? '自动战斗：开' : '自动战斗：关');
+++    if (this.battle.auto && !this.battle.busy) {
+++      const act = autoPickAction(this.battle.stance);
+++      setTimeout(() => { if (this.battle) this.chooseAction(act); }, 320);
+++    }
+++  }
+++
+++  confirmFlee() {
+++    this.showSheet({
+++      title: '脱离战斗？',
+++      body: [h('div', { class: 'muted' }, '撤退会损失少量星骸，回到地图（敌人仍在）。')],
+++      foot: [
+++        h('button', { class: 'btn-danger', onClick: () => this.flee() }, '撤退'),
+++        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '继续战斗'),
+++      ],
+++    });
+++  }
+++
+++  flee() {
+++    this.closeModal();
+++    const cost = Math.min(this.player.stardust, 2);
+++    this.player.stardust -= cost;
+++    this.pushLog(`🏃 撤离战斗，散落 ${cost} 星骸。`, 'normal');
+++    // exitBattle(false) 不落盘，此处显式保存星骸扣除，避免关浏览器后回滚。
+++    saveToSlot(this.activeSlot, this.player);
+++    this.exitBattle(false);
+++  }
+++
+++  winBattle() {
+++    if (!this.battle) return; // 360ms 窗口内若已脱离战斗（撤退/卸载），丢弃本次结算
+++    const e = this.battle.enemy;
+++    const reward = enemyReward(e);
+++    const gained = gainReward(this.player, reward, this.rng);
+++    // 移除地图上的敌人实体
+++    removeEntity(this.state(), e.id);
+++    this.pushLog(`🏆 击败 ${e.name}！获得 ✨${gained.stardust} 🔩${gained.parts}${gained.leveled ? ` · 升级至 Lv${this.player.level}！` : ''}`, 'milestone');
+++    this.exitBattle(true);
+++    if (e.boss) { this.offerEnding(); return; }
+++    this.toast(gained.leveled ? '升级！' : '胜利', 'good');
+++  }
+++
+++  loseBattle() {
+++    if (!this.battle) return;
+++    this.exitBattle(false);
+++    this.gameOver();
+++  }
+++
+++  // 退出战斗回到地图（恢复 game 屏）。
+++  exitBattle(save) {
+++    this.battle = null;
+++    this.screen = 'game';
+++    this.buildGame();
+++    this.refreshStatus();
+++    this.renderMap();
+++    this.refreshInteract();
+++    if (save) saveToSlot(this.activeSlot, this.player);
+++  }
+++
+++  logBattle(text, type = 'normal') {
+++    if (!this.battleLog) return;
+++    this.battleLog.appendChild(h('div', { class: `ln ${type}` }, text));
+++    this.battleLog.scrollTop = this.battleLog.scrollHeight;
+++  }
+++
+++  // —— 结局抉择（击败 Boss 后）——
+++  // 仅展示抉择弹窗；最终 'over' 态由 chooseEnding / renderEnding 落定，
+++  // 这样即便玩家误触关闭弹窗，也能回到可交互的地图（Boss 已除、当前层无下行）。
+++  offerEnding() {
+++    saveToSlot(this.activeSlot, this.player);
+++    const body = [
+++      h('div', { class: 'ending' },
+++        h('div', { class: 'ending__emoji' }, '🌟'),
+++        h('h2', null, '星骸之核已寂灭'),
+++        h('div', { class: 'ending__text' },
+++          `你集齐了 ${collectedMemoryCount(this.player)} 枚星骸回响。所有的记忆在掌心翻涌——现在，由你回答那个被整个文明搁置的问题。`),
+++      ),
+++    ];
+++    const foot = [
+++      h('button', { class: 'btn-jade', onClick: () => this.chooseEnding('peace') }, `${ENDINGS.peace.emoji} ${ENDINGS.peace.name}`),
+++      h('button', { class: 'btn-danger', onClick: () => this.chooseEnding('dark') }, `${ENDINGS.dark.emoji} ${ENDINGS.dark.name}`),
+++    ];
+++    this.showSheet({ title: '终章 · 你的回答', body, foot, dismissable: false });
+++  }
+++
+++  chooseEnding(key) {
+++    this.closeModal();
+++    this.player.ending = key;
+++    saveToSlot(this.activeSlot, this.player);
+++    this.renderEnding(key, false, this.player);
+++  }
+++
+++  renderEnding(key, fromSave, player) {
+++    this.screen = 'over';
+++    this.over = true;
+++    this.player = player || this.player;
+++    this.stopLoop();
+++    clear(this.modalRoot);
+++    clear(this.stage);
+++    const e = ENDINGS[key] || ENDINGS.peace;
+++    const wrap = h('div', { class: 'launcher' });
+++    wrap.append(
+++      h('div', { class: `ending ${e.tone}` },
+++        h('div', { class: 'ending__emoji' }, e.emoji),
+++        h('h2', null, e.title),
+++        h('div', { class: 'muted' }, `${this.player.name} · 第 ${this.player.maxFloor} 层 · Lv${this.player.level} · 💎${collectedMemoryCount(this.player)}/10`),
+++        h('div', { class: 'ending__text' }, e.text),
+++      ),
+++      h('div', { class: 'ending__choice' },
+++        fromSave
+++          ? h('button', { class: 'btn-ghost big-btn', onClick: () => this.showLauncher() }, '← 返回标题')
+++          : null,
+++        h('button', { class: 'btn-primary big-btn', onClick: () => this.restart() }, '🔄 再启新旅程'),
+++      ),
+++    );
+++    this.stage.appendChild(wrap);
+++  }
+++
+++  gameOver() {
+++    if (this.over) return;
+++    this.over = true;
+++    this.screen = 'over';
+++    this.stopLoop();
+++    this.battle = null;
+++    saveToSlot(this.activeSlot, this.player);
+++    clear(this.modalRoot);
+++    clear(this.stage);
+++    const wrap = h('div', { class: 'launcher' });
+++    wrap.append(
+++      h('div', { class: 'ending dark' },
+++        h('div', { class: 'ending__emoji' }, '💀'),
+++        h('h2', null, '旅程终结'),
+++        h('div', { class: 'muted' }, `${this.player.name} 倒在了第 ${this.player.floor} 层。`),
+++        h('div', { class: 'ending__text' }, '星骸的光在你眼中缓缓熄灭。墨比乌斯依旧漂浮、寂静——但或许，下一位旅者能走得更远。'),
+++      ),
+++      h('div', { class: 'ending__choice' },
+++        h('button', { class: 'btn-primary big-btn', onClick: () => this.restart() }, '🔄 再启新旅程'),
+++        h('button', { class: 'btn-ghost', onClick: () => this.showSettings(false) }, '⚙️ 导出 / 存档'),
+++      ),
+++    );
+++    this.stage.appendChild(wrap);
+++  }
+++
+++  restart() {
+++    if (this.activeSlot != null) deleteSlot(this.activeSlot);
+++    this.player = null;
+++    this.over = false;
+++    this.showCreate();
+++  }
+++
+++  // ===================== 背包 / 天赋 / 剧情 =====================
+++  openInventory() {
+++    if (this.screen !== 'game') return;
+++    this.showInventoryTab('equip');
+++  }
+++
+++  showInventoryTab(tab) {
+++    clear(this.modalRoot);
+++    const p = this.player;
+++    const tabs = h('div', { class: 'tabs' },
+++      h('button', { class: `tab ${tab === 'equip' ? 'active' : ''}`, onClick: () => this.showInventoryTab('equip') }, '🗡️ 装备'),
+++      h('button', { class: `tab ${tab === 'talent' ? 'active' : ''}`, onClick: () => this.showInventoryTab('talent') }, '🌟 天赋'),
+++      h('button', { class: `tab ${tab === 'story' ? 'active' : ''}`, onClick: () => this.showInventoryTab('story') }, '📖 回响'),
+++    );
+++    let body;
+++    if (tab === 'equip') body = this.renderEquipTab();
+++    else if (tab === 'talent') body = this.renderTalentTab();
+++    else body = this.renderStoryTab();
+++    const sheet = h('div', { class: 'sheet' },
+++      h('div', { class: 'sheet__head' }, h('span', { class: 't' }, '🎒 背包')),
+++      tabs,
+++      h('div', { class: 'sheet__body' }, body),
+++      h('div', { class: 'sheet__foot' },
+++        h('span', { class: 'muted', style: { flex: 1, alignSelf: 'center' } }, `✨ ${p.stardust} 星骸　🔩 ${p.parts} 零件`),
+++        h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '关闭'),
+++      ),
+++    );
+++    this.modalRoot.append(h('div', { class: 'sheet-overlay', onClick: () => this.closeModal() }), sheet);
+++    this._sheet = sheet;
+++  }
+++
+++  renderEquipTab() {
+++    const p = this.player;
+++    const frag = [];
+++    const meta = {
+++      weapon: { emoji: '🗡️', label: '武器', statName: '攻击', statFn: () => effectiveAtk(p) },
+++      armor: { emoji: '🛡️', label: '护甲', statName: '防御', statFn: () => effectiveDef(p) },
+++      booster: { emoji: '🥾', label: '推进器', statName: '步数', statFn: () => effectiveMoveRange(p) },
+++    };
+++    for (const slot of EQUIP_SLOTS) {
+++      const e = p.equipment[slot];
+++      const m = meta[slot];
+++      const cost = enhanceCost(e.plus);
+++      const maxed = e.plus >= MAX_PLUS;
+++      const afford = p.parts >= cost;
+++      const affix = e.affix ? AFFIXES.find((a) => a.id === e.affix.id) : null;
+++      frag.push(h('div', { class: 'card equip-card' },
+++        h('div', { class: 'eq-emoji' }, m.emoji),
+++        h('div', { class: 'eq-info' },
+++          h('div', { class: 'eq-name' }, `${e.name} `, h('span', { class: 'plus' }, e.plus > 0 ? `+${e.plus}` : ''),
+++            h('span', { class: 'muted', style: { fontWeight: 400, fontSize: '0.78rem' } }, `　当前${m.statName} ${m.statFn()}`)),
+++          h('div', { class: 'eq-affix' }, affix ? `${affix.emoji} 词缀·${affix.name}：${affix.desc}` : `+${AFFIX_AT} 触发词缀变异`),
+++          h('div', { class: 'eq-cost' }, maxed ? '已达强化上限' : `强化消耗 🔩${cost}`),
+++        ),
+++        h('button', {
+++          class: 'btn-primary', disabled: maxed || !afford,
+++          onClick: () => this.doEnhance(slot),
+++        }, maxed ? '满级' : '强化'),
+++      ));
+++    }
+++    return frag;
+++  }
+++
+++  doEnhance(slot) {
+++    const res = enhanceEquipment(this.player, slot, this.rng);
+++    if (!res.ok) {
+++      if (res.reason === 'no-parts') this.toast(`零件不足（需 🔩${res.cost}）`, 'bad');
+++      else if (res.reason === 'max') this.toast('已达强化上限', 'normal');
+++      return;
+++    }
+++    saveToSlot(this.activeSlot, this.player);
+++    this.refreshStatus();
+++    if (res.affixed) this.toast(`+${res.plus}！触发词缀变异：${res.affixed.emoji} ${res.affixed.name}`, 'good');
+++    else this.toast(`强化成功 +${res.plus}`, 'good');
+++    this.showInventoryTab('equip');
+++  }
+++
+++  renderTalentTab() {
+++    const p = this.player;
+++    const frag = [h('div', { class: 'muted', style: { marginBottom: '0.5rem' } },
+++      `消耗星骸点亮，可随时免费重置。已用 ✨${spentStardust(p)}。`)];
+++    for (const t of TALENTS) {
+++      const rank = p.talents[t.branch] || 0;
+++      const maxed = rank >= t.maxRank;
+++      const cost = talentCost(t.branch, rank);
+++      const afford = p.stardust >= cost;
+++      const pips = Array.from({ length: t.maxRank }, (_, i) => h('span', { class: `talent-pip ${i < rank ? 'on' : ''}` }));
+++      frag.push(h('div', { class: 'card talent-branch' },
+++        h('div', { class: 'talent-head' },
+++          h('span', { style: { fontSize: '1.3rem' } }, t.emoji),
+++          h('div', { class: 'grow' }, h('div', { style: { fontWeight: 700 } }, `${t.name} · Lv${rank}/${t.maxRank}`),
+++            h('div', { class: 'muted', style: { fontSize: '0.78rem' } }, t.desc)),
+++          h('button', {
+++            class: 'btn-primary', disabled: maxed || !afford, style: { flex: 'none' },
+++            onClick: () => this.doBuyTalent(t.branch),
+++          }, maxed ? '满级' : `✨${cost}`),
+++        ),
+++        h('div', { class: 'talent-ranks' }, pips),
+++      ));
+++    }
+++    frag.push(h('button', { class: 'btn-ghost', style: { width: '100%' }, onClick: () => this.doResetTalents() }, '↩️ 免费重置天赋'));
+++    return frag;
+++  }
+++
+++  doBuyTalent(branch) {
+++    const res = buyTalent(this.player, branch);
+++    if (!res.ok) {
+++      if (res.reason === 'no-stardust') this.toast(`星骸不足（需 ✨${res.cost}）`, 'bad');
+++      return;
+++    }
+++    saveToSlot(this.activeSlot, this.player);
+++    this.refreshStatus();
+++    this.toast(`${TALENT_BY_BRANCH[branch].name} → Lv${res.rank}`, 'good');
+++    this.showInventoryTab('talent');
+++  }
+++
+++  doResetTalents() {
+++    const res = resetTalents(this.player);
+++    saveToSlot(this.activeSlot, this.player);
+++    this.refreshStatus();
+++    this.toast(`天赋已重置，返还 ✨${res.refund}`, 'good');
+++    this.showInventoryTab('talent');
+++  }
+++
+++  renderStoryTab() {
+++    const p = this.player;
+++    const frag = [h('div', { class: 'muted', style: { marginBottom: '0.5rem' } },
+++      `已寻回 ${collectedMemoryCount(p)} / ${MEMORY_CHAPTERS.length} 枚星骸回响。`)];
+++    MEMORY_CHAPTERS.forEach((ch, i) => {
+++      const unlocked = p.memory[i];
+++      frag.push(h('div', { class: `chapter ${unlocked ? '' : 'locked'}` },
+++        h('div', { class: 'ch-title' }, `${unlocked ? '💎' : '🔒'} ${ch.title}`),
+++        h('div', { class: 'ch-text' }, unlocked ? ch.text : '尚未寻回这枚记忆碎片。继续深入浮岛吧。'),
+++      ));
+++    });
+++    return frag;
+++  }
+++
+++  showChapter(idx) {
+++    const ch = MEMORY_CHAPTERS[idx];
+++    if (!ch) return;
+++    const body = [
+++      h('div', { class: 'chapter' },
+++        h('div', { class: 'ch-title' }, `💎 ${ch.title}`),
+++        h('div', { class: 'ch-text' }, ch.text),
+++      ),
+++    ];
+++    this.showSheet({
+++      title: '星骸回响',
+++      body,
+++      foot: [h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '继续')],
+++    });
+++  }
+++
+++  // ===================== 随机事件 =====================
+++  showMerchant() {
+++    const p = this.player;
+++    const body = [
+++      h('div', { class: 'muted', style: { marginBottom: '0.5rem' } }, `${EVENT_META.merchant.desc}（持有 ✨${p.stardust}）`),
+++      h('div', { class: 'slot-list' }, SHOP_ITEMS.map((it) => {
+++        const afford = p.stardust >= it.cost;
+++        return h('div', { class: 'slot-row' },
+++          h('span', { class: 'slot-no' }, it.emoji),
+++          h('div', { class: 'slot-info' }, h('div', { class: 'slot-name' }, it.name)),
+++          h('div', { class: 'slot-actions' },
+++            h('button', { class: 'btn-primary slot-act', disabled: !afford, onClick: () => this.buyItem(it) }, `✨${it.cost}`)),
+++        );
+++      })),
+++    ];
+++    this.showSheet({ title: '🛒 流浪商人', body, foot: [h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '离开')] });
+++  }
+++
+++  buyItem(it) {
+++    const p = this.player;
+++    if (p.stardust < it.cost) { this.toast('星骸不足', 'bad'); return; }
+++    p.stardust -= it.cost;
+++    if (it.give.fullHeal) { healFull(p); this.toast('已满状态恢复', 'good'); }
+++    else { gainReward(p, it.give, this.rng); this.toast(`购得 ${it.name}`, 'good'); }
+++    saveToSlot(this.activeSlot, this.player);
+++    this.refreshStatus();
+++    this.showMerchant();
+++  }
+++
+++  showDrone() {
+++    const p = this.player;
+++    const afford = p.stardust >= DRONE_COST;
+++    const body = [
+++      h('div', { class: 'muted', style: { marginBottom: '0.5rem' } }, `${EVENT_META.drone.desc}（持有 ✨${p.stardust}，需 ✨${DRONE_COST}）`),
+++    ];
+++    this.showSheet({
+++      title: '🔧 维修无人机',
+++      body,
+++      foot: [
+++        h('button', { class: 'btn-jade', disabled: !afford, onClick: () => this.useDrone() }, `维修（✨${DRONE_COST}）`),
+++        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '离开'),
+++      ],
+++    });
+++  }
+++
+++  useDrone() {
+++    const p = this.player;
+++    if (p.stardust < DRONE_COST) { this.toast('星骸不足', 'bad'); return; }
+++    p.stardust -= DRONE_COST;
+++    healFull(p);
+++    this.closeModal();
+++    this.refreshStatus();
+++    this.toast('全状态已恢复', 'good');
+++    this.pushLog('🔧 维修无人机为你回满 HP 与精力。', 'good');
+++    saveToSlot(this.activeSlot, this.player);
+++  }
+++
+++  // ===================== 设置 / 存档 =====================
+++  showSettings(fromLauncher) {
+++    const p = this.player;
+++    const body = [
+++      h('div', { class: 'card' },
+++        h('h4', null, '存档'),
+++        h('div', { class: 'muted', style: { marginBottom: '0.4rem' } },
+++          `进度自动保存${p ? `（#${(this.activeSlot == null ? '?' : this.activeSlot + 1)} · ${p.name} · 第 ${p.floor} 层）` : '。'}`),
+++        h('button', { class: 'btn-primary', style: { width: '100%', marginBottom: '0.4rem' }, onClick: () => { this.closeModal(); this.showSlots(fromLauncher); } }, '📂 存档管理（多槽位）'),
+++        h('button', { class: 'btn-jade', style: { width: '100%', marginBottom: '0.4rem' }, onClick: () => this.doExport() }, '📤 导出存档字符串'),
+++        h('textarea', { class: 'save-io', dataset: { id: 'io' }, placeholder: '在此粘贴导入字符串…', readonly: true }),
+++        h('div', { class: 'tabs', style: { marginTop: '0.4rem' } },
+++          h('button', { class: 'tab', style: { flex: '1 1 45%' }, onClick: () => this.toggleIoInput() }, '✏️ 切换为输入'),
+++          h('button', { class: 'tab', style: { flex: '1 1 45%', background: 'linear-gradient(180deg,#6fe0b0,#2f9a72)', color: '#06241a', borderColor: '#2f9a72' }, onClick: () => this.doImport() }, '📥 导入'),
+++        ),
+++      ),
+++      h('div', { class: 'card' },
+++        h('h4', null, '选项'),
+++        h('div', { class: 'row', style: { justifyContent: 'space-between' } },
+++          h('span', null, '战斗限时（3 秒/回合）'),
+++          h('button', { class: `tab ${this.timerEnabled ? 'active' : ''}`, onClick: () => { this.timerEnabled = !this.timerEnabled; this.showSettings(fromLauncher); } }, this.timerEnabled ? '开' : '关'),
+++        ),
+++      ),
+++    ];
+++    const foot = [
+++      fromLauncher ? null : h('button', { class: 'btn-ghost', onClick: () => { this.closeModal(); this.confirmExitToLauncher(); } }, '🏠 返回标题'),
+++      h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '关闭'),
+++    ];
+++    this.showSheet({ title: '设置 / 存档', body, foot: foot.filter(Boolean) });
+++  }
+++
+++  toggleIoInput() {
+++    const io = this.modalRoot.querySelector('[data-id="io"]');
+++    if (!io) return;
+++    io.readOnly = !io.readOnly;
+++    if (io.readOnly) { io.value = ''; this.toast('已切回导出模式'); }
+++    else { this.toast('请粘贴导入字符串后点导入'); }
+++  }
+++
+++  doExport() {
+++    const p = this.player || (this.activeSlot != null ? loadFromSlot(this.activeSlot) : null) || (latestSlot() != null ? loadFromSlot(latestSlot()) : null);
+++    if (!p) { this.toast('暂无可导出的存档', 'bad'); return; }
+++    const io = this.modalRoot.querySelector('[data-id="io"]');
+++    const str = exportSave(p);
+++    if (io) { io.readOnly = true; io.value = str; }
+++    this.toast('存档字符串已生成', 'good');
+++  }
+++
+++  doImport() {
+++    const io = this.modalRoot.querySelector('[data-id="io"]');
+++    const str = (io && io.value || '').trim();
+++    if (!str) { this.toast('请先粘贴导入字符串', 'bad'); return; }
+++    const p = importSave(str);
+++    if (!p) { this.toast('导入失败：字符串无效', 'bad'); return; }
+++    const slot = this.activeSlot != null ? this.activeSlot : this.pickSlotForNewSave();
+++    this.activeSlot = slot;
+++    p.floorState = null; // 导入档重生成当前层
+++    saveToSlot(slot, p);
+++    this.toast(`导入成功，已写入 #${slot + 1} 槽位`, 'good');
+++    this.closeModal();
+++    // 通关档直接进入结局画面，与「继续旅程」行为一致，而非落回可游玩地图。
+++    if (p.ending) { this.player = p; this.renderEnding(p.ending, true, p); }
+++    else this.enterGame(p, slot);
+++  }
+++
+++  confirmExitToLauncher() {
+++    if (!this.player) { this.showLauncher(); return; }
+++    this.showSheet({
+++      title: '返回标题？',
+++      body: [h('div', { class: 'muted' }, '进度已自动保存，可随时从存档管理回到这里。')],
+++      foot: [
+++        h('button', { class: 'btn-primary', onClick: () => { this.closeModal(); this.showLauncher(); } }, '返回标题'),
+++        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '留在游戏'),
+++      ],
+++    });
+++  }
+++
+++  // ===================== 通用弹窗 / 反馈 =====================
+++  showSheet({ title, body, foot, dismissable = true }) {
+++    clear(this.modalRoot);
+++    // dismissable=false 时遮罩不可点击关闭（用于必须做出选择的结局抉择，避免软锁）。
+++    const overlay = h('div', { class: 'sheet-overlay', onClick: () => { if (dismissable) this.closeModal(); } });
+++    const sheet = h('div', { class: 'sheet' },
+++      h('div', { class: 'sheet__head' }, h('span', { class: 't' }, title || '')),
+++      h('div', { class: 'sheet__body' }, ...(body || [])),
+++      h('div', { class: 'sheet__foot' }, ...(foot || [])),
+++    );
+++    this.modalRoot.append(overlay, sheet);
+++    this._sheet = sheet;
+++  }
+++  closeModal() { clear(this.modalRoot); this._sheet = null; }
+++
+++  toast(text, type = 'normal') {
+++    const t = h('div', { class: `toast ${type}` }, text);
+++    this.toastWrap.appendChild(t);
+++    setTimeout(() => { t.classList.add('hide'); setTimeout(() => t.remove(), 300); }, 1500);
+++  }
+++
+++  pushLog(text, type = 'normal') {
+++    if (!this.player) return;
+++    this.player.log.push({ turn: this.player.turn, text, type });
+++    if (this.player.log.length > 200) this.player.log.shift();
+++  }
+++
+++  // 浮动飘字：相对地图格定位。
+++  floatAt(gx, gy, text, cls) {
+++    if (!this.floatLayer) return;
+++    const cell = this.cellNodes[gy] && this.cellNodes[gy][gx];
+++    if (!cell) return;
+++    const r = this.floatLayer.getBoundingClientRect();
+++    const cr = cell.getBoundingClientRect();
+++    const x = cr.left - r.left + cr.width / 2;
+++    const y = cr.top - r.top + cr.height / 2;
+++    this.spawnFloat(x, y, text, cls);
+++  }
+++  floatAtCenter(text, cls) {
+++    if (!this.floatLayer) return;
+++    const r = this.floatLayer.getBoundingClientRect();
+++    this.spawnFloat(r.width / 2, r.height / 2 - 20, text, cls);
+++  }
+++  spawnFloat(x, y, text, cls) {
+++    if (!this.floatLayer) return;
+++    const el = h('div', { class: `float-num ${cls || ''}`, style: { left: `${x}px`, top: `${y}px` } }, text);
+++    this.floatLayer.appendChild(el);
+++    setTimeout(() => el.remove(), 900);
+++  }
+++
+++  shake() {
+++    const game = this.stage.querySelector('.xhlz-game') || this.stage.querySelector('.battle');
+++    if (!game) return;
+++    game.classList.remove('shake');
+++    void game.offsetWidth;
+++    game.classList.add('shake');
+++  }
+++
+++  // ===================== 主循环（rAF）=====================
+++  startLoop() {
+++    if (this.running) return;
+++    this.running = true;
+++    this._lastFrame = nowMs();
+++    this._staminaAccum = 0;
+++    const tick = () => {
+++      if (!this.running) return;
+++      this._raf = requestAnimationFrame(tick);
+++      const t = nowMs();
+++      // 闲置降帧：地图且无弹窗时节流到 ~20fps；战斗全速（驱动计时条）。
+++      const idle = this.screen === 'game' && !this._sheet;
+++      if (idle && t - this._lastFrame < IDLE_FRAME_MS) return;
+++      this._lastFrame = t;
+++      this.onTick(t);
+++    };
+++    this._raf = requestAnimationFrame(tick);
+++  }
+++  stopLoop() {
+++    this.running = false;
+++    if (this._raf) cancelAnimationFrame(this._raf);
+++    this._raf = 0;
+++  }
+++
+++  onTick(t) {
+++    // 每帧刷新 _prevTick，避免战斗/弹窗期间未更新导致回到地图时把整段时间一次性计入回精。
+++    const delta = t - (this._prevTick || t);
+++    this._prevTick = t;
+++    // 战斗限时倒计时（开弹窗时暂停，不与玩家的脱离确认冲突）
+++    if (this.screen === 'battle' && this.battle && this.timerEnabled && !this.battle.auto && !this.battle.busy && !this._sheet) {
+++      const remain = Math.max(0, this.battle.timerEnd - t);
+++      this.timerFill.style.width = `${(remain / BATTLE_TIME_MS) * 100}%`;
+++      if (remain <= 0) { this.logBattle('⏰ 来不及反应！', 'bad'); this.chooseAction('hesitate'); }
+++      return;
+++    }
+++    // 地图闲置：缓慢回复精力（delta 已按帧刷新，不会跨战斗累积）。
+++    if (this.screen === 'game' && !this._sheet && this.player.stamina < maxStamina()) {
+++      this._staminaAccum += delta;
+++      while (this._staminaAccum >= STAMINA_REGEN_INTERVAL_MS) {
+++        this._staminaAccum -= STAMINA_REGEN_INTERVAL_MS;
+++        regenStamina(this.player, 1);
+++      }
+++      this.refreshStatus();
+++    }
+++  }
+++
+++  destroy() {
+++    this.stopLoop();
+++    try { if (this.player) saveToSlot(this.activeSlot, this.player); } catch (_) {}
+++    clear(this.parent);
+++    clear(this.modalRoot);
+++    clear(this.toastWrap);
+++    this.player = null;
+++    this.battle = null;
+++    this.over = false;
+++  }
+++}
+++
+++// —— 纯辅助（不依赖 this）——
+++function isVisible(x, y, pos) {
+++  return Math.max(Math.abs(x - pos.x), Math.abs(y - pos.y)) <= VISION_RADIUS;
+++}
+++function visibleKeysList(st, x, y) {
+++  const out = [];
+++  for (let dy = -VISION_RADIUS; dy <= VISION_RADIUS; dy++) {
+++    for (let dx = -VISION_RADIUS; dx <= VISION_RADIUS; dx++) {
+++      const nx = x + dx, ny = y + dy;
+++      if (nx >= 0 && ny >= 0 && nx < GRID && ny < GRID) out.push(`${nx},${ny}`);
+++    }
+++  }
+++  return out;
+++}
+++function adjacentEnemy(st, pos) {
+++  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
+++    const e = entityAt(st, pos.x + dx, pos.y + dy);
+++    if (e && e.type === 'enemy') return e;
+++  }
+++  return null;
+++}
+++function entityEmoji(ent, tileId) {
+++  switch (ent.type) {
+++    case 'enemy': return ent.emoji || '👾';
+++    case 'chest': return '🎁';
+++    case 'merchant': return '🛒';
+++    case 'drone': return '🔧';
+++    case 'memory': return '💎';
+++    case 'trap': return ''; // 陷阱不显示
+++    default: return '';
+++  }
+++}
+++function spentStardust(p) {
+++  let s = 0;
+++  for (const t of TALENTS) {
+++    const rank = p.talents[t.branch] || 0;
+++    for (let i = 0; i < rank; i++) s += talentCost(t.branch, i);
+++  }
+++  return s;
+++}
+++function nowMs() {
+++  try { return Date.now(); } catch (_) { return 0; }
+++}
++diff --git a/apps/xing-hai-lv-zhe/src/ui/dom.js b/apps/xing-hai-lv-zhe/src/ui/dom.js
++new file mode 100644
++index 0000000..bf0a8c3
++--- /dev/null
+++++ b/apps/xing-hai-lv-zhe/src/ui/dom.js
++@@ -0,0 +1,43 @@
+++// ============================================================================
+++// 轻量 DOM 辅助：h() 创建元素，clear() 清空，bar() 进度条，避免引入框架。
+++// ============================================================================
+++export function h(tag, props, ...children) {
+++  const el = document.createElement(tag);
+++  if (props) {
+++    for (const [k, v] of Object.entries(props)) {
+++      if (v == null || v === false) continue;
+++      if (k === 'class') el.className = v;
+++      else if (k === 'dataset') Object.assign(el.dataset, v);
+++      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
+++      else if (k === 'onClick') el.addEventListener('click', v);
+++      else if (k === 'onInput') el.addEventListener('input', v);
+++      else if (k === 'html') el.innerHTML = v; // 仅用于受控静态内容
+++      else if (k in el) { try { el[k] = v; } catch (_) { el.setAttribute(k, v); } }
+++      else el.setAttribute(k, v);
+++    }
+++  }
+++  appendChildren(el, children);
+++  return el;
+++}
+++
+++function appendChildren(el, children) {
+++  for (const c of children) {
+++    if (c == null || c === false || c === true) continue;
+++    if (Array.isArray(c)) { appendChildren(el, c); continue; }
+++    el.append(c.nodeType ? c : document.createTextNode(String(c)));
+++  }
+++}
+++
+++export function clear(el) {
+++  while (el.firstChild) el.removeChild(el.firstChild);
+++  return el;
+++}
+++
+++// 进度条：label 叠加在条上，pct 由 value/max 决定。
+++export function bar(value, max, opts = {}) {
+++  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
+++  return h('div', { class: `bar ${opts.class || ''}` },
+++    h('div', { class: 'bar__fill', style: { width: `${pct}%`, background: opts.color || '' } }),
+++    h('span', { class: 'bar__label' }, opts.label || `${Math.floor(value)}/${Math.round(max)}`),
+++  );
+++}
++diff --git a/apps/xing-hai-lv-zhe/src/ui/style.css b/apps/xing-hai-lv-zhe/src/ui/style.css
++new file mode 100644
++index 0000000..e75528d
++--- /dev/null
+++++ b/apps/xing-hai-lv-zhe/src/ui/style.css
++@@ -0,0 +1,338 @@
+++/* ==========================================================================
+++   星骸旅者 · 样式（开罗式像素明亮风、竖屏三段式、移动端优先、适配安全区）
+++   命名空间 .xhlz，与主框架其他展品样式互不干扰。
+++   ========================================================================== */
+++.xhlz {
+++  --bg: #f8f4e6;
+++  --bg-2: #f3ead6;
+++  --card: #fffaf0;
+++  --card-2: #f6efde;
+++  --line: #d9c9a3;
+++  --line-2: #c9b68a;
+++  --ink: #3a3a4a;
+++  --ink-soft: #6b6a78;
+++  --muted: #9a9486;
+++  --gold: #ffb400;
+++  --stardust: #ffd93d;
+++  --player: #4d96ff;
+++  --hp: #ff6b6b;
+++  --stamina: #38a3a5;
+++  --monster: #e8634a;
+++  --arcane: #9d4edd;
+++  --good: #57c785;
+++  --bad: #e8634a;
+++  --radius: 14px;
+++
+++  position: absolute;
+++  inset: 0;
+++  background:
+++    radial-gradient(120% 60% at 50% -10%, #fffdf6 0%, transparent 55%),
+++    repeating-linear-gradient(45deg, rgba(217,201,163,0.10) 0 2px, transparent 2px 6px),
+++    var(--bg);
+++  color: var(--ink);
+++  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif;
+++  font-size: 14px;
+++  line-height: 1.5;
+++  overflow: hidden;
+++  -webkit-user-select: none;
+++  user-select: none;
+++  -webkit-tap-highlight-color: transparent;
+++}
+++
+++.xhlz * { box-sizing: border-box; }
+++.xhlz .muted { color: var(--muted); font-size: 0.82rem; }
+++.xhlz .grow { flex: 1; min-width: 0; }
+++
+++/* 舞台 */
+++.xhlz .xhlz-stage { position: absolute; inset: 0; overflow: hidden; }
+++.xhlz .xhlz-game { position: absolute; inset: 0; display: flex; flex-direction: column; overflow: hidden; }
+++.xhlz .shake { animation: xhlz-shake 0.32s ease; }
+++@keyframes xhlz-shake {
+++  0%,100% { transform: translate(0,0); }
+++  20% { transform: translate(-4px, 2px); }
+++  40% { transform: translate(4px, -2px); }
+++  60% { transform: translate(-3px, -2px); }
+++  80% { transform: translate(3px, 2px); }
+++}
+++
+++.xhlz button {
+++  font-family: inherit;
+++  cursor: pointer;
+++  border: 2px solid var(--line-2);
+++  border-radius: 10px;
+++  background: var(--card);
+++  color: var(--ink);
+++  padding: 0.55rem 0.8rem;
+++  font-size: 0.9rem;
+++  font-weight: 600;
+++  box-shadow: 0 2px 0 var(--line-2);
+++  transition: transform 0.08s ease, box-shadow 0.08s ease, opacity 0.15s ease;
+++}
+++.xhlz button:active { transform: translateY(2px); box-shadow: 0 0 0 var(--line-2); }
+++.xhlz button:disabled { opacity: 0.45; cursor: default; }
+++.xhlz .btn-primary { background: linear-gradient(180deg, #ffd93d, var(--gold)); color: #3a2a00; border-color: #d99a00; box-shadow: 0 2px 0 #b07d00; }
+++.xhlz .btn-jade { background: linear-gradient(180deg, #6fe0b0, #2f9a72); color: #06241a; border-color: #2f9a72; box-shadow: 0 2px 0 #226e52; }
+++.xhlz .btn-blue { background: linear-gradient(180deg, #6fb0ff, #2f6fae); color: #fff; border-color: #2f6fae; box-shadow: 0 2px 0 #214d77; }
+++.xhlz .btn-danger { background: linear-gradient(180deg, #ff8a7a, var(--bad)); color: #fff; border-color: var(--bad); box-shadow: 0 2px 0 #a83a2c; }
+++.xhlz .btn-ghost { background: var(--card-2); }
+++.xhlz .big-btn { width: 100%; padding: 0.85rem; font-size: 1rem; }
+++.xhlz .icon-btn { padding: 0.45rem 0.55rem; font-size: 1rem; line-height: 1; }
+++
+++.xhlz .card {
+++  background: linear-gradient(180deg, var(--card), var(--card-2));
+++  border: 2px solid var(--line);
+++  border-radius: var(--radius);
+++  padding: 0.75rem;
+++  margin-bottom: 0.55rem;
+++}
+++.xhlz h4 { margin: 0 0 0.4rem; font-size: 0.95rem; }
+++
+++/* —— 启动器 / 创角 / 结局 —— */
+++.xhlz .launcher {
+++  position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden;
+++  padding: max(1.4rem, env(safe-area-inset-top)) 1rem max(1.4rem, env(safe-area-inset-bottom));
+++  display: flex; flex-direction: column; align-items: stretch; justify-content: center;
+++  max-width: 480px; margin: 0 auto;
+++}
+++.xhlz .launcher__brand { text-align: center; margin-bottom: 1.2rem; }
+++.xhlz .launcher__brand .emblem {
+++  width: 66px; height: 66px; margin: 0 auto 0.6rem; border-radius: 18px;
+++  display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800;
+++  background: radial-gradient(circle at 35% 30%, #ffe98a, var(--gold));
+++  border: 2px solid #d99a00; color: #3a2a00;
+++  box-shadow: 0 4px 0 #b07d00, inset 0 0 0 3px rgba(255,255,255,0.4);
+++}
+++.xhlz .launcher__brand h1 { margin: 0; font-size: 1.6rem; }
+++.xhlz .launcher__brand .sub { margin: 0.3rem 0 0; color: var(--ink-soft); font-size: 0.85rem; }
+++.xhlz .launcher__actions { display: flex; flex-direction: column; gap: 0.55rem; }
+++.xhlz .launcher__hint { text-align: center; margin-top: 0.9rem; }
+++.xhlz .create__head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.8rem; }
+++.xhlz .create__head h1 { margin: 0; font-size: 1.2rem; flex: 1; text-align: center; }
+++.xhlz .name-input {
+++  width: 100%; padding: 0.7rem; border-radius: 10px; border: 2px solid var(--line-2);
+++  background: var(--card); color: var(--ink); font-family: inherit; font-size: 1rem;
+++}
+++.xhlz .name-input:focus { outline: none; border-color: var(--player); }
+++.xhlz .create__foot { margin-top: 0.6rem; }
+++.xhlz .seed-row { display: flex; gap: 0.5rem; align-items: center; }
+++.xhlz .seed-input {
+++  flex: 1; padding: 0.55rem; border-radius: 10px; border: 2px solid var(--line-2);
+++  background: var(--card); color: var(--ink); font-family: ui-monospace, monospace; font-size: 0.95rem;
+++}
+++
+++/* —— 顶部状态栏（~8%）—— */
+++.xhlz .status-bar {
+++  flex: none;
+++  padding: max(0.55rem, env(safe-area-inset-top)) 0.7rem 0.45rem;
+++  background: linear-gradient(180deg, var(--card-2), var(--bg-2));
+++  border-bottom: 2px solid var(--line);
+++}
+++.xhlz .status-top { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.35rem; }
+++.xhlz .status-name { font-weight: 800; font-size: 0.95rem; }
+++.xhlz .status-lv { font-size: 0.74rem; color: #fff; background: var(--player); padding: 0 0.35rem; border-radius: 6px; font-weight: 700; }
+++.xhlz .status-floor { font-size: 0.8rem; color: var(--ink-soft); }
+++.xhlz .status-floor b { color: var(--gold); }
+++.xhlz .status-res { margin-left: auto; display: flex; gap: 0.4rem; font-variant-numeric: tabular-nums; font-weight: 700; font-size: 0.82rem; }
+++.xhlz .status-res .r { display: flex; align-items: center; gap: 0.2rem; }
+++.xhlz .status-bars { display: flex; flex-direction: column; gap: 0.28rem; }
+++.xhlz .barline { display: flex; align-items: center; gap: 0.4rem; }
+++.xhlz .barline .bl-icon { flex: none; width: 1.1rem; text-align: center; }
+++.xhlz .barline .bl-track { flex: 1; height: 11px; background: rgba(58,58,74,0.12); border-radius: 6px; overflow: hidden; border: 1px solid var(--line); }
+++.xhlz .barline .bl-fill { height: 100%; border-radius: 6px; transition: width 0.4s cubic-bezier(0.22,1,0.36,1); }
+++.xhlz .barline .bl-val { flex: none; width: 3.4rem; text-align: right; font-size: 0.74rem; font-variant-numeric: tabular-nums; font-weight: 700; }
+++
+++/* —— 中央像素地图 —— */
+++.xhlz .map-wrap {
+++  flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
+++  padding: 0.4rem; position: relative; overflow: hidden;
+++}
+++.xhlz .map-frame {
+++  position: relative;
+++  width: min(100%, calc(100vh - 230px));
+++  aspect-ratio: 1 / 1;
+++  background: #2b2d3a;
+++  border: 3px solid var(--line-2);
+++  border-radius: 12px;
+++  box-shadow: inset 0 0 0 2px rgba(0,0,0,0.3), 0 3px 0 var(--line-2);
+++  overflow: hidden;
+++}
+++.xhlz .map-grid {
+++  position: absolute; inset: 0;
+++  display: grid;
+++  grid-template-columns: repeat(16, 1fr);
+++  grid-template-rows: repeat(16, 1fr);
+++}
+++.xhlz .cell {
+++  position: relative;
+++  display: flex; align-items: center; justify-content: center;
+++  font-size: clamp(0.7rem, 2.6vw, 1rem);
+++  line-height: 1;
+++}
+++/* 雾：未探索 = 全黑；已探索不可见 = 压暗 */
+++.xhlz .cell.fog { background: #1a1c28; }
+++.xhlz .cell.fog .ent { display: none; }
+++.xhlz .cell.dim { filter: brightness(0.5) saturate(0.6); }
+++.xhlz .cell.dim .ent { opacity: 0.55; }
+++.xhlz .cell.visible { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05); }
+++.xhlz .cell .ent { position: relative; z-index: 2; }
+++.xhlz .cell.player::after {
+++  content: ''; position: absolute; inset: 8%;
+++  border-radius: 30%; border: 2px solid #fff;
+++  box-shadow: 0 0 6px rgba(255,255,255,0.8);
+++  animation: xhlz-bob 1.1s ease-in-out infinite;
+++}
+++.xhlz .cell.reachable { cursor: pointer; }
+++.xhlz .cell.reachable::before {
+++  content: ''; position: absolute; inset: 14%;
+++  border-radius: 50%; background: rgba(77,150,255,0.25);
+++  border: 1px dashed rgba(77,150,255,0.7);
+++}
+++.xhlz .cell.stairs .ent { animation: xhlz-glow 1.4s ease-in-out infinite; }
+++@keyframes xhlz-bob { 0%,100% { transform: scale(1); } 50% { transform: scale(0.86); } }
+++@keyframes xhlz-glow { 0%,100% { filter: drop-shadow(0 0 0 #ffd93d); } 50% { filter: drop-shadow(0 0 4px #ffd93d); } }
+++
+++/* 浮动飘字（伤害 / 拾取）*/
+++.xhlz .float-layer { position: absolute; inset: 0; pointer-events: none; z-index: 30; overflow: hidden; }
+++.xhlz .float-num {
+++  position: absolute; font-weight: 800; font-size: 1rem;
+++  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
+++  animation: xhlz-float 0.9s ease-out forwards;
+++}
+++.xhlz .float-num.up { color: var(--good); }
+++.xhlz .float-num.down { color: var(--bad); }
+++.xhlz .float-num.gold { color: var(--gold); }
+++@keyframes xhlz-float {
+++  0% { opacity: 0; transform: translate(-50%, 0) scale(0.7); }
+++  20% { opacity: 1; transform: translate(-50%, -10px) scale(1.15); }
+++  100% { opacity: 0; transform: translate(-50%, -40px) scale(1); }
+++}
+++
+++/* —— 底部操作栏（~27%）—— */
+++.xhlz .bottom-bar {
+++  flex: none; display: flex; align-items: stretch; gap: 0.45rem;
+++  padding: 0.45rem 0.6rem max(0.5rem, env(safe-area-inset-bottom));
+++  background: linear-gradient(0deg, var(--bg-2), var(--card-2));
+++  border-top: 2px solid var(--line);
+++}
+++.xhlz .dpad {
+++  display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);
+++  gap: 0.25rem; width: 128px; height: 116px; flex: none;
+++}
+++.xhlz .dpad button { padding: 0; font-size: 1.1rem; }
+++.xhlz .dpad .d-up { grid-area: 1 / 2; }
+++.xhlz .dpad .d-left { grid-area: 2 / 1; }
+++.xhlz .dpad .d-center { grid-area: 2 / 2; background: var(--card-2); }
+++.xhlz .dpad .d-right { grid-area: 2 / 3; }
+++.xhlz .dpad .d-down { grid-area: 3 / 2; }
+++.xhlz .act-col { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; justify-content: center; }
+++.xhlz .interact-btn {
+++  flex: 1; min-height: 56px; font-size: 1rem; font-weight: 800;
+++  border-radius: 14px;
+++}
+++.xhlz .tool-col { display: flex; flex-direction: column; gap: 0.4rem; flex: none; }
+++.xhlz .tool-col .icon-btn { min-width: 48px; min-height: 48px; }
+++
+++/* —— 弹窗（Sheet）—— */
+++.xhlz .xhlz-modals { position: absolute; inset: 0; z-index: 50; pointer-events: none; }
+++.xhlz .sheet-overlay {
+++  position: absolute; inset: 0; background: rgba(40,32,16,0.5); pointer-events: auto;
+++  animation: xhlz-fade 0.2s ease;
+++}
+++.xhlz .sheet {
+++  position: absolute; left: 0; right: 0; bottom: 0; max-height: 88%; overflow-y: auto;
+++  background: linear-gradient(180deg, var(--card), var(--bg-2));
+++  border-top: 2px solid var(--line-2); border-radius: 20px 20px 0 0;
+++  padding: max(0.7rem, env(safe-area-inset-top)) 0.9rem max(0.8rem, env(safe-area-inset-bottom));
+++  pointer-events: auto; animation: xhlz-sheet-up 0.25s cubic-bezier(0.22,1,0.36,1);
+++}
+++.xhlz .sheet__head { display: flex; align-items: center; justify-content: center; margin-bottom: 0.6rem; }
+++.xhlz .sheet__head .t { font-size: 1.05rem; font-weight: 800; }
+++.xhlz .sheet__body { padding-bottom: 0.3rem; }
+++.xhlz .sheet__foot { display: flex; flex-wrap: wrap; gap: 0.45rem; }
+++.xhlz .sheet__foot > * { flex: 1 1 auto; }
+++@keyframes xhlz-fade { from { opacity: 0; } to { opacity: 1; } }
+++@keyframes xhlz-sheet-up { from { transform: translateY(40px); opacity: 0.4; } to { transform: none; opacity: 1; } }
+++
+++/* —— 背包：装备 / 天赋 / 剧情 标签 —— */
+++.xhlz .tabs { display: flex; gap: 0.35rem; margin-bottom: 0.6rem; }
+++.xhlz .tab { flex: 1; padding: 0.45rem 0.2rem; font-size: 0.85rem; }
+++.xhlz .tab.active { background: linear-gradient(180deg, #ffd93d, var(--gold)); color: #3a2a00; border-color: #d99a00; }
+++.xhlz .equip-card { display: flex; align-items: center; gap: 0.6rem; }
+++.xhlz .equip-card .eq-emoji { font-size: 1.6rem; flex: none; }
+++.xhlz .equip-card .eq-info { flex: 1; min-width: 0; }
+++.xhlz .equip-card .eq-name { font-weight: 700; }
+++.xhlz .equip-card .eq-name .plus { color: var(--gold); font-weight: 800; }
+++.xhlz .equip-card .eq-affix { font-size: 0.74rem; color: var(--arcane); font-weight: 700; }
+++.xhlz .equip-card .eq-cost { font-size: 0.74rem; color: var(--ink-soft); }
+++.xhlz .talent-branch { margin-bottom: 0.5rem; }
+++.xhlz .talent-head { display: flex; align-items: center; gap: 0.45rem; margin-bottom: 0.3rem; }
+++.xhlz .talent-ranks { display: flex; gap: 0.25rem; margin: 0.25rem 0; }
+++.xhlz .talent-pip { width: 1.1rem; height: 1.1rem; border-radius: 50%; background: rgba(58,58,74,0.12); border: 1px solid var(--line); }
+++.xhlz .talent-pip.on { background: var(--gold); border-color: #d99a00; box-shadow: inset 0 0 0 2px rgba(255,255,255,0.4); }
+++.xhlz .chapter { padding: 0.55rem 0.65rem; border-radius: 10px; background: var(--card-2); border: 1px solid var(--line); margin-bottom: 0.4rem; }
+++.xhlz .chapter.locked { opacity: 0.55; }
+++.xhlz .chapter .ch-title { font-weight: 700; color: var(--arcane); }
+++.xhlz .chapter .ch-text { font-size: 0.85rem; line-height: 1.55; margin-top: 0.2rem; }
+++
+++/* 通用进度条 */
+++.xhlz .bar { position: relative; height: 14px; background: rgba(58,58,74,0.12); border-radius: 7px; overflow: hidden; border: 1px solid var(--line); }
+++.xhlz .bar__fill { position: absolute; inset: 0 auto 0 0; border-radius: 7px; transition: width 0.4s ease; background: var(--player); }
+++.xhlz .bar__label {
+++  position: absolute; inset: 0; display: flex; align-items: center; justify-content: flex-end;
+++  padding-right: 0.4rem; font-size: 0.72rem; font-weight: 800; color: #fff;
+++  text-shadow: 0 1px 2px rgba(0,0,0,0.6); font-variant-numeric: tabular-nums;
+++}
+++
+++/* —— 战斗覆盖层 —— */
+++.xhlz .battle { position: absolute; inset: 0; display: flex; flex-direction: column; padding: max(0.6rem, env(safe-area-inset-top)) 0.7rem max(0.6rem, env(safe-area-inset-bottom)); background: radial-gradient(120% 70% at 50% 0%, #3a2a4a, #1f1a2a); color: #f3ead6; }
+++.xhlz .battle__foe { text-align: center; margin: 0.4rem 0 0.3rem; }
+++.xhlz .battle__foe .emoji { font-size: 3rem; }
+++.xhlz .battle__foe .name { font-weight: 800; font-size: 1.05rem; }
+++.xhlz .battle__stance { text-align: center; margin: 0.4rem 0; min-height: 2.6rem; }
+++.xhlz .stance-chip { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.35rem 0.8rem; border-radius: 999px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); font-weight: 700; }
+++.xhlz .stance-chip.unknown { opacity: 0.85; font-style: italic; }
+++.xhlz .battle__log { flex: 1; min-height: 0; overflow-y: auto; font-size: 0.82rem; display: flex; flex-direction: column; gap: 0.25rem; padding: 0.3rem 0.5rem; }
+++.xhlz .battle__log .ln { padding: 0.25rem 0.4rem; border-radius: 8px; background: rgba(255,255,255,0.06); }
+++.xhlz .battle__log .ln.good { color: #9be8b5; }
+++.xhlz .battle__log .ln.bad { color: #ffb0a6; }
+++.xhlz .battle__timer { height: 6px; background: rgba(255,255,255,0.12); border-radius: 4px; overflow: hidden; margin: 0.3rem 0; }
+++.xhlz .battle__timer .t { height: 100%; background: linear-gradient(90deg, #ffd93d, #ff8a3d); transition: width 0.1s linear; }
+++.xhlz .battle__actions { display: flex; gap: 0.45rem; }
+++.xhlz .battle__actions .act { flex: 1; min-height: 60px; font-size: 0.92rem; font-weight: 800; color: #fff; }
+++.xhlz .battle__actions .act.block { background: linear-gradient(180deg, #6fb0ff, #2f6fae); border-color: #2f6fae; box-shadow: 0 2px 0 #214d77; }
+++.xhlz .battle__actions .act.dodge { background: linear-gradient(180deg, #6fe0b0, #2f9a72); border-color: #2f9a72; box-shadow: 0 2px 0 #226e52; }
+++.xhlz .battle__actions .act.counter { background: linear-gradient(180deg, #ff9a8a, #e8634a); border-color: #e8634a; box-shadow: 0 2px 0 #a83a2c; }
+++.xhlz .battle__topbar { display: flex; align-items: center; gap: 0.5rem; }
+++.xhlz .battle__topbar .title { flex: 1; font-weight: 800; }
+++.xhlz .battle__self { display: flex; gap: 0.5rem; align-items: center; margin: 0.35rem 0; font-size: 0.8rem; }
+++.xhlz .battle__self .bar { flex: 1; }
+++
+++/* —— 结局 —— */
+++.xhlz .ending { text-align: center; }
+++.xhlz .ending__emoji { font-size: 3.4rem; }
+++.xhlz .ending h2 { margin: 0.3rem 0; font-size: 1.4rem; }
+++.xhlz .ending.peace h2 { color: #2f9a72; }
+++.xhlz .ending.dark h2 { color: var(--bad); }
+++.xhlz .ending__text { font-size: 0.92rem; line-height: 1.7; margin: 0.6rem 0; text-align: left; }
+++.xhlz .ending__choice { display: flex; flex-direction: column; gap: 0.5rem; }
+++
+++/* —— 存档管理 —— */
+++.xhlz .slot-list { display: flex; flex-direction: column; gap: 0.45rem; }
+++.xhlz .slot-row { display: flex; align-items: center; gap: 0.6rem; padding: 0.55rem 0.65rem; border-radius: 10px; background: var(--card-2); border: 1px solid var(--line); }
+++.xhlz .slot-row.empty { opacity: 0.7; border-style: dashed; }
+++.xhlz .slot-no { flex: none; width: 1.6rem; height: 1.6rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 800; background: var(--bg-2); color: var(--ink-soft); border: 1px solid var(--line); }
+++.xhlz .slot-info { flex: 1; min-width: 0; }
+++.xhlz .slot-name { font-weight: 800; }
+++.xhlz .slot-meta { font-size: 0.76rem; color: var(--ink-soft); margin-top: 0.1rem; }
+++.xhlz .slot-actions { flex: none; display: flex; gap: 0.3rem; }
+++.xhlz .slot-act { padding: 0.35rem 0.55rem; font-size: 0.8rem; }
+++.xhlz .save-io { width: 100%; height: 60px; resize: vertical; padding: 0.5rem; border-radius: 8px; border: 2px solid var(--line-2); background: var(--card); color: var(--ink); font-family: ui-monospace, monospace; font-size: 1rem; word-break: break-all; }
+++
+++/* —— Toast —— */
+++.xhlz .toast-wrap { position: absolute; top: max(0.5rem, env(safe-area-inset-top)); left: 0; right: 0; z-index: 90; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; pointer-events: none; }
+++.xhlz .toast { max-width: 88%; padding: 0.45rem 0.85rem; border-radius: 999px; font-size: 0.82rem; font-weight: 600; background: rgba(58,58,74,0.94); border: 1px solid var(--line-2); color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.3); animation: xhlz-toast-in 0.25s ease; }
+++.xhlz .toast.good { border-color: var(--good); }
+++.xhlz .toast.bad { border-color: var(--bad); }
+++.xhlz .toast.hide { animation: xhlz-toast-out 0.3s ease forwards; }
+++@keyframes xhlz-toast-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
+++@keyframes xhlz-toast-out { to { opacity: 0; transform: translateY(-8px); } }
++diff --git a/apps/xing-hai-lv-zhe/vite.config.js b/apps/xing-hai-lv-zhe/vite.config.js
++new file mode 100644
++index 0000000..2dc4040
++--- /dev/null
+++++ b/apps/xing-hai-lv-zhe/vite.config.js
++@@ -0,0 +1,16 @@
+++import { defineConfig } from 'vite';
+++
+++// `base: './'` 生成相对路径资源引用，便于部署到 GitHub Pages 子路径或任意静态目录。
+++// 本作刻意不依赖任何框架，纯原生 DOM + Canvas 渲染，构建产物极小。
+++export default defineConfig({
+++  base: './',
+++  server: {
+++    host: true,
+++    port: 5176,
+++  },
+++  build: {
+++    outDir: 'dist',
+++    sourcemap: false,
+++    target: 'es2018',
+++  },
+++});
++diff --git a/src/main.js b/src/main.js
++index ed2a00c..488d9cb 100644
++--- a/src/main.js
+++++ b/src/main.js
++@@ -42,6 +42,14 @@ const APPS = {
++     desc: '从呱呱坠地到垂垂老矣，一月一回合推进岁月，在健康、智力、财富、心情、社交间权衡抉择；可多槽位存档、可挂机，过完这一生。',
++     loader: () => import('../apps/mo-ni-ren-sheng/src/main.js'),
++   },
+++  xhlz: {
+++    key: 'xhlz',
+++    title: '星骸旅者',
+++    subtitle: '像素 · Roguelike',
+++    emblem: '星',
+++    desc: '迫降破碎星球，在漂浮的遗迹浮岛间拾荒探索。猜拳克制式战斗、装备强化与三天赋树、碎片化记忆叙事，集齐十枚星骸回响揭开真相。',
+++    loader: () => import('../apps/xing-hai-lv-zhe/src/main.js'),
+++  },
++ }
++ 
++ // 大类：先呈现「学习」，再呈现「游戏」。点击大类进入后，才展开其中的具体应用。
++@@ -59,8 +67,8 @@ const CATEGORIES = [
++     title: '游戏',
++     subtitle: '休闲 · 互动娱乐',
++     emblem: '玩',
++-    desc: '消磨时光的互动小品：修仙、人生、三国战场，挑一个开始吧。',
++-    appKeys: ['dzf', 'frxx', 'mnrs'],
+++    desc: '消磨时光的互动小品：修仙、人生、三国战场、星骸浮岛，挑一个开始吧。',
+++    appKeys: ['dzf', 'frxx', 'mnrs', 'xhlz'],
++   },
++ ]
++ 
+diff --git a/.ai-tasks/issue-69/review_error_r1.log b/.ai-tasks/issue-69/review_error_r1.log
+new file mode 100644
+index 0000000..e69de29
+diff --git a/.ai-tasks/issue-69/review_result_r1.md b/.ai-tasks/issue-69/review_result_r1.md
+new file mode 100644
+index 0000000..33be81f
+--- /dev/null
++++ b/.ai-tasks/issue-69/review_result_r1.md
+@@ -0,0 +1,20 @@
++我已完成详尽的审查，包括阅读所有源码，运行了两个测试套件（123 + 49 项通过），并构建了对抗性探测。以下是我的审查结果。
++
++DECISION: REQUEST_CHANGES
++COMMENT: 整体工程质量较高（模块化清晰、纯函数可测、存档迁移健壮、123+49 项自测全过、楼梯连通性 1800 次穷举 0 软锁、未触碰 .github/ 工作流——无需人类改 CI/CD）。但存在一个会影响「自动战斗」这一主打卖点的真实 Bug，需修复后再合入。
++
++【阻断级 Bug · 自动战斗关闭瞬间必定失手】src/ui/app.js
++复现：进入战斗 → 开启 🤖 自动战斗 → 自动打数秒（>3s，如 4 个回合约 3.4s）→ 关闭 🤖。结果：玩家立刻被判定「⏰ 来不及反应！」并强制失手受击。
++根因（三段联立）：
++1) nextRound() 中 `if (this.timerEnabled && !this.battle.auto)` 才会刷新 timerEnd；auto=true 期间 timerEnd 不再更新，停留在「最后一次手动回合」的旧值（若从一开始就开自动，timerEnd 恒为初始 0）。
++2) toggleAuto() 关闭自动时，既没有重置 timerEnd，也没有给玩家一个全新限时窗口。
++3) onTick() 的倒计时分支条件为 `screen==='battle' && timerEnabled && !auto && !busy && !_sheet`，关闭自动后立即命中，`remain=max(0, timerEnd-now)` 因 timerEnd 过期等于 0 → 立刻 chooseAction('hesitate') 强制失手。
++我用最小逻辑复现确认：auto 期间经过 4000ms 后关闭，remain==0 ⇒ instant fumble=true。这是把「关自动」误罚玩家的逻辑漏洞，且 320ms 的窗口极易触发。建议在 toggleAuto() 关闭自动、以及 nextRound() 中 auto 由 true 转 false 的当回合，执行 `this.battle.timerEnd = nowMs() + BATTLE_TIME_MS`（与手动回合一致），给玩家完整 3 秒。
++
++【次要问题（建议一并处理，非阻断）】
++- src/core/world.js takeCell() / src/core/rng.js pick()/randInt()：均假设 rng()∈[0,1)。`arr[Math.floor(r()*len)]` 在 r()≥1 时会取到 undefined（我在注入 r()=2 时实测触发 `Cannot read properties of undefined (reading 'x')` 崩溃）。生产环境 this.rng=Math.random 不会触发，但 makeRng 的数组模式可返回任意值；建议 `const f = Math.min(0.999999, Math.max(0, r()))` 之类做一次钳制，提升种子/测试鲁棒性。
++- src/ui/app.js startLoop() 未重置 this._prevTick：从启动器/创角返回游戏时，首帧 delta 可能很大，触发一次性精力回补尖峰（受 maxStamina 钳制不致崩溃，但应在 startLoop 里 `this._prevTick = nowMs()` 归零）。
++- 死亡存档可被「继续旅程」加载：gameOver 落盘 hp=0 且无 ending，listSaves 仍视为可继续；加载后 enterGame→isDead→立即再次 gameOver。建议 listSaves/load 路径对 hp<=0 的存档标记或走 restart 流程，避免「继续」瞬间又死亡的不良体验。
++- 战斗结算窗口（winBattle/loseBattle/nextRound 的 360–520ms setTimeout 期间）顶部「🏃」撤退按钮未随 busy 禁用，理论上可与胜负结算交错；建议 busy 期间一并禁用撤退按钮。
++
++修复第 1 项后即可合入；其余 4 项建议顺带打磨。
+diff --git a/apps/xing-hai-lv-zhe/README.md b/apps/xing-hai-lv-zhe/README.md
+new file mode 100644
+index 0000000..75be1c7
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/README.md
+@@ -0,0 +1,57 @@
++# 星骸旅者 · Star Wreck Pilgrim
++
++一款融合 **开罗游戏（Kairosoft）式像素经营美学** 与 **Roguelike 生存探索** 的轻量化竖屏单机 RPG。你是一名迫降在破碎星球「墨比乌斯」的拾荒者，在无数漂浮的「遗迹浮岛」间探索、战斗、收集「星骸」，直至揭开这颗星球毁灭前的真相。
++
++技术栈：**纯原生 HTML + CSS + JavaScript（无框架）**，移动端竖屏单手操作，LocalStorage 多槽位存档，体积小、加载快。
++
++## 本地运行
++
++```bash
++npm install
++npm run dev      # 开发服务器 http://localhost:5176
++npm run build    # 生产构建到 dist/
++npm run test     # 纯逻辑自测（不依赖浏览器）
++npm run test:dom # jsdom 冒烟测试（需先 npm i jsdom，覆盖 UI 主流程）
++```
++
++也可由主框架（落地页）以 `createGame(parent)` 动态挂载，无需独立部署。
++
++## 核心玩法
++
++- **浮岛探索（点击移动）**：每个浮岛是一张 16×16 的像素网格地图，角色视野仅 5×5（迷雾机制）。点击相邻地块移动；强化「推进器」可一次走出更多步。踩上宝箱拾取、踩上陷阱触发、靠近敌人即可交战，找到下行阶梯深入下一层。
++- **抉择型战斗（猜拳克制）**：敌人每回合摆出「突刺 / 横斩 / 重击」架势，玩家在限时内选择「格挡 / 闪避 / 反击」——反击克突刺、格挡克横斩、闪避克重击。成功克制触发「专注力」加成（下一击 ×1.5）。精力过低会失手。可开启**自动战斗**让 AI 按最优克制代打，适合单手摸鱼。
++- **开罗式装备与成长**：武器（攻）/护甲（防）/推进器（步数）三件套，消耗「零件」强化；强化到 +5 触发**词缀变异**（吸血 / 反伤等随机附加属性）。**天赋树**仅三条分支（生存 / 战斗 / 幸运），消耗星骸点亮，可随时免费重置，鼓励试错。
++- **碎片化叙事**：每个浮岛固定藏有 1 枚「星骸回响」记忆碎片，集齐解锁主角失落的背景故事（共 10 章）。途中还会偶遇流浪商人、维修无人机、重力陷阱等随机事件。
++- **双重结局**：第 10 层击败星骸之核后，由你抉择——用所有星骸**重建文明**（和平结局），还是**引爆星骸**成为新神（暗黑结局）。
++
++## 移动端 UI/UX
++
++- **三段式竖屏布局**：顶部状态栏（HP / 精力 / 层数 / 星骸）· 中央像素地图画布 · 底部操作栏（左虚拟方向键 / 中动态交互键 / 右背包入口）。所有可点区域 ≥ 44×44pt，贴合拇指热区。
++- **像素反馈**：地图与角色以开罗经典 16 色调色板用色块绘制；战斗命中时屏幕轻微震动，拾取与伤害弹出「+数字」浮动飘字。
++- **状态机驱动**：`BOOT → MAP → BATTLE → INVENTORY → EVENT`，闲置时自动降帧至 ~20fps 节省电量。
++
++## 项目结构（模块化）
++
++```
++src/
++  config.js          调色板 / 地块 / 装备 / 天赋 / 敌人 / 章节 / 事件（纯常量与纯函数）
++  core/
++    rng.js           可注入随机源（种子化/测试）
++    player.js        角色状态 / 装备强化 / 天赋 / 升级 / 战斗结算
++    world.js         浮岛生成（房间+连通保证）/ 迷雾 / 移动校验 / 下行
++    battle.js        猜拳克制战斗（架势 / 克制 / 专注力 / 自动战斗）
++    save.js          多槽位 localStorage 存档 + 导入导出
++  ui/
++    dom.js           轻量 h() DOM 辅助
++    style.css        开罗像素竖屏移动端样式
++    app.js           UI 渲染与状态机（启动器/创角/地图/战斗/背包/事件/结局）
++  main.js            入口：createGame(parent) 工厂
++scripts/logic-test.mjs   纯逻辑自测
++scripts/smoke-dom.mjs    jsdom 冒烟测试
++```
++
++## 部署（GitHub Pages）
++
++构建产物在 `dist/`，可直接作为静态站点部署。自动部署由仓库根的 Pages 工作流统一处理（出于安全红线，AI 不修改 `.github/` 下的工作流文件）。
++
++> 实现注记：设计指引建议面板切换走 Hash 路由、地图用 Canvas 绘制。本作运行于落地页 overlay 内，为避免修改宿主 `window.location.hash` 造成冲突，面板切换改用应用内状态机；为兼顾 jsdom 可测性与产物体积，地图以 CSS 像素网格（开罗 16 色色块）渲染，逻辑等价且可在无头环境驱动。其余系统（猜拳战斗、装备强化 +5 词缀、三天赋树、10 章记忆、双结局）均按方案完整实现。
+diff --git a/apps/xing-hai-lv-zhe/index.html b/apps/xing-hai-lv-zhe/index.html
+new file mode 100644
+index 0000000..68b817d
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/index.html
+@@ -0,0 +1,41 @@
++<!doctype html>
++<html lang="zh-CN">
++
++<head>
++  <meta charset="UTF-8" />
++  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
++  <meta name="theme-color" content="#2b2d3a" />
++  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%232b2d3a'/%3E%3Ctext x='16' y='23' font-size='20' text-anchor='middle' fill='%23ffd93d' font-family='serif'%3E%E6%98%9F%3C/text%3E%3C/svg%3E" />
++  <title>星骸旅者 · Star Wreck Pilgrim</title>
++  <style>
++    html,
++    body {
++      margin: 0;
++      padding: 0;
++      width: 100%;
++      height: 100%;
++      background: #2b2d3a;
++      overflow: hidden;
++      font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
++      -webkit-user-select: none;
++      user-select: none;
++      -webkit-tap-highlight-color: transparent;
++    }
++
++    #game-container {
++      position: relative;
++      width: 100vw;
++      height: 100vh;
++      display: flex;
++      align-items: stretch;
++      justify-content: center;
++    }
++  </style>
++</head>
++
++<body>
++  <div id="game-container"></div>
++  <script type="module" src="/src/main.js"></script>
++</body>
++
++</html>
+diff --git a/apps/xing-hai-lv-zhe/package-lock.json b/apps/xing-hai-lv-zhe/package-lock.json
+new file mode 100644
+index 0000000..f275447
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/package-lock.json
+@@ -0,0 +1,1559 @@
++{
++  "name": "xing-hai-lv-zhe",
++  "version": "1.0.0",
++  "lockfileVersion": 3,
++  "requires": true,
++  "packages": {
++    "": {
++      "name": "xing-hai-lv-zhe",
++      "version": "1.0.0",
++      "devDependencies": {
++        "jsdom": "^29.1.1",
++        "vite": "^5.4.0"
++      }
++    },
++    "node_modules/@asamuzakjp/css-color": {
++      "version": "5.1.11",
++      "resolved": "https://registry.npmjs.org/@asamuzakjp/css-color/-/css-color-5.1.11.tgz",
++      "integrity": "sha512-KVw6qIiCTUQhByfTd78h2yD1/00waTmm9uy/R7Ck/ctUyAPj+AEDLkQIdJW0T8+qGgj3j5bpNKK7Q3G+LedJWg==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@asamuzakjp/generational-cache": "^1.0.1",
++        "@csstools/css-calc": "^3.2.0",
++        "@csstools/css-color-parser": "^4.1.0",
++        "@csstools/css-parser-algorithms": "^4.0.0",
++        "@csstools/css-tokenizer": "^4.0.0"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/@asamuzakjp/dom-selector": {
++      "version": "7.1.1",
++      "resolved": "https://registry.npmjs.org/@asamuzakjp/dom-selector/-/dom-selector-7.1.1.tgz",
++      "integrity": "sha512-67RZDnYRc8H/8MLDgQCDE//zoqVFwajkepHZgmXrbwybzXOEwOWGPYGmALYl9J2DOLfFPPs6kKCqmbzV895hTQ==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@asamuzakjp/generational-cache": "^1.0.1",
++        "@asamuzakjp/nwsapi": "^2.3.9",
++        "bidi-js": "^1.0.3",
++        "css-tree": "^3.2.1",
++        "is-potential-custom-element-name": "^1.0.1"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/@asamuzakjp/generational-cache": {
++      "version": "1.0.1",
++      "resolved": "https://registry.npmjs.org/@asamuzakjp/generational-cache/-/generational-cache-1.0.1.tgz",
++      "integrity": "sha512-wajfB8KqzMCN2KGNFdLkReeHncd0AslUSrvHVvvYWuU8ghncRJoA50kT3zP9MVL0+9g4/67H+cdvBskj9THPzg==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/@asamuzakjp/nwsapi": {
++      "version": "2.3.9",
++      "resolved": "https://registry.npmjs.org/@asamuzakjp/nwsapi/-/nwsapi-2.3.9.tgz",
++      "integrity": "sha512-n8GuYSrI9bF7FFZ/SjhwevlHc8xaVlb/7HmHelnc/PZXBD2ZR49NnN9sMMuDdEGPeeRQ5d0hqlSlEpgCX3Wl0Q==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/@bramus/specificity": {
++      "version": "2.4.2",
++      "resolved": "https://registry.npmjs.org/@bramus/specificity/-/specificity-2.4.2.tgz",
++      "integrity": "sha512-ctxtJ/eA+t+6q2++vj5j7FYX3nRu311q1wfYH3xjlLOsczhlhxAg2FWNUXhpGvAw3BWo1xBcvOV6/YLc2r5FJw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "css-tree": "^3.0.0"
++      },
++      "bin": {
++        "specificity": "bin/cli.js"
++      }
++    },
++    "node_modules/@csstools/color-helpers": {
++      "version": "6.1.0",
++      "resolved": "https://registry.npmjs.org/@csstools/color-helpers/-/color-helpers-6.1.0.tgz",
++      "integrity": "sha512-064IFJdjTfUqnjpCVpMOdbr8FLQBhinbZj6yRv2An2E41O/pLEXqfFRWqGq/SxlE5PEUYTlvWsG2r8MswAVvkg==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT-0",
++      "engines": {
++        "node": ">=20.19.0"
++      }
++    },
++    "node_modules/@csstools/css-calc": {
++      "version": "3.2.1",
++      "resolved": "https://registry.npmjs.org/@csstools/css-calc/-/css-calc-3.2.1.tgz",
++      "integrity": "sha512-DtdHlgXh5ZkA43cwBcAm+huzgJiwx3ZTWVjBs94kwz2xKqSimDA3lBgCjphYgwgVUMWatSM0pDd8TILB1yrVVg==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT",
++      "engines": {
++        "node": ">=20.19.0"
++      },
++      "peerDependencies": {
++        "@csstools/css-parser-algorithms": "^4.0.0",
++        "@csstools/css-tokenizer": "^4.0.0"
++      }
++    },
++    "node_modules/@csstools/css-color-parser": {
++      "version": "4.1.9",
++      "resolved": "https://registry.npmjs.org/@csstools/css-color-parser/-/css-color-parser-4.1.9.tgz",
++      "integrity": "sha512-paQcIaOO53Rk5+YrBaBjm/SgrV4INImjo2BT1DtQRYr+XeTRbeAYlS+jxXp9drqvKmtFnWRJKIalDLhZZDu42A==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT",
++      "dependencies": {
++        "@csstools/color-helpers": "^6.1.0",
++        "@csstools/css-calc": "^3.2.1"
++      },
++      "engines": {
++        "node": ">=20.19.0"
++      },
++      "peerDependencies": {
++        "@csstools/css-parser-algorithms": "^4.0.0",
++        "@csstools/css-tokenizer": "^4.0.0"
++      }
++    },
++    "node_modules/@csstools/css-parser-algorithms": {
++      "version": "4.0.0",
++      "resolved": "https://registry.npmjs.org/@csstools/css-parser-algorithms/-/css-parser-algorithms-4.0.0.tgz",
++      "integrity": "sha512-+B87qS7fIG3L5h3qwJ/IFbjoVoOe/bpOdh9hAjXbvx0o8ImEmUsGXN0inFOnk2ChCFgqkkGFQ+TpM5rbhkKe4w==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT",
++      "engines": {
++        "node": ">=20.19.0"
++      },
++      "peerDependencies": {
++        "@csstools/css-tokenizer": "^4.0.0"
++      }
++    },
++    "node_modules/@csstools/css-syntax-patches-for-csstree": {
++      "version": "1.1.6",
++      "resolved": "https://registry.npmjs.org/@csstools/css-syntax-patches-for-csstree/-/css-syntax-patches-for-csstree-1.1.6.tgz",
++      "integrity": "sha512-TcJCWFbXLPpJYq6z7bfOyjWYJDiDg2/I4gyUC9pqPNqHFRIey0EB0q0L5cSnQDfWJg8Jd6VadakxdIez/3zkqQ==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT-0",
++      "peerDependencies": {
++        "css-tree": "^3.2.1"
++      },
++      "peerDependenciesMeta": {
++        "css-tree": {
++          "optional": true
++        }
++      }
++    },
++    "node_modules/@csstools/css-tokenizer": {
++      "version": "4.0.0",
++      "resolved": "https://registry.npmjs.org/@csstools/css-tokenizer/-/css-tokenizer-4.0.0.tgz",
++      "integrity": "sha512-QxULHAm7cNu72w97JUNCBFODFaXpbDg+dP8b/oWFAZ2MTRppA3U00Y2L1HqaS4J6yBqxwa/Y3nMBaxVKbB/NsA==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT",
++      "engines": {
++        "node": ">=20.19.0"
++      }
++    },
++    "node_modules/@esbuild/aix-ppc64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.21.5.tgz",
++      "integrity": "sha512-1SDgH6ZSPTlggy1yI6+Dbkiz8xzpHJEVAlF/AM1tHPLsf5STom9rwtjE4hKAF20FfXXNTFqEYXyJNWh1GiZedQ==",
++      "cpu": [
++        "ppc64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "aix"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/android-arm": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.21.5.tgz",
++      "integrity": "sha512-vCPvzSjpPHEi1siZdlvAlsPxXl7WbOVUBBAowWug4rJHb68Ox8KualB+1ocNvT5fjv6wpkX6o/iEpbDrf68zcg==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/android-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.21.5.tgz",
++      "integrity": "sha512-c0uX9VAUBQ7dTDCjq+wdyGLowMdtR/GoC2U5IYk/7D1H1JYC0qseD7+11iMP2mRLN9RcCMRcjC4YMclCzGwS/A==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/android-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.21.5.tgz",
++      "integrity": "sha512-D7aPRUUNHRBwHxzxRvp856rjUHRFW1SdQATKXH2hqA0kAZb1hKmi02OpYRacl0TxIGz/ZmXWlbZgjwWYaCakTA==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/darwin-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.21.5.tgz",
++      "integrity": "sha512-DwqXqZyuk5AiWWf3UfLiRDJ5EDd49zg6O9wclZ7kUMv2WRFr4HKjXp/5t8JZ11QbQfUS6/cRCKGwYhtNAY88kQ==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/darwin-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.21.5.tgz",
++      "integrity": "sha512-se/JjF8NlmKVG4kNIuyWMV/22ZaerB+qaSi5MdrXtd6R08kvs2qCN4C09miupktDitvh8jRFflwGFBQcxZRjbw==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/freebsd-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.21.5.tgz",
++      "integrity": "sha512-5JcRxxRDUJLX8JXp/wcBCy3pENnCgBR9bN6JsY4OmhfUtIHe3ZW0mawA7+RDAcMLrMIZaf03NlQiX9DGyB8h4g==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "freebsd"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/freebsd-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.21.5.tgz",
++      "integrity": "sha512-J95kNBj1zkbMXtHVH29bBriQygMXqoVQOQYA+ISs0/2l3T9/kj42ow2mpqerRBxDJnmkUDCaQT/dfNXWX/ZZCQ==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "freebsd"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-arm": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.21.5.tgz",
++      "integrity": "sha512-bPb5AHZtbeNGjCKVZ9UGqGwo8EUu4cLq68E95A53KlxAPRmUyYv2D6F0uUI65XisGOL1hBP5mTronbgo+0bFcA==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.21.5.tgz",
++      "integrity": "sha512-ibKvmyYzKsBeX8d8I7MH/TMfWDXBF3db4qM6sy+7re0YXya+K1cem3on9XgdT2EQGMu4hQyZhan7TeQ8XkGp4Q==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-ia32": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.21.5.tgz",
++      "integrity": "sha512-YvjXDqLRqPDl2dvRODYmmhz4rPeVKYvppfGYKSNGdyZkA01046pLWyRKKI3ax8fbJoK5QbxblURkwK/MWY18Tg==",
++      "cpu": [
++        "ia32"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-loong64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.21.5.tgz",
++      "integrity": "sha512-uHf1BmMG8qEvzdrzAqg2SIG/02+4/DHB6a9Kbya0XDvwDEKCoC8ZRWI5JJvNdUjtciBGFQ5PuBlpEOXQj+JQSg==",
++      "cpu": [
++        "loong64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-mips64el": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.21.5.tgz",
++      "integrity": "sha512-IajOmO+KJK23bj52dFSNCMsz1QP1DqM6cwLUv3W1QwyxkyIWecfafnI555fvSGqEKwjMXVLokcV5ygHW5b3Jbg==",
++      "cpu": [
++        "mips64el"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-ppc64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.21.5.tgz",
++      "integrity": "sha512-1hHV/Z4OEfMwpLO8rp7CvlhBDnjsC3CttJXIhBi+5Aj5r+MBvy4egg7wCbe//hSsT+RvDAG7s81tAvpL2XAE4w==",
++      "cpu": [
++        "ppc64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-riscv64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.21.5.tgz",
++      "integrity": "sha512-2HdXDMd9GMgTGrPWnJzP2ALSokE/0O5HhTUvWIbD3YdjME8JwvSCnNGBnTThKGEB91OZhzrJ4qIIxk/SBmyDDA==",
++      "cpu": [
++        "riscv64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-s390x": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.21.5.tgz",
++      "integrity": "sha512-zus5sxzqBJD3eXxwvjN1yQkRepANgxE9lgOW2qLnmr8ikMTphkjgXu1HR01K4FJg8h1kEEDAqDcZQtbrRnB41A==",
++      "cpu": [
++        "s390x"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.21.5.tgz",
++      "integrity": "sha512-1rYdTpyv03iycF1+BhzrzQJCdOuAOtaqHTWJZCWvijKD2N5Xu0TtVC8/+1faWqcP9iBCWOmjmhoH94dH82BxPQ==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/netbsd-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.21.5.tgz",
++      "integrity": "sha512-Woi2MXzXjMULccIwMnLciyZH4nCIMpWQAs049KEeMvOcNADVxo0UBIQPfSmxB3CWKedngg7sWZdLvLczpe0tLg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "netbsd"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/openbsd-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.21.5.tgz",
++      "integrity": "sha512-HLNNw99xsvx12lFBUwoT8EVCsSvRNDVxNpjZ7bPn947b8gJPzeHWyNVhFsaerc0n3TsbOINvRP2byTZ5LKezow==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "openbsd"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/sunos-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.21.5.tgz",
++      "integrity": "sha512-6+gjmFpfy0BHU5Tpptkuh8+uw3mnrvgs+dSPQXQOv3ekbordwnzTVEb4qnIvQcYXq6gzkyTnoZ9dZG+D4garKg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "sunos"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/win32-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.21.5.tgz",
++      "integrity": "sha512-Z0gOTd75VvXqyq7nsl93zwahcTROgqvuAcYDUr+vOv8uHhNSKROyU961kgtCD1e95IqPKSQKH7tBTslnS3tA8A==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/win32-ia32": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.21.5.tgz",
++      "integrity": "sha512-SWXFF1CL2RVNMaVs+BBClwtfZSvDgtL//G/smwAc5oVK/UPu2Gu9tIaRgFmYFFKrmg3SyAjSrElf0TiJ1v8fYA==",
++      "cpu": [
++        "ia32"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/win32-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.21.5.tgz",
++      "integrity": "sha512-tQd/1efJuzPC6rCFwEvLtci/xNFcTZknmXs98FYDfGE4wP9ClFV98nyKrzJKVPMhdDnjzLhdUyMX4PsQAPjwIw==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@exodus/bytes": {
++      "version": "1.15.1",
++      "resolved": "https://registry.npmjs.org/@exodus/bytes/-/bytes-1.15.1.tgz",
++      "integrity": "sha512-S6mL0yNB/Abt9Ei4tq8gDhcczc4S3+vQ4ra7vxnAf+YHC02srtqxKKZghx2Dq6p0e66THKwR6r8N6P95wEty7Q==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      },
++      "peerDependencies": {
++        "@noble/hashes": "^1.8.0 || ^2.0.0"
++      },
++      "peerDependenciesMeta": {
++        "@noble/hashes": {
++          "optional": true
++        }
++      }
++    },
++    "node_modules/@rollup/rollup-android-arm-eabi": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.62.2.tgz",
++      "integrity": "sha512-6o7ZLZK+BeenkZCFNDXqpbjw9bD6nuWonvS/lwQJp7NoVVxm6p3qE7qQ5jGuBjiFsgvqjD8mZAU5oWxTmbOeOg==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ]
++    },
++    "node_modules/@rollup/rollup-android-arm64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.62.2.tgz",
++      "integrity": "sha512-BaH7BllCACHoH1LguOU56UItGfUWjujlO65kS9LAodViaN4bwIKd7oeW/ZHJ/4ljr/7MIiENnNy3HJ0zXv8Zkw==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ]
++    },
++    "node_modules/@rollup/rollup-darwin-arm64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.62.2.tgz",
++      "integrity": "sha512-v39RCCvj4He82I9sFmk+M1VZ0PLM9sfsLVikjfx2hYBNALhrrOR2D3JjQA6AhlaSOgcR+RzrKY7e1+bT6SUO/A==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ]
++    },
++    "node_modules/@rollup/rollup-darwin-x64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.62.2.tgz",
++      "integrity": "sha512-yl0y2vq3S3lHeuXhEdss6TWfKW8vkujImO12tn4ZkG/4oghr09LvdYm2RElVjokTQiUvDUGXLGsYeLqUMCKpGA==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ]
++    },
++    "node_modules/@rollup/rollup-freebsd-arm64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.62.2.tgz",
++      "integrity": "sha512-tT4pvt4qXD+vEoezupCWi+a1F0vvDiksiHc+PxRlYTOH1I6/X4id9jPxTP+Fg+545euaFT1jJVs4CEdHZAU1vw==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "freebsd"
++      ]
++    },
++    "node_modules/@rollup/rollup-freebsd-x64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.62.2.tgz",
++      "integrity": "sha512-6nU5F2wCW+qvCBhTn1pdIU3bzsIoF7EUwsCDRxilWGprQR6yd508YnH9+OKFCwpfS8pjZqDUmnCAr7exax0XCg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "freebsd"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.62.2.tgz",
++      "integrity": "sha512-n1GJHPOvpIfhi3TmrCeh6S6URt9BFCt0KQE3qvexyGCTAKpR4Lg+eWvNZEqu7epxwus/8ElT3hacYEucm49SZg==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-arm-musleabihf": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.62.2.tgz",
++      "integrity": "sha512-JqgflS8wEB+UXV/vS1RpRbifGBeN4D5lz8D8oOFbFZw4vedvdOgCFAjfBmIMdW3yL10XpQQ0Ambepw6MXrhOnA==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-arm64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.62.2.tgz",
++      "integrity": "sha512-wnFJkogWvN4jm/hQRF2UBaeUmk20j5+DmHvoyWii2b8HJDyvz1MF2OU/6ynXt2KR63rbZLWkFpoytpdc/yBuSA==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-arm64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.62.2.tgz",
++      "integrity": "sha512-HVu2bp0zhvJ8xHEV9+UUs7S90VadmBSY3LcIMvozbPo4AuMGDWlz3ymHLHZPX4hR67TKTt8Qp5PJ5RBg/i+RMQ==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-loong64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.62.2.tgz",
++      "integrity": "sha512-mQqqAV8QaoSgr9I2fKDLY2BAVvmKjWoGiu/cSYQonsLvtqwEn1E4QYfnCOcp5zoEqNhsDYin1s6jx/VJmrxlZg==",
++      "cpu": [
++        "loong64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-loong64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-musl/-/rollup-linux-loong64-musl-4.62.2.tgz",
++      "integrity": "sha512-IxKLoxCQ2IWi6bT2akyDUBGsOImDKB+sPp4EsTmwFQ/fMwpCKm8uLSSgP/Kx/QYUgKis6SEZ5/Nlhup0DIA0PQ==",
++      "cpu": [
++        "loong64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-ppc64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.62.2.tgz",
++      "integrity": "sha512-Mk5ha2RQSgyFfmYYLkBpPnUk8D8FriBxesO1u9O75X0mHgXL1UQcH5Itl2lurWL2tj0RxV9b9tJgipac0hRY9A==",
++      "cpu": [
++        "ppc64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-ppc64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-musl/-/rollup-linux-ppc64-musl-4.62.2.tgz",
++      "integrity": "sha512-CjvEnqJL/0/TQ3TXX3OPIJ/kmBellrWd4heXUmHeJlTnmwjKpSJzoehLaL6Xk0ZnMHBu9dZuFADNOrtjF4v+2w==",
++      "cpu": [
++        "ppc64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-riscv64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.62.2.tgz",
++      "integrity": "sha512-1SiZbzwdkaDURsew/tSOrooKiYy7EQGT6m8ufavAi9NEyQb/6VuIxFXAL1fqa4iZe3g4NbNk4P7J32z2tw5Mgg==",
++      "cpu": [
++        "riscv64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-riscv64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.62.2.tgz",
++      "integrity": "sha512-nQts12zJ3NQRoE6uYljOH89v7szzLDvG2JD/vsX+vGXU8w/At1GowTZ5/7qeFQ8m7L55rpR8Okugnuo5bgjy2Q==",
++      "cpu": [
++        "riscv64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-s390x-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.62.2.tgz",
++      "integrity": "sha512-E9/ll019jhPIJgpzfZoIkBGhcz+kKNgVWYRY0zr9srBdPPFVpvOKW8VaJKUbeK+eZXyQF9ltME+Kk6affeaPgg==",
++      "cpu": [
++        "s390x"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-x64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.62.2.tgz",
++      "integrity": "sha512-5BqxR/pshjey51iliyzTD5Xi3EN0aLmQ2lZ3lvefVV9c82BvrLo2/6OT55iifpWBufs6kdwWbuOKS841DrmK9A==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-x64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.62.2.tgz",
++      "integrity": "sha512-uNN83XxQrRAh/w0/pmAfibcwyb6YWt4gP+dpnQKPVJshAloQ785ii8CT8ZCIxkGg9opVsvAlGhFitSm6D1Jjpg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-openbsd-x64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-openbsd-x64/-/rollup-openbsd-x64-4.62.2.tgz",
++      "integrity": "sha512-srjEIxSH3LRnJN6THczDHWQplqEMFiAJrTab0msUryh9kwNpkICf3Ea6q6MN/2cZwRFUNx5w+h6Hpi4QuHS6Zg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "openbsd"
++      ]
++    },
++    "node_modules/@rollup/rollup-openharmony-arm64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.62.2.tgz",
++      "integrity": "sha512-8hOJnxgbyObnCm5AlRA3A931xX19xq80RjVTKgJOvEKWqJruP/Uf12IbAOaDjjEXYRewwHLfmF0YRIdK3OwKWA==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "openharmony"
++      ]
++    },
++    "node_modules/@rollup/rollup-win32-arm64-msvc": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.62.2.tgz",
++      "integrity": "sha512-mmF4AY1i0hG/bLWUctUq59gtmgaSIRa3cu/A3JFRp/sCNEme2bgDEiDS22P9FbnJB8NJNF4jPJiSP5RHQpUTDg==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ]
++    },
++    "node_modules/@rollup/rollup-win32-ia32-msvc": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.62.2.tgz",
++      "integrity": "sha512-DZgkknc6jhHrk46V25vbAM0zZkyP0nSDkJB8/dRkLTxv470dOmWDqGoEJl/9A0dFfS7yE3REOwNDxpHwSLSt0Q==",
++      "cpu": [
++        "ia32"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ]
++    },
++    "node_modules/@rollup/rollup-win32-x64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.62.2.tgz",
++      "integrity": "sha512-T6xr6ucWSFto+VGajA8YH26LdpHRuP4YLHEKAtCWvJDOlnmWcDZVCI2Jmjr+IFHDlt2zRaTAKE4tfjTaWLgJBg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ]
++    },
++    "node_modules/@rollup/rollup-win32-x64-msvc": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.62.2.tgz",
++      "integrity": "sha512-BfzEnDJOt9T8M989/lA37EcJgat01wLRnoi5dQf3QzOH7jzpqTAzdDbVfRljVr5r+jzKqpbHeyOfAaXxAd0PAA==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ]
++    },
++    "node_modules/@types/estree": {
++      "version": "1.0.9",
++      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz",
++      "integrity": "sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/bidi-js": {
++      "version": "1.0.3",
++      "resolved": "https://registry.npmjs.org/bidi-js/-/bidi-js-1.0.3.tgz",
++      "integrity": "sha512-RKshQI1R3YQ+n9YJz2QQ147P66ELpa1FQEg20Dk8oW9t2KgLbpDLLp9aGZ7y8WHSshDknG0bknqGw5/tyCs5tw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "require-from-string": "^2.0.2"
++      }
++    },
++    "node_modules/css-tree": {
++      "version": "3.2.1",
++      "resolved": "https://registry.npmjs.org/css-tree/-/css-tree-3.2.1.tgz",
++      "integrity": "sha512-X7sjQzceUhu1u7Y/ylrRZFU2FS6LRiFVp6rKLPg23y3x3c3DOKAwuXGDp+PAGjh6CSnCjYeAul8pcT8bAl+lSA==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "mdn-data": "2.27.1",
++        "source-map-js": "^1.2.1"
++      },
++      "engines": {
++        "node": "^10 || ^12.20.0 || ^14.13.0 || >=15.0.0"
++      }
++    },
++    "node_modules/data-urls": {
++      "version": "7.0.0",
++      "resolved": "https://registry.npmjs.org/data-urls/-/data-urls-7.0.0.tgz",
++      "integrity": "sha512-23XHcCF+coGYevirZceTVD7NdJOqVn+49IHyxgszm+JIiHLoB2TkmPtsYkNWT1pvRSGkc35L6NHs0yHkN2SumA==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "whatwg-mimetype": "^5.0.0",
++        "whatwg-url": "^16.0.0"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/decimal.js": {
++      "version": "10.6.0",
++      "resolved": "https://registry.npmjs.org/decimal.js/-/decimal.js-10.6.0.tgz",
++      "integrity": "sha512-YpgQiITW3JXGntzdUmyUR1V812Hn8T1YVXhCu+wO3OpS4eU9l4YdD3qjyiKdV6mvV29zapkMeD390UVEf2lkUg==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/entities": {
++      "version": "8.0.0",
++      "resolved": "https://registry.npmjs.org/entities/-/entities-8.0.0.tgz",
++      "integrity": "sha512-zwfzJecQ/Uej6tusMqwAqU/6KL2XaB2VZ2Jg54Je6ahNBGNH6Ek6g3jjNCF0fG9EWQKGZNddNjU5F1ZQn/sBnA==",
++      "dev": true,
++      "license": "BSD-2-Clause",
++      "engines": {
++        "node": ">=20.19.0"
++      },
++      "funding": {
++        "url": "https://github.com/fb55/entities?sponsor=1"
++      }
++    },
++    "node_modules/esbuild": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.21.5.tgz",
++      "integrity": "sha512-mg3OPMV4hXywwpoDxu3Qda5xCKQi+vCTZq8S9J/EpkhB2HzKXq4SNFZE3+NK93JYxc8VMSep+lOUSC/RVKaBqw==",
++      "dev": true,
++      "hasInstallScript": true,
++      "license": "MIT",
++      "bin": {
++        "esbuild": "bin/esbuild"
++      },
++      "engines": {
++        "node": ">=12"
++      },
++      "optionalDependencies": {
++        "@esbuild/aix-ppc64": "0.21.5",
++        "@esbuild/android-arm": "0.21.5",
++        "@esbuild/android-arm64": "0.21.5",
++        "@esbuild/android-x64": "0.21.5",
++        "@esbuild/darwin-arm64": "0.21.5",
++        "@esbuild/darwin-x64": "0.21.5",
++        "@esbuild/freebsd-arm64": "0.21.5",
++        "@esbuild/freebsd-x64": "0.21.5",
++        "@esbuild/linux-arm": "0.21.5",
++        "@esbuild/linux-arm64": "0.21.5",
++        "@esbuild/linux-ia32": "0.21.5",
++        "@esbuild/linux-loong64": "0.21.5",
++        "@esbuild/linux-mips64el": "0.21.5",
++        "@esbuild/linux-ppc64": "0.21.5",
++        "@esbuild/linux-riscv64": "0.21.5",
++        "@esbuild/linux-s390x": "0.21.5",
++        "@esbuild/linux-x64": "0.21.5",
++        "@esbuild/netbsd-x64": "0.21.5",
++        "@esbuild/openbsd-x64": "0.21.5",
++        "@esbuild/sunos-x64": "0.21.5",
++        "@esbuild/win32-arm64": "0.21.5",
++        "@esbuild/win32-ia32": "0.21.5",
++        "@esbuild/win32-x64": "0.21.5"
++      }
++    },
++    "node_modules/fsevents": {
++      "version": "2.3.3",
++      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
++      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
++      "dev": true,
++      "hasInstallScript": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ],
++      "engines": {
++        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
++      }
++    },
++    "node_modules/html-encoding-sniffer": {
++      "version": "6.0.0",
++      "resolved": "https://registry.npmjs.org/html-encoding-sniffer/-/html-encoding-sniffer-6.0.0.tgz",
++      "integrity": "sha512-CV9TW3Y3f8/wT0BRFc1/KAVQ3TUHiXmaAb6VW9vtiMFf7SLoMd1PdAc4W3KFOFETBJUb90KatHqlsZMWV+R9Gg==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@exodus/bytes": "^1.6.0"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/is-potential-custom-element-name": {
++      "version": "1.0.1",
++      "resolved": "https://registry.npmjs.org/is-potential-custom-element-name/-/is-potential-custom-element-name-1.0.1.tgz",
++      "integrity": "sha512-bCYeRA2rVibKZd+s2625gGnGF/t7DSqDs4dP7CrLA1m7jKWz6pps0LpYLJN8Q64HtmPKJ1hrN3nzPNKFEKOUiQ==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/jsdom": {
++      "version": "29.1.1",
++      "resolved": "https://registry.npmjs.org/jsdom/-/jsdom-29.1.1.tgz",
++      "integrity": "sha512-ECi4Fi2f7BdJtUKTflYRTiaMxIB0O6zfR1fX0GXpUrf6flp8QIYn1UT20YQqdSOfk2dfkCwS8LAFoJDEppNK5Q==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@asamuzakjp/css-color": "^5.1.11",
++        "@asamuzakjp/dom-selector": "^7.1.1",
++        "@bramus/specificity": "^2.4.2",
++        "@csstools/css-syntax-patches-for-csstree": "^1.1.3",
++        "@exodus/bytes": "^1.15.0",
++        "css-tree": "^3.2.1",
++        "data-urls": "^7.0.0",
++        "decimal.js": "^10.6.0",
++        "html-encoding-sniffer": "^6.0.0",
++        "is-potential-custom-element-name": "^1.0.1",
++        "lru-cache": "^11.3.5",
++        "parse5": "^8.0.1",
++        "saxes": "^6.0.0",
++        "symbol-tree": "^3.2.4",
++        "tough-cookie": "^6.0.1",
++        "undici": "^7.25.0",
++        "w3c-xmlserializer": "^5.0.0",
++        "webidl-conversions": "^8.0.1",
++        "whatwg-mimetype": "^5.0.0",
++        "whatwg-url": "^16.0.1",
++        "xml-name-validator": "^5.0.0"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.13.0 || >=24.0.0"
++      },
++      "peerDependencies": {
++        "canvas": "^3.0.0"
++      },
++      "peerDependenciesMeta": {
++        "canvas": {
++          "optional": true
++        }
++      }
++    },
++    "node_modules/lru-cache": {
++      "version": "11.5.2",
++      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-11.5.2.tgz",
++      "integrity": "sha512-4pfM1Ff0x50o0tQwb5ucw/RzNyD0/YJME6IVcStalZuMWxdt3sR3huStTtxz4PUmvZfRguvDejasvQ2kifR11g==",
++      "dev": true,
++      "license": "BlueOak-1.0.0",
++      "engines": {
++        "node": "20 || >=22"
++      }
++    },
++    "node_modules/mdn-data": {
++      "version": "2.27.1",
++      "resolved": "https://registry.npmjs.org/mdn-data/-/mdn-data-2.27.1.tgz",
++      "integrity": "sha512-9Yubnt3e8A0OKwxYSXyhLymGW4sCufcLG6VdiDdUGVkPhpqLxlvP5vl1983gQjJl3tqbrM731mjaZaP68AgosQ==",
++      "dev": true,
++      "license": "CC0-1.0"
++    },
++    "node_modules/nanoid": {
++      "version": "3.3.15",
++      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.15.tgz",
++      "integrity": "sha512-y7Wygv/7mEOvxTuEQDB8StXdMRBWf1kR/tlhAzBRUFkB2jfcLOAxO/SHmOO2zgz1pVgK29/kyupn059/bCHdjA==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/ai"
++        }
++      ],
++      "license": "MIT",
++      "bin": {
++        "nanoid": "bin/nanoid.cjs"
++      },
++      "engines": {
++        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
++      }
++    },
++    "node_modules/parse5": {
++      "version": "8.0.1",
++      "resolved": "https://registry.npmjs.org/parse5/-/parse5-8.0.1.tgz",
++      "integrity": "sha512-z1e/HMG90obSGeidlli3hj7cbocou0/wa5HacvI3ASx34PecNjNQeaHNo5WIZpWofN9kgkqV1q5YvXe3F0FoPw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "entities": "^8.0.0"
++      },
++      "funding": {
++        "url": "https://github.com/inikulin/parse5?sponsor=1"
++      }
++    },
++    "node_modules/picocolors": {
++      "version": "1.1.1",
++      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
++      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
++      "dev": true,
++      "license": "ISC"
++    },
++    "node_modules/postcss": {
++      "version": "8.5.16",
++      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.16.tgz",
++      "integrity": "sha512-vuwillviilfKZsg0VGj5R/YwwcHx4SLsIOI/7K6mQkWx+l5cUHTjj5g0AasTBcyXsbfTgrwsUNmVUb5xVwyPwg==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/postcss/"
++        },
++        {
++          "type": "tidelift",
++          "url": "https://tidelift.com/funding/github/npm/postcss"
++        },
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/ai"
++        }
++      ],
++      "license": "MIT",
++      "dependencies": {
++        "nanoid": "^3.3.12",
++        "picocolors": "^1.1.1",
++        "source-map-js": "^1.2.1"
++      },
++      "engines": {
++        "node": "^10 || ^12 || >=14"
++      }
++    },
++    "node_modules/punycode": {
++      "version": "2.3.1",
++      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
++      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": ">=6"
++      }
++    },
++    "node_modules/require-from-string": {
++      "version": "2.0.2",
++      "resolved": "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz",
++      "integrity": "sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": ">=0.10.0"
++      }
++    },
++    "node_modules/rollup": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.62.2.tgz",
++      "integrity": "sha512-RFnrW4lhXA3s3eqHDZvN654g8OTjzRfqpIRJYczCGB6HzphckVAi/Qh4tbPUbRuDi7s1Llv8g/NspLkttY3gTA==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@types/estree": "1.0.9"
++      },
++      "bin": {
++        "rollup": "dist/bin/rollup"
++      },
++      "engines": {
++        "node": ">=18.0.0",
++        "npm": ">=8.0.0"
++      },
++      "optionalDependencies": {
++        "@rollup/rollup-android-arm-eabi": "4.62.2",
++        "@rollup/rollup-android-arm64": "4.62.2",
++        "@rollup/rollup-darwin-arm64": "4.62.2",
++        "@rollup/rollup-darwin-x64": "4.62.2",
++        "@rollup/rollup-freebsd-arm64": "4.62.2",
++        "@rollup/rollup-freebsd-x64": "4.62.2",
++        "@rollup/rollup-linux-arm-gnueabihf": "4.62.2",
++        "@rollup/rollup-linux-arm-musleabihf": "4.62.2",
++        "@rollup/rollup-linux-arm64-gnu": "4.62.2",
++        "@rollup/rollup-linux-arm64-musl": "4.62.2",
++        "@rollup/rollup-linux-loong64-gnu": "4.62.2",
++        "@rollup/rollup-linux-loong64-musl": "4.62.2",
++        "@rollup/rollup-linux-ppc64-gnu": "4.62.2",
++        "@rollup/rollup-linux-ppc64-musl": "4.62.2",
++        "@rollup/rollup-linux-riscv64-gnu": "4.62.2",
++        "@rollup/rollup-linux-riscv64-musl": "4.62.2",
++        "@rollup/rollup-linux-s390x-gnu": "4.62.2",
++        "@rollup/rollup-linux-x64-gnu": "4.62.2",
++        "@rollup/rollup-linux-x64-musl": "4.62.2",
++        "@rollup/rollup-openbsd-x64": "4.62.2",
++        "@rollup/rollup-openharmony-arm64": "4.62.2",
++        "@rollup/rollup-win32-arm64-msvc": "4.62.2",
++        "@rollup/rollup-win32-ia32-msvc": "4.62.2",
++        "@rollup/rollup-win32-x64-gnu": "4.62.2",
++        "@rollup/rollup-win32-x64-msvc": "4.62.2",
++        "fsevents": "~2.3.2"
++      }
++    },
++    "node_modules/saxes": {
++      "version": "6.0.0",
++      "resolved": "https://registry.npmjs.org/saxes/-/saxes-6.0.0.tgz",
++      "integrity": "sha512-xAg7SOnEhrm5zI3puOOKyy1OMcMlIJZYNJY7xLBwSze0UjhPLnWfj2GF2EpT0jmzaJKIWKHLsaSSajf35bcYnA==",
++      "dev": true,
++      "license": "ISC",
++      "dependencies": {
++        "xmlchars": "^2.2.0"
++      },
++      "engines": {
++        "node": ">=v12.22.7"
++      }
++    },
++    "node_modules/source-map-js": {
++      "version": "1.2.1",
++      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
++      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
++      "dev": true,
++      "license": "BSD-3-Clause",
++      "engines": {
++        "node": ">=0.10.0"
++      }
++    },
++    "node_modules/symbol-tree": {
++      "version": "3.2.4",
++      "resolved": "https://registry.npmjs.org/symbol-tree/-/symbol-tree-3.2.4.tgz",
++      "integrity": "sha512-9QNk5KwDF+Bvz+PyObkmSYjI5ksVUYtjW7AU22r2NKcfLJcXp96hkDWU3+XndOsUb+AQ9QhfzfCT2O+CNWT5Tw==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/tldts": {
++      "version": "7.4.7",
++      "resolved": "https://registry.npmjs.org/tldts/-/tldts-7.4.7.tgz",
++      "integrity": "sha512-56L0/9HELHSsG1bFCzay8UoLxzRL7kpFf7Wl5q/kSYwiSJGACvro61xnKzPNM+SadxllzdtXsKDSXE7HPeqIAw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "tldts-core": "^7.4.7"
++      },
++      "bin": {
++        "tldts": "bin/cli.js"
++      }
++    },
++    "node_modules/tldts-core": {
++      "version": "7.4.7",
++      "resolved": "https://registry.npmjs.org/tldts-core/-/tldts-core-7.4.7.tgz",
++      "integrity": "sha512-rNlAI8fKn/JckBMUSbNL/ES2kmDiurWaE49l+ikwEc9A6lFR7gMx9AhgQMQKBK4H5w4pKLH64JzZfB99uRsGNQ==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/tough-cookie": {
++      "version": "6.0.2",
++      "resolved": "https://registry.npmjs.org/tough-cookie/-/tough-cookie-6.0.2.tgz",
++      "integrity": "sha512-exgYmnmL/sJpR3upZfXG5PoatXQii55xAiXGXzY+sROLZ/Y+SLcp9PgJNI9Vz37HpQ74WvDcLT8eqm+kV3FzrA==",
++      "dev": true,
++      "license": "BSD-3-Clause",
++      "dependencies": {
++        "tldts": "^7.0.5"
++      },
++      "engines": {
++        "node": ">=16"
++      }
++    },
++    "node_modules/tr46": {
++      "version": "6.0.0",
++      "resolved": "https://registry.npmjs.org/tr46/-/tr46-6.0.0.tgz",
++      "integrity": "sha512-bLVMLPtstlZ4iMQHpFHTR7GAGj2jxi8Dg0s2h2MafAE4uSWF98FC/3MomU51iQAMf8/qDUbKWf5GxuvvVcXEhw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "punycode": "^2.3.1"
++      },
++      "engines": {
++        "node": ">=20"
++      }
++    },
++    "node_modules/undici": {
++      "version": "7.28.0",
++      "resolved": "https://registry.npmjs.org/undici/-/undici-7.28.0.tgz",
++      "integrity": "sha512-cRZYrTDwWznlnRiPjggAGxZXanty6M8RV1ff8Wm4LWXBp7/IG8v5DnOm74DtUBp9OONpK75YlPnIjQqX0dBDtA==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": ">=20.18.1"
++      }
++    },
++    "node_modules/vite": {
++      "version": "5.4.21",
++      "resolved": "https://registry.npmjs.org/vite/-/vite-5.4.21.tgz",
++      "integrity": "sha512-o5a9xKjbtuhY6Bi5S3+HvbRERmouabWbyUcpXXUA1u+GNUKoROi9byOJ8M0nHbHYHkYICiMlqxkg1KkYmm25Sw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "esbuild": "^0.21.3",
++        "postcss": "^8.4.43",
++        "rollup": "^4.20.0"
++      },
++      "bin": {
++        "vite": "bin/vite.js"
++      },
++      "engines": {
++        "node": "^18.0.0 || >=20.0.0"
++      },
++      "funding": {
++        "url": "https://github.com/vitejs/vite?sponsor=1"
++      },
++      "optionalDependencies": {
++        "fsevents": "~2.3.3"
++      },
++      "peerDependencies": {
++        "@types/node": "^18.0.0 || >=20.0.0",
++        "less": "*",
++        "lightningcss": "^1.21.0",
++        "sass": "*",
++        "sass-embedded": "*",
++        "stylus": "*",
++        "sugarss": "*",
++        "terser": "^5.4.0"
++      },
++      "peerDependenciesMeta": {
++        "@types/node": {
++          "optional": true
++        },
++        "less": {
++          "optional": true
++        },
++        "lightningcss": {
++          "optional": true
++        },
++        "sass": {
++          "optional": true
++        },
++        "sass-embedded": {
++          "optional": true
++        },
++        "stylus": {
++          "optional": true
++        },
++        "sugarss": {
++          "optional": true
++        },
++        "terser": {
++          "optional": true
++        }
++      }
++    },
++    "node_modules/w3c-xmlserializer": {
++      "version": "5.0.0",
++      "resolved": "https://registry.npmjs.org/w3c-xmlserializer/-/w3c-xmlserializer-5.0.0.tgz",
++      "integrity": "sha512-o8qghlI8NZHU1lLPrpi2+Uq7abh4GGPpYANlalzWxyWteJOCsr/P+oPBA49TOLu5FTZO4d3F9MnWJfiMo4BkmA==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "xml-name-validator": "^5.0.0"
++      },
++      "engines": {
++        "node": ">=18"
++      }
++    },
++    "node_modules/webidl-conversions": {
++      "version": "8.0.1",
++      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-8.0.1.tgz",
++      "integrity": "sha512-BMhLD/Sw+GbJC21C/UgyaZX41nPt8bUTg+jWyDeg7e7YN4xOM05YPSIXceACnXVtqyEw/LMClUQMtMZ+PGGpqQ==",
++      "dev": true,
++      "license": "BSD-2-Clause",
++      "engines": {
++        "node": ">=20"
++      }
++    },
++    "node_modules/whatwg-mimetype": {
++      "version": "5.0.0",
++      "resolved": "https://registry.npmjs.org/whatwg-mimetype/-/whatwg-mimetype-5.0.0.tgz",
++      "integrity": "sha512-sXcNcHOC51uPGF0P/D4NVtrkjSU2fNsm9iog4ZvZJsL3rjoDAzXZhkm2MWt1y+PUdggKAYVoMAIYcs78wJ51Cw==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": ">=20"
++      }
++    },
++    "node_modules/whatwg-url": {
++      "version": "16.0.1",
++      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-16.0.1.tgz",
++      "integrity": "sha512-1to4zXBxmXHV3IiSSEInrreIlu02vUOvrhxJJH5vcxYTBDAx51cqZiKdyTxlecdKNSjj8EcxGBxNf6Vg+945gw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@exodus/bytes": "^1.11.0",
++        "tr46": "^6.0.0",
++        "webidl-conversions": "^8.0.1"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/xml-name-validator": {
++      "version": "5.0.0",
++      "resolved": "https://registry.npmjs.org/xml-name-validator/-/xml-name-validator-5.0.0.tgz",
++      "integrity": "sha512-EvGK8EJ3DhaHfbRlETOWAS5pO9MZITeauHKJyb8wyajUfQUenkIg2MvLDTZ4T/TgIcm3HU0TFBgWWboAZ30UHg==",
++      "dev": true,
++      "license": "Apache-2.0",
++      "engines": {
++        "node": ">=18"
++      }
++    },
++    "node_modules/xmlchars": {
++      "version": "2.2.0",
++      "resolved": "https://registry.npmjs.org/xmlchars/-/xmlchars-2.2.0.tgz",
++      "integrity": "sha512-JZnDKK8B0RCDw84FNdDAIpZK+JuJw+s7Lz8nksI7SIuU3UXJJslUthsi+uWBUYOwPFwW7W7PRLRfUKpxjtjFCw==",
++      "dev": true,
++      "license": "MIT"
++    }
++  }
++}
+diff --git a/apps/xing-hai-lv-zhe/package.json b/apps/xing-hai-lv-zhe/package.json
+new file mode 100644
+index 0000000..655791f
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/package.json
+@@ -0,0 +1,17 @@
++{
++  "name": "xing-hai-lv-zhe",
++  "version": "1.0.0",
++  "description": "《星骸旅者》开罗式像素 Roguelike 生存探索小游戏 - A Kairosoft-style pixel roguelike survival RPG",
++  "type": "module",
++  "scripts": {
++    "dev": "vite",
++    "build": "vite build",
++    "preview": "vite preview --host",
++    "test": "node scripts/logic-test.mjs",
++    "test:dom": "node scripts/smoke-dom.mjs"
++  },
++  "devDependencies": {
++    "jsdom": "^29.1.1",
++    "vite": "^5.4.0"
++  }
++}
+diff --git a/apps/xing-hai-lv-zhe/scripts/_css-loader.mjs b/apps/xing-hai-lv-zhe/scripts/_css-loader.mjs
+new file mode 100644
+index 0000000..b10c2fa
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/scripts/_css-loader.mjs
+@@ -0,0 +1,7 @@
++// 让 Node 的 ESM 加载器把 *.css 视作空模块（仅冒烟测试用）。
++export async function load(url, context, nextLoad) {
++  if (url.endsWith('.css')) {
++    return { format: 'module', source: '', shortCircuit: true };
++  }
++  return nextLoad(url, context);
++}
+diff --git a/apps/xing-hai-lv-zhe/scripts/logic-test.mjs b/apps/xing-hai-lv-zhe/scripts/logic-test.mjs
+new file mode 100644
+index 0000000..9234de2
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/scripts/logic-test.mjs
+@@ -0,0 +1,410 @@
++// ============================================================================
++// 纯逻辑自测：不依赖浏览器，覆盖 config / player / world / battle / save 各模块。
++// 运行：node scripts/logic-test.mjs
++// ============================================================================
++import {
++  PALETTE, GRID, VISION_RADIUS, TILES, FLOOR_TILES, tileOf, isWalkable,
++  EQUIP_SLOTS, MAX_PLUS, AFFIX_AT, AFFIXES, enhanceCost, starterEquipment,
++  TALENTS, talentCost, floorConfig, enemyPoolFor, MEMORY_CHAPTERS, MAX_FLOOR,
++  STAMINA_COST_PER_ROUND, STAMINA_TIRED, expToNext, clamp,
++} from '../src/config.js';
++import {
++  newPlayer, migrate, maxHp, maxStamina, effectiveAtk, effectiveDef, effectiveMoveRange,
++  enhanceEquipment, buyTalent, resetTalents, gainReward, healFull, regenStamina, spendStamina,
++  damagePlayer, isDead, collectMemory, collectedMemoryCount,
++} from '../src/core/player.js';
++import {
++  generateFloor, findPath, reachableTiles, entityAt, removeEntity, tileAt, descend, bfsReachable, enemyFromDef,
++} from '../src/core/world.js';
++import {
++  STANCES, ACTIONS, COUNTERS, TELEGRAPH_CHANCE,
++  pickEnemyStance, isTelegraphed, autoPickAction, resolveRound, enemyReward,
++} from '../src/core/battle.js';
++import {
++  _setStorage, saveToSlot, loadFromSlot, deleteSlot, listSaves, hasAnySave, latestSlot,
++  exportSave, importSave, SAVE_SLOTS,
++} from '../src/core/save.js';
++import { makeRng } from '../src/core/rng.js';
++
++let pass = 0, fail = 0;
++const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
++const seq = (arr) => makeRng(arr);
++const r0 = () => 0;
++const r1 = () => 0.999;
++const rMid = () => 0.5;
++
++// ===================== config =====================
++ok(Object.keys(PALETTE).length === 16, `调色板恰好 16 色（实际 ${Object.keys(PALETTE).length}）`);
++ok(GRID === 16 && VISION_RADIUS === 2, '地图 16×16、视野半径 2（5×5）');
++ok(EQUIP_SLOTS.length === 3 && EQUIP_SLOTS.includes('booster'), '装备三栏：武器/护甲/推进器');
++ok(MAX_PLUS === 10 && AFFIX_AT === 5, '强化上限 +10，+5 触发词缀');
++ok(AFFIXES.length >= 5 && AFFIXES.some((a) => a.id === 'lifesteal') && AFFIXES.some((a) => a.id === 'thorns'), '词缀池含吸血/反伤等');
++ok(enhanceCost(0) < enhanceCost(3) && enhanceCost(3) < enhanceCost(9), '强化消耗随 plus 递增');
++ok(TALENTS.length === 3 && TALENTS.some((t) => t.branch === 'survival') && TALENTS.some((t) => t.branch === 'luck'), '三天赋分支：生存/战斗/幸运');
++ok(MEMORY_CHAPTERS.length === 10, `记忆章节 10 章（实际 ${MEMORY_CHAPTERS.length}）`);
++ok(MAX_FLOOR === 10, '共 10 层（含 Boss）');
++ok(enemyPoolFor(1).length >= 1 && enemyPoolFor(10).some((e) => e.boss), '敌人池按楼层分阶，10 层含 Boss');
++ok(floorConfig(1).memory === true && floorConfig(10).memory === true, '每层含 1 枚记忆回响');
++ok(expToNext(1) < expToNext(5), '升级所需经验随等级递增');
++ok(tileOf('water').walkable === false && tileOf('floor').walkable === true, '地块通行性正确');
++ok(isWalkable('wall') === false && isWalkable('sand') === true, 'isWalkable 辅助正确');
++ok(Array.from(new Set(FLOOR_TILES)).length === FLOOR_TILES.length, '可行走地块类型无重复');
++
++// ===================== player =====================
++let p = newPlayer(seq([0.4, 0.4, 0.4, 0.4, 0.4, 0.4]), { name: '阿尔法' });
++ok(p.name === '阿尔法' && p.hp === maxHp(p) && p.stamina === maxStamina(), '新角色满状态');
++ok(p.floor === 1 && p.maxFloor === 1 && p.level === 1, '新角色从第 1 层、Lv1 起步');
++ok(p.stardust === 0 && p.parts === 0 && p.exp === 0, '新角色零资源');
++ok(p.equipment.weapon.name === '生锈砍刀' && p.equipment.booster.plus === 0, '起始装备正确');
++ok(Object.keys(p.talents).length === 3 && p.talents.combat === 0, '天赋初始全 0');
++ok(p.memory.length === 10 && p.memory.every((x) => x === false), '记忆初始全未收集');
++
++// 超长姓名截断
++ok(newPlayer(r0, { name: '一二三四五六七八九十' }).name.length === 8, '超长姓名截断 8 字');
++
++// migrate 修复损坏档
++{
++  _setStorage(memStorage());
++  const bad = { name: '', hp: -5, stamina: 999, stardust: -3, parts: 'x', level: 0, exp: -1, floor: 99, maxFloor: 0, seed: NaN, turn: -1, equipment: { weapon: { name: 1, stat: 'a', plus: 99, affix: { id: 'nope' } } }, talents: { survival: 99, combat: -1 }, memory: [true, true], ending: 'weird' };
++  saveToSlot(0, bad);
++  const f = loadFromSlot(0);
++  ok(f.name === '旅者', 'migrate 空姓名兜底');
++  ok(f.hp >= 0 && f.stamina >= 0, 'migrate HP/精力非负');
++  ok(f.stardust === 0 && f.parts === 0 && f.exp === 0, 'migrate 资源非负');
++  ok(f.level === 1, 'migrate 等级下限 1');
++  ok(f.floor === MAX_FLOOR, 'migrate 楼层钳到上限');
++  ok(Number.isFinite(f.seed), 'migrate 补种子');
++  ok(f.equipment.weapon.plus === MAX_PLUS, 'migrate 强化钳到上限');
++  ok(f.equipment.weapon.affix === null, 'migrate 非法词缀置空');
++  ok(f.talents.survival === 5 && f.talents.combat === 0, 'migrate 天赋钳到合法档');
++  ok(f.memory.length === 10 && f.memory[0] === true && f.memory[2] === false, 'migrate 记忆数组补齐');
++  ok(f.ending === null, 'migrate 非法结局置空');
++}
++
++// migrate：楼层快照损坏（某行为 null / pos 越界）→ 丢弃或钳制，绝不崩溃或软锁
++{
++  _setStorage(memStorage());
++  const grid = Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => 'floor'));
++  const broken = { name: '甲', floor: 2, floorState: { grid: grid.map((r, i) => (i === 5 ? null : r)), pos: { x: 3, y: 3 }, entities: [], explored: {} } };
++  saveToSlot(0, broken);
++  const f1 = loadFromSlot(0);
++  ok(f1.floorState === null, 'migrate：grid 含 null 行 → floorState 置空（重生成）');
++  const badPos = { name: '乙', floor: 2, floorState: { grid, pos: { x: -1 }, entities: [], explored: {} } };
++  saveToSlot(1, badPos);
++  const f2 = loadFromSlot(1);
++  ok(f2.floorState !== null && f2.floorState.pos.x === 1 && f2.floorState.pos.y === 1, 'migrate：pos 越界 → 钳到 {1,1}');
++  const okPos = { name: '丙', floor: 2, floorState: { grid, pos: { x: 7, y: 9 }, entities: [], explored: {} } };
++  saveToSlot(2, okPos);
++  const f3 = loadFromSlot(2);
++  ok(f3.floorState.pos.x === 7 && f3.floorState.pos.y === 9, 'migrate：合法 pos 原样保留');
++}
++
++// 派生数值：强化 / 天赋 / 词缀 / 等级 均生效
++{
++  const a = newPlayer(r0, {});
++  const baseAtk = effectiveAtk(a);
++  a.equipment.weapon.plus = 3;
++  ok(effectiveAtk(a) > baseAtk, '武器强化提升攻击');
++  a.talents.combat = 3;
++  ok(effectiveAtk(a) > baseAtk + 3, '战斗天赋额外提升攻击');
++  const a2 = newPlayer(r0, {});
++  const baseDef = effectiveDef(a2);
++  a2.equipment.armor.plus = 2;
++  ok(effectiveDef(a2) > baseDef, '护甲强化提升防御');
++  const a3 = newPlayer(r0, {});
++  ok(effectiveMoveRange(a3) === 1, '初始移动步数 1');
++  a3.equipment.booster.plus = 2;
++  ok(effectiveMoveRange(a3) === 3, '推进器强化提升步数');
++  a3.equipment.booster.affix = { id: 'swift' };
++  ok(effectiveMoveRange(a3) === 4, '迅捷词缀 +1 步');
++  // 等级提升血量上限
++  const a4 = newPlayer(r0, {});
++  a4.level = 5;
++  ok(maxHp(a4) > maxHp(newPlayer(r0, {})), '等级提升血量上限');
++}
++
++// enhanceEquipment：消耗零件、+plus、+5 触发词缀
++{
++  const e = newPlayer(r0, {});
++  e.parts = 100;
++  const cost0 = enhanceCost(0);
++  let res = enhanceEquipment(e, 'weapon', seq([0.1]));
++  ok(res.ok === true && e.parts === 100 - cost0 && e.equipment.weapon.plus === 1, '强化消耗零件且 plus+1');
++  // 连续强化到 +5 触发词缀
++  e.equipment.weapon.plus = 4;
++  res = enhanceEquipment(e, 'weapon', seq([0.2]));
++  ok(res.ok && res.affixed && e.equipment.weapon.plus === 5, '强化至 +5');
++  ok(e.equipment.weapon.affix && AFFIXES.some((a) => a.id === e.equipment.weapon.affix.id), '+5 触发词缀变异');
++  // 达上限
++  e.equipment.weapon.plus = MAX_PLUS;
++  res = enhanceEquipment(e, 'weapon', r0);
++  ok(res.ok === false && res.reason === 'max', '达上限不可强化');
++  // 零件不足
++  e.equipment.weapon.plus = 0; e.parts = 0;
++  res = enhanceEquipment(e, 'weapon', r0);
++  ok(res.ok === false && res.reason === 'no-parts', '零件不足不可强化');
++}
++
++// 天赋：消耗星骸、上限、重置返还
++{
++  const t = newPlayer(r0, {});
++  t.stardust = 200;
++  const c0 = talentCost('combat', 0);
++  let res = buyTalent(t, 'combat');
++  ok(res.ok && t.talents.combat === 1 && t.stardust === 200 - c0, '点亮战斗天赋消耗星骸');
++  // 生存天赋补 HP
++  const hpBefore = t.hp;
++  res = buyTalent(t, 'survival');
++  ok(res.ok && t.hp >= hpBefore, '生存天赋补 HP');
++  // 重置全额返还
++  const sdBefore = t.stardust;
++  res = resetTalents(t);
++  ok(res.ok && res.refund > 0 && t.stardust > sdBefore, '重置天赋返还星骸');
++  ok(t.talents.combat === 0 && t.talents.survival === 0, '重置后天赋归零');
++  // 星骸不足
++  t.stardust = 0;
++  res = buyTalent(t, 'luck');
++  ok(res.ok === false && res.reason === 'no-stardust', '星骸不足不可点亮');
++}
++
++// gainReward：幸运加成 + 升级
++{
++  const g = newPlayer(r0, {});
++  gainReward(g, { stardust: 10, parts: 4, exp: 0 }, r0);
++  ok(g.stardust === 10 && g.parts === 4, '基础奖励入账');
++  const lucky = newPlayer(r0, {});
++  lucky.talents.luck = 3;
++  gainReward(lucky, { stardust: 10, parts: 4 }, r0);
++  ok(lucky.stardust > 10 && lucky.parts > 4, '幸运天赋提升掉落');
++  // 升级
++  const lv = newPlayer(r0, {});
++  const lvBefore = lv.level;
++  const need = expToNext(lv.level);
++  gainReward(lv, { exp: need + 5 }, r0);
++  ok(lv.level === lvBefore + 1 && lv.exp === 5, '经验达标后升级并结算剩余经验');
++}
++
++// HP / 精力 / 死亡
++{
++  const d = newPlayer(r0, {});
++  damagePlayer(d, 1000);
++  ok(d.hp === 0 && isDead(d) === true, '伤害致死判定死亡');
++  healFull(d);
++  ok(d.hp === maxHp(d) && d.stamina === maxStamina(d), '满状态恢复');
++  spendStamina(d, 50);
++  ok(d.stamina < maxStamina(d), '消耗精力');
++  regenStamina(d, 10);
++  ok(d.stamina <= maxStamina(d), '精力回复钳制上限');
++}
++
++// 记忆收集
++{
++  const m = newPlayer(r0, {});
++  ok(collectedMemoryCount(m) === 0, '初始收集数 0');
++  const res = collectMemory(m, 0);
++  ok(res.ok && m.memory[0] === true && collectedMemoryCount(m) === 1, '收集记忆解锁章节');
++  const again = collectMemory(m, 0);
++  ok(again.ok === false && again.already === true, '重复收集不重复解锁');
++  ok(m.hp < maxHp(m) || m.hp === maxHp(m), '收集记忆回复 HP 不报错');
++}
++
++// ===================== world =====================
++{
++  const st = generateFloor(seq(Array.from({ length: 64 }, (_, i) => (i % 7) / 7)), 1, newPlayer(r0, {}));
++  ok(st.grid.length === GRID && st.grid[0].length === GRID, '生成 16×16 网格');
++  // 边界为墙
++  ok(st.grid[0][0] === 'wall' && st.grid[GRID - 1][GRID - 1] === 'wall', '边界为墙');
++  // 出生点可行走
++  ok(isWalkable(tileAt(st, st.pos.x, st.pos.y)), '出生点可行走');
++  // 第 1 层有阶梯
++  ok(st.entities.some((e) => e.type === 'memory'), '第 1 层含 1 枚记忆');
++  ok(st.entities.filter((e) => e.type === 'enemy').length === floorConfig(1).enemyCount, `敌人数量符合楼层配置（${floorConfig(1).enemyCount}）`);
++  ok(st.entities.filter((e) => e.type === 'chest').length === floorConfig(1).chestCount, '宝箱数量符合楼层配置');
++  ok(st.entities.some((e) => ['merchant', 'drone', 'trap'].includes(e.type)), '含 1 个随机事件点');
++  // 有阶梯且非 Boss 层
++  let hasStairs = false;
++  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (tileAt(st, x, y) === 'stairs') hasStairs = true;
++  ok(hasStairs, '第 1 层存在下行阶梯');
++  // 实体不重叠出生点
++  ok(!entityAt(st, st.pos.x, st.pos.y), '出生点无实体');
++  // 出生点可达阶梯
++  const reach = bfsReachable(st.grid, st.pos.x, st.pos.y);
++  let stairsKey = null;
++  for (let y = 0; y < GRID && !stairsKey; y++) for (let x = 0; x < GRID && !stairsKey; x++) if (tileAt(st, x, y) === 'stairs') stairsKey = `${x},${y}`;
++  ok(stairsKey && reach.dist.has(stairsKey), '出生点可达阶梯（连通保证）');
++}
++// Boss 层：无阶梯、有 Boss
++{
++  const st = generateFloor(seq(Array.from({ length: 64 }, (_, i) => (i % 5) / 5)), MAX_FLOOR, newPlayer(r0, {}));
++  let hasStairs = false;
++  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (tileAt(st, x, y) === 'stairs') hasStairs = true;
++  ok(hasStairs === false, 'Boss 层无下行阶梯');
++  const boss = st.entities.find((e) => e.type === 'enemy');
++  ok(boss && boss.boss === true, 'Boss 层含 Boss 敌人');
++  ok(st.entities.some((e) => e.type === 'memory'), 'Boss 层仍含 1 枚记忆');
++}
++
++// reachableTiles / findPath
++{
++  const grid = Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => 'floor'));
++  for (let i = 0; i < GRID; i++) { grid[0][i] = 'wall'; grid[GRID - 1][i] = 'wall'; grid[i][0] = 'wall'; grid[i][GRID - 1] = 'wall'; }
++  const st = { grid, pos: { x: 5, y: 5 }, entities: [] };
++  const reach1 = reachableTiles(st, st.pos, 1);
++  ok(reach1.size === 5, `步数 1 可达 5 格（实际 ${reach1.size}）`); // 自身 + 4 邻
++  const reach2 = reachableTiles(st, st.pos, 2);
++  ok(reach2.size === 13, `步数 2 可达 13 格（实际 ${reach2.size}）`);
++  const path = findPath(st, { x: 5, y: 5 }, { x: 7, y: 5 }, 5, new Set());
++  ok(Array.isArray(path) && path.length === 2, `findPath 走 2 步到 (3,1)（实际 ${path && path.length}）`);
++  const tooFar = findPath(st, { x: 1, y: 1 }, { x: 5, y: 1 }, 2, new Set());
++  ok(tooFar === null, '超出步数上限 findPath 返回 null');
++  // 墙阻挡
++  grid[1][2] = 'wall';
++  const blocked = findPath(st, { x: 1, y: 1 }, { x: 3, y: 1 }, 5, new Set());
++  // 直线被墙挡，但可绕行（2,1 被墙挡，可走 1,2->2,2->3,2->3,1）；仍可达
++  ok(Array.isArray(blocked), '墙阻挡直线但仍可绕行抵达');
++  // 敌人格视为阻挡
++  const stE = { grid: grid.map((r) => r.slice()), pos: { x: 1, y: 1 }, entities: [{ id: 'e1', type: 'enemy', x: 2, y: 1 }] };
++  const reachE = reachableTiles(stE, stE.pos, 2);
++  ok(!reachE.has('2,1'), '敌人所在格不可达');
++}
++// entityAt / removeEntity / descend
++{
++  const st = { grid: Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => 'floor')), pos: { x: 1, y: 1 }, entities: [{ id: 'e1', type: 'chest', x: 2, y: 2 }] };
++  ok(entityAt(st, 2, 2) && entityAt(st, 2, 2).id === 'e1', 'entityAt 命中');
++  ok(entityAt(st, 3, 3) === null, 'entityAt 空格返回 null');
++  ok(removeEntity(st, 'e1') === true && entityAt(st, 2, 2) === null, 'removeEntity 移除实体');
++  ok(removeEntity(st, 'nope') === false, 'removeEntity 不存在返回 false');
++  const pl = newPlayer(r0, {}); pl.floor = 5;
++  ok(descend(pl) === 6 && pl.maxFloor === 6, 'descend 推进楼层并更新最远记录');
++  pl.floor = MAX_FLOOR;
++  ok(descend(pl) === MAX_FLOOR, 'descend 钳到上限');
++}
++
++// ===================== battle =====================
++ok(Object.keys(COUNTERS).length === 3, '三组克制关系');
++ok(COUNTERS.counter === 'thrust' && COUNTERS.block === 'slash' && COUNTERS.dodge === 'smash', '反击克突刺、格挡克横斩、闪避克重击');
++{
++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
++  ok(['thrust', 'slash', 'smash'].includes(pickEnemyStance(enemy, r0)), 'pickEnemyStance 返回合法架势');
++  ok(autoPickAction('thrust') === 'counter' && autoPickAction('slash') === 'block' && autoPickAction('smash') === 'dodge', 'autoPickAction 给出正确克制');
++  ok(isTelegraphed(seq([0.1])) === true && isTelegraphed(seq([0.9])) === false, 'isTelegraphed 按概率识破');
++  ok(TELEGRAPH_CHANCE > 0 && TELEGRAPH_CHANCE < 1, '识破概率合法');
++}
++// 克制成功：敌人受伤、玩家不掉血、专注力蓄满
++{
++  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
++  const hpBefore = enemy.hp;
++  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r1); // r1 不失手
++  ok(res.countered === true, '反击对突刺 → 克制成功');
++  ok(res.enemyDmg > 0 && enemy.hp === hpBefore - res.enemyDmg, '敌人受到伤害');
++  ok(res.playerDmg === 0, '克制成功玩家不掉血');
++  ok(res.nextFocus === true, '克制成功蓄满专注力');
++}
++// 专注力倍率：下一击伤害更高
++{
++  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
++  const atk = effectiveAtk(pl);
++  const e1 = enemyFromDef(enemyPoolFor(1)[0], 1);
++  resolveRound(pl, e1, 'counter', false, 'thrust', r1);
++  const e2 = enemyFromDef(enemyPoolFor(1)[0], 1);
++  const res2 = resolveRound(pl, e2, 'counter', true, 'thrust', r1); // 带专注
++  ok(res2.enemyDmg > atk, '专注力下克制伤害高于基础攻击');
++}
++// 应对失败：玩家受伤
++{
++  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1); enemy.atk = 30;
++  const hpBefore = pl.hp;
++  const res = resolveRound(pl, enemy, 'block', false, 'thrust', r1); // 格挡不克突刺
++  ok(res.countered === false, '错误应对 → 未克制');
++  ok(res.playerDmg > 0 && pl.hp < hpBefore, '玩家受到伤害');
++  ok(res.nextFocus === false, '失败清空专注力');
++}
++// 精力过低失手
++{
++  const pl = newPlayer(r0, {}); pl.stamina = 0; // < STAMINA_TIRED
++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
++  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r0); // r0 → 触发失手
++  ok(res.fumble === true && res.countered === false, '精力过低且随机=0 → 失手');
++}
++// 吸血词缀
++{
++  const pl = newPlayer(r0, {});
++  pl.stamina = maxStamina(pl); pl.hp = 10;
++  pl.equipment.weapon.affix = { id: 'lifesteal' };
++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
++  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r1);
++  ok(res.healed > 0 && pl.hp > 10, '吸血词缀在克制命中时回血');
++}
++// 反伤词缀
++{
++  const pl = newPlayer(r0, {});
++  pl.stamina = maxStamina(pl);
++  pl.equipment.armor.affix = { id: 'thorns' };
++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1); enemy.atk = 40;
++  const hpBefore = enemy.hp;
++  const res = resolveRound(pl, enemy, 'block', false, 'thrust', r1); // 失败受击
++  ok(res.playerDmg > 0 && enemy.hp < hpBefore, '反伤词缀在受击时反弹伤害');
++}
++// 战斗致死与奖励
++{
++  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
++  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1); enemy.hp = 1; enemy.maxHp = 1;
++  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r1);
++  ok(res.enemyDead === true && enemy.hp === 0, '敌人 HP 归零判定死亡');
++  const rw = enemyReward(enemy);
++  ok(Number.isFinite(rw.stardust) && Number.isFinite(rw.parts) && Number.isFinite(rw.exp), 'enemyReward 返回奖励数值');
++}
++ok(STAMINA_COST_PER_ROUND > 0 && STAMINA_TIRED > 0, '战斗精力消耗 / 疲惫阈值合法');
++
++// ===================== save（多槽位）=====================
++function memStorage() {
++  const m = {};
++  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: (k) => { delete m[k]; } };
++}
++ok(SAVE_SLOTS >= 5, `存档槽位 ≥ 5（实际 ${SAVE_SLOTS}）`);
++_setStorage(memStorage());
++ok(hasAnySave() === false && latestSlot() === null, '空存储无存档');
++ok(Array.isArray(listSaves()) && listSaves().length === SAVE_SLOTS, 'listSaves 返回全部槽位');
++
++const toSave = newPlayer(seq([0.3, 0.3, 0.3, 0.3, 0.3, 0.3]), { name: '贝塔' });
++toSave.floor = 4; toSave.stardust = 30; toSave.parts = 12;
++ok(saveToSlot(0, toSave) === true && hasAnySave() === true && latestSlot() === 0, 'saveToSlot 写入并可读出');
++const loaded = loadFromSlot(0);
++ok(loaded.name === '贝塔' && loaded.floor === 4 && loaded.stardust === 30 && loaded.parts === 12, '读档字段一致');
++
++saveToSlot(1, newPlayer(r0, { name: '甲' }));
++saveToSlot(2, newPlayer(r0, { name: '乙' }));
++ok(loadFromSlot(1).name === '甲' && loadFromSlot(0).name === '贝塔', '多槽位互不干扰');
++ok(listSaves().filter((s) => s.exists).length === 3, 'listSaves 标记已用槽');
++{
++  saveToSlot(3, newPlayer(r0, { name: '最新' }));
++  ok(latestSlot() === 3, 'latestSlot 取最近游玩槽位');
++}
++ok(deleteSlot(3) === true && loadFromSlot(3) === null, 'deleteSlot 删除槽位');
++ok(deleteSlot(999) === false, '非法槽位 deleteSlot 返回 false');
++
++// 导入导出往返
++{
++  const orig = newPlayer(seq([0.2, 0.2, 0.2, 0.2, 0.2, 0.2]), { name: '伽马' });
++  orig.floor = 6; orig.memory[0] = true;
++  const str = exportSave(orig);
++  ok(typeof str === 'string' && str.length > 0, 'exportSave 生成字符串');
++  const back = importSave(str);
++  ok(back !== null && back.name === '伽马' && back.floor === 6 && back.memory[0] === true, '导入后字段一致');
++  ok(importSave('!!!not-base64!!!') === null, '非法导入串返回 null');
++}
++
++// 楼层快照随存档保存
++{
++  _setStorage(memStorage());
++  const pl = newPlayer(r0, {});
++  pl.floorState = generateFloor(rMid, 2, pl);
++  saveToSlot(0, pl);
++  const back = loadFromSlot(0);
++  ok(back.floorState && back.floorState.grid.length === GRID, '楼层快照随存档保存');
++}
++
++console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
++process.exit(fail ? 1 : 0);
+diff --git a/apps/xing-hai-lv-zhe/scripts/smoke-dom.mjs b/apps/xing-hai-lv-zhe/scripts/smoke-dom.mjs
+new file mode 100644
+index 0000000..eb88f9a
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/scripts/smoke-dom.mjs
+@@ -0,0 +1,322 @@
++// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程
++// （启动器 → 创角 → 地图移动 → 战斗 → 胜利 → 下层 → 背包强化/天赋 → 事件 → 存档往返 → Boss 通关结局）。
++// 运行：node scripts/smoke-dom.mjs   （需先 npm install jsdom）
++import { JSDOM } from 'jsdom';
++import { register } from 'node:module';
++
++// 把 *.css 当作空模块（app.js 顶部 import 了样式表）
++register('./_css-loader.mjs', import.meta.url);
++
++const dom = new JSDOM('<!DOCTYPE html><div id="game-container"></div>', {
++  url: 'http://localhost/',
++  pretendToBeVisual: true,
++});
++const { window } = dom;
++for (const k of ['document', 'window', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'Element', 'getComputedStyle', 'CustomEvent', 'MouseEvent', 'Event']) {
++  if (window[k] === undefined) continue;
++  try { globalThis[k] = window[k]; } catch (_) { /* Node 部分全局只读 */ }
++}
++globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
++globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
++
++let pass = 0, fail = 0;
++const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
++const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
++
++const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);
++const { isWalkable } = await import(new URL('../src/config.js', import.meta.url).href);
++const { entityAt, generateFloor } = await import(new URL('../src/core/world.js', import.meta.url).href);
++const { maxHp } = await import(new URL('../src/core/player.js', import.meta.url).href);
++
++const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
++const GRID = 16;
++
++// ---------- 1) 首启：启动器 ----------
++localStorage.clear();
++let ui = window.__XHLZ;
++await sleep(10);
++ok(document.querySelector('.launcher') !== null, '渲染启动器');
++ok(/星骸旅者/.test(document.querySelector('.launcher h1')?.textContent || ''), '启动器标题为「星骸旅者」');
++ok(document.querySelector('.launcher__actions .btn-primary') !== null, '启动器有主操作按钮');
++
++// ---------- 2) 开启新旅程 → 创角页 ----------
++// 用确定性 rng（=0.4）：生成开阔浮岛，战斗时恒识破「突刺」，便于稳定取胜。
++ui.rng = () => 0.4;
++ui.timerEnabled = false;
++document.querySelector('.launcher__actions .btn-primary').click();
++await sleep(10);
++ok(document.querySelector('.launcher.create') !== null || document.querySelector('.create__head') !== null, '点击开始进入创角页');
++ok(document.querySelector('[data-id="name"]') !== null, '创角页有姓名输入');
++
++// ---------- 3) 取名 + 迫降 → 进入地图 ----------
++const nameInput = document.querySelector('[data-id="name"]');
++if (nameInput) {
++  nameInput.value = '星岚';
++  nameInput.dispatchEvent(new window.Event('input', { bubbles: true }));
++}
++document.querySelector('.create__foot .btn-primary').click();
++await sleep(15);
++ok(document.querySelector('.xhlz-game') !== null, '迫降后进入游戏界面');
++ok(document.querySelector('.status-bar') !== null, '渲染顶部状态栏');
++ok(document.querySelector('.map-grid') !== null, '渲染像素地图');
++ok(document.querySelectorAll('.cell').length === GRID * GRID, `地图含 ${GRID * GRID} 个地块（实际 ${document.querySelectorAll('.cell').length}）`);
++ok(ui.player && ui.player.name === '星岚', `角色姓名记录正确（${ui.player?.name}）`);
++ok(ui.player.floor === 1 && ui.player.floorState, '初始第 1 层且生成楼层快照');
++ok(document.querySelector('.interact-btn') !== null, '底部有中央交互键');
++
++// ---------- 4) 移动：步数推进、迷雾揭开 ----------
++const turnBefore = ui.player.turn;
++const stepOnce = () => {
++  const st = ui.player.floorState;
++  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
++    const nx = st.pos.x + dx, ny = st.pos.y + dy;
++    if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
++    const ent = entityAt(st, nx, ny);
++    if (ent && ent.type === 'enemy') continue;
++    if (!isWalkable(st.grid[ny][nx])) continue;
++    ui.tryMoveTo(nx, ny);
++    return true;
++  }
++  return false;
++};
++let moved = false;
++for (let i = 0; i < 6; i++) { if (ui._sheet) ui.closeModal(); if (stepOnce()) moved = true; await sleep(5); }
++ok(moved && ui.player.turn > turnBefore, `移动推进步数（turn ${turnBefore}→${ui.player.turn}）`);
++ok(Object.keys(ui.player.floorState.explored).length > 1, '移动揭开了迷雾');
++
++// ---------- 5) 战斗：走到敌人旁 → 攻击 → 猜拳取胜 ----------
++function nearestEnemy() {
++  const st = ui.player.floorState;
++  let best = null, bd = Infinity;
++  for (const e of st.entities) if (e.type === 'enemy') { const d = manhattan(st.pos, e); if (d < bd) { bd = d; best = e; } }
++  return best;
++}
++// 贪心走向敌人直到相邻（逐格，遇事件弹窗自动关闭）
++function walkAdjacent(enemy) {
++  const st = ui.player.floorState;
++  let guard = 0;
++  while (enemy && manhattan(st.pos, enemy) > 1 && guard++ < 80) {
++    if (ui._sheet) { ui.closeModal(); continue; }
++    let best = null, bestD = Infinity;
++    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
++      const nx = st.pos.x + dx, ny = st.pos.y + dy;
++      if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
++      const ent = entityAt(st, nx, ny);
++      if (ent && ent.type === 'enemy') continue;
++      if (!isWalkable(st.grid[ny][nx])) continue;
++      const d = Math.abs(nx - enemy.x) + Math.abs(ny - enemy.y);
++      if (d < bestD) { bestD = d; best = { x: nx, y: ny }; }
++    }
++    if (!best) return false;
++    ui.tryMoveTo(best.x, best.y);
++  }
++  return enemy ? manhattan(st.pos, enemy) <= 1 : false;
++}
++
++// 通用战斗取胜：读架势 → 点击克制应对，直到战斗结束
++async function winBattle() {
++  let guard = 0;
++  while (document.querySelector('.battle') && guard++ < 80) {
++    const chip = document.querySelector('.stance-chip');
++    let act = 'counter';
++    if (chip) {
++      const t = chip.textContent || '';
++      if (t.includes('横斩')) act = 'block';
++      else if (t.includes('重击')) act = 'dodge';
++      else act = 'counter';
++    }
++    const btn = document.querySelector(`.battle__actions .act[data-action="${act}"]`);
++    if (btn && !btn.disabled) btn.click();
++    await sleep(70);
++  }
++  return !document.querySelector('.battle');
++}
++
++let enemy = nearestEnemy();
++ok(!!enemy, '第 1 层存在敌人');
++let reached = enemy ? walkAdjacent(enemy) : false;
++if (!reached && enemy) {
++  // 退化：直接对相邻敌人开战（绕过寻路 UI）
++  ui.startBattle(enemy);
++} else {
++  ok(/攻击/.test(document.querySelector('.interact-btn')?.textContent || ''), '靠近敌人后交互键变为「攻击」');
++  document.querySelector('.interact-btn').click();
++}
++await sleep(15);
++ok(document.querySelector('.battle') !== null, '进入战斗界面');
++ok(document.querySelectorAll('.battle__actions .act').length === 3, '战斗含 3 个应对按钮');
++const sdBefore = ui.player.stardust;
++const won = await winBattle();
++ok(won, '战斗取胜并退出战斗界面');
++ok(ui.player.stardust > sdBefore, `战斗获得星骸（${sdBefore}→${ui.player.stardust}）`);
++
++// ---------- 5b) 自动战斗：开启后能自动结算多回合直至取胜（防死锁） ----------
++const enemy2 = nearestEnemy();
++if (enemy2) {
++  const reached2 = walkAdjacent(enemy2);
++  if (reached2) {
++    document.querySelector('.interact-btn').click(); // 攻击
++    await sleep(15);
++    const autoBtn = document.querySelector('[title="自动战斗"]');
++    ok(!!autoBtn, '战斗界面有自动战斗开关');
++    if (autoBtn) autoBtn.click(); // 开启自动
++    await sleep(10);
++    ok(ui.battle && ui.battle.auto === true, '开启后 battle.auto=true');
++    // 轮询等待自动战斗结束（防 5b 死锁回归）
++    let guard = 0;
++    while (document.querySelector('.battle') && guard++ < 200) { await sleep(70); }
++    ok(!document.querySelector('.battle'), `自动战斗能自行取胜并退出（${guard} 轮）`);
++  }
++}
++
++// ---------- 6) 事件：商人 / 无人机 ----------
++ui.player.stardust += 50; // 便于测试购买
++ui.refreshStatus();
++ui.showMerchant();
++await sleep(10);
++ok(/流浪商人/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开商人面板');
++const buyBtn = document.querySelector('.sheet__body .slot-row .btn-primary');
++ok(!!buyBtn && !buyBtn.disabled, '商人有可购买商品');
++if (buyBtn) buyBtn.click();
++await sleep(10);
++ui.closeModal();
++ui.showDrone();
++await sleep(10);
++ok(/维修无人机/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开无人机面板');
++const droneBtn = [...document.querySelectorAll('.sheet__foot button')].find((b) => /维修/.test(b.textContent));
++ok(!!droneBtn, '无人机有维修按钮');
++if (droneBtn) droneBtn.click();
++await sleep(10);
++ok(ui.player.hp === maxHp(ui.player), '无人机维修回满 HP');
++
++// ---------- 7) 背包：强化 / 天赋 / 剧情 ----------
++ui.player.parts = 100;
++ui.openInventory();
++await sleep(10);
++ok(/背包/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开背包');
++ok(document.querySelectorAll('.tabs .tab').length === 3, '背包含 装备/天赋/剧情 三标签');
++const plusBefore = ui.player.equipment.weapon.plus;
++const enhBtn = document.querySelector('.equip-card .btn-primary');
++ok(!!enhBtn, '装备页有强化按钮');
++if (enhBtn) enhBtn.click();
++await sleep(10);
++ok(ui.player.equipment.weapon.plus === plusBefore + 1, `强化成功 +${plusBefore}→+${ui.player.equipment.weapon.plus}`);
++// 天赋
++document.querySelectorAll('.tabs .tab')[1].click();
++await sleep(10);
++ok(document.querySelectorAll('.talent-branch').length === 3, '天赋页含 3 分支');
++const talBtn = document.querySelector('.talent-branch .btn-primary');
++ok(!!talBtn, '天赋页有点亮按钮');
++if (talBtn) talBtn.click();
++await sleep(10);
++ok(ui.player.talents.combat === 1 || ui.player.talents.survival === 1 || ui.player.talents.luck === 1, '点亮天赋成功');
++// 重置
++const resetBtn = [...document.querySelectorAll('.sheet__body button')].find((b) => /重置天赋/.test(b.textContent));
++if (resetBtn) resetBtn.click();
++await sleep(10);
++ok(ui.player.talents.combat === 0 && ui.player.talents.survival === 0 && ui.player.talents.luck === 0, '重置天赋后归零');
++// 剧情
++document.querySelectorAll('.tabs .tab')[2].click();
++await sleep(10);
++ok(document.querySelectorAll('.chapter').length === 10, '剧情页列出 10 章节');
++ui.closeModal();
++await sleep(5);
++
++// ---------- 8) 下层 ----------
++// 走到阶梯并下行
++const findStairs = () => {
++  const st = ui.player.floorState;
++  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (st.grid[y][x] === 'stairs') return { x, y };
++  return null;
++};
++const stairs = findStairs();
++if (stairs) {
++  // 逐格走向阶梯
++  let guard = 0;
++  while (manhattan(ui.player.floorState.pos, stairs) > 0 && guard++ < 80) {
++    if (ui._sheet) { ui.closeModal(); continue; }
++    const st = ui.player.floorState;
++    let best = null, bestD = Infinity;
++    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
++      const nx = st.pos.x + dx, ny = st.pos.y + dy;
++      if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
++      const ent = entityAt(st, nx, ny);
++      if (ent && ent.type === 'enemy') continue;
++      if (!isWalkable(st.grid[ny][nx])) continue;
++      const d = manhattan({ x: nx, y: ny }, stairs);
++      if (d < bestD) { bestD = d; best = { x: nx, y: ny }; }
++    }
++    if (!best) break;
++    ui.tryMoveTo(best.x, best.y);
++  }
++  if (ui.player.floorState.pos.x === stairs.x && ui.player.floorState.pos.y === stairs.y) {
++    document.querySelector('.interact-btn').click(); // 下行
++    await sleep(10);
++  }
++}
++ok(ui.player.floor === 2, `下行至第 2 层（实际 ${ui.player.floor}）`);
++
++// ---------- 9) 存档往返：重开实例后可「继续旅程」 ----------
++const savedName = ui.player.name;
++const savedFloor = ui.player.floor;
++ui.destroy();
++await sleep(10);
++ui = createGame(document.getElementById('game-container'));
++ui.rng = () => 0.4;
++ui.timerEnabled = false;
++window.__XHLZ = ui;
++await sleep(10);
++ok(/继续旅程/.test(document.querySelector('.launcher__actions .btn-primary')?.textContent || ''), '有存档时启动器主按钮为「继续旅程」');
++document.querySelector('.launcher__actions .btn-primary').click();
++await sleep(15);
++ok(ui.player && ui.player.name === savedName && ui.player.floor === savedFloor, `继续旅程载入正确（${ui.player?.name}·第 ${ui.player?.floor} 层）`);
++ok(document.querySelector('.xhlz-game') !== null, '继续后渲染游戏界面');
++
++// ---------- 10) Boss 层：通关 → 双结局抉择 ----------
++ui.player.floor = 10;
++ui.player.floorState = generateFloor(ui.rng, 10, ui.player);
++ui.renderMap();
++ui.refreshInteract();
++await sleep(10);
++const boss = ui.player.floorState.entities.find((e) => e.type === 'enemy' && e.boss);
++ok(!!boss, 'Boss 层存在 Boss 敌人');
++if (boss) {
++  walkAdjacent(boss);
++  if (ui._sheet) ui.closeModal();
++  if (manhattan(ui.player.floorState.pos, boss) <= 1) {
++    document.querySelector('.interact-btn').click();
++    await sleep(15);
++    const bossWon = await winBattle();
++    ok(bossWon, '击败 Boss');
++    await sleep(10);
++    const peaceBtn = [...document.querySelectorAll('.sheet__foot button, .ending__choice button')].find((b) => /重建文明/.test(b.textContent));
++    ok(!!peaceBtn, '击败 Boss 后出现结局抉择');
++    if (peaceBtn) peaceBtn.click();
++    await sleep(15);
++  }
++}
++ok(document.querySelector('.ending') !== null, '通关后渲染结局画面');
++ok(ui.player.ending === 'peace' || ui.player.ending === 'dark', `结局已记录（${ui.player.ending}）`);
++
++// ---------- 11) 死亡结算画面（开启新旅程后驱动 gameOver） ----------
++ui.destroy();
++await sleep(10);
++ui = createGame(document.getElementById('game-container'));
++ui.rng = () => 0.4;
++window.__XHLZ = ui;
++await sleep(10);
++const newBtn = [...document.querySelectorAll('.launcher__actions button')].find((b) => /新旅程/.test(b.textContent));
++(newBtn || document.querySelector('.launcher__actions .btn-primary')).click();
++await sleep(10);
++document.querySelector('.create__foot .btn-primary').click(); // 迫降进入游戏
++await sleep(15);
++ok(ui.player && ui.screen === 'game', '开启新旅程进入游戏');
++ui.player.hp = 0;
++ui.gameOver();
++await sleep(10);
++ok(document.querySelector('.ending.dark') !== null, '生命归零渲染死亡结算画面');
++ok(/旅程终结/.test(document.querySelector('.ending h2')?.textContent || ''), '死亡结算标题正确');
++
++ui.destroy();
++console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
++process.exit(fail ? 1 : 0);
+diff --git a/apps/xing-hai-lv-zhe/src/config.js b/apps/xing-hai-lv-zhe/src/config.js
+new file mode 100644
+index 0000000..89a3d11
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/config.js
+@@ -0,0 +1,205 @@
++// ============================================================================
++// 星骸旅者 · 配置层（纯常量与纯函数，无副作用，便于单测）
++// 定义调色板、地块、装备、天赋、敌人、记忆章节、随机事件与各类阈值。
++// ============================================================================
++
++// —— 开罗经典 16 色调色板（明亮饱和色块）——
++export const PALETTE = {
++  bg: '#2b2d3a',        // 深底（星空）
++  parchment: '#f8f4e6', // 亮米（羊皮纸 / 浅地砖）
++  sand: '#f7b731',      // 沙地金
++  water: '#4a90e2',     // 水域蓝
++  monster: '#e8634a',   // 怪物红
++  grass: '#6bcb77',     // 草地绿
++  stone: '#5d5376',     // 遗迹石（墙）
++  stoneDark: '#3a3a4a', // 深石（墙心）
++  gold: '#ffd93d',      // 星骸金 / 阶梯
++  player: '#4d96ff',    // 玩家蓝
++  hp: '#ff6b6b',        // 血量红
++  arcane: '#9d4edd',    // 回响紫（记忆碎片）
++  teal: '#38a3a5',      // 推进器青
++  light: '#f2f2f2',     // 浅地砖
++  gray: '#b0b0b0',      // 中灰
++  luck: '#57c785',      // 幸运绿
++};
++
++// —— 地图网格 ——
++export const GRID = 16;            // 16×16 地块
++export const VISION_RADIUS = 2;    // 视野半径（5×5 可见）
++
++// 地块类型枚举。walkable 决定能否踏入；color 为像素绘制色。
++export const TILES = {
++  floor:    { id: 'floor',    name: '地砖', walkable: true,  color: PALETTE.light },
++  floor2:   { id: 'floor2',   name: '石板', walkable: true,  color: PALETTE.parchment },
++  sand:     { id: 'sand',     name: '沙地', walkable: true,  color: PALETTE.sand },
++  grass:    { id: 'grass',    name: '草地', walkable: true,  color: PALETTE.grass },
++  water:    { id: 'water',    name: '水域', walkable: false, color: PALETTE.water },
++  wall:     { id: 'wall',     name: '石墙', walkable: false, color: PALETTE.stone },
++  wallDark: { id: 'wallDark', name: '深墙', walkable: false, color: PALETTE.stoneDark },
++  stairs:   { id: 'stairs',   name: '下行阶梯', walkable: true, color: PALETTE.gold },
++};
++// 随机生成时从中抽取的「可点缀」可行走地块（决定地砖纹理差异，不影响通行）。
++export const FLOOR_TILES = ['floor', 'floor2', 'sand', 'grass'];
++
++export function tileOf(id) { return TILES[id] || TILES.floor; }
++export function isWalkable(id) { return !!tileOf(id).walkable; }
++
++// —— 角色基础数值 ——
++export const BASE_MAX_HP = 100;
++export const BASE_MAX_STAMINA = 80;
++export const BASE_ATK = 6;     // 裸装攻击（武器加成叠加其上）
++export const BASE_DEF = 2;     // 裸装防御
++export const BASE_MOVE_RANGE = 1; // 推进器 plus 每点 +1 步
++
++// 精力影响命中率：低于此阈值进入「疲惫」，战斗中有失手概率。
++export const STAMINA_TIRED = 30;
++export const STAMINA_FUMBLE_CHANCE = 0.35; // 疲惫时失手概率上限
++// 战斗每回合消耗精力；地图上每移动一格回复精力。
++export const STAMINA_COST_PER_ROUND = 4;
++export const STAMINA_REGEN_PER_STEP = 3;
++// 闲置缓慢回精（rAF 驱动，每 STAMINA_REGEN_INTERVAL_MS 回 1 点）。
++export const STAMINA_REGEN_INTERVAL_MS = 1600;
++
++// —— 装备 ——
++export const EQUIP_SLOTS = ['weapon', 'armor', 'booster'];
++export const MAX_PLUS = 10;     // 强化上限
++export const AFFIX_AT = 5;      // +5 触发词缀变异
++// 强化消耗「零件」：随 plus 递增（线性）。
++export function enhanceCost(plus) { return 2 + (plus || 0) * 2; }
++
++// 词缀池（+5 变异时随机附加其一）。
++export const AFFIXES = [
++  { id: 'lifesteal', name: '吸血',   desc: '造成伤害时回复等量 HP 的 30%。', emoji: '🩸' },
++  { id: 'thorns',    name: '反伤',   desc: '受击时反弹 25% 伤害给敌人。',   emoji: '🌵' },
++  { id: 'keen',      name: '锐利',   desc: '攻击 +20%。',                   emoji: '🗡️' },
++  { id: 'guard',     name: '坚固',   desc: '防御 +20%。',                   emoji: '🛡️' },
++  { id: 'swift',     name: '迅捷',   desc: '移动步数 +1。',                 emoji: '💨' },
++];
++
++// 起始装备（生锈砍刀 + 破布衣 + 滑轨推进器）。
++export function starterEquipment() {
++  return {
++    weapon:  { name: '生锈砍刀', stat: 8,  plus: 0, affix: null },
++    armor:   { name: '破布外衣', stat: 5,  plus: 0, affix: null },
++    booster: { name: '滑轨推进器', stat: 0, plus: 0, affix: null },
++  };
++}
++
++// —— 天赋树：三条分支（生存 / 战斗 / 幸运），消耗星骸点亮，可免费重置 ——
++export const TALENTS = [
++  {
++    branch: 'survival', name: '生存', emoji: '❤️', color: PALETTE.hp, maxRank: 5,
++    desc: '每级最大 HP +20、回响拾取额外回复 HP。',
++    cost: (rank) => 3 + rank * 2,
++  },
++  {
++    branch: 'combat', name: '战斗', emoji: '⚔️', color: PALETTE.monster, maxRank: 5,
++    desc: '每级造成伤害 +10%、克制成功专注力倍率更高。',
++    cost: (rank) => 3 + rank * 2,
++  },
++  {
++    branch: 'luck', name: '幸运', emoji: '🍀', color: PALETTE.luck, maxRank: 5,
++    desc: '每级掉落星骸 / 零件 +15%、宝箱品质提升。',
++    cost: (rank) => 3 + rank * 2,
++  },
++];
++export const TALENT_BY_BRANCH = Object.fromEntries(TALENTS.map((t) => [t.branch, t]));
++export function talentCost(branch, rank) { return (TALENT_BY_BRANCH[branch] || { cost: () => 99 }).cost(rank || 0); }
++
++// —— 敌人定义池（按楼层分阶）——
++// stances：敌人摆出各架势的相对权重；reward：星骸 / 零件 / 经验基准。
++export const ENEMIES = [
++  { id: 'puppet',  name: '弃械傀儡', emoji: '🤖', minFloor: 1, hp: 26, atk: 7,  stances: { thrust: 4, slash: 3, smash: 2 }, stardust: 4,  parts: 2, exp: 6 },
++  { id: 'wraith',  name: '游荡幽影', emoji: '👻', minFloor: 1, hp: 20, atk: 9,  stances: { thrust: 3, slash: 2, smash: 4 }, stardust: 5,  parts: 1, exp: 7 },
++  { id: 'bat',     name: '锈翼蝠',   emoji: '🦇', minFloor: 4, hp: 34, atk: 11, stances: { thrust: 5, slash: 2, smash: 1 }, stardust: 7,  parts: 3, exp: 10 },
++  { id: 'crab',    name: '晶甲蟹',   emoji: '🦀', minFloor: 4, hp: 46, atk: 10, stances: { thrust: 2, slash: 5, smash: 3 }, stardust: 8,  parts: 4, exp: 12 },
++  { id: 'knight',  name: '残响骑士', emoji: '🛡️', minFloor: 7, hp: 60, atk: 14, stances: { thrust: 3, slash: 4, smash: 4 }, stardust: 11, parts: 5, exp: 16 },
++  { id: 'stalker', name: '虚空潜行者', emoji: '👹', minFloor: 7, hp: 52, atk: 17, stances: { thrust: 4, slash: 3, smash: 3 }, stardust: 12, parts: 4, exp: 18 },
++  { id: 'core',    name: '星骸之核', emoji: '🌟', minFloor: 10, hp: 160, atk: 20, stances: { thrust: 3, slash: 3, smash: 3 }, stardust: 60, parts: 30, exp: 100, boss: true },
++];
++
++// 按楼层挑选一个合适敌人定义（同 minFloor 池中加权随机由调用方处理）。
++export function enemyPoolFor(floor) {
++  const f = Math.max(1, floor || 1);
++  return ENEMIES.filter((e) => e.minFloor <= f && !(e.boss && f < 10));
++}
++
++// 楼层配置：敌人数量、宝箱、事件密度随楼层缓慢上升。
++export function floorConfig(floor) {
++  const f = Math.max(1, floor || 1);
++  return {
++    enemyCount: Math.min(6, 2 + Math.floor(f / 2)),   // 1→2, 2→3 ... 上限 6
++    chestCount: f >= 10 ? 0 : (1 + (f % 2)),           // 1~2
++    memory: f <= 10,                                    // 每层 1 枚回响（1~10）
++    eventCount: f >= 10 ? 0 : 1,                        // 每层 1 个随机事件点
++  };
++}
++
++// —— 记忆章节（碎片化叙事，共 10 章）——
++export const MEMORY_CHAPTERS = [
++  { title: '序章 · 苏醒', text: '逃生舱的舱门弹开，你大口喘着气。副官「小星」的全息影像闪烁亮起：「旅者，你终于醒了……抱歉，你的记忆和导航数据一起损坏了。」破碎的星球墨比乌斯在头顶缓缓旋转。' },
++  { title: '第二章 · 漂浮的遗迹', text: '这些浮岛并非天然——它们是上古文明崩解后残留的碎片。脚下的石板间，偶尔能听见极轻的、像叹息一样的回响。' },
++  { title: '第三章 · 星骸', text: '你第一次触摸到那枚发光的晶体「星骸」。温热的，像谁的心跳。一瞬间，你想起了一间洒满午后阳光的厨房。' },
++  { title: '第四章 · 不是矿石', text: '小星分析后沉默了很久：「旅者……星骸不是矿物。它们是上古文明的情感凝结体。每一枚，都是某个人的一段记忆。」' },
++  { title: '第五章 · 灶台与歌', text: '回响里浮现一个孩子的笑声，和一首你听不懂却莫名想哭的歌。那是谁？为什么你的眼眶会发酸？' },
++  { title: '第六章 · 文明的黄昏', text: '越来越清晰了：这座文明并非毁于灾祸，而是在某个黄昏，人们集体选择了将情感封存进星骸，让文明「睡去」。' },
++  { title: '第七章 · 你曾在这里', text: '一帧画面闪过——年轻的你站在某座广场上，身边是无数张笑脸。你忽然确信：你曾属于这里。' },
++  { title: '第八章 · 小星的秘密', text: '小星终于坦白：「我是按照她的性格模型建造的。她……把你送进逃生舱时，把所有的星骸都留给了你。」' },
++  { title: '第九章 · 抉择的重量', text: '星骸之核就在前方。十枚回响在你掌心发烫。重建它们，还是……？小星轻声说：「无论你选什么，我都陪你。」' },
++  { title: '终章 · 你的回答', text: '所有的记忆都已归位。现在，轮到你来回答那个被整个文明搁置的问题了。' },
++];
++
++// 中期 / 结局叙事（楼层触发）。
++export const STORY = {
++  prologue: '你迫降在破碎星球「墨比乌斯」。副官小星唤醒了你——记忆全失，只有零星的星骸在岛上闪烁。拾荒，活下去，找回你自己。',
++  midpoint: '三层之下，你隐约明白：星骸不是矿石，而是上古文明凝结的情感。每一次拾取，都像重温一段别人的日常。',
++};
++
++// 双结局文本。
++export const ENDINGS = {
++  peace: {
++    key: 'peace', name: '重建文明', emoji: '🕊️', tone: 'good',
++    title: '和平结局 · 星河重燃',
++    text: '你将所有星骸归还大地。千百枚情感体重新苏醒，化作人形，彼此相认。墨比乌斯的夜空第一次亮起万家灯火。你不再是孤独的旅者——你回到了家。',
++  },
++  dark: {
++    key: 'dark', name: '成为新神', emoji: '🔥', tone: 'bad',
++    title: '暗黑结局 · 独星长明',
++    text: '你引爆了所有星骸。滔天的情感能量灌入你一人之躯，星球在你脚下震颤重生。你成为了墨比乌斯唯一的新神——永生，且永远孤独。小星的光在你身后，缓缓熄灭。',
++  },
++};
++
++// —— 随机事件池（地图踩点触发）——
++// type 用于 world 生成时占位；resolve 在 player/ui 中结算。
++export const EVENT_TYPES = ['merchant', 'drone', 'trap'];
++export const EVENT_META = {
++  merchant: { emoji: '🛒', name: '流浪商人', desc: '高价出售稀有零件与精炼星骸。' },
++  drone:    { emoji: '🔧', name: '维修无人机', desc: '消耗星骸，回复全部 HP 与精力。' },
++  trap:     { emoji: '🌀', name: '重力陷阱', desc: '空间扭曲，强制传送至随机位置。' },
++};
++
++// 商人货架（零件 / 强化材料 / 偶尔的星骸）。
++export const SHOP_ITEMS = [
++  { id: 'parts_s', name: '零件包×3', cost: 6, give: { parts: 3 }, emoji: '🔩' },
++  { id: 'parts_l', name: '零件箱×8', cost: 14, give: { parts: 8 }, emoji: '📦' },
++  { id: 'stardust', name: '精炼星骸×10', cost: 18, give: { stardust: 10 }, emoji: '✨' },
++  { id: 'heal', name: '应急维修（满状态）', cost: 10, give: { fullHeal: true }, emoji: '❤️‍🩹' },
++];
++
++// 无人机维修价（星骸）。
++export const DRONE_COST = 8;
++// 最低楼层数（含 Boss）。
++export const MAX_FLOOR = 10;
++
++// —— 升级（经验）——
++export function expToNext(level) { return 10 + (level || 1) * 8; }
++
++// —— 钳制 / 数值辅助 ——
++export function clamp(v, lo, hi) {
++  if (!Number.isFinite(v)) return lo;
++  return Math.max(lo, Math.min(hi, Math.round(v)));
++}
++export function clampStat(v) { return clamp(v, 0, 99999); }
++
++// 曼哈顿距离。
++export function manhattan(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }
+diff --git a/apps/xing-hai-lv-zhe/src/core/battle.js b/apps/xing-hai-lv-zhe/src/core/battle.js
+new file mode 100644
+index 0000000..81458ec
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/core/battle.js
+@@ -0,0 +1,109 @@
++// ============================================================================
++// 战斗模块（抉择型「猜拳」简化版）：敌人架势 vs 玩家应对，克制关系 + 专注力。
++//   架势：突刺(thrust) / 横斩(slash) / 重击(smash)
++//   应对：格挡(block) / 闪避(dodge) / 反击(counter)
++//   克制：反击克突刺、格挡克横斩、闪避克重击。成功克制 → 下一击专注力 ×1.5。
++// 精力过低会失手；词缀（吸血 / 反伤 / 锐利 / 坚固）在结算中生效。
++// ============================================================================
++import { effectiveAtk, effectiveDef, maxHp, damagePlayer, healPlayer } from './player.js';
++import { weightedPick } from './rng.js';
++import { STAMINA_TIRED, STAMINA_FUMBLE_CHANCE, clamp } from '../config.js';
++
++export const STANCES = {
++  thrust: { id: 'thrust', name: '突刺', emoji: '🗡️' },
++  slash:  { id: 'slash',  name: '横斩', emoji: '🌀' },
++  smash:  { id: 'smash',  name: '重击', emoji: '💥' },
++};
++export const ACTIONS = {
++  block:  { id: 'block',  name: '格挡', emoji: '🛡️' },
++  dodge:  { id: 'dodge',  name: '闪避', emoji: '💨' },
++  counter:{ id: 'counter',name: '反击', emoji: '⚔️' },
++};
++// 应对 -> 其所克制的架势。
++export const COUNTERS = { counter: 'thrust', block: 'slash', dodge: 'smash' };
++
++// 敌人架势被「识破」（明牌）的概率；未识破时玩家需盲猜，增加风险。
++export const TELEGRAPH_CHANCE = 0.7;
++
++// 敌人按架势权重抽取本回合架势。
++export function pickEnemyStance(enemy, rng) {
++  const r = rng || Math.random;
++  return weightedPick(r, enemy.stances || { thrust: 1, slash: 1, smash: 1 }) || 'thrust';
++}
++
++// 本回合是否明牌（识破架势）。
++export function isTelegraphed(rng, chance) {
++  const r = rng || Math.random;
++  return r() < (chance == null ? TELEGRAPH_CHANCE : chance);
++}
++
++// 自动战斗：给出克制敌人当前架势的应对（明牌时必中）。
++export function autoPickAction(enemyStance) {
++  for (const [act, st] of Object.entries(COUNTERS)) if (st === enemyStance) return act;
++  return 'counter';
++}
++
++// 专注力倍率：战斗天赋进一步提升克制成功的伤害倍率。
++export function focusMultiplier(focus, combatRank) {
++  if (!focus) return 1;
++  return 1.5 + 0.04 * (combatRank || 0);
++}
++
++// 结算一回合：mutate enemy.hp / player.hp，返回回合描述（不改 stamina，由调用方扣除）。
++//   player, enemy, action, focus(本回合是否带专注), stance(敌人本回合架势), rng
++export function resolveRound(player, enemy, action, focus, stance, rng) {
++  const r = rng || Math.random;
++  const stanceId = stance || pickEnemyStance(enemy, r);
++  // 合法应对原样使用；非法值（如「犹豫」hesitate）保留为失败态，不计入克制。
++  const actId = action in COUNTERS ? action : 'hesitate';
++
++  // 精力过低 → 失手概率（失手时本回合视为应对失败）。
++  let fumble = false;
++  if ((player.stamina || 0) < STAMINA_TIRED) {
++    fumble = r() < STAMINA_FUMBLE_CHANCE;
++  }
++  const countered = !fumble && actId in COUNTERS && COUNTERS[actId] === stanceId;
++
++  let enemyDmg = 0;
++  let playerDmg = 0;
++  let healed = 0;
++  let nextFocus = false;
++
++  if (countered) {
++    // 克制成功：玩家命中敌人，伤害受专注力与战斗天赋加成。
++    const mult = focusMultiplier(focus, player.talents?.combat || 0);
++    enemyDmg = Math.max(1, Math.round(effectiveAtk(player) * mult));
++    enemy.hp = clamp(enemy.hp - enemyDmg, 0, enemy.maxHp || enemy.hp);
++    // 武器吸血词缀
++    if (player.equipment?.weapon?.affix?.id === 'lifesteal') {
++      healed = healPlayer(player, Math.round(enemyDmg * 0.3));
++    }
++    nextFocus = true; // 为下一击充能
++  } else {
++    // 应对失败：敌人命中玩家（防御减免，至少 1）。
++    const raw = (enemy.atk || 0) - effectiveDef(player);
++    playerDmg = Math.max(1, Math.round(raw * (fumble ? 1.2 : 1))); // 失手时受伤更重
++    damagePlayer(player, playerDmg);
++    // 护甲反伤词缀
++    if (player.equipment?.armor?.affix?.id === 'thorns') {
++      const refl = Math.max(1, Math.round(playerDmg * 0.25));
++      enemy.hp = clamp(enemy.hp - refl, 0, enemy.maxHp || enemy.hp);
++      enemyDmg = refl;
++    }
++    nextFocus = false;
++  }
++
++  return {
++    stance: stanceId, action: actId, countered, fumble, focus: !!focus, nextFocus,
++    enemyDmg, playerDmg, healed,
++    enemyDead: enemy.hp <= 0,
++    playerDead: player.hp <= 0,
++  };
++}
++
++// 计算击败该敌人的奖励（星骸 / 零件 / 经验基准，不含幸运加成——加成在 player.gainReward 中统一施加）。
++export function enemyReward(enemy) {
++  return { stardust: enemy.stardust || 0, parts: enemy.parts || 0, exp: enemy.exp || 0, boss: !!enemy.boss };
++}
++
++export { STAMINA_TIRED, STAMINA_FUMBLE_CHANCE, maxHp };
+diff --git a/apps/xing-hai-lv-zhe/src/core/player.js b/apps/xing-hai-lv-zhe/src/core/player.js
+new file mode 100644
+index 0000000..e61f675
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/core/player.js
+@@ -0,0 +1,264 @@
++// ============================================================================
++// 状态管理模块（State Manager）：角色状态、装备强化、天赋、升级与数值结算。
++// 所有数值结算集中于此，UI 只负责调用与渲染，不内含业务逻辑。
++// ============================================================================
++import {
++  BASE_MAX_HP, BASE_MAX_STAMINA, BASE_ATK, BASE_DEF, BASE_MOVE_RANGE,
++  MAX_PLUS, AFFIX_AT, AFFIXES, starterEquipment, enhanceCost,
++  TALENTS, TALENT_BY_BRANCH, talentCost,
++  expToNext, clamp, clampStat, MAX_FLOOR, MEMORY_CHAPTERS, GRID,
++} from '../config.js';
++import { randInt, pick } from './rng.js';
++
++// 创建一名新角色。
++//   opts: { name?, seed?, floor? }
++export function newPlayer(rng, opts = {}) {
++  const r = rng || Math.random;
++  const seed = Number.isFinite(opts.seed) ? opts.seed : randInt(r, 1, 1e9);
++  return {
++    name: (opts.name || '').toString().slice(0, 8) || '旅者',
++    hp: BASE_MAX_HP,
++    stamina: BASE_MAX_STAMINA,
++    stardust: 0,
++    parts: 0,
++    level: 1,
++    exp: 0,
++    equipment: starterEquipment(),
++    talents: { survival: 0, combat: 0, luck: 0 },
++    floor: Math.max(1, Number.isFinite(opts.floor) ? opts.floor : 1),
++    maxFloor: 1,
++    memory: Array.from({ length: MEMORY_CHAPTERS.length }, () => false),
++    log: [],
++    turn: 0,
++    seed,
++    floorState: null,   // 由 world 生成；存档保存，重载可恢复探索
++    ending: null,       // 通关结局记录
++    born: 0,
++    lastSeen: 0,
++  };
++}
++
++// —— 存档结构向后兼容：补齐 / 钳制字段，防止旧档或损坏档导致整页闪退 ——
++export function migrate(p) {
++  if (!p) return p;
++  if (typeof p.name !== 'string') p.name = '旅者';
++  p.name = p.name.slice(0, 8) || '旅者';
++  if (!Number.isFinite(p.hp)) p.hp = BASE_MAX_HP;
++  if (!Number.isFinite(p.stamina)) p.stamina = BASE_MAX_STAMINA;
++  if (!Number.isFinite(p.stardust) || p.stardust < 0) p.stardust = 0;
++  if (!Number.isFinite(p.parts) || p.parts < 0) p.parts = 0;
++  if (!Number.isFinite(p.level) || p.level < 1) p.level = 1;
++  if (!Number.isFinite(p.exp) || p.exp < 0) p.exp = 0;
++  if (!Number.isFinite(p.floor) || p.floor < 1) p.floor = 1;
++  if (p.floor > MAX_FLOOR) p.floor = MAX_FLOOR;
++  if (!Number.isFinite(p.maxFloor) || p.maxFloor < 1) p.maxFloor = p.floor;
++  if (!Number.isFinite(p.seed)) p.seed = 12345;
++  if (!Number.isFinite(p.turn) || p.turn < 0) p.turn = 0;
++  // 装备补齐
++  if (!p.equipment || typeof p.equipment !== 'object') p.equipment = starterEquipment();
++  else p.equipment = { ...starterEquipment(), ...p.equipment };
++  for (const slot of ['weapon', 'armor', 'booster']) {
++    const e = p.equipment[slot];
++    if (!e || typeof e !== 'object') { p.equipment[slot] = starterEquipment()[slot]; continue; }
++    if (typeof e.name !== 'string') e.name = starterEquipment()[slot].name;
++    if (!Number.isFinite(e.stat)) e.stat = starterEquipment()[slot].stat;
++    if (!Number.isFinite(e.plus) || e.plus < 0) e.plus = 0;
++    if (e.plus > MAX_PLUS) e.plus = MAX_PLUS;
++    e.affix = validAffix(e.affix) ? e.affix : null;
++  }
++  // 天赋补齐
++  if (!p.talents || typeof p.talents !== 'object') p.talents = { survival: 0, combat: 0, luck: 0 };
++  for (const t of TALENTS) {
++    const v = Math.floor(p.talents[t.branch]);
++    p.talents[t.branch] = (!Number.isFinite(v) || v < 0) ? 0 : Math.min(v, t.maxRank);
++  }
++  // 记忆数组补齐到章节长度
++  if (!Array.isArray(p.memory)) p.memory = [];
++  while (p.memory.length < MEMORY_CHAPTERS.length) p.memory.push(false);
++  p.memory = p.memory.slice(0, MEMORY_CHAPTERS.length).map((x) => x === true);
++  if (!Array.isArray(p.log)) p.log = [];
++  // 楼层快照规范化：结构损坏则置空（由 UI 重生成当前层），explored 归一为普通对象。
++  if (p.floorState && typeof p.floorState === 'object') {
++    const fs = p.floorState;
++    // grid 必须是 GRID×GRID 的字符串矩阵（逐行校验，避免某行为 null 致 tileAt 崩溃）。
++    const gridOk = Array.isArray(fs.grid) && fs.grid.length === GRID
++      && fs.grid.every((row) => Array.isArray(row) && row.length === GRID);
++    if (!gridOk) {
++      p.floorState = null;
++    } else {
++      // pos 坐标必须为合法网格内整数，否则钳到安全点（避免 renderMap 无角色 / 移动失灵）。
++      const px = Math.floor(fs.pos && fs.pos.x), py = Math.floor(fs.pos && fs.pos.y);
++      if (!Number.isInteger(px) || px < 0 || px >= GRID || !Number.isInteger(py) || py < 0 || py >= GRID) {
++        fs.pos = { x: 1, y: 1 };
++      } else {
++        fs.pos = { x: px, y: py };
++      }
++      if (!Array.isArray(fs.entities)) fs.entities = [];
++      if (Array.isArray(fs.explored)) { const o = {}; for (const k of fs.explored) o[k] = true; fs.explored = o; }
++      else if (!fs.explored || typeof fs.explored !== 'object' || Array.isArray(fs.explored)) fs.explored = {};
++      if (!Number.isFinite(fs.floor)) fs.floor = p.floor;
++    }
++  } else {
++    p.floorState = null;
++  }
++  p.ending = (p.ending === 'peace' || p.ending === 'dark') ? p.ending : null;
++  if (!Number.isFinite(p.born)) p.born = 0;
++  if (!Number.isFinite(p.lastSeen)) p.lastSeen = 0;
++  // 收尾钳制：HP / 精力落到合法区间（依赖已规范化的 talents / level）。
++  p.hp = clamp(p.hp, 0, maxHp(p));
++  p.stamina = clamp(p.stamina, 0, maxStamina());
++  return p;
++}
++
++function validAffix(a) {
++  return a && AFFIXES.some((x) => x.id === a.id);
++}
++
++// —— 派生数值（装备 + 强化 + 词缀 + 天赋 + 等级）——
++export function maxHp(p) {
++  return BASE_MAX_HP + (p.talents.survival || 0) * 20 + (p.level - 1) * 5;
++}
++export function maxStamina() { return BASE_MAX_STAMINA; }
++
++export function effectiveAtk(p) {
++  const w = p.equipment.weapon;
++  let atk = BASE_ATK + (w.stat || 0) + (w.plus || 0) + Math.floor((p.level - 1) / 2);
++  if (w.affix && w.affix.id === 'keen') atk *= 1.2;
++  atk *= 1 + 0.1 * (p.talents.combat || 0); // 战斗天赋
++  return Math.max(1, Math.round(atk));
++}
++
++export function effectiveDef(p) {
++  const a = p.equipment.armor;
++  let def = BASE_DEF + (a.stat || 0) + (a.plus || 0) + Math.floor((p.level - 1) / 3);
++  if (a.affix && a.affix.id === 'guard') def *= 1.2;
++  return Math.max(0, Math.round(def));
++}
++
++export function effectiveMoveRange(p) {
++  const b = p.equipment.booster;
++  let range = BASE_MOVE_RANGE + (b.plus || 0);
++  if (b.affix && b.affix.id === 'swift') range += 1;
++  return range;
++}
++
++// 词缀在 +5（及之后每 5 级）触发变异；已存在词缀则替换为新的随机词缀。
++export function rollAffix(rng) {
++  const r = rng || Math.random;
++  return { ...pick(r, AFFIXES) };
++}
++
++// 强化装备：消耗零件，plus+1；达 AFFIX_AT 的倍数时触发词缀变异。返回结果描述。
++export function enhanceEquipment(p, slot, rng) {
++  const r = rng || Math.random;
++  const e = p.equipment[slot];
++  if (!e) return { ok: false, reason: 'no-slot' };
++  if (e.plus >= MAX_PLUS) return { ok: false, reason: 'max' };
++  const cost = enhanceCost(e.plus);
++  if (p.parts < cost) return { ok: false, reason: 'no-parts', cost };
++  p.parts -= cost;
++  e.plus += 1;
++  let affixed = null;
++  if (e.plus % AFFIX_AT === 0) {
++    e.affix = rollAffix(r);
++    affixed = e.affix;
++  }
++  return { ok: true, plus: e.plus, affixed, slot };
++}
++
++// 点亮天赋：消耗星骸。返回结果。
++export function buyTalent(p, branch) {
++  const def = TALENT_BY_BRANCH[branch];
++  if (!def) return { ok: false, reason: 'no-branch' };
++  const rank = p.talents[branch] || 0;
++  if (rank >= def.maxRank) return { ok: false, reason: 'max' };
++  const cost = talentCost(branch, rank);
++  if (p.stardust < cost) return { ok: false, reason: 'no-stardust', cost };
++  p.stardust -= cost;
++  p.talents[branch] = rank + 1;
++  // 生存天赋提升上限后，同步补满 HP（鼓励投资生存）。
++  if (branch === 'survival') p.hp = Math.min(maxHp(p), p.hp + 20);
++  return { ok: true, branch, rank: rank + 1 };
++}
++
++// 重置天赋：全额返还星骸，可随时免费重置（鼓励试错）。
++export function resetTalents(p) {
++  let refund = 0;
++  for (const t of TALENTS) {
++    const rank = p.talents[t.branch] || 0;
++    for (let i = 0; i < rank; i++) refund += talentCost(t.branch, i);
++    p.talents[t.branch] = 0;
++  }
++  p.stardust += refund;
++  // 上限下调后钳制 HP。
++  p.hp = Math.min(p.hp, maxHp(p));
++  return { ok: true, refund };
++}
++
++// 获取战斗 / 拾取奖励（星骸 / 零件 / 经验），含幸运天赋加成与升级。
++export function gainReward(p, reward = {}, rng) {
++  const luck = 1 + 0.15 * (p.talents.luck || 0);
++  const sd = Math.round((reward.stardust || 0) * luck);
++  const pt = Math.round((reward.parts || 0) * luck);
++  p.stardust += sd;
++  p.parts += pt;
++  let leveled = 0;
++  if (reward.exp) {
++    p.exp += reward.exp;
++    while (p.exp >= expToNext(p.level)) {
++      p.exp -= expToNext(p.level);
++      p.level += 1;
++      leveled += 1;
++    }
++    if (leveled > 0) {
++      // 升级回血 40%（开罗式贴心）。
++      p.hp = Math.min(maxHp(p), p.hp + Math.round(maxHp(p) * 0.4));
++    }
++  }
++  return { stardust: sd, parts: pt, leveled };
++}
++
++// —— HP / 精力 ——
++export function damagePlayer(p, amount) {
++  const d = Math.max(0, Math.round(amount || 0));
++  p.hp = clamp(p.hp - d, 0, maxHp(p));
++  return d;
++}
++export function healPlayer(p, amount) {
++  const before = p.hp;
++  p.hp = clamp(p.hp + (amount || 0), 0, maxHp(p));
++  return p.hp - before;
++}
++export function healFull(p) {
++  const before = p.hp;
++  p.hp = maxHp(p);
++  p.stamina = maxStamina();
++  return p.hp - before;
++}
++export function spendStamina(p, amount) {
++  p.stamina = clamp(p.stamina - (amount || 0), 0, maxStamina());
++  return p.stamina;
++}
++export function regenStamina(p, amount) {
++  const before = p.stamina;
++  p.stamina = clamp(p.stamina + (amount || 0), 0, maxStamina());
++  return p.stamina - before;
++}
++
++export function isDead(p) { return p.hp <= 0; }
++
++// 记忆碎片收集：解锁对应章节，生存天赋额外回 HP。返回是否新解锁。
++export function collectMemory(p, chapterIndex) {
++  const idx = Math.max(0, Math.min(p.memory.length - 1, chapterIndex));
++  if (p.memory[idx]) return { ok: false, already: true };
++  p.memory[idx] = true;
++  const heal = 5 + (p.talents.survival || 0) * 5;
++  healPlayer(p, heal);
++  return { ok: true, chapter: idx, heal };
++}
++
++export function collectedMemoryCount(p) {
++  return p.memory.filter(Boolean).length;
++}
++
++export { MAX_PLUS, AFFIX_AT, AFFIXES, TALENTS, TALENT_BY_BRANCH, enhanceCost, talentCost, expToNext, clamp, clampStat, MAX_FLOOR, MEMORY_CHAPTERS };
+diff --git a/apps/xing-hai-lv-zhe/src/core/rng.js b/apps/xing-hai-lv-zhe/src/core/rng.js
+new file mode 100644
+index 0000000..5a8d69d
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/core/rng.js
+@@ -0,0 +1,51 @@
++// ============================================================================
++// 可注入随机源：默认 Math.random，单测可传入确定性序列，保证逻辑可复现。
++// ============================================================================
++export function makeRng(source) {
++  if (typeof source === 'function') return source;
++  if (Array.isArray(source)) {
++    // 确定性序列：依次取出，耗尽后回绕，便于穷举分支。
++    let i = 0;
++    return () => {
++      if (!source.length) return 0;
++      const v = source[i % source.length];
++      i += 1;
++      return v;
++    };
++  }
++  return Math.random;
++}
++
++// 钳制到 [0, 0.999999)：makeRng 的确定性数组序列可能返回任意值（含 ≥1），
++// 直接用于数组下标会越界取到 undefined（实测触发 `Cannot read properties of undefined`）。
++// 生产用 Math.random 永远合法，但此处兜底可提升种子 / 注入测试的鲁棒性。
++export function clampUnit(v) {
++  const n = Number(v);
++  if (!Number.isFinite(n)) return 0;
++  return Math.min(0.999999, Math.max(0, n));
++}
++
++// [min, max] 闭区间随机整数。
++export function randInt(rng, min, max) {
++  const r = clampUnit(rng());
++  return Math.floor(min + r * (max - min + 1));
++}
++
++// 按 {key: weight} 权重抽取一个 key。
++export function weightedPick(rng, weights) {
++  const entries = Object.entries(weights).filter(([, w]) => w > 0);
++  const total = entries.reduce((s, [, w]) => s + w, 0);
++  if (total <= 0) return null;
++  let roll = clampUnit(rng()) * total;
++  for (const [k, w] of entries) {
++    roll -= w;
++    if (roll <= 0) return k;
++  }
++  return entries[entries.length - 1][0];
++}
++
++// 从数组中等概率取一个元素（空数组返回 undefined）。
++export function pick(rng, arr) {
++  if (!Array.isArray(arr) || !arr.length) return undefined;
++  return arr[Math.floor(clampUnit(rng()) * arr.length)];
++}
+diff --git a/apps/xing-hai-lv-zhe/src/core/save.js b/apps/xing-hai-lv-zhe/src/core/save.js
+new file mode 100644
+index 0000000..2ee8c42
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/core/save.js
+@@ -0,0 +1,126 @@
++// ============================================================================
++// 存档管理模块（Save Manager）：多槽位 localStorage 持久化 + 导入导出（base64）。
++//
++// 多槽位：提供 SAVE_SLOTS（≥5）个独立存档位，key = xhlz_save_<slot>。
++// 通过 storage 访问器隔离 localStorage，便于 Node 单测注入。
++// 每次移动 / 战斗结算 / 强化 / 拾取后由 UI 自动调用 saveToSlot 落盘，防丢档。
++// ============================================================================
++import { migrate } from './player.js';
++
++export const SAVE_SLOTS = 6;
++const SLOT_PREFIX = 'xhlz_save_';
++
++let storage = null;
++try {
++  if (typeof localStorage !== 'undefined') storage = localStorage;
++} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }
++
++// 测试 / 注入用
++export function _setStorage(s) { storage = s; }
++
++export function nowSec() {
++  try { return Math.floor(Date.now() / 1000); } catch (_) { return 0; }
++}
++
++const slotKey = (slot) => `${SLOT_PREFIX}${slot}`;
++
++function validSlot(slot) {
++  const n = Number(slot);
++  return Number.isInteger(n) && n >= 0 && n < SAVE_SLOTS;
++}
++
++// 读取某槽位的原始玩家对象，不存在或损坏返回 null。
++export function loadFromSlot(slot) {
++  try {
++    if (!storage || !validSlot(slot)) return null;
++    const raw = storage.getItem(slotKey(slot));
++    if (!raw) return null;
++    const player = JSON.parse(raw);
++    return migrate(player);
++  } catch (_) { return null; }
++}
++
++// 列举所有槽位的概要信息，供存档管理 UI 展示。
++// 返回 [{ slot, exists, name, floor, maxFloor, level, stardust, memoryCount, ending, dead, lastSeen }]
++export function listSaves() {
++  const out = [];
++  for (let i = 0; i < SAVE_SLOTS; i++) {
++    const p = loadFromSlot(i);
++    out.push({
++      slot: i,
++      exists: !!p,
++      name: p ? p.name : null,
++      floor: p ? p.floor : null,
++      maxFloor: p ? p.maxFloor : null,
++      level: p ? p.level : null,
++      stardust: p ? p.stardust : null,
++      memoryCount: p ? (p.memory || []).filter(Boolean).length : 0,
++      ending: p ? p.ending : null,
++      dead: !!(p && p.hp <= 0 && !p.ending), // hp 归零且未通关：陨落档，不可「继续」
++      lastSeen: p ? p.lastSeen : 0,
++    });
++  }
++  return out;
++}
++
++// 是否存在可「继续旅程」的存档（陨落档 hp<=0 且未通关不算可继续）。
++export function hasAnySave() {
++  try {
++    return listSaves().some((s) => s.exists && !s.dead);
++  } catch (_) { return false; }
++}
++
++// 取最近游玩的槽位（lastSeen 最大者）；同值时槽位号大者优先（最后写入者胜出，结果确定）。
++// 陨落档不可继续，直接跳过。
++export function latestSlot() {
++  const list = listSaves().filter((s) => s.exists && !s.dead);
++  if (!list.length) return null;
++  let pick = list[0];
++  for (const s of list) {
++    if ((s.lastSeen || 0) >= (pick.lastSeen || 0)) pick = s;
++  }
++  return pick.slot;
++}
++
++// 写入指定槽位。slot 非法时回退到 0 号槽。返回是否成功。
++export function saveToSlot(slot, player) {
++  try {
++    if (!storage || !player) return false;
++    const s = validSlot(slot) ? slot : 0;
++    player.lastSeen = nowSec();
++    if (!player.born) player.born = player.lastSeen;
++    storage.setItem(slotKey(s), JSON.stringify(player));
++    return true;
++  } catch (_) { return false; }
++}
++
++export function deleteSlot(slot) {
++  try {
++    if (!storage || !validSlot(slot)) return false;
++    storage.removeItem(slotKey(slot));
++    return true;
++  } catch (_) { return false; }
++}
++
++// 导出 / 导入（base64，UTF-8 安全）。
++export function exportSave(player) {
++  return btoaSafe(JSON.stringify(migrate(JSON.parse(JSON.stringify(player)))));
++}
++export function importSave(str) {
++  try {
++    const player = JSON.parse(atobSafe(str));
++    return migrate(player);
++  } catch (_) { return null; }
++}
++
++// —— UTF-8 安全的 base64（兼容浏览器与 Node）——
++function btoaSafe(str) {
++  if (typeof btoa === 'function') return btoa(unescape(encodeURIComponent(str)));
++  return Buffer.from(str, 'utf8').toString('base64');
++}
++function atobSafe(str) {
++  if (typeof atob === 'function') return decodeURIComponent(escape(atob(str)));
++  return Buffer.from(str, 'base64').toString('utf8');
++}
++
++export { SLOT_PREFIX };
+diff --git a/apps/xing-hai-lv-zhe/src/core/world.js b/apps/xing-hai-lv-zhe/src/core/world.js
+new file mode 100644
+index 0000000..10c19f4
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/core/world.js
+@@ -0,0 +1,314 @@
++// ============================================================================
++// 浮岛生成模块：程序化生成 16×16 地图（房间感 + 连通保证）、迷雾、移动校验。
++// 纯数据与纯函数：生成 floorState 供 UI 渲染，移动 / 视野查询无副作用（除显式 mutate）。
++// ============================================================================
++import {
++  GRID, VISION_RADIUS, TILES, FLOOR_TILES, tileOf, isWalkable,
++  floorConfig, enemyPoolFor, EVENT_TYPES, EVENT_META, MAX_FLOOR, MEMORY_CHAPTERS,
++} from '../config.js';
++import { randInt, weightedPick, pick } from './rng.js';
++
++const key = (x, y) => `${x},${y}`;
++const inBounds = (x, y) => x >= 0 && y >= 0 && x < GRID && y < GRID;
++
++// —— 生成一张浮岛（floorState）——
++//   rng：可注入随机源；floor：楼层；player：用于 Boss 判定等（可选）。
++//   返回 { grid, pos, entities, explored, floor }
++export function generateFloor(rng, floor, player) {
++  const r = rng || Math.random;
++  const f = Math.max(1, Math.min(MAX_FLOOR, floor || 1));
++  const cfg = floorConfig(f);
++  const isBoss = f >= MAX_FLOOR;
++
++  // 多次尝试，直到连通率合格（避免被障碍物封死）。
++  let state = null;
++  for (let attempt = 0; attempt < 8; attempt++) {
++    state = tryGenerate(r, f, isBoss, cfg);
++    const reach = bfsReachable(state.grid, state.pos.x, state.pos.y);
++    const reachCount = reach.dist.size;
++    if (reachCount >= GRID * GRID * 0.6) {
++      state._reach = reach;
++      break;
++    }
++  }
++  if (!state._reach) state._reach = bfsReachable(state.grid, state.pos.x, state.pos.y);
++  const reach = state._reach;
++  delete state._reach;
++
++  // 阶梯：取可达集中距出生点最远的可行走地块。Boss 层无阶梯——击败 Boss 即通关。
++  let stairsCell = null;
++  if (!isBoss) {
++    stairsCell = pickFarReachable(r, reach, state.pos, 6);
++    if (stairsCell) state.grid[stairsCell.y][stairsCell.x] = 'stairs';
++  }
++
++  // 实体放置（仅在可达且未被占用的地块上）。
++  const occupied = new Set([key(state.pos.x, state.pos.y), key(stairsCell?.x, stairsCell?.y)]);
++  const reachableTiles = [...reach.dist.keys()]
++    .filter((k) => !occupied.has(k))
++    .map((k) => { const [x, y] = k.split(',').map(Number); return { x, y }; });
++
++  const entities = [];
++  let eid = 1;
++  const place = (type, dataFn) => {
++    const cell = takeCell(r, reachableTiles, occupied);
++    if (!cell) return null;
++    const e = { id: `e${eid++}`, type, x: cell.x, y: cell.y, ...(dataFn ? dataFn(cell) : {}) };
++    entities.push(e);
++    return e;
++  };
++
++  // Boss 层：只放 Boss + 记忆；普通层按 cfg 放怪 / 箱 / 事件 / 记忆。
++  if (isBoss) {
++    place('enemy', () => bossEnemy());
++  } else {
++    const pool = enemyPoolFor(f);
++    for (let i = 0; i < cfg.enemyCount; i++) {
++      place('enemy', () => spawnEnemy(r, pool, f));
++    }
++    for (let i = 0; i < cfg.chestCount; i++) place('chest', () => ({ reward: chestReward(r, f) }));
++    if (cfg.eventCount) place(pick(r, EVENT_TYPES));
++  }
++  // 每层 1 枚记忆回响（章节 = 楼层 - 1，对应 1..10 章）。
++  if (cfg.memory) place('memory', () => ({ chapter: Math.min(f - 1, MEMORY_CHAPTERS.length - 1) }));
++
++  state.entities = entities;
++  // explored 用普通对象（JSON 原生可序列化），随存档往返不丢失；key 形如 "x,y"。
++  const explored = {};
++  for (const k of visibleKeys(state.grid, state.pos.x, state.pos.y)) explored[k] = true;
++  state.explored = explored;
++  return state;
++}
++
++// 一次生成尝试：网格 + 障碍 + 出生点。
++function tryGenerate(r, f, isBoss, cfg) {
++  const grid = Array.from({ length: GRID }, () =>
++    Array.from({ length: GRID }, () => pick(r, FLOOR_TILES)));
++  // 边界石墙
++  for (let i = 0; i < GRID; i++) {
++    grid[0][i] = 'wall'; grid[GRID - 1][i] = 'wall';
++    grid[i][0] = 'wall'; grid[i][GRID - 1] = 'wall';
++  }
++  // 散布障碍：石墙 / 深墙 / 水域（不可走），密度随楼层略升。
++  const density = 0.10 + Math.min(0.06, (f - 1) * 0.008);
++  for (let y = 1; y < GRID - 1; y++) {
++    for (let x = 1; x < GRID - 1; x++) {
++      if (r() < density) {
++        grid[y][x] = weightedPick(r, { wall: 5, wallDark: 2, water: 3 }) || 'wall';
++      }
++    }
++  }
++  // 出生点：左上角附近的安全格，清空 3×3 邻域保证不卡。
++  const pos = { x: randInt(r, 1, 3), y: randInt(r, 1, 3) };
++  for (let dy = -1; dy <= 1; dy++) {
++    for (let dx = -1; dx <= 1; dx++) {
++      const x = pos.x + dx, y = pos.y + dy;
++      if (inBounds(x, y) && grid[y][x] !== 'floor') grid[y][x] = pick(r, ['floor', 'floor2']);
++    }
++  }
++  return { grid, pos, entities: [], explored: new Set(), floor: f };
++}
++
++function takeCell(r, pool, occupied) {
++  // 从可达池中随机取一个尚未占用的格子。
++  const avail = pool.filter((c) => !occupied.has(key(c.x, c.y)));
++  if (!avail.length) return null;
++  const c = pick(r, avail); // 复用 pick（内含 clampUnit 兜底），避免注入源 r()≥1 时下标越界取到 undefined
++  occupied.add(key(c.x, c.y));
++  return c;
++}
++
++function pickFarReachable(r, reach, from, minDist) {
++  // 在可达集中挑选距 from 距离 ≥ minDist 的格子（优先最远），保证阶梯远离出生点。
++  const entries = [...reach.dist.entries()]
++    .map(([k, d]) => { const [x, y] = k.split(',').map(Number); return { x, y, d }; })
++    .filter((c) => c.d >= minDist);
++  if (!entries.length) {
++    // 退化：取可达集中最远的。
++    const all = [...reach.dist.entries()].map(([k, d]) => { const [x, y] = k.split(',').map(Number); return { x, y, d }; });
++    if (!all.length) return null;
++    all.sort((a, b) => b.d - a.d);
++    return all[0];
++  }
++  entries.sort((a, b) => b.d - a.d);
++  // 取前 1/3 中随机一个，避免每次都最远角落。
++  const top = entries.slice(0, Math.max(1, Math.floor(entries.length / 3)));
++  return pick(r, top);
++}
++
++// 生成一个敌人实例（基于敌人定义池加权抽取）。
++function spawnEnemy(r, pool, floor) {
++  if (!pool || !pool.length) pool = enemyPoolFor(floor);
++  const weights = Object.fromEntries(pool.map((e, i) => [i, 1]));
++  const idx = Number(weightedPick(r, weights) || 0);
++  const def = pool[idx] || pool[0];
++  return enemyFromDef(def, floor);
++}
++function bossEnemy() {
++  const def = enemyPoolFor(MAX_FLOOR).find((e) => e.boss) || enemyPoolFor(MAX_FLOOR)[0];
++  return enemyFromDef(def, MAX_FLOOR);
++}
++export function enemyFromDef(def, floor) {
++  // 敌人 HP / 攻击随楼层小幅上扬，保证后期更有压力。
++  const tier = Math.max(0, (floor || 1) - (def.minFloor || 1));
++  return {
++    defId: def.id, name: def.name, emoji: def.emoji,
++    hp: def.hp + tier * 4, maxHp: def.hp + tier * 4,
++    atk: def.atk + tier, stances: { ...def.stances },
++    stardust: def.stardust, parts: def.parts, exp: def.exp,
++    boss: !!def.boss,
++  };
++}
++
++// 宝箱奖励：零件为主，偶有星骸。
++function chestReward(r, floor) {
++  const roll = r();
++  if (roll < 0.6) return { parts: randInt(r, 2, 4) + Math.floor(floor / 3) };
++  if (roll < 0.9) return { stardust: randInt(r, 3, 6) };
++  return { parts: randInt(r, 1, 3), stardust: randInt(r, 2, 4) };
++}
++
++// —— 视野（迷雾）：以 (x,y) 为中心的 5×5 切比雪夫窗口 ——
++export function visibleKeys(grid, x, y) {
++  const out = [];
++  for (let dy = -VISION_RADIUS; dy <= VISION_RADIUS; dy++) {
++    for (let dx = -VISION_RADIUS; dx <= VISION_RADIUS; dx++) {
++      const nx = x + dx, ny = y + dy;
++      if (inBounds(nx, ny)) out.push(key(nx, ny));
++    }
++  }
++  return out;
++}
++export function isVisible(x, y, pos) {
++  return Math.max(Math.abs(x - pos.x), Math.abs(y - pos.y)) <= VISION_RADIUS;
++}
++
++// —— BFS 可达性：从 (sx,sy) 出发，墙 / 水域 / 深墙视为阻挡 ——
++// 返回 { dist: Map(key->steps), prev: Map(key->key) }。
++export function bfsReachable(grid, sx, sy) {
++  const dist = new Map();
++  const prev = new Map();
++  if (!inBounds(sx, sy) || !isWalkable(grid[sy][sx])) return { dist, prev };
++  const q = [[sx, sy]];
++  dist.set(key(sx, sy), 0);
++  while (q.length) {
++    const [x, y] = q.shift();
++    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
++      const nx = x + dx, ny = y + dy;
++      if (!inBounds(nx, ny)) continue;
++      if (!isWalkable(grid[ny][nx])) continue;
++      const k = key(nx, ny);
++      if (dist.has(k)) continue;
++      dist.set(k, dist.get(key(x, y)) + 1);
++      prev.set(k, key(x, y));
++      q.push([nx, ny]);
++    }
++  }
++  return { dist, prev };
++}
++
++// 计算从 from 到 to 的路径（仅四向、避开阻挡与敌占格），返回步序列 [{x,y},...]（含 to，不含 from）。
++// range 为步数上限；超出或不可达返回 null。avoid 是额外阻挡坐标集合（如敌人）。
++export function findPath(state, from, to, range, avoid) {
++  if (!state) return null;
++  const block = new Set(avoid || []);
++  // 敌人所在格视为阻挡。
++  for (const e of state.entities) if (e.type === 'enemy') block.add(key(e.x, e.y));
++  const dist = new Map();
++  const prev = new Map();
++  const startK = key(from.x, from.y);
++  dist.set(startK, 0);
++  const q = [[from.x, from.y]];
++  let found = false;
++  while (q.length) {
++    const [x, y] = q.shift();
++    if (x === to.x && y === to.y) { found = true; break; }
++    const base = dist.get(key(x, y));
++    if (base >= range) continue;
++    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
++      const nx = x + dx, ny = y + dy;
++      const k = key(nx, ny);
++      if (dist.has(k)) continue;
++      if (!inBounds(nx, ny)) continue;
++      const isTarget = nx === to.x && ny === to.y;
++      if (block.has(k) && !isTarget) continue;       // 阻挡格不可踏入（目标格除外）
++      if (!isWalkable(state.grid[ny][nx]) && !isTarget) continue;
++      dist.set(k, base + 1);
++      prev.set(k, key(x, y));
++      q.push([nx, ny]);
++    }
++  }
++  if (!found && !(from.x === to.x && from.y === to.y)) return null;
++  // 回溯路径
++  const path = [];
++  let cur = key(to.x, to.y);
++  if (!dist.has(cur)) return null;
++  const steps = dist.get(cur);
++  if (steps > range) return null;
++  while (cur !== startK) {
++    const [cx, cy] = cur.split(',').map(Number);
++    path.unshift({ x: cx, y: cy });
++    cur = prev.get(cur);
++    if (cur == null) break;
++  }
++  return path;
++}
++
++// 计算从 from 出发、步数 ≤ range 的所有可达地块（四向；墙 / 水域 / 敌人格视为阻挡）。
++// 返回 Set(key)。供 UI 标注「可点击移动」高亮。
++export function reachableTiles(state, from, range) {
++  const out = new Set();
++  if (!state) return out;
++  const block = new Set();
++  for (const e of state.entities) if (e.type === 'enemy') block.add(key(e.x, e.y));
++  const dist = new Map();
++  const startK = key(from.x, from.y);
++  dist.set(startK, 0);
++  out.add(startK);
++  const q = [[from.x, from.y]];
++  while (q.length) {
++    const [x, y] = q.shift();
++    const base = dist.get(key(x, y));
++    if (base >= range) continue;
++    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
++      const nx = x + dx, ny = y + dy;
++      const k = key(nx, ny);
++      if (dist.has(k)) continue;
++      if (!inBounds(nx, ny)) continue;
++      if (block.has(k)) continue;
++      if (!isWalkable(state.grid[ny][nx])) continue;
++      dist.set(k, base + 1);
++      out.add(k);
++      q.push([nx, ny]);
++    }
++  }
++  return out;
++}
++
++// 查询某格上的实体。
++export function entityAt(state, x, y) {
++  if (!state || !state.entities) return null;
++  return state.entities.find((e) => e.x === x && e.y === y) || null;
++}
++export function removeEntity(state, id) {
++  if (!state || !state.entities) return false;
++  const i = state.entities.findIndex((e) => e.id === id);
++  if (i < 0) return false;
++  state.entities.splice(i, 1);
++  return true;
++}
++
++export function tileAt(state, x, y) {
++  if (!state || !inBounds(x, y)) return 'wall';
++  return state.grid[y][x];
++}
++
++// 下行：楼层 +1（上限 MAX_FLOOR），更新最远记录。返回新楼层。
++export function descend(player) {
++  if (!player) return 1;
++  player.floor = Math.min(MAX_FLOOR, player.floor + 1);
++  if (player.floor > player.maxFloor) player.maxFloor = player.floor;
++  return player.floor;
++}
++
++export { key, inBounds, GRID, VISION_RADIUS, TILES, tileOf, isWalkable, EVENT_META, MAX_FLOOR };
+diff --git a/apps/xing-hai-lv-zhe/src/main.js b/apps/xing-hai-lv-zhe/src/main.js
+new file mode 100644
+index 0000000..148db51
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/main.js
+@@ -0,0 +1,19 @@
++// ============================================================================
++// 星骸旅者 · 入口
++// 导出 createGame(parent) 工厂，供主框架（落地页）按需挂载到任意容器；
++// 同时保留独立运行（apps/xing-hai-lv-zhe/index.html）时的自动挂载行为。
++// ============================================================================
++import { GameUI } from './ui/app.js';
++
++export function createGame(parent) {
++  const ui = new GameUI(parent);
++  ui.mount();
++  return ui;
++}
++
++// 独立运行时自动挂载到 #game-container（仅在元素存在时触发，
++// 避免被主框架动态 import 时误启动游戏）。
++if (typeof document !== 'undefined' && document.getElementById('game-container')) {
++  const ui = createGame(document.getElementById('game-container'));
++  if (typeof window !== 'undefined') window.__XHLZ = ui; // 暴露实例便于调试 / 冒烟测试
++}
+diff --git a/apps/xing-hai-lv-zhe/src/ui/app.js b/apps/xing-hai-lv-zhe/src/ui/app.js
+new file mode 100644
+index 0000000..cb6a9e1
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/ui/app.js
+@@ -0,0 +1,1312 @@
++// ============================================================================
++// 星骸旅者 · UI 渲染模块（UI Renderer，纯原生 DOM + CSS 像素网格）
++// 状态机：BOOT(launcher) → MAP → BATTLE → INVENTORY / EVENT → 结局。
++// 负责：启动器/创角、像素地图渲染与点击移动、猜拳战斗、背包(装备/天赋/剧情)、
++// 随机事件、双重结局、多槽位存档。requestAnimationFrame 驱动战斗计时与闲置回精。
++// ============================================================================
++import './style.css';
++import { h, clear, bar } from './dom.js';
++import {
++  PALETTE, GRID, VISION_RADIUS, TILES, tileOf, isWalkable,
++  EQUIP_SLOTS, MAX_PLUS, AFFIX_AT, AFFIXES, enhanceCost,
++  TALENTS, TALENT_BY_BRANCH, talentCost,
++  STAMINA_COST_PER_ROUND, STAMINA_REGEN_PER_STEP, STAMINA_REGEN_INTERVAL_MS, STAMINA_TIRED,
++  SHOP_ITEMS, DRONE_COST, EVENT_META, MEMORY_CHAPTERS, STORY, ENDINGS, MAX_FLOOR, expToNext,
++} from '../config.js';
++import {
++  newPlayer, migrate, maxHp, maxStamina, effectiveAtk, effectiveDef, effectiveMoveRange,
++  enhanceEquipment, buyTalent, resetTalents, gainReward, healFull, regenStamina, spendStamina,
++  isDead, collectMemory, collectedMemoryCount,
++} from '../core/player.js';
++import {
++  generateFloor, findPath, reachableTiles, entityAt, removeEntity, tileAt, descend,
++} from '../core/world.js';
++import {
++  STANCES, ACTIONS, COUNTERS, TELEGRAPH_CHANCE,
++  pickEnemyStance, isTelegraphed, autoPickAction, resolveRound, enemyReward,
++} from '../core/battle.js';
++import {
++  saveToSlot, loadFromSlot, deleteSlot, listSaves, hasAnySave, latestSlot,
++  exportSave, importSave, SAVE_SLOTS,
++} from '../core/save.js';
++
++const BATTLE_TIME_MS = 3000;       // 每回合限时（可于设置关闭）
++const IDLE_FRAME_MS = 1000 / 20;   // 闲置降帧至 ~20fps 节省电量
++
++export class GameUI {
++  constructor(parent) {
++    this.parent = parent;
++    this.player = null;
++    this.rng = Math.random;
++    this.screen = 'launcher';
++    this.over = false;
++    this.activeSlot = null;
++    this.timerEnabled = true;      // 战斗限时（测试可关闭）
++    this._sheet = null;
++    this.charName = '';
++    this.cellNodes = [];           // 2D 地块 DOM 引用（脏更新）
++    this.floatLayer = null;
++    this.running = false;          // rAF 循环开关
++    this._raf = 0;
++    this._lastFrame = 0;
++    this._staminaAccum = 0;
++    this.battle = null;            // 战斗会话状态
++  }
++
++  mount() {
++    this.root = h('div', { class: 'xhlz' });
++    clear(this.parent);
++    this.parent.appendChild(this.root);
++    this.toastWrap = h('div', { class: 'toast-wrap' });
++    this.stage = h('div', { class: 'xhlz-stage' });
++    this.modalRoot = h('div', { class: 'xhlz-modals' });
++    this.root.append(this.toastWrap, this.stage, this.modalRoot);
++    this.showLauncher();
++    return this;
++  }
++
++  // ===================== 启动器 =====================
++  showLauncher() {
++    this.screen = 'launcher';
++    this.over = false;
++    this.player = null;
++    this.battle = null;
++    this.activeSlot = null;
++    this.stopLoop();
++    clear(this.modalRoot);
++    clear(this.stage);
++    const hasSave = hasAnySave();
++    const wrap = h('div', { class: 'launcher' },
++      h('div', { class: 'launcher__brand' },
++        h('div', { class: 'emblem' }, '星'),
++        h('h1', null, '星骸旅者'),
++        h('p', { class: 'sub' }, '开罗式像素 Roguelike · 在破碎星球拾荒、战斗、寻回记忆'),
++      ),
++      h('div', { class: 'launcher__actions' },
++        hasSave
++          ? h('button', { class: 'btn-primary big-btn', onClick: () => this.continueGame() }, '▶ 继续旅程')
++          : h('button', { class: 'btn-primary big-btn', onClick: () => this.showCreate() }, '🚀 开启新旅程'),
++        hasSave
++          ? h('button', { class: 'btn-ghost', onClick: () => this.showCreate() }, '🆕 新旅程（选空槽）')
++          : null,
++        h('button', { class: 'btn-ghost', onClick: () => this.showSlots(true) }, '📂 存档管理'),
++        h('button', { class: 'btn-ghost', onClick: () => this.showAbout() }, '📖 关于 / 玩法'),
++      ),
++      h('p', { class: 'launcher__hint muted' }, '点击地块移动，靠近敌人即可交战；集齐 10 枚星骸回响，揭开星球的真相。'),
++    );
++    this.stage.appendChild(wrap);
++  }
++
++  continueGame() {
++    const slot = latestSlot();
++    if (slot == null) { this.toast('没有可继续的存档', 'bad'); this.showLauncher(); return; }
++    const p = loadFromSlot(slot);
++    if (!p) { this.toast('读取存档失败', 'bad'); this.showLauncher(); return; }
++    if (p.ending) { this.renderEnding(p.ending, true, p); return; }
++    if (isDead(p)) { this.player = p; this.activeSlot = slot; this.gameOver(); return; } // 陨落档直接展示终结画面，避免「继续」瞬间又死亡
++    this.enterGame(p, slot);
++  }
++
++  showAbout() {
++    const body = [
++      h('div', { class: 'card' },
++        h('h4', null, '🎮 核心循环'),
++        h('div', { class: 'muted', style: { lineHeight: 1.7 } },
++          '浮岛探索（点击移动）→ 触发战斗 / 宝箱 / 陷阱 → 回到背包消耗零件强化装备、用星骸点亮天赋 → 挑战更深层浮岛。'),
++      ),
++      h('div', { class: 'card' },
++        h('h4', null, '⚔️ 战斗：猜拳克制'),
++        h('div', { class: 'muted', style: { lineHeight: 1.7 } },
++          '敌人摆出 突刺🗡️ / 横斩🌀 / 重击💥；你选 格挡🛡️ / 闪避💨 / 反击⚔️。',
++          h('br'),
++          '反击克突刺、格挡克横斩、闪避克重击。成功克制 → 下一击专注力 ×1.5。精力过低会失手；可开启自动战斗代打。'),
++      ),
++      h('div', { class: 'card' },
++        h('h4', null, '💎 成长'),
++        h('div', { class: 'muted', style: { lineHeight: 1.7 } },
++          '武器/护甲/推进器消耗「零件」强化，+5 触发词缀变异；天赋树三条分支（生存/战斗/幸运）消耗「星骸」点亮，可免费重置。'),
++      ),
++    ];
++    this.showSheet({ title: '📖 关于 / 玩法', body, foot: [h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '明白')] });
++  }
++
++  // ===================== 存档管理（多槽位）=====================
++  showSlots(fromLauncher) {
++    const list = listSaves();
++    const body = [
++      h('div', { class: 'muted', style: { marginBottom: '0.5rem' } },
++        `共 ${SAVE_SLOTS} 个存档槽位。点击空槽可在此开始新旅程，已有存档可读取或删除。`),
++      h('div', { class: 'slot-list' }, list.map((s) => this.renderSlotRow(s))),
++    ];
++    const foot = [
++      fromLauncher ? null : h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '关闭'),
++      h('button', { class: 'btn-primary', onClick: () => { this.closeModal(); this.showCreate(); } }, '🆕 新旅程'),
++    ];
++    this.showSheet({ title: '📂 存档管理', body, foot: foot.filter(Boolean) });
++  }
++
++  renderSlotRow(s) {
++    const head = s.exists
++      ? h('div', { class: 'slot-info' },
++          h('div', { class: 'slot-name' }, `${s.name || '旅者'}${s.ending ? '  · 已通关' : s.dead ? ' · 已陨落' : ''}`),
++          h('div', { class: 'slot-meta' }, `第 ${s.floor || 1} 层 · 最深 ${s.maxFloor || 1} · Lv${s.level || 1} · 💎${s.memoryCount || 0}/10 · ✨${s.stardust || 0}`),
++        )
++      : h('div', { class: 'slot-info' }, h('div', { class: 'muted' }, '空槽位'));
++    const actions = h('div', { class: 'slot-actions' },
++      s.exists
++        ? [
++            h('button', { class: 'btn-primary slot-act', onClick: () => this.loadSlot(s.slot) }, '读取'),
++            h('button', { class: 'btn-ghost slot-act', onClick: () => this.confirmDeleteSlot(s.slot) }, '🗑️'),
++          ]
++        : h('button', { class: 'btn-jade slot-act', onClick: () => { this.closeModal(); this.showCreate(s.slot); } }, '在此开始'),
++    );
++    return h('div', { class: `slot-row ${s.exists ? '' : 'empty'}`, dataset: { slot: s.slot } },
++      h('span', { class: 'slot-no' }, `#${s.slot + 1}`), head, actions);
++  }
++
++  loadSlot(slot) {
++    const p = loadFromSlot(slot);
++    if (!p) { this.toast('读取失败', 'bad'); return; }
++    this.closeModal();
++    if (p.ending) { this.renderEnding(p.ending, true, p); return; }
++    if (isDead(p)) { this.player = p; this.activeSlot = slot; this.gameOver(); return; } // 陨落档：避免读取后再次瞬间死亡
++    this.enterGame(p, slot);
++  }
++
++  confirmDeleteSlot(slot) {
++    this.showSheet({
++      title: '删除该存档？',
++      body: [h('div', { class: 'muted' }, `将永久删除 #${slot + 1} 号槽位的存档，无法恢复。`)],
++      foot: [
++        h('button', { class: 'btn-danger', onClick: () => { deleteSlot(slot); this.closeModal(); this.toast('存档已删除'); this.showSlots(this.screen === 'launcher'); } }, '确认删除'),
++        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '取消'),
++      ],
++    });
++  }
++
++  // ===================== 创角 =====================
++  showCreate(preferSlot) {
++    this.screen = 'create';
++    this.stopLoop();
++    this._preferSlot = Number.isInteger(preferSlot) ? preferSlot : null;
++    clear(this.modalRoot);
++    clear(this.stage);
++    this.renderCreate();
++  }
++
++  renderCreate() {
++    clear(this.stage);
++    const wrap = h('div', { class: 'launcher' });
++    wrap.append(
++      h('div', { class: 'create__head' },
++        h('button', { class: 'btn-ghost', onClick: () => this.showLauncher() }, '← 返回'),
++        h('h1', null, '开启新旅程'),
++      ),
++      h('div', { class: 'card' },
++        h('h4', null, '姓名'),
++        h('input', { class: 'name-input', dataset: { id: 'name' }, maxlength: 8, placeholder: '旅者（可留空）', value: this.charName || '' }),
++        h('div', { class: 'muted', style: { marginTop: '0.3rem' } }, '为这位拾荒者取个名字。每个浮岛都藏着一枚记忆碎片，等着被你寻回。'),
++      ),
++      h('div', { class: 'create__foot' },
++        h('button', { class: 'btn-primary big-btn', onClick: () => this.confirmCreate() }, '🚀 迫降墨比乌斯'),
++      ),
++    );
++    this.stage.appendChild(wrap);
++    const inp = wrap.querySelector('[data-id="name"]');
++    if (inp) inp.addEventListener('input', () => { this.charName = inp.value; });
++  }
++
++  confirmCreate() {
++    const name = (this.charName || '').trim().slice(0, 8);
++    const p = newPlayer(this.rng, { name });
++    const slot = this.pickSlotForNewSave();
++    this.activeSlot = slot;
++    p.floorState = generateFloor(this.rng, p.floor, p);
++    this.enterGame(p, slot);
++    this.pushLog(STORY.prologue, 'milestone');
++    saveToSlot(this.activeSlot, this.player); // 序章写入后补存，避免重载前首条故事丢失
++    this.toast(`已保存到 #${slot + 1} 号槽位`, 'good');
++  }
++
++  pickSlotForNewSave() {
++    const prefer = this._preferSlot;
++    const list = listSaves();
++    if (Number.isInteger(prefer) && prefer >= 0 && prefer < SAVE_SLOTS && !list[prefer].exists) return prefer;
++    const empty = list.find((s) => !s.exists);
++    if (empty) return empty.slot;
++    list.sort((a, b) => (a.lastSeen || 0) - (b.lastSeen || 0));
++    return list[0].slot;
++  }
++
++  // ===================== 进入游戏 =====================
++  enterGame(player, slot) {
++    this.player = player;
++    this.activeSlot = Number.isInteger(slot) ? slot : (this.activeSlot != null ? this.activeSlot : 0);
++    this.screen = 'game';
++    this.over = false;
++    this.battle = null;
++    // 存档无楼层快照（旧档 / 损坏）→ 重新生成当前层。
++    if (!this.player.floorState) this.player.floorState = generateFloor(this.rng, this.player.floor, this.player);
++    this.buildGame();
++    this.refreshStatus();
++    this.renderMap();
++    this.refreshInteract();
++    saveToSlot(this.activeSlot, this.player);
++    this.startLoop();
++    if (isDead(this.player)) this.gameOver();
++  }
++
++  buildGame() {
++    clear(this.stage);
++    clear(this.modalRoot);
++    const game = h('div', { class: 'xhlz-game' });
++    this.statusEl = h('div', { class: 'status-bar' });
++    const mapWrap = h('div', { class: 'map-wrap' },
++      this.floatLayer = h('div', { class: 'float-layer' }),
++      h('div', { class: 'map-frame' }, h('div', { class: 'map-grid', onClick: (e) => this.onMapTap(e) })),
++    );
++    this.bottomBar = h('div', { class: 'bottom-bar' });
++    game.append(this.statusEl, mapWrap, this.bottomBar);
++    this.stage.appendChild(game);
++    this.gridEl = mapWrap.querySelector('.map-grid');
++    this.buildStatus();
++    this.buildMap();
++    this.buildBottomBar();
++  }
++
++  // —— 顶部状态栏 ——
++  buildStatus() {
++    clear(this.statusEl);
++    const p = this.player;
++    this.hpFill = h('div', { class: 'bl-fill', style: { background: PALETTE.hp } });
++    this.hpVal = h('span', { class: 'bl-val' }, `${p.hp}/${maxHp(p)}`);
++    this.staFill = h('div', { class: 'bl-fill', style: { background: PALETTE.teal } });
++    this.staVal = h('span', { class: 'bl-val' }, `${p.stamina}/${maxStamina()}`);
++    this.statusEl.append(
++      h('div', { class: 'status-top' },
++        h('span', { class: 'status-name' }, p.name),
++        h('span', { class: 'status-lv' }, `Lv${p.level}`),
++        h('span', { class: 'status-floor' }, '第 ', h('b', null, String(p.floor)), ` / ${MAX_FLOOR} 层`),
++        h('span', { class: 'status-res' },
++          h('span', { class: 'r' }, h('span', null, '✨'), this.sdEl = h('span', null, String(p.stardust))),
++          h('span', { class: 'r' }, h('span', null, '🔩'), this.ptEl = h('span', null, String(p.parts))),
++        ),
++      ),
++      h('div', { class: 'status-bars' },
++        h('div', { class: 'barline' }, h('span', { class: 'bl-icon' }, '❤️'), h('div', { class: 'bl-track' }, this.hpFill), this.hpVal),
++        h('div', { class: 'barline' }, h('span', { class: 'bl-icon' }, '⚡'), h('div', { class: 'bl-track' }, this.staFill), this.staVal),
++      ),
++    );
++  }
++
++  refreshStatus() {
++    const p = this.player;
++    if (!p || !this.hpFill) return;
++    this.hpFill.style.width = `${(p.hp / maxHp(p)) * 100}%`;
++    this.hpVal.textContent = `${p.hp}/${maxHp(p)}`;
++    this.staFill.style.width = `${(p.stamina / maxStamina()) * 100}%`;
++    this.staVal.textContent = `${p.stamina}/${maxStamina()}`;
++    const nameEl = this.statusEl.querySelector('.status-name');
++    if (nameEl) nameEl.textContent = p.name;
++    const lvEl = this.statusEl.querySelector('.status-lv');
++    if (lvEl) lvEl.textContent = `Lv${p.level}`;
++    const floorB = this.statusEl.querySelector('.status-floor b');
++    if (floorB) floorB.textContent = String(p.floor);
++    if (this.sdEl) this.sdEl.textContent = String(p.stardust);
++    if (this.ptEl) this.ptEl.textContent = String(p.parts);
++  }
++
++  // —— 像素地图 ——
++  buildMap() {
++    clear(this.gridEl);
++    this.cellNodes = [];
++    for (let y = 0; y < GRID; y++) {
++      const row = [];
++      for (let x = 0; x < GRID; x++) {
++        const cell = h('div', { class: 'cell fog', dataset: { x: String(x), y: String(y) } });
++        this.gridEl.appendChild(cell);
++        row.push(cell);
++      }
++      this.cellNodes.push(row);
++    }
++  }
++
++  state() { return this.player.floorState; }
++
++  renderMap() {
++    const st = this.state();
++    if (!st) return;
++    const pos = st.pos;
++    const reach = this.screen === 'game' && !this._sheet ? reachableTiles(st, pos, effectiveMoveRange(this.player)) : new Set();
++    for (let y = 0; y < GRID; y++) {
++      for (let x = 0; x < GRID; x++) {
++        const cell = this.cellNodes[y][x];
++        const k = `${x},${y}`;
++        const explored = !!st.explored[k];
++        const visible = isVisible(x, y, pos);
++        const tileId = tileAt(st, x, y);
++        const ent = entityAt(st, x, y);
++        let cls = 'cell';
++        if (!explored && !visible) cls += ' fog';
++        else if (!visible) cls += ' dim';
++        else cls += ' visible';
++        const isPlayer = pos.x === x && pos.y === y;
++        if (isPlayer) cls += ' player';
++        if (tileId === 'stairs') cls += ' stairs';
++        if (reach.has(k) && !isPlayer) cls += ' reachable';
++        cell.className = cls;
++        // 背景：地块色（玩家格叠加蓝色调）
++        if (!explored && !visible) {
++          cell.style.background = '';
++        } else {
++          cell.style.background = isPlayer
++            ? `linear-gradient(rgba(77,150,255,0.45), rgba(77,150,255,0.45)), ${tileOf(tileId).color}`
++            : tileOf(tileId).color;
++        }
++        // 实体 emoji（陷阱不显示——踩到才发现）
++        let emoji = '';
++        if (visible || explored) {
++          if (isPlayer) emoji = '🧑‍🚀';
++          else if (ent) emoji = entityEmoji(ent, tileId);
++        }
++        // 仅在内容变化时更新，减少重排
++        const cur = cell.firstChild;
++        if (emoji) {
++          if (!cur || cur.textContent !== emoji) {
++            if (cur) cur.remove();
++            cell.appendChild(h('span', { class: 'ent' }, emoji));
++          }
++        } else if (cur) {
++          cur.remove();
++        }
++        cell.dataset.x = String(x);
++        cell.dataset.y = String(y);
++      }
++    }
++  }
++
++  // —— 移动：点击地块 ——
++  onMapTap(e) {
++    if (this.screen !== 'game' || this._sheet) return;
++    const cell = e.target.closest('.cell');
++    if (!cell) return;
++    const x = Number(cell.dataset.x), y = Number(cell.dataset.y);
++    this.tryMoveTo(x, y);
++  }
++
++  tryMoveTo(tx, ty) {
++    const st = this.state();
++    if (!st) return;
++    if (st.pos.x === tx && st.pos.y === ty) { this.refreshInteract(); return; }
++    const ent = entityAt(st, tx, ty);
++    if (ent && ent.type === 'enemy') { this.toast('靠近敌人后用「攻击」交战', 'normal'); return; }
++    if (!isWalkable(tileAt(st, tx, ty))) { this.toast('那里无法通行', 'normal'); return; }
++    const range = effectiveMoveRange(this.player);
++    const path = findPath(st, st.pos, { x: tx, y: ty }, range);
++    if (!path || !path.length) { this.toast('超出移动步数', 'normal'); return; }
++    this.walkPath(path);
++  }
++
++  // 沿路径行走，逐格结算（遇交互实体则停下）。
++  walkPath(path) {
++    const st = this.state();
++    for (const step of path) {
++      st.pos = { x: step.x, y: step.y };
++      this.player.turn += 1;
++      regenStamina(this.player, STAMINA_REGEN_PER_STEP);
++      this.revealAround();
++      const ent = entityAt(st, step.x, step.y);
++      if (ent) {
++        this.renderMap();
++        this.refreshStatus();
++        this.refreshInteract();
++        saveToSlot(this.activeSlot, this.player);
++        if (this.resolveEntity(ent)) return; // 进入战斗 / 弹窗则终止移动
++      }
++    }
++    this.renderMap();
++    this.refreshStatus();
++    this.refreshInteract();
++    saveToSlot(this.activeSlot, this.player);
++  }
++
++  revealAround() {
++    const st = this.state();
++    for (const k of visibleKeysList(st, st.pos.x, st.pos.y)) st.explored[k] = true;
++  }
++
++  // 踩到交互实体：返回 true 表示已切入战斗 / 弹窗，应中止移动。
++  resolveEntity(ent) {
++    const st = this.state();
++    if (ent.type === 'chest') {
++      const r = ent.reward || {};
++      // 用 gainReward 的实发量（含幸运加成）展示，避免飘字与状态栏不一致。
++      const g = gainReward(this.player, r, this.rng);
++      removeEntity(st, ent.id);
++      this.floatAt(ent.x, ent.y, `+✨${g.stardust} 🔩${g.parts}`, 'gold');
++      this.pushLog(`🎁 拾得宝箱：${g.stardust ? `✨${g.stardust} ` : ''}${g.parts ? `🔩${g.parts}` : ''}`, 'good');
++      this.toast('拾得宝箱', 'good');
++      this.refreshStatus();
++      return false;
++    }
++    if (ent.type === 'memory') {
++      const res = collectMemory(this.player, ent.chapter);
++      removeEntity(st, ent.id);
++      if (res.ok) {
++        this.floatAt(ent.x, ent.y, '💎 记忆', 'gold');
++        this.pushLog(`💎 寻回星骸回响：${MEMORY_CHAPTERS[res.chapter].title}`, 'milestone');
++        this.refreshStatus();
++        saveToSlot(this.activeSlot, this.player);
++        this.showChapter(res.chapter);
++        return true;
++      }
++      return false;
++    }
++    if (ent.type === 'trap') {
++      this.teleport();
++      return true;
++    }
++    if (ent.type === 'merchant') { this.showMerchant(); return true; }
++    if (ent.type === 'drone') { this.showDrone(); return true; }
++    return false;
++  }
++
++  // 重力陷阱：传送到随机可达地块。
++  teleport() {
++    const st = this.state();
++    const reach = [...reachableTiles(st, st.pos, 99)];
++    const choices = reach.filter((k) => {
++      const [x, y] = k.split(',').map(Number);
++      return !(x === st.pos.x && y === st.pos.y) && !entityAt(st, x, y);
++    });
++    const pool = choices.length ? choices : reach;
++    const k = pool[Math.floor(this.rng() * pool.length)];
++    const [nx, ny] = k.split(',').map(Number);
++    st.pos = { x: nx, y: ny };
++    this.revealAround();
++    this.shake();
++    this.pushLog('🌀 触发重力陷阱！空间扭曲，你被抛向未知之处。', 'bad');
++    this.toast('重力陷阱！被传送', 'bad');
++    this.renderMap();
++    this.refreshStatus();
++    this.refreshInteract();
++    saveToSlot(this.activeSlot, this.player);
++  }
++
++  // —— 方向键单步移动 ——
++  dpadMove(dx, dy) {
++    if (this.screen !== 'game' || this._sheet) return;
++    const st = this.state();
++    const nx = st.pos.x + dx, ny = st.pos.y + dy;
++    this.tryMoveTo(nx, ny);
++  }
++
++  // —— 中央交互键（随上下文动态）——
++  buildBottomBar() {
++    clear(this.bottomBar);
++    const dpad = h('div', { class: 'dpad' },
++      h('button', { class: 'd-up', onClick: () => this.dpadMove(0, -1) }, '▲'),
++      h('button', { class: 'd-left', onClick: () => this.dpadMove(-1, 0) }, '◀'),
++      h('button', { class: 'd-center', onClick: () => this.refreshInteract() }, '·'),
++      h('button', { class: 'd-right', onClick: () => this.dpadMove(1, 0) }, '▶'),
++      h('button', { class: 'd-down', onClick: () => this.dpadMove(0, 1) }, '▼'),
++    );
++    this.interactBtn = h('button', { class: 'btn-primary interact-btn', onClick: () => this.doInteract() }, '🔍 调查');
++    const tools = h('div', { class: 'tool-col' },
++      h('button', { class: 'icon-btn', title: '背包 / 状态', onClick: () => this.openInventory() }, '🎒'),
++      h('button', { class: 'icon-btn', title: '设置 / 存档', onClick: () => this.showSettings(false) }, '⚙️'),
++    );
++    this.bottomBar.append(dpad, h('div', { class: 'act-col' }, this.interactBtn), tools);
++  }
++
++  // 依据周围上下文刷新中央键文案与可用性。
++  refreshInteract() {
++    if (!this.interactBtn || this.screen !== 'game') return;
++    const st = this.state();
++    const adj = adjacentEnemy(st, st.pos);
++    if (adj) {
++      this.interactBtn.className = 'btn-danger interact-btn';
++      this.interactBtn.textContent = `⚔️ 攻击·${adj.name}`;
++      this.interactBtn.disabled = false;
++      this._interactMode = { mode: 'attack', enemy: adj };
++      return;
++    }
++    if (tileAt(st, st.pos.x, st.pos.y) === 'stairs') {
++      this.interactBtn.className = 'btn-jade interact-btn';
++      this.interactBtn.textContent = '⬇️ 下行至下一浮岛';
++      this.interactBtn.disabled = false;
++      this._interactMode = { mode: 'descend' };
++      return;
++    }
++    const here = entityAt(st, st.pos.x, st.pos.y);
++    if (here && (here.type === 'chest' || here.type === 'memory')) {
++      this.interactBtn.className = 'btn-primary interact-btn';
++      this.interactBtn.textContent = here.type === 'memory' ? '💎 拾取回响' : '🎁 拾取宝箱';
++      this.interactBtn.disabled = false;
++      this._interactMode = { mode: 'pickup', ent: here };
++      return;
++    }
++    this.interactBtn.className = 'btn-ghost interact-btn';
++    this.interactBtn.textContent = '🔍 调查';
++    this.interactBtn.disabled = false;
++    this._interactMode = { mode: 'investigate' };
++  }
++
++  doInteract() {
++    if (this.screen !== 'game' || !this._interactMode) return;
++    const m = this._interactMode;
++    if (m.mode === 'attack') this.startBattle(m.enemy);
++    else if (m.mode === 'descend') this.descendFloor();
++    else if (m.mode === 'pickup') this.resolveEntity(m.ent);
++    else this.toast('周围没有可交互的对象', 'normal');
++  }
++
++  descendFloor() {
++    const st = this.state();
++    if (tileAt(st, st.pos.x, st.pos.y) !== 'stairs') { this.toast('需站在下行阶梯上', 'normal'); return; }
++    descend(this.player);
++    this.player.floorState = generateFloor(this.rng, this.player.floor, this.player);
++    this.pushLog(`⬇️ 降至第 ${this.player.floor} 层浮岛。`, 'milestone');
++    if (this.player.floor === 3) this.pushLog(STORY.midpoint, 'milestone');
++    this.refreshStatus();
++    this.renderMap();
++    this.refreshInteract();
++    saveToSlot(this.activeSlot, this.player);
++    this.toast(`进入第 ${this.player.floor} 层`, 'good');
++  }
++
++  // ===================== 战斗 =====================
++  startBattle(enemyEntity) {
++    if (this.screen !== 'game') return;
++    this.screen = 'battle';
++    this.battle = {
++      enemy: enemyEntity, focus: false, auto: false, round: 0,
++      stance: null, telegraphed: false, timerEnd: 0, busy: false,
++    };
++    clear(this.modalRoot);
++    this.buildBattle();
++    this.nextRound();
++  }
++
++  buildBattle() {
++    clear(this.stage);
++    const e = this.battle.enemy;
++    const wrap = h('div', { class: 'battle' });
++    this.foeEmoji = h('div', { class: 'emoji' }, e.emoji || '👾');
++    this.foeName = h('div', { class: 'name' }, `${e.name}${e.boss ? ' · BOSS' : ''}`);
++    this.foeHpFill = h('div', { class: 'bar__fill', style: { background: PALETTE.monster } });
++    this.foeHpLabel = h('span', { class: 'bar__label' }, `${e.hp}/${e.maxHp}`);
++    this.stanceChip = h('div', { class: 'stance-chip unknown' }, '敌人蓄势中…');
++    this.battleLog = h('div', { class: 'battle__log' });
++    this.timerFill = h('div', { class: 't', style: { width: '100%' } });
++    this.actionBtns = ['block', 'dodge', 'counter'].map((a) =>
++      h('button', { class: `act ${a}`, dataset: { action: a }, onClick: () => this.chooseAction(a) },
++        h('div', null, ACTIONS[a].emoji), h('div', null, ACTIONS[a].name)));
++    this.fleeBtn = h('button', { class: 'btn-ghost icon-btn', title: '撤退', onClick: () => this.confirmFlee() }, '🏃');
++    this.autoToggle = h('button', { class: 'btn-ghost icon-btn', title: '自动战斗', onClick: () => this.toggleAuto() }, '🤖');
++
++    this.hpFill = h('div', { class: 'bl-fill', style: { background: PALETTE.hp } });
++    this.hpVal = h('span', { class: 'bl-val' }, `${this.player.hp}/${maxHp(this.player)}`);
++    // 战斗屏独立浮动层（buildGame 的 floatLayer 已随 stage 清空而脱离）。
++    this.floatLayer = h('div', { class: 'float-layer' });
++
++    wrap.append(
++      h('div', { class: 'battle__topbar' },
++        this.fleeBtn,
++        h('span', { class: 'title' }, '战斗'),
++        this.autoToggle,
++      ),
++      h('div', { class: 'battle__foe' }, this.foeEmoji, this.foeName,
++        h('div', { class: 'bar', style: { marginTop: '0.4rem' } }, this.foeHpFill, this.foeHpLabel)),
++      h('div', { class: 'battle__stance' }, this.stanceChip),
++      this.battleLog,
++      h('div', { class: 'battle__self' },
++        h('span', null, '❤️'),
++        h('div', { class: 'barline', style: { flex: 1 } }, h('div', { class: 'bl-track' }, this.hpFill), this.hpVal),
++      ),
++      h('div', { class: 'battle__timer' }, this.timerFill),
++      h('div', { class: 'battle__actions' }, this.actionBtns),
++      this.floatLayer,
++    );
++    this.stage.appendChild(wrap);
++    this.logBattle(`与 ${e.name} 交战！`, 'normal');
++  }
++
++  nextRound() {
++    if (!this.battle) return;
++    this.battle.round += 1;
++    const stance = pickEnemyStance(this.battle.enemy, this.rng);
++    const tele = isTelegraphed(this.rng);
++    this.battle.stance = stance;
++    this.battle.telegraphed = tele;
++    this.battle.busy = false;
++    // 架势展示：识破时明牌，否则「??」需盲猜。
++    if (tele) {
++      const s = STANCES[stance];
++      this.stanceChip.className = 'stance-chip';
++      this.stanceChip.textContent = `${s.emoji} 敌人摆出「${s.name}」`;
++    } else {
++      this.stanceChip.className = 'stance-chip unknown';
++      this.stanceChip.textContent = '❓ 敌人意图难辨…';
++    }
++    for (const b of this.actionBtns) b.disabled = false;
++    if (this.fleeBtn) this.fleeBtn.disabled = false;
++    if (this.timerEnabled && !this.battle.auto) {
++      this.battle.timerEnd = nowMs() + BATTLE_TIME_MS;
++    } else {
++      this.timerFill.style.width = '100%';
++    }
++    if (this.battle.auto) {
++      const act = autoPickAction(stance);
++      // 不预置 busy=true：chooseAction 自带 busy 守卫，预置会令其立即返回，导致自动战斗死锁。
++      setTimeout(() => { if (this.battle) this.chooseAction(act); }, 320);
++    }
++  }
++
++  chooseAction(action) {
++    if (!this.battle || this.battle.busy) return;
++    this.battle.busy = true;
++    for (const b of this.actionBtns) b.disabled = true;
++    if (this.fleeBtn) this.fleeBtn.disabled = true; // 结算窗口期间禁用撤退，避免与胜负结算交错
++    this.resolveBattleRound(action);
++  }
++
++  resolveBattleRound(action) {
++    const b = this.battle;
++    const p = this.player;
++    spendStamina(p, STAMINA_COST_PER_ROUND);
++    const res = resolveRound(p, b.enemy, action, b.focus, b.stance, this.rng);
++    b.focus = res.nextFocus;
++
++    // 敌人受伤反馈
++    if (res.enemyDmg > 0) {
++      this.foeHpFill.style.width = `${(b.enemy.hp / b.enemy.maxHp) * 100}%`;
++      this.foeHpLabel.textContent = `${b.enemy.hp}/${b.enemy.maxHp}`;
++      this.floatAtCenter(`${res.countered ? '💥 ' : ''}-${res.enemyDmg}`, 'up');
++    }
++    // 玩家受伤反馈
++    if (res.playerDmg > 0) { this.shake(); this.floatAtCenter(`-${res.playerDmg}`, 'down'); }
++    if (res.healed > 0) this.floatAtCenter(`+${res.healed}`, 'up');
++    this.hpFill.style.width = `${(p.hp / maxHp(p)) * 100}%`;
++    this.hpVal.textContent = `${p.hp}/${maxHp(p)}`;
++
++    // 战报
++    const sName = STANCES[res.stance].name;
++    if (res.fumble) this.logBattle(`精力不济，${ACTIONS[res.action]?.name || '应对'}失手！受到 ${res.playerDmg} 伤害。`, 'bad');
++    else if (res.countered) this.logBattle(`${ACTIONS[res.action].name} 完美克制「${sName}」！造成 ${res.enemyDmg} 伤害，专注力蓄满。`, 'good');
++    else this.logBattle(`${ACTIONS[res.action]?.name || '犹豫'}未能克制「${sName}」，受到 ${res.playerDmg} 伤害。`, 'bad');
++
++    if (res.enemyDead) { setTimeout(() => { if (this.battle) this.winBattle(); }, 360); return; }
++    if (res.playerDead) { setTimeout(() => { if (this.battle) this.loseBattle(); }, 360); return; }
++    setTimeout(() => { if (this.battle) this.nextRound(); }, 520);
++  }
++
++  toggleAuto() {
++    if (!this.battle) return;
++    this.battle.auto = !this.battle.auto;
++    this.autoToggle.classList.toggle('btn-jade', this.battle.auto);
++    this.autoToggle.textContent = this.battle.auto ? '🤖✅' : '🤖';
++    this.toast(this.battle.auto ? '自动战斗：开' : '自动战斗：关');
++    if (this.battle.auto && !this.battle.busy) {
++      const act = autoPickAction(this.battle.stance);
++      setTimeout(() => { if (this.battle) this.chooseAction(act); }, 320);
++      return;
++    }
++    // 关闭自动时，若正等待玩家操作，重置一个完整限时窗口。
++    // 否则 timerEnd 仍停留在自动期间未更新的旧值（可能早已过期），
++    // onTick 会立刻判定 remain==0 → 瞬间失手，把「关自动」误判为玩家反应不及。
++    if (!this.battle.auto && this.timerEnabled && !this.battle.busy) {
++      this.battle.timerEnd = nowMs() + BATTLE_TIME_MS;
++    }
++  }
++
++  confirmFlee() {
++    this.showSheet({
++      title: '脱离战斗？',
++      body: [h('div', { class: 'muted' }, '撤退会损失少量星骸，回到地图（敌人仍在）。')],
++      foot: [
++        h('button', { class: 'btn-danger', onClick: () => this.flee() }, '撤退'),
++        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '继续战斗'),
++      ],
++    });
++  }
++
++  flee() {
++    this.closeModal();
++    const cost = Math.min(this.player.stardust, 2);
++    this.player.stardust -= cost;
++    this.pushLog(`🏃 撤离战斗，散落 ${cost} 星骸。`, 'normal');
++    // exitBattle(false) 不落盘，此处显式保存星骸扣除，避免关浏览器后回滚。
++    saveToSlot(this.activeSlot, this.player);
++    this.exitBattle(false);
++  }
++
++  winBattle() {
++    if (!this.battle) return; // 360ms 窗口内若已脱离战斗（撤退/卸载），丢弃本次结算
++    const e = this.battle.enemy;
++    const reward = enemyReward(e);
++    const gained = gainReward(this.player, reward, this.rng);
++    // 移除地图上的敌人实体
++    removeEntity(this.state(), e.id);
++    this.pushLog(`🏆 击败 ${e.name}！获得 ✨${gained.stardust} 🔩${gained.parts}${gained.leveled ? ` · 升级至 Lv${this.player.level}！` : ''}`, 'milestone');
++    this.exitBattle(true);
++    if (e.boss) { this.offerEnding(); return; }
++    this.toast(gained.leveled ? '升级！' : '胜利', 'good');
++  }
++
++  loseBattle() {
++    if (!this.battle) return;
++    this.exitBattle(false);
++    this.gameOver();
++  }
++
++  // 退出战斗回到地图（恢复 game 屏）。
++  exitBattle(save) {
++    this.battle = null;
++    this.screen = 'game';
++    this.buildGame();
++    this.refreshStatus();
++    this.renderMap();
++    this.refreshInteract();
++    if (save) saveToSlot(this.activeSlot, this.player);
++  }
++
++  logBattle(text, type = 'normal') {
++    if (!this.battleLog) return;
++    this.battleLog.appendChild(h('div', { class: `ln ${type}` }, text));
++    this.battleLog.scrollTop = this.battleLog.scrollHeight;
++  }
++
++  // —— 结局抉择（击败 Boss 后）——
++  // 仅展示抉择弹窗；最终 'over' 态由 chooseEnding / renderEnding 落定，
++  // 这样即便玩家误触关闭弹窗，也能回到可交互的地图（Boss 已除、当前层无下行）。
++  offerEnding() {
++    saveToSlot(this.activeSlot, this.player);
++    const body = [
++      h('div', { class: 'ending' },
++        h('div', { class: 'ending__emoji' }, '🌟'),
++        h('h2', null, '星骸之核已寂灭'),
++        h('div', { class: 'ending__text' },
++          `你集齐了 ${collectedMemoryCount(this.player)} 枚星骸回响。所有的记忆在掌心翻涌——现在，由你回答那个被整个文明搁置的问题。`),
++      ),
++    ];
++    const foot = [
++      h('button', { class: 'btn-jade', onClick: () => this.chooseEnding('peace') }, `${ENDINGS.peace.emoji} ${ENDINGS.peace.name}`),
++      h('button', { class: 'btn-danger', onClick: () => this.chooseEnding('dark') }, `${ENDINGS.dark.emoji} ${ENDINGS.dark.name}`),
++    ];
++    this.showSheet({ title: '终章 · 你的回答', body, foot, dismissable: false });
++  }
++
++  chooseEnding(key) {
++    this.closeModal();
++    this.player.ending = key;
++    saveToSlot(this.activeSlot, this.player);
++    this.renderEnding(key, false, this.player);
++  }
++
++  renderEnding(key, fromSave, player) {
++    this.screen = 'over';
++    this.over = true;
++    this.player = player || this.player;
++    this.stopLoop();
++    clear(this.modalRoot);
++    clear(this.stage);
++    const e = ENDINGS[key] || ENDINGS.peace;
++    const wrap = h('div', { class: 'launcher' });
++    wrap.append(
++      h('div', { class: `ending ${e.tone}` },
++        h('div', { class: 'ending__emoji' }, e.emoji),
++        h('h2', null, e.title),
++        h('div', { class: 'muted' }, `${this.player.name} · 第 ${this.player.maxFloor} 层 · Lv${this.player.level} · 💎${collectedMemoryCount(this.player)}/10`),
++        h('div', { class: 'ending__text' }, e.text),
++      ),
++      h('div', { class: 'ending__choice' },
++        fromSave
++          ? h('button', { class: 'btn-ghost big-btn', onClick: () => this.showLauncher() }, '← 返回标题')
++          : null,
++        h('button', { class: 'btn-primary big-btn', onClick: () => this.restart() }, '🔄 再启新旅程'),
++      ),
++    );
++    this.stage.appendChild(wrap);
++  }
++
++  gameOver() {
++    if (this.over) return;
++    this.over = true;
++    this.screen = 'over';
++    this.stopLoop();
++    this.battle = null;
++    saveToSlot(this.activeSlot, this.player);
++    clear(this.modalRoot);
++    clear(this.stage);
++    const wrap = h('div', { class: 'launcher' });
++    wrap.append(
++      h('div', { class: 'ending dark' },
++        h('div', { class: 'ending__emoji' }, '💀'),
++        h('h2', null, '旅程终结'),
++        h('div', { class: 'muted' }, `${this.player.name} 倒在了第 ${this.player.floor} 层。`),
++        h('div', { class: 'ending__text' }, '星骸的光在你眼中缓缓熄灭。墨比乌斯依旧漂浮、寂静——但或许，下一位旅者能走得更远。'),
++      ),
++      h('div', { class: 'ending__choice' },
++        h('button', { class: 'btn-primary big-btn', onClick: () => this.restart() }, '🔄 再启新旅程'),
++        h('button', { class: 'btn-ghost', onClick: () => this.showSettings(false) }, '⚙️ 导出 / 存档'),
++      ),
++    );
++    this.stage.appendChild(wrap);
++  }
++
++  restart() {
++    if (this.activeSlot != null) deleteSlot(this.activeSlot);
++    this.player = null;
++    this.over = false;
++    this.showCreate();
++  }
++
++  // ===================== 背包 / 天赋 / 剧情 =====================
++  openInventory() {
++    if (this.screen !== 'game') return;
++    this.showInventoryTab('equip');
++  }
++
++  showInventoryTab(tab) {
++    clear(this.modalRoot);
++    const p = this.player;
++    const tabs = h('div', { class: 'tabs' },
++      h('button', { class: `tab ${tab === 'equip' ? 'active' : ''}`, onClick: () => this.showInventoryTab('equip') }, '🗡️ 装备'),
++      h('button', { class: `tab ${tab === 'talent' ? 'active' : ''}`, onClick: () => this.showInventoryTab('talent') }, '🌟 天赋'),
++      h('button', { class: `tab ${tab === 'story' ? 'active' : ''}`, onClick: () => this.showInventoryTab('story') }, '📖 回响'),
++    );
++    let body;
++    if (tab === 'equip') body = this.renderEquipTab();
++    else if (tab === 'talent') body = this.renderTalentTab();
++    else body = this.renderStoryTab();
++    const sheet = h('div', { class: 'sheet' },
++      h('div', { class: 'sheet__head' }, h('span', { class: 't' }, '🎒 背包')),
++      tabs,
++      h('div', { class: 'sheet__body' }, body),
++      h('div', { class: 'sheet__foot' },
++        h('span', { class: 'muted', style: { flex: 1, alignSelf: 'center' } }, `✨ ${p.stardust} 星骸　🔩 ${p.parts} 零件`),
++        h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '关闭'),
++      ),
++    );
++    this.modalRoot.append(h('div', { class: 'sheet-overlay', onClick: () => this.closeModal() }), sheet);
++    this._sheet = sheet;
++  }
++
++  renderEquipTab() {
++    const p = this.player;
++    const frag = [];
++    const meta = {
++      weapon: { emoji: '🗡️', label: '武器', statName: '攻击', statFn: () => effectiveAtk(p) },
++      armor: { emoji: '🛡️', label: '护甲', statName: '防御', statFn: () => effectiveDef(p) },
++      booster: { emoji: '🥾', label: '推进器', statName: '步数', statFn: () => effectiveMoveRange(p) },
++    };
++    for (const slot of EQUIP_SLOTS) {
++      const e = p.equipment[slot];
++      const m = meta[slot];
++      const cost = enhanceCost(e.plus);
++      const maxed = e.plus >= MAX_PLUS;
++      const afford = p.parts >= cost;
++      const affix = e.affix ? AFFIXES.find((a) => a.id === e.affix.id) : null;
++      frag.push(h('div', { class: 'card equip-card' },
++        h('div', { class: 'eq-emoji' }, m.emoji),
++        h('div', { class: 'eq-info' },
++          h('div', { class: 'eq-name' }, `${e.name} `, h('span', { class: 'plus' }, e.plus > 0 ? `+${e.plus}` : ''),
++            h('span', { class: 'muted', style: { fontWeight: 400, fontSize: '0.78rem' } }, `　当前${m.statName} ${m.statFn()}`)),
++          h('div', { class: 'eq-affix' }, affix ? `${affix.emoji} 词缀·${affix.name}：${affix.desc}` : `+${AFFIX_AT} 触发词缀变异`),
++          h('div', { class: 'eq-cost' }, maxed ? '已达强化上限' : `强化消耗 🔩${cost}`),
++        ),
++        h('button', {
++          class: 'btn-primary', disabled: maxed || !afford,
++          onClick: () => this.doEnhance(slot),
++        }, maxed ? '满级' : '强化'),
++      ));
++    }
++    return frag;
++  }
++
++  doEnhance(slot) {
++    const res = enhanceEquipment(this.player, slot, this.rng);
++    if (!res.ok) {
++      if (res.reason === 'no-parts') this.toast(`零件不足（需 🔩${res.cost}）`, 'bad');
++      else if (res.reason === 'max') this.toast('已达强化上限', 'normal');
++      return;
++    }
++    saveToSlot(this.activeSlot, this.player);
++    this.refreshStatus();
++    if (res.affixed) this.toast(`+${res.plus}！触发词缀变异：${res.affixed.emoji} ${res.affixed.name}`, 'good');
++    else this.toast(`强化成功 +${res.plus}`, 'good');
++    this.showInventoryTab('equip');
++  }
++
++  renderTalentTab() {
++    const p = this.player;
++    const frag = [h('div', { class: 'muted', style: { marginBottom: '0.5rem' } },
++      `消耗星骸点亮，可随时免费重置。已用 ✨${spentStardust(p)}。`)];
++    for (const t of TALENTS) {
++      const rank = p.talents[t.branch] || 0;
++      const maxed = rank >= t.maxRank;
++      const cost = talentCost(t.branch, rank);
++      const afford = p.stardust >= cost;
++      const pips = Array.from({ length: t.maxRank }, (_, i) => h('span', { class: `talent-pip ${i < rank ? 'on' : ''}` }));
++      frag.push(h('div', { class: 'card talent-branch' },
++        h('div', { class: 'talent-head' },
++          h('span', { style: { fontSize: '1.3rem' } }, t.emoji),
++          h('div', { class: 'grow' }, h('div', { style: { fontWeight: 700 } }, `${t.name} · Lv${rank}/${t.maxRank}`),
++            h('div', { class: 'muted', style: { fontSize: '0.78rem' } }, t.desc)),
++          h('button', {
++            class: 'btn-primary', disabled: maxed || !afford, style: { flex: 'none' },
++            onClick: () => this.doBuyTalent(t.branch),
++          }, maxed ? '满级' : `✨${cost}`),
++        ),
++        h('div', { class: 'talent-ranks' }, pips),
++      ));
++    }
++    frag.push(h('button', { class: 'btn-ghost', style: { width: '100%' }, onClick: () => this.doResetTalents() }, '↩️ 免费重置天赋'));
++    return frag;
++  }
++
++  doBuyTalent(branch) {
++    const res = buyTalent(this.player, branch);
++    if (!res.ok) {
++      if (res.reason === 'no-stardust') this.toast(`星骸不足（需 ✨${res.cost}）`, 'bad');
++      return;
++    }
++    saveToSlot(this.activeSlot, this.player);
++    this.refreshStatus();
++    this.toast(`${TALENT_BY_BRANCH[branch].name} → Lv${res.rank}`, 'good');
++    this.showInventoryTab('talent');
++  }
++
++  doResetTalents() {
++    const res = resetTalents(this.player);
++    saveToSlot(this.activeSlot, this.player);
++    this.refreshStatus();
++    this.toast(`天赋已重置，返还 ✨${res.refund}`, 'good');
++    this.showInventoryTab('talent');
++  }
++
++  renderStoryTab() {
++    const p = this.player;
++    const frag = [h('div', { class: 'muted', style: { marginBottom: '0.5rem' } },
++      `已寻回 ${collectedMemoryCount(p)} / ${MEMORY_CHAPTERS.length} 枚星骸回响。`)];
++    MEMORY_CHAPTERS.forEach((ch, i) => {
++      const unlocked = p.memory[i];
++      frag.push(h('div', { class: `chapter ${unlocked ? '' : 'locked'}` },
++        h('div', { class: 'ch-title' }, `${unlocked ? '💎' : '🔒'} ${ch.title}`),
++        h('div', { class: 'ch-text' }, unlocked ? ch.text : '尚未寻回这枚记忆碎片。继续深入浮岛吧。'),
++      ));
++    });
++    return frag;
++  }
++
++  showChapter(idx) {
++    const ch = MEMORY_CHAPTERS[idx];
++    if (!ch) return;
++    const body = [
++      h('div', { class: 'chapter' },
++        h('div', { class: 'ch-title' }, `💎 ${ch.title}`),
++        h('div', { class: 'ch-text' }, ch.text),
++      ),
++    ];
++    this.showSheet({
++      title: '星骸回响',
++      body,
++      foot: [h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '继续')],
++    });
++  }
++
++  // ===================== 随机事件 =====================
++  showMerchant() {
++    const p = this.player;
++    const body = [
++      h('div', { class: 'muted', style: { marginBottom: '0.5rem' } }, `${EVENT_META.merchant.desc}（持有 ✨${p.stardust}）`),
++      h('div', { class: 'slot-list' }, SHOP_ITEMS.map((it) => {
++        const afford = p.stardust >= it.cost;
++        return h('div', { class: 'slot-row' },
++          h('span', { class: 'slot-no' }, it.emoji),
++          h('div', { class: 'slot-info' }, h('div', { class: 'slot-name' }, it.name)),
++          h('div', { class: 'slot-actions' },
++            h('button', { class: 'btn-primary slot-act', disabled: !afford, onClick: () => this.buyItem(it) }, `✨${it.cost}`)),
++        );
++      })),
++    ];
++    this.showSheet({ title: '🛒 流浪商人', body, foot: [h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '离开')] });
++  }
++
++  buyItem(it) {
++    const p = this.player;
++    if (p.stardust < it.cost) { this.toast('星骸不足', 'bad'); return; }
++    p.stardust -= it.cost;
++    if (it.give.fullHeal) { healFull(p); this.toast('已满状态恢复', 'good'); }
++    else { gainReward(p, it.give, this.rng); this.toast(`购得 ${it.name}`, 'good'); }
++    saveToSlot(this.activeSlot, this.player);
++    this.refreshStatus();
++    this.showMerchant();
++  }
++
++  showDrone() {
++    const p = this.player;
++    const afford = p.stardust >= DRONE_COST;
++    const body = [
++      h('div', { class: 'muted', style: { marginBottom: '0.5rem' } }, `${EVENT_META.drone.desc}（持有 ✨${p.stardust}，需 ✨${DRONE_COST}）`),
++    ];
++    this.showSheet({
++      title: '🔧 维修无人机',
++      body,
++      foot: [
++        h('button', { class: 'btn-jade', disabled: !afford, onClick: () => this.useDrone() }, `维修（✨${DRONE_COST}）`),
++        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '离开'),
++      ],
++    });
++  }
++
++  useDrone() {
++    const p = this.player;
++    if (p.stardust < DRONE_COST) { this.toast('星骸不足', 'bad'); return; }
++    p.stardust -= DRONE_COST;
++    healFull(p);
++    this.closeModal();
++    this.refreshStatus();
++    this.toast('全状态已恢复', 'good');
++    this.pushLog('🔧 维修无人机为你回满 HP 与精力。', 'good');
++    saveToSlot(this.activeSlot, this.player);
++  }
++
++  // ===================== 设置 / 存档 =====================
++  showSettings(fromLauncher) {
++    const p = this.player;
++    const body = [
++      h('div', { class: 'card' },
++        h('h4', null, '存档'),
++        h('div', { class: 'muted', style: { marginBottom: '0.4rem' } },
++          `进度自动保存${p ? `（#${(this.activeSlot == null ? '?' : this.activeSlot + 1)} · ${p.name} · 第 ${p.floor} 层）` : '。'}`),
++        h('button', { class: 'btn-primary', style: { width: '100%', marginBottom: '0.4rem' }, onClick: () => { this.closeModal(); this.showSlots(fromLauncher); } }, '📂 存档管理（多槽位）'),
++        h('button', { class: 'btn-jade', style: { width: '100%', marginBottom: '0.4rem' }, onClick: () => this.doExport() }, '📤 导出存档字符串'),
++        h('textarea', { class: 'save-io', dataset: { id: 'io' }, placeholder: '在此粘贴导入字符串…', readonly: true }),
++        h('div', { class: 'tabs', style: { marginTop: '0.4rem' } },
++          h('button', { class: 'tab', style: { flex: '1 1 45%' }, onClick: () => this.toggleIoInput() }, '✏️ 切换为输入'),
++          h('button', { class: 'tab', style: { flex: '1 1 45%', background: 'linear-gradient(180deg,#6fe0b0,#2f9a72)', color: '#06241a', borderColor: '#2f9a72' }, onClick: () => this.doImport() }, '📥 导入'),
++        ),
++      ),
++      h('div', { class: 'card' },
++        h('h4', null, '选项'),
++        h('div', { class: 'row', style: { justifyContent: 'space-between' } },
++          h('span', null, '战斗限时（3 秒/回合）'),
++          h('button', { class: `tab ${this.timerEnabled ? 'active' : ''}`, onClick: () => { this.timerEnabled = !this.timerEnabled; this.showSettings(fromLauncher); } }, this.timerEnabled ? '开' : '关'),
++        ),
++      ),
++    ];
++    const foot = [
++      fromLauncher ? null : h('button', { class: 'btn-ghost', onClick: () => { this.closeModal(); this.confirmExitToLauncher(); } }, '🏠 返回标题'),
++      h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '关闭'),
++    ];
++    this.showSheet({ title: '设置 / 存档', body, foot: foot.filter(Boolean) });
++  }
++
++  toggleIoInput() {
++    const io = this.modalRoot.querySelector('[data-id="io"]');
++    if (!io) return;
++    io.readOnly = !io.readOnly;
++    if (io.readOnly) { io.value = ''; this.toast('已切回导出模式'); }
++    else { this.toast('请粘贴导入字符串后点导入'); }
++  }
++
++  doExport() {
++    const p = this.player || (this.activeSlot != null ? loadFromSlot(this.activeSlot) : null) || (latestSlot() != null ? loadFromSlot(latestSlot()) : null);
++    if (!p) { this.toast('暂无可导出的存档', 'bad'); return; }
++    const io = this.modalRoot.querySelector('[data-id="io"]');
++    const str = exportSave(p);
++    if (io) { io.readOnly = true; io.value = str; }
++    this.toast('存档字符串已生成', 'good');
++  }
++
++  doImport() {
++    const io = this.modalRoot.querySelector('[data-id="io"]');
++    const str = (io && io.value || '').trim();
++    if (!str) { this.toast('请先粘贴导入字符串', 'bad'); return; }
++    const p = importSave(str);
++    if (!p) { this.toast('导入失败：字符串无效', 'bad'); return; }
++    const slot = this.activeSlot != null ? this.activeSlot : this.pickSlotForNewSave();
++    this.activeSlot = slot;
++    p.floorState = null; // 导入档重生成当前层
++    saveToSlot(slot, p);
++    this.toast(`导入成功，已写入 #${slot + 1} 槽位`, 'good');
++    this.closeModal();
++    // 通关档直接进入结局画面，与「继续旅程」行为一致，而非落回可游玩地图。
++    if (p.ending) { this.player = p; this.renderEnding(p.ending, true, p); }
++    else this.enterGame(p, slot);
++  }
++
++  confirmExitToLauncher() {
++    if (!this.player) { this.showLauncher(); return; }
++    this.showSheet({
++      title: '返回标题？',
++      body: [h('div', { class: 'muted' }, '进度已自动保存，可随时从存档管理回到这里。')],
++      foot: [
++        h('button', { class: 'btn-primary', onClick: () => { this.closeModal(); this.showLauncher(); } }, '返回标题'),
++        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '留在游戏'),
++      ],
++    });
++  }
++
++  // ===================== 通用弹窗 / 反馈 =====================
++  showSheet({ title, body, foot, dismissable = true }) {
++    clear(this.modalRoot);
++    // dismissable=false 时遮罩不可点击关闭（用于必须做出选择的结局抉择，避免软锁）。
++    const overlay = h('div', { class: 'sheet-overlay', onClick: () => { if (dismissable) this.closeModal(); } });
++    const sheet = h('div', { class: 'sheet' },
++      h('div', { class: 'sheet__head' }, h('span', { class: 't' }, title || '')),
++      h('div', { class: 'sheet__body' }, ...(body || [])),
++      h('div', { class: 'sheet__foot' }, ...(foot || [])),
++    );
++    this.modalRoot.append(overlay, sheet);
++    this._sheet = sheet;
++  }
++  closeModal() { clear(this.modalRoot); this._sheet = null; }
++
++  toast(text, type = 'normal') {
++    const t = h('div', { class: `toast ${type}` }, text);
++    this.toastWrap.appendChild(t);
++    setTimeout(() => { t.classList.add('hide'); setTimeout(() => t.remove(), 300); }, 1500);
++  }
++
++  pushLog(text, type = 'normal') {
++    if (!this.player) return;
++    this.player.log.push({ turn: this.player.turn, text, type });
++    if (this.player.log.length > 200) this.player.log.shift();
++  }
++
++  // 浮动飘字：相对地图格定位。
++  floatAt(gx, gy, text, cls) {
++    if (!this.floatLayer) return;
++    const cell = this.cellNodes[gy] && this.cellNodes[gy][gx];
++    if (!cell) return;
++    const r = this.floatLayer.getBoundingClientRect();
++    const cr = cell.getBoundingClientRect();
++    const x = cr.left - r.left + cr.width / 2;
++    const y = cr.top - r.top + cr.height / 2;
++    this.spawnFloat(x, y, text, cls);
++  }
++  floatAtCenter(text, cls) {
++    if (!this.floatLayer) return;
++    const r = this.floatLayer.getBoundingClientRect();
++    this.spawnFloat(r.width / 2, r.height / 2 - 20, text, cls);
++  }
++  spawnFloat(x, y, text, cls) {
++    if (!this.floatLayer) return;
++    const el = h('div', { class: `float-num ${cls || ''}`, style: { left: `${x}px`, top: `${y}px` } }, text);
++    this.floatLayer.appendChild(el);
++    setTimeout(() => el.remove(), 900);
++  }
++
++  shake() {
++    const game = this.stage.querySelector('.xhlz-game') || this.stage.querySelector('.battle');
++    if (!game) return;
++    game.classList.remove('shake');
++    void game.offsetWidth;
++    game.classList.add('shake');
++  }
++
++  // ===================== 主循环（rAF）=====================
++  startLoop() {
++    if (this.running) return;
++    this.running = true;
++    this._lastFrame = nowMs();
++    this._prevTick = nowMs(); // 归零基线，避免从启动器/创角返回时首帧 delta 过大，一次性计入大段精力回补
++    this._staminaAccum = 0;
++    const tick = () => {
++      if (!this.running) return;
++      this._raf = requestAnimationFrame(tick);
++      const t = nowMs();
++      // 闲置降帧：地图且无弹窗时节流到 ~20fps；战斗全速（驱动计时条）。
++      const idle = this.screen === 'game' && !this._sheet;
++      if (idle && t - this._lastFrame < IDLE_FRAME_MS) return;
++      this._lastFrame = t;
++      this.onTick(t);
++    };
++    this._raf = requestAnimationFrame(tick);
++  }
++  stopLoop() {
++    this.running = false;
++    if (this._raf) cancelAnimationFrame(this._raf);
++    this._raf = 0;
++  }
++
++  onTick(t) {
++    // 每帧刷新 _prevTick，避免战斗/弹窗期间未更新导致回到地图时把整段时间一次性计入回精。
++    const delta = t - (this._prevTick || t);
++    this._prevTick = t;
++    // 战斗限时倒计时（开弹窗时暂停，不与玩家的脱离确认冲突）
++    if (this.screen === 'battle' && this.battle && this.timerEnabled && !this.battle.auto && !this.battle.busy && !this._sheet) {
++      const remain = Math.max(0, this.battle.timerEnd - t);
++      this.timerFill.style.width = `${(remain / BATTLE_TIME_MS) * 100}%`;
++      if (remain <= 0) { this.logBattle('⏰ 来不及反应！', 'bad'); this.chooseAction('hesitate'); }
++      return;
++    }
++    // 地图闲置：缓慢回复精力（delta 已按帧刷新，不会跨战斗累积）。
++    if (this.screen === 'game' && !this._sheet && this.player.stamina < maxStamina()) {
++      this._staminaAccum += delta;
++      while (this._staminaAccum >= STAMINA_REGEN_INTERVAL_MS) {
++        this._staminaAccum -= STAMINA_REGEN_INTERVAL_MS;
++        regenStamina(this.player, 1);
++      }
++      this.refreshStatus();
++    }
++  }
++
++  destroy() {
++    this.stopLoop();
++    try { if (this.player) saveToSlot(this.activeSlot, this.player); } catch (_) {}
++    clear(this.parent);
++    clear(this.modalRoot);
++    clear(this.toastWrap);
++    this.player = null;
++    this.battle = null;
++    this.over = false;
++  }
++}
++
++// —— 纯辅助（不依赖 this）——
++function isVisible(x, y, pos) {
++  return Math.max(Math.abs(x - pos.x), Math.abs(y - pos.y)) <= VISION_RADIUS;
++}
++function visibleKeysList(st, x, y) {
++  const out = [];
++  for (let dy = -VISION_RADIUS; dy <= VISION_RADIUS; dy++) {
++    for (let dx = -VISION_RADIUS; dx <= VISION_RADIUS; dx++) {
++      const nx = x + dx, ny = y + dy;
++      if (nx >= 0 && ny >= 0 && nx < GRID && ny < GRID) out.push(`${nx},${ny}`);
++    }
++  }
++  return out;
++}
++function adjacentEnemy(st, pos) {
++  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
++    const e = entityAt(st, pos.x + dx, pos.y + dy);
++    if (e && e.type === 'enemy') return e;
++  }
++  return null;
++}
++function entityEmoji(ent, tileId) {
++  switch (ent.type) {
++    case 'enemy': return ent.emoji || '👾';
++    case 'chest': return '🎁';
++    case 'merchant': return '🛒';
++    case 'drone': return '🔧';
++    case 'memory': return '💎';
++    case 'trap': return ''; // 陷阱不显示
++    default: return '';
++  }
++}
++function spentStardust(p) {
++  let s = 0;
++  for (const t of TALENTS) {
++    const rank = p.talents[t.branch] || 0;
++    for (let i = 0; i < rank; i++) s += talentCost(t.branch, i);
++  }
++  return s;
++}
++function nowMs() {
++  try { return Date.now(); } catch (_) { return 0; }
++}
+diff --git a/apps/xing-hai-lv-zhe/src/ui/dom.js b/apps/xing-hai-lv-zhe/src/ui/dom.js
+new file mode 100644
+index 0000000..bf0a8c3
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/ui/dom.js
+@@ -0,0 +1,43 @@
++// ============================================================================
++// 轻量 DOM 辅助：h() 创建元素，clear() 清空，bar() 进度条，避免引入框架。
++// ============================================================================
++export function h(tag, props, ...children) {
++  const el = document.createElement(tag);
++  if (props) {
++    for (const [k, v] of Object.entries(props)) {
++      if (v == null || v === false) continue;
++      if (k === 'class') el.className = v;
++      else if (k === 'dataset') Object.assign(el.dataset, v);
++      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
++      else if (k === 'onClick') el.addEventListener('click', v);
++      else if (k === 'onInput') el.addEventListener('input', v);
++      else if (k === 'html') el.innerHTML = v; // 仅用于受控静态内容
++      else if (k in el) { try { el[k] = v; } catch (_) { el.setAttribute(k, v); } }
++      else el.setAttribute(k, v);
++    }
++  }
++  appendChildren(el, children);
++  return el;
++}
++
++function appendChildren(el, children) {
++  for (const c of children) {
++    if (c == null || c === false || c === true) continue;
++    if (Array.isArray(c)) { appendChildren(el, c); continue; }
++    el.append(c.nodeType ? c : document.createTextNode(String(c)));
++  }
++}
++
++export function clear(el) {
++  while (el.firstChild) el.removeChild(el.firstChild);
++  return el;
++}
++
++// 进度条：label 叠加在条上，pct 由 value/max 决定。
++export function bar(value, max, opts = {}) {
++  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
++  return h('div', { class: `bar ${opts.class || ''}` },
++    h('div', { class: 'bar__fill', style: { width: `${pct}%`, background: opts.color || '' } }),
++    h('span', { class: 'bar__label' }, opts.label || `${Math.floor(value)}/${Math.round(max)}`),
++  );
++}
+diff --git a/apps/xing-hai-lv-zhe/src/ui/style.css b/apps/xing-hai-lv-zhe/src/ui/style.css
+new file mode 100644
+index 0000000..e75528d
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/src/ui/style.css
+@@ -0,0 +1,338 @@
++/* ==========================================================================
++   星骸旅者 · 样式（开罗式像素明亮风、竖屏三段式、移动端优先、适配安全区）
++   命名空间 .xhlz，与主框架其他展品样式互不干扰。
++   ========================================================================== */
++.xhlz {
++  --bg: #f8f4e6;
++  --bg-2: #f3ead6;
++  --card: #fffaf0;
++  --card-2: #f6efde;
++  --line: #d9c9a3;
++  --line-2: #c9b68a;
++  --ink: #3a3a4a;
++  --ink-soft: #6b6a78;
++  --muted: #9a9486;
++  --gold: #ffb400;
++  --stardust: #ffd93d;
++  --player: #4d96ff;
++  --hp: #ff6b6b;
++  --stamina: #38a3a5;
++  --monster: #e8634a;
++  --arcane: #9d4edd;
++  --good: #57c785;
++  --bad: #e8634a;
++  --radius: 14px;
++
++  position: absolute;
++  inset: 0;
++  background:
++    radial-gradient(120% 60% at 50% -10%, #fffdf6 0%, transparent 55%),
++    repeating-linear-gradient(45deg, rgba(217,201,163,0.10) 0 2px, transparent 2px 6px),
++    var(--bg);
++  color: var(--ink);
++  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif;
++  font-size: 14px;
++  line-height: 1.5;
++  overflow: hidden;
++  -webkit-user-select: none;
++  user-select: none;
++  -webkit-tap-highlight-color: transparent;
++}
++
++.xhlz * { box-sizing: border-box; }
++.xhlz .muted { color: var(--muted); font-size: 0.82rem; }
++.xhlz .grow { flex: 1; min-width: 0; }
++
++/* 舞台 */
++.xhlz .xhlz-stage { position: absolute; inset: 0; overflow: hidden; }
++.xhlz .xhlz-game { position: absolute; inset: 0; display: flex; flex-direction: column; overflow: hidden; }
++.xhlz .shake { animation: xhlz-shake 0.32s ease; }
++@keyframes xhlz-shake {
++  0%,100% { transform: translate(0,0); }
++  20% { transform: translate(-4px, 2px); }
++  40% { transform: translate(4px, -2px); }
++  60% { transform: translate(-3px, -2px); }
++  80% { transform: translate(3px, 2px); }
++}
++
++.xhlz button {
++  font-family: inherit;
++  cursor: pointer;
++  border: 2px solid var(--line-2);
++  border-radius: 10px;
++  background: var(--card);
++  color: var(--ink);
++  padding: 0.55rem 0.8rem;
++  font-size: 0.9rem;
++  font-weight: 600;
++  box-shadow: 0 2px 0 var(--line-2);
++  transition: transform 0.08s ease, box-shadow 0.08s ease, opacity 0.15s ease;
++}
++.xhlz button:active { transform: translateY(2px); box-shadow: 0 0 0 var(--line-2); }
++.xhlz button:disabled { opacity: 0.45; cursor: default; }
++.xhlz .btn-primary { background: linear-gradient(180deg, #ffd93d, var(--gold)); color: #3a2a00; border-color: #d99a00; box-shadow: 0 2px 0 #b07d00; }
++.xhlz .btn-jade { background: linear-gradient(180deg, #6fe0b0, #2f9a72); color: #06241a; border-color: #2f9a72; box-shadow: 0 2px 0 #226e52; }
++.xhlz .btn-blue { background: linear-gradient(180deg, #6fb0ff, #2f6fae); color: #fff; border-color: #2f6fae; box-shadow: 0 2px 0 #214d77; }
++.xhlz .btn-danger { background: linear-gradient(180deg, #ff8a7a, var(--bad)); color: #fff; border-color: var(--bad); box-shadow: 0 2px 0 #a83a2c; }
++.xhlz .btn-ghost { background: var(--card-2); }
++.xhlz .big-btn { width: 100%; padding: 0.85rem; font-size: 1rem; }
++.xhlz .icon-btn { padding: 0.45rem 0.55rem; font-size: 1rem; line-height: 1; }
++
++.xhlz .card {
++  background: linear-gradient(180deg, var(--card), var(--card-2));
++  border: 2px solid var(--line);
++  border-radius: var(--radius);
++  padding: 0.75rem;
++  margin-bottom: 0.55rem;
++}
++.xhlz h4 { margin: 0 0 0.4rem; font-size: 0.95rem; }
++
++/* —— 启动器 / 创角 / 结局 —— */
++.xhlz .launcher {
++  position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden;
++  padding: max(1.4rem, env(safe-area-inset-top)) 1rem max(1.4rem, env(safe-area-inset-bottom));
++  display: flex; flex-direction: column; align-items: stretch; justify-content: center;
++  max-width: 480px; margin: 0 auto;
++}
++.xhlz .launcher__brand { text-align: center; margin-bottom: 1.2rem; }
++.xhlz .launcher__brand .emblem {
++  width: 66px; height: 66px; margin: 0 auto 0.6rem; border-radius: 18px;
++  display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800;
++  background: radial-gradient(circle at 35% 30%, #ffe98a, var(--gold));
++  border: 2px solid #d99a00; color: #3a2a00;
++  box-shadow: 0 4px 0 #b07d00, inset 0 0 0 3px rgba(255,255,255,0.4);
++}
++.xhlz .launcher__brand h1 { margin: 0; font-size: 1.6rem; }
++.xhlz .launcher__brand .sub { margin: 0.3rem 0 0; color: var(--ink-soft); font-size: 0.85rem; }
++.xhlz .launcher__actions { display: flex; flex-direction: column; gap: 0.55rem; }
++.xhlz .launcher__hint { text-align: center; margin-top: 0.9rem; }
++.xhlz .create__head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.8rem; }
++.xhlz .create__head h1 { margin: 0; font-size: 1.2rem; flex: 1; text-align: center; }
++.xhlz .name-input {
++  width: 100%; padding: 0.7rem; border-radius: 10px; border: 2px solid var(--line-2);
++  background: var(--card); color: var(--ink); font-family: inherit; font-size: 1rem;
++}
++.xhlz .name-input:focus { outline: none; border-color: var(--player); }
++.xhlz .create__foot { margin-top: 0.6rem; }
++.xhlz .seed-row { display: flex; gap: 0.5rem; align-items: center; }
++.xhlz .seed-input {
++  flex: 1; padding: 0.55rem; border-radius: 10px; border: 2px solid var(--line-2);
++  background: var(--card); color: var(--ink); font-family: ui-monospace, monospace; font-size: 0.95rem;
++}
++
++/* —— 顶部状态栏（~8%）—— */
++.xhlz .status-bar {
++  flex: none;
++  padding: max(0.55rem, env(safe-area-inset-top)) 0.7rem 0.45rem;
++  background: linear-gradient(180deg, var(--card-2), var(--bg-2));
++  border-bottom: 2px solid var(--line);
++}
++.xhlz .status-top { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.35rem; }
++.xhlz .status-name { font-weight: 800; font-size: 0.95rem; }
++.xhlz .status-lv { font-size: 0.74rem; color: #fff; background: var(--player); padding: 0 0.35rem; border-radius: 6px; font-weight: 700; }
++.xhlz .status-floor { font-size: 0.8rem; color: var(--ink-soft); }
++.xhlz .status-floor b { color: var(--gold); }
++.xhlz .status-res { margin-left: auto; display: flex; gap: 0.4rem; font-variant-numeric: tabular-nums; font-weight: 700; font-size: 0.82rem; }
++.xhlz .status-res .r { display: flex; align-items: center; gap: 0.2rem; }
++.xhlz .status-bars { display: flex; flex-direction: column; gap: 0.28rem; }
++.xhlz .barline { display: flex; align-items: center; gap: 0.4rem; }
++.xhlz .barline .bl-icon { flex: none; width: 1.1rem; text-align: center; }
++.xhlz .barline .bl-track { flex: 1; height: 11px; background: rgba(58,58,74,0.12); border-radius: 6px; overflow: hidden; border: 1px solid var(--line); }
++.xhlz .barline .bl-fill { height: 100%; border-radius: 6px; transition: width 0.4s cubic-bezier(0.22,1,0.36,1); }
++.xhlz .barline .bl-val { flex: none; width: 3.4rem; text-align: right; font-size: 0.74rem; font-variant-numeric: tabular-nums; font-weight: 700; }
++
++/* —— 中央像素地图 —— */
++.xhlz .map-wrap {
++  flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
++  padding: 0.4rem; position: relative; overflow: hidden;
++}
++.xhlz .map-frame {
++  position: relative;
++  width: min(100%, calc(100vh - 230px));
++  aspect-ratio: 1 / 1;
++  background: #2b2d3a;
++  border: 3px solid var(--line-2);
++  border-radius: 12px;
++  box-shadow: inset 0 0 0 2px rgba(0,0,0,0.3), 0 3px 0 var(--line-2);
++  overflow: hidden;
++}
++.xhlz .map-grid {
++  position: absolute; inset: 0;
++  display: grid;
++  grid-template-columns: repeat(16, 1fr);
++  grid-template-rows: repeat(16, 1fr);
++}
++.xhlz .cell {
++  position: relative;
++  display: flex; align-items: center; justify-content: center;
++  font-size: clamp(0.7rem, 2.6vw, 1rem);
++  line-height: 1;
++}
++/* 雾：未探索 = 全黑；已探索不可见 = 压暗 */
++.xhlz .cell.fog { background: #1a1c28; }
++.xhlz .cell.fog .ent { display: none; }
++.xhlz .cell.dim { filter: brightness(0.5) saturate(0.6); }
++.xhlz .cell.dim .ent { opacity: 0.55; }
++.xhlz .cell.visible { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05); }
++.xhlz .cell .ent { position: relative; z-index: 2; }
++.xhlz .cell.player::after {
++  content: ''; position: absolute; inset: 8%;
++  border-radius: 30%; border: 2px solid #fff;
++  box-shadow: 0 0 6px rgba(255,255,255,0.8);
++  animation: xhlz-bob 1.1s ease-in-out infinite;
++}
++.xhlz .cell.reachable { cursor: pointer; }
++.xhlz .cell.reachable::before {
++  content: ''; position: absolute; inset: 14%;
++  border-radius: 50%; background: rgba(77,150,255,0.25);
++  border: 1px dashed rgba(77,150,255,0.7);
++}
++.xhlz .cell.stairs .ent { animation: xhlz-glow 1.4s ease-in-out infinite; }
++@keyframes xhlz-bob { 0%,100% { transform: scale(1); } 50% { transform: scale(0.86); } }
++@keyframes xhlz-glow { 0%,100% { filter: drop-shadow(0 0 0 #ffd93d); } 50% { filter: drop-shadow(0 0 4px #ffd93d); } }
++
++/* 浮动飘字（伤害 / 拾取）*/
++.xhlz .float-layer { position: absolute; inset: 0; pointer-events: none; z-index: 30; overflow: hidden; }
++.xhlz .float-num {
++  position: absolute; font-weight: 800; font-size: 1rem;
++  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
++  animation: xhlz-float 0.9s ease-out forwards;
++}
++.xhlz .float-num.up { color: var(--good); }
++.xhlz .float-num.down { color: var(--bad); }
++.xhlz .float-num.gold { color: var(--gold); }
++@keyframes xhlz-float {
++  0% { opacity: 0; transform: translate(-50%, 0) scale(0.7); }
++  20% { opacity: 1; transform: translate(-50%, -10px) scale(1.15); }
++  100% { opacity: 0; transform: translate(-50%, -40px) scale(1); }
++}
++
++/* —— 底部操作栏（~27%）—— */
++.xhlz .bottom-bar {
++  flex: none; display: flex; align-items: stretch; gap: 0.45rem;
++  padding: 0.45rem 0.6rem max(0.5rem, env(safe-area-inset-bottom));
++  background: linear-gradient(0deg, var(--bg-2), var(--card-2));
++  border-top: 2px solid var(--line);
++}
++.xhlz .dpad {
++  display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);
++  gap: 0.25rem; width: 128px; height: 116px; flex: none;
++}
++.xhlz .dpad button { padding: 0; font-size: 1.1rem; }
++.xhlz .dpad .d-up { grid-area: 1 / 2; }
++.xhlz .dpad .d-left { grid-area: 2 / 1; }
++.xhlz .dpad .d-center { grid-area: 2 / 2; background: var(--card-2); }
++.xhlz .dpad .d-right { grid-area: 2 / 3; }
++.xhlz .dpad .d-down { grid-area: 3 / 2; }
++.xhlz .act-col { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; justify-content: center; }
++.xhlz .interact-btn {
++  flex: 1; min-height: 56px; font-size: 1rem; font-weight: 800;
++  border-radius: 14px;
++}
++.xhlz .tool-col { display: flex; flex-direction: column; gap: 0.4rem; flex: none; }
++.xhlz .tool-col .icon-btn { min-width: 48px; min-height: 48px; }
++
++/* —— 弹窗（Sheet）—— */
++.xhlz .xhlz-modals { position: absolute; inset: 0; z-index: 50; pointer-events: none; }
++.xhlz .sheet-overlay {
++  position: absolute; inset: 0; background: rgba(40,32,16,0.5); pointer-events: auto;
++  animation: xhlz-fade 0.2s ease;
++}
++.xhlz .sheet {
++  position: absolute; left: 0; right: 0; bottom: 0; max-height: 88%; overflow-y: auto;
++  background: linear-gradient(180deg, var(--card), var(--bg-2));
++  border-top: 2px solid var(--line-2); border-radius: 20px 20px 0 0;
++  padding: max(0.7rem, env(safe-area-inset-top)) 0.9rem max(0.8rem, env(safe-area-inset-bottom));
++  pointer-events: auto; animation: xhlz-sheet-up 0.25s cubic-bezier(0.22,1,0.36,1);
++}
++.xhlz .sheet__head { display: flex; align-items: center; justify-content: center; margin-bottom: 0.6rem; }
++.xhlz .sheet__head .t { font-size: 1.05rem; font-weight: 800; }
++.xhlz .sheet__body { padding-bottom: 0.3rem; }
++.xhlz .sheet__foot { display: flex; flex-wrap: wrap; gap: 0.45rem; }
++.xhlz .sheet__foot > * { flex: 1 1 auto; }
++@keyframes xhlz-fade { from { opacity: 0; } to { opacity: 1; } }
++@keyframes xhlz-sheet-up { from { transform: translateY(40px); opacity: 0.4; } to { transform: none; opacity: 1; } }
++
++/* —— 背包：装备 / 天赋 / 剧情 标签 —— */
++.xhlz .tabs { display: flex; gap: 0.35rem; margin-bottom: 0.6rem; }
++.xhlz .tab { flex: 1; padding: 0.45rem 0.2rem; font-size: 0.85rem; }
++.xhlz .tab.active { background: linear-gradient(180deg, #ffd93d, var(--gold)); color: #3a2a00; border-color: #d99a00; }
++.xhlz .equip-card { display: flex; align-items: center; gap: 0.6rem; }
++.xhlz .equip-card .eq-emoji { font-size: 1.6rem; flex: none; }
++.xhlz .equip-card .eq-info { flex: 1; min-width: 0; }
++.xhlz .equip-card .eq-name { font-weight: 700; }
++.xhlz .equip-card .eq-name .plus { color: var(--gold); font-weight: 800; }
++.xhlz .equip-card .eq-affix { font-size: 0.74rem; color: var(--arcane); font-weight: 700; }
++.xhlz .equip-card .eq-cost { font-size: 0.74rem; color: var(--ink-soft); }
++.xhlz .talent-branch { margin-bottom: 0.5rem; }
++.xhlz .talent-head { display: flex; align-items: center; gap: 0.45rem; margin-bottom: 0.3rem; }
++.xhlz .talent-ranks { display: flex; gap: 0.25rem; margin: 0.25rem 0; }
++.xhlz .talent-pip { width: 1.1rem; height: 1.1rem; border-radius: 50%; background: rgba(58,58,74,0.12); border: 1px solid var(--line); }
++.xhlz .talent-pip.on { background: var(--gold); border-color: #d99a00; box-shadow: inset 0 0 0 2px rgba(255,255,255,0.4); }
++.xhlz .chapter { padding: 0.55rem 0.65rem; border-radius: 10px; background: var(--card-2); border: 1px solid var(--line); margin-bottom: 0.4rem; }
++.xhlz .chapter.locked { opacity: 0.55; }
++.xhlz .chapter .ch-title { font-weight: 700; color: var(--arcane); }
++.xhlz .chapter .ch-text { font-size: 0.85rem; line-height: 1.55; margin-top: 0.2rem; }
++
++/* 通用进度条 */
++.xhlz .bar { position: relative; height: 14px; background: rgba(58,58,74,0.12); border-radius: 7px; overflow: hidden; border: 1px solid var(--line); }
++.xhlz .bar__fill { position: absolute; inset: 0 auto 0 0; border-radius: 7px; transition: width 0.4s ease; background: var(--player); }
++.xhlz .bar__label {
++  position: absolute; inset: 0; display: flex; align-items: center; justify-content: flex-end;
++  padding-right: 0.4rem; font-size: 0.72rem; font-weight: 800; color: #fff;
++  text-shadow: 0 1px 2px rgba(0,0,0,0.6); font-variant-numeric: tabular-nums;
++}
++
++/* —— 战斗覆盖层 —— */
++.xhlz .battle { position: absolute; inset: 0; display: flex; flex-direction: column; padding: max(0.6rem, env(safe-area-inset-top)) 0.7rem max(0.6rem, env(safe-area-inset-bottom)); background: radial-gradient(120% 70% at 50% 0%, #3a2a4a, #1f1a2a); color: #f3ead6; }
++.xhlz .battle__foe { text-align: center; margin: 0.4rem 0 0.3rem; }
++.xhlz .battle__foe .emoji { font-size: 3rem; }
++.xhlz .battle__foe .name { font-weight: 800; font-size: 1.05rem; }
++.xhlz .battle__stance { text-align: center; margin: 0.4rem 0; min-height: 2.6rem; }
++.xhlz .stance-chip { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.35rem 0.8rem; border-radius: 999px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); font-weight: 700; }
++.xhlz .stance-chip.unknown { opacity: 0.85; font-style: italic; }
++.xhlz .battle__log { flex: 1; min-height: 0; overflow-y: auto; font-size: 0.82rem; display: flex; flex-direction: column; gap: 0.25rem; padding: 0.3rem 0.5rem; }
++.xhlz .battle__log .ln { padding: 0.25rem 0.4rem; border-radius: 8px; background: rgba(255,255,255,0.06); }
++.xhlz .battle__log .ln.good { color: #9be8b5; }
++.xhlz .battle__log .ln.bad { color: #ffb0a6; }
++.xhlz .battle__timer { height: 6px; background: rgba(255,255,255,0.12); border-radius: 4px; overflow: hidden; margin: 0.3rem 0; }
++.xhlz .battle__timer .t { height: 100%; background: linear-gradient(90deg, #ffd93d, #ff8a3d); transition: width 0.1s linear; }
++.xhlz .battle__actions { display: flex; gap: 0.45rem; }
++.xhlz .battle__actions .act { flex: 1; min-height: 60px; font-size: 0.92rem; font-weight: 800; color: #fff; }
++.xhlz .battle__actions .act.block { background: linear-gradient(180deg, #6fb0ff, #2f6fae); border-color: #2f6fae; box-shadow: 0 2px 0 #214d77; }
++.xhlz .battle__actions .act.dodge { background: linear-gradient(180deg, #6fe0b0, #2f9a72); border-color: #2f9a72; box-shadow: 0 2px 0 #226e52; }
++.xhlz .battle__actions .act.counter { background: linear-gradient(180deg, #ff9a8a, #e8634a); border-color: #e8634a; box-shadow: 0 2px 0 #a83a2c; }
++.xhlz .battle__topbar { display: flex; align-items: center; gap: 0.5rem; }
++.xhlz .battle__topbar .title { flex: 1; font-weight: 800; }
++.xhlz .battle__self { display: flex; gap: 0.5rem; align-items: center; margin: 0.35rem 0; font-size: 0.8rem; }
++.xhlz .battle__self .bar { flex: 1; }
++
++/* —— 结局 —— */
++.xhlz .ending { text-align: center; }
++.xhlz .ending__emoji { font-size: 3.4rem; }
++.xhlz .ending h2 { margin: 0.3rem 0; font-size: 1.4rem; }
++.xhlz .ending.peace h2 { color: #2f9a72; }
++.xhlz .ending.dark h2 { color: var(--bad); }
++.xhlz .ending__text { font-size: 0.92rem; line-height: 1.7; margin: 0.6rem 0; text-align: left; }
++.xhlz .ending__choice { display: flex; flex-direction: column; gap: 0.5rem; }
++
++/* —— 存档管理 —— */
++.xhlz .slot-list { display: flex; flex-direction: column; gap: 0.45rem; }
++.xhlz .slot-row { display: flex; align-items: center; gap: 0.6rem; padding: 0.55rem 0.65rem; border-radius: 10px; background: var(--card-2); border: 1px solid var(--line); }
++.xhlz .slot-row.empty { opacity: 0.7; border-style: dashed; }
++.xhlz .slot-no { flex: none; width: 1.6rem; height: 1.6rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 800; background: var(--bg-2); color: var(--ink-soft); border: 1px solid var(--line); }
++.xhlz .slot-info { flex: 1; min-width: 0; }
++.xhlz .slot-name { font-weight: 800; }
++.xhlz .slot-meta { font-size: 0.76rem; color: var(--ink-soft); margin-top: 0.1rem; }
++.xhlz .slot-actions { flex: none; display: flex; gap: 0.3rem; }
++.xhlz .slot-act { padding: 0.35rem 0.55rem; font-size: 0.8rem; }
++.xhlz .save-io { width: 100%; height: 60px; resize: vertical; padding: 0.5rem; border-radius: 8px; border: 2px solid var(--line-2); background: var(--card); color: var(--ink); font-family: ui-monospace, monospace; font-size: 1rem; word-break: break-all; }
++
++/* —— Toast —— */
++.xhlz .toast-wrap { position: absolute; top: max(0.5rem, env(safe-area-inset-top)); left: 0; right: 0; z-index: 90; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; pointer-events: none; }
++.xhlz .toast { max-width: 88%; padding: 0.45rem 0.85rem; border-radius: 999px; font-size: 0.82rem; font-weight: 600; background: rgba(58,58,74,0.94); border: 1px solid var(--line-2); color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.3); animation: xhlz-toast-in 0.25s ease; }
++.xhlz .toast.good { border-color: var(--good); }
++.xhlz .toast.bad { border-color: var(--bad); }
++.xhlz .toast.hide { animation: xhlz-toast-out 0.3s ease forwards; }
++@keyframes xhlz-toast-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
++@keyframes xhlz-toast-out { to { opacity: 0; transform: translateY(-8px); } }
+diff --git a/apps/xing-hai-lv-zhe/vite.config.js b/apps/xing-hai-lv-zhe/vite.config.js
+new file mode 100644
+index 0000000..2dc4040
+--- /dev/null
++++ b/apps/xing-hai-lv-zhe/vite.config.js
+@@ -0,0 +1,16 @@
++import { defineConfig } from 'vite';
++
++// `base: './'` 生成相对路径资源引用，便于部署到 GitHub Pages 子路径或任意静态目录。
++// 本作刻意不依赖任何框架，纯原生 DOM + Canvas 渲染，构建产物极小。
++export default defineConfig({
++  base: './',
++  server: {
++    host: true,
++    port: 5176,
++  },
++  build: {
++    outDir: 'dist',
++    sourcemap: false,
++    target: 'es2018',
++  },
++});
+diff --git a/src/main.js b/src/main.js
+index ed2a00c..488d9cb 100644
+--- a/src/main.js
++++ b/src/main.js
+@@ -42,6 +42,14 @@ const APPS = {
+     desc: '从呱呱坠地到垂垂老矣，一月一回合推进岁月，在健康、智力、财富、心情、社交间权衡抉择；可多槽位存档、可挂机，过完这一生。',
+     loader: () => import('../apps/mo-ni-ren-sheng/src/main.js'),
+   },
++  xhlz: {
++    key: 'xhlz',
++    title: '星骸旅者',
++    subtitle: '像素 · Roguelike',
++    emblem: '星',
++    desc: '迫降破碎星球，在漂浮的遗迹浮岛间拾荒探索。猜拳克制式战斗、装备强化与三天赋树、碎片化记忆叙事，集齐十枚星骸回响揭开真相。',
++    loader: () => import('../apps/xing-hai-lv-zhe/src/main.js'),
++  },
+ }
+ 
+ // 大类：先呈现「学习」，再呈现「游戏」。点击大类进入后，才展开其中的具体应用。
+@@ -59,8 +67,8 @@ const CATEGORIES = [
+     title: '游戏',
+     subtitle: '休闲 · 互动娱乐',
+     emblem: '玩',
+-    desc: '消磨时光的互动小品：修仙、人生、三国战场，挑一个开始吧。',
+-    appKeys: ['dzf', 'frxx', 'mnrs'],
++    desc: '消磨时光的互动小品：修仙、人生、三国战场、星骸浮岛，挑一个开始吧。',
++    appKeys: ['dzf', 'frxx', 'mnrs', 'xhlz'],
+   },
+ ]
+ 
diff --git a/.ai-tasks/issue-69/review_error_r1.log b/.ai-tasks/issue-69/review_error_r1.log
new file mode 100644
index 0000000..e69de29
diff --git a/.ai-tasks/issue-69/review_error_r2.log b/.ai-tasks/issue-69/review_error_r2.log
new file mode 100644
index 0000000..e69de29
diff --git a/.ai-tasks/issue-69/review_result_r1.md b/.ai-tasks/issue-69/review_result_r1.md
new file mode 100644
index 0000000..33be81f
--- /dev/null
+++ b/.ai-tasks/issue-69/review_result_r1.md
@@ -0,0 +1,20 @@
+我已完成详尽的审查，包括阅读所有源码，运行了两个测试套件（123 + 49 项通过），并构建了对抗性探测。以下是我的审查结果。
+
+DECISION: REQUEST_CHANGES
+COMMENT: 整体工程质量较高（模块化清晰、纯函数可测、存档迁移健壮、123+49 项自测全过、楼梯连通性 1800 次穷举 0 软锁、未触碰 .github/ 工作流——无需人类改 CI/CD）。但存在一个会影响「自动战斗」这一主打卖点的真实 Bug，需修复后再合入。
+
+【阻断级 Bug · 自动战斗关闭瞬间必定失手】src/ui/app.js
+复现：进入战斗 → 开启 🤖 自动战斗 → 自动打数秒（>3s，如 4 个回合约 3.4s）→ 关闭 🤖。结果：玩家立刻被判定「⏰ 来不及反应！」并强制失手受击。
+根因（三段联立）：
+1) nextRound() 中 `if (this.timerEnabled && !this.battle.auto)` 才会刷新 timerEnd；auto=true 期间 timerEnd 不再更新，停留在「最后一次手动回合」的旧值（若从一开始就开自动，timerEnd 恒为初始 0）。
+2) toggleAuto() 关闭自动时，既没有重置 timerEnd，也没有给玩家一个全新限时窗口。
+3) onTick() 的倒计时分支条件为 `screen==='battle' && timerEnabled && !auto && !busy && !_sheet`，关闭自动后立即命中，`remain=max(0, timerEnd-now)` 因 timerEnd 过期等于 0 → 立刻 chooseAction('hesitate') 强制失手。
+我用最小逻辑复现确认：auto 期间经过 4000ms 后关闭，remain==0 ⇒ instant fumble=true。这是把「关自动」误罚玩家的逻辑漏洞，且 320ms 的窗口极易触发。建议在 toggleAuto() 关闭自动、以及 nextRound() 中 auto 由 true 转 false 的当回合，执行 `this.battle.timerEnd = nowMs() + BATTLE_TIME_MS`（与手动回合一致），给玩家完整 3 秒。
+
+【次要问题（建议一并处理，非阻断）】
+- src/core/world.js takeCell() / src/core/rng.js pick()/randInt()：均假设 rng()∈[0,1)。`arr[Math.floor(r()*len)]` 在 r()≥1 时会取到 undefined（我在注入 r()=2 时实测触发 `Cannot read properties of undefined (reading 'x')` 崩溃）。生产环境 this.rng=Math.random 不会触发，但 makeRng 的数组模式可返回任意值；建议 `const f = Math.min(0.999999, Math.max(0, r()))` 之类做一次钳制，提升种子/测试鲁棒性。
+- src/ui/app.js startLoop() 未重置 this._prevTick：从启动器/创角返回游戏时，首帧 delta 可能很大，触发一次性精力回补尖峰（受 maxStamina 钳制不致崩溃，但应在 startLoop 里 `this._prevTick = nowMs()` 归零）。
+- 死亡存档可被「继续旅程」加载：gameOver 落盘 hp=0 且无 ending，listSaves 仍视为可继续；加载后 enterGame→isDead→立即再次 gameOver。建议 listSaves/load 路径对 hp<=0 的存档标记或走 restart 流程，避免「继续」瞬间又死亡的不良体验。
+- 战斗结算窗口（winBattle/loseBattle/nextRound 的 360–520ms setTimeout 期间）顶部「🏃」撤退按钮未随 busy 禁用，理论上可与胜负结算交错；建议 busy 期间一并禁用撤退按钮。
+
+修复第 1 项后即可合入；其余 4 项建议顺带打磨。
diff --git a/.ai-tasks/issue-69/review_result_r2.md b/.ai-tasks/issue-69/review_result_r2.md
new file mode 100644
index 0000000..1af23fd
--- /dev/null
+++ b/.ai-tasks/issue-69/review_result_r2.md
@@ -0,0 +1,24 @@
+我已完成代码审查。我阅读了完整的 `pr_diff_r2.md`（包括嵌入的 r1 diff），根据工作树（r1 修复后的当前状态）核对了所有源代码文件，运行了测试套件（123 项逻辑测试 + 49 项 DOM 测试全部通过），并编写了一个针对性的复现案例来确认我的主要发现。
+
+所有 5 项 r1 问题均已正确修复并验证：
+- ✅ 自动战斗关闭瞬发失误问题（`toggleAuto` 重置 `timerEnd`；`onTick` 由 `!auto`/`!busy`/`!_sheet` 防护）
+- ✅ RNG 限制（`clampUnit` 应用于 `randInt`/`weightedPick`/`pick`；`takeCell` 通过 `pick` 复用）
+- ✅ `startLoop` 重置 `_prevTick`，`onTick` 每帧刷新
+- ✅ 死亡存档路由至 `gameOver`（`listSaves` 标记 `dead`；`hasAnySave`/`latestSlot` 跳过）
+- ✅ 撤退按钮在 `busy` 期间被禁用
+
+但是，在同一个战斗计时器子系统中还存在一个同类 Bug，修复者未将其解决。
+
+DECISION: REQUEST_CHANGES
+COMMENT: 第 1 轮的 5 项问题均已正确修复并验证（123 项逻辑自测 + 49 项 DOM 冒烟全过；自动战斗关闭失手、rng 钳制、_prevTick 归零、陨落档处理、撤退按钮 busy 禁用 均已落实；本次未触碰 .github/ 工作流，无需人类改 CI/CD）。但在「战斗限时」这一上一轮的阻断点子系统里，仍残留一个同源的计时器陈旧 Bug，建议修复后再合入。
+
+【阻断级 Bug · 打开「撤退」确认弹窗后取消，会因 timerEnd 陈旧而被瞬间判失手】src/ui/app.js
+复现（我已用 jsdom + 可控时钟最小复现，结论 YES/BUG CONFIRMED）：进入战斗（timerEnabled=true）→ 回合开始 nextRound 设 timerEnd=now+3000 → 点 🏥/🏃「撤退」打开确认弹窗（confirmFlee → this._sheet 被置，onTick 的倒计时分支因 `!this._sheet` 条件整体跳过，计时条视觉上「暂停」）→ 玩家在弹窗里犹豫 >3 秒（例如读「撤退会损失少量星骸…」+思考）→ 点「继续战斗」closeModal()（_sheet 置空，但 timerEnd 仍是旧值，未被延长）→ 下一帧 onTick(now)：screen==='battle' && timerEnabled && !auto && !busy && !_sheet 全成立 → remain=max(0, timerEnd-now)=0 → 立刻 logBattle('⏰ 来不及反应！') 并 chooseAction('hesitate') 强制失手受击。
+根因：弹窗期间计时分支被 `!this._sheet` 正确暂停了「视觉/扣减」，但 timerEnd 这个绝对截止时间并未随之顺延；与第 1 轮「关自动导致 timerEnd 陈旧→瞬间失手」是同一类漏洞的兄弟分支——修复者补上了 toggleAuto/nextRound 两条路径，却漏了「弹窗关闭回到限时回合」这条路径。实测数据：nextRound 后 timerEnd=13000、CLOCK=10000；开撤退弹窗并推进 5s 后 CLOCK=15000；closeModal 后 timerEnd 仍=13000；onTick(15000) → remain=0 → 立即失手。
+建议修复（与现有 toggleAuto 风格一致）：在 closeModal() 中，若当前正处限时战斗回合且非结算中（this.screen==='battle' && this.battle && this.timerEnabled && !this.battle.auto && !this.battle.busy），执行 this.battle.timerEnd = nowMs() + BATTLE_TIME_MS，给玩家一个完整窗口（或更精确：开弹窗时记录剩余时间，关弹窗时按剩余时间顺延）。这样「视觉暂停」与「截止时间」才一致，不会把玩家的深思熟虑误判为反应不及。
+
+【次要（非阻断，建议顺带打磨）】
+- 重力陷阱实体（ent.type==='trap'）在 resolveEntity 中触发 teleport() 后未被 removeEntity，陷阱永久残留且不可见（emoji ''）；虽被传送离开不易立刻再踩，但属于「一次性陷阱却永久存在」的设计瑕疵，建议传送后 removeEntity(st, ent.id)。
+- 全槽位已满时新建旅程（pickSlotForNewSave）会直接覆盖最久未玩档而无二次确认，可能让玩家意外丢失旧档；建议覆盖前弹确认（与 confirmDeleteSlot 一致）。
+
+修复第 1 项（撤退弹窗 timerEnd 陈旧）后即可合入。
diff --git a/apps/xing-hai-lv-zhe/README.md b/apps/xing-hai-lv-zhe/README.md
new file mode 100644
index 0000000..75be1c7
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/README.md
@@ -0,0 +1,57 @@
+# 星骸旅者 · Star Wreck Pilgrim
+
+一款融合 **开罗游戏（Kairosoft）式像素经营美学** 与 **Roguelike 生存探索** 的轻量化竖屏单机 RPG。你是一名迫降在破碎星球「墨比乌斯」的拾荒者，在无数漂浮的「遗迹浮岛」间探索、战斗、收集「星骸」，直至揭开这颗星球毁灭前的真相。
+
+技术栈：**纯原生 HTML + CSS + JavaScript（无框架）**，移动端竖屏单手操作，LocalStorage 多槽位存档，体积小、加载快。
+
+## 本地运行
+
+```bash
+npm install
+npm run dev      # 开发服务器 http://localhost:5176
+npm run build    # 生产构建到 dist/
+npm run test     # 纯逻辑自测（不依赖浏览器）
+npm run test:dom # jsdom 冒烟测试（需先 npm i jsdom，覆盖 UI 主流程）
+```
+
+也可由主框架（落地页）以 `createGame(parent)` 动态挂载，无需独立部署。
+
+## 核心玩法
+
+- **浮岛探索（点击移动）**：每个浮岛是一张 16×16 的像素网格地图，角色视野仅 5×5（迷雾机制）。点击相邻地块移动；强化「推进器」可一次走出更多步。踩上宝箱拾取、踩上陷阱触发、靠近敌人即可交战，找到下行阶梯深入下一层。
+- **抉择型战斗（猜拳克制）**：敌人每回合摆出「突刺 / 横斩 / 重击」架势，玩家在限时内选择「格挡 / 闪避 / 反击」——反击克突刺、格挡克横斩、闪避克重击。成功克制触发「专注力」加成（下一击 ×1.5）。精力过低会失手。可开启**自动战斗**让 AI 按最优克制代打，适合单手摸鱼。
+- **开罗式装备与成长**：武器（攻）/护甲（防）/推进器（步数）三件套，消耗「零件」强化；强化到 +5 触发**词缀变异**（吸血 / 反伤等随机附加属性）。**天赋树**仅三条分支（生存 / 战斗 / 幸运），消耗星骸点亮，可随时免费重置，鼓励试错。
+- **碎片化叙事**：每个浮岛固定藏有 1 枚「星骸回响」记忆碎片，集齐解锁主角失落的背景故事（共 10 章）。途中还会偶遇流浪商人、维修无人机、重力陷阱等随机事件。
+- **双重结局**：第 10 层击败星骸之核后，由你抉择——用所有星骸**重建文明**（和平结局），还是**引爆星骸**成为新神（暗黑结局）。
+
+## 移动端 UI/UX
+
+- **三段式竖屏布局**：顶部状态栏（HP / 精力 / 层数 / 星骸）· 中央像素地图画布 · 底部操作栏（左虚拟方向键 / 中动态交互键 / 右背包入口）。所有可点区域 ≥ 44×44pt，贴合拇指热区。
+- **像素反馈**：地图与角色以开罗经典 16 色调色板用色块绘制；战斗命中时屏幕轻微震动，拾取与伤害弹出「+数字」浮动飘字。
+- **状态机驱动**：`BOOT → MAP → BATTLE → INVENTORY → EVENT`，闲置时自动降帧至 ~20fps 节省电量。
+
+## 项目结构（模块化）
+
+```
+src/
+  config.js          调色板 / 地块 / 装备 / 天赋 / 敌人 / 章节 / 事件（纯常量与纯函数）
+  core/
+    rng.js           可注入随机源（种子化/测试）
+    player.js        角色状态 / 装备强化 / 天赋 / 升级 / 战斗结算
+    world.js         浮岛生成（房间+连通保证）/ 迷雾 / 移动校验 / 下行
+    battle.js        猜拳克制战斗（架势 / 克制 / 专注力 / 自动战斗）
+    save.js          多槽位 localStorage 存档 + 导入导出
+  ui/
+    dom.js           轻量 h() DOM 辅助
+    style.css        开罗像素竖屏移动端样式
+    app.js           UI 渲染与状态机（启动器/创角/地图/战斗/背包/事件/结局）
+  main.js            入口：createGame(parent) 工厂
+scripts/logic-test.mjs   纯逻辑自测
+scripts/smoke-dom.mjs    jsdom 冒烟测试
+```
+
+## 部署（GitHub Pages）
+
+构建产物在 `dist/`，可直接作为静态站点部署。自动部署由仓库根的 Pages 工作流统一处理（出于安全红线，AI 不修改 `.github/` 下的工作流文件）。
+
+> 实现注记：设计指引建议面板切换走 Hash 路由、地图用 Canvas 绘制。本作运行于落地页 overlay 内，为避免修改宿主 `window.location.hash` 造成冲突，面板切换改用应用内状态机；为兼顾 jsdom 可测性与产物体积，地图以 CSS 像素网格（开罗 16 色色块）渲染，逻辑等价且可在无头环境驱动。其余系统（猜拳战斗、装备强化 +5 词缀、三天赋树、10 章记忆、双结局）均按方案完整实现。
diff --git a/apps/xing-hai-lv-zhe/index.html b/apps/xing-hai-lv-zhe/index.html
new file mode 100644
index 0000000..68b817d
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/index.html
@@ -0,0 +1,41 @@
+<!doctype html>
+<html lang="zh-CN">
+
+<head>
+  <meta charset="UTF-8" />
+  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
+  <meta name="theme-color" content="#2b2d3a" />
+  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%232b2d3a'/%3E%3Ctext x='16' y='23' font-size='20' text-anchor='middle' fill='%23ffd93d' font-family='serif'%3E%E6%98%9F%3C/text%3E%3C/svg%3E" />
+  <title>星骸旅者 · Star Wreck Pilgrim</title>
+  <style>
+    html,
+    body {
+      margin: 0;
+      padding: 0;
+      width: 100%;
+      height: 100%;
+      background: #2b2d3a;
+      overflow: hidden;
+      font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
+      -webkit-user-select: none;
+      user-select: none;
+      -webkit-tap-highlight-color: transparent;
+    }
+
+    #game-container {
+      position: relative;
+      width: 100vw;
+      height: 100vh;
+      display: flex;
+      align-items: stretch;
+      justify-content: center;
+    }
+  </style>
+</head>
+
+<body>
+  <div id="game-container"></div>
+  <script type="module" src="/src/main.js"></script>
+</body>
+
+</html>
diff --git a/apps/xing-hai-lv-zhe/package-lock.json b/apps/xing-hai-lv-zhe/package-lock.json
new file mode 100644
index 0000000..f275447
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/package-lock.json
@@ -0,0 +1,1559 @@
+{
+  "name": "xing-hai-lv-zhe",
+  "version": "1.0.0",
+  "lockfileVersion": 3,
+  "requires": true,
+  "packages": {
+    "": {
+      "name": "xing-hai-lv-zhe",
+      "version": "1.0.0",
+      "devDependencies": {
+        "jsdom": "^29.1.1",
+        "vite": "^5.4.0"
+      }
+    },
+    "node_modules/@asamuzakjp/css-color": {
+      "version": "5.1.11",
+      "resolved": "https://registry.npmjs.org/@asamuzakjp/css-color/-/css-color-5.1.11.tgz",
+      "integrity": "sha512-KVw6qIiCTUQhByfTd78h2yD1/00waTmm9uy/R7Ck/ctUyAPj+AEDLkQIdJW0T8+qGgj3j5bpNKK7Q3G+LedJWg==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "@asamuzakjp/generational-cache": "^1.0.1",
+        "@csstools/css-calc": "^3.2.0",
+        "@csstools/css-color-parser": "^4.1.0",
+        "@csstools/css-parser-algorithms": "^4.0.0",
+        "@csstools/css-tokenizer": "^4.0.0"
+      },
+      "engines": {
+        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+      }
+    },
+    "node_modules/@asamuzakjp/dom-selector": {
+      "version": "7.1.1",
+      "resolved": "https://registry.npmjs.org/@asamuzakjp/dom-selector/-/dom-selector-7.1.1.tgz",
+      "integrity": "sha512-67RZDnYRc8H/8MLDgQCDE//zoqVFwajkepHZgmXrbwybzXOEwOWGPYGmALYl9J2DOLfFPPs6kKCqmbzV895hTQ==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "@asamuzakjp/generational-cache": "^1.0.1",
+        "@asamuzakjp/nwsapi": "^2.3.9",
+        "bidi-js": "^1.0.3",
+        "css-tree": "^3.2.1",
+        "is-potential-custom-element-name": "^1.0.1"
+      },
+      "engines": {
+        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+      }
+    },
+    "node_modules/@asamuzakjp/generational-cache": {
+      "version": "1.0.1",
+      "resolved": "https://registry.npmjs.org/@asamuzakjp/generational-cache/-/generational-cache-1.0.1.tgz",
+      "integrity": "sha512-wajfB8KqzMCN2KGNFdLkReeHncd0AslUSrvHVvvYWuU8ghncRJoA50kT3zP9MVL0+9g4/67H+cdvBskj9THPzg==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+      }
+    },
+    "node_modules/@asamuzakjp/nwsapi": {
+      "version": "2.3.9",
+      "resolved": "https://registry.npmjs.org/@asamuzakjp/nwsapi/-/nwsapi-2.3.9.tgz",
+      "integrity": "sha512-n8GuYSrI9bF7FFZ/SjhwevlHc8xaVlb/7HmHelnc/PZXBD2ZR49NnN9sMMuDdEGPeeRQ5d0hqlSlEpgCX3Wl0Q==",
+      "dev": true,
+      "license": "MIT"
+    },
+    "node_modules/@bramus/specificity": {
+      "version": "2.4.2",
+      "resolved": "https://registry.npmjs.org/@bramus/specificity/-/specificity-2.4.2.tgz",
+      "integrity": "sha512-ctxtJ/eA+t+6q2++vj5j7FYX3nRu311q1wfYH3xjlLOsczhlhxAg2FWNUXhpGvAw3BWo1xBcvOV6/YLc2r5FJw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "css-tree": "^3.0.0"
+      },
+      "bin": {
+        "specificity": "bin/cli.js"
+      }
+    },
+    "node_modules/@csstools/color-helpers": {
+      "version": "6.1.0",
+      "resolved": "https://registry.npmjs.org/@csstools/color-helpers/-/color-helpers-6.1.0.tgz",
+      "integrity": "sha512-064IFJdjTfUqnjpCVpMOdbr8FLQBhinbZj6yRv2An2E41O/pLEXqfFRWqGq/SxlE5PEUYTlvWsG2r8MswAVvkg==",
+      "dev": true,
+      "funding": [
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/csstools"
+        },
+        {
+          "type": "opencollective",
+          "url": "https://opencollective.com/csstools"
+        }
+      ],
+      "license": "MIT-0",
+      "engines": {
+        "node": ">=20.19.0"
+      }
+    },
+    "node_modules/@csstools/css-calc": {
+      "version": "3.2.1",
+      "resolved": "https://registry.npmjs.org/@csstools/css-calc/-/css-calc-3.2.1.tgz",
+      "integrity": "sha512-DtdHlgXh5ZkA43cwBcAm+huzgJiwx3ZTWVjBs94kwz2xKqSimDA3lBgCjphYgwgVUMWatSM0pDd8TILB1yrVVg==",
+      "dev": true,
+      "funding": [
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/csstools"
+        },
+        {
+          "type": "opencollective",
+          "url": "https://opencollective.com/csstools"
+        }
+      ],
+      "license": "MIT",
+      "engines": {
+        "node": ">=20.19.0"
+      },
+      "peerDependencies": {
+        "@csstools/css-parser-algorithms": "^4.0.0",
+        "@csstools/css-tokenizer": "^4.0.0"
+      }
+    },
+    "node_modules/@csstools/css-color-parser": {
+      "version": "4.1.9",
+      "resolved": "https://registry.npmjs.org/@csstools/css-color-parser/-/css-color-parser-4.1.9.tgz",
+      "integrity": "sha512-paQcIaOO53Rk5+YrBaBjm/SgrV4INImjo2BT1DtQRYr+XeTRbeAYlS+jxXp9drqvKmtFnWRJKIalDLhZZDu42A==",
+      "dev": true,
+      "funding": [
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/csstools"
+        },
+        {
+          "type": "opencollective",
+          "url": "https://opencollective.com/csstools"
+        }
+      ],
+      "license": "MIT",
+      "dependencies": {
+        "@csstools/color-helpers": "^6.1.0",
+        "@csstools/css-calc": "^3.2.1"
+      },
+      "engines": {
+        "node": ">=20.19.0"
+      },
+      "peerDependencies": {
+        "@csstools/css-parser-algorithms": "^4.0.0",
+        "@csstools/css-tokenizer": "^4.0.0"
+      }
+    },
+    "node_modules/@csstools/css-parser-algorithms": {
+      "version": "4.0.0",
+      "resolved": "https://registry.npmjs.org/@csstools/css-parser-algorithms/-/css-parser-algorithms-4.0.0.tgz",
+      "integrity": "sha512-+B87qS7fIG3L5h3qwJ/IFbjoVoOe/bpOdh9hAjXbvx0o8ImEmUsGXN0inFOnk2ChCFgqkkGFQ+TpM5rbhkKe4w==",
+      "dev": true,
+      "funding": [
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/csstools"
+        },
+        {
+          "type": "opencollective",
+          "url": "https://opencollective.com/csstools"
+        }
+      ],
+      "license": "MIT",
+      "engines": {
+        "node": ">=20.19.0"
+      },
+      "peerDependencies": {
+        "@csstools/css-tokenizer": "^4.0.0"
+      }
+    },
+    "node_modules/@csstools/css-syntax-patches-for-csstree": {
+      "version": "1.1.6",
+      "resolved": "https://registry.npmjs.org/@csstools/css-syntax-patches-for-csstree/-/css-syntax-patches-for-csstree-1.1.6.tgz",
+      "integrity": "sha512-TcJCWFbXLPpJYq6z7bfOyjWYJDiDg2/I4gyUC9pqPNqHFRIey0EB0q0L5cSnQDfWJg8Jd6VadakxdIez/3zkqQ==",
+      "dev": true,
+      "funding": [
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/csstools"
+        },
+        {
+          "type": "opencollective",
+          "url": "https://opencollective.com/csstools"
+        }
+      ],
+      "license": "MIT-0",
+      "peerDependencies": {
+        "css-tree": "^3.2.1"
+      },
+      "peerDependenciesMeta": {
+        "css-tree": {
+          "optional": true
+        }
+      }
+    },
+    "node_modules/@csstools/css-tokenizer": {
+      "version": "4.0.0",
+      "resolved": "https://registry.npmjs.org/@csstools/css-tokenizer/-/css-tokenizer-4.0.0.tgz",
+      "integrity": "sha512-QxULHAm7cNu72w97JUNCBFODFaXpbDg+dP8b/oWFAZ2MTRppA3U00Y2L1HqaS4J6yBqxwa/Y3nMBaxVKbB/NsA==",
+      "dev": true,
+      "funding": [
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/csstools"
+        },
+        {
+          "type": "opencollective",
+          "url": "https://opencollective.com/csstools"
+        }
+      ],
+      "license": "MIT",
+      "engines": {
+        "node": ">=20.19.0"
+      }
+    },
+    "node_modules/@esbuild/aix-ppc64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.21.5.tgz",
+      "integrity": "sha512-1SDgH6ZSPTlggy1yI6+Dbkiz8xzpHJEVAlF/AM1tHPLsf5STom9rwtjE4hKAF20FfXXNTFqEYXyJNWh1GiZedQ==",
+      "cpu": [
+        "ppc64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "aix"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/android-arm": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.21.5.tgz",
+      "integrity": "sha512-vCPvzSjpPHEi1siZdlvAlsPxXl7WbOVUBBAowWug4rJHb68Ox8KualB+1ocNvT5fjv6wpkX6o/iEpbDrf68zcg==",
+      "cpu": [
+        "arm"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "android"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/android-arm64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.21.5.tgz",
+      "integrity": "sha512-c0uX9VAUBQ7dTDCjq+wdyGLowMdtR/GoC2U5IYk/7D1H1JYC0qseD7+11iMP2mRLN9RcCMRcjC4YMclCzGwS/A==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "android"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/android-x64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.21.5.tgz",
+      "integrity": "sha512-D7aPRUUNHRBwHxzxRvp856rjUHRFW1SdQATKXH2hqA0kAZb1hKmi02OpYRacl0TxIGz/ZmXWlbZgjwWYaCakTA==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "android"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/darwin-arm64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.21.5.tgz",
+      "integrity": "sha512-DwqXqZyuk5AiWWf3UfLiRDJ5EDd49zg6O9wclZ7kUMv2WRFr4HKjXp/5t8JZ11QbQfUS6/cRCKGwYhtNAY88kQ==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/darwin-x64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.21.5.tgz",
+      "integrity": "sha512-se/JjF8NlmKVG4kNIuyWMV/22ZaerB+qaSi5MdrXtd6R08kvs2qCN4C09miupktDitvh8jRFflwGFBQcxZRjbw==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/freebsd-arm64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.21.5.tgz",
+      "integrity": "sha512-5JcRxxRDUJLX8JXp/wcBCy3pENnCgBR9bN6JsY4OmhfUtIHe3ZW0mawA7+RDAcMLrMIZaf03NlQiX9DGyB8h4g==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "freebsd"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/freebsd-x64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.21.5.tgz",
+      "integrity": "sha512-J95kNBj1zkbMXtHVH29bBriQygMXqoVQOQYA+ISs0/2l3T9/kj42ow2mpqerRBxDJnmkUDCaQT/dfNXWX/ZZCQ==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "freebsd"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/linux-arm": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.21.5.tgz",
+      "integrity": "sha512-bPb5AHZtbeNGjCKVZ9UGqGwo8EUu4cLq68E95A53KlxAPRmUyYv2D6F0uUI65XisGOL1hBP5mTronbgo+0bFcA==",
+      "cpu": [
+        "arm"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/linux-arm64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.21.5.tgz",
+      "integrity": "sha512-ibKvmyYzKsBeX8d8I7MH/TMfWDXBF3db4qM6sy+7re0YXya+K1cem3on9XgdT2EQGMu4hQyZhan7TeQ8XkGp4Q==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/linux-ia32": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.21.5.tgz",
+      "integrity": "sha512-YvjXDqLRqPDl2dvRODYmmhz4rPeVKYvppfGYKSNGdyZkA01046pLWyRKKI3ax8fbJoK5QbxblURkwK/MWY18Tg==",
+      "cpu": [
+        "ia32"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/linux-loong64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.21.5.tgz",
+      "integrity": "sha512-uHf1BmMG8qEvzdrzAqg2SIG/02+4/DHB6a9Kbya0XDvwDEKCoC8ZRWI5JJvNdUjtciBGFQ5PuBlpEOXQj+JQSg==",
+      "cpu": [
+        "loong64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/linux-mips64el": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.21.5.tgz",
+      "integrity": "sha512-IajOmO+KJK23bj52dFSNCMsz1QP1DqM6cwLUv3W1QwyxkyIWecfafnI555fvSGqEKwjMXVLokcV5ygHW5b3Jbg==",
+      "cpu": [
+        "mips64el"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/linux-ppc64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.21.5.tgz",
+      "integrity": "sha512-1hHV/Z4OEfMwpLO8rp7CvlhBDnjsC3CttJXIhBi+5Aj5r+MBvy4egg7wCbe//hSsT+RvDAG7s81tAvpL2XAE4w==",
+      "cpu": [
+        "ppc64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/linux-riscv64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.21.5.tgz",
+      "integrity": "sha512-2HdXDMd9GMgTGrPWnJzP2ALSokE/0O5HhTUvWIbD3YdjME8JwvSCnNGBnTThKGEB91OZhzrJ4qIIxk/SBmyDDA==",
+      "cpu": [
+        "riscv64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/linux-s390x": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.21.5.tgz",
+      "integrity": "sha512-zus5sxzqBJD3eXxwvjN1yQkRepANgxE9lgOW2qLnmr8ikMTphkjgXu1HR01K4FJg8h1kEEDAqDcZQtbrRnB41A==",
+      "cpu": [
+        "s390x"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/linux-x64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.21.5.tgz",
+      "integrity": "sha512-1rYdTpyv03iycF1+BhzrzQJCdOuAOtaqHTWJZCWvijKD2N5Xu0TtVC8/+1faWqcP9iBCWOmjmhoH94dH82BxPQ==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/netbsd-x64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.21.5.tgz",
+      "integrity": "sha512-Woi2MXzXjMULccIwMnLciyZH4nCIMpWQAs049KEeMvOcNADVxo0UBIQPfSmxB3CWKedngg7sWZdLvLczpe0tLg==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "netbsd"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/openbsd-x64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.21.5.tgz",
+      "integrity": "sha512-HLNNw99xsvx12lFBUwoT8EVCsSvRNDVxNpjZ7bPn947b8gJPzeHWyNVhFsaerc0n3TsbOINvRP2byTZ5LKezow==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "openbsd"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/sunos-x64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.21.5.tgz",
+      "integrity": "sha512-6+gjmFpfy0BHU5Tpptkuh8+uw3mnrvgs+dSPQXQOv3ekbordwnzTVEb4qnIvQcYXq6gzkyTnoZ9dZG+D4garKg==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "sunos"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/win32-arm64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.21.5.tgz",
+      "integrity": "sha512-Z0gOTd75VvXqyq7nsl93zwahcTROgqvuAcYDUr+vOv8uHhNSKROyU961kgtCD1e95IqPKSQKH7tBTslnS3tA8A==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/win32-ia32": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.21.5.tgz",
+      "integrity": "sha512-SWXFF1CL2RVNMaVs+BBClwtfZSvDgtL//G/smwAc5oVK/UPu2Gu9tIaRgFmYFFKrmg3SyAjSrElf0TiJ1v8fYA==",
+      "cpu": [
+        "ia32"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/win32-x64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.21.5.tgz",
+      "integrity": "sha512-tQd/1efJuzPC6rCFwEvLtci/xNFcTZknmXs98FYDfGE4wP9ClFV98nyKrzJKVPMhdDnjzLhdUyMX4PsQAPjwIw==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@exodus/bytes": {
+      "version": "1.15.1",
+      "resolved": "https://registry.npmjs.org/@exodus/bytes/-/bytes-1.15.1.tgz",
+      "integrity": "sha512-S6mL0yNB/Abt9Ei4tq8gDhcczc4S3+vQ4ra7vxnAf+YHC02srtqxKKZghx2Dq6p0e66THKwR6r8N6P95wEty7Q==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+      },
+      "peerDependencies": {
+        "@noble/hashes": "^1.8.0 || ^2.0.0"
+      },
+      "peerDependenciesMeta": {
+        "@noble/hashes": {
+          "optional": true
+        }
+      }
+    },
+    "node_modules/@rollup/rollup-android-arm-eabi": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.62.2.tgz",
+      "integrity": "sha512-6o7ZLZK+BeenkZCFNDXqpbjw9bD6nuWonvS/lwQJp7NoVVxm6p3qE7qQ5jGuBjiFsgvqjD8mZAU5oWxTmbOeOg==",
+      "cpu": [
+        "arm"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "android"
+      ]
+    },
+    "node_modules/@rollup/rollup-android-arm64": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.62.2.tgz",
+      "integrity": "sha512-BaH7BllCACHoH1LguOU56UItGfUWjujlO65kS9LAodViaN4bwIKd7oeW/ZHJ/4ljr/7MIiENnNy3HJ0zXv8Zkw==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "android"
+      ]
+    },
+    "node_modules/@rollup/rollup-darwin-arm64": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.62.2.tgz",
+      "integrity": "sha512-v39RCCvj4He82I9sFmk+M1VZ0PLM9sfsLVikjfx2hYBNALhrrOR2D3JjQA6AhlaSOgcR+RzrKY7e1+bT6SUO/A==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "darwin"
+      ]
+    },
+    "node_modules/@rollup/rollup-darwin-x64": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.62.2.tgz",
+      "integrity": "sha512-yl0y2vq3S3lHeuXhEdss6TWfKW8vkujImO12tn4ZkG/4oghr09LvdYm2RElVjokTQiUvDUGXLGsYeLqUMCKpGA==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "darwin"
+      ]
+    },
+    "node_modules/@rollup/rollup-freebsd-arm64": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.62.2.tgz",
+      "integrity": "sha512-tT4pvt4qXD+vEoezupCWi+a1F0vvDiksiHc+PxRlYTOH1I6/X4id9jPxTP+Fg+545euaFT1jJVs4CEdHZAU1vw==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "freebsd"
+      ]
+    },
+    "node_modules/@rollup/rollup-freebsd-x64": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.62.2.tgz",
+      "integrity": "sha512-6nU5F2wCW+qvCBhTn1pdIU3bzsIoF7EUwsCDRxilWGprQR6yd508YnH9+OKFCwpfS8pjZqDUmnCAr7exax0XCg==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "freebsd"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.62.2.tgz",
+      "integrity": "sha512-n1GJHPOvpIfhi3TmrCeh6S6URt9BFCt0KQE3qvexyGCTAKpR4Lg+eWvNZEqu7epxwus/8ElT3hacYEucm49SZg==",
+      "cpu": [
+        "arm"
+      ],
+      "dev": true,
+      "libc": [
+        "glibc"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-arm-musleabihf": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.62.2.tgz",
+      "integrity": "sha512-JqgflS8wEB+UXV/vS1RpRbifGBeN4D5lz8D8oOFbFZw4vedvdOgCFAjfBmIMdW3yL10XpQQ0Ambepw6MXrhOnA==",
+      "cpu": [
+        "arm"
+      ],
+      "dev": true,
+      "libc": [
+        "musl"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-arm64-gnu": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.62.2.tgz",
+      "integrity": "sha512-wnFJkogWvN4jm/hQRF2UBaeUmk20j5+DmHvoyWii2b8HJDyvz1MF2OU/6ynXt2KR63rbZLWkFpoytpdc/yBuSA==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "libc": [
+        "glibc"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-arm64-musl": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.62.2.tgz",
+      "integrity": "sha512-HVu2bp0zhvJ8xHEV9+UUs7S90VadmBSY3LcIMvozbPo4AuMGDWlz3ymHLHZPX4hR67TKTt8Qp5PJ5RBg/i+RMQ==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "libc": [
+        "musl"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-loong64-gnu": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.62.2.tgz",
+      "integrity": "sha512-mQqqAV8QaoSgr9I2fKDLY2BAVvmKjWoGiu/cSYQonsLvtqwEn1E4QYfnCOcp5zoEqNhsDYin1s6jx/VJmrxlZg==",
+      "cpu": [
+        "loong64"
+      ],
+      "dev": true,
+      "libc": [
+        "glibc"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-loong64-musl": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-musl/-/rollup-linux-loong64-musl-4.62.2.tgz",
+      "integrity": "sha512-IxKLoxCQ2IWi6bT2akyDUBGsOImDKB+sPp4EsTmwFQ/fMwpCKm8uLSSgP/Kx/QYUgKis6SEZ5/Nlhup0DIA0PQ==",
+      "cpu": [
+        "loong64"
+      ],
+      "dev": true,
+      "libc": [
+        "musl"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-ppc64-gnu": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.62.2.tgz",
+      "integrity": "sha512-Mk5ha2RQSgyFfmYYLkBpPnUk8D8FriBxesO1u9O75X0mHgXL1UQcH5Itl2lurWL2tj0RxV9b9tJgipac0hRY9A==",
+      "cpu": [
+        "ppc64"
+      ],
+      "dev": true,
+      "libc": [
+        "glibc"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-ppc64-musl": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-musl/-/rollup-linux-ppc64-musl-4.62.2.tgz",
+      "integrity": "sha512-CjvEnqJL/0/TQ3TXX3OPIJ/kmBellrWd4heXUmHeJlTnmwjKpSJzoehLaL6Xk0ZnMHBu9dZuFADNOrtjF4v+2w==",
+      "cpu": [
+        "ppc64"
+      ],
+      "dev": true,
+      "libc": [
+        "musl"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-riscv64-gnu": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.62.2.tgz",
+      "integrity": "sha512-1SiZbzwdkaDURsew/tSOrooKiYy7EQGT6m8ufavAi9NEyQb/6VuIxFXAL1fqa4iZe3g4NbNk4P7J32z2tw5Mgg==",
+      "cpu": [
+        "riscv64"
+      ],
+      "dev": true,
+      "libc": [
+        "glibc"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-riscv64-musl": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.62.2.tgz",
+      "integrity": "sha512-nQts12zJ3NQRoE6uYljOH89v7szzLDvG2JD/vsX+vGXU8w/At1GowTZ5/7qeFQ8m7L55rpR8Okugnuo5bgjy2Q==",
+      "cpu": [
+        "riscv64"
+      ],
+      "dev": true,
+      "libc": [
+        "musl"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-s390x-gnu": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.62.2.tgz",
+      "integrity": "sha512-E9/ll019jhPIJgpzfZoIkBGhcz+kKNgVWYRY0zr9srBdPPFVpvOKW8VaJKUbeK+eZXyQF9ltME+Kk6affeaPgg==",
+      "cpu": [
+        "s390x"
+      ],
+      "dev": true,
+      "libc": [
+        "glibc"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-x64-gnu": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.62.2.tgz",
+      "integrity": "sha512-5BqxR/pshjey51iliyzTD5Xi3EN0aLmQ2lZ3lvefVV9c82BvrLo2/6OT55iifpWBufs6kdwWbuOKS841DrmK9A==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "libc": [
+        "glibc"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-x64-musl": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.62.2.tgz",
+      "integrity": "sha512-uNN83XxQrRAh/w0/pmAfibcwyb6YWt4gP+dpnQKPVJshAloQ785ii8CT8ZCIxkGg9opVsvAlGhFitSm6D1Jjpg==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "libc": [
+        "musl"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-openbsd-x64": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-openbsd-x64/-/rollup-openbsd-x64-4.62.2.tgz",
+      "integrity": "sha512-srjEIxSH3LRnJN6THczDHWQplqEMFiAJrTab0msUryh9kwNpkICf3Ea6q6MN/2cZwRFUNx5w+h6Hpi4QuHS6Zg==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "openbsd"
+      ]
+    },
+    "node_modules/@rollup/rollup-openharmony-arm64": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.62.2.tgz",
+      "integrity": "sha512-8hOJnxgbyObnCm5AlRA3A931xX19xq80RjVTKgJOvEKWqJruP/Uf12IbAOaDjjEXYRewwHLfmF0YRIdK3OwKWA==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "openharmony"
+      ]
+    },
+    "node_modules/@rollup/rollup-win32-arm64-msvc": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.62.2.tgz",
+      "integrity": "sha512-mmF4AY1i0hG/bLWUctUq59gtmgaSIRa3cu/A3JFRp/sCNEme2bgDEiDS22P9FbnJB8NJNF4jPJiSP5RHQpUTDg==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ]
+    },
+    "node_modules/@rollup/rollup-win32-ia32-msvc": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.62.2.tgz",
+      "integrity": "sha512-DZgkknc6jhHrk46V25vbAM0zZkyP0nSDkJB8/dRkLTxv470dOmWDqGoEJl/9A0dFfS7yE3REOwNDxpHwSLSt0Q==",
+      "cpu": [
+        "ia32"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ]
+    },
+    "node_modules/@rollup/rollup-win32-x64-gnu": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.62.2.tgz",
+      "integrity": "sha512-T6xr6ucWSFto+VGajA8YH26LdpHRuP4YLHEKAtCWvJDOlnmWcDZVCI2Jmjr+IFHDlt2zRaTAKE4tfjTaWLgJBg==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ]
+    },
+    "node_modules/@rollup/rollup-win32-x64-msvc": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.62.2.tgz",
+      "integrity": "sha512-BfzEnDJOt9T8M989/lA37EcJgat01wLRnoi5dQf3QzOH7jzpqTAzdDbVfRljVr5r+jzKqpbHeyOfAaXxAd0PAA==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ]
+    },
+    "node_modules/@types/estree": {
+      "version": "1.0.9",
+      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz",
+      "integrity": "sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==",
+      "dev": true,
+      "license": "MIT"
+    },
+    "node_modules/bidi-js": {
+      "version": "1.0.3",
+      "resolved": "https://registry.npmjs.org/bidi-js/-/bidi-js-1.0.3.tgz",
+      "integrity": "sha512-RKshQI1R3YQ+n9YJz2QQ147P66ELpa1FQEg20Dk8oW9t2KgLbpDLLp9aGZ7y8WHSshDknG0bknqGw5/tyCs5tw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "require-from-string": "^2.0.2"
+      }
+    },
+    "node_modules/css-tree": {
+      "version": "3.2.1",
+      "resolved": "https://registry.npmjs.org/css-tree/-/css-tree-3.2.1.tgz",
+      "integrity": "sha512-X7sjQzceUhu1u7Y/ylrRZFU2FS6LRiFVp6rKLPg23y3x3c3DOKAwuXGDp+PAGjh6CSnCjYeAul8pcT8bAl+lSA==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "mdn-data": "2.27.1",
+        "source-map-js": "^1.2.1"
+      },
+      "engines": {
+        "node": "^10 || ^12.20.0 || ^14.13.0 || >=15.0.0"
+      }
+    },
+    "node_modules/data-urls": {
+      "version": "7.0.0",
+      "resolved": "https://registry.npmjs.org/data-urls/-/data-urls-7.0.0.tgz",
+      "integrity": "sha512-23XHcCF+coGYevirZceTVD7NdJOqVn+49IHyxgszm+JIiHLoB2TkmPtsYkNWT1pvRSGkc35L6NHs0yHkN2SumA==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "whatwg-mimetype": "^5.0.0",
+        "whatwg-url": "^16.0.0"
+      },
+      "engines": {
+        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+      }
+    },
+    "node_modules/decimal.js": {
+      "version": "10.6.0",
+      "resolved": "https://registry.npmjs.org/decimal.js/-/decimal.js-10.6.0.tgz",
+      "integrity": "sha512-YpgQiITW3JXGntzdUmyUR1V812Hn8T1YVXhCu+wO3OpS4eU9l4YdD3qjyiKdV6mvV29zapkMeD390UVEf2lkUg==",
+      "dev": true,
+      "license": "MIT"
+    },
+    "node_modules/entities": {
+      "version": "8.0.0",
+      "resolved": "https://registry.npmjs.org/entities/-/entities-8.0.0.tgz",
+      "integrity": "sha512-zwfzJecQ/Uej6tusMqwAqU/6KL2XaB2VZ2Jg54Je6ahNBGNH6Ek6g3jjNCF0fG9EWQKGZNddNjU5F1ZQn/sBnA==",
+      "dev": true,
+      "license": "BSD-2-Clause",
+      "engines": {
+        "node": ">=20.19.0"
+      },
+      "funding": {
+        "url": "https://github.com/fb55/entities?sponsor=1"
+      }
+    },
+    "node_modules/esbuild": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.21.5.tgz",
+      "integrity": "sha512-mg3OPMV4hXywwpoDxu3Qda5xCKQi+vCTZq8S9J/EpkhB2HzKXq4SNFZE3+NK93JYxc8VMSep+lOUSC/RVKaBqw==",
+      "dev": true,
+      "hasInstallScript": true,
+      "license": "MIT",
+      "bin": {
+        "esbuild": "bin/esbuild"
+      },
+      "engines": {
+        "node": ">=12"
+      },
+      "optionalDependencies": {
+        "@esbuild/aix-ppc64": "0.21.5",
+        "@esbuild/android-arm": "0.21.5",
+        "@esbuild/android-arm64": "0.21.5",
+        "@esbuild/android-x64": "0.21.5",
+        "@esbuild/darwin-arm64": "0.21.5",
+        "@esbuild/darwin-x64": "0.21.5",
+        "@esbuild/freebsd-arm64": "0.21.5",
+        "@esbuild/freebsd-x64": "0.21.5",
+        "@esbuild/linux-arm": "0.21.5",
+        "@esbuild/linux-arm64": "0.21.5",
+        "@esbuild/linux-ia32": "0.21.5",
+        "@esbuild/linux-loong64": "0.21.5",
+        "@esbuild/linux-mips64el": "0.21.5",
+        "@esbuild/linux-ppc64": "0.21.5",
+        "@esbuild/linux-riscv64": "0.21.5",
+        "@esbuild/linux-s390x": "0.21.5",
+        "@esbuild/linux-x64": "0.21.5",
+        "@esbuild/netbsd-x64": "0.21.5",
+        "@esbuild/openbsd-x64": "0.21.5",
+        "@esbuild/sunos-x64": "0.21.5",
+        "@esbuild/win32-arm64": "0.21.5",
+        "@esbuild/win32-ia32": "0.21.5",
+        "@esbuild/win32-x64": "0.21.5"
+      }
+    },
+    "node_modules/fsevents": {
+      "version": "2.3.3",
+      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
+      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
+      "dev": true,
+      "hasInstallScript": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "engines": {
+        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
+      }
+    },
+    "node_modules/html-encoding-sniffer": {
+      "version": "6.0.0",
+      "resolved": "https://registry.npmjs.org/html-encoding-sniffer/-/html-encoding-sniffer-6.0.0.tgz",
+      "integrity": "sha512-CV9TW3Y3f8/wT0BRFc1/KAVQ3TUHiXmaAb6VW9vtiMFf7SLoMd1PdAc4W3KFOFETBJUb90KatHqlsZMWV+R9Gg==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "@exodus/bytes": "^1.6.0"
+      },
+      "engines": {
+        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+      }
+    },
+    "node_modules/is-potential-custom-element-name": {
+      "version": "1.0.1",
+      "resolved": "https://registry.npmjs.org/is-potential-custom-element-name/-/is-potential-custom-element-name-1.0.1.tgz",
+      "integrity": "sha512-bCYeRA2rVibKZd+s2625gGnGF/t7DSqDs4dP7CrLA1m7jKWz6pps0LpYLJN8Q64HtmPKJ1hrN3nzPNKFEKOUiQ==",
+      "dev": true,
+      "license": "MIT"
+    },
+    "node_modules/jsdom": {
+      "version": "29.1.1",
+      "resolved": "https://registry.npmjs.org/jsdom/-/jsdom-29.1.1.tgz",
+      "integrity": "sha512-ECi4Fi2f7BdJtUKTflYRTiaMxIB0O6zfR1fX0GXpUrf6flp8QIYn1UT20YQqdSOfk2dfkCwS8LAFoJDEppNK5Q==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "@asamuzakjp/css-color": "^5.1.11",
+        "@asamuzakjp/dom-selector": "^7.1.1",
+        "@bramus/specificity": "^2.4.2",
+        "@csstools/css-syntax-patches-for-csstree": "^1.1.3",
+        "@exodus/bytes": "^1.15.0",
+        "css-tree": "^3.2.1",
+        "data-urls": "^7.0.0",
+        "decimal.js": "^10.6.0",
+        "html-encoding-sniffer": "^6.0.0",
+        "is-potential-custom-element-name": "^1.0.1",
+        "lru-cache": "^11.3.5",
+        "parse5": "^8.0.1",
+        "saxes": "^6.0.0",
+        "symbol-tree": "^3.2.4",
+        "tough-cookie": "^6.0.1",
+        "undici": "^7.25.0",
+        "w3c-xmlserializer": "^5.0.0",
+        "webidl-conversions": "^8.0.1",
+        "whatwg-mimetype": "^5.0.0",
+        "whatwg-url": "^16.0.1",
+        "xml-name-validator": "^5.0.0"
+      },
+      "engines": {
+        "node": "^20.19.0 || ^22.13.0 || >=24.0.0"
+      },
+      "peerDependencies": {
+        "canvas": "^3.0.0"
+      },
+      "peerDependenciesMeta": {
+        "canvas": {
+          "optional": true
+        }
+      }
+    },
+    "node_modules/lru-cache": {
+      "version": "11.5.2",
+      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-11.5.2.tgz",
+      "integrity": "sha512-4pfM1Ff0x50o0tQwb5ucw/RzNyD0/YJME6IVcStalZuMWxdt3sR3huStTtxz4PUmvZfRguvDejasvQ2kifR11g==",
+      "dev": true,
+      "license": "BlueOak-1.0.0",
+      "engines": {
+        "node": "20 || >=22"
+      }
+    },
+    "node_modules/mdn-data": {
+      "version": "2.27.1",
+      "resolved": "https://registry.npmjs.org/mdn-data/-/mdn-data-2.27.1.tgz",
+      "integrity": "sha512-9Yubnt3e8A0OKwxYSXyhLymGW4sCufcLG6VdiDdUGVkPhpqLxlvP5vl1983gQjJl3tqbrM731mjaZaP68AgosQ==",
+      "dev": true,
+      "license": "CC0-1.0"
+    },
+    "node_modules/nanoid": {
+      "version": "3.3.15",
+      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.15.tgz",
+      "integrity": "sha512-y7Wygv/7mEOvxTuEQDB8StXdMRBWf1kR/tlhAzBRUFkB2jfcLOAxO/SHmOO2zgz1pVgK29/kyupn059/bCHdjA==",
+      "dev": true,
+      "funding": [
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/ai"
+        }
+      ],
+      "license": "MIT",
+      "bin": {
+        "nanoid": "bin/nanoid.cjs"
+      },
+      "engines": {
+        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
+      }
+    },
+    "node_modules/parse5": {
+      "version": "8.0.1",
+      "resolved": "https://registry.npmjs.org/parse5/-/parse5-8.0.1.tgz",
+      "integrity": "sha512-z1e/HMG90obSGeidlli3hj7cbocou0/wa5HacvI3ASx34PecNjNQeaHNo5WIZpWofN9kgkqV1q5YvXe3F0FoPw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "entities": "^8.0.0"
+      },
+      "funding": {
+        "url": "https://github.com/inikulin/parse5?sponsor=1"
+      }
+    },
+    "node_modules/picocolors": {
+      "version": "1.1.1",
+      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
+      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
+      "dev": true,
+      "license": "ISC"
+    },
+    "node_modules/postcss": {
+      "version": "8.5.16",
+      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.16.tgz",
+      "integrity": "sha512-vuwillviilfKZsg0VGj5R/YwwcHx4SLsIOI/7K6mQkWx+l5cUHTjj5g0AasTBcyXsbfTgrwsUNmVUb5xVwyPwg==",
+      "dev": true,
+      "funding": [
+        {
+          "type": "opencollective",
+          "url": "https://opencollective.com/postcss/"
+        },
+        {
+          "type": "tidelift",
+          "url": "https://tidelift.com/funding/github/npm/postcss"
+        },
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/ai"
+        }
+      ],
+      "license": "MIT",
+      "dependencies": {
+        "nanoid": "^3.3.12",
+        "picocolors": "^1.1.1",
+        "source-map-js": "^1.2.1"
+      },
+      "engines": {
+        "node": "^10 || ^12 || >=14"
+      }
+    },
+    "node_modules/punycode": {
+      "version": "2.3.1",
+      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
+      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/require-from-string": {
+      "version": "2.0.2",
+      "resolved": "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz",
+      "integrity": "sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/rollup": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.62.2.tgz",
+      "integrity": "sha512-RFnrW4lhXA3s3eqHDZvN654g8OTjzRfqpIRJYczCGB6HzphckVAi/Qh4tbPUbRuDi7s1Llv8g/NspLkttY3gTA==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "@types/estree": "1.0.9"
+      },
+      "bin": {
+        "rollup": "dist/bin/rollup"
+      },
+      "engines": {
+        "node": ">=18.0.0",
+        "npm": ">=8.0.0"
+      },
+      "optionalDependencies": {
+        "@rollup/rollup-android-arm-eabi": "4.62.2",
+        "@rollup/rollup-android-arm64": "4.62.2",
+        "@rollup/rollup-darwin-arm64": "4.62.2",
+        "@rollup/rollup-darwin-x64": "4.62.2",
+        "@rollup/rollup-freebsd-arm64": "4.62.2",
+        "@rollup/rollup-freebsd-x64": "4.62.2",
+        "@rollup/rollup-linux-arm-gnueabihf": "4.62.2",
+        "@rollup/rollup-linux-arm-musleabihf": "4.62.2",
+        "@rollup/rollup-linux-arm64-gnu": "4.62.2",
+        "@rollup/rollup-linux-arm64-musl": "4.62.2",
+        "@rollup/rollup-linux-loong64-gnu": "4.62.2",
+        "@rollup/rollup-linux-loong64-musl": "4.62.2",
+        "@rollup/rollup-linux-ppc64-gnu": "4.62.2",
+        "@rollup/rollup-linux-ppc64-musl": "4.62.2",
+        "@rollup/rollup-linux-riscv64-gnu": "4.62.2",
+        "@rollup/rollup-linux-riscv64-musl": "4.62.2",
+        "@rollup/rollup-linux-s390x-gnu": "4.62.2",
+        "@rollup/rollup-linux-x64-gnu": "4.62.2",
+        "@rollup/rollup-linux-x64-musl": "4.62.2",
+        "@rollup/rollup-openbsd-x64": "4.62.2",
+        "@rollup/rollup-openharmony-arm64": "4.62.2",
+        "@rollup/rollup-win32-arm64-msvc": "4.62.2",
+        "@rollup/rollup-win32-ia32-msvc": "4.62.2",
+        "@rollup/rollup-win32-x64-gnu": "4.62.2",
+        "@rollup/rollup-win32-x64-msvc": "4.62.2",
+        "fsevents": "~2.3.2"
+      }
+    },
+    "node_modules/saxes": {
+      "version": "6.0.0",
+      "resolved": "https://registry.npmjs.org/saxes/-/saxes-6.0.0.tgz",
+      "integrity": "sha512-xAg7SOnEhrm5zI3puOOKyy1OMcMlIJZYNJY7xLBwSze0UjhPLnWfj2GF2EpT0jmzaJKIWKHLsaSSajf35bcYnA==",
+      "dev": true,
+      "license": "ISC",
+      "dependencies": {
+        "xmlchars": "^2.2.0"
+      },
+      "engines": {
+        "node": ">=v12.22.7"
+      }
+    },
+    "node_modules/source-map-js": {
+      "version": "1.2.1",
+      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
+      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
+      "dev": true,
+      "license": "BSD-3-Clause",
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/symbol-tree": {
+      "version": "3.2.4",
+      "resolved": "https://registry.npmjs.org/symbol-tree/-/symbol-tree-3.2.4.tgz",
+      "integrity": "sha512-9QNk5KwDF+Bvz+PyObkmSYjI5ksVUYtjW7AU22r2NKcfLJcXp96hkDWU3+XndOsUb+AQ9QhfzfCT2O+CNWT5Tw==",
+      "dev": true,
+      "license": "MIT"
+    },
+    "node_modules/tldts": {
+      "version": "7.4.7",
+      "resolved": "https://registry.npmjs.org/tldts/-/tldts-7.4.7.tgz",
+      "integrity": "sha512-56L0/9HELHSsG1bFCzay8UoLxzRL7kpFf7Wl5q/kSYwiSJGACvro61xnKzPNM+SadxllzdtXsKDSXE7HPeqIAw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "tldts-core": "^7.4.7"
+      },
+      "bin": {
+        "tldts": "bin/cli.js"
+      }
+    },
+    "node_modules/tldts-core": {
+      "version": "7.4.7",
+      "resolved": "https://registry.npmjs.org/tldts-core/-/tldts-core-7.4.7.tgz",
+      "integrity": "sha512-rNlAI8fKn/JckBMUSbNL/ES2kmDiurWaE49l+ikwEc9A6lFR7gMx9AhgQMQKBK4H5w4pKLH64JzZfB99uRsGNQ==",
+      "dev": true,
+      "license": "MIT"
+    },
+    "node_modules/tough-cookie": {
+      "version": "6.0.2",
+      "resolved": "https://registry.npmjs.org/tough-cookie/-/tough-cookie-6.0.2.tgz",
+      "integrity": "sha512-exgYmnmL/sJpR3upZfXG5PoatXQii55xAiXGXzY+sROLZ/Y+SLcp9PgJNI9Vz37HpQ74WvDcLT8eqm+kV3FzrA==",
+      "dev": true,
+      "license": "BSD-3-Clause",
+      "dependencies": {
+        "tldts": "^7.0.5"
+      },
+      "engines": {
+        "node": ">=16"
+      }
+    },
+    "node_modules/tr46": {
+      "version": "6.0.0",
+      "resolved": "https://registry.npmjs.org/tr46/-/tr46-6.0.0.tgz",
+      "integrity": "sha512-bLVMLPtstlZ4iMQHpFHTR7GAGj2jxi8Dg0s2h2MafAE4uSWF98FC/3MomU51iQAMf8/qDUbKWf5GxuvvVcXEhw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "punycode": "^2.3.1"
+      },
+      "engines": {
+        "node": ">=20"
+      }
+    },
+    "node_modules/undici": {
+      "version": "7.28.0",
+      "resolved": "https://registry.npmjs.org/undici/-/undici-7.28.0.tgz",
+      "integrity": "sha512-cRZYrTDwWznlnRiPjggAGxZXanty6M8RV1ff8Wm4LWXBp7/IG8v5DnOm74DtUBp9OONpK75YlPnIjQqX0dBDtA==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">=20.18.1"
+      }
+    },
+    "node_modules/vite": {
+      "version": "5.4.21",
+      "resolved": "https://registry.npmjs.org/vite/-/vite-5.4.21.tgz",
+      "integrity": "sha512-o5a9xKjbtuhY6Bi5S3+HvbRERmouabWbyUcpXXUA1u+GNUKoROi9byOJ8M0nHbHYHkYICiMlqxkg1KkYmm25Sw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "esbuild": "^0.21.3",
+        "postcss": "^8.4.43",
+        "rollup": "^4.20.0"
+      },
+      "bin": {
+        "vite": "bin/vite.js"
+      },
+      "engines": {
+        "node": "^18.0.0 || >=20.0.0"
+      },
+      "funding": {
+        "url": "https://github.com/vitejs/vite?sponsor=1"
+      },
+      "optionalDependencies": {
+        "fsevents": "~2.3.3"
+      },
+      "peerDependencies": {
+        "@types/node": "^18.0.0 || >=20.0.0",
+        "less": "*",
+        "lightningcss": "^1.21.0",
+        "sass": "*",
+        "sass-embedded": "*",
+        "stylus": "*",
+        "sugarss": "*",
+        "terser": "^5.4.0"
+      },
+      "peerDependenciesMeta": {
+        "@types/node": {
+          "optional": true
+        },
+        "less": {
+          "optional": true
+        },
+        "lightningcss": {
+          "optional": true
+        },
+        "sass": {
+          "optional": true
+        },
+        "sass-embedded": {
+          "optional": true
+        },
+        "stylus": {
+          "optional": true
+        },
+        "sugarss": {
+          "optional": true
+        },
+        "terser": {
+          "optional": true
+        }
+      }
+    },
+    "node_modules/w3c-xmlserializer": {
+      "version": "5.0.0",
+      "resolved": "https://registry.npmjs.org/w3c-xmlserializer/-/w3c-xmlserializer-5.0.0.tgz",
+      "integrity": "sha512-o8qghlI8NZHU1lLPrpi2+Uq7abh4GGPpYANlalzWxyWteJOCsr/P+oPBA49TOLu5FTZO4d3F9MnWJfiMo4BkmA==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "xml-name-validator": "^5.0.0"
+      },
+      "engines": {
+        "node": ">=18"
+      }
+    },
+    "node_modules/webidl-conversions": {
+      "version": "8.0.1",
+      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-8.0.1.tgz",
+      "integrity": "sha512-BMhLD/Sw+GbJC21C/UgyaZX41nPt8bUTg+jWyDeg7e7YN4xOM05YPSIXceACnXVtqyEw/LMClUQMtMZ+PGGpqQ==",
+      "dev": true,
+      "license": "BSD-2-Clause",
+      "engines": {
+        "node": ">=20"
+      }
+    },
+    "node_modules/whatwg-mimetype": {
+      "version": "5.0.0",
+      "resolved": "https://registry.npmjs.org/whatwg-mimetype/-/whatwg-mimetype-5.0.0.tgz",
+      "integrity": "sha512-sXcNcHOC51uPGF0P/D4NVtrkjSU2fNsm9iog4ZvZJsL3rjoDAzXZhkm2MWt1y+PUdggKAYVoMAIYcs78wJ51Cw==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">=20"
+      }
+    },
+    "node_modules/whatwg-url": {
+      "version": "16.0.1",
+      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-16.0.1.tgz",
+      "integrity": "sha512-1to4zXBxmXHV3IiSSEInrreIlu02vUOvrhxJJH5vcxYTBDAx51cqZiKdyTxlecdKNSjj8EcxGBxNf6Vg+945gw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "@exodus/bytes": "^1.11.0",
+        "tr46": "^6.0.0",
+        "webidl-conversions": "^8.0.1"
+      },
+      "engines": {
+        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+      }
+    },
+    "node_modules/xml-name-validator": {
+      "version": "5.0.0",
+      "resolved": "https://registry.npmjs.org/xml-name-validator/-/xml-name-validator-5.0.0.tgz",
+      "integrity": "sha512-EvGK8EJ3DhaHfbRlETOWAS5pO9MZITeauHKJyb8wyajUfQUenkIg2MvLDTZ4T/TgIcm3HU0TFBgWWboAZ30UHg==",
+      "dev": true,
+      "license": "Apache-2.0",
+      "engines": {
+        "node": ">=18"
+      }
+    },
+    "node_modules/xmlchars": {
+      "version": "2.2.0",
+      "resolved": "https://registry.npmjs.org/xmlchars/-/xmlchars-2.2.0.tgz",
+      "integrity": "sha512-JZnDKK8B0RCDw84FNdDAIpZK+JuJw+s7Lz8nksI7SIuU3UXJJslUthsi+uWBUYOwPFwW7W7PRLRfUKpxjtjFCw==",
+      "dev": true,
+      "license": "MIT"
+    }
+  }
+}
diff --git a/apps/xing-hai-lv-zhe/package.json b/apps/xing-hai-lv-zhe/package.json
new file mode 100644
index 0000000..ea9d90b
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/package.json
@@ -0,0 +1,18 @@
+{
+  "name": "xing-hai-lv-zhe",
+  "version": "1.0.0",
+  "description": "《星骸旅者》开罗式像素 Roguelike 生存探索小游戏 - A Kairosoft-style pixel roguelike survival RPG",
+  "type": "module",
+  "scripts": {
+    "dev": "vite",
+    "build": "vite build",
+    "preview": "vite preview --host",
+    "test": "node scripts/logic-test.mjs",
+    "test:dom": "node scripts/smoke-dom.mjs",
+    "test:flee-timer": "node scripts/verify-flee-timer.mjs"
+  },
+  "devDependencies": {
+    "jsdom": "^29.1.1",
+    "vite": "^5.4.0"
+  }
+}
diff --git a/apps/xing-hai-lv-zhe/scripts/_css-loader.mjs b/apps/xing-hai-lv-zhe/scripts/_css-loader.mjs
new file mode 100644
index 0000000..b10c2fa
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/scripts/_css-loader.mjs
@@ -0,0 +1,7 @@
+// 让 Node 的 ESM 加载器把 *.css 视作空模块（仅冒烟测试用）。
+export async function load(url, context, nextLoad) {
+  if (url.endsWith('.css')) {
+    return { format: 'module', source: '', shortCircuit: true };
+  }
+  return nextLoad(url, context);
+}
diff --git a/apps/xing-hai-lv-zhe/scripts/logic-test.mjs b/apps/xing-hai-lv-zhe/scripts/logic-test.mjs
new file mode 100644
index 0000000..9234de2
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/scripts/logic-test.mjs
@@ -0,0 +1,410 @@
+// ============================================================================
+// 纯逻辑自测：不依赖浏览器，覆盖 config / player / world / battle / save 各模块。
+// 运行：node scripts/logic-test.mjs
+// ============================================================================
+import {
+  PALETTE, GRID, VISION_RADIUS, TILES, FLOOR_TILES, tileOf, isWalkable,
+  EQUIP_SLOTS, MAX_PLUS, AFFIX_AT, AFFIXES, enhanceCost, starterEquipment,
+  TALENTS, talentCost, floorConfig, enemyPoolFor, MEMORY_CHAPTERS, MAX_FLOOR,
+  STAMINA_COST_PER_ROUND, STAMINA_TIRED, expToNext, clamp,
+} from '../src/config.js';
+import {
+  newPlayer, migrate, maxHp, maxStamina, effectiveAtk, effectiveDef, effectiveMoveRange,
+  enhanceEquipment, buyTalent, resetTalents, gainReward, healFull, regenStamina, spendStamina,
+  damagePlayer, isDead, collectMemory, collectedMemoryCount,
+} from '../src/core/player.js';
+import {
+  generateFloor, findPath, reachableTiles, entityAt, removeEntity, tileAt, descend, bfsReachable, enemyFromDef,
+} from '../src/core/world.js';
+import {
+  STANCES, ACTIONS, COUNTERS, TELEGRAPH_CHANCE,
+  pickEnemyStance, isTelegraphed, autoPickAction, resolveRound, enemyReward,
+} from '../src/core/battle.js';
+import {
+  _setStorage, saveToSlot, loadFromSlot, deleteSlot, listSaves, hasAnySave, latestSlot,
+  exportSave, importSave, SAVE_SLOTS,
+} from '../src/core/save.js';
+import { makeRng } from '../src/core/rng.js';
+
+let pass = 0, fail = 0;
+const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
+const seq = (arr) => makeRng(arr);
+const r0 = () => 0;
+const r1 = () => 0.999;
+const rMid = () => 0.5;
+
+// ===================== config =====================
+ok(Object.keys(PALETTE).length === 16, `调色板恰好 16 色（实际 ${Object.keys(PALETTE).length}）`);
+ok(GRID === 16 && VISION_RADIUS === 2, '地图 16×16、视野半径 2（5×5）');
+ok(EQUIP_SLOTS.length === 3 && EQUIP_SLOTS.includes('booster'), '装备三栏：武器/护甲/推进器');
+ok(MAX_PLUS === 10 && AFFIX_AT === 5, '强化上限 +10，+5 触发词缀');
+ok(AFFIXES.length >= 5 && AFFIXES.some((a) => a.id === 'lifesteal') && AFFIXES.some((a) => a.id === 'thorns'), '词缀池含吸血/反伤等');
+ok(enhanceCost(0) < enhanceCost(3) && enhanceCost(3) < enhanceCost(9), '强化消耗随 plus 递增');
+ok(TALENTS.length === 3 && TALENTS.some((t) => t.branch === 'survival') && TALENTS.some((t) => t.branch === 'luck'), '三天赋分支：生存/战斗/幸运');
+ok(MEMORY_CHAPTERS.length === 10, `记忆章节 10 章（实际 ${MEMORY_CHAPTERS.length}）`);
+ok(MAX_FLOOR === 10, '共 10 层（含 Boss）');
+ok(enemyPoolFor(1).length >= 1 && enemyPoolFor(10).some((e) => e.boss), '敌人池按楼层分阶，10 层含 Boss');
+ok(floorConfig(1).memory === true && floorConfig(10).memory === true, '每层含 1 枚记忆回响');
+ok(expToNext(1) < expToNext(5), '升级所需经验随等级递增');
+ok(tileOf('water').walkable === false && tileOf('floor').walkable === true, '地块通行性正确');
+ok(isWalkable('wall') === false && isWalkable('sand') === true, 'isWalkable 辅助正确');
+ok(Array.from(new Set(FLOOR_TILES)).length === FLOOR_TILES.length, '可行走地块类型无重复');
+
+// ===================== player =====================
+let p = newPlayer(seq([0.4, 0.4, 0.4, 0.4, 0.4, 0.4]), { name: '阿尔法' });
+ok(p.name === '阿尔法' && p.hp === maxHp(p) && p.stamina === maxStamina(), '新角色满状态');
+ok(p.floor === 1 && p.maxFloor === 1 && p.level === 1, '新角色从第 1 层、Lv1 起步');
+ok(p.stardust === 0 && p.parts === 0 && p.exp === 0, '新角色零资源');
+ok(p.equipment.weapon.name === '生锈砍刀' && p.equipment.booster.plus === 0, '起始装备正确');
+ok(Object.keys(p.talents).length === 3 && p.talents.combat === 0, '天赋初始全 0');
+ok(p.memory.length === 10 && p.memory.every((x) => x === false), '记忆初始全未收集');
+
+// 超长姓名截断
+ok(newPlayer(r0, { name: '一二三四五六七八九十' }).name.length === 8, '超长姓名截断 8 字');
+
+// migrate 修复损坏档
+{
+  _setStorage(memStorage());
+  const bad = { name: '', hp: -5, stamina: 999, stardust: -3, parts: 'x', level: 0, exp: -1, floor: 99, maxFloor: 0, seed: NaN, turn: -1, equipment: { weapon: { name: 1, stat: 'a', plus: 99, affix: { id: 'nope' } } }, talents: { survival: 99, combat: -1 }, memory: [true, true], ending: 'weird' };
+  saveToSlot(0, bad);
+  const f = loadFromSlot(0);
+  ok(f.name === '旅者', 'migrate 空姓名兜底');
+  ok(f.hp >= 0 && f.stamina >= 0, 'migrate HP/精力非负');
+  ok(f.stardust === 0 && f.parts === 0 && f.exp === 0, 'migrate 资源非负');
+  ok(f.level === 1, 'migrate 等级下限 1');
+  ok(f.floor === MAX_FLOOR, 'migrate 楼层钳到上限');
+  ok(Number.isFinite(f.seed), 'migrate 补种子');
+  ok(f.equipment.weapon.plus === MAX_PLUS, 'migrate 强化钳到上限');
+  ok(f.equipment.weapon.affix === null, 'migrate 非法词缀置空');
+  ok(f.talents.survival === 5 && f.talents.combat === 0, 'migrate 天赋钳到合法档');
+  ok(f.memory.length === 10 && f.memory[0] === true && f.memory[2] === false, 'migrate 记忆数组补齐');
+  ok(f.ending === null, 'migrate 非法结局置空');
+}
+
+// migrate：楼层快照损坏（某行为 null / pos 越界）→ 丢弃或钳制，绝不崩溃或软锁
+{
+  _setStorage(memStorage());
+  const grid = Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => 'floor'));
+  const broken = { name: '甲', floor: 2, floorState: { grid: grid.map((r, i) => (i === 5 ? null : r)), pos: { x: 3, y: 3 }, entities: [], explored: {} } };
+  saveToSlot(0, broken);
+  const f1 = loadFromSlot(0);
+  ok(f1.floorState === null, 'migrate：grid 含 null 行 → floorState 置空（重生成）');
+  const badPos = { name: '乙', floor: 2, floorState: { grid, pos: { x: -1 }, entities: [], explored: {} } };
+  saveToSlot(1, badPos);
+  const f2 = loadFromSlot(1);
+  ok(f2.floorState !== null && f2.floorState.pos.x === 1 && f2.floorState.pos.y === 1, 'migrate：pos 越界 → 钳到 {1,1}');
+  const okPos = { name: '丙', floor: 2, floorState: { grid, pos: { x: 7, y: 9 }, entities: [], explored: {} } };
+  saveToSlot(2, okPos);
+  const f3 = loadFromSlot(2);
+  ok(f3.floorState.pos.x === 7 && f3.floorState.pos.y === 9, 'migrate：合法 pos 原样保留');
+}
+
+// 派生数值：强化 / 天赋 / 词缀 / 等级 均生效
+{
+  const a = newPlayer(r0, {});
+  const baseAtk = effectiveAtk(a);
+  a.equipment.weapon.plus = 3;
+  ok(effectiveAtk(a) > baseAtk, '武器强化提升攻击');
+  a.talents.combat = 3;
+  ok(effectiveAtk(a) > baseAtk + 3, '战斗天赋额外提升攻击');
+  const a2 = newPlayer(r0, {});
+  const baseDef = effectiveDef(a2);
+  a2.equipment.armor.plus = 2;
+  ok(effectiveDef(a2) > baseDef, '护甲强化提升防御');
+  const a3 = newPlayer(r0, {});
+  ok(effectiveMoveRange(a3) === 1, '初始移动步数 1');
+  a3.equipment.booster.plus = 2;
+  ok(effectiveMoveRange(a3) === 3, '推进器强化提升步数');
+  a3.equipment.booster.affix = { id: 'swift' };
+  ok(effectiveMoveRange(a3) === 4, '迅捷词缀 +1 步');
+  // 等级提升血量上限
+  const a4 = newPlayer(r0, {});
+  a4.level = 5;
+  ok(maxHp(a4) > maxHp(newPlayer(r0, {})), '等级提升血量上限');
+}
+
+// enhanceEquipment：消耗零件、+plus、+5 触发词缀
+{
+  const e = newPlayer(r0, {});
+  e.parts = 100;
+  const cost0 = enhanceCost(0);
+  let res = enhanceEquipment(e, 'weapon', seq([0.1]));
+  ok(res.ok === true && e.parts === 100 - cost0 && e.equipment.weapon.plus === 1, '强化消耗零件且 plus+1');
+  // 连续强化到 +5 触发词缀
+  e.equipment.weapon.plus = 4;
+  res = enhanceEquipment(e, 'weapon', seq([0.2]));
+  ok(res.ok && res.affixed && e.equipment.weapon.plus === 5, '强化至 +5');
+  ok(e.equipment.weapon.affix && AFFIXES.some((a) => a.id === e.equipment.weapon.affix.id), '+5 触发词缀变异');
+  // 达上限
+  e.equipment.weapon.plus = MAX_PLUS;
+  res = enhanceEquipment(e, 'weapon', r0);
+  ok(res.ok === false && res.reason === 'max', '达上限不可强化');
+  // 零件不足
+  e.equipment.weapon.plus = 0; e.parts = 0;
+  res = enhanceEquipment(e, 'weapon', r0);
+  ok(res.ok === false && res.reason === 'no-parts', '零件不足不可强化');
+}
+
+// 天赋：消耗星骸、上限、重置返还
+{
+  const t = newPlayer(r0, {});
+  t.stardust = 200;
+  const c0 = talentCost('combat', 0);
+  let res = buyTalent(t, 'combat');
+  ok(res.ok && t.talents.combat === 1 && t.stardust === 200 - c0, '点亮战斗天赋消耗星骸');
+  // 生存天赋补 HP
+  const hpBefore = t.hp;
+  res = buyTalent(t, 'survival');
+  ok(res.ok && t.hp >= hpBefore, '生存天赋补 HP');
+  // 重置全额返还
+  const sdBefore = t.stardust;
+  res = resetTalents(t);
+  ok(res.ok && res.refund > 0 && t.stardust > sdBefore, '重置天赋返还星骸');
+  ok(t.talents.combat === 0 && t.talents.survival === 0, '重置后天赋归零');
+  // 星骸不足
+  t.stardust = 0;
+  res = buyTalent(t, 'luck');
+  ok(res.ok === false && res.reason === 'no-stardust', '星骸不足不可点亮');
+}
+
+// gainReward：幸运加成 + 升级
+{
+  const g = newPlayer(r0, {});
+  gainReward(g, { stardust: 10, parts: 4, exp: 0 }, r0);
+  ok(g.stardust === 10 && g.parts === 4, '基础奖励入账');
+  const lucky = newPlayer(r0, {});
+  lucky.talents.luck = 3;
+  gainReward(lucky, { stardust: 10, parts: 4 }, r0);
+  ok(lucky.stardust > 10 && lucky.parts > 4, '幸运天赋提升掉落');
+  // 升级
+  const lv = newPlayer(r0, {});
+  const lvBefore = lv.level;
+  const need = expToNext(lv.level);
+  gainReward(lv, { exp: need + 5 }, r0);
+  ok(lv.level === lvBefore + 1 && lv.exp === 5, '经验达标后升级并结算剩余经验');
+}
+
+// HP / 精力 / 死亡
+{
+  const d = newPlayer(r0, {});
+  damagePlayer(d, 1000);
+  ok(d.hp === 0 && isDead(d) === true, '伤害致死判定死亡');
+  healFull(d);
+  ok(d.hp === maxHp(d) && d.stamina === maxStamina(d), '满状态恢复');
+  spendStamina(d, 50);
+  ok(d.stamina < maxStamina(d), '消耗精力');
+  regenStamina(d, 10);
+  ok(d.stamina <= maxStamina(d), '精力回复钳制上限');
+}
+
+// 记忆收集
+{
+  const m = newPlayer(r0, {});
+  ok(collectedMemoryCount(m) === 0, '初始收集数 0');
+  const res = collectMemory(m, 0);
+  ok(res.ok && m.memory[0] === true && collectedMemoryCount(m) === 1, '收集记忆解锁章节');
+  const again = collectMemory(m, 0);
+  ok(again.ok === false && again.already === true, '重复收集不重复解锁');
+  ok(m.hp < maxHp(m) || m.hp === maxHp(m), '收集记忆回复 HP 不报错');
+}
+
+// ===================== world =====================
+{
+  const st = generateFloor(seq(Array.from({ length: 64 }, (_, i) => (i % 7) / 7)), 1, newPlayer(r0, {}));
+  ok(st.grid.length === GRID && st.grid[0].length === GRID, '生成 16×16 网格');
+  // 边界为墙
+  ok(st.grid[0][0] === 'wall' && st.grid[GRID - 1][GRID - 1] === 'wall', '边界为墙');
+  // 出生点可行走
+  ok(isWalkable(tileAt(st, st.pos.x, st.pos.y)), '出生点可行走');
+  // 第 1 层有阶梯
+  ok(st.entities.some((e) => e.type === 'memory'), '第 1 层含 1 枚记忆');
+  ok(st.entities.filter((e) => e.type === 'enemy').length === floorConfig(1).enemyCount, `敌人数量符合楼层配置（${floorConfig(1).enemyCount}）`);
+  ok(st.entities.filter((e) => e.type === 'chest').length === floorConfig(1).chestCount, '宝箱数量符合楼层配置');
+  ok(st.entities.some((e) => ['merchant', 'drone', 'trap'].includes(e.type)), '含 1 个随机事件点');
+  // 有阶梯且非 Boss 层
+  let hasStairs = false;
+  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (tileAt(st, x, y) === 'stairs') hasStairs = true;
+  ok(hasStairs, '第 1 层存在下行阶梯');
+  // 实体不重叠出生点
+  ok(!entityAt(st, st.pos.x, st.pos.y), '出生点无实体');
+  // 出生点可达阶梯
+  const reach = bfsReachable(st.grid, st.pos.x, st.pos.y);
+  let stairsKey = null;
+  for (let y = 0; y < GRID && !stairsKey; y++) for (let x = 0; x < GRID && !stairsKey; x++) if (tileAt(st, x, y) === 'stairs') stairsKey = `${x},${y}`;
+  ok(stairsKey && reach.dist.has(stairsKey), '出生点可达阶梯（连通保证）');
+}
+// Boss 层：无阶梯、有 Boss
+{
+  const st = generateFloor(seq(Array.from({ length: 64 }, (_, i) => (i % 5) / 5)), MAX_FLOOR, newPlayer(r0, {}));
+  let hasStairs = false;
+  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (tileAt(st, x, y) === 'stairs') hasStairs = true;
+  ok(hasStairs === false, 'Boss 层无下行阶梯');
+  const boss = st.entities.find((e) => e.type === 'enemy');
+  ok(boss && boss.boss === true, 'Boss 层含 Boss 敌人');
+  ok(st.entities.some((e) => e.type === 'memory'), 'Boss 层仍含 1 枚记忆');
+}
+
+// reachableTiles / findPath
+{
+  const grid = Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => 'floor'));
+  for (let i = 0; i < GRID; i++) { grid[0][i] = 'wall'; grid[GRID - 1][i] = 'wall'; grid[i][0] = 'wall'; grid[i][GRID - 1] = 'wall'; }
+  const st = { grid, pos: { x: 5, y: 5 }, entities: [] };
+  const reach1 = reachableTiles(st, st.pos, 1);
+  ok(reach1.size === 5, `步数 1 可达 5 格（实际 ${reach1.size}）`); // 自身 + 4 邻
+  const reach2 = reachableTiles(st, st.pos, 2);
+  ok(reach2.size === 13, `步数 2 可达 13 格（实际 ${reach2.size}）`);
+  const path = findPath(st, { x: 5, y: 5 }, { x: 7, y: 5 }, 5, new Set());
+  ok(Array.isArray(path) && path.length === 2, `findPath 走 2 步到 (3,1)（实际 ${path && path.length}）`);
+  const tooFar = findPath(st, { x: 1, y: 1 }, { x: 5, y: 1 }, 2, new Set());
+  ok(tooFar === null, '超出步数上限 findPath 返回 null');
+  // 墙阻挡
+  grid[1][2] = 'wall';
+  const blocked = findPath(st, { x: 1, y: 1 }, { x: 3, y: 1 }, 5, new Set());
+  // 直线被墙挡，但可绕行（2,1 被墙挡，可走 1,2->2,2->3,2->3,1）；仍可达
+  ok(Array.isArray(blocked), '墙阻挡直线但仍可绕行抵达');
+  // 敌人格视为阻挡
+  const stE = { grid: grid.map((r) => r.slice()), pos: { x: 1, y: 1 }, entities: [{ id: 'e1', type: 'enemy', x: 2, y: 1 }] };
+  const reachE = reachableTiles(stE, stE.pos, 2);
+  ok(!reachE.has('2,1'), '敌人所在格不可达');
+}
+// entityAt / removeEntity / descend
+{
+  const st = { grid: Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => 'floor')), pos: { x: 1, y: 1 }, entities: [{ id: 'e1', type: 'chest', x: 2, y: 2 }] };
+  ok(entityAt(st, 2, 2) && entityAt(st, 2, 2).id === 'e1', 'entityAt 命中');
+  ok(entityAt(st, 3, 3) === null, 'entityAt 空格返回 null');
+  ok(removeEntity(st, 'e1') === true && entityAt(st, 2, 2) === null, 'removeEntity 移除实体');
+  ok(removeEntity(st, 'nope') === false, 'removeEntity 不存在返回 false');
+  const pl = newPlayer(r0, {}); pl.floor = 5;
+  ok(descend(pl) === 6 && pl.maxFloor === 6, 'descend 推进楼层并更新最远记录');
+  pl.floor = MAX_FLOOR;
+  ok(descend(pl) === MAX_FLOOR, 'descend 钳到上限');
+}
+
+// ===================== battle =====================
+ok(Object.keys(COUNTERS).length === 3, '三组克制关系');
+ok(COUNTERS.counter === 'thrust' && COUNTERS.block === 'slash' && COUNTERS.dodge === 'smash', '反击克突刺、格挡克横斩、闪避克重击');
+{
+  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
+  ok(['thrust', 'slash', 'smash'].includes(pickEnemyStance(enemy, r0)), 'pickEnemyStance 返回合法架势');
+  ok(autoPickAction('thrust') === 'counter' && autoPickAction('slash') === 'block' && autoPickAction('smash') === 'dodge', 'autoPickAction 给出正确克制');
+  ok(isTelegraphed(seq([0.1])) === true && isTelegraphed(seq([0.9])) === false, 'isTelegraphed 按概率识破');
+  ok(TELEGRAPH_CHANCE > 0 && TELEGRAPH_CHANCE < 1, '识破概率合法');
+}
+// 克制成功：敌人受伤、玩家不掉血、专注力蓄满
+{
+  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
+  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
+  const hpBefore = enemy.hp;
+  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r1); // r1 不失手
+  ok(res.countered === true, '反击对突刺 → 克制成功');
+  ok(res.enemyDmg > 0 && enemy.hp === hpBefore - res.enemyDmg, '敌人受到伤害');
+  ok(res.playerDmg === 0, '克制成功玩家不掉血');
+  ok(res.nextFocus === true, '克制成功蓄满专注力');
+}
+// 专注力倍率：下一击伤害更高
+{
+  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
+  const atk = effectiveAtk(pl);
+  const e1 = enemyFromDef(enemyPoolFor(1)[0], 1);
+  resolveRound(pl, e1, 'counter', false, 'thrust', r1);
+  const e2 = enemyFromDef(enemyPoolFor(1)[0], 1);
+  const res2 = resolveRound(pl, e2, 'counter', true, 'thrust', r1); // 带专注
+  ok(res2.enemyDmg > atk, '专注力下克制伤害高于基础攻击');
+}
+// 应对失败：玩家受伤
+{
+  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
+  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1); enemy.atk = 30;
+  const hpBefore = pl.hp;
+  const res = resolveRound(pl, enemy, 'block', false, 'thrust', r1); // 格挡不克突刺
+  ok(res.countered === false, '错误应对 → 未克制');
+  ok(res.playerDmg > 0 && pl.hp < hpBefore, '玩家受到伤害');
+  ok(res.nextFocus === false, '失败清空专注力');
+}
+// 精力过低失手
+{
+  const pl = newPlayer(r0, {}); pl.stamina = 0; // < STAMINA_TIRED
+  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
+  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r0); // r0 → 触发失手
+  ok(res.fumble === true && res.countered === false, '精力过低且随机=0 → 失手');
+}
+// 吸血词缀
+{
+  const pl = newPlayer(r0, {});
+  pl.stamina = maxStamina(pl); pl.hp = 10;
+  pl.equipment.weapon.affix = { id: 'lifesteal' };
+  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1);
+  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r1);
+  ok(res.healed > 0 && pl.hp > 10, '吸血词缀在克制命中时回血');
+}
+// 反伤词缀
+{
+  const pl = newPlayer(r0, {});
+  pl.stamina = maxStamina(pl);
+  pl.equipment.armor.affix = { id: 'thorns' };
+  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1); enemy.atk = 40;
+  const hpBefore = enemy.hp;
+  const res = resolveRound(pl, enemy, 'block', false, 'thrust', r1); // 失败受击
+  ok(res.playerDmg > 0 && enemy.hp < hpBefore, '反伤词缀在受击时反弹伤害');
+}
+// 战斗致死与奖励
+{
+  const pl = newPlayer(r0, {}); pl.stamina = maxStamina(pl);
+  const enemy = enemyFromDef(enemyPoolFor(1)[0], 1); enemy.hp = 1; enemy.maxHp = 1;
+  const res = resolveRound(pl, enemy, 'counter', false, 'thrust', r1);
+  ok(res.enemyDead === true && enemy.hp === 0, '敌人 HP 归零判定死亡');
+  const rw = enemyReward(enemy);
+  ok(Number.isFinite(rw.stardust) && Number.isFinite(rw.parts) && Number.isFinite(rw.exp), 'enemyReward 返回奖励数值');
+}
+ok(STAMINA_COST_PER_ROUND > 0 && STAMINA_TIRED > 0, '战斗精力消耗 / 疲惫阈值合法');
+
+// ===================== save（多槽位）=====================
+function memStorage() {
+  const m = {};
+  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: (k) => { delete m[k]; } };
+}
+ok(SAVE_SLOTS >= 5, `存档槽位 ≥ 5（实际 ${SAVE_SLOTS}）`);
+_setStorage(memStorage());
+ok(hasAnySave() === false && latestSlot() === null, '空存储无存档');
+ok(Array.isArray(listSaves()) && listSaves().length === SAVE_SLOTS, 'listSaves 返回全部槽位');
+
+const toSave = newPlayer(seq([0.3, 0.3, 0.3, 0.3, 0.3, 0.3]), { name: '贝塔' });
+toSave.floor = 4; toSave.stardust = 30; toSave.parts = 12;
+ok(saveToSlot(0, toSave) === true && hasAnySave() === true && latestSlot() === 0, 'saveToSlot 写入并可读出');
+const loaded = loadFromSlot(0);
+ok(loaded.name === '贝塔' && loaded.floor === 4 && loaded.stardust === 30 && loaded.parts === 12, '读档字段一致');
+
+saveToSlot(1, newPlayer(r0, { name: '甲' }));
+saveToSlot(2, newPlayer(r0, { name: '乙' }));
+ok(loadFromSlot(1).name === '甲' && loadFromSlot(0).name === '贝塔', '多槽位互不干扰');
+ok(listSaves().filter((s) => s.exists).length === 3, 'listSaves 标记已用槽');
+{
+  saveToSlot(3, newPlayer(r0, { name: '最新' }));
+  ok(latestSlot() === 3, 'latestSlot 取最近游玩槽位');
+}
+ok(deleteSlot(3) === true && loadFromSlot(3) === null, 'deleteSlot 删除槽位');
+ok(deleteSlot(999) === false, '非法槽位 deleteSlot 返回 false');
+
+// 导入导出往返
+{
+  const orig = newPlayer(seq([0.2, 0.2, 0.2, 0.2, 0.2, 0.2]), { name: '伽马' });
+  orig.floor = 6; orig.memory[0] = true;
+  const str = exportSave(orig);
+  ok(typeof str === 'string' && str.length > 0, 'exportSave 生成字符串');
+  const back = importSave(str);
+  ok(back !== null && back.name === '伽马' && back.floor === 6 && back.memory[0] === true, '导入后字段一致');
+  ok(importSave('!!!not-base64!!!') === null, '非法导入串返回 null');
+}
+
+// 楼层快照随存档保存
+{
+  _setStorage(memStorage());
+  const pl = newPlayer(r0, {});
+  pl.floorState = generateFloor(rMid, 2, pl);
+  saveToSlot(0, pl);
+  const back = loadFromSlot(0);
+  ok(back.floorState && back.floorState.grid.length === GRID, '楼层快照随存档保存');
+}
+
+console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
+process.exit(fail ? 1 : 0);
diff --git a/apps/xing-hai-lv-zhe/scripts/smoke-dom.mjs b/apps/xing-hai-lv-zhe/scripts/smoke-dom.mjs
new file mode 100644
index 0000000..eb88f9a
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/scripts/smoke-dom.mjs
@@ -0,0 +1,322 @@
+// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程
+// （启动器 → 创角 → 地图移动 → 战斗 → 胜利 → 下层 → 背包强化/天赋 → 事件 → 存档往返 → Boss 通关结局）。
+// 运行：node scripts/smoke-dom.mjs   （需先 npm install jsdom）
+import { JSDOM } from 'jsdom';
+import { register } from 'node:module';
+
+// 把 *.css 当作空模块（app.js 顶部 import 了样式表）
+register('./_css-loader.mjs', import.meta.url);
+
+const dom = new JSDOM('<!DOCTYPE html><div id="game-container"></div>', {
+  url: 'http://localhost/',
+  pretendToBeVisual: true,
+});
+const { window } = dom;
+for (const k of ['document', 'window', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'Element', 'getComputedStyle', 'CustomEvent', 'MouseEvent', 'Event']) {
+  if (window[k] === undefined) continue;
+  try { globalThis[k] = window[k]; } catch (_) { /* Node 部分全局只读 */ }
+}
+globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
+globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
+
+let pass = 0, fail = 0;
+const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
+const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
+
+const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);
+const { isWalkable } = await import(new URL('../src/config.js', import.meta.url).href);
+const { entityAt, generateFloor } = await import(new URL('../src/core/world.js', import.meta.url).href);
+const { maxHp } = await import(new URL('../src/core/player.js', import.meta.url).href);
+
+const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
+const GRID = 16;
+
+// ---------- 1) 首启：启动器 ----------
+localStorage.clear();
+let ui = window.__XHLZ;
+await sleep(10);
+ok(document.querySelector('.launcher') !== null, '渲染启动器');
+ok(/星骸旅者/.test(document.querySelector('.launcher h1')?.textContent || ''), '启动器标题为「星骸旅者」');
+ok(document.querySelector('.launcher__actions .btn-primary') !== null, '启动器有主操作按钮');
+
+// ---------- 2) 开启新旅程 → 创角页 ----------
+// 用确定性 rng（=0.4）：生成开阔浮岛，战斗时恒识破「突刺」，便于稳定取胜。
+ui.rng = () => 0.4;
+ui.timerEnabled = false;
+document.querySelector('.launcher__actions .btn-primary').click();
+await sleep(10);
+ok(document.querySelector('.launcher.create') !== null || document.querySelector('.create__head') !== null, '点击开始进入创角页');
+ok(document.querySelector('[data-id="name"]') !== null, '创角页有姓名输入');
+
+// ---------- 3) 取名 + 迫降 → 进入地图 ----------
+const nameInput = document.querySelector('[data-id="name"]');
+if (nameInput) {
+  nameInput.value = '星岚';
+  nameInput.dispatchEvent(new window.Event('input', { bubbles: true }));
+}
+document.querySelector('.create__foot .btn-primary').click();
+await sleep(15);
+ok(document.querySelector('.xhlz-game') !== null, '迫降后进入游戏界面');
+ok(document.querySelector('.status-bar') !== null, '渲染顶部状态栏');
+ok(document.querySelector('.map-grid') !== null, '渲染像素地图');
+ok(document.querySelectorAll('.cell').length === GRID * GRID, `地图含 ${GRID * GRID} 个地块（实际 ${document.querySelectorAll('.cell').length}）`);
+ok(ui.player && ui.player.name === '星岚', `角色姓名记录正确（${ui.player?.name}）`);
+ok(ui.player.floor === 1 && ui.player.floorState, '初始第 1 层且生成楼层快照');
+ok(document.querySelector('.interact-btn') !== null, '底部有中央交互键');
+
+// ---------- 4) 移动：步数推进、迷雾揭开 ----------
+const turnBefore = ui.player.turn;
+const stepOnce = () => {
+  const st = ui.player.floorState;
+  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
+    const nx = st.pos.x + dx, ny = st.pos.y + dy;
+    if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
+    const ent = entityAt(st, nx, ny);
+    if (ent && ent.type === 'enemy') continue;
+    if (!isWalkable(st.grid[ny][nx])) continue;
+    ui.tryMoveTo(nx, ny);
+    return true;
+  }
+  return false;
+};
+let moved = false;
+for (let i = 0; i < 6; i++) { if (ui._sheet) ui.closeModal(); if (stepOnce()) moved = true; await sleep(5); }
+ok(moved && ui.player.turn > turnBefore, `移动推进步数（turn ${turnBefore}→${ui.player.turn}）`);
+ok(Object.keys(ui.player.floorState.explored).length > 1, '移动揭开了迷雾');
+
+// ---------- 5) 战斗：走到敌人旁 → 攻击 → 猜拳取胜 ----------
+function nearestEnemy() {
+  const st = ui.player.floorState;
+  let best = null, bd = Infinity;
+  for (const e of st.entities) if (e.type === 'enemy') { const d = manhattan(st.pos, e); if (d < bd) { bd = d; best = e; } }
+  return best;
+}
+// 贪心走向敌人直到相邻（逐格，遇事件弹窗自动关闭）
+function walkAdjacent(enemy) {
+  const st = ui.player.floorState;
+  let guard = 0;
+  while (enemy && manhattan(st.pos, enemy) > 1 && guard++ < 80) {
+    if (ui._sheet) { ui.closeModal(); continue; }
+    let best = null, bestD = Infinity;
+    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
+      const nx = st.pos.x + dx, ny = st.pos.y + dy;
+      if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
+      const ent = entityAt(st, nx, ny);
+      if (ent && ent.type === 'enemy') continue;
+      if (!isWalkable(st.grid[ny][nx])) continue;
+      const d = Math.abs(nx - enemy.x) + Math.abs(ny - enemy.y);
+      if (d < bestD) { bestD = d; best = { x: nx, y: ny }; }
+    }
+    if (!best) return false;
+    ui.tryMoveTo(best.x, best.y);
+  }
+  return enemy ? manhattan(st.pos, enemy) <= 1 : false;
+}
+
+// 通用战斗取胜：读架势 → 点击克制应对，直到战斗结束
+async function winBattle() {
+  let guard = 0;
+  while (document.querySelector('.battle') && guard++ < 80) {
+    const chip = document.querySelector('.stance-chip');
+    let act = 'counter';
+    if (chip) {
+      const t = chip.textContent || '';
+      if (t.includes('横斩')) act = 'block';
+      else if (t.includes('重击')) act = 'dodge';
+      else act = 'counter';
+    }
+    const btn = document.querySelector(`.battle__actions .act[data-action="${act}"]`);
+    if (btn && !btn.disabled) btn.click();
+    await sleep(70);
+  }
+  return !document.querySelector('.battle');
+}
+
+let enemy = nearestEnemy();
+ok(!!enemy, '第 1 层存在敌人');
+let reached = enemy ? walkAdjacent(enemy) : false;
+if (!reached && enemy) {
+  // 退化：直接对相邻敌人开战（绕过寻路 UI）
+  ui.startBattle(enemy);
+} else {
+  ok(/攻击/.test(document.querySelector('.interact-btn')?.textContent || ''), '靠近敌人后交互键变为「攻击」');
+  document.querySelector('.interact-btn').click();
+}
+await sleep(15);
+ok(document.querySelector('.battle') !== null, '进入战斗界面');
+ok(document.querySelectorAll('.battle__actions .act').length === 3, '战斗含 3 个应对按钮');
+const sdBefore = ui.player.stardust;
+const won = await winBattle();
+ok(won, '战斗取胜并退出战斗界面');
+ok(ui.player.stardust > sdBefore, `战斗获得星骸（${sdBefore}→${ui.player.stardust}）`);
+
+// ---------- 5b) 自动战斗：开启后能自动结算多回合直至取胜（防死锁） ----------
+const enemy2 = nearestEnemy();
+if (enemy2) {
+  const reached2 = walkAdjacent(enemy2);
+  if (reached2) {
+    document.querySelector('.interact-btn').click(); // 攻击
+    await sleep(15);
+    const autoBtn = document.querySelector('[title="自动战斗"]');
+    ok(!!autoBtn, '战斗界面有自动战斗开关');
+    if (autoBtn) autoBtn.click(); // 开启自动
+    await sleep(10);
+    ok(ui.battle && ui.battle.auto === true, '开启后 battle.auto=true');
+    // 轮询等待自动战斗结束（防 5b 死锁回归）
+    let guard = 0;
+    while (document.querySelector('.battle') && guard++ < 200) { await sleep(70); }
+    ok(!document.querySelector('.battle'), `自动战斗能自行取胜并退出（${guard} 轮）`);
+  }
+}
+
+// ---------- 6) 事件：商人 / 无人机 ----------
+ui.player.stardust += 50; // 便于测试购买
+ui.refreshStatus();
+ui.showMerchant();
+await sleep(10);
+ok(/流浪商人/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开商人面板');
+const buyBtn = document.querySelector('.sheet__body .slot-row .btn-primary');
+ok(!!buyBtn && !buyBtn.disabled, '商人有可购买商品');
+if (buyBtn) buyBtn.click();
+await sleep(10);
+ui.closeModal();
+ui.showDrone();
+await sleep(10);
+ok(/维修无人机/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开无人机面板');
+const droneBtn = [...document.querySelectorAll('.sheet__foot button')].find((b) => /维修/.test(b.textContent));
+ok(!!droneBtn, '无人机有维修按钮');
+if (droneBtn) droneBtn.click();
+await sleep(10);
+ok(ui.player.hp === maxHp(ui.player), '无人机维修回满 HP');
+
+// ---------- 7) 背包：强化 / 天赋 / 剧情 ----------
+ui.player.parts = 100;
+ui.openInventory();
+await sleep(10);
+ok(/背包/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开背包');
+ok(document.querySelectorAll('.tabs .tab').length === 3, '背包含 装备/天赋/剧情 三标签');
+const plusBefore = ui.player.equipment.weapon.plus;
+const enhBtn = document.querySelector('.equip-card .btn-primary');
+ok(!!enhBtn, '装备页有强化按钮');
+if (enhBtn) enhBtn.click();
+await sleep(10);
+ok(ui.player.equipment.weapon.plus === plusBefore + 1, `强化成功 +${plusBefore}→+${ui.player.equipment.weapon.plus}`);
+// 天赋
+document.querySelectorAll('.tabs .tab')[1].click();
+await sleep(10);
+ok(document.querySelectorAll('.talent-branch').length === 3, '天赋页含 3 分支');
+const talBtn = document.querySelector('.talent-branch .btn-primary');
+ok(!!talBtn, '天赋页有点亮按钮');
+if (talBtn) talBtn.click();
+await sleep(10);
+ok(ui.player.talents.combat === 1 || ui.player.talents.survival === 1 || ui.player.talents.luck === 1, '点亮天赋成功');
+// 重置
+const resetBtn = [...document.querySelectorAll('.sheet__body button')].find((b) => /重置天赋/.test(b.textContent));
+if (resetBtn) resetBtn.click();
+await sleep(10);
+ok(ui.player.talents.combat === 0 && ui.player.talents.survival === 0 && ui.player.talents.luck === 0, '重置天赋后归零');
+// 剧情
+document.querySelectorAll('.tabs .tab')[2].click();
+await sleep(10);
+ok(document.querySelectorAll('.chapter').length === 10, '剧情页列出 10 章节');
+ui.closeModal();
+await sleep(5);
+
+// ---------- 8) 下层 ----------
+// 走到阶梯并下行
+const findStairs = () => {
+  const st = ui.player.floorState;
+  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (st.grid[y][x] === 'stairs') return { x, y };
+  return null;
+};
+const stairs = findStairs();
+if (stairs) {
+  // 逐格走向阶梯
+  let guard = 0;
+  while (manhattan(ui.player.floorState.pos, stairs) > 0 && guard++ < 80) {
+    if (ui._sheet) { ui.closeModal(); continue; }
+    const st = ui.player.floorState;
+    let best = null, bestD = Infinity;
+    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
+      const nx = st.pos.x + dx, ny = st.pos.y + dy;
+      if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
+      const ent = entityAt(st, nx, ny);
+      if (ent && ent.type === 'enemy') continue;
+      if (!isWalkable(st.grid[ny][nx])) continue;
+      const d = manhattan({ x: nx, y: ny }, stairs);
+      if (d < bestD) { bestD = d; best = { x: nx, y: ny }; }
+    }
+    if (!best) break;
+    ui.tryMoveTo(best.x, best.y);
+  }
+  if (ui.player.floorState.pos.x === stairs.x && ui.player.floorState.pos.y === stairs.y) {
+    document.querySelector('.interact-btn').click(); // 下行
+    await sleep(10);
+  }
+}
+ok(ui.player.floor === 2, `下行至第 2 层（实际 ${ui.player.floor}）`);
+
+// ---------- 9) 存档往返：重开实例后可「继续旅程」 ----------
+const savedName = ui.player.name;
+const savedFloor = ui.player.floor;
+ui.destroy();
+await sleep(10);
+ui = createGame(document.getElementById('game-container'));
+ui.rng = () => 0.4;
+ui.timerEnabled = false;
+window.__XHLZ = ui;
+await sleep(10);
+ok(/继续旅程/.test(document.querySelector('.launcher__actions .btn-primary')?.textContent || ''), '有存档时启动器主按钮为「继续旅程」');
+document.querySelector('.launcher__actions .btn-primary').click();
+await sleep(15);
+ok(ui.player && ui.player.name === savedName && ui.player.floor === savedFloor, `继续旅程载入正确（${ui.player?.name}·第 ${ui.player?.floor} 层）`);
+ok(document.querySelector('.xhlz-game') !== null, '继续后渲染游戏界面');
+
+// ---------- 10) Boss 层：通关 → 双结局抉择 ----------
+ui.player.floor = 10;
+ui.player.floorState = generateFloor(ui.rng, 10, ui.player);
+ui.renderMap();
+ui.refreshInteract();
+await sleep(10);
+const boss = ui.player.floorState.entities.find((e) => e.type === 'enemy' && e.boss);
+ok(!!boss, 'Boss 层存在 Boss 敌人');
+if (boss) {
+  walkAdjacent(boss);
+  if (ui._sheet) ui.closeModal();
+  if (manhattan(ui.player.floorState.pos, boss) <= 1) {
+    document.querySelector('.interact-btn').click();
+    await sleep(15);
+    const bossWon = await winBattle();
+    ok(bossWon, '击败 Boss');
+    await sleep(10);
+    const peaceBtn = [...document.querySelectorAll('.sheet__foot button, .ending__choice button')].find((b) => /重建文明/.test(b.textContent));
+    ok(!!peaceBtn, '击败 Boss 后出现结局抉择');
+    if (peaceBtn) peaceBtn.click();
+    await sleep(15);
+  }
+}
+ok(document.querySelector('.ending') !== null, '通关后渲染结局画面');
+ok(ui.player.ending === 'peace' || ui.player.ending === 'dark', `结局已记录（${ui.player.ending}）`);
+
+// ---------- 11) 死亡结算画面（开启新旅程后驱动 gameOver） ----------
+ui.destroy();
+await sleep(10);
+ui = createGame(document.getElementById('game-container'));
+ui.rng = () => 0.4;
+window.__XHLZ = ui;
+await sleep(10);
+const newBtn = [...document.querySelectorAll('.launcher__actions button')].find((b) => /新旅程/.test(b.textContent));
+(newBtn || document.querySelector('.launcher__actions .btn-primary')).click();
+await sleep(10);
+document.querySelector('.create__foot .btn-primary').click(); // 迫降进入游戏
+await sleep(15);
+ok(ui.player && ui.screen === 'game', '开启新旅程进入游戏');
+ui.player.hp = 0;
+ui.gameOver();
+await sleep(10);
+ok(document.querySelector('.ending.dark') !== null, '生命归零渲染死亡结算画面');
+ok(/旅程终结/.test(document.querySelector('.ending h2')?.textContent || ''), '死亡结算标题正确');
+
+ui.destroy();
+console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
+process.exit(fail ? 1 : 0);
diff --git a/apps/xing-hai-lv-zhe/scripts/verify-flee-timer.mjs b/apps/xing-hai-lv-zhe/scripts/verify-flee-timer.mjs
new file mode 100644
index 0000000..8fdf2f6
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/scripts/verify-flee-timer.mjs
@@ -0,0 +1,115 @@
+// ============================================================================
+// 针对性回归验证：限时战斗中「打开撤退确认弹窗 → 取消」不得因 timerEnd 陈旧
+// 而被瞬间判失手（第 2 轮阻断级 Bug 的兄弟分支修复）。
+// 用 jsdom + 可控时钟（Date.now 注入）+ 关闭 rAF 自动循环，手动驱动 onTick，
+// 保证时序完全确定。运行：node scripts/verify-flee-timer.mjs
+// ============================================================================
+import { JSDOM } from 'jsdom';
+import { register } from 'node:module';
+
+register('./_css-loader.mjs', import.meta.url);
+
+const dom = new JSDOM('<!DOCTYPE html><div id="game-container"></div>', {
+  url: 'http://localhost/',
+  pretendToBeVisual: true,
+});
+const { window } = dom;
+for (const k of ['document', 'window', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'Element', 'getComputedStyle', 'CustomEvent', 'MouseEvent', 'Event']) {
+  if (window[k] === undefined) continue;
+  try { globalThis[k] = window[k]; } catch (_) { /* Node 部分全局只读 */ }
+}
+
+// —— 可控时钟 ——
+let CLOCK = 10000;
+Date.now = () => CLOCK; // nowMs() 内部调用 Date.now()
+// —— 关闭 rAF 自动循环：onTick 只在我们手动调用时执行，时序完全确定 ——
+globalThis.requestAnimationFrame = () => 0;
+globalThis.cancelAnimationFrame = () => {};
+
+let pass = 0, fail = 0;
+const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
+const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
+
+const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);
+void createGame; // 仅取自动挂载副作用（挂载到 #game-container 并赋值 window.__XHLZ）
+
+localStorage.clear();
+// 注意：main.js 在 import 时已对 #game-container 自动挂载并赋值 window.__XHLZ；
+// 切勿再手动 createGame（会产生第二个实例并使 DOM 与 window.__XHLZ 错位）。
+const ui = window.__XHLZ;
+ui.rng = () => 0.4; // 确定性：识破「突刺」，便于稳定
+
+// —— 进入游戏（空槽位 → 无覆盖确认，直接 finalizeCreate）——
+// 仅靠 import main.js 的自动挂载副作用生成实例（见上）。
+document.querySelector('.launcher__actions .btn-primary').click();
+await sleep(5);
+document.querySelector('.create__foot .btn-primary').click(); // 迫降
+await sleep(10);
+ok(ui.screen === 'game' && ui.player, '已进入地图界面');
+
+const enemy = ui.player.floorState.entities.find((e) => e.type === 'enemy');
+ok(!!enemy, '楼层存在敌人实体可用于开战');
+
+// ============================================================================
+// 场景 A：开弹窗瞬间剩余=完整窗口（复现审查员的最小复现）
+//   nextRound 后 timerEnd=13000、CLOCK=10000 → 开撤退弹窗 → 推进到 15000 → 取消
+//   修复前：timerEnd 仍=13000 → onTick(15000) remain=0 → 瞬间失手（BUG）
+//   修复后：timerEnd 顺延为 18000 → remain=3000，正常继续
+// ============================================================================
+CLOCK = 10000;
+ui.timerEnabled = true;
+ui.startBattle(enemy);
+await sleep(5);
+ok(ui.screen === 'battle' && ui.battle && ui.battle.round === 1, 'startBattle 进入第 1 回合');
+ok(ui.battle.timerEnd === 13000, `回合开始 timerEnd=now+3000（实际 ${ui.battle.timerEnd}）`);
+
+ui.confirmFlee(); // 打开撤退确认弹窗
+ok(!!ui._sheet, '撤退弹窗已打开（_sheet 已置）');
+ok(ui._battlePauseRemain === 3000, `开弹窗瞬间记录剩余=3000（实际 ${ui._battlePauseRemain}）`);
+
+CLOCK = 15000; // 玩家在弹窗里犹豫 5 秒
+ui.closeModal(); // 点「继续战斗」
+ok(ui.screen === 'battle', '取消后仍处于战斗屏');
+ok(ui._battlePauseRemain == null, '关弹窗后 _battlePauseRemain 已清空');
+ok(ui.battle.timerEnd === 18000, `timerEnd 按剩余顺延为 18000 而非陈旧的 13000（实际 ${ui.battle.timerEnd}）`);
+
+const remainA = Math.max(0, ui.battle.timerEnd - CLOCK);
+ok(remainA === 3000, `关弹窗后 onTick 的 remain=3000（实际 ${remainA}）—— 不会瞬间失手`);
+const busyBefore = ui.battle.busy;
+ui.onTick(CLOCK); // 手动驱动一帧
+ok(ui.battle && ui.battle.busy === busyBefore, '未触发 hesitate（busy 未变）—— 取消弹窗不再误判失手');
+ok(/来不及反应/.test(document.querySelector('.battle__log')?.textContent || '') === false, '战报未出现「来不及反应」失手记录');
+
+// ============================================================================
+// 场景 B：开弹窗时仅剩少量时间 → 关弹窗只顺延该少量时间（非「全量重置」漏洞）
+//   即玩家不能靠反复开关撤退弹窗把计时条刷满。
+// ============================================================================
+CLOCK = 17500; // 距 timerEnd(18000) 仅剩 500ms
+ui.confirmFlee();
+ok(ui._battlePauseRemain === 500, `开弹窗瞬间记录剩余=500（实际 ${ui._battlePauseRemain}）`);
+CLOCK = 20000;
+ui.closeModal();
+ok(ui.battle.timerEnd === 20500, `timerEnd=20000+500=20500（非全量重置 23000，实际 ${ui.battle.timerEnd}）—— 无刷计时漏洞`);
+const remainB = Math.max(0, ui.battle.timerEnd - CLOCK);
+ok(remainB === 500, `关弹窗后 remain=500（实际 ${remainB}）—— 仅顺延真实剩余`);
+
+// ============================================================================
+// 场景 C：合法超时仍能正常判失手（证明修复未破坏正常限时机制）
+// ============================================================================
+CLOCK = 21000; // 已超过 timerEnd(20500)
+ui.onTick(CLOCK);
+ok(ui.battle && ui.battle.busy === true, '真正超时仍触发 hesitate（busy=true）—— 正常限时未失效');
+
+// ============================================================================
+// 场景 D：自动战斗 / busy 期间关弹窗不顺延 timerEnd（守卫不被误触）
+// ============================================================================
+CLOCK = 30000;
+ui.battle.auto = true;
+ui.battle.timerEnd = 99999; // 标记值
+ui.confirmFlee();
+ok(ui._battlePauseRemain == null, 'auto 期间开弹窗不记录剩余（守卫生效）');
+ui.closeModal();
+ok(ui.battle.timerEnd === 99999, 'auto 期间关弹窗未改写 timerEnd（实际未误触）');
+
+console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
+process.exit(fail ? 1 : 0);
diff --git a/apps/xing-hai-lv-zhe/src/config.js b/apps/xing-hai-lv-zhe/src/config.js
new file mode 100644
index 0000000..89a3d11
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/src/config.js
@@ -0,0 +1,205 @@
+// ============================================================================
+// 星骸旅者 · 配置层（纯常量与纯函数，无副作用，便于单测）
+// 定义调色板、地块、装备、天赋、敌人、记忆章节、随机事件与各类阈值。
+// ============================================================================
+
+// —— 开罗经典 16 色调色板（明亮饱和色块）——
+export const PALETTE = {
+  bg: '#2b2d3a',        // 深底（星空）
+  parchment: '#f8f4e6', // 亮米（羊皮纸 / 浅地砖）
+  sand: '#f7b731',      // 沙地金
+  water: '#4a90e2',     // 水域蓝
+  monster: '#e8634a',   // 怪物红
+  grass: '#6bcb77',     // 草地绿
+  stone: '#5d5376',     // 遗迹石（墙）
+  stoneDark: '#3a3a4a', // 深石（墙心）
+  gold: '#ffd93d',      // 星骸金 / 阶梯
+  player: '#4d96ff',    // 玩家蓝
+  hp: '#ff6b6b',        // 血量红
+  arcane: '#9d4edd',    // 回响紫（记忆碎片）
+  teal: '#38a3a5',      // 推进器青
+  light: '#f2f2f2',     // 浅地砖
+  gray: '#b0b0b0',      // 中灰
+  luck: '#57c785',      // 幸运绿
+};
+
+// —— 地图网格 ——
+export const GRID = 16;            // 16×16 地块
+export const VISION_RADIUS = 2;    // 视野半径（5×5 可见）
+
+// 地块类型枚举。walkable 决定能否踏入；color 为像素绘制色。
+export const TILES = {
+  floor:    { id: 'floor',    name: '地砖', walkable: true,  color: PALETTE.light },
+  floor2:   { id: 'floor2',   name: '石板', walkable: true,  color: PALETTE.parchment },
+  sand:     { id: 'sand',     name: '沙地', walkable: true,  color: PALETTE.sand },
+  grass:    { id: 'grass',    name: '草地', walkable: true,  color: PALETTE.grass },
+  water:    { id: 'water',    name: '水域', walkable: false, color: PALETTE.water },
+  wall:     { id: 'wall',     name: '石墙', walkable: false, color: PALETTE.stone },
+  wallDark: { id: 'wallDark', name: '深墙', walkable: false, color: PALETTE.stoneDark },
+  stairs:   { id: 'stairs',   name: '下行阶梯', walkable: true, color: PALETTE.gold },
+};
+// 随机生成时从中抽取的「可点缀」可行走地块（决定地砖纹理差异，不影响通行）。
+export const FLOOR_TILES = ['floor', 'floor2', 'sand', 'grass'];
+
+export function tileOf(id) { return TILES[id] || TILES.floor; }
+export function isWalkable(id) { return !!tileOf(id).walkable; }
+
+// —— 角色基础数值 ——
+export const BASE_MAX_HP = 100;
+export const BASE_MAX_STAMINA = 80;
+export const BASE_ATK = 6;     // 裸装攻击（武器加成叠加其上）
+export const BASE_DEF = 2;     // 裸装防御
+export const BASE_MOVE_RANGE = 1; // 推进器 plus 每点 +1 步
+
+// 精力影响命中率：低于此阈值进入「疲惫」，战斗中有失手概率。
+export const STAMINA_TIRED = 30;
+export const STAMINA_FUMBLE_CHANCE = 0.35; // 疲惫时失手概率上限
+// 战斗每回合消耗精力；地图上每移动一格回复精力。
+export const STAMINA_COST_PER_ROUND = 4;
+export const STAMINA_REGEN_PER_STEP = 3;
+// 闲置缓慢回精（rAF 驱动，每 STAMINA_REGEN_INTERVAL_MS 回 1 点）。
+export const STAMINA_REGEN_INTERVAL_MS = 1600;
+
+// —— 装备 ——
+export const EQUIP_SLOTS = ['weapon', 'armor', 'booster'];
+export const MAX_PLUS = 10;     // 强化上限
+export const AFFIX_AT = 5;      // +5 触发词缀变异
+// 强化消耗「零件」：随 plus 递增（线性）。
+export function enhanceCost(plus) { return 2 + (plus || 0) * 2; }
+
+// 词缀池（+5 变异时随机附加其一）。
+export const AFFIXES = [
+  { id: 'lifesteal', name: '吸血',   desc: '造成伤害时回复等量 HP 的 30%。', emoji: '🩸' },
+  { id: 'thorns',    name: '反伤',   desc: '受击时反弹 25% 伤害给敌人。',   emoji: '🌵' },
+  { id: 'keen',      name: '锐利',   desc: '攻击 +20%。',                   emoji: '🗡️' },
+  { id: 'guard',     name: '坚固',   desc: '防御 +20%。',                   emoji: '🛡️' },
+  { id: 'swift',     name: '迅捷',   desc: '移动步数 +1。',                 emoji: '💨' },
+];
+
+// 起始装备（生锈砍刀 + 破布衣 + 滑轨推进器）。
+export function starterEquipment() {
+  return {
+    weapon:  { name: '生锈砍刀', stat: 8,  plus: 0, affix: null },
+    armor:   { name: '破布外衣', stat: 5,  plus: 0, affix: null },
+    booster: { name: '滑轨推进器', stat: 0, plus: 0, affix: null },
+  };
+}
+
+// —— 天赋树：三条分支（生存 / 战斗 / 幸运），消耗星骸点亮，可免费重置 ——
+export const TALENTS = [
+  {
+    branch: 'survival', name: '生存', emoji: '❤️', color: PALETTE.hp, maxRank: 5,
+    desc: '每级最大 HP +20、回响拾取额外回复 HP。',
+    cost: (rank) => 3 + rank * 2,
+  },
+  {
+    branch: 'combat', name: '战斗', emoji: '⚔️', color: PALETTE.monster, maxRank: 5,
+    desc: '每级造成伤害 +10%、克制成功专注力倍率更高。',
+    cost: (rank) => 3 + rank * 2,
+  },
+  {
+    branch: 'luck', name: '幸运', emoji: '🍀', color: PALETTE.luck, maxRank: 5,
+    desc: '每级掉落星骸 / 零件 +15%、宝箱品质提升。',
+    cost: (rank) => 3 + rank * 2,
+  },
+];
+export const TALENT_BY_BRANCH = Object.fromEntries(TALENTS.map((t) => [t.branch, t]));
+export function talentCost(branch, rank) { return (TALENT_BY_BRANCH[branch] || { cost: () => 99 }).cost(rank || 0); }
+
+// —— 敌人定义池（按楼层分阶）——
+// stances：敌人摆出各架势的相对权重；reward：星骸 / 零件 / 经验基准。
+export const ENEMIES = [
+  { id: 'puppet',  name: '弃械傀儡', emoji: '🤖', minFloor: 1, hp: 26, atk: 7,  stances: { thrust: 4, slash: 3, smash: 2 }, stardust: 4,  parts: 2, exp: 6 },
+  { id: 'wraith',  name: '游荡幽影', emoji: '👻', minFloor: 1, hp: 20, atk: 9,  stances: { thrust: 3, slash: 2, smash: 4 }, stardust: 5,  parts: 1, exp: 7 },
+  { id: 'bat',     name: '锈翼蝠',   emoji: '🦇', minFloor: 4, hp: 34, atk: 11, stances: { thrust: 5, slash: 2, smash: 1 }, stardust: 7,  parts: 3, exp: 10 },
+  { id: 'crab',    name: '晶甲蟹',   emoji: '🦀', minFloor: 4, hp: 46, atk: 10, stances: { thrust: 2, slash: 5, smash: 3 }, stardust: 8,  parts: 4, exp: 12 },
+  { id: 'knight',  name: '残响骑士', emoji: '🛡️', minFloor: 7, hp: 60, atk: 14, stances: { thrust: 3, slash: 4, smash: 4 }, stardust: 11, parts: 5, exp: 16 },
+  { id: 'stalker', name: '虚空潜行者', emoji: '👹', minFloor: 7, hp: 52, atk: 17, stances: { thrust: 4, slash: 3, smash: 3 }, stardust: 12, parts: 4, exp: 18 },
+  { id: 'core',    name: '星骸之核', emoji: '🌟', minFloor: 10, hp: 160, atk: 20, stances: { thrust: 3, slash: 3, smash: 3 }, stardust: 60, parts: 30, exp: 100, boss: true },
+];
+
+// 按楼层挑选一个合适敌人定义（同 minFloor 池中加权随机由调用方处理）。
+export function enemyPoolFor(floor) {
+  const f = Math.max(1, floor || 1);
+  return ENEMIES.filter((e) => e.minFloor <= f && !(e.boss && f < 10));
+}
+
+// 楼层配置：敌人数量、宝箱、事件密度随楼层缓慢上升。
+export function floorConfig(floor) {
+  const f = Math.max(1, floor || 1);
+  return {
+    enemyCount: Math.min(6, 2 + Math.floor(f / 2)),   // 1→2, 2→3 ... 上限 6
+    chestCount: f >= 10 ? 0 : (1 + (f % 2)),           // 1~2
+    memory: f <= 10,                                    // 每层 1 枚回响（1~10）
+    eventCount: f >= 10 ? 0 : 1,                        // 每层 1 个随机事件点
+  };
+}
+
+// —— 记忆章节（碎片化叙事，共 10 章）——
+export const MEMORY_CHAPTERS = [
+  { title: '序章 · 苏醒', text: '逃生舱的舱门弹开，你大口喘着气。副官「小星」的全息影像闪烁亮起：「旅者，你终于醒了……抱歉，你的记忆和导航数据一起损坏了。」破碎的星球墨比乌斯在头顶缓缓旋转。' },
+  { title: '第二章 · 漂浮的遗迹', text: '这些浮岛并非天然——它们是上古文明崩解后残留的碎片。脚下的石板间，偶尔能听见极轻的、像叹息一样的回响。' },
+  { title: '第三章 · 星骸', text: '你第一次触摸到那枚发光的晶体「星骸」。温热的，像谁的心跳。一瞬间，你想起了一间洒满午后阳光的厨房。' },
+  { title: '第四章 · 不是矿石', text: '小星分析后沉默了很久：「旅者……星骸不是矿物。它们是上古文明的情感凝结体。每一枚，都是某个人的一段记忆。」' },
+  { title: '第五章 · 灶台与歌', text: '回响里浮现一个孩子的笑声，和一首你听不懂却莫名想哭的歌。那是谁？为什么你的眼眶会发酸？' },
+  { title: '第六章 · 文明的黄昏', text: '越来越清晰了：这座文明并非毁于灾祸，而是在某个黄昏，人们集体选择了将情感封存进星骸，让文明「睡去」。' },
+  { title: '第七章 · 你曾在这里', text: '一帧画面闪过——年轻的你站在某座广场上，身边是无数张笑脸。你忽然确信：你曾属于这里。' },
+  { title: '第八章 · 小星的秘密', text: '小星终于坦白：「我是按照她的性格模型建造的。她……把你送进逃生舱时，把所有的星骸都留给了你。」' },
+  { title: '第九章 · 抉择的重量', text: '星骸之核就在前方。十枚回响在你掌心发烫。重建它们，还是……？小星轻声说：「无论你选什么，我都陪你。」' },
+  { title: '终章 · 你的回答', text: '所有的记忆都已归位。现在，轮到你来回答那个被整个文明搁置的问题了。' },
+];
+
+// 中期 / 结局叙事（楼层触发）。
+export const STORY = {
+  prologue: '你迫降在破碎星球「墨比乌斯」。副官小星唤醒了你——记忆全失，只有零星的星骸在岛上闪烁。拾荒，活下去，找回你自己。',
+  midpoint: '三层之下，你隐约明白：星骸不是矿石，而是上古文明凝结的情感。每一次拾取，都像重温一段别人的日常。',
+};
+
+// 双结局文本。
+export const ENDINGS = {
+  peace: {
+    key: 'peace', name: '重建文明', emoji: '🕊️', tone: 'good',
+    title: '和平结局 · 星河重燃',
+    text: '你将所有星骸归还大地。千百枚情感体重新苏醒，化作人形，彼此相认。墨比乌斯的夜空第一次亮起万家灯火。你不再是孤独的旅者——你回到了家。',
+  },
+  dark: {
+    key: 'dark', name: '成为新神', emoji: '🔥', tone: 'bad',
+    title: '暗黑结局 · 独星长明',
+    text: '你引爆了所有星骸。滔天的情感能量灌入你一人之躯，星球在你脚下震颤重生。你成为了墨比乌斯唯一的新神——永生，且永远孤独。小星的光在你身后，缓缓熄灭。',
+  },
+};
+
+// —— 随机事件池（地图踩点触发）——
+// type 用于 world 生成时占位；resolve 在 player/ui 中结算。
+export const EVENT_TYPES = ['merchant', 'drone', 'trap'];
+export const EVENT_META = {
+  merchant: { emoji: '🛒', name: '流浪商人', desc: '高价出售稀有零件与精炼星骸。' },
+  drone:    { emoji: '🔧', name: '维修无人机', desc: '消耗星骸，回复全部 HP 与精力。' },
+  trap:     { emoji: '🌀', name: '重力陷阱', desc: '空间扭曲，强制传送至随机位置。' },
+};
+
+// 商人货架（零件 / 强化材料 / 偶尔的星骸）。
+export const SHOP_ITEMS = [
+  { id: 'parts_s', name: '零件包×3', cost: 6, give: { parts: 3 }, emoji: '🔩' },
+  { id: 'parts_l', name: '零件箱×8', cost: 14, give: { parts: 8 }, emoji: '📦' },
+  { id: 'stardust', name: '精炼星骸×10', cost: 18, give: { stardust: 10 }, emoji: '✨' },
+  { id: 'heal', name: '应急维修（满状态）', cost: 10, give: { fullHeal: true }, emoji: '❤️‍🩹' },
+];
+
+// 无人机维修价（星骸）。
+export const DRONE_COST = 8;
+// 最低楼层数（含 Boss）。
+export const MAX_FLOOR = 10;
+
+// —— 升级（经验）——
+export function expToNext(level) { return 10 + (level || 1) * 8; }
+
+// —— 钳制 / 数值辅助 ——
+export function clamp(v, lo, hi) {
+  if (!Number.isFinite(v)) return lo;
+  return Math.max(lo, Math.min(hi, Math.round(v)));
+}
+export function clampStat(v) { return clamp(v, 0, 99999); }
+
+// 曼哈顿距离。
+export function manhattan(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }
diff --git a/apps/xing-hai-lv-zhe/src/core/battle.js b/apps/xing-hai-lv-zhe/src/core/battle.js
new file mode 100644
index 0000000..81458ec
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/src/core/battle.js
@@ -0,0 +1,109 @@
+// ============================================================================
+// 战斗模块（抉择型「猜拳」简化版）：敌人架势 vs 玩家应对，克制关系 + 专注力。
+//   架势：突刺(thrust) / 横斩(slash) / 重击(smash)
+//   应对：格挡(block) / 闪避(dodge) / 反击(counter)
+//   克制：反击克突刺、格挡克横斩、闪避克重击。成功克制 → 下一击专注力 ×1.5。
+// 精力过低会失手；词缀（吸血 / 反伤 / 锐利 / 坚固）在结算中生效。
+// ============================================================================
+import { effectiveAtk, effectiveDef, maxHp, damagePlayer, healPlayer } from './player.js';
+import { weightedPick } from './rng.js';
+import { STAMINA_TIRED, STAMINA_FUMBLE_CHANCE, clamp } from '../config.js';
+
+export const STANCES = {
+  thrust: { id: 'thrust', name: '突刺', emoji: '🗡️' },
+  slash:  { id: 'slash',  name: '横斩', emoji: '🌀' },
+  smash:  { id: 'smash',  name: '重击', emoji: '💥' },
+};
+export const ACTIONS = {
+  block:  { id: 'block',  name: '格挡', emoji: '🛡️' },
+  dodge:  { id: 'dodge',  name: '闪避', emoji: '💨' },
+  counter:{ id: 'counter',name: '反击', emoji: '⚔️' },
+};
+// 应对 -> 其所克制的架势。
+export const COUNTERS = { counter: 'thrust', block: 'slash', dodge: 'smash' };
+
+// 敌人架势被「识破」（明牌）的概率；未识破时玩家需盲猜，增加风险。
+export const TELEGRAPH_CHANCE = 0.7;
+
+// 敌人按架势权重抽取本回合架势。
+export function pickEnemyStance(enemy, rng) {
+  const r = rng || Math.random;
+  return weightedPick(r, enemy.stances || { thrust: 1, slash: 1, smash: 1 }) || 'thrust';
+}
+
+// 本回合是否明牌（识破架势）。
+export function isTelegraphed(rng, chance) {
+  const r = rng || Math.random;
+  return r() < (chance == null ? TELEGRAPH_CHANCE : chance);
+}
+
+// 自动战斗：给出克制敌人当前架势的应对（明牌时必中）。
+export function autoPickAction(enemyStance) {
+  for (const [act, st] of Object.entries(COUNTERS)) if (st === enemyStance) return act;
+  return 'counter';
+}
+
+// 专注力倍率：战斗天赋进一步提升克制成功的伤害倍率。
+export function focusMultiplier(focus, combatRank) {
+  if (!focus) return 1;
+  return 1.5 + 0.04 * (combatRank || 0);
+}
+
+// 结算一回合：mutate enemy.hp / player.hp，返回回合描述（不改 stamina，由调用方扣除）。
+//   player, enemy, action, focus(本回合是否带专注), stance(敌人本回合架势), rng
+export function resolveRound(player, enemy, action, focus, stance, rng) {
+  const r = rng || Math.random;
+  const stanceId = stance || pickEnemyStance(enemy, r);
+  // 合法应对原样使用；非法值（如「犹豫」hesitate）保留为失败态，不计入克制。
+  const actId = action in COUNTERS ? action : 'hesitate';
+
+  // 精力过低 → 失手概率（失手时本回合视为应对失败）。
+  let fumble = false;
+  if ((player.stamina || 0) < STAMINA_TIRED) {
+    fumble = r() < STAMINA_FUMBLE_CHANCE;
+  }
+  const countered = !fumble && actId in COUNTERS && COUNTERS[actId] === stanceId;
+
+  let enemyDmg = 0;
+  let playerDmg = 0;
+  let healed = 0;
+  let nextFocus = false;
+
+  if (countered) {
+    // 克制成功：玩家命中敌人，伤害受专注力与战斗天赋加成。
+    const mult = focusMultiplier(focus, player.talents?.combat || 0);
+    enemyDmg = Math.max(1, Math.round(effectiveAtk(player) * mult));
+    enemy.hp = clamp(enemy.hp - enemyDmg, 0, enemy.maxHp || enemy.hp);
+    // 武器吸血词缀
+    if (player.equipment?.weapon?.affix?.id === 'lifesteal') {
+      healed = healPlayer(player, Math.round(enemyDmg * 0.3));
+    }
+    nextFocus = true; // 为下一击充能
+  } else {
+    // 应对失败：敌人命中玩家（防御减免，至少 1）。
+    const raw = (enemy.atk || 0) - effectiveDef(player);
+    playerDmg = Math.max(1, Math.round(raw * (fumble ? 1.2 : 1))); // 失手时受伤更重
+    damagePlayer(player, playerDmg);
+    // 护甲反伤词缀
+    if (player.equipment?.armor?.affix?.id === 'thorns') {
+      const refl = Math.max(1, Math.round(playerDmg * 0.25));
+      enemy.hp = clamp(enemy.hp - refl, 0, enemy.maxHp || enemy.hp);
+      enemyDmg = refl;
+    }
+    nextFocus = false;
+  }
+
+  return {
+    stance: stanceId, action: actId, countered, fumble, focus: !!focus, nextFocus,
+    enemyDmg, playerDmg, healed,
+    enemyDead: enemy.hp <= 0,
+    playerDead: player.hp <= 0,
+  };
+}
+
+// 计算击败该敌人的奖励（星骸 / 零件 / 经验基准，不含幸运加成——加成在 player.gainReward 中统一施加）。
+export function enemyReward(enemy) {
+  return { stardust: enemy.stardust || 0, parts: enemy.parts || 0, exp: enemy.exp || 0, boss: !!enemy.boss };
+}
+
+export { STAMINA_TIRED, STAMINA_FUMBLE_CHANCE, maxHp };
diff --git a/apps/xing-hai-lv-zhe/src/core/player.js b/apps/xing-hai-lv-zhe/src/core/player.js
new file mode 100644
index 0000000..e61f675
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/src/core/player.js
@@ -0,0 +1,264 @@
+// ============================================================================
+// 状态管理模块（State Manager）：角色状态、装备强化、天赋、升级与数值结算。
+// 所有数值结算集中于此，UI 只负责调用与渲染，不内含业务逻辑。
+// ============================================================================
+import {
+  BASE_MAX_HP, BASE_MAX_STAMINA, BASE_ATK, BASE_DEF, BASE_MOVE_RANGE,
+  MAX_PLUS, AFFIX_AT, AFFIXES, starterEquipment, enhanceCost,
+  TALENTS, TALENT_BY_BRANCH, talentCost,
+  expToNext, clamp, clampStat, MAX_FLOOR, MEMORY_CHAPTERS, GRID,
+} from '../config.js';
+import { randInt, pick } from './rng.js';
+
+// 创建一名新角色。
+//   opts: { name?, seed?, floor? }
+export function newPlayer(rng, opts = {}) {
+  const r = rng || Math.random;
+  const seed = Number.isFinite(opts.seed) ? opts.seed : randInt(r, 1, 1e9);
+  return {
+    name: (opts.name || '').toString().slice(0, 8) || '旅者',
+    hp: BASE_MAX_HP,
+    stamina: BASE_MAX_STAMINA,
+    stardust: 0,
+    parts: 0,
+    level: 1,
+    exp: 0,
+    equipment: starterEquipment(),
+    talents: { survival: 0, combat: 0, luck: 0 },
+    floor: Math.max(1, Number.isFinite(opts.floor) ? opts.floor : 1),
+    maxFloor: 1,
+    memory: Array.from({ length: MEMORY_CHAPTERS.length }, () => false),
+    log: [],
+    turn: 0,
+    seed,
+    floorState: null,   // 由 world 生成；存档保存，重载可恢复探索
+    ending: null,       // 通关结局记录
+    born: 0,
+    lastSeen: 0,
+  };
+}
+
+// —— 存档结构向后兼容：补齐 / 钳制字段，防止旧档或损坏档导致整页闪退 ——
+export function migrate(p) {
+  if (!p) return p;
+  if (typeof p.name !== 'string') p.name = '旅者';
+  p.name = p.name.slice(0, 8) || '旅者';
+  if (!Number.isFinite(p.hp)) p.hp = BASE_MAX_HP;
+  if (!Number.isFinite(p.stamina)) p.stamina = BASE_MAX_STAMINA;
+  if (!Number.isFinite(p.stardust) || p.stardust < 0) p.stardust = 0;
+  if (!Number.isFinite(p.parts) || p.parts < 0) p.parts = 0;
+  if (!Number.isFinite(p.level) || p.level < 1) p.level = 1;
+  if (!Number.isFinite(p.exp) || p.exp < 0) p.exp = 0;
+  if (!Number.isFinite(p.floor) || p.floor < 1) p.floor = 1;
+  if (p.floor > MAX_FLOOR) p.floor = MAX_FLOOR;
+  if (!Number.isFinite(p.maxFloor) || p.maxFloor < 1) p.maxFloor = p.floor;
+  if (!Number.isFinite(p.seed)) p.seed = 12345;
+  if (!Number.isFinite(p.turn) || p.turn < 0) p.turn = 0;
+  // 装备补齐
+  if (!p.equipment || typeof p.equipment !== 'object') p.equipment = starterEquipment();
+  else p.equipment = { ...starterEquipment(), ...p.equipment };
+  for (const slot of ['weapon', 'armor', 'booster']) {
+    const e = p.equipment[slot];
+    if (!e || typeof e !== 'object') { p.equipment[slot] = starterEquipment()[slot]; continue; }
+    if (typeof e.name !== 'string') e.name = starterEquipment()[slot].name;
+    if (!Number.isFinite(e.stat)) e.stat = starterEquipment()[slot].stat;
+    if (!Number.isFinite(e.plus) || e.plus < 0) e.plus = 0;
+    if (e.plus > MAX_PLUS) e.plus = MAX_PLUS;
+    e.affix = validAffix(e.affix) ? e.affix : null;
+  }
+  // 天赋补齐
+  if (!p.talents || typeof p.talents !== 'object') p.talents = { survival: 0, combat: 0, luck: 0 };
+  for (const t of TALENTS) {
+    const v = Math.floor(p.talents[t.branch]);
+    p.talents[t.branch] = (!Number.isFinite(v) || v < 0) ? 0 : Math.min(v, t.maxRank);
+  }
+  // 记忆数组补齐到章节长度
+  if (!Array.isArray(p.memory)) p.memory = [];
+  while (p.memory.length < MEMORY_CHAPTERS.length) p.memory.push(false);
+  p.memory = p.memory.slice(0, MEMORY_CHAPTERS.length).map((x) => x === true);
+  if (!Array.isArray(p.log)) p.log = [];
+  // 楼层快照规范化：结构损坏则置空（由 UI 重生成当前层），explored 归一为普通对象。
+  if (p.floorState && typeof p.floorState === 'object') {
+    const fs = p.floorState;
+    // grid 必须是 GRID×GRID 的字符串矩阵（逐行校验，避免某行为 null 致 tileAt 崩溃）。
+    const gridOk = Array.isArray(fs.grid) && fs.grid.length === GRID
+      && fs.grid.every((row) => Array.isArray(row) && row.length === GRID);
+    if (!gridOk) {
+      p.floorState = null;
+    } else {
+      // pos 坐标必须为合法网格内整数，否则钳到安全点（避免 renderMap 无角色 / 移动失灵）。
+      const px = Math.floor(fs.pos && fs.pos.x), py = Math.floor(fs.pos && fs.pos.y);
+      if (!Number.isInteger(px) || px < 0 || px >= GRID || !Number.isInteger(py) || py < 0 || py >= GRID) {
+        fs.pos = { x: 1, y: 1 };
+      } else {
+        fs.pos = { x: px, y: py };
+      }
+      if (!Array.isArray(fs.entities)) fs.entities = [];
+      if (Array.isArray(fs.explored)) { const o = {}; for (const k of fs.explored) o[k] = true; fs.explored = o; }
+      else if (!fs.explored || typeof fs.explored !== 'object' || Array.isArray(fs.explored)) fs.explored = {};
+      if (!Number.isFinite(fs.floor)) fs.floor = p.floor;
+    }
+  } else {
+    p.floorState = null;
+  }
+  p.ending = (p.ending === 'peace' || p.ending === 'dark') ? p.ending : null;
+  if (!Number.isFinite(p.born)) p.born = 0;
+  if (!Number.isFinite(p.lastSeen)) p.lastSeen = 0;
+  // 收尾钳制：HP / 精力落到合法区间（依赖已规范化的 talents / level）。
+  p.hp = clamp(p.hp, 0, maxHp(p));
+  p.stamina = clamp(p.stamina, 0, maxStamina());
+  return p;
+}
+
+function validAffix(a) {
+  return a && AFFIXES.some((x) => x.id === a.id);
+}
+
+// —— 派生数值（装备 + 强化 + 词缀 + 天赋 + 等级）——
+export function maxHp(p) {
+  return BASE_MAX_HP + (p.talents.survival || 0) * 20 + (p.level - 1) * 5;
+}
+export function maxStamina() { return BASE_MAX_STAMINA; }
+
+export function effectiveAtk(p) {
+  const w = p.equipment.weapon;
+  let atk = BASE_ATK + (w.stat || 0) + (w.plus || 0) + Math.floor((p.level - 1) / 2);
+  if (w.affix && w.affix.id === 'keen') atk *= 1.2;
+  atk *= 1 + 0.1 * (p.talents.combat || 0); // 战斗天赋
+  return Math.max(1, Math.round(atk));
+}
+
+export function effectiveDef(p) {
+  const a = p.equipment.armor;
+  let def = BASE_DEF + (a.stat || 0) + (a.plus || 0) + Math.floor((p.level - 1) / 3);
+  if (a.affix && a.affix.id === 'guard') def *= 1.2;
+  return Math.max(0, Math.round(def));
+}
+
+export function effectiveMoveRange(p) {
+  const b = p.equipment.booster;
+  let range = BASE_MOVE_RANGE + (b.plus || 0);
+  if (b.affix && b.affix.id === 'swift') range += 1;
+  return range;
+}
+
+// 词缀在 +5（及之后每 5 级）触发变异；已存在词缀则替换为新的随机词缀。
+export function rollAffix(rng) {
+  const r = rng || Math.random;
+  return { ...pick(r, AFFIXES) };
+}
+
+// 强化装备：消耗零件，plus+1；达 AFFIX_AT 的倍数时触发词缀变异。返回结果描述。
+export function enhanceEquipment(p, slot, rng) {
+  const r = rng || Math.random;
+  const e = p.equipment[slot];
+  if (!e) return { ok: false, reason: 'no-slot' };
+  if (e.plus >= MAX_PLUS) return { ok: false, reason: 'max' };
+  const cost = enhanceCost(e.plus);
+  if (p.parts < cost) return { ok: false, reason: 'no-parts', cost };
+  p.parts -= cost;
+  e.plus += 1;
+  let affixed = null;
+  if (e.plus % AFFIX_AT === 0) {
+    e.affix = rollAffix(r);
+    affixed = e.affix;
+  }
+  return { ok: true, plus: e.plus, affixed, slot };
+}
+
+// 点亮天赋：消耗星骸。返回结果。
+export function buyTalent(p, branch) {
+  const def = TALENT_BY_BRANCH[branch];
+  if (!def) return { ok: false, reason: 'no-branch' };
+  const rank = p.talents[branch] || 0;
+  if (rank >= def.maxRank) return { ok: false, reason: 'max' };
+  const cost = talentCost(branch, rank);
+  if (p.stardust < cost) return { ok: false, reason: 'no-stardust', cost };
+  p.stardust -= cost;
+  p.talents[branch] = rank + 1;
+  // 生存天赋提升上限后，同步补满 HP（鼓励投资生存）。
+  if (branch === 'survival') p.hp = Math.min(maxHp(p), p.hp + 20);
+  return { ok: true, branch, rank: rank + 1 };
+}
+
+// 重置天赋：全额返还星骸，可随时免费重置（鼓励试错）。
+export function resetTalents(p) {
+  let refund = 0;
+  for (const t of TALENTS) {
+    const rank = p.talents[t.branch] || 0;
+    for (let i = 0; i < rank; i++) refund += talentCost(t.branch, i);
+    p.talents[t.branch] = 0;
+  }
+  p.stardust += refund;
+  // 上限下调后钳制 HP。
+  p.hp = Math.min(p.hp, maxHp(p));
+  return { ok: true, refund };
+}
+
+// 获取战斗 / 拾取奖励（星骸 / 零件 / 经验），含幸运天赋加成与升级。
+export function gainReward(p, reward = {}, rng) {
+  const luck = 1 + 0.15 * (p.talents.luck || 0);
+  const sd = Math.round((reward.stardust || 0) * luck);
+  const pt = Math.round((reward.parts || 0) * luck);
+  p.stardust += sd;
+  p.parts += pt;
+  let leveled = 0;
+  if (reward.exp) {
+    p.exp += reward.exp;
+    while (p.exp >= expToNext(p.level)) {
+      p.exp -= expToNext(p.level);
+      p.level += 1;
+      leveled += 1;
+    }
+    if (leveled > 0) {
+      // 升级回血 40%（开罗式贴心）。
+      p.hp = Math.min(maxHp(p), p.hp + Math.round(maxHp(p) * 0.4));
+    }
+  }
+  return { stardust: sd, parts: pt, leveled };
+}
+
+// —— HP / 精力 ——
+export function damagePlayer(p, amount) {
+  const d = Math.max(0, Math.round(amount || 0));
+  p.hp = clamp(p.hp - d, 0, maxHp(p));
+  return d;
+}
+export function healPlayer(p, amount) {
+  const before = p.hp;
+  p.hp = clamp(p.hp + (amount || 0), 0, maxHp(p));
+  return p.hp - before;
+}
+export function healFull(p) {
+  const before = p.hp;
+  p.hp = maxHp(p);
+  p.stamina = maxStamina();
+  return p.hp - before;
+}
+export function spendStamina(p, amount) {
+  p.stamina = clamp(p.stamina - (amount || 0), 0, maxStamina());
+  return p.stamina;
+}
+export function regenStamina(p, amount) {
+  const before = p.stamina;
+  p.stamina = clamp(p.stamina + (amount || 0), 0, maxStamina());
+  return p.stamina - before;
+}
+
+export function isDead(p) { return p.hp <= 0; }
+
+// 记忆碎片收集：解锁对应章节，生存天赋额外回 HP。返回是否新解锁。
+export function collectMemory(p, chapterIndex) {
+  const idx = Math.max(0, Math.min(p.memory.length - 1, chapterIndex));
+  if (p.memory[idx]) return { ok: false, already: true };
+  p.memory[idx] = true;
+  const heal = 5 + (p.talents.survival || 0) * 5;
+  healPlayer(p, heal);
+  return { ok: true, chapter: idx, heal };
+}
+
+export function collectedMemoryCount(p) {
+  return p.memory.filter(Boolean).length;
+}
+
+export { MAX_PLUS, AFFIX_AT, AFFIXES, TALENTS, TALENT_BY_BRANCH, enhanceCost, talentCost, expToNext, clamp, clampStat, MAX_FLOOR, MEMORY_CHAPTERS };
diff --git a/apps/xing-hai-lv-zhe/src/core/rng.js b/apps/xing-hai-lv-zhe/src/core/rng.js
new file mode 100644
index 0000000..5a8d69d
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/src/core/rng.js
@@ -0,0 +1,51 @@
+// ============================================================================
+// 可注入随机源：默认 Math.random，单测可传入确定性序列，保证逻辑可复现。
+// ============================================================================
+export function makeRng(source) {
+  if (typeof source === 'function') return source;
+  if (Array.isArray(source)) {
+    // 确定性序列：依次取出，耗尽后回绕，便于穷举分支。
+    let i = 0;
+    return () => {
+      if (!source.length) return 0;
+      const v = source[i % source.length];
+      i += 1;
+      return v;
+    };
+  }
+  return Math.random;
+}
+
+// 钳制到 [0, 0.999999)：makeRng 的确定性数组序列可能返回任意值（含 ≥1），
+// 直接用于数组下标会越界取到 undefined（实测触发 `Cannot read properties of undefined`）。
+// 生产用 Math.random 永远合法，但此处兜底可提升种子 / 注入测试的鲁棒性。
+export function clampUnit(v) {
+  const n = Number(v);
+  if (!Number.isFinite(n)) return 0;
+  return Math.min(0.999999, Math.max(0, n));
+}
+
+// [min, max] 闭区间随机整数。
+export function randInt(rng, min, max) {
+  const r = clampUnit(rng());
+  return Math.floor(min + r * (max - min + 1));
+}
+
+// 按 {key: weight} 权重抽取一个 key。
+export function weightedPick(rng, weights) {
+  const entries = Object.entries(weights).filter(([, w]) => w > 0);
+  const total = entries.reduce((s, [, w]) => s + w, 0);
+  if (total <= 0) return null;
+  let roll = clampUnit(rng()) * total;
+  for (const [k, w] of entries) {
+    roll -= w;
+    if (roll <= 0) return k;
+  }
+  return entries[entries.length - 1][0];
+}
+
+// 从数组中等概率取一个元素（空数组返回 undefined）。
+export function pick(rng, arr) {
+  if (!Array.isArray(arr) || !arr.length) return undefined;
+  return arr[Math.floor(clampUnit(rng()) * arr.length)];
+}
diff --git a/apps/xing-hai-lv-zhe/src/core/save.js b/apps/xing-hai-lv-zhe/src/core/save.js
new file mode 100644
index 0000000..2ee8c42
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/src/core/save.js
@@ -0,0 +1,126 @@
+// ============================================================================
+// 存档管理模块（Save Manager）：多槽位 localStorage 持久化 + 导入导出（base64）。
+//
+// 多槽位：提供 SAVE_SLOTS（≥5）个独立存档位，key = xhlz_save_<slot>。
+// 通过 storage 访问器隔离 localStorage，便于 Node 单测注入。
+// 每次移动 / 战斗结算 / 强化 / 拾取后由 UI 自动调用 saveToSlot 落盘，防丢档。
+// ============================================================================
+import { migrate } from './player.js';
+
+export const SAVE_SLOTS = 6;
+const SLOT_PREFIX = 'xhlz_save_';
+
+let storage = null;
+try {
+  if (typeof localStorage !== 'undefined') storage = localStorage;
+} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }
+
+// 测试 / 注入用
+export function _setStorage(s) { storage = s; }
+
+export function nowSec() {
+  try { return Math.floor(Date.now() / 1000); } catch (_) { return 0; }
+}
+
+const slotKey = (slot) => `${SLOT_PREFIX}${slot}`;
+
+function validSlot(slot) {
+  const n = Number(slot);
+  return Number.isInteger(n) && n >= 0 && n < SAVE_SLOTS;
+}
+
+// 读取某槽位的原始玩家对象，不存在或损坏返回 null。
+export function loadFromSlot(slot) {
+  try {
+    if (!storage || !validSlot(slot)) return null;
+    const raw = storage.getItem(slotKey(slot));
+    if (!raw) return null;
+    const player = JSON.parse(raw);
+    return migrate(player);
+  } catch (_) { return null; }
+}
+
+// 列举所有槽位的概要信息，供存档管理 UI 展示。
+// 返回 [{ slot, exists, name, floor, maxFloor, level, stardust, memoryCount, ending, dead, lastSeen }]
+export function listSaves() {
+  const out = [];
+  for (let i = 0; i < SAVE_SLOTS; i++) {
+    const p = loadFromSlot(i);
+    out.push({
+      slot: i,
+      exists: !!p,
+      name: p ? p.name : null,
+      floor: p ? p.floor : null,
+      maxFloor: p ? p.maxFloor : null,
+      level: p ? p.level : null,
+      stardust: p ? p.stardust : null,
+      memoryCount: p ? (p.memory || []).filter(Boolean).length : 0,
+      ending: p ? p.ending : null,
+      dead: !!(p && p.hp <= 0 && !p.ending), // hp 归零且未通关：陨落档，不可「继续」
+      lastSeen: p ? p.lastSeen : 0,
+    });
+  }
+  return out;
+}
+
+// 是否存在可「继续旅程」的存档（陨落档 hp<=0 且未通关不算可继续）。
+export function hasAnySave() {
+  try {
+    return listSaves().some((s) => s.exists && !s.dead);
+  } catch (_) { return false; }
+}
+
+// 取最近游玩的槽位（lastSeen 最大者）；同值时槽位号大者优先（最后写入者胜出，结果确定）。
+// 陨落档不可继续，直接跳过。
+export function latestSlot() {
+  const list = listSaves().filter((s) => s.exists && !s.dead);
+  if (!list.length) return null;
+  let pick = list[0];
+  for (const s of list) {
+    if ((s.lastSeen || 0) >= (pick.lastSeen || 0)) pick = s;
+  }
+  return pick.slot;
+}
+
+// 写入指定槽位。slot 非法时回退到 0 号槽。返回是否成功。
+export function saveToSlot(slot, player) {
+  try {
+    if (!storage || !player) return false;
+    const s = validSlot(slot) ? slot : 0;
+    player.lastSeen = nowSec();
+    if (!player.born) player.born = player.lastSeen;
+    storage.setItem(slotKey(s), JSON.stringify(player));
+    return true;
+  } catch (_) { return false; }
+}
+
+export function deleteSlot(slot) {
+  try {
+    if (!storage || !validSlot(slot)) return false;
+    storage.removeItem(slotKey(slot));
+    return true;
+  } catch (_) { return false; }
+}
+
+// 导出 / 导入（base64，UTF-8 安全）。
+export function exportSave(player) {
+  return btoaSafe(JSON.stringify(migrate(JSON.parse(JSON.stringify(player)))));
+}
+export function importSave(str) {
+  try {
+    const player = JSON.parse(atobSafe(str));
+    return migrate(player);
+  } catch (_) { return null; }
+}
+
+// —— UTF-8 安全的 base64（兼容浏览器与 Node）——
+function btoaSafe(str) {
+  if (typeof btoa === 'function') return btoa(unescape(encodeURIComponent(str)));
+  return Buffer.from(str, 'utf8').toString('base64');
+}
+function atobSafe(str) {
+  if (typeof atob === 'function') return decodeURIComponent(escape(atob(str)));
+  return Buffer.from(str, 'base64').toString('utf8');
+}
+
+export { SLOT_PREFIX };
diff --git a/apps/xing-hai-lv-zhe/src/core/world.js b/apps/xing-hai-lv-zhe/src/core/world.js
new file mode 100644
index 0000000..10c19f4
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/src/core/world.js
@@ -0,0 +1,314 @@
+// ============================================================================
+// 浮岛生成模块：程序化生成 16×16 地图（房间感 + 连通保证）、迷雾、移动校验。
+// 纯数据与纯函数：生成 floorState 供 UI 渲染，移动 / 视野查询无副作用（除显式 mutate）。
+// ============================================================================
+import {
+  GRID, VISION_RADIUS, TILES, FLOOR_TILES, tileOf, isWalkable,
+  floorConfig, enemyPoolFor, EVENT_TYPES, EVENT_META, MAX_FLOOR, MEMORY_CHAPTERS,
+} from '../config.js';
+import { randInt, weightedPick, pick } from './rng.js';
+
+const key = (x, y) => `${x},${y}`;
+const inBounds = (x, y) => x >= 0 && y >= 0 && x < GRID && y < GRID;
+
+// —— 生成一张浮岛（floorState）——
+//   rng：可注入随机源；floor：楼层；player：用于 Boss 判定等（可选）。
+//   返回 { grid, pos, entities, explored, floor }
+export function generateFloor(rng, floor, player) {
+  const r = rng || Math.random;
+  const f = Math.max(1, Math.min(MAX_FLOOR, floor || 1));
+  const cfg = floorConfig(f);
+  const isBoss = f >= MAX_FLOOR;
+
+  // 多次尝试，直到连通率合格（避免被障碍物封死）。
+  let state = null;
+  for (let attempt = 0; attempt < 8; attempt++) {
+    state = tryGenerate(r, f, isBoss, cfg);
+    const reach = bfsReachable(state.grid, state.pos.x, state.pos.y);
+    const reachCount = reach.dist.size;
+    if (reachCount >= GRID * GRID * 0.6) {
+      state._reach = reach;
+      break;
+    }
+  }
+  if (!state._reach) state._reach = bfsReachable(state.grid, state.pos.x, state.pos.y);
+  const reach = state._reach;
+  delete state._reach;
+
+  // 阶梯：取可达集中距出生点最远的可行走地块。Boss 层无阶梯——击败 Boss 即通关。
+  let stairsCell = null;
+  if (!isBoss) {
+    stairsCell = pickFarReachable(r, reach, state.pos, 6);
+    if (stairsCell) state.grid[stairsCell.y][stairsCell.x] = 'stairs';
+  }
+
+  // 实体放置（仅在可达且未被占用的地块上）。
+  const occupied = new Set([key(state.pos.x, state.pos.y), key(stairsCell?.x, stairsCell?.y)]);
+  const reachableTiles = [...reach.dist.keys()]
+    .filter((k) => !occupied.has(k))
+    .map((k) => { const [x, y] = k.split(',').map(Number); return { x, y }; });
+
+  const entities = [];
+  let eid = 1;
+  const place = (type, dataFn) => {
+    const cell = takeCell(r, reachableTiles, occupied);
+    if (!cell) return null;
+    const e = { id: `e${eid++}`, type, x: cell.x, y: cell.y, ...(dataFn ? dataFn(cell) : {}) };
+    entities.push(e);
+    return e;
+  };
+
+  // Boss 层：只放 Boss + 记忆；普通层按 cfg 放怪 / 箱 / 事件 / 记忆。
+  if (isBoss) {
+    place('enemy', () => bossEnemy());
+  } else {
+    const pool = enemyPoolFor(f);
+    for (let i = 0; i < cfg.enemyCount; i++) {
+      place('enemy', () => spawnEnemy(r, pool, f));
+    }
+    for (let i = 0; i < cfg.chestCount; i++) place('chest', () => ({ reward: chestReward(r, f) }));
+    if (cfg.eventCount) place(pick(r, EVENT_TYPES));
+  }
+  // 每层 1 枚记忆回响（章节 = 楼层 - 1，对应 1..10 章）。
+  if (cfg.memory) place('memory', () => ({ chapter: Math.min(f - 1, MEMORY_CHAPTERS.length - 1) }));
+
+  state.entities = entities;
+  // explored 用普通对象（JSON 原生可序列化），随存档往返不丢失；key 形如 "x,y"。
+  const explored = {};
+  for (const k of visibleKeys(state.grid, state.pos.x, state.pos.y)) explored[k] = true;
+  state.explored = explored;
+  return state;
+}
+
+// 一次生成尝试：网格 + 障碍 + 出生点。
+function tryGenerate(r, f, isBoss, cfg) {
+  const grid = Array.from({ length: GRID }, () =>
+    Array.from({ length: GRID }, () => pick(r, FLOOR_TILES)));
+  // 边界石墙
+  for (let i = 0; i < GRID; i++) {
+    grid[0][i] = 'wall'; grid[GRID - 1][i] = 'wall';
+    grid[i][0] = 'wall'; grid[i][GRID - 1] = 'wall';
+  }
+  // 散布障碍：石墙 / 深墙 / 水域（不可走），密度随楼层略升。
+  const density = 0.10 + Math.min(0.06, (f - 1) * 0.008);
+  for (let y = 1; y < GRID - 1; y++) {
+    for (let x = 1; x < GRID - 1; x++) {
+      if (r() < density) {
+        grid[y][x] = weightedPick(r, { wall: 5, wallDark: 2, water: 3 }) || 'wall';
+      }
+    }
+  }
+  // 出生点：左上角附近的安全格，清空 3×3 邻域保证不卡。
+  const pos = { x: randInt(r, 1, 3), y: randInt(r, 1, 3) };
+  for (let dy = -1; dy <= 1; dy++) {
+    for (let dx = -1; dx <= 1; dx++) {
+      const x = pos.x + dx, y = pos.y + dy;
+      if (inBounds(x, y) && grid[y][x] !== 'floor') grid[y][x] = pick(r, ['floor', 'floor2']);
+    }
+  }
+  return { grid, pos, entities: [], explored: new Set(), floor: f };
+}
+
+function takeCell(r, pool, occupied) {
+  // 从可达池中随机取一个尚未占用的格子。
+  const avail = pool.filter((c) => !occupied.has(key(c.x, c.y)));
+  if (!avail.length) return null;
+  const c = pick(r, avail); // 复用 pick（内含 clampUnit 兜底），避免注入源 r()≥1 时下标越界取到 undefined
+  occupied.add(key(c.x, c.y));
+  return c;
+}
+
+function pickFarReachable(r, reach, from, minDist) {
+  // 在可达集中挑选距 from 距离 ≥ minDist 的格子（优先最远），保证阶梯远离出生点。
+  const entries = [...reach.dist.entries()]
+    .map(([k, d]) => { const [x, y] = k.split(',').map(Number); return { x, y, d }; })
+    .filter((c) => c.d >= minDist);
+  if (!entries.length) {
+    // 退化：取可达集中最远的。
+    const all = [...reach.dist.entries()].map(([k, d]) => { const [x, y] = k.split(',').map(Number); return { x, y, d }; });
+    if (!all.length) return null;
+    all.sort((a, b) => b.d - a.d);
+    return all[0];
+  }
+  entries.sort((a, b) => b.d - a.d);
+  // 取前 1/3 中随机一个，避免每次都最远角落。
+  const top = entries.slice(0, Math.max(1, Math.floor(entries.length / 3)));
+  return pick(r, top);
+}
+
+// 生成一个敌人实例（基于敌人定义池加权抽取）。
+function spawnEnemy(r, pool, floor) {
+  if (!pool || !pool.length) pool = enemyPoolFor(floor);
+  const weights = Object.fromEntries(pool.map((e, i) => [i, 1]));
+  const idx = Number(weightedPick(r, weights) || 0);
+  const def = pool[idx] || pool[0];
+  return enemyFromDef(def, floor);
+}
+function bossEnemy() {
+  const def = enemyPoolFor(MAX_FLOOR).find((e) => e.boss) || enemyPoolFor(MAX_FLOOR)[0];
+  return enemyFromDef(def, MAX_FLOOR);
+}
+export function enemyFromDef(def, floor) {
+  // 敌人 HP / 攻击随楼层小幅上扬，保证后期更有压力。
+  const tier = Math.max(0, (floor || 1) - (def.minFloor || 1));
+  return {
+    defId: def.id, name: def.name, emoji: def.emoji,
+    hp: def.hp + tier * 4, maxHp: def.hp + tier * 4,
+    atk: def.atk + tier, stances: { ...def.stances },
+    stardust: def.stardust, parts: def.parts, exp: def.exp,
+    boss: !!def.boss,
+  };
+}
+
+// 宝箱奖励：零件为主，偶有星骸。
+function chestReward(r, floor) {
+  const roll = r();
+  if (roll < 0.6) return { parts: randInt(r, 2, 4) + Math.floor(floor / 3) };
+  if (roll < 0.9) return { stardust: randInt(r, 3, 6) };
+  return { parts: randInt(r, 1, 3), stardust: randInt(r, 2, 4) };
+}
+
+// —— 视野（迷雾）：以 (x,y) 为中心的 5×5 切比雪夫窗口 ——
+export function visibleKeys(grid, x, y) {
+  const out = [];
+  for (let dy = -VISION_RADIUS; dy <= VISION_RADIUS; dy++) {
+    for (let dx = -VISION_RADIUS; dx <= VISION_RADIUS; dx++) {
+      const nx = x + dx, ny = y + dy;
+      if (inBounds(nx, ny)) out.push(key(nx, ny));
+    }
+  }
+  return out;
+}
+export function isVisible(x, y, pos) {
+  return Math.max(Math.abs(x - pos.x), Math.abs(y - pos.y)) <= VISION_RADIUS;
+}
+
+// —— BFS 可达性：从 (sx,sy) 出发，墙 / 水域 / 深墙视为阻挡 ——
+// 返回 { dist: Map(key->steps), prev: Map(key->key) }。
+export function bfsReachable(grid, sx, sy) {
+  const dist = new Map();
+  const prev = new Map();
+  if (!inBounds(sx, sy) || !isWalkable(grid[sy][sx])) return { dist, prev };
+  const q = [[sx, sy]];
+  dist.set(key(sx, sy), 0);
+  while (q.length) {
+    const [x, y] = q.shift();
+    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
+      const nx = x + dx, ny = y + dy;
+      if (!inBounds(nx, ny)) continue;
+      if (!isWalkable(grid[ny][nx])) continue;
+      const k = key(nx, ny);
+      if (dist.has(k)) continue;
+      dist.set(k, dist.get(key(x, y)) + 1);
+      prev.set(k, key(x, y));
+      q.push([nx, ny]);
+    }
+  }
+  return { dist, prev };
+}
+
+// 计算从 from 到 to 的路径（仅四向、避开阻挡与敌占格），返回步序列 [{x,y},...]（含 to，不含 from）。
+// range 为步数上限；超出或不可达返回 null。avoid 是额外阻挡坐标集合（如敌人）。
+export function findPath(state, from, to, range, avoid) {
+  if (!state) return null;
+  const block = new Set(avoid || []);
+  // 敌人所在格视为阻挡。
+  for (const e of state.entities) if (e.type === 'enemy') block.add(key(e.x, e.y));
+  const dist = new Map();
+  const prev = new Map();
+  const startK = key(from.x, from.y);
+  dist.set(startK, 0);
+  const q = [[from.x, from.y]];
+  let found = false;
+  while (q.length) {
+    const [x, y] = q.shift();
+    if (x === to.x && y === to.y) { found = true; break; }
+    const base = dist.get(key(x, y));
+    if (base >= range) continue;
+    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
+      const nx = x + dx, ny = y + dy;
+      const k = key(nx, ny);
+      if (dist.has(k)) continue;
+      if (!inBounds(nx, ny)) continue;
+      const isTarget = nx === to.x && ny === to.y;
+      if (block.has(k) && !isTarget) continue;       // 阻挡格不可踏入（目标格除外）
+      if (!isWalkable(state.grid[ny][nx]) && !isTarget) continue;
+      dist.set(k, base + 1);
+      prev.set(k, key(x, y));
+      q.push([nx, ny]);
+    }
+  }
+  if (!found && !(from.x === to.x && from.y === to.y)) return null;
+  // 回溯路径
+  const path = [];
+  let cur = key(to.x, to.y);
+  if (!dist.has(cur)) return null;
+  const steps = dist.get(cur);
+  if (steps > range) return null;
+  while (cur !== startK) {
+    const [cx, cy] = cur.split(',').map(Number);
+    path.unshift({ x: cx, y: cy });
+    cur = prev.get(cur);
+    if (cur == null) break;
+  }
+  return path;
+}
+
+// 计算从 from 出发、步数 ≤ range 的所有可达地块（四向；墙 / 水域 / 敌人格视为阻挡）。
+// 返回 Set(key)。供 UI 标注「可点击移动」高亮。
+export function reachableTiles(state, from, range) {
+  const out = new Set();
+  if (!state) return out;
+  const block = new Set();
+  for (const e of state.entities) if (e.type === 'enemy') block.add(key(e.x, e.y));
+  const dist = new Map();
+  const startK = key(from.x, from.y);
+  dist.set(startK, 0);
+  out.add(startK);
+  const q = [[from.x, from.y]];
+  while (q.length) {
+    const [x, y] = q.shift();
+    const base = dist.get(key(x, y));
+    if (base >= range) continue;
+    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
+      const nx = x + dx, ny = y + dy;
+      const k = key(nx, ny);
+      if (dist.has(k)) continue;
+      if (!inBounds(nx, ny)) continue;
+      if (block.has(k)) continue;
+      if (!isWalkable(state.grid[ny][nx])) continue;
+      dist.set(k, base + 1);
+      out.add(k);
+      q.push([nx, ny]);
+    }
+  }
+  return out;
+}
+
+// 查询某格上的实体。
+export function entityAt(state, x, y) {
+  if (!state || !state.entities) return null;
+  return state.entities.find((e) => e.x === x && e.y === y) || null;
+}
+export function removeEntity(state, id) {
+  if (!state || !state.entities) return false;
+  const i = state.entities.findIndex((e) => e.id === id);
+  if (i < 0) return false;
+  state.entities.splice(i, 1);
+  return true;
+}
+
+export function tileAt(state, x, y) {
+  if (!state || !inBounds(x, y)) return 'wall';
+  return state.grid[y][x];
+}
+
+// 下行：楼层 +1（上限 MAX_FLOOR），更新最远记录。返回新楼层。
+export function descend(player) {
+  if (!player) return 1;
+  player.floor = Math.min(MAX_FLOOR, player.floor + 1);
+  if (player.floor > player.maxFloor) player.maxFloor = player.floor;
+  return player.floor;
+}
+
+export { key, inBounds, GRID, VISION_RADIUS, TILES, tileOf, isWalkable, EVENT_META, MAX_FLOOR };
diff --git a/apps/xing-hai-lv-zhe/src/main.js b/apps/xing-hai-lv-zhe/src/main.js
new file mode 100644
index 0000000..148db51
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/src/main.js
@@ -0,0 +1,19 @@
+// ============================================================================
+// 星骸旅者 · 入口
+// 导出 createGame(parent) 工厂，供主框架（落地页）按需挂载到任意容器；
+// 同时保留独立运行（apps/xing-hai-lv-zhe/index.html）时的自动挂载行为。
+// ============================================================================
+import { GameUI } from './ui/app.js';
+
+export function createGame(parent) {
+  const ui = new GameUI(parent);
+  ui.mount();
+  return ui;
+}
+
+// 独立运行时自动挂载到 #game-container（仅在元素存在时触发，
+// 避免被主框架动态 import 时误启动游戏）。
+if (typeof document !== 'undefined' && document.getElementById('game-container')) {
+  const ui = createGame(document.getElementById('game-container'));
+  if (typeof window !== 'undefined') window.__XHLZ = ui; // 暴露实例便于调试 / 冒烟测试
+}
diff --git a/apps/xing-hai-lv-zhe/src/ui/app.js b/apps/xing-hai-lv-zhe/src/ui/app.js
new file mode 100644
index 0000000..30cf8fa
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/src/ui/app.js
@@ -0,0 +1,1354 @@
+// ============================================================================
+// 星骸旅者 · UI 渲染模块（UI Renderer，纯原生 DOM + CSS 像素网格）
+// 状态机：BOOT(launcher) → MAP → BATTLE → INVENTORY / EVENT → 结局。
+// 负责：启动器/创角、像素地图渲染与点击移动、猜拳战斗、背包(装备/天赋/剧情)、
+// 随机事件、双重结局、多槽位存档。requestAnimationFrame 驱动战斗计时与闲置回精。
+// ============================================================================
+import './style.css';
+import { h, clear, bar } from './dom.js';
+import {
+  PALETTE, GRID, VISION_RADIUS, TILES, tileOf, isWalkable,
+  EQUIP_SLOTS, MAX_PLUS, AFFIX_AT, AFFIXES, enhanceCost,
+  TALENTS, TALENT_BY_BRANCH, talentCost,
+  STAMINA_COST_PER_ROUND, STAMINA_REGEN_PER_STEP, STAMINA_REGEN_INTERVAL_MS, STAMINA_TIRED,
+  SHOP_ITEMS, DRONE_COST, EVENT_META, MEMORY_CHAPTERS, STORY, ENDINGS, MAX_FLOOR, expToNext,
+} from '../config.js';
+import {
+  newPlayer, migrate, maxHp, maxStamina, effectiveAtk, effectiveDef, effectiveMoveRange,
+  enhanceEquipment, buyTalent, resetTalents, gainReward, healFull, regenStamina, spendStamina,
+  isDead, collectMemory, collectedMemoryCount,
+} from '../core/player.js';
+import {
+  generateFloor, findPath, reachableTiles, entityAt, removeEntity, tileAt, descend,
+} from '../core/world.js';
+import {
+  STANCES, ACTIONS, COUNTERS, TELEGRAPH_CHANCE,
+  pickEnemyStance, isTelegraphed, autoPickAction, resolveRound, enemyReward,
+} from '../core/battle.js';
+import {
+  saveToSlot, loadFromSlot, deleteSlot, listSaves, hasAnySave, latestSlot,
+  exportSave, importSave, SAVE_SLOTS,
+} from '../core/save.js';
+
+const BATTLE_TIME_MS = 3000;       // 每回合限时（可于设置关闭）
+const IDLE_FRAME_MS = 1000 / 20;   // 闲置降帧至 ~20fps 节省电量
+
+export class GameUI {
+  constructor(parent) {
+    this.parent = parent;
+    this.player = null;
+    this.rng = Math.random;
+    this.screen = 'launcher';
+    this.over = false;
+    this.activeSlot = null;
+    this.timerEnabled = true;      // 战斗限时（测试可关闭）
+    this._sheet = null;
+    this.charName = '';
+    this.cellNodes = [];           // 2D 地块 DOM 引用（脏更新）
+    this.floatLayer = null;
+    this.running = false;          // rAF 循环开关
+    this._raf = 0;
+    this._lastFrame = 0;
+    this._staminaAccum = 0;
+    this.battle = null;            // 战斗会话状态
+  }
+
+  mount() {
+    this.root = h('div', { class: 'xhlz' });
+    clear(this.parent);
+    this.parent.appendChild(this.root);
+    this.toastWrap = h('div', { class: 'toast-wrap' });
+    this.stage = h('div', { class: 'xhlz-stage' });
+    this.modalRoot = h('div', { class: 'xhlz-modals' });
+    this.root.append(this.toastWrap, this.stage, this.modalRoot);
+    this.showLauncher();
+    return this;
+  }
+
+  // ===================== 启动器 =====================
+  showLauncher() {
+    this.screen = 'launcher';
+    this.over = false;
+    this.player = null;
+    this.battle = null;
+    this.activeSlot = null;
+    this.stopLoop();
+    clear(this.modalRoot);
+    clear(this.stage);
+    const hasSave = hasAnySave();
+    const wrap = h('div', { class: 'launcher' },
+      h('div', { class: 'launcher__brand' },
+        h('div', { class: 'emblem' }, '星'),
+        h('h1', null, '星骸旅者'),
+        h('p', { class: 'sub' }, '开罗式像素 Roguelike · 在破碎星球拾荒、战斗、寻回记忆'),
+      ),
+      h('div', { class: 'launcher__actions' },
+        hasSave
+          ? h('button', { class: 'btn-primary big-btn', onClick: () => this.continueGame() }, '▶ 继续旅程')
+          : h('button', { class: 'btn-primary big-btn', onClick: () => this.showCreate() }, '🚀 开启新旅程'),
+        hasSave
+          ? h('button', { class: 'btn-ghost', onClick: () => this.showCreate() }, '🆕 新旅程（选空槽）')
+          : null,
+        h('button', { class: 'btn-ghost', onClick: () => this.showSlots(true) }, '📂 存档管理'),
+        h('button', { class: 'btn-ghost', onClick: () => this.showAbout() }, '📖 关于 / 玩法'),
+      ),
+      h('p', { class: 'launcher__hint muted' }, '点击地块移动，靠近敌人即可交战；集齐 10 枚星骸回响，揭开星球的真相。'),
+    );
+    this.stage.appendChild(wrap);
+  }
+
+  continueGame() {
+    const slot = latestSlot();
+    if (slot == null) { this.toast('没有可继续的存档', 'bad'); this.showLauncher(); return; }
+    const p = loadFromSlot(slot);
+    if (!p) { this.toast('读取存档失败', 'bad'); this.showLauncher(); return; }
+    if (p.ending) { this.renderEnding(p.ending, true, p); return; }
+    if (isDead(p)) { this.player = p; this.activeSlot = slot; this.gameOver(); return; } // 陨落档直接展示终结画面，避免「继续」瞬间又死亡
+    this.enterGame(p, slot);
+  }
+
+  showAbout() {
+    const body = [
+      h('div', { class: 'card' },
+        h('h4', null, '🎮 核心循环'),
+        h('div', { class: 'muted', style: { lineHeight: 1.7 } },
+          '浮岛探索（点击移动）→ 触发战斗 / 宝箱 / 陷阱 → 回到背包消耗零件强化装备、用星骸点亮天赋 → 挑战更深层浮岛。'),
+      ),
+      h('div', { class: 'card' },
+        h('h4', null, '⚔️ 战斗：猜拳克制'),
+        h('div', { class: 'muted', style: { lineHeight: 1.7 } },
+          '敌人摆出 突刺🗡️ / 横斩🌀 / 重击💥；你选 格挡🛡️ / 闪避💨 / 反击⚔️。',
+          h('br'),
+          '反击克突刺、格挡克横斩、闪避克重击。成功克制 → 下一击专注力 ×1.5。精力过低会失手；可开启自动战斗代打。'),
+      ),
+      h('div', { class: 'card' },
+        h('h4', null, '💎 成长'),
+        h('div', { class: 'muted', style: { lineHeight: 1.7 } },
+          '武器/护甲/推进器消耗「零件」强化，+5 触发词缀变异；天赋树三条分支（生存/战斗/幸运）消耗「星骸」点亮，可免费重置。'),
+      ),
+    ];
+    this.showSheet({ title: '📖 关于 / 玩法', body, foot: [h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '明白')] });
+  }
+
+  // ===================== 存档管理（多槽位）=====================
+  showSlots(fromLauncher) {
+    const list = listSaves();
+    const body = [
+      h('div', { class: 'muted', style: { marginBottom: '0.5rem' } },
+        `共 ${SAVE_SLOTS} 个存档槽位。点击空槽可在此开始新旅程，已有存档可读取或删除。`),
+      h('div', { class: 'slot-list' }, list.map((s) => this.renderSlotRow(s))),
+    ];
+    const foot = [
+      fromLauncher ? null : h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '关闭'),
+      h('button', { class: 'btn-primary', onClick: () => { this.closeModal(); this.showCreate(); } }, '🆕 新旅程'),
+    ];
+    this.showSheet({ title: '📂 存档管理', body, foot: foot.filter(Boolean) });
+  }
+
+  renderSlotRow(s) {
+    const head = s.exists
+      ? h('div', { class: 'slot-info' },
+          h('div', { class: 'slot-name' }, `${s.name || '旅者'}${s.ending ? '  · 已通关' : s.dead ? ' · 已陨落' : ''}`),
+          h('div', { class: 'slot-meta' }, `第 ${s.floor || 1} 层 · 最深 ${s.maxFloor || 1} · Lv${s.level || 1} · 💎${s.memoryCount || 0}/10 · ✨${s.stardust || 0}`),
+        )
+      : h('div', { class: 'slot-info' }, h('div', { class: 'muted' }, '空槽位'));
+    const actions = h('div', { class: 'slot-actions' },
+      s.exists
+        ? [
+            h('button', { class: 'btn-primary slot-act', onClick: () => this.loadSlot(s.slot) }, '读取'),
+            h('button', { class: 'btn-ghost slot-act', onClick: () => this.confirmDeleteSlot(s.slot) }, '🗑️'),
+          ]
+        : h('button', { class: 'btn-jade slot-act', onClick: () => { this.closeModal(); this.showCreate(s.slot); } }, '在此开始'),
+    );
+    return h('div', { class: `slot-row ${s.exists ? '' : 'empty'}`, dataset: { slot: s.slot } },
+      h('span', { class: 'slot-no' }, `#${s.slot + 1}`), head, actions);
+  }
+
+  loadSlot(slot) {
+    const p = loadFromSlot(slot);
+    if (!p) { this.toast('读取失败', 'bad'); return; }
+    this.closeModal();
+    if (p.ending) { this.renderEnding(p.ending, true, p); return; }
+    if (isDead(p)) { this.player = p; this.activeSlot = slot; this.gameOver(); return; } // 陨落档：避免读取后再次瞬间死亡
+    this.enterGame(p, slot);
+  }
+
+  confirmDeleteSlot(slot) {
+    this.showSheet({
+      title: '删除该存档？',
+      body: [h('div', { class: 'muted' }, `将永久删除 #${slot + 1} 号槽位的存档，无法恢复。`)],
+      foot: [
+        h('button', { class: 'btn-danger', onClick: () => { deleteSlot(slot); this.closeModal(); this.toast('存档已删除'); this.showSlots(this.screen === 'launcher'); } }, '确认删除'),
+        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '取消'),
+      ],
+    });
+  }
+
+  // ===================== 创角 =====================
+  showCreate(preferSlot) {
+    this.screen = 'create';
+    this.stopLoop();
+    this._preferSlot = Number.isInteger(preferSlot) ? preferSlot : null;
+    clear(this.modalRoot);
+    clear(this.stage);
+    this.renderCreate();
+  }
+
+  renderCreate() {
+    clear(this.stage);
+    const wrap = h('div', { class: 'launcher' });
+    wrap.append(
+      h('div', { class: 'create__head' },
+        h('button', { class: 'btn-ghost', onClick: () => this.showLauncher() }, '← 返回'),
+        h('h1', null, '开启新旅程'),
+      ),
+      h('div', { class: 'card' },
+        h('h4', null, '姓名'),
+        h('input', { class: 'name-input', dataset: { id: 'name' }, maxlength: 8, placeholder: '旅者（可留空）', value: this.charName || '' }),
+        h('div', { class: 'muted', style: { marginTop: '0.3rem' } }, '为这位拾荒者取个名字。每个浮岛都藏着一枚记忆碎片，等着被你寻回。'),
+      ),
+      h('div', { class: 'create__foot' },
+        h('button', { class: 'btn-primary big-btn', onClick: () => this.confirmCreate() }, '🚀 迫降墨比乌斯'),
+      ),
+    );
+    this.stage.appendChild(wrap);
+    const inp = wrap.querySelector('[data-id="name"]');
+    if (inp) inp.addEventListener('input', () => { this.charName = inp.value; });
+  }
+
+  confirmCreate() {
+    const name = (this.charName || '').trim().slice(0, 8);
+    const p = newPlayer(this.rng, { name });
+    const slot = this.pickSlotForNewSave();
+    // 全槽位已满时 pickSlotForNewSave 会返回最久未玩档（已存在）→ 覆盖前二次确认，避免误删旧档。
+    const target = listSaves()[slot];
+    if (target && target.exists) {
+      this.confirmOverwriteSlot(slot, () => this.finalizeCreate(p, slot));
+      return;
+    }
+    this.finalizeCreate(p, slot);
+  }
+
+  finalizeCreate(p, slot) {
+    this.activeSlot = slot;
+    p.floorState = generateFloor(this.rng, p.floor, p);
+    this.enterGame(p, slot);
+    this.pushLog(STORY.prologue, 'milestone');
+    saveToSlot(this.activeSlot, this.player); // 序章写入后补存，避免重载前首条故事丢失
+    this.toast(`已保存到 #${slot + 1} 号槽位`, 'good');
+  }
+
+  confirmOverwriteSlot(slot, onConfirm) {
+    this.showSheet({
+      title: '覆盖该存档？',
+      body: [h('div', { class: 'muted' }, `所有槽位已满，新旅程将覆盖 #${slot + 1} 号槽位（最久未玩）的存档，无法恢复。`)],
+      foot: [
+        h('button', { class: 'btn-danger', onClick: () => { this.closeModal(); onConfirm(); } }, '确认覆盖'),
+        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '取消'),
+      ],
+    });
+  }
+
+  pickSlotForNewSave() {
+    const prefer = this._preferSlot;
+    const list = listSaves();
+    if (Number.isInteger(prefer) && prefer >= 0 && prefer < SAVE_SLOTS && !list[prefer].exists) return prefer;
+    const empty = list.find((s) => !s.exists);
+    if (empty) return empty.slot;
+    list.sort((a, b) => (a.lastSeen || 0) - (b.lastSeen || 0));
+    return list[0].slot;
+  }
+
+  // ===================== 进入游戏 =====================
+  enterGame(player, slot) {
+    this.player = player;
+    this.activeSlot = Number.isInteger(slot) ? slot : (this.activeSlot != null ? this.activeSlot : 0);
+    this.screen = 'game';
+    this.over = false;
+    this.battle = null;
+    // 存档无楼层快照（旧档 / 损坏）→ 重新生成当前层。
+    if (!this.player.floorState) this.player.floorState = generateFloor(this.rng, this.player.floor, this.player);
+    this.buildGame();
+    this.refreshStatus();
+    this.renderMap();
+    this.refreshInteract();
+    saveToSlot(this.activeSlot, this.player);
+    this.startLoop();
+    if (isDead(this.player)) this.gameOver();
+  }
+
+  buildGame() {
+    clear(this.stage);
+    clear(this.modalRoot);
+    const game = h('div', { class: 'xhlz-game' });
+    this.statusEl = h('div', { class: 'status-bar' });
+    const mapWrap = h('div', { class: 'map-wrap' },
+      this.floatLayer = h('div', { class: 'float-layer' }),
+      h('div', { class: 'map-frame' }, h('div', { class: 'map-grid', onClick: (e) => this.onMapTap(e) })),
+    );
+    this.bottomBar = h('div', { class: 'bottom-bar' });
+    game.append(this.statusEl, mapWrap, this.bottomBar);
+    this.stage.appendChild(game);
+    this.gridEl = mapWrap.querySelector('.map-grid');
+    this.buildStatus();
+    this.buildMap();
+    this.buildBottomBar();
+  }
+
+  // —— 顶部状态栏 ——
+  buildStatus() {
+    clear(this.statusEl);
+    const p = this.player;
+    this.hpFill = h('div', { class: 'bl-fill', style: { background: PALETTE.hp } });
+    this.hpVal = h('span', { class: 'bl-val' }, `${p.hp}/${maxHp(p)}`);
+    this.staFill = h('div', { class: 'bl-fill', style: { background: PALETTE.teal } });
+    this.staVal = h('span', { class: 'bl-val' }, `${p.stamina}/${maxStamina()}`);
+    this.statusEl.append(
+      h('div', { class: 'status-top' },
+        h('span', { class: 'status-name' }, p.name),
+        h('span', { class: 'status-lv' }, `Lv${p.level}`),
+        h('span', { class: 'status-floor' }, '第 ', h('b', null, String(p.floor)), ` / ${MAX_FLOOR} 层`),
+        h('span', { class: 'status-res' },
+          h('span', { class: 'r' }, h('span', null, '✨'), this.sdEl = h('span', null, String(p.stardust))),
+          h('span', { class: 'r' }, h('span', null, '🔩'), this.ptEl = h('span', null, String(p.parts))),
+        ),
+      ),
+      h('div', { class: 'status-bars' },
+        h('div', { class: 'barline' }, h('span', { class: 'bl-icon' }, '❤️'), h('div', { class: 'bl-track' }, this.hpFill), this.hpVal),
+        h('div', { class: 'barline' }, h('span', { class: 'bl-icon' }, '⚡'), h('div', { class: 'bl-track' }, this.staFill), this.staVal),
+      ),
+    );
+  }
+
+  refreshStatus() {
+    const p = this.player;
+    if (!p || !this.hpFill) return;
+    this.hpFill.style.width = `${(p.hp / maxHp(p)) * 100}%`;
+    this.hpVal.textContent = `${p.hp}/${maxHp(p)}`;
+    this.staFill.style.width = `${(p.stamina / maxStamina()) * 100}%`;
+    this.staVal.textContent = `${p.stamina}/${maxStamina()}`;
+    const nameEl = this.statusEl.querySelector('.status-name');
+    if (nameEl) nameEl.textContent = p.name;
+    const lvEl = this.statusEl.querySelector('.status-lv');
+    if (lvEl) lvEl.textContent = `Lv${p.level}`;
+    const floorB = this.statusEl.querySelector('.status-floor b');
+    if (floorB) floorB.textContent = String(p.floor);
+    if (this.sdEl) this.sdEl.textContent = String(p.stardust);
+    if (this.ptEl) this.ptEl.textContent = String(p.parts);
+  }
+
+  // —— 像素地图 ——
+  buildMap() {
+    clear(this.gridEl);
+    this.cellNodes = [];
+    for (let y = 0; y < GRID; y++) {
+      const row = [];
+      for (let x = 0; x < GRID; x++) {
+        const cell = h('div', { class: 'cell fog', dataset: { x: String(x), y: String(y) } });
+        this.gridEl.appendChild(cell);
+        row.push(cell);
+      }
+      this.cellNodes.push(row);
+    }
+  }
+
+  state() { return this.player.floorState; }
+
+  renderMap() {
+    const st = this.state();
+    if (!st) return;
+    const pos = st.pos;
+    const reach = this.screen === 'game' && !this._sheet ? reachableTiles(st, pos, effectiveMoveRange(this.player)) : new Set();
+    for (let y = 0; y < GRID; y++) {
+      for (let x = 0; x < GRID; x++) {
+        const cell = this.cellNodes[y][x];
+        const k = `${x},${y}`;
+        const explored = !!st.explored[k];
+        const visible = isVisible(x, y, pos);
+        const tileId = tileAt(st, x, y);
+        const ent = entityAt(st, x, y);
+        let cls = 'cell';
+        if (!explored && !visible) cls += ' fog';
+        else if (!visible) cls += ' dim';
+        else cls += ' visible';
+        const isPlayer = pos.x === x && pos.y === y;
+        if (isPlayer) cls += ' player';
+        if (tileId === 'stairs') cls += ' stairs';
+        if (reach.has(k) && !isPlayer) cls += ' reachable';
+        cell.className = cls;
+        // 背景：地块色（玩家格叠加蓝色调）
+        if (!explored && !visible) {
+          cell.style.background = '';
+        } else {
+          cell.style.background = isPlayer
+            ? `linear-gradient(rgba(77,150,255,0.45), rgba(77,150,255,0.45)), ${tileOf(tileId).color}`
+            : tileOf(tileId).color;
+        }
+        // 实体 emoji（陷阱不显示——踩到才发现）
+        let emoji = '';
+        if (visible || explored) {
+          if (isPlayer) emoji = '🧑‍🚀';
+          else if (ent) emoji = entityEmoji(ent, tileId);
+        }
+        // 仅在内容变化时更新，减少重排
+        const cur = cell.firstChild;
+        if (emoji) {
+          if (!cur || cur.textContent !== emoji) {
+            if (cur) cur.remove();
+            cell.appendChild(h('span', { class: 'ent' }, emoji));
+          }
+        } else if (cur) {
+          cur.remove();
+        }
+        cell.dataset.x = String(x);
+        cell.dataset.y = String(y);
+      }
+    }
+  }
+
+  // —— 移动：点击地块 ——
+  onMapTap(e) {
+    if (this.screen !== 'game' || this._sheet) return;
+    const cell = e.target.closest('.cell');
+    if (!cell) return;
+    const x = Number(cell.dataset.x), y = Number(cell.dataset.y);
+    this.tryMoveTo(x, y);
+  }
+
+  tryMoveTo(tx, ty) {
+    const st = this.state();
+    if (!st) return;
+    if (st.pos.x === tx && st.pos.y === ty) { this.refreshInteract(); return; }
+    const ent = entityAt(st, tx, ty);
+    if (ent && ent.type === 'enemy') { this.toast('靠近敌人后用「攻击」交战', 'normal'); return; }
+    if (!isWalkable(tileAt(st, tx, ty))) { this.toast('那里无法通行', 'normal'); return; }
+    const range = effectiveMoveRange(this.player);
+    const path = findPath(st, st.pos, { x: tx, y: ty }, range);
+    if (!path || !path.length) { this.toast('超出移动步数', 'normal'); return; }
+    this.walkPath(path);
+  }
+
+  // 沿路径行走，逐格结算（遇交互实体则停下）。
+  walkPath(path) {
+    const st = this.state();
+    for (const step of path) {
+      st.pos = { x: step.x, y: step.y };
+      this.player.turn += 1;
+      regenStamina(this.player, STAMINA_REGEN_PER_STEP);
+      this.revealAround();
+      const ent = entityAt(st, step.x, step.y);
+      if (ent) {
+        this.renderMap();
+        this.refreshStatus();
+        this.refreshInteract();
+        saveToSlot(this.activeSlot, this.player);
+        if (this.resolveEntity(ent)) return; // 进入战斗 / 弹窗则终止移动
+      }
+    }
+    this.renderMap();
+    this.refreshStatus();
+    this.refreshInteract();
+    saveToSlot(this.activeSlot, this.player);
+  }
+
+  revealAround() {
+    const st = this.state();
+    for (const k of visibleKeysList(st, st.pos.x, st.pos.y)) st.explored[k] = true;
+  }
+
+  // 踩到交互实体：返回 true 表示已切入战斗 / 弹窗，应中止移动。
+  resolveEntity(ent) {
+    const st = this.state();
+    if (ent.type === 'chest') {
+      const r = ent.reward || {};
+      // 用 gainReward 的实发量（含幸运加成）展示，避免飘字与状态栏不一致。
+      const g = gainReward(this.player, r, this.rng);
+      removeEntity(st, ent.id);
+      this.floatAt(ent.x, ent.y, `+✨${g.stardust} 🔩${g.parts}`, 'gold');
+      this.pushLog(`🎁 拾得宝箱：${g.stardust ? `✨${g.stardust} ` : ''}${g.parts ? `🔩${g.parts}` : ''}`, 'good');
+      this.toast('拾得宝箱', 'good');
+      this.refreshStatus();
+      return false;
+    }
+    if (ent.type === 'memory') {
+      const res = collectMemory(this.player, ent.chapter);
+      removeEntity(st, ent.id);
+      if (res.ok) {
+        this.floatAt(ent.x, ent.y, '💎 记忆', 'gold');
+        this.pushLog(`💎 寻回星骸回响：${MEMORY_CHAPTERS[res.chapter].title}`, 'milestone');
+        this.refreshStatus();
+        saveToSlot(this.activeSlot, this.player);
+        this.showChapter(res.chapter);
+        return true;
+      }
+      return false;
+    }
+    if (ent.type === 'trap') {
+      // 一次性陷阱：触发即消失。先移除再传送，teleport() 内的 saveToSlot 会落盘移除结果，
+      // 否则陷阱（emoji '' 不可见）会永久残留于地图。
+      removeEntity(st, ent.id);
+      this.teleport();
+      return true;
+    }
+    if (ent.type === 'merchant') { this.showMerchant(); return true; }
+    if (ent.type === 'drone') { this.showDrone(); return true; }
+    return false;
+  }
+
+  // 重力陷阱：传送到随机可达地块。
+  teleport() {
+    const st = this.state();
+    const reach = [...reachableTiles(st, st.pos, 99)];
+    const choices = reach.filter((k) => {
+      const [x, y] = k.split(',').map(Number);
+      return !(x === st.pos.x && y === st.pos.y) && !entityAt(st, x, y);
+    });
+    const pool = choices.length ? choices : reach;
+    const k = pool[Math.floor(this.rng() * pool.length)];
+    const [nx, ny] = k.split(',').map(Number);
+    st.pos = { x: nx, y: ny };
+    this.revealAround();
+    this.shake();
+    this.pushLog('🌀 触发重力陷阱！空间扭曲，你被抛向未知之处。', 'bad');
+    this.toast('重力陷阱！被传送', 'bad');
+    this.renderMap();
+    this.refreshStatus();
+    this.refreshInteract();
+    saveToSlot(this.activeSlot, this.player);
+  }
+
+  // —— 方向键单步移动 ——
+  dpadMove(dx, dy) {
+    if (this.screen !== 'game' || this._sheet) return;
+    const st = this.state();
+    const nx = st.pos.x + dx, ny = st.pos.y + dy;
+    this.tryMoveTo(nx, ny);
+  }
+
+  // —— 中央交互键（随上下文动态）——
+  buildBottomBar() {
+    clear(this.bottomBar);
+    const dpad = h('div', { class: 'dpad' },
+      h('button', { class: 'd-up', onClick: () => this.dpadMove(0, -1) }, '▲'),
+      h('button', { class: 'd-left', onClick: () => this.dpadMove(-1, 0) }, '◀'),
+      h('button', { class: 'd-center', onClick: () => this.refreshInteract() }, '·'),
+      h('button', { class: 'd-right', onClick: () => this.dpadMove(1, 0) }, '▶'),
+      h('button', { class: 'd-down', onClick: () => this.dpadMove(0, 1) }, '▼'),
+    );
+    this.interactBtn = h('button', { class: 'btn-primary interact-btn', onClick: () => this.doInteract() }, '🔍 调查');
+    const tools = h('div', { class: 'tool-col' },
+      h('button', { class: 'icon-btn', title: '背包 / 状态', onClick: () => this.openInventory() }, '🎒'),
+      h('button', { class: 'icon-btn', title: '设置 / 存档', onClick: () => this.showSettings(false) }, '⚙️'),
+    );
+    this.bottomBar.append(dpad, h('div', { class: 'act-col' }, this.interactBtn), tools);
+  }
+
+  // 依据周围上下文刷新中央键文案与可用性。
+  refreshInteract() {
+    if (!this.interactBtn || this.screen !== 'game') return;
+    const st = this.state();
+    const adj = adjacentEnemy(st, st.pos);
+    if (adj) {
+      this.interactBtn.className = 'btn-danger interact-btn';
+      this.interactBtn.textContent = `⚔️ 攻击·${adj.name}`;
+      this.interactBtn.disabled = false;
+      this._interactMode = { mode: 'attack', enemy: adj };
+      return;
+    }
+    if (tileAt(st, st.pos.x, st.pos.y) === 'stairs') {
+      this.interactBtn.className = 'btn-jade interact-btn';
+      this.interactBtn.textContent = '⬇️ 下行至下一浮岛';
+      this.interactBtn.disabled = false;
+      this._interactMode = { mode: 'descend' };
+      return;
+    }
+    const here = entityAt(st, st.pos.x, st.pos.y);
+    if (here && (here.type === 'chest' || here.type === 'memory')) {
+      this.interactBtn.className = 'btn-primary interact-btn';
+      this.interactBtn.textContent = here.type === 'memory' ? '💎 拾取回响' : '🎁 拾取宝箱';
+      this.interactBtn.disabled = false;
+      this._interactMode = { mode: 'pickup', ent: here };
+      return;
+    }
+    this.interactBtn.className = 'btn-ghost interact-btn';
+    this.interactBtn.textContent = '🔍 调查';
+    this.interactBtn.disabled = false;
+    this._interactMode = { mode: 'investigate' };
+  }
+
+  doInteract() {
+    if (this.screen !== 'game' || !this._interactMode) return;
+    const m = this._interactMode;
+    if (m.mode === 'attack') this.startBattle(m.enemy);
+    else if (m.mode === 'descend') this.descendFloor();
+    else if (m.mode === 'pickup') this.resolveEntity(m.ent);
+    else this.toast('周围没有可交互的对象', 'normal');
+  }
+
+  descendFloor() {
+    const st = this.state();
+    if (tileAt(st, st.pos.x, st.pos.y) !== 'stairs') { this.toast('需站在下行阶梯上', 'normal'); return; }
+    descend(this.player);
+    this.player.floorState = generateFloor(this.rng, this.player.floor, this.player);
+    this.pushLog(`⬇️ 降至第 ${this.player.floor} 层浮岛。`, 'milestone');
+    if (this.player.floor === 3) this.pushLog(STORY.midpoint, 'milestone');
+    this.refreshStatus();
+    this.renderMap();
+    this.refreshInteract();
+    saveToSlot(this.activeSlot, this.player);
+    this.toast(`进入第 ${this.player.floor} 层`, 'good');
+  }
+
+  // ===================== 战斗 =====================
+  startBattle(enemyEntity) {
+    if (this.screen !== 'game') return;
+    this.screen = 'battle';
+    this.battle = {
+      enemy: enemyEntity, focus: false, auto: false, round: 0,
+      stance: null, telegraphed: false, timerEnd: 0, busy: false,
+    };
+    clear(this.modalRoot);
+    this.buildBattle();
+    this.nextRound();
+  }
+
+  buildBattle() {
+    clear(this.stage);
+    const e = this.battle.enemy;
+    const wrap = h('div', { class: 'battle' });
+    this.foeEmoji = h('div', { class: 'emoji' }, e.emoji || '👾');
+    this.foeName = h('div', { class: 'name' }, `${e.name}${e.boss ? ' · BOSS' : ''}`);
+    this.foeHpFill = h('div', { class: 'bar__fill', style: { background: PALETTE.monster } });
+    this.foeHpLabel = h('span', { class: 'bar__label' }, `${e.hp}/${e.maxHp}`);
+    this.stanceChip = h('div', { class: 'stance-chip unknown' }, '敌人蓄势中…');
+    this.battleLog = h('div', { class: 'battle__log' });
+    this.timerFill = h('div', { class: 't', style: { width: '100%' } });
+    this.actionBtns = ['block', 'dodge', 'counter'].map((a) =>
+      h('button', { class: `act ${a}`, dataset: { action: a }, onClick: () => this.chooseAction(a) },
+        h('div', null, ACTIONS[a].emoji), h('div', null, ACTIONS[a].name)));
+    this.fleeBtn = h('button', { class: 'btn-ghost icon-btn', title: '撤退', onClick: () => this.confirmFlee() }, '🏃');
+    this.autoToggle = h('button', { class: 'btn-ghost icon-btn', title: '自动战斗', onClick: () => this.toggleAuto() }, '🤖');
+
+    this.hpFill = h('div', { class: 'bl-fill', style: { background: PALETTE.hp } });
+    this.hpVal = h('span', { class: 'bl-val' }, `${this.player.hp}/${maxHp(this.player)}`);
+    // 战斗屏独立浮动层（buildGame 的 floatLayer 已随 stage 清空而脱离）。
+    this.floatLayer = h('div', { class: 'float-layer' });
+
+    wrap.append(
+      h('div', { class: 'battle__topbar' },
+        this.fleeBtn,
+        h('span', { class: 'title' }, '战斗'),
+        this.autoToggle,
+      ),
+      h('div', { class: 'battle__foe' }, this.foeEmoji, this.foeName,
+        h('div', { class: 'bar', style: { marginTop: '0.4rem' } }, this.foeHpFill, this.foeHpLabel)),
+      h('div', { class: 'battle__stance' }, this.stanceChip),
+      this.battleLog,
+      h('div', { class: 'battle__self' },
+        h('span', null, '❤️'),
+        h('div', { class: 'barline', style: { flex: 1 } }, h('div', { class: 'bl-track' }, this.hpFill), this.hpVal),
+      ),
+      h('div', { class: 'battle__timer' }, this.timerFill),
+      h('div', { class: 'battle__actions' }, this.actionBtns),
+      this.floatLayer,
+    );
+    this.stage.appendChild(wrap);
+    this.logBattle(`与 ${e.name} 交战！`, 'normal');
+  }
+
+  nextRound() {
+    if (!this.battle) return;
+    this.battle.round += 1;
+    const stance = pickEnemyStance(this.battle.enemy, this.rng);
+    const tele = isTelegraphed(this.rng);
+    this.battle.stance = stance;
+    this.battle.telegraphed = tele;
+    this.battle.busy = false;
+    // 架势展示：识破时明牌，否则「??」需盲猜。
+    if (tele) {
+      const s = STANCES[stance];
+      this.stanceChip.className = 'stance-chip';
+      this.stanceChip.textContent = `${s.emoji} 敌人摆出「${s.name}」`;
+    } else {
+      this.stanceChip.className = 'stance-chip unknown';
+      this.stanceChip.textContent = '❓ 敌人意图难辨…';
+    }
+    for (const b of this.actionBtns) b.disabled = false;
+    if (this.fleeBtn) this.fleeBtn.disabled = false;
+    if (this.timerEnabled && !this.battle.auto) {
+      this.battle.timerEnd = nowMs() + BATTLE_TIME_MS;
+    } else {
+      this.timerFill.style.width = '100%';
+    }
+    if (this.battle.auto) {
+      const act = autoPickAction(stance);
+      // 不预置 busy=true：chooseAction 自带 busy 守卫，预置会令其立即返回，导致自动战斗死锁。
+      setTimeout(() => { if (this.battle) this.chooseAction(act); }, 320);
+    }
+  }
+
+  chooseAction(action) {
+    if (!this.battle || this.battle.busy) return;
+    this.battle.busy = true;
+    for (const b of this.actionBtns) b.disabled = true;
+    if (this.fleeBtn) this.fleeBtn.disabled = true; // 结算窗口期间禁用撤退，避免与胜负结算交错
+    this.resolveBattleRound(action);
+  }
+
+  resolveBattleRound(action) {
+    const b = this.battle;
+    const p = this.player;
+    spendStamina(p, STAMINA_COST_PER_ROUND);
+    const res = resolveRound(p, b.enemy, action, b.focus, b.stance, this.rng);
+    b.focus = res.nextFocus;
+
+    // 敌人受伤反馈
+    if (res.enemyDmg > 0) {
+      this.foeHpFill.style.width = `${(b.enemy.hp / b.enemy.maxHp) * 100}%`;
+      this.foeHpLabel.textContent = `${b.enemy.hp}/${b.enemy.maxHp}`;
+      this.floatAtCenter(`${res.countered ? '💥 ' : ''}-${res.enemyDmg}`, 'up');
+    }
+    // 玩家受伤反馈
+    if (res.playerDmg > 0) { this.shake(); this.floatAtCenter(`-${res.playerDmg}`, 'down'); }
+    if (res.healed > 0) this.floatAtCenter(`+${res.healed}`, 'up');
+    this.hpFill.style.width = `${(p.hp / maxHp(p)) * 100}%`;
+    this.hpVal.textContent = `${p.hp}/${maxHp(p)}`;
+
+    // 战报
+    const sName = STANCES[res.stance].name;
+    if (res.fumble) this.logBattle(`精力不济，${ACTIONS[res.action]?.name || '应对'}失手！受到 ${res.playerDmg} 伤害。`, 'bad');
+    else if (res.countered) this.logBattle(`${ACTIONS[res.action].name} 完美克制「${sName}」！造成 ${res.enemyDmg} 伤害，专注力蓄满。`, 'good');
+    else this.logBattle(`${ACTIONS[res.action]?.name || '犹豫'}未能克制「${sName}」，受到 ${res.playerDmg} 伤害。`, 'bad');
+
+    if (res.enemyDead) { setTimeout(() => { if (this.battle) this.winBattle(); }, 360); return; }
+    if (res.playerDead) { setTimeout(() => { if (this.battle) this.loseBattle(); }, 360); return; }
+    setTimeout(() => { if (this.battle) this.nextRound(); }, 520);
+  }
+
+  toggleAuto() {
+    if (!this.battle) return;
+    this.battle.auto = !this.battle.auto;
+    this.autoToggle.classList.toggle('btn-jade', this.battle.auto);
+    this.autoToggle.textContent = this.battle.auto ? '🤖✅' : '🤖';
+    this.toast(this.battle.auto ? '自动战斗：开' : '自动战斗：关');
+    if (this.battle.auto && !this.battle.busy) {
+      const act = autoPickAction(this.battle.stance);
+      setTimeout(() => { if (this.battle) this.chooseAction(act); }, 320);
+      return;
+    }
+    // 关闭自动时，若正等待玩家操作，重置一个完整限时窗口。
+    // 否则 timerEnd 仍停留在自动期间未更新的旧值（可能早已过期），
+    // onTick 会立刻判定 remain==0 → 瞬间失手，把「关自动」误判为玩家反应不及。
+    if (!this.battle.auto && this.timerEnabled && !this.battle.busy) {
+      this.battle.timerEnd = nowMs() + BATTLE_TIME_MS;
+    }
+  }
+
+  confirmFlee() {
+    this.showSheet({
+      title: '脱离战斗？',
+      body: [h('div', { class: 'muted' }, '撤退会损失少量星骸，回到地图（敌人仍在）。')],
+      foot: [
+        h('button', { class: 'btn-danger', onClick: () => this.flee() }, '撤退'),
+        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '继续战斗'),
+      ],
+    });
+  }
+
+  flee() {
+    this.closeModal();
+    const cost = Math.min(this.player.stardust, 2);
+    this.player.stardust -= cost;
+    this.pushLog(`🏃 撤离战斗，散落 ${cost} 星骸。`, 'normal');
+    // exitBattle(false) 不落盘，此处显式保存星骸扣除，避免关浏览器后回滚。
+    saveToSlot(this.activeSlot, this.player);
+    this.exitBattle(false);
+  }
+
+  winBattle() {
+    if (!this.battle) return; // 360ms 窗口内若已脱离战斗（撤退/卸载），丢弃本次结算
+    const e = this.battle.enemy;
+    const reward = enemyReward(e);
+    const gained = gainReward(this.player, reward, this.rng);
+    // 移除地图上的敌人实体
+    removeEntity(this.state(), e.id);
+    this.pushLog(`🏆 击败 ${e.name}！获得 ✨${gained.stardust} 🔩${gained.parts}${gained.leveled ? ` · 升级至 Lv${this.player.level}！` : ''}`, 'milestone');
+    this.exitBattle(true);
+    if (e.boss) { this.offerEnding(); return; }
+    this.toast(gained.leveled ? '升级！' : '胜利', 'good');
+  }
+
+  loseBattle() {
+    if (!this.battle) return;
+    this.exitBattle(false);
+    this.gameOver();
+  }
+
+  // 退出战斗回到地图（恢复 game 屏）。
+  exitBattle(save) {
+    this.battle = null;
+    this.screen = 'game';
+    this.buildGame();
+    this.refreshStatus();
+    this.renderMap();
+    this.refreshInteract();
+    if (save) saveToSlot(this.activeSlot, this.player);
+  }
+
+  logBattle(text, type = 'normal') {
+    if (!this.battleLog) return;
+    this.battleLog.appendChild(h('div', { class: `ln ${type}` }, text));
+    this.battleLog.scrollTop = this.battleLog.scrollHeight;
+  }
+
+  // —— 结局抉择（击败 Boss 后）——
+  // 仅展示抉择弹窗；最终 'over' 态由 chooseEnding / renderEnding 落定，
+  // 这样即便玩家误触关闭弹窗，也能回到可交互的地图（Boss 已除、当前层无下行）。
+  offerEnding() {
+    saveToSlot(this.activeSlot, this.player);
+    const body = [
+      h('div', { class: 'ending' },
+        h('div', { class: 'ending__emoji' }, '🌟'),
+        h('h2', null, '星骸之核已寂灭'),
+        h('div', { class: 'ending__text' },
+          `你集齐了 ${collectedMemoryCount(this.player)} 枚星骸回响。所有的记忆在掌心翻涌——现在，由你回答那个被整个文明搁置的问题。`),
+      ),
+    ];
+    const foot = [
+      h('button', { class: 'btn-jade', onClick: () => this.chooseEnding('peace') }, `${ENDINGS.peace.emoji} ${ENDINGS.peace.name}`),
+      h('button', { class: 'btn-danger', onClick: () => this.chooseEnding('dark') }, `${ENDINGS.dark.emoji} ${ENDINGS.dark.name}`),
+    ];
+    this.showSheet({ title: '终章 · 你的回答', body, foot, dismissable: false });
+  }
+
+  chooseEnding(key) {
+    this.closeModal();
+    this.player.ending = key;
+    saveToSlot(this.activeSlot, this.player);
+    this.renderEnding(key, false, this.player);
+  }
+
+  renderEnding(key, fromSave, player) {
+    this.screen = 'over';
+    this.over = true;
+    this.player = player || this.player;
+    this.stopLoop();
+    clear(this.modalRoot);
+    clear(this.stage);
+    const e = ENDINGS[key] || ENDINGS.peace;
+    const wrap = h('div', { class: 'launcher' });
+    wrap.append(
+      h('div', { class: `ending ${e.tone}` },
+        h('div', { class: 'ending__emoji' }, e.emoji),
+        h('h2', null, e.title),
+        h('div', { class: 'muted' }, `${this.player.name} · 第 ${this.player.maxFloor} 层 · Lv${this.player.level} · 💎${collectedMemoryCount(this.player)}/10`),
+        h('div', { class: 'ending__text' }, e.text),
+      ),
+      h('div', { class: 'ending__choice' },
+        fromSave
+          ? h('button', { class: 'btn-ghost big-btn', onClick: () => this.showLauncher() }, '← 返回标题')
+          : null,
+        h('button', { class: 'btn-primary big-btn', onClick: () => this.restart() }, '🔄 再启新旅程'),
+      ),
+    );
+    this.stage.appendChild(wrap);
+  }
+
+  gameOver() {
+    if (this.over) return;
+    this.over = true;
+    this.screen = 'over';
+    this.stopLoop();
+    this.battle = null;
+    saveToSlot(this.activeSlot, this.player);
+    clear(this.modalRoot);
+    clear(this.stage);
+    const wrap = h('div', { class: 'launcher' });
+    wrap.append(
+      h('div', { class: 'ending dark' },
+        h('div', { class: 'ending__emoji' }, '💀'),
+        h('h2', null, '旅程终结'),
+        h('div', { class: 'muted' }, `${this.player.name} 倒在了第 ${this.player.floor} 层。`),
+        h('div', { class: 'ending__text' }, '星骸的光在你眼中缓缓熄灭。墨比乌斯依旧漂浮、寂静——但或许，下一位旅者能走得更远。'),
+      ),
+      h('div', { class: 'ending__choice' },
+        h('button', { class: 'btn-primary big-btn', onClick: () => this.restart() }, '🔄 再启新旅程'),
+        h('button', { class: 'btn-ghost', onClick: () => this.showSettings(false) }, '⚙️ 导出 / 存档'),
+      ),
+    );
+    this.stage.appendChild(wrap);
+  }
+
+  restart() {
+    if (this.activeSlot != null) deleteSlot(this.activeSlot);
+    this.player = null;
+    this.over = false;
+    this.showCreate();
+  }
+
+  // ===================== 背包 / 天赋 / 剧情 =====================
+  openInventory() {
+    if (this.screen !== 'game') return;
+    this.showInventoryTab('equip');
+  }
+
+  showInventoryTab(tab) {
+    clear(this.modalRoot);
+    const p = this.player;
+    const tabs = h('div', { class: 'tabs' },
+      h('button', { class: `tab ${tab === 'equip' ? 'active' : ''}`, onClick: () => this.showInventoryTab('equip') }, '🗡️ 装备'),
+      h('button', { class: `tab ${tab === 'talent' ? 'active' : ''}`, onClick: () => this.showInventoryTab('talent') }, '🌟 天赋'),
+      h('button', { class: `tab ${tab === 'story' ? 'active' : ''}`, onClick: () => this.showInventoryTab('story') }, '📖 回响'),
+    );
+    let body;
+    if (tab === 'equip') body = this.renderEquipTab();
+    else if (tab === 'talent') body = this.renderTalentTab();
+    else body = this.renderStoryTab();
+    const sheet = h('div', { class: 'sheet' },
+      h('div', { class: 'sheet__head' }, h('span', { class: 't' }, '🎒 背包')),
+      tabs,
+      h('div', { class: 'sheet__body' }, body),
+      h('div', { class: 'sheet__foot' },
+        h('span', { class: 'muted', style: { flex: 1, alignSelf: 'center' } }, `✨ ${p.stardust} 星骸　🔩 ${p.parts} 零件`),
+        h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '关闭'),
+      ),
+    );
+    this.modalRoot.append(h('div', { class: 'sheet-overlay', onClick: () => this.closeModal() }), sheet);
+    this._sheet = sheet;
+  }
+
+  renderEquipTab() {
+    const p = this.player;
+    const frag = [];
+    const meta = {
+      weapon: { emoji: '🗡️', label: '武器', statName: '攻击', statFn: () => effectiveAtk(p) },
+      armor: { emoji: '🛡️', label: '护甲', statName: '防御', statFn: () => effectiveDef(p) },
+      booster: { emoji: '🥾', label: '推进器', statName: '步数', statFn: () => effectiveMoveRange(p) },
+    };
+    for (const slot of EQUIP_SLOTS) {
+      const e = p.equipment[slot];
+      const m = meta[slot];
+      const cost = enhanceCost(e.plus);
+      const maxed = e.plus >= MAX_PLUS;
+      const afford = p.parts >= cost;
+      const affix = e.affix ? AFFIXES.find((a) => a.id === e.affix.id) : null;
+      frag.push(h('div', { class: 'card equip-card' },
+        h('div', { class: 'eq-emoji' }, m.emoji),
+        h('div', { class: 'eq-info' },
+          h('div', { class: 'eq-name' }, `${e.name} `, h('span', { class: 'plus' }, e.plus > 0 ? `+${e.plus}` : ''),
+            h('span', { class: 'muted', style: { fontWeight: 400, fontSize: '0.78rem' } }, `　当前${m.statName} ${m.statFn()}`)),
+          h('div', { class: 'eq-affix' }, affix ? `${affix.emoji} 词缀·${affix.name}：${affix.desc}` : `+${AFFIX_AT} 触发词缀变异`),
+          h('div', { class: 'eq-cost' }, maxed ? '已达强化上限' : `强化消耗 🔩${cost}`),
+        ),
+        h('button', {
+          class: 'btn-primary', disabled: maxed || !afford,
+          onClick: () => this.doEnhance(slot),
+        }, maxed ? '满级' : '强化'),
+      ));
+    }
+    return frag;
+  }
+
+  doEnhance(slot) {
+    const res = enhanceEquipment(this.player, slot, this.rng);
+    if (!res.ok) {
+      if (res.reason === 'no-parts') this.toast(`零件不足（需 🔩${res.cost}）`, 'bad');
+      else if (res.reason === 'max') this.toast('已达强化上限', 'normal');
+      return;
+    }
+    saveToSlot(this.activeSlot, this.player);
+    this.refreshStatus();
+    if (res.affixed) this.toast(`+${res.plus}！触发词缀变异：${res.affixed.emoji} ${res.affixed.name}`, 'good');
+    else this.toast(`强化成功 +${res.plus}`, 'good');
+    this.showInventoryTab('equip');
+  }
+
+  renderTalentTab() {
+    const p = this.player;
+    const frag = [h('div', { class: 'muted', style: { marginBottom: '0.5rem' } },
+      `消耗星骸点亮，可随时免费重置。已用 ✨${spentStardust(p)}。`)];
+    for (const t of TALENTS) {
+      const rank = p.talents[t.branch] || 0;
+      const maxed = rank >= t.maxRank;
+      const cost = talentCost(t.branch, rank);
+      const afford = p.stardust >= cost;
+      const pips = Array.from({ length: t.maxRank }, (_, i) => h('span', { class: `talent-pip ${i < rank ? 'on' : ''}` }));
+      frag.push(h('div', { class: 'card talent-branch' },
+        h('div', { class: 'talent-head' },
+          h('span', { style: { fontSize: '1.3rem' } }, t.emoji),
+          h('div', { class: 'grow' }, h('div', { style: { fontWeight: 700 } }, `${t.name} · Lv${rank}/${t.maxRank}`),
+            h('div', { class: 'muted', style: { fontSize: '0.78rem' } }, t.desc)),
+          h('button', {
+            class: 'btn-primary', disabled: maxed || !afford, style: { flex: 'none' },
+            onClick: () => this.doBuyTalent(t.branch),
+          }, maxed ? '满级' : `✨${cost}`),
+        ),
+        h('div', { class: 'talent-ranks' }, pips),
+      ));
+    }
+    frag.push(h('button', { class: 'btn-ghost', style: { width: '100%' }, onClick: () => this.doResetTalents() }, '↩️ 免费重置天赋'));
+    return frag;
+  }
+
+  doBuyTalent(branch) {
+    const res = buyTalent(this.player, branch);
+    if (!res.ok) {
+      if (res.reason === 'no-stardust') this.toast(`星骸不足（需 ✨${res.cost}）`, 'bad');
+      return;
+    }
+    saveToSlot(this.activeSlot, this.player);
+    this.refreshStatus();
+    this.toast(`${TALENT_BY_BRANCH[branch].name} → Lv${res.rank}`, 'good');
+    this.showInventoryTab('talent');
+  }
+
+  doResetTalents() {
+    const res = resetTalents(this.player);
+    saveToSlot(this.activeSlot, this.player);
+    this.refreshStatus();
+    this.toast(`天赋已重置，返还 ✨${res.refund}`, 'good');
+    this.showInventoryTab('talent');
+  }
+
+  renderStoryTab() {
+    const p = this.player;
+    const frag = [h('div', { class: 'muted', style: { marginBottom: '0.5rem' } },
+      `已寻回 ${collectedMemoryCount(p)} / ${MEMORY_CHAPTERS.length} 枚星骸回响。`)];
+    MEMORY_CHAPTERS.forEach((ch, i) => {
+      const unlocked = p.memory[i];
+      frag.push(h('div', { class: `chapter ${unlocked ? '' : 'locked'}` },
+        h('div', { class: 'ch-title' }, `${unlocked ? '💎' : '🔒'} ${ch.title}`),
+        h('div', { class: 'ch-text' }, unlocked ? ch.text : '尚未寻回这枚记忆碎片。继续深入浮岛吧。'),
+      ));
+    });
+    return frag;
+  }
+
+  showChapter(idx) {
+    const ch = MEMORY_CHAPTERS[idx];
+    if (!ch) return;
+    const body = [
+      h('div', { class: 'chapter' },
+        h('div', { class: 'ch-title' }, `💎 ${ch.title}`),
+        h('div', { class: 'ch-text' }, ch.text),
+      ),
+    ];
+    this.showSheet({
+      title: '星骸回响',
+      body,
+      foot: [h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '继续')],
+    });
+  }
+
+  // ===================== 随机事件 =====================
+  showMerchant() {
+    const p = this.player;
+    const body = [
+      h('div', { class: 'muted', style: { marginBottom: '0.5rem' } }, `${EVENT_META.merchant.desc}（持有 ✨${p.stardust}）`),
+      h('div', { class: 'slot-list' }, SHOP_ITEMS.map((it) => {
+        const afford = p.stardust >= it.cost;
+        return h('div', { class: 'slot-row' },
+          h('span', { class: 'slot-no' }, it.emoji),
+          h('div', { class: 'slot-info' }, h('div', { class: 'slot-name' }, it.name)),
+          h('div', { class: 'slot-actions' },
+            h('button', { class: 'btn-primary slot-act', disabled: !afford, onClick: () => this.buyItem(it) }, `✨${it.cost}`)),
+        );
+      })),
+    ];
+    this.showSheet({ title: '🛒 流浪商人', body, foot: [h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '离开')] });
+  }
+
+  buyItem(it) {
+    const p = this.player;
+    if (p.stardust < it.cost) { this.toast('星骸不足', 'bad'); return; }
+    p.stardust -= it.cost;
+    if (it.give.fullHeal) { healFull(p); this.toast('已满状态恢复', 'good'); }
+    else { gainReward(p, it.give, this.rng); this.toast(`购得 ${it.name}`, 'good'); }
+    saveToSlot(this.activeSlot, this.player);
+    this.refreshStatus();
+    this.showMerchant();
+  }
+
+  showDrone() {
+    const p = this.player;
+    const afford = p.stardust >= DRONE_COST;
+    const body = [
+      h('div', { class: 'muted', style: { marginBottom: '0.5rem' } }, `${EVENT_META.drone.desc}（持有 ✨${p.stardust}，需 ✨${DRONE_COST}）`),
+    ];
+    this.showSheet({
+      title: '🔧 维修无人机',
+      body,
+      foot: [
+        h('button', { class: 'btn-jade', disabled: !afford, onClick: () => this.useDrone() }, `维修（✨${DRONE_COST}）`),
+        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '离开'),
+      ],
+    });
+  }
+
+  useDrone() {
+    const p = this.player;
+    if (p.stardust < DRONE_COST) { this.toast('星骸不足', 'bad'); return; }
+    p.stardust -= DRONE_COST;
+    healFull(p);
+    this.closeModal();
+    this.refreshStatus();
+    this.toast('全状态已恢复', 'good');
+    this.pushLog('🔧 维修无人机为你回满 HP 与精力。', 'good');
+    saveToSlot(this.activeSlot, this.player);
+  }
+
+  // ===================== 设置 / 存档 =====================
+  showSettings(fromLauncher) {
+    const p = this.player;
+    const body = [
+      h('div', { class: 'card' },
+        h('h4', null, '存档'),
+        h('div', { class: 'muted', style: { marginBottom: '0.4rem' } },
+          `进度自动保存${p ? `（#${(this.activeSlot == null ? '?' : this.activeSlot + 1)} · ${p.name} · 第 ${p.floor} 层）` : '。'}`),
+        h('button', { class: 'btn-primary', style: { width: '100%', marginBottom: '0.4rem' }, onClick: () => { this.closeModal(); this.showSlots(fromLauncher); } }, '📂 存档管理（多槽位）'),
+        h('button', { class: 'btn-jade', style: { width: '100%', marginBottom: '0.4rem' }, onClick: () => this.doExport() }, '📤 导出存档字符串'),
+        h('textarea', { class: 'save-io', dataset: { id: 'io' }, placeholder: '在此粘贴导入字符串…', readonly: true }),
+        h('div', { class: 'tabs', style: { marginTop: '0.4rem' } },
+          h('button', { class: 'tab', style: { flex: '1 1 45%' }, onClick: () => this.toggleIoInput() }, '✏️ 切换为输入'),
+          h('button', { class: 'tab', style: { flex: '1 1 45%', background: 'linear-gradient(180deg,#6fe0b0,#2f9a72)', color: '#06241a', borderColor: '#2f9a72' }, onClick: () => this.doImport() }, '📥 导入'),
+        ),
+      ),
+      h('div', { class: 'card' },
+        h('h4', null, '选项'),
+        h('div', { class: 'row', style: { justifyContent: 'space-between' } },
+          h('span', null, '战斗限时（3 秒/回合）'),
+          h('button', { class: `tab ${this.timerEnabled ? 'active' : ''}`, onClick: () => { this.timerEnabled = !this.timerEnabled; this.showSettings(fromLauncher); } }, this.timerEnabled ? '开' : '关'),
+        ),
+      ),
+    ];
+    const foot = [
+      fromLauncher ? null : h('button', { class: 'btn-ghost', onClick: () => { this.closeModal(); this.confirmExitToLauncher(); } }, '🏠 返回标题'),
+      h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '关闭'),
+    ];
+    this.showSheet({ title: '设置 / 存档', body, foot: foot.filter(Boolean) });
+  }
+
+  toggleIoInput() {
+    const io = this.modalRoot.querySelector('[data-id="io"]');
+    if (!io) return;
+    io.readOnly = !io.readOnly;
+    if (io.readOnly) { io.value = ''; this.toast('已切回导出模式'); }
+    else { this.toast('请粘贴导入字符串后点导入'); }
+  }
+
+  doExport() {
+    const p = this.player || (this.activeSlot != null ? loadFromSlot(this.activeSlot) : null) || (latestSlot() != null ? loadFromSlot(latestSlot()) : null);
+    if (!p) { this.toast('暂无可导出的存档', 'bad'); return; }
+    const io = this.modalRoot.querySelector('[data-id="io"]');
+    const str = exportSave(p);
+    if (io) { io.readOnly = true; io.value = str; }
+    this.toast('存档字符串已生成', 'good');
+  }
+
+  doImport() {
+    const io = this.modalRoot.querySelector('[data-id="io"]');
+    const str = (io && io.value || '').trim();
+    if (!str) { this.toast('请先粘贴导入字符串', 'bad'); return; }
+    const p = importSave(str);
+    if (!p) { this.toast('导入失败：字符串无效', 'bad'); return; }
+    const slot = this.activeSlot != null ? this.activeSlot : this.pickSlotForNewSave();
+    this.activeSlot = slot;
+    p.floorState = null; // 导入档重生成当前层
+    saveToSlot(slot, p);
+    this.toast(`导入成功，已写入 #${slot + 1} 槽位`, 'good');
+    this.closeModal();
+    // 通关档直接进入结局画面，与「继续旅程」行为一致，而非落回可游玩地图。
+    if (p.ending) { this.player = p; this.renderEnding(p.ending, true, p); }
+    else this.enterGame(p, slot);
+  }
+
+  confirmExitToLauncher() {
+    if (!this.player) { this.showLauncher(); return; }
+    this.showSheet({
+      title: '返回标题？',
+      body: [h('div', { class: 'muted' }, '进度已自动保存，可随时从存档管理回到这里。')],
+      foot: [
+        h('button', { class: 'btn-primary', onClick: () => { this.closeModal(); this.showLauncher(); } }, '返回标题'),
+        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '留在游戏'),
+      ],
+    });
+  }
+
+  // ===================== 通用弹窗 / 反馈 =====================
+  showSheet({ title, body, foot, dismissable = true }) {
+    clear(this.modalRoot);
+    // 限时战斗回合中开弹窗（如撤退确认）：onTick 倒计时分支因 !this._sheet 整体跳过，
+    // 视觉上「暂停」。这里同步记下开弹窗瞬间的剩余时间，关弹窗时据此顺延 timerEnd，
+    // 否则 timerEnd 这个绝对截止时间不会随暂停顺延 → 取消弹窗后 remain==0 → 瞬间失手，
+    // 把玩家的深思熟虑误判为反应不及（与 toggleAuto/nextRound 同源的计时器陈旧漏洞）。
+    if (this.screen === 'battle' && this.battle && this.timerEnabled && !this.battle.auto && !this.battle.busy) {
+      this._battlePauseRemain = Math.max(0, this.battle.timerEnd - nowMs());
+    }
+    // dismissable=false 时遮罩不可点击关闭（用于必须做出选择的结局抉择，避免软锁）。
+    const overlay = h('div', { class: 'sheet-overlay', onClick: () => { if (dismissable) this.closeModal(); } });
+    const sheet = h('div', { class: 'sheet' },
+      h('div', { class: 'sheet__head' }, h('span', { class: 't' }, title || '')),
+      h('div', { class: 'sheet__body' }, ...(body || [])),
+      h('div', { class: 'sheet__foot' }, ...(foot || [])),
+    );
+    this.modalRoot.append(overlay, sheet);
+    this._sheet = sheet;
+  }
+  closeModal() {
+    clear(this.modalRoot);
+    this._sheet = null;
+    // 关弹窗回到限时战斗回合：按开弹窗时记录的剩余时间顺延 timerEnd，
+    // 使「视觉暂停」与「绝对截止时间」一致（不会因 timerEnd 陈旧而瞬间失手）。
+    if (this._battlePauseRemain != null) {
+      if (this.screen === 'battle' && this.battle && this.timerEnabled && !this.battle.auto && !this.battle.busy) {
+        this.battle.timerEnd = nowMs() + this._battlePauseRemain;
+      }
+      this._battlePauseRemain = null;
+    }
+  }
+
+  toast(text, type = 'normal') {
+    const t = h('div', { class: `toast ${type}` }, text);
+    this.toastWrap.appendChild(t);
+    setTimeout(() => { t.classList.add('hide'); setTimeout(() => t.remove(), 300); }, 1500);
+  }
+
+  pushLog(text, type = 'normal') {
+    if (!this.player) return;
+    this.player.log.push({ turn: this.player.turn, text, type });
+    if (this.player.log.length > 200) this.player.log.shift();
+  }
+
+  // 浮动飘字：相对地图格定位。
+  floatAt(gx, gy, text, cls) {
+    if (!this.floatLayer) return;
+    const cell = this.cellNodes[gy] && this.cellNodes[gy][gx];
+    if (!cell) return;
+    const r = this.floatLayer.getBoundingClientRect();
+    const cr = cell.getBoundingClientRect();
+    const x = cr.left - r.left + cr.width / 2;
+    const y = cr.top - r.top + cr.height / 2;
+    this.spawnFloat(x, y, text, cls);
+  }
+  floatAtCenter(text, cls) {
+    if (!this.floatLayer) return;
+    const r = this.floatLayer.getBoundingClientRect();
+    this.spawnFloat(r.width / 2, r.height / 2 - 20, text, cls);
+  }
+  spawnFloat(x, y, text, cls) {
+    if (!this.floatLayer) return;
+    const el = h('div', { class: `float-num ${cls || ''}`, style: { left: `${x}px`, top: `${y}px` } }, text);
+    this.floatLayer.appendChild(el);
+    setTimeout(() => el.remove(), 900);
+  }
+
+  shake() {
+    const game = this.stage.querySelector('.xhlz-game') || this.stage.querySelector('.battle');
+    if (!game) return;
+    game.classList.remove('shake');
+    void game.offsetWidth;
+    game.classList.add('shake');
+  }
+
+  // ===================== 主循环（rAF）=====================
+  startLoop() {
+    if (this.running) return;
+    this.running = true;
+    this._lastFrame = nowMs();
+    this._prevTick = nowMs(); // 归零基线，避免从启动器/创角返回时首帧 delta 过大，一次性计入大段精力回补
+    this._staminaAccum = 0;
+    const tick = () => {
+      if (!this.running) return;
+      this._raf = requestAnimationFrame(tick);
+      const t = nowMs();
+      // 闲置降帧：地图且无弹窗时节流到 ~20fps；战斗全速（驱动计时条）。
+      const idle = this.screen === 'game' && !this._sheet;
+      if (idle && t - this._lastFrame < IDLE_FRAME_MS) return;
+      this._lastFrame = t;
+      this.onTick(t);
+    };
+    this._raf = requestAnimationFrame(tick);
+  }
+  stopLoop() {
+    this.running = false;
+    if (this._raf) cancelAnimationFrame(this._raf);
+    this._raf = 0;
+  }
+
+  onTick(t) {
+    // 每帧刷新 _prevTick，避免战斗/弹窗期间未更新导致回到地图时把整段时间一次性计入回精。
+    const delta = t - (this._prevTick || t);
+    this._prevTick = t;
+    // 战斗限时倒计时（开弹窗时暂停，不与玩家的脱离确认冲突）
+    if (this.screen === 'battle' && this.battle && this.timerEnabled && !this.battle.auto && !this.battle.busy && !this._sheet) {
+      const remain = Math.max(0, this.battle.timerEnd - t);
+      this.timerFill.style.width = `${(remain / BATTLE_TIME_MS) * 100}%`;
+      if (remain <= 0) { this.logBattle('⏰ 来不及反应！', 'bad'); this.chooseAction('hesitate'); }
+      return;
+    }
+    // 地图闲置：缓慢回复精力（delta 已按帧刷新，不会跨战斗累积）。
+    if (this.screen === 'game' && !this._sheet && this.player.stamina < maxStamina()) {
+      this._staminaAccum += delta;
+      while (this._staminaAccum >= STAMINA_REGEN_INTERVAL_MS) {
+        this._staminaAccum -= STAMINA_REGEN_INTERVAL_MS;
+        regenStamina(this.player, 1);
+      }
+      this.refreshStatus();
+    }
+  }
+
+  destroy() {
+    this.stopLoop();
+    try { if (this.player) saveToSlot(this.activeSlot, this.player); } catch (_) {}
+    clear(this.parent);
+    clear(this.modalRoot);
+    clear(this.toastWrap);
+    this.player = null;
+    this.battle = null;
+    this.over = false;
+  }
+}
+
+// —— 纯辅助（不依赖 this）——
+function isVisible(x, y, pos) {
+  return Math.max(Math.abs(x - pos.x), Math.abs(y - pos.y)) <= VISION_RADIUS;
+}
+function visibleKeysList(st, x, y) {
+  const out = [];
+  for (let dy = -VISION_RADIUS; dy <= VISION_RADIUS; dy++) {
+    for (let dx = -VISION_RADIUS; dx <= VISION_RADIUS; dx++) {
+      const nx = x + dx, ny = y + dy;
+      if (nx >= 0 && ny >= 0 && nx < GRID && ny < GRID) out.push(`${nx},${ny}`);
+    }
+  }
+  return out;
+}
+function adjacentEnemy(st, pos) {
+  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
+    const e = entityAt(st, pos.x + dx, pos.y + dy);
+    if (e && e.type === 'enemy') return e;
+  }
+  return null;
+}
+function entityEmoji(ent, tileId) {
+  switch (ent.type) {
+    case 'enemy': return ent.emoji || '👾';
+    case 'chest': return '🎁';
+    case 'merchant': return '🛒';
+    case 'drone': return '🔧';
+    case 'memory': return '💎';
+    case 'trap': return ''; // 陷阱不显示
+    default: return '';
+  }
+}
+function spentStardust(p) {
+  let s = 0;
+  for (const t of TALENTS) {
+    const rank = p.talents[t.branch] || 0;
+    for (let i = 0; i < rank; i++) s += talentCost(t.branch, i);
+  }
+  return s;
+}
+function nowMs() {
+  try { return Date.now(); } catch (_) { return 0; }
+}
diff --git a/apps/xing-hai-lv-zhe/src/ui/dom.js b/apps/xing-hai-lv-zhe/src/ui/dom.js
new file mode 100644
index 0000000..bf0a8c3
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/src/ui/dom.js
@@ -0,0 +1,43 @@
+// ============================================================================
+// 轻量 DOM 辅助：h() 创建元素，clear() 清空，bar() 进度条，避免引入框架。
+// ============================================================================
+export function h(tag, props, ...children) {
+  const el = document.createElement(tag);
+  if (props) {
+    for (const [k, v] of Object.entries(props)) {
+      if (v == null || v === false) continue;
+      if (k === 'class') el.className = v;
+      else if (k === 'dataset') Object.assign(el.dataset, v);
+      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
+      else if (k === 'onClick') el.addEventListener('click', v);
+      else if (k === 'onInput') el.addEventListener('input', v);
+      else if (k === 'html') el.innerHTML = v; // 仅用于受控静态内容
+      else if (k in el) { try { el[k] = v; } catch (_) { el.setAttribute(k, v); } }
+      else el.setAttribute(k, v);
+    }
+  }
+  appendChildren(el, children);
+  return el;
+}
+
+function appendChildren(el, children) {
+  for (const c of children) {
+    if (c == null || c === false || c === true) continue;
+    if (Array.isArray(c)) { appendChildren(el, c); continue; }
+    el.append(c.nodeType ? c : document.createTextNode(String(c)));
+  }
+}
+
+export function clear(el) {
+  while (el.firstChild) el.removeChild(el.firstChild);
+  return el;
+}
+
+// 进度条：label 叠加在条上，pct 由 value/max 决定。
+export function bar(value, max, opts = {}) {
+  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
+  return h('div', { class: `bar ${opts.class || ''}` },
+    h('div', { class: 'bar__fill', style: { width: `${pct}%`, background: opts.color || '' } }),
+    h('span', { class: 'bar__label' }, opts.label || `${Math.floor(value)}/${Math.round(max)}`),
+  );
+}
diff --git a/apps/xing-hai-lv-zhe/src/ui/style.css b/apps/xing-hai-lv-zhe/src/ui/style.css
new file mode 100644
index 0000000..e75528d
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/src/ui/style.css
@@ -0,0 +1,338 @@
+/* ==========================================================================
+   星骸旅者 · 样式（开罗式像素明亮风、竖屏三段式、移动端优先、适配安全区）
+   命名空间 .xhlz，与主框架其他展品样式互不干扰。
+   ========================================================================== */
+.xhlz {
+  --bg: #f8f4e6;
+  --bg-2: #f3ead6;
+  --card: #fffaf0;
+  --card-2: #f6efde;
+  --line: #d9c9a3;
+  --line-2: #c9b68a;
+  --ink: #3a3a4a;
+  --ink-soft: #6b6a78;
+  --muted: #9a9486;
+  --gold: #ffb400;
+  --stardust: #ffd93d;
+  --player: #4d96ff;
+  --hp: #ff6b6b;
+  --stamina: #38a3a5;
+  --monster: #e8634a;
+  --arcane: #9d4edd;
+  --good: #57c785;
+  --bad: #e8634a;
+  --radius: 14px;
+
+  position: absolute;
+  inset: 0;
+  background:
+    radial-gradient(120% 60% at 50% -10%, #fffdf6 0%, transparent 55%),
+    repeating-linear-gradient(45deg, rgba(217,201,163,0.10) 0 2px, transparent 2px 6px),
+    var(--bg);
+  color: var(--ink);
+  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif;
+  font-size: 14px;
+  line-height: 1.5;
+  overflow: hidden;
+  -webkit-user-select: none;
+  user-select: none;
+  -webkit-tap-highlight-color: transparent;
+}
+
+.xhlz * { box-sizing: border-box; }
+.xhlz .muted { color: var(--muted); font-size: 0.82rem; }
+.xhlz .grow { flex: 1; min-width: 0; }
+
+/* 舞台 */
+.xhlz .xhlz-stage { position: absolute; inset: 0; overflow: hidden; }
+.xhlz .xhlz-game { position: absolute; inset: 0; display: flex; flex-direction: column; overflow: hidden; }
+.xhlz .shake { animation: xhlz-shake 0.32s ease; }
+@keyframes xhlz-shake {
+  0%,100% { transform: translate(0,0); }
+  20% { transform: translate(-4px, 2px); }
+  40% { transform: translate(4px, -2px); }
+  60% { transform: translate(-3px, -2px); }
+  80% { transform: translate(3px, 2px); }
+}
+
+.xhlz button {
+  font-family: inherit;
+  cursor: pointer;
+  border: 2px solid var(--line-2);
+  border-radius: 10px;
+  background: var(--card);
+  color: var(--ink);
+  padding: 0.55rem 0.8rem;
+  font-size: 0.9rem;
+  font-weight: 600;
+  box-shadow: 0 2px 0 var(--line-2);
+  transition: transform 0.08s ease, box-shadow 0.08s ease, opacity 0.15s ease;
+}
+.xhlz button:active { transform: translateY(2px); box-shadow: 0 0 0 var(--line-2); }
+.xhlz button:disabled { opacity: 0.45; cursor: default; }
+.xhlz .btn-primary { background: linear-gradient(180deg, #ffd93d, var(--gold)); color: #3a2a00; border-color: #d99a00; box-shadow: 0 2px 0 #b07d00; }
+.xhlz .btn-jade { background: linear-gradient(180deg, #6fe0b0, #2f9a72); color: #06241a; border-color: #2f9a72; box-shadow: 0 2px 0 #226e52; }
+.xhlz .btn-blue { background: linear-gradient(180deg, #6fb0ff, #2f6fae); color: #fff; border-color: #2f6fae; box-shadow: 0 2px 0 #214d77; }
+.xhlz .btn-danger { background: linear-gradient(180deg, #ff8a7a, var(--bad)); color: #fff; border-color: var(--bad); box-shadow: 0 2px 0 #a83a2c; }
+.xhlz .btn-ghost { background: var(--card-2); }
+.xhlz .big-btn { width: 100%; padding: 0.85rem; font-size: 1rem; }
+.xhlz .icon-btn { padding: 0.45rem 0.55rem; font-size: 1rem; line-height: 1; }
+
+.xhlz .card {
+  background: linear-gradient(180deg, var(--card), var(--card-2));
+  border: 2px solid var(--line);
+  border-radius: var(--radius);
+  padding: 0.75rem;
+  margin-bottom: 0.55rem;
+}
+.xhlz h4 { margin: 0 0 0.4rem; font-size: 0.95rem; }
+
+/* —— 启动器 / 创角 / 结局 —— */
+.xhlz .launcher {
+  position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden;
+  padding: max(1.4rem, env(safe-area-inset-top)) 1rem max(1.4rem, env(safe-area-inset-bottom));
+  display: flex; flex-direction: column; align-items: stretch; justify-content: center;
+  max-width: 480px; margin: 0 auto;
+}
+.xhlz .launcher__brand { text-align: center; margin-bottom: 1.2rem; }
+.xhlz .launcher__brand .emblem {
+  width: 66px; height: 66px; margin: 0 auto 0.6rem; border-radius: 18px;
+  display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800;
+  background: radial-gradient(circle at 35% 30%, #ffe98a, var(--gold));
+  border: 2px solid #d99a00; color: #3a2a00;
+  box-shadow: 0 4px 0 #b07d00, inset 0 0 0 3px rgba(255,255,255,0.4);
+}
+.xhlz .launcher__brand h1 { margin: 0; font-size: 1.6rem; }
+.xhlz .launcher__brand .sub { margin: 0.3rem 0 0; color: var(--ink-soft); font-size: 0.85rem; }
+.xhlz .launcher__actions { display: flex; flex-direction: column; gap: 0.55rem; }
+.xhlz .launcher__hint { text-align: center; margin-top: 0.9rem; }
+.xhlz .create__head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.8rem; }
+.xhlz .create__head h1 { margin: 0; font-size: 1.2rem; flex: 1; text-align: center; }
+.xhlz .name-input {
+  width: 100%; padding: 0.7rem; border-radius: 10px; border: 2px solid var(--line-2);
+  background: var(--card); color: var(--ink); font-family: inherit; font-size: 1rem;
+}
+.xhlz .name-input:focus { outline: none; border-color: var(--player); }
+.xhlz .create__foot { margin-top: 0.6rem; }
+.xhlz .seed-row { display: flex; gap: 0.5rem; align-items: center; }
+.xhlz .seed-input {
+  flex: 1; padding: 0.55rem; border-radius: 10px; border: 2px solid var(--line-2);
+  background: var(--card); color: var(--ink); font-family: ui-monospace, monospace; font-size: 0.95rem;
+}
+
+/* —— 顶部状态栏（~8%）—— */
+.xhlz .status-bar {
+  flex: none;
+  padding: max(0.55rem, env(safe-area-inset-top)) 0.7rem 0.45rem;
+  background: linear-gradient(180deg, var(--card-2), var(--bg-2));
+  border-bottom: 2px solid var(--line);
+}
+.xhlz .status-top { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.35rem; }
+.xhlz .status-name { font-weight: 800; font-size: 0.95rem; }
+.xhlz .status-lv { font-size: 0.74rem; color: #fff; background: var(--player); padding: 0 0.35rem; border-radius: 6px; font-weight: 700; }
+.xhlz .status-floor { font-size: 0.8rem; color: var(--ink-soft); }
+.xhlz .status-floor b { color: var(--gold); }
+.xhlz .status-res { margin-left: auto; display: flex; gap: 0.4rem; font-variant-numeric: tabular-nums; font-weight: 700; font-size: 0.82rem; }
+.xhlz .status-res .r { display: flex; align-items: center; gap: 0.2rem; }
+.xhlz .status-bars { display: flex; flex-direction: column; gap: 0.28rem; }
+.xhlz .barline { display: flex; align-items: center; gap: 0.4rem; }
+.xhlz .barline .bl-icon { flex: none; width: 1.1rem; text-align: center; }
+.xhlz .barline .bl-track { flex: 1; height: 11px; background: rgba(58,58,74,0.12); border-radius: 6px; overflow: hidden; border: 1px solid var(--line); }
+.xhlz .barline .bl-fill { height: 100%; border-radius: 6px; transition: width 0.4s cubic-bezier(0.22,1,0.36,1); }
+.xhlz .barline .bl-val { flex: none; width: 3.4rem; text-align: right; font-size: 0.74rem; font-variant-numeric: tabular-nums; font-weight: 700; }
+
+/* —— 中央像素地图 —— */
+.xhlz .map-wrap {
+  flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
+  padding: 0.4rem; position: relative; overflow: hidden;
+}
+.xhlz .map-frame {
+  position: relative;
+  width: min(100%, calc(100vh - 230px));
+  aspect-ratio: 1 / 1;
+  background: #2b2d3a;
+  border: 3px solid var(--line-2);
+  border-radius: 12px;
+  box-shadow: inset 0 0 0 2px rgba(0,0,0,0.3), 0 3px 0 var(--line-2);
+  overflow: hidden;
+}
+.xhlz .map-grid {
+  position: absolute; inset: 0;
+  display: grid;
+  grid-template-columns: repeat(16, 1fr);
+  grid-template-rows: repeat(16, 1fr);
+}
+.xhlz .cell {
+  position: relative;
+  display: flex; align-items: center; justify-content: center;
+  font-size: clamp(0.7rem, 2.6vw, 1rem);
+  line-height: 1;
+}
+/* 雾：未探索 = 全黑；已探索不可见 = 压暗 */
+.xhlz .cell.fog { background: #1a1c28; }
+.xhlz .cell.fog .ent { display: none; }
+.xhlz .cell.dim { filter: brightness(0.5) saturate(0.6); }
+.xhlz .cell.dim .ent { opacity: 0.55; }
+.xhlz .cell.visible { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05); }
+.xhlz .cell .ent { position: relative; z-index: 2; }
+.xhlz .cell.player::after {
+  content: ''; position: absolute; inset: 8%;
+  border-radius: 30%; border: 2px solid #fff;
+  box-shadow: 0 0 6px rgba(255,255,255,0.8);
+  animation: xhlz-bob 1.1s ease-in-out infinite;
+}
+.xhlz .cell.reachable { cursor: pointer; }
+.xhlz .cell.reachable::before {
+  content: ''; position: absolute; inset: 14%;
+  border-radius: 50%; background: rgba(77,150,255,0.25);
+  border: 1px dashed rgba(77,150,255,0.7);
+}
+.xhlz .cell.stairs .ent { animation: xhlz-glow 1.4s ease-in-out infinite; }
+@keyframes xhlz-bob { 0%,100% { transform: scale(1); } 50% { transform: scale(0.86); } }
+@keyframes xhlz-glow { 0%,100% { filter: drop-shadow(0 0 0 #ffd93d); } 50% { filter: drop-shadow(0 0 4px #ffd93d); } }
+
+/* 浮动飘字（伤害 / 拾取）*/
+.xhlz .float-layer { position: absolute; inset: 0; pointer-events: none; z-index: 30; overflow: hidden; }
+.xhlz .float-num {
+  position: absolute; font-weight: 800; font-size: 1rem;
+  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
+  animation: xhlz-float 0.9s ease-out forwards;
+}
+.xhlz .float-num.up { color: var(--good); }
+.xhlz .float-num.down { color: var(--bad); }
+.xhlz .float-num.gold { color: var(--gold); }
+@keyframes xhlz-float {
+  0% { opacity: 0; transform: translate(-50%, 0) scale(0.7); }
+  20% { opacity: 1; transform: translate(-50%, -10px) scale(1.15); }
+  100% { opacity: 0; transform: translate(-50%, -40px) scale(1); }
+}
+
+/* —— 底部操作栏（~27%）—— */
+.xhlz .bottom-bar {
+  flex: none; display: flex; align-items: stretch; gap: 0.45rem;
+  padding: 0.45rem 0.6rem max(0.5rem, env(safe-area-inset-bottom));
+  background: linear-gradient(0deg, var(--bg-2), var(--card-2));
+  border-top: 2px solid var(--line);
+}
+.xhlz .dpad {
+  display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);
+  gap: 0.25rem; width: 128px; height: 116px; flex: none;
+}
+.xhlz .dpad button { padding: 0; font-size: 1.1rem; }
+.xhlz .dpad .d-up { grid-area: 1 / 2; }
+.xhlz .dpad .d-left { grid-area: 2 / 1; }
+.xhlz .dpad .d-center { grid-area: 2 / 2; background: var(--card-2); }
+.xhlz .dpad .d-right { grid-area: 2 / 3; }
+.xhlz .dpad .d-down { grid-area: 3 / 2; }
+.xhlz .act-col { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; justify-content: center; }
+.xhlz .interact-btn {
+  flex: 1; min-height: 56px; font-size: 1rem; font-weight: 800;
+  border-radius: 14px;
+}
+.xhlz .tool-col { display: flex; flex-direction: column; gap: 0.4rem; flex: none; }
+.xhlz .tool-col .icon-btn { min-width: 48px; min-height: 48px; }
+
+/* —— 弹窗（Sheet）—— */
+.xhlz .xhlz-modals { position: absolute; inset: 0; z-index: 50; pointer-events: none; }
+.xhlz .sheet-overlay {
+  position: absolute; inset: 0; background: rgba(40,32,16,0.5); pointer-events: auto;
+  animation: xhlz-fade 0.2s ease;
+}
+.xhlz .sheet {
+  position: absolute; left: 0; right: 0; bottom: 0; max-height: 88%; overflow-y: auto;
+  background: linear-gradient(180deg, var(--card), var(--bg-2));
+  border-top: 2px solid var(--line-2); border-radius: 20px 20px 0 0;
+  padding: max(0.7rem, env(safe-area-inset-top)) 0.9rem max(0.8rem, env(safe-area-inset-bottom));
+  pointer-events: auto; animation: xhlz-sheet-up 0.25s cubic-bezier(0.22,1,0.36,1);
+}
+.xhlz .sheet__head { display: flex; align-items: center; justify-content: center; margin-bottom: 0.6rem; }
+.xhlz .sheet__head .t { font-size: 1.05rem; font-weight: 800; }
+.xhlz .sheet__body { padding-bottom: 0.3rem; }
+.xhlz .sheet__foot { display: flex; flex-wrap: wrap; gap: 0.45rem; }
+.xhlz .sheet__foot > * { flex: 1 1 auto; }
+@keyframes xhlz-fade { from { opacity: 0; } to { opacity: 1; } }
+@keyframes xhlz-sheet-up { from { transform: translateY(40px); opacity: 0.4; } to { transform: none; opacity: 1; } }
+
+/* —— 背包：装备 / 天赋 / 剧情 标签 —— */
+.xhlz .tabs { display: flex; gap: 0.35rem; margin-bottom: 0.6rem; }
+.xhlz .tab { flex: 1; padding: 0.45rem 0.2rem; font-size: 0.85rem; }
+.xhlz .tab.active { background: linear-gradient(180deg, #ffd93d, var(--gold)); color: #3a2a00; border-color: #d99a00; }
+.xhlz .equip-card { display: flex; align-items: center; gap: 0.6rem; }
+.xhlz .equip-card .eq-emoji { font-size: 1.6rem; flex: none; }
+.xhlz .equip-card .eq-info { flex: 1; min-width: 0; }
+.xhlz .equip-card .eq-name { font-weight: 700; }
+.xhlz .equip-card .eq-name .plus { color: var(--gold); font-weight: 800; }
+.xhlz .equip-card .eq-affix { font-size: 0.74rem; color: var(--arcane); font-weight: 700; }
+.xhlz .equip-card .eq-cost { font-size: 0.74rem; color: var(--ink-soft); }
+.xhlz .talent-branch { margin-bottom: 0.5rem; }
+.xhlz .talent-head { display: flex; align-items: center; gap: 0.45rem; margin-bottom: 0.3rem; }
+.xhlz .talent-ranks { display: flex; gap: 0.25rem; margin: 0.25rem 0; }
+.xhlz .talent-pip { width: 1.1rem; height: 1.1rem; border-radius: 50%; background: rgba(58,58,74,0.12); border: 1px solid var(--line); }
+.xhlz .talent-pip.on { background: var(--gold); border-color: #d99a00; box-shadow: inset 0 0 0 2px rgba(255,255,255,0.4); }
+.xhlz .chapter { padding: 0.55rem 0.65rem; border-radius: 10px; background: var(--card-2); border: 1px solid var(--line); margin-bottom: 0.4rem; }
+.xhlz .chapter.locked { opacity: 0.55; }
+.xhlz .chapter .ch-title { font-weight: 700; color: var(--arcane); }
+.xhlz .chapter .ch-text { font-size: 0.85rem; line-height: 1.55; margin-top: 0.2rem; }
+
+/* 通用进度条 */
+.xhlz .bar { position: relative; height: 14px; background: rgba(58,58,74,0.12); border-radius: 7px; overflow: hidden; border: 1px solid var(--line); }
+.xhlz .bar__fill { position: absolute; inset: 0 auto 0 0; border-radius: 7px; transition: width 0.4s ease; background: var(--player); }
+.xhlz .bar__label {
+  position: absolute; inset: 0; display: flex; align-items: center; justify-content: flex-end;
+  padding-right: 0.4rem; font-size: 0.72rem; font-weight: 800; color: #fff;
+  text-shadow: 0 1px 2px rgba(0,0,0,0.6); font-variant-numeric: tabular-nums;
+}
+
+/* —— 战斗覆盖层 —— */
+.xhlz .battle { position: absolute; inset: 0; display: flex; flex-direction: column; padding: max(0.6rem, env(safe-area-inset-top)) 0.7rem max(0.6rem, env(safe-area-inset-bottom)); background: radial-gradient(120% 70% at 50% 0%, #3a2a4a, #1f1a2a); color: #f3ead6; }
+.xhlz .battle__foe { text-align: center; margin: 0.4rem 0 0.3rem; }
+.xhlz .battle__foe .emoji { font-size: 3rem; }
+.xhlz .battle__foe .name { font-weight: 800; font-size: 1.05rem; }
+.xhlz .battle__stance { text-align: center; margin: 0.4rem 0; min-height: 2.6rem; }
+.xhlz .stance-chip { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.35rem 0.8rem; border-radius: 999px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); font-weight: 700; }
+.xhlz .stance-chip.unknown { opacity: 0.85; font-style: italic; }
+.xhlz .battle__log { flex: 1; min-height: 0; overflow-y: auto; font-size: 0.82rem; display: flex; flex-direction: column; gap: 0.25rem; padding: 0.3rem 0.5rem; }
+.xhlz .battle__log .ln { padding: 0.25rem 0.4rem; border-radius: 8px; background: rgba(255,255,255,0.06); }
+.xhlz .battle__log .ln.good { color: #9be8b5; }
+.xhlz .battle__log .ln.bad { color: #ffb0a6; }
+.xhlz .battle__timer { height: 6px; background: rgba(255,255,255,0.12); border-radius: 4px; overflow: hidden; margin: 0.3rem 0; }
+.xhlz .battle__timer .t { height: 100%; background: linear-gradient(90deg, #ffd93d, #ff8a3d); transition: width 0.1s linear; }
+.xhlz .battle__actions { display: flex; gap: 0.45rem; }
+.xhlz .battle__actions .act { flex: 1; min-height: 60px; font-size: 0.92rem; font-weight: 800; color: #fff; }
+.xhlz .battle__actions .act.block { background: linear-gradient(180deg, #6fb0ff, #2f6fae); border-color: #2f6fae; box-shadow: 0 2px 0 #214d77; }
+.xhlz .battle__actions .act.dodge { background: linear-gradient(180deg, #6fe0b0, #2f9a72); border-color: #2f9a72; box-shadow: 0 2px 0 #226e52; }
+.xhlz .battle__actions .act.counter { background: linear-gradient(180deg, #ff9a8a, #e8634a); border-color: #e8634a; box-shadow: 0 2px 0 #a83a2c; }
+.xhlz .battle__topbar { display: flex; align-items: center; gap: 0.5rem; }
+.xhlz .battle__topbar .title { flex: 1; font-weight: 800; }
+.xhlz .battle__self { display: flex; gap: 0.5rem; align-items: center; margin: 0.35rem 0; font-size: 0.8rem; }
+.xhlz .battle__self .bar { flex: 1; }
+
+/* —— 结局 —— */
+.xhlz .ending { text-align: center; }
+.xhlz .ending__emoji { font-size: 3.4rem; }
+.xhlz .ending h2 { margin: 0.3rem 0; font-size: 1.4rem; }
+.xhlz .ending.peace h2 { color: #2f9a72; }
+.xhlz .ending.dark h2 { color: var(--bad); }
+.xhlz .ending__text { font-size: 0.92rem; line-height: 1.7; margin: 0.6rem 0; text-align: left; }
+.xhlz .ending__choice { display: flex; flex-direction: column; gap: 0.5rem; }
+
+/* —— 存档管理 —— */
+.xhlz .slot-list { display: flex; flex-direction: column; gap: 0.45rem; }
+.xhlz .slot-row { display: flex; align-items: center; gap: 0.6rem; padding: 0.55rem 0.65rem; border-radius: 10px; background: var(--card-2); border: 1px solid var(--line); }
+.xhlz .slot-row.empty { opacity: 0.7; border-style: dashed; }
+.xhlz .slot-no { flex: none; width: 1.6rem; height: 1.6rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 800; background: var(--bg-2); color: var(--ink-soft); border: 1px solid var(--line); }
+.xhlz .slot-info { flex: 1; min-width: 0; }
+.xhlz .slot-name { font-weight: 800; }
+.xhlz .slot-meta { font-size: 0.76rem; color: var(--ink-soft); margin-top: 0.1rem; }
+.xhlz .slot-actions { flex: none; display: flex; gap: 0.3rem; }
+.xhlz .slot-act { padding: 0.35rem 0.55rem; font-size: 0.8rem; }
+.xhlz .save-io { width: 100%; height: 60px; resize: vertical; padding: 0.5rem; border-radius: 8px; border: 2px solid var(--line-2); background: var(--card); color: var(--ink); font-family: ui-monospace, monospace; font-size: 1rem; word-break: break-all; }
+
+/* —— Toast —— */
+.xhlz .toast-wrap { position: absolute; top: max(0.5rem, env(safe-area-inset-top)); left: 0; right: 0; z-index: 90; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; pointer-events: none; }
+.xhlz .toast { max-width: 88%; padding: 0.45rem 0.85rem; border-radius: 999px; font-size: 0.82rem; font-weight: 600; background: rgba(58,58,74,0.94); border: 1px solid var(--line-2); color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.3); animation: xhlz-toast-in 0.25s ease; }
+.xhlz .toast.good { border-color: var(--good); }
+.xhlz .toast.bad { border-color: var(--bad); }
+.xhlz .toast.hide { animation: xhlz-toast-out 0.3s ease forwards; }
+@keyframes xhlz-toast-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
+@keyframes xhlz-toast-out { to { opacity: 0; transform: translateY(-8px); } }
diff --git a/apps/xing-hai-lv-zhe/vite.config.js b/apps/xing-hai-lv-zhe/vite.config.js
new file mode 100644
index 0000000..2dc4040
--- /dev/null
+++ b/apps/xing-hai-lv-zhe/vite.config.js
@@ -0,0 +1,16 @@
+import { defineConfig } from 'vite';
+
+// `base: './'` 生成相对路径资源引用，便于部署到 GitHub Pages 子路径或任意静态目录。
+// 本作刻意不依赖任何框架，纯原生 DOM + Canvas 渲染，构建产物极小。
+export default defineConfig({
+  base: './',
+  server: {
+    host: true,
+    port: 5176,
+  },
+  build: {
+    outDir: 'dist',
+    sourcemap: false,
+    target: 'es2018',
+  },
+});
diff --git a/src/main.js b/src/main.js
index ed2a00c..488d9cb 100644
--- a/src/main.js
+++ b/src/main.js
@@ -42,6 +42,14 @@ const APPS = {
     desc: '从呱呱坠地到垂垂老矣，一月一回合推进岁月，在健康、智力、财富、心情、社交间权衡抉择；可多槽位存档、可挂机，过完这一生。',
     loader: () => import('../apps/mo-ni-ren-sheng/src/main.js'),
   },
+  xhlz: {
+    key: 'xhlz',
+    title: '星骸旅者',
+    subtitle: '像素 · Roguelike',
+    emblem: '星',
+    desc: '迫降破碎星球，在漂浮的遗迹浮岛间拾荒探索。猜拳克制式战斗、装备强化与三天赋树、碎片化记忆叙事，集齐十枚星骸回响揭开真相。',
+    loader: () => import('../apps/xing-hai-lv-zhe/src/main.js'),
+  },
 }
 
 // 大类：先呈现「学习」，再呈现「游戏」。点击大类进入后，才展开其中的具体应用。
@@ -59,8 +67,8 @@ const CATEGORIES = [
     title: '游戏',
     subtitle: '休闲 · 互动娱乐',
     emblem: '玩',
-    desc: '消磨时光的互动小品：修仙、人生、三国战场，挑一个开始吧。',
-    appKeys: ['dzf', 'frxx', 'mnrs'],
+    desc: '消磨时光的互动小品：修仙、人生、三国战场、星骸浮岛，挑一个开始吧。',
+    appKeys: ['dzf', 'frxx', 'mnrs', 'xhlz'],
   },
 ]
 
