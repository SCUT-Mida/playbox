验证确认了该严重 Bug。以下是我的审查结果：

DECISION: REQUEST_CHANGES
COMMENT: 发现一个会导致游戏核心失败逻辑彻底崩溃的致命 Bug，以及若干次要问题。请先修复致命问题再提交。

【致命 Bug — 漏怪/失败判定完全失效】
1. `src/entities/Enemy.js:206`：敌人抵达基地时调用 `scene.onLeak(this)`，但 `GameScene` 根本没有 `onLeak` 方法（GameScene 只有 `_handleLeak`，见 `GameScene.js:271`）。任何敌人走到路径终点都会抛出 `TypeError: scene.onLeak is not a function`，异常会从 `Enemy.update` 冒泡到 `GameScene.update`，打断整个主循环。更糟的是，由于 `progress` 已被累加到 `>= map.length`，该敌人每帧都会再次触发同一个 `onLeak`，无限抛错。
2. `GameScene.js:192` 的结算分支 `if (e.leaked)` 中 `leaked` 标志在整个代码库中只被读取、从未被赋值（`grep` 确认只有 Enemy.js 的 `onLeak` 调用点和 GameScene.js 的读取点，没有任何写入点）。也就是说，即便 `onLeak` 存在，漏怪也永远不会进入 `_handleLeak`，玩家**永远不可能因漏怪掉血/失败**——失败结算路径是死代码。
   修复方向：在 Enemy.js 抵达基地处，将 `scene.onLeak(this); return;` 改为
     `this.leaked = true; this.alive = false; return;`
   让 GameScene 的现有结算循环去调用 `_handleLeak`（该方法已正确扣血 `leakLives`）。注意 `_assignBlocks` 里已有 `e.progress >= map.length` 的跳过保护，配合修改后即可正常工作。

   补充说明：`scripts/logic-test.mjs` 全绿（56/56）但**没有覆盖**此路径——它用空 `spawnFn` 模拟波次，从不实例化真实 Enemy、从不调用 `Enemy.update`，所以这个崩溃无法被现有测试发现。建议补充一个直接构造 Enemy 并推进到终点的逻辑测试，断言 `leaked===true && alive===false`。

【逻辑 / 健壮性问题（次要）】
3. `Enemy.js:210` 与 `General.js:2327`：受击后用 `scene.time.delayedCall(60, () => this.body && this.body.setAlpha(1))` 复位透明度。被摧毁的 Phaser 对象仍为 truthy，`&&` 守卫无效，回调可能对已 destroy 的对象调用 `setAlpha` 而报错。建议改为在 `destroy()` 时把引用置 `null`，回调里判空；或用 `this.body.scene` 存活检查。
4. `Fx.js:fireAssault`/`_firePillar` 用 `s.time.delayedCall` / `addEvent` 排程后续帧的图形绘制。若大招释放后场景在 1 秒内被 `pause`/`shutdown`（如 ult 清场触发 `_checkEnd` 胜利），回调会在非活跃场景上 `add.graphics()`，可能抛错。建议排程前判断 `s.scene.isActive()` 或在 `_cleanup` 中清理这些计时器。
5. `MapManager.pointAt`：`progress<=0` 分支取 `this.segments[0]`、`progress>=length` 取 `segments[segments.length-1]`，但未对 `segments` 为空做防御。当前 `length=Math.max(1, acc)` 且关卡至少有两个航点，暂不触发；属隐患，建议显式断言 `segments.length>=1`。

【设计一致性（非阻塞，建议复核）】
6. `bonds.js`：`taoyuan`(桃园之义) 的 `test` 只判断 `byId` 三人是否在场，**不要求相邻**；而 `wolong`/`qunxiong` 都要求相邻。设计文档（context.md 2.2）统一表述为"邻近格激活"，这里口径不一致，容易让玩家困惑。若有意为之，建议在 desc 注明"全场生效"。
7. `levels.js`：两个关卡的 `roadSlots` 是手填近战部署位，部分路面格（如转角内侧）可能没有放槽，玩家会觉得"明明在路上却不能放"。建议由 MapManager 自动从 `pathCells` 派生路面槽，减少手工遗漏。`levels.js:1878` 虎牢关末波 boss_dongzhuo 与多波高压同屏，hp 11000，需确认数值可通关（可借助上面的逻辑测试加一条平衡性断言）。

【性能（可接受，记录备案）】
8. `General.update` 每帧对每个武将调用两次 `acquireTarget`（技能+普攻），每次 O(enemies)；叠加 `_assignBlocks` 的 O(enemies×melee)。当前规模（~20 敌、~10 将）无压力，但同屏单位上升后建议用空间分桶或缓存目标。

【CI/CD 提示（请人类手动处理）】
9. 本次 PR 严格遵守红线，未触碰 `.github/` 下任何 workflow，正确。但相应地，目前没有任何 CI 步骤运行 `npm test`，所以上述逻辑回归无法在自动化中被拦截。**建议由人类维护者在 `.github/workflows/` 中新增一个在 PR 上执行 `npm ci && npm test` 的步骤**（并可选地用 `npm run build` 做冒烟构建）——这部分请人类手动添加，AI 不应自行创建 `.github/` 工作流文件。

综上，#1/#2 是阻断性问题（漏怪即崩溃、且失败判定永久失效），必须在合并前修复；其余为建议性改进。
