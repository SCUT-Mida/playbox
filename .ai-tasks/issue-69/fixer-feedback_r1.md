整体工程质量较高（模块化清晰、纯函数可测、存档迁移健壮、123+49 项自测全过、楼梯连通性 1800 次穷举 0 软锁、未触碰 .github/ 工作流——无需人类改 CI/CD）。但存在一个会影响「自动战斗」这一主打卖点的真实 Bug，需修复后再合入。

【阻断级 Bug · 自动战斗关闭瞬间必定失手】src/ui/app.js
复现：进入战斗 → 开启 🤖 自动战斗 → 自动打数秒（>3s，如 4 个回合约 3.4s）→ 关闭 🤖。结果：玩家立刻被判定「⏰ 来不及反应！」并强制失手受击。
根因（三段联立）：
1) nextRound() 中 `if (this.timerEnabled && !this.battle.auto)` 才会刷新 timerEnd；auto=true 期间 timerEnd 不再更新，停留在「最后一次手动回合」的旧值（若从一开始就开自动，timerEnd 恒为初始 0）。
2) toggleAuto() 关闭自动时，既没有重置 timerEnd，也没有给玩家一个全新限时窗口。
3) onTick() 的倒计时分支条件为 `screen==='battle' && timerEnabled && !auto && !busy && !_sheet`，关闭自动后立即命中，`remain=max(0, timerEnd-now)` 因 timerEnd 过期等于 0 → 立刻 chooseAction('hesitate') 强制失手。
我用最小逻辑复现确认：auto 期间经过 4000ms 后关闭，remain==0 ⇒ instant fumble=true。这是把「关自动」误罚玩家的逻辑漏洞，且 320ms 的窗口极易触发。建议在 toggleAuto() 关闭自动、以及 nextRound() 中 auto 由 true 转 false 的当回合，执行 `this.battle.timerEnd = nowMs() + BATTLE_TIME_MS`（与手动回合一致），给玩家完整 3 秒。

【次要问题（建议一并处理，非阻断）】
- src/core/world.js takeCell() / src/core/rng.js pick()/randInt()：均假设 rng()∈[0,1)。`arr[Math.floor(r()*len)]` 在 r()≥1 时会取到 undefined（我在注入 r()=2 时实测触发 `Cannot read properties of undefined (reading 'x')` 崩溃）。生产环境 this.rng=Math.random 不会触发，但 makeRng 的数组模式可返回任意值；建议 `const f = Math.min(0.999999, Math.max(0, r()))` 之类做一次钳制，提升种子/测试鲁棒性。
- src/ui/app.js startLoop() 未重置 this._prevTick：从启动器/创角返回游戏时，首帧 delta 可能很大，触发一次性精力回补尖峰（受 maxStamina 钳制不致崩溃，但应在 startLoop 里 `this._prevTick = nowMs()` 归零）。
- 死亡存档可被「继续旅程」加载：gameOver 落盘 hp=0 且无 ending，listSaves 仍视为可继续；加载后 enterGame→isDead→立即再次 gameOver。建议 listSaves/load 路径对 hp<=0 的存档标记或走 restart 流程，避免「继续」瞬间又死亡的不良体验。
- 战斗结算窗口（winBattle/loseBattle/nextRound 的 360–520ms setTimeout 期间）顶部「🏃」撤退按钮未随 busy 禁用，理论上可与胜负结算交错；建议 busy 期间一并禁用撤退按钮。

修复第 1 项后即可合入；其余 4 项建议顺带打磨。
