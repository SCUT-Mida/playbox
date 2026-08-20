DECISION: REQUEST_CHANGES
COMMENT: 
【验证情况】node scripts/logic-test.mjs 165/165 通过；安装 jsdom 后 node scripts/smoke-dom.mjs 54/54 通过；另写脚本对 6 图×5 种子做全自动 AI 整局模拟，全部在 R36~R167 自然终局，无死循环、无滞留阶段、无崩溃——「无回合上限+繁荣系数」的收敛性设计成立。全仓 grep 确认无残留对已删除导出（perimeterOf/TILE_COUNT/rounds/maxRound）的引用，旧存档按棋盘长度拒收（6 图尺寸全变且无碰撞），随机确定性保持。整体实现质量高，但有一个必须修的阻断项：

【阻断】商店弹窗点遮罩会软锁游戏（apps/da-fu-weng/src/ui/app.js:711 showShopSheet + app.js:910 showSheet）。showSheet 的 mask 对非 blocker 弹窗执行 closeSheet()，但 showShopSheet 的 Promise 只在「离开商店」按钮里 resolve。玩家在手机上点弹窗外遮罩（极自然的关闭手势）后：棋盘恢复显示，但 playTurn 永远挂在 await this.showShopSheet()，this.busy 永久为 true → 掷骰按钮禁用（canRoll 要求 !busy）、菜单里保存/读取禁用（disabled: this.busy）、maybeScheduleAI 直接返回，对局死锁，唯一出路是「退出对局」并丢失自上次回合末自动存档以来的全部进度。更糟的是此时菜单里「导出」按钮仍可用，会把 phase='shop' 的中间态导出成存档码；该码能通过 importSave 校验（只校验数组与棋盘长度），导入后开局即软锁（phase!=='roll' 且无人驱动 resolveLoop），形成「毒存档」。修法一行：showShopSheet 调 showSheet 时传 { blocker: true }（与终局结算一致），或在 mask 点击回调里同时 finish()。建议顺手排查 askDecision/showCardSheet（人类分支）的同款隐患——它们是本次改动前就存在的旧模式，但商店是新增弹窗，把这条新路径堵上是本 PR 的责任。

【非阻断，供参考】
1. buyItem('equal') 在 applyEqualize 找不到存活对手时仍扣 260 并计入限购（game.js:257-260）。当前逻辑下不可达（仅剩一家时对局已 finished，buyItem 入口会拦），但属于付费无效果的隐患路径，建议 applyEqualize 返回 false 时回滚或拒绝购买。
2. 均富卡允许「自己已是首富」时购买，效果是自掏腰包拉平对手（applyEqualize 不校验方向）。人类玩家自担后果尚可接受，AI 侧已有 gap>=600 保护，仅提示。
3. importSave/reviveState 不校验 players[].items/perk 结构，手工构造的存档码会让 refresh() 在 p.items.swift 处 TypeError。沿用既有弱校验，风险低，可加一行结构兜底。
4. 格子详情与购买弹窗展示的租金表均为基础租金，未乘繁荣系数（落租 toast 有乘），信息略不一致。
5. CI/CD 方面无需改动；jsdom 已在 apps/da-fu-weng/package.json devDependencies 中声明，本次沙箱安装后冒烟通过。

修掉阻断项后即可通过；其余条目按需处理。
