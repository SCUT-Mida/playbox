/claude-fix 🛠️ **请立即根据以下审查意见修改代码：** \n\n> 以下是第 1 轮审查未通过的意见：\n\n 整体实现完整、结构清晰（纯逻辑与 UI 分层、可注入 rng、125 条单测全过、所有源文件语法无误、未触碰 `.github/`，且已确认无任何 CI/引用依赖旧全局名 `__PLAYBOX_DZF__`，重命名为 `__PLAYBOX_GAME__` 安全，无需改 CI/CD）。落地页多展品懒加载改造也正确。但作为首轮严格审查，发现若干**真实缺陷**，建议修复后再合入：

【1｜功能性 Bug·切后台自动存档永不生效（必修）】
`src/ui/app.js` 中：
```js
GameUI.prototype._onVis = function () {
  if (document.visibilityState === 'hidden') { try { saveGame(this.player); } catch (_) {} }
};
document.addEventListener('visibilitychange', this._onVis);
```
通过 `addEventListener` 注册的普通函数，回调执行时 `this` 是**事件目标 document**，而非 GameUI 实例。因此 `this.player` 为 `undefined`，`saveGame(undefined)` 内部 `player.lastSeen = nowSec()` 抛 TypeError，被 try/catch 静默吞掉。**该“切后台/隐藏时存档”功能从未真正生效**（已用最小复现确认抛错）。手机端用户后台挂起 <10s（10 秒定时器尚未触发）时进度可能丢失。修法：在构造器里绑定 `this._onVis = this._onVis.bind(this)`（或改箭头函数并作为实例字段），并确保 `removeEventListener` 用同一引用。

【2｜确定性 Bug·可注入 rng 在返回 0 时失效（必修）】
`src/config.js` 的 `computeDamage`：
```js
const variance = 0.8 + ((rng && rng()) || Math.random()) * 0.4;
```
当注入的 `rng()` 合法返回 `0`（[0,1) 区间内的有效值）时，因 `0` 为 falsy，`|| Math.random()` 兜底，**破坏种子化/可注入 rng 的确定性**（已复现：`() => 0` 三次调用得到 114/101/91，非确定）。这直接违背本作“所有随机均可注入 rng 便于种子化/单测”的设计。修法：显式判空，如 `const r = rng ? rng() : Math.random();`。同一模式（`rng && rng()`）请全量排查。

【3｜经济 Bug·重复购买已掌握的配方/功法仍扣满额灵石】
`src/core/market.js` `buyItem`：
```js
if (entry.isRecipe) { learnRecipe(player, entry.id); return { ok: true, learned: true, qty: 1, cost }; }
if (def && def.type === 'technique') { learnTechnique(player, entry.id); return { ok: true, learned: true, qty: 1, cost }; }
```
`learnRecipe`/`learnTechnique` 在已掌握时返回 `false`，但此处**无视返回值照扣灵石并提示“习得”**。玩家会被扣钱却什么都没得到。修法：检查返回值，已掌握则退款/拒绝并给出提示。

【4｜道具丢失 Bug·背包满时卸装/换装会销毁装备】
`src/core/player.js`：
- `unequip`：`addItem(player, prev, 1)` 未检查返回值，背包满时返回 0，**当前装备被销毁**。
- `equip` 换装路径 `if (prev) addItem(player, prev, 1);` 同样存在该风险。
修法：检查 `addItem` 返回值，失败时拒绝操作或回滚。

【5｜防御性缺陷·探索无事件时仍扣消耗】
`src/core/explore.js` `rollExplore` 先扣 `mp/hp`，再判断 `eligibleEvents` 为空则返回 `{error}`。当前每个场景在 tier0 都至少有一个事件，**暂不可达**，但属隐性 footgun：一旦后续删事件即可出现“付费却无收获”。建议先校验事件池再扣消耗。

【6｜数值平衡·渡劫/战斗期间被动回复仍在跑】
`tick()` 每秒无条件调用 `passiveTick`（含 2% maxHp/秒 回血），即使处于天劫/战斗弹窗中。玩家在渡劫回合间犹豫时气血会自动回涌，**显著削弱天劫/战斗压力**。建议在 `this.battle || this.trial` 期间暂停或仅恢复 mp。

【7｜死代码/冗余（建议清理）】
- 落地页 `src/main.js`：`currentDef` 仅被赋值/置空，注释称“用于重置按钮文案”但从未读取；`btn._label` 赋值后未用。
- `finishBattle` 中 `addXp(p, -Math.floor(p.xpMax*0.05) || 0)` 对负数是 no-op（注释也承认），属冗余。
- `scripts/logic-test.mjs`：`isRareEncounter` 恒返回 `false` 的占位桩，导致 **保底机制（PITTY_THRESHOLD/PITTY_BOOST 提升稀有权重）这条核心随机性链路实际未被任何用例覆盖**；`alFail`/`a0`/`const r` 等为未用变量，循环里还在系统外手动 `p.pity.explore++` 造成重复计数（虽断言宽松而通过）。建议补一条真正命中保底加成的断言。
- 文案：`pill_fuhun` 的 `emoji` 为字面量 `'非遗'`（非 emoji/占位），属明显笔误。

以上 1–4 为玩家可感知的真实缺陷，建议本轮修复；5–7 可一并处理。均不涉及 CI/CD 与 workflows，无需人工改 `.github/`。
