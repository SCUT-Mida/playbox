DECISION: REQUEST_CHANGES
COMMENT: 第 1 轮审查，发现一个阻断级 Bug，外加若干逻辑/健壮性问题。

【阻断级 · 必须修复】
1. 漏怪路径必定崩溃，且失败结算完全失效
- src/entities/Enemy.js:206 调用 `scene.onLeak(this)`，但 GameScene 从未定义 `onLeak` 方法（只有 `_handleLeak`/`_handleKill`，已全仓 grep 确认）。一旦任意敌人 progress >= map.length（即"漏怪抵达基地"——塔防的常态事件），每帧都会抛 `TypeError: scene.onLeak is not a function`，异常从 `for (const e of this.enemies) e.update(...)` 冒出，打断 GameScene.update；同一只敌人下一帧继续抛，主循环实质卡死。等于游戏一旦漏怪就不可玩。
- 更糟：`e.leaked` 在全仓没有任何地方被赋为 true（已 grep 确认），所以 GameScene.update 结算分支 `if (e.leaked) this._handleLeak(e)`（GameScene.js:192-194）永远走不到，漏怪扣血/失败判定整体失效——即便不崩溃，玩家也永远输不掉、`leakLives`（BOSS 漏 5/8 命）也形同虚设。
- 修复方向：把 `scene.onLeak(this); return;` 改为 `this.leaked = true; this.alive = false; return;`，让现有结算分支自然走到 `_handleLeak`（扣血逻辑已经写好）；或在 GameScene 上补一个 `onLeak(e)` 方法。二选一，且必须保证 alive 置 false 以便被 remaining 过滤回收。
- 另：scripts/logic-test.mjs 不覆盖 Enemy.update / 漏怪链路，`npm test` 56 通过 0 失败，所以 CI 拦不住。建议补一条"漏怪→扣血→lives<=0 触发 lose"的纯逻辑测试（可把漏怪结算从 GameScene 抽成可单测的纯函数）。

【逻辑缺陷 · 建议修复】
2. 护甲克制循环不成立：computeDamage 的 PHYSICAL 分支无 MAGIC 护甲处理
- src/config.js computeDamage：MAGIC 分支处理了 HEAVY(1.5x)/MAGIC(0.4x)；但 PHYSICAL 分支只处理了 HEAVY(0.4x)/PHYSICAL(0.5x)，遇到 MAGIC 护甲直接落到末尾 `return base`(1.0)。而 enemies.js 注释、README 均 define MAGIC 护甲为"魔抗·惧物"——魔抗（减法伤）已实现，但"惧物"（应受额外物理伤害）未实现。后果：妖术军师(MAGIC 护甲)被关羽/张飞等物理将打只受普通伤害，"重甲惧法、魔抗惧物"的克制设计落空，玩家无动力用物理将针对法师怪。建议 PHYSICAL vs MAGIC 返回 `base * 1.5`（或按平衡取 >1.0）。测试矩阵里恰好缺 phys/magic 这一项，所以也没被拦——请同步补 `computeDamage(100,'PHYSICAL','MAGIC')` 用例。

【健壮性 · 建议修复】
3. src/entities/Enemy.js takeDamage 受击闪白 `delayedCall(60, () => this.body && this.body.setAlpha(1))`：destroy() 调 container.destroy() 但未置空 this.body，60ms 内被击杀销毁的敌人会拿到已销毁的 GameObject 调 setAlpha；`this.body &&` 只判真值挡不住。建议改判 `this.body && this.body.active` 或 destroy 时置空。

4. BondManager._areAdjacent 现语义是"每个成员至少与另一成员相邻"，对当前 2 成员羁绊没问题；但若将来出现 ≥3 成员的相邻型羁绊，会弱于"全员互相相邻"而可能误激活。非阻塞，留个心。

【CI/CD · 请人工处理】
本 PR 遵守了红线，未改动 `.github/`。但 Issue 第一阶段第 5 项要求的 `.github/workflows/deploy.yml`（推送自动部署 GitHub Pages）按约定未由 AI 创建，README 也已注明。请维护者手动补一个 Actions 工作流（npm ci → vite build → 上传 dist/ → Pages 部署）；vite.config.js 已用 `base:'./'`，部署到 Pages 子路径没问题。

其他方面（Scale.FIT 自适应、clampDt 防 dt 爆炸、羁绊重算与血量比例保留、波次时间轴与 alive 结算、投射物追踪命中）实现合理，结构清晰。修掉 #1（必要时连带 #2）后可进入第 2 轮。
