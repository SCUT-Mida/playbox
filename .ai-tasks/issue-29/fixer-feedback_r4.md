/claude-fix 🛠️ **请立即根据以下审查意见修改代码：** \n\n> 以下是第 4 轮审查未通过的意见：\n\n 第 4 轮。r3 的阻断项（`SlotScene._confirmDelete` 的 mkBtn 孤儿容器 → 现已返回 `{cont, zone}` 并在 `_closeConfirm` 一并销毁）与各项建议（`main.js` 预取改 `.catch`、`ArenaScene` 加 `MAX_ROUNDS=30`、`deleteSlot` 删活跃槽不再回写默认档、`portrait.js` 用 `portraitSeq` 给渐变/clipPath id 加唯一后缀）均已正确落地，数据一致性也复验无误（`enemies.js` 中 boss_lvbu/yuanshu/machao/sunquan/simayi/yuanshao/caofleet 等全部存在；levels.js 引用的 18 种 enemy 键全部有定义；LEVEL_LIST(20) 与 LEVEL_REWARD(20) 一一对应；`h()` 确实支持 `html`→innerHTML，portraitSVG 注入成立）。但存在 1 个本轮新引入、可稳定复现的交互缺陷，必须修复：

【必改 · 阻断】apps/ding-zu-san-fen/src/scenes/MenuScene.js `_buildLevelList` / `_levelCard`（约 226–360 行）：
关卡列表用 `cont.setMask(createGeometryMask())` 做几何遮罩，但 **Phaser 的 GeometryMask 只裁剪渲染、不裁剪命中检测**——`this.input` 的 hitTest 完全不查阅 mask。而你把每张卡片的交互 `zone`（`parent.add(zone)`）作为 depth=5 容器的子节点放进 `cont`，滚动时 `cont.y = -scrollY` 带着这些 zone 一起上移；当玩家向下滚动查看后面的关卡时，**顶部被裁剪掉（视觉上不可见）的卡片，其命中区仍停留在原世界坐标并向上叠到导航区**。更糟的是命中区的深度排序：功能入口/续战卡的 zone 都是裸 `this.add.zone(...)`（默认 depth=0），而卡片 zone 处于 depth=5 容器内、排序在它们之上。于是向下滚动约 140–180px 后，被裁剪的卡片命中区会盖住「武将图鉴/点将台/演武场/切换存档」（cy≈232）与「继续上次出征」（cy≈312）所在区域，导致两种坏行为：① 点这些导航按钮落空（按钮看似没反应）；② 在该区域抬手时反而命中了那张不可见的卡片 → `pointerup` 里 `_dragged` 为假就直接 `scene.start('GameScene', {levelKey: lv.key})`，**进入了玩家根本看不见的关卡**。这直接破坏了本轮新增的「演武场/切换存档」入口可用性与关卡选择可用性。
修复建议（二选一或叠加）：
  · 在滚动回调（pointermove / wheel）里按卡片当前中心 y 是否落在 `[listTop, listBottom]` 可视带内，动态 `zone.input.enabled = true/false`——需在 `_levelCard` 里把每张卡的 `{zone, baseCy: cy}` 收集到一个数组（如 `this._cardZones`），滚动时遍历切换。这是根因修复。
  · 兜底：把导航/续战/状态栏的命中区 `setDepth` 提到 >5（如 10），保证它们永远排在列表之上不被遮挡；但这只解决「按钮点不到」，不解决「在空白处误入不可见关卡」，故仍建议以输入禁用为主。
（顺带：`_navButton`/`_continueCard` 现在是 `cont.setDepth(6)` 而 zone 未设深度，二者深度不一致本就是隐患，建议统一。）

【建议 · 非阻断】
1. ArenaScene `loadArena`：当 `p.date !== dayKey()` 时返回全新 `{date, drills:0, bestRound:0}` 但不落盘，随后 `_endDrill` 的 `saveArena(arena)` 会用当日数据覆盖存储——这意味着「历史最佳第 X 轮」其实只保留当天，跨日即清零，与 `_renderReady`/`_endDrill` 里「历史最佳」的文案不符。建议把 bestRoll 拆成「今日」与「历史最佳」两个字段，或修正文案为「今日最佳」。
2. ArenaScene `_renderReady`/`_endDrill`：`left<=0` 时按钮仍 `setInteractive({useHandCursor:true})` 且仅在 onClick 里 `audio.play('error'); return`，外观灰但鼠标仍变手型、仍可点击发声，体验上像「坏了的按钮」。建议 `zone.disableInteractive()` 或去掉 handCursor。
3. meta.js `deleteSlot(n)` 删活跃槽时设 `cache = defaults(); cacheSlot = n` 但不写盘——当前 SlotScene 流程（删后只调只读的 `_renderSlots`→`listMetaSlots`，不会触发 `saveMeta`）下是安全的；但这属于「内存里持有一份会随时被 `saveMeta` 复活成默认档」的脆弱状态。建议加注释守护，或干脆 `cache=null; cacheSlot=null` 让下次 `loadMeta` 自然重建（反正该槽已空）。

未涉及任何 `.github/workflows` 等 CI/CD 配置，无需人类手动处理。修复上述第 1 项阻断问题后可进入下一轮。
